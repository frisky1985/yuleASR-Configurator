import { and, desc, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { db } from '../db/index.js';
import { bswTemplateReviews, bswTemplates, users } from '../db/schema.js';

// ── Zod Schemas ──────────────────────────────────────────────────────────────

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  content: z.string().max(2000).optional(),
});

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  content: z.string().max(2000).optional(),
});

// ── Routes ────────────────────────────────────────────────────────────────────

export async function templateReviewsRoutes(app: FastifyInstance) {
  // ── GET /api/bsw-templates/:templateId/reviews — list reviews ──────────
  app.get('/bsw-templates/:templateId/reviews', async request => {
    const { templateId } = request.params as { templateId: string };
    const tid = parseInt(templateId, 10);
    if (isNaN(tid)) {
      throw { statusCode: 400, message: 'Invalid template ID' };
    }

    const rows = await db
      .select({
        review: bswTemplateReviews,
        user: { id: users.id, username: users.username, avatar: users.avatar },
      })
      .from(bswTemplateReviews)
      .leftJoin(users, eq(bswTemplateReviews.userId, users.id))
      .where(eq(bswTemplateReviews.templateId, tid))
      .orderBy(desc(bswTemplateReviews.createdAt));

    return rows.map(r => ({ ...r.review, user: r.user }));
  });

  // ── POST /api/bsw-templates/:templateId/reviews — add review ──────────
  app.post(
    '/bsw-templates/:templateId/reviews',
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const parsed = createReviewSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() });
      }

      const { templateId } = request.params as { templateId: string };
      const tid = parseInt(templateId, 10);
      if (isNaN(tid)) {
        throw { statusCode: 400, message: 'Invalid template ID' };
      }

      const user = request.user as { id: number };

      // Verify template exists
      const [template] = await db
        .select()
        .from(bswTemplates)
        .where(eq(bswTemplates.id, tid))
        .limit(1);
      if (!template) {
        throw { statusCode: 404, message: 'Template not found' };
      }

      // Check if user already reviewed this template
      const [existing] = await db
        .select()
        .from(bswTemplateReviews)
        .where(and(eq(bswTemplateReviews.templateId, tid), eq(bswTemplateReviews.userId, user.id)))
        .limit(1);
      if (existing) {
        throw {
          statusCode: 409,
          message: 'You have already reviewed this template. Use PUT to update.',
        };
      }

      const [review] = await db
        .insert(bswTemplateReviews)
        .values({
          templateId: tid,
          userId: user.id,
          rating: parsed.data.rating,
          content: parsed.data.content || null,
        })
        .returning();

      const [reviewer] = await db
        .select({ id: users.id, username: users.username, avatar: users.avatar })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      return { ...review, user: reviewer ?? null };
    }
  );

  // ── PUT /api/template-reviews/:id — edit own review ───────────────────
  app.put('/template-reviews/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const parsed = updateReviewSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() });
    }

    const { id } = request.params as { id: string };
    const reviewId = parseInt(id, 10);
    if (isNaN(reviewId)) {
      throw { statusCode: 400, message: 'Invalid review ID' };
    }

    const user = request.user as { id: number };

    const [existing] = await db
      .select()
      .from(bswTemplateReviews)
      .where(eq(bswTemplateReviews.id, reviewId))
      .limit(1);
    if (!existing) {
      throw { statusCode: 404, message: 'Review not found' };
    }
    if (existing.userId !== user.id) {
      throw { statusCode: 403, message: 'You can only edit your own reviews' };
    }

    const data: any = {};
    if (parsed.data.rating !== undefined) data.rating = parsed.data.rating;
    if (parsed.data.content !== undefined) data.content = parsed.data.content;

    const [updated] = await db
      .update(bswTemplateReviews)
      .set(data)
      .where(eq(bswTemplateReviews.id, reviewId))
      .returning();

    const [reviewer] = await db
      .select({ id: users.id, username: users.username, avatar: users.avatar })
      .from(users)
      .where(eq(users.id, updated.userId))
      .limit(1);

    return { ...updated, user: reviewer ?? null };
  });

  // ── DELETE /api/template-reviews/:id — delete own review ──────────────
  app.delete('/template-reviews/:id', { onRequest: [app.authenticate] }, async request => {
    const { id } = request.params as { id: string };
    const reviewId = parseInt(id, 10);
    if (isNaN(reviewId)) {
      throw { statusCode: 400, message: 'Invalid review ID' };
    }

    const user = request.user as { id: number; role: string };

    const [existing] = await db
      .select()
      .from(bswTemplateReviews)
      .where(eq(bswTemplateReviews.id, reviewId))
      .limit(1);
    if (!existing) {
      throw { statusCode: 404, message: 'Review not found' };
    }
    if (existing.userId !== user.id && user.role !== 'admin' && user.role !== 'super_admin') {
      throw { statusCode: 403, message: 'Forbidden' };
    }

    await db.delete(bswTemplateReviews).where(eq(bswTemplateReviews.id, reviewId));
    return { message: 'Review deleted' };
  });
}
