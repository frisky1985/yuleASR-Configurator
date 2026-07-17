import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

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
  const { prisma } = await import('../lib/prisma.js');

  // ── GET /api/shared-configs — list public shared configs ──────────────
  app.get('/', async request => {
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      throw { statusCode: 400, message: 'Invalid query parameters' };
    }

    const { search, tag, mcuType, sortBy, sortOrder, page, pageSize } = parsed.data;

    const where: any = {};

    if (search) {
      where.OR = [{ name: { contains: search } }, { description: { contains: search } }];
    }

    if (mcuType) {
      where.mcuType = mcuType;
    }

    const [total, raw] = await Promise.all([
      prisma.sharedConfig.count({ where }),
      prisma.sharedConfig.findMany({
        where,
        include: {
          author: { select: { id: true, username: true, avatar: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    let configs = raw.map((c: any) => ({
      ...c,
      modules: jsonParseSafe(c.modules, []),
      tags: jsonParseSafe(c.tags, []),
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

    const config = await prisma.sharedConfig.findUnique({
      where: { id: configId },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
      },
    });

    if (!config) {
      throw { statusCode: 404, message: 'Shared config not found' };
    }

    // Increment view count (fire and forget)
    prisma.sharedConfig
      .update({
        where: { id: configId },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});

    return {
      ...config,
      modules: jsonParseSafe(config.modules, []),
      configData: jsonParseSafe(config.configData, null),
      tags: jsonParseSafe(config.tags, []),
    };
  });

  // ── POST /api/shared-configs — share a config (auth required) ────────
  app.post('/', { onRequest: [(app as any).authenticate] }, async (request, reply) => {
    const parsed = createSharedConfigSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() });
    }

    const user = request.user as { id: number };
    const data = parsed.data;

    const config = await prisma.sharedConfig.create({
      data: {
        name: data.name,
        description: data.description,
        mcuType: data.mcuType || null,
        modules: JSON.stringify(data.modules),
        configData: data.configData ? JSON.stringify(data.configData) : null,
        screenshotUrl: data.screenshotUrl || null,
        tags: JSON.stringify(data.tags),
        authorId: user.id,
      },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
      },
    });

    return {
      ...config,
      modules: data.modules,
      tags: data.tags,
      configData: data.configData || null,
    };
  });

  // ── DELETE /api/shared-configs/:id — delete (author/admin only) ───────
  app.delete('/:id', { onRequest: [(app as any).authenticate] }, async request => {
    const { id } = request.params as { id: string };
    const configId = parseInt(id, 10);
    const user = request.user as { id: number; role: string };

    const existing = await prisma.sharedConfig.findUnique({ where: { id: configId } });
    if (!existing) {
      throw { statusCode: 404, message: 'Shared config not found' };
    }
    if (existing.authorId !== user.id && user.role !== 'admin' && user.role !== 'super_admin') {
      throw { statusCode: 403, message: 'Forbidden' };
    }

    await prisma.sharedConfig.delete({ where: { id: configId } });
    return { message: 'Shared config deleted' };
  });

  // ── POST /api/shared-configs/:id/like — toggle like ──────────────────
  app.post('/:id/like', { onRequest: [(app as any).authenticate] }, async request => {
    const { id } = request.params as { id: string };
    const configId = parseInt(id, 10);

    const config = await prisma.sharedConfig.findUnique({ where: { id: configId } });
    if (!config) {
      throw { statusCode: 404, message: 'Shared config not found' };
    }

    const updated = await prisma.sharedConfig.update({
      where: { id: configId },
      data: { likeCount: { increment: 1 } },
    });

    return { likeCount: updated.likeCount };
  });
}
