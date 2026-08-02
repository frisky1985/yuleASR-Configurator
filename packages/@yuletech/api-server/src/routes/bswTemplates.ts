import { and, asc, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { db } from '../db/index.js';
import {
  bswTemplateReviews,
  bswTemplates,
  bswTemplateVersions,
  licenseKeys,
  users,
} from '../db/schema.js';

// ── Zod Schemas ──────────────────────────────────────────────────────────────

const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  category: z.enum(['mcal', 'ecual', 'service', 'full', 'bsw']),
  tags: z.array(z.string()).optional().default([]),
  moduleType: z.string().optional(),
  modules: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        layer: z.enum(['MCAL', 'ECUAL', 'Service', 'RTE']),
        parameters: z.record(z.any()).optional(),
      })
    )
    .optional()
    .default([]),
  configData: z.any().optional(),
  isPublic: z.boolean().optional().default(true),
  visibility: z.enum(['public', 'private', 'team']).optional().default('public'),
  minTier: z.enum(['free', 'pro']).optional().default('free'),
});

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  category: z.enum(['mcal', 'ecual', 'service', 'full', 'bsw']).optional(),
  tags: z.array(z.string()).optional(),
  moduleType: z.string().optional(),
  modules: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        layer: z.enum(['MCAL', 'ECUAL', 'Service', 'RTE']),
        parameters: z.record(z.any()).optional(),
      })
    )
    .optional(),
  configData: z.any().optional(),
  isPublic: z.boolean().optional(),
  visibility: z.enum(['public', 'private', 'team']).optional(),
  minTier: z.enum(['free', 'pro']).optional(),
});

const createVersionSchema = z.object({
  name: z.string().min(1).max(200).optional().default(''),
  description: z.string().max(2000).optional().default(''),
  modules: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        layer: z.enum(['MCAL', 'ECUAL', 'Service', 'RTE']),
        parameters: z.record(z.any()).optional(),
      })
    )
    .optional()
    .default([]),
  configData: z.any().optional(),
  changelog: z.string().optional(),
});

const statusUpdateSchema = z.object({
  status: z.enum(['draft', 'published', 'rejected', 'archived']),
  reviewNote: z.string().optional(),
});

// ── Fix 30: IDOR 防护辅助 ────────────────────────────────────────────────────

/** 尝试可选认证：带合法 JWT 则返回 user，否则 undefined（不抛错） */
async function tryGetUser(request: any): Promise<{ id?: number; role?: string } | undefined> {
  try {
    await request.jwtVerify();
    return request.user as { id?: number; role?: string };
  } catch {
    return undefined;
  }
}

function isAdminUser(user: { role?: string } | undefined): boolean {
  return !!user && ['admin', 'super_admin'].includes(user.role ?? '');
}

/** 模板是否公开可见（published + isPublic + visibility=public） */
function templateIsPublic(t: { status: string; isPublic: boolean; visibility: string }): boolean {
  return t.status === 'published' && t.isPublic === true && t.visibility === 'public';
}

/** 非公开模板仅作者/admin 可读，其余 404（IDOR 修复） */
function canViewTemplate(
  t: { authorId: number; status: string; isPublic: boolean; visibility: string },
  user: { id?: number; role?: string } | undefined
): boolean {
  if (templateIsPublic(t)) return true;
  if (!user) return false;
  if (isAdminUser(user)) return true;
  return user.id === t.authorId;
}

// ── Routes ────────────────────────────────────────────────────────────────────

