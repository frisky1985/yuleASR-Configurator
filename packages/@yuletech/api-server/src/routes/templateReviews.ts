import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

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
  const { prisma } = await import('../lib/prisma.js');

  // ── GET /api/bsw-templates/:templateId/reviews — list reviews ──────────
  app.get('/bsw-templates/:templateId/reviews', async request => {
    const { templateId } = request.params as { templateId: string };
    const tid = parseInt(templateId, 10);
    if (isNaN(tid)) {
      throw { statusCode: 400, message: 'Invalid template ID' };
    }

    const reviews = await prisma.bSWTemplateReview.findMany({
      where: { templateId: tid },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews;
  });

  // ── POST /api/bsw-templates/:templateId/reviews — add review ──────────
  app.post(
    '/bsw-templates/:templateId/reviews',
    { onRequest: [(app as any).authenticate] },
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
      const template = await prisma.bSWTemplate.findUnique({ where: { id: tid } });
      if (!template) {
        throw { statusCode: 404, message: 'Template not found' };
      }

      // Check if user already reviewed this template
      const existing = await prisma.bSWTemplateReview.findUnique({
        where: { templateId_userId: { templateId: tid, userId: user.id } },
      });
      if (existing) {
        throw {
          statusCode: 409,
          message: 'You have already reviewed this template. Use PUT to update.',
        };
      }

      const review = await prisma.bSWTemplateReview.create({
        data: {
          templateId: tid,
          userId: user.id,
          rating: parsed.data.rating,
          content: parsed.data.content || null,
        },
        include: {
          user: { select: { id: true, username: true, avatar: true } },
        },
      });

      return review;
    }
  );

  // ── PUT /api/template-reviews/:id — edit own review ───────────────────
  app.put(
    '/template-reviews/:id',
    { onRequest: [(app as any).authenticate] },
    async (request, reply) => {
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

      const existing = await prisma.bSWTemplateReview.findUnique({ where: { id: reviewId } });
      if (!existing) {
        throw { statusCode: 404, message: 'Review not found' };
      }
      if (existing.userId !== user.id) {
        throw { statusCode: 403, message: 'You can only edit your own reviews' };
      }

      const data: any = {};
      if (parsed.data.rating !== undefined) data.rating = parsed.data.rating;
      if (parsed.data.content !== undefined) data.content = parsed.data.content;

      const updated = await prisma.bSWTemplateReview.update({
        where: { id: reviewId },
        data,
        include: {
          user: { select: { id: true, username: true, avatar: true } },
        },
      });

      return updated;
    }
  );

  // ── DELETE /api/template-reviews/:id — delete own review ──────────────
  app.delete('/template-reviews/:id', { onRequest: [(app as any).authenticate] }, async request => {
    const { id } = request.params as { id: string };
    const reviewId = parseInt(id, 10);
    if (isNaN(reviewId)) {
      throw { statusCode: 400, message: 'Invalid review ID' };
    }

    const user = request.user as { id: number; role: string };

    const existing = await prisma.bSWTemplateReview.findUnique({ where: { id: reviewId } });
    if (!existing) {
      throw { statusCode: 404, message: 'Review not found' };
    }
    if (existing.userId !== user.id && user.role !== 'admin' && user.role !== 'super_admin') {
      throw { statusCode: 403, message: 'Forbidden' };
    }

    await prisma.bSWTemplateReview.delete({ where: { id: reviewId } });
    return { message: 'Review deleted' };
  });
}
