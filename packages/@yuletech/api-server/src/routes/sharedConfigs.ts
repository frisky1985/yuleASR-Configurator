import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { db } from '../db/index.js';
import { sharedConfigLikes, sharedConfigs, users } from '../db/schema.js';

// ── Zod Schemas ──────────────────────────────────────────────────────────────

const createSharedConfigSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(''),
  mcuType: z.string().optional(),
  modules: z.array(z.any()).optional().default([]),
  configData: z.any().optional(),
  screenshotUrl: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

const querySchema = z.object({
  search: z.string().optional(),
  tag: z.string().optional(),
  mcuType: z.string().optional(),
  sortBy: z.enum(['createdAt', 'likeCount', 'viewCount']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(12),
});

// ── Helper ────────────────────────────────────────────────────────────────────

function jsonParseSafe(val: string | null | undefined, fallback: any = null): any {
  if (!val) return fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

// ── Routes ────────────────────────────────────────────────────────────────────

export async function sharedConfigsRoutes(app: FastifyInstance) {
  // ── GET /api/shared-configs — list public shared configs ──────────────
  app.get('/', async request => {
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      throw { statusCode: 400, message: 'Invalid query parameters' };
    }

    const { search, tag, mcuType, sortBy, sortOrder, page, pageSize } = parsed.data;

    const conditions: any[] = [];

    if (search) {
      conditions.push(
        or(
          ilike(sharedConfigs.name, `%${search}%`),
          ilike(sharedConfigs.description, `%${search}%`)
        )
      );
    }

    if (mcuType) {
      conditions.push(eq(sharedConfigs.mcuType, mcuType));
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const orderByExpr =
      sortBy === 'likeCount'
        ? sortOrder === 'asc'
          ? asc(sharedConfigs.likeCount)
          : desc(sharedConfigs.likeCount)
        : sortBy === 'viewCount'
          ? sortOrder === 'asc'
            ? asc(sharedConfigs.viewCount)
            : desc(sharedConfigs.viewCount)
          : sortOrder === 'asc'
            ? asc(sharedConfigs.createdAt)
            : desc(sharedConfigs.createdAt);

    const [totalRow, rows] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(sharedConfigs)
        .where(where),
      db
        .select({
          config: sharedConfigs,
          author: { id: users.id, username: users.username, avatar: users.avatar },
        })
        .from(sharedConfigs)
        .leftJoin(users, eq(sharedConfigs.authorId, users.id))
        .where(where)
        .orderBy(orderByExpr)
        .limit(pageSize)
        .offset((page - 1) * pageSize),
    ]);

    const total = totalRow?.[0]?.count ?? 0;

    let configs = rows.map((r: any) => ({
      ...r.config,
      author: r.author,
      modules: r.config.modules ?? [],
      tags: r.config.tags ?? [],
    }));

    // Post-filter by tag if needed (SQLite compat)
    if (tag) {
      configs = configs.filter((c: any) => (c.tags as string[]).includes(tag));
    }

    return {
      data: configs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  // ── GET /api/shared-configs/:id — detail ──────────────────────────────
  app.get('/:id', async request => {
    const { id } = request.params as { id: string };
    const configId = parseInt(id, 10);
    if (isNaN(configId)) {
      throw { statusCode: 400, message: 'Invalid config ID' };
    }

    const [row] = await db
      .select({
        config: sharedConfigs,
        author: { id: users.id, username: users.username, avatar: users.avatar },
      })
      .from(sharedConfigs)
      .leftJoin(users, eq(sharedConfigs.authorId, users.id))
      .where(eq(sharedConfigs.id, configId))
      .limit(1);

    if (!row) {
      throw { statusCode: 404, message: 'Shared config not found' };
    }

    // Increment view count (fire and forget)
    db.update(sharedConfigs)
      .set({ viewCount: sql`${sharedConfigs.viewCount} + 1` })
      .where(eq(sharedConfigs.id, configId))
      .catch(() => {});

    return {
      ...row.config,
      author: row.author,
      modules: row.config.modules ?? [],
      configData: jsonParseSafe(row.config.configData, null),
      tags: row.config.tags ?? [],
    };
  });

  // ── POST /api/shared-configs — share a config (auth required) ────────
  app.post('/', { onRequest: [app.authenticate] }, async (request, reply) => {
    const parsed = createSharedConfigSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() });
    }

    const user = request.user as { id: number };
    const data = parsed.data;

    const [config] = await db
      .insert(sharedConfigs)
      .values({
        name: data.name,
        description: data.description,
        mcuType: data.mcuType || null,
        modules: data.modules,
        configData: data.configData ? JSON.stringify(data.configData) : null,
        screenshotUrl: data.screenshotUrl || null,
        tags: data.tags,
        authorId: user.id,
      })
      .returning();

    const [authorRow] = await db
      .select({ id: users.id, username: users.username, avatar: users.avatar })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    return {
      ...config,
      author: authorRow ?? null,
      modules: data.modules,
      tags: data.tags,
      configData: data.configData || null,
    };
  });

  // ── DELETE /api/shared-configs/:id — delete (author/admin only) ───────
  app.delete('/:id', { onRequest: [app.authenticate] }, async request => {
    const { id } = request.params as { id: string };
    const configId = parseInt(id, 10);
    const user = request.user as { id: number; role: string };

    const [existing] = await db.select().from(sharedConfigs).where(eq(sharedConfigs.id, configId)).limit(1);
    if (!existing) {
      throw { statusCode: 404, message: 'Shared config not found' };
    }
    if (existing.authorId !== user.id && user.role !== 'admin' && user.role !== 'super_admin') {
      throw { statusCode: 403, message: 'Forbidden' };
    }

    await db.delete(sharedConfigs).where(eq(sharedConfigs.id, configId));
    return { message: 'Shared config deleted' };
  });

  // ── POST /api/shared-configs/:id/like — toggle like（Fix 30: 幂等 + 事务）──
  app.post('/:id/like', { onRequest: [app.authenticate] }, async request => {
    const { id } = request.params as { id: string };
    const configId = parseInt(id, 10);
    const user = request.user as { id: number };

    const [config] = await db.select().from(sharedConfigs).where(eq(sharedConfigs.id, configId)).limit(1);
    if (!config) {
      throw { statusCode: 404, message: 'Shared config not found' };
    }

    // 事务包裹：插入点赞记录（(configId, userId) 唯一约束，onConflictDoNothing 幂等），
    // 已存在则视为取消赞（删除 + 计数 -1），不存在则点赞（插入 + 计数 +1）。
    // 并发下 onConflictDoNothing 保证不会重复 +1，而是安全退化为 toggle 取消。
    return db.transaction(async tx => {
      const inserted = await tx
        .insert(sharedConfigLikes)
        .values({ configId, userId: user.id })
        .onConflictDoNothing()
        .returning({ id: sharedConfigLikes.id });

      if (inserted.length > 0) {
        const [updated] = await tx
          .update(sharedConfigs)
          .set({ likeCount: sql`${sharedConfigs.likeCount} + 1` })
          .where(eq(sharedConfigs.id, configId))
          .returning({ likeCount: sharedConfigs.likeCount });
        return { likeCount: updated.likeCount, liked: true };
      }

      const [updated] = await tx
        .update(sharedConfigs)
        .set({ likeCount: sql`GREATEST(${sharedConfigs.likeCount} - 1, 0)` })
        .where(eq(sharedConfigs.id, configId))
        .returning({ likeCount: sharedConfigs.likeCount });
      return { likeCount: updated.likeCount, liked: false };
    });
  });
}