export async function bswTemplatesRoutes(app: FastifyInstance) {
  // ── GET /api/bsw-templates — list public templates ───────────────────────
  app.get('/', async request => {
    const query = request.query as {
      category?: string;
      search?: string;
      tag?: string;
      sortBy?: string;
      sortOrder?: string;
      page?: string;
      pageSize?: string;
      authorId?: string;
      status?: string;
    };

    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(query.pageSize || '12', 10) || 12));
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    // Fix 30: 非 published 查询必须 admin 认证；否则强制 'published' + isPublic 过滤
    const user = await tryGetUser(request);
    const userIsAdmin = isAdminUser(user);
    const conditions: any[] = [eq(bswTemplates.status, userIsAdmin && query.status ? query.status : 'published')];

    // 匿名/非 admin：只显示公开模板；admin 无 status 参数时也保持公开过滤
    if (!query.status || !userIsAdmin) {
      conditions.push(eq(bswTemplates.isPublic, true), eq(bswTemplates.visibility, 'public'));
    }

    if (query.category) {
      conditions.push(eq(bswTemplates.category, query.category));
    }

    if (query.authorId) {
      conditions.push(eq(bswTemplates.authorId, parseInt(query.authorId, 10)));
    }

    if (query.search) {
      conditions.push(
        or(
          ilike(bswTemplates.name, `%${query.search}%`),
          ilike(bswTemplates.description, `%${query.search}%`)
        )
      );
    }

    const where = and(...conditions);

    const sortColMap: Record<string, any> = {
      id: bswTemplates.id,
      name: bswTemplates.name,
      category: bswTemplates.category,
      moduleType: bswTemplates.moduleType,
      version: bswTemplates.version,
      downloads: bswTemplates.downloads,
      rating: bswTemplates.rating,
      isPublic: bswTemplates.isPublic,
      status: bswTemplates.status,
      visibility: bswTemplates.visibility,
      minTier: bswTemplates.minTier,
      authorId: bswTemplates.authorId,
      downloadCount: bswTemplates.downloadCount,
      viewCount: bswTemplates.viewCount,
      favoriteCount: bswTemplates.favoriteCount,
      createdAt: bswTemplates.createdAt,
      updatedAt: bswTemplates.updatedAt,
    };
    const sortCol = sortColMap[sortBy] || bswTemplates.createdAt;
    const orderByExpr = sortOrder === 'asc' ? asc(sortCol) : desc(sortCol);

    const [totalRow, rows] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(bswTemplates).where(where),
      db
        .select({
          template: bswTemplates,
          author: { id: users.id, username: users.username, avatar: users.avatar },
        })
        .from(bswTemplates)
        .leftJoin(users, eq(bswTemplates.authorId, users.id))
        .where(where)
        .orderBy(orderByExpr)
        .limit(pageSize)
        .offset((page - 1) * pageSize),
    ]);

    const total = totalRow?.[0]?.count ?? 0;

    let templates = rows.map((r: any) => ({
      ...r.template,
      author: r.author,
      tags: r.template.tags ?? [],
      modules: r.template.modules ?? [],
    }));

    // Post-filter by tag if needed (SQLite compat)
    if (query.tag) {
      templates = templates.filter((t: any) => (t.tags as string[]).includes(query.tag!));
    }

    return {
      data: templates,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  // ── GET /api/bsw-templates/my — current user's templates ────────────────
  app.get('/my', { onRequest: [(app as any).authenticate] }, async request => {
    const user = request.user as { id: number };
    const rows = await db
      .select({
        template: bswTemplates,
        author: { id: users.id, username: users.username, avatar: users.avatar },
      })
      .from(bswTemplates)
      .leftJoin(users, eq(bswTemplates.authorId, users.id))
      .where(eq(bswTemplates.authorId, user.id))
      .orderBy(desc(bswTemplates.updatedAt));

    return rows.map((r: any) => ({
      ...r.template,
      author: r.author,
      tags: r.template.tags ?? [],
      modules: r.template.modules ?? [],
    }));
  });

  // ── GET /api/bsw-templates/admin/list — admin view all templates ────────
  app.get('/admin/list', { onRequest: [(app as any).authenticate] }, async request => {
    const user = request.user as { id: number; role: string };
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      throw { statusCode: 403, message: 'Forbidden: admin only' };
    }

    const query = request.query as { status?: string; page?: string; pageSize?: string };
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(query.pageSize || '20', 10) || 20));

    const conditions: any[] = [];
    if (query.status) conditions.push(eq(bswTemplates.status, query.status));
    const where = conditions.length ? and(...conditions) : undefined;

    const [totalRow, rows] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(bswTemplates).where(where),
      db
        .select({
          template: bswTemplates,
          author: { id: users.id, username: users.username, avatar: users.avatar },
        })
        .from(bswTemplates)
        .leftJoin(users, eq(bswTemplates.authorId, users.id))
        .where(where)
        .orderBy(desc(bswTemplates.updatedAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
    ]);

    const total = totalRow?.[0]?.count ?? 0;

    // Fetch reviewers (replaces Prisma include reviewedBy)
    const reviewerIds = [
      ...new Set(rows.map(r => (r as any).template.reviewedById).filter((x: any) => x != null)),
    ];
    let reviewerMap = new Map<number, { id: number; username: string }>();
    if (reviewerIds.length) {
      const reviewers = await db
        .select({ id: users.id, username: users.username })
        .from(users)
        .where(inArray(users.id, reviewerIds));
      reviewerMap = new Map(reviewers.map(u => [u.id, u]));
    }

    return {
      data: rows.map((r: any) => ({
        ...r.template,
        author: r.author,
        reviewedBy:
          r.template.reviewedById != null
            ? reviewerMap.get(r.template.reviewedById) ?? null
            : null,
        tags: r.template.tags ?? [],
        modules: r.template.modules ?? [],
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  // ── GET /api/bsw-templates/:id — template detail ────────────────────────
  app.get('/:id', async request => {
    const { id } = request.params as { id: string };
    const templateId = parseInt(id, 10);
    if (isNaN(templateId)) {
      throw { statusCode: 400, message: 'Invalid template ID' };
    }

    const [row] = await db
      .select({
        template: bswTemplates,
        author: { id: users.id, username: users.username, avatar: users.avatar },
      })
      .from(bswTemplates)
      .leftJoin(users, eq(bswTemplates.authorId, users.id))
      .where(eq(bswTemplates.id, templateId))
      .limit(1);

    if (!row) {
      throw { statusCode: 404, message: 'Template not found' };
    }

    const template = row.template;

    // Fix 30: 非公开模板仅作者/admin 可读，其余 404（IDOR）
    const user = await tryGetUser(request);
    if (!canViewTemplate(template, user)) {
      throw { statusCode: 404, message: 'Template not found' };
    }

    // Fetch versions (replaces Prisma include versions)
    const versions = await db
      .select()
      .from(bswTemplateVersions)
      .where(eq(bswTemplateVersions.templateId, templateId))
      .orderBy(desc(bswTemplateVersions.version));

    // Fetch reviews (replaces Prisma include reviews: { select: { rating: true } })
    const reviews = await db
      .select({ rating: bswTemplateReviews.rating })
      .from(bswTemplateReviews)
      .where(eq(bswTemplateReviews.templateId, templateId));

    // Calculate avgRating and reviewCount
    const reviewCount = reviews.length;
    const avgRating =
      reviewCount > 0
        ? Math.round(
            (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount) * 10
          ) / 10
        : 0;

    // Increment view count (fire and forget)
    db.update(bswTemplates)
      .set({ viewCount: sql`${bswTemplates.viewCount} + 1` })
      .where(eq(bswTemplates.id, templateId))
      .catch(() => {});

    return {
      ...template,
      author: row.author,
      tags: template.tags ?? [],
      modules: template.modules ?? [],
      versions: versions.map((v: any) => ({
        ...v,
        modules: v.modules ?? [],
      })),
      avgRating,
      reviewCount,
    };
  });

  // ── POST /api/bsw-templates — create template (Pro required) ────────────
  app.post('/', { onRequest: [(app as any).authenticate] }, async (request, reply) => {
    const parsed = createTemplateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() });
    }

    const user = request.user as { id: number };

    // Check license — must be Pro to upload
    const [license] = await db
      .select()
      .from(licenseKeys)
      .where(and(eq(licenseKeys.userId, user.id), eq(licenseKeys.active, true)))
      .limit(1);
    const isPro = license?.tier === 'pro';
    if (!isPro) {
      throw { statusCode: 403, message: 'Pro license required to upload templates' };
    }

    const data = parsed.data;
    const [template] = await db
      .insert(bswTemplates)
      .values({
        name: data.name,
        description: data.description,
        category: data.category,
        tags: data.tags,
        moduleType: data.moduleType || null,
        modules: data.modules,
        configData: data.configData ? JSON.stringify(data.configData) : null,
        isPublic: data.isPublic,
        visibility: data.visibility,
        minTier: data.minTier,
        authorId: user.id,
        version: 1,
      })
      .returning();

    // Create initial version
    await db.insert(bswTemplateVersions).values({
      templateId: template.id,
      version: 1,
      name: data.name,
      description: data.description,
      modules: data.modules,
      configData: data.configData ? JSON.stringify(data.configData) : null,
      changelog: 'Initial version',
    });

    // Fetch author (replaces Prisma include author)
    const [authorRow] = await db
      .select({ id: users.id, username: users.username, avatar: users.avatar })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    return {
      ...template,
      author: authorRow ?? null,
      tags: data.tags,
      modules: data.modules,
      configData: data.configData,
    };
  });

  // ── PUT /api/bsw-templates/:id — update template (author/admin only) ────
  app.put('/:id', { onRequest: [(app as any).authenticate] }, async (request, reply) => {
    const parsed = updateTemplateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() });
    }

    const { id } = request.params as { id: string };
    const templateId = parseInt(id, 10);
    const user = request.user as { id: number; role: string };

    const [existing] = await db.select().from(bswTemplates).where(eq(bswTemplates.id, templateId)).limit(1);
    if (!existing) throw { statusCode: 404, message: 'Template not found' };
    if (existing.authorId !== user.id && user.role !== 'admin' && user.role !== 'super_admin') {
      throw { statusCode: 403, message: 'Forbidden' };
    }

    const data = parsed.data as any;
    // tags/modules are jsonb arrays now (pass through); configData stays text (JSON string)
    const setData: any = {};
    if (data.name !== undefined) setData.name = data.name;
    if (data.description !== undefined) setData.description = data.description;
    if (data.category !== undefined) setData.category = data.category;
    if (data.tags !== undefined) setData.tags = data.tags;
    if (data.moduleType !== undefined) setData.moduleType = data.moduleType;
    if (data.modules !== undefined) setData.modules = data.modules;
    if (data.configData !== undefined) {
      setData.configData = data.configData ? JSON.stringify(data.configData) : data.configData;
    }
    if (data.isPublic !== undefined) setData.isPublic = data.isPublic;
    if (data.visibility !== undefined) setData.visibility = data.visibility;
    if (data.minTier !== undefined) setData.minTier = data.minTier;

    const [updated] = await db
      .update(bswTemplates)
      .set(setData)
      .where(eq(bswTemplates.id, templateId))
      .returning();

    const [authorRow] = await db
      .select({ id: users.id, username: users.username, avatar: users.avatar })
      .from(users)
      .where(eq(users.id, updated.authorId))
      .limit(1);

    return {
      ...updated,
      author: authorRow ?? null,
      tags: updated.tags ?? [],
      modules: updated.modules ?? [],
    };
  });

  // ── DELETE /api/bsw-templates/:id — delete template (author/admin) ──────
  app.delete('/:id', { onRequest: [(app as any).authenticate] }, async request => {
    const { id } = request.params as { id: string };
    const templateId = parseInt(id, 10);
    const user = request.user as { id: number; role: string };

    const [existing] = await db.select().from(bswTemplates).where(eq(bswTemplates.id, templateId)).limit(1);
    if (!existing) throw { statusCode: 404, message: 'Template not found' };
    if (existing.authorId !== user.id && user.role !== 'admin' && user.role !== 'super_admin') {
      throw { statusCode: 403, message: 'Forbidden' };
    }

    await db.delete(bswTemplates).where(eq(bswTemplates.id, templateId));
    return { message: 'Template deleted' };
  });

  // ── POST /api/bsw-templates/:id/versions — new version ──────────────────
  app.post('/:id/versions', { onRequest: [(app as any).authenticate] }, async (request, reply) => {
    const parsed = createVersionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() });
    }

    const { id } = request.params as { id: string };
    const templateId = parseInt(id, 10);
    const user = request.user as { id: number; role: string };

    const [existing] = await db.select().from(bswTemplates).where(eq(bswTemplates.id, templateId)).limit(1);
    if (!existing) throw { statusCode: 404, message: 'Template not found' };
    if (existing.authorId !== user.id && user.role !== 'admin' && user.role !== 'super_admin') {
      throw { statusCode: 403, message: 'Forbidden' };
    }

    const data = parsed.data;
    const newVersion = existing.version + 1;

    const [version] = await db
      .insert(bswTemplateVersions)
      .values({
        templateId,
        version: newVersion,
        name: data.name || existing.name,
        description: data.description || existing.description,
        modules: data.modules,
        configData: data.configData ? JSON.stringify(data.configData) : existing.configData,
        changelog: data.changelog || null,
      })
      .returning();

    // Update template's current version number
    await db
      .update(bswTemplates)
      .set({
        version: newVersion,
        modules: data.modules,
        configData: data.configData ? JSON.stringify(data.configData) : existing.configData,
      })
      .where(eq(bswTemplates.id, templateId));

    return {
      ...version,
      modules: data.modules,
    };
  });

  // ── GET /api/bsw-templates/:id/versions — list versions ─────────────────
  app.get('/:id/versions', async request => {
    const { id } = request.params as { id: string };
    const templateId = parseInt(id, 10);

    // Fix 30: IDOR —— 非公开模板的版本列表同样仅作者/admin 可见
    const [tpl] = await db.select().from(bswTemplates).where(eq(bswTemplates.id, templateId)).limit(1);
    if (!tpl) throw { statusCode: 404, message: 'Template not found' };
    if (!canViewTemplate(tpl, await tryGetUser(request))) {
      throw { statusCode: 404, message: 'Template not found' };
    }

    const versions = await db
      .select()
      .from(bswTemplateVersions)
      .where(eq(bswTemplateVersions.templateId, templateId))
      .orderBy(desc(bswTemplateVersions.version));

    return versions.map((v: any) => ({
      ...v,
      modules: v.modules ?? [],
    }));
  });

  // ── GET /api/bsw-templates/:id/versions/:versionId — specific version ───
  app.get('/:id/versions/:versionId', async request => {
    const { id, versionId } = request.params as { id: string; versionId: string };
    const templateId = parseInt(id, 10);
    const vId = parseInt(versionId, 10);

    // Fix 30: IDOR —— 非公开模板的版本详情同样仅作者/admin 可见
    const [tpl] = await db.select().from(bswTemplates).where(eq(bswTemplates.id, templateId)).limit(1);
    if (!tpl) throw { statusCode: 404, message: 'Template not found' };
    if (!canViewTemplate(tpl, await tryGetUser(request))) {
      throw { statusCode: 404, message: 'Template not found' };
    }

    const [version] = await db
      .select()
      .from(bswTemplateVersions)
      .where(and(eq(bswTemplateVersions.id, vId), eq(bswTemplateVersions.templateId, templateId)))
      .limit(1);
    if (!version) throw { statusCode: 404, message: 'Version not found' };

    return {
      ...version,
      modules: version.modules ?? [],
    };
  });

  // ── POST /api/bsw-templates/:id/download — increment download count ─────
  app.post('/:id/download', async request => {
    const { id } = request.params as { id: string };
    const templateId = parseInt(id, 10);

    // Fix 30: IDOR —— 下载计数同样禁止私有模板
    const [tpl] = await db.select().from(bswTemplates).where(eq(bswTemplates.id, templateId)).limit(1);
    if (!tpl) throw { statusCode: 404, message: 'Template not found' };
    if (!canViewTemplate(tpl, await tryGetUser(request))) {
      throw { statusCode: 404, message: 'Template not found' };
    }

    const [updated] = await db
      .update(bswTemplates)
      .set({ downloadCount: sql`${bswTemplates.downloadCount} + 1` })
      .where(eq(bswTemplates.id, templateId))
      .returning();

    return { downloadCount: updated.downloadCount };
  });

  // ── PUT /api/bsw-templates/:id/status — admin review/status change ──────
  app.put('/:id/status', { onRequest: [(app as any).authenticate] }, async (request, reply) => {
    const parsed = statusUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() });
    }

    const { id } = request.params as { id: string };
    const templateId = parseInt(id, 10);
    const user = request.user as { id: number; role: string };

    if (user.role !== 'admin' && user.role !== 'super_admin') {
      throw { statusCode: 403, message: 'Forbidden: admin only' };
    }

    const [existing] = await db.select().from(bswTemplates).where(eq(bswTemplates.id, templateId)).limit(1);
    if (!existing) throw { statusCode: 404, message: 'Template not found' };

    const [updated] = await db
      .update(bswTemplates)
      .set({
        status: parsed.data.status,
        reviewedById: user.id,
      })
      .where(eq(bswTemplates.id, templateId))
      .returning();

    const [authorRow] = await db
      .select({ id: users.id, username: users.username, avatar: users.avatar })
      .from(users)
      .where(eq(users.id, updated.authorId))
      .limit(1);

    let reviewerRow: { id: number; username: string } | null = null;
    if (updated.reviewedById != null) {
      const [row] = await db
        .select({ id: users.id, username: users.username })
        .from(users)
        .where(eq(users.id, updated.reviewedById))
        .limit(1);
      reviewerRow = row ?? null;
    }

    return {
      ...updated,
      author: authorRow ?? null,
      reviewedBy: reviewerRow,
      tags: updated.tags ?? [],
      modules: updated.modules ?? [],
    };
  });
}
