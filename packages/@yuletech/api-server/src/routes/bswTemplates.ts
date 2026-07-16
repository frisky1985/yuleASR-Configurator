import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

// ── Zod Schemas ──────────────────────────────────────────────────────────────

const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  category: z.enum(['mcal', 'ecual', 'service', 'full', 'bsw']),
  tags: z.array(z.string()).optional().default([]),
  moduleType: z.string().optional(),
  modules: z.array(z.object({
    id: z.string(),
    name: z.string(),
    layer: z.enum(['MCAL', 'ECUAL', 'Service', 'RTE']),
    parameters: z.record(z.any()).optional(),
  })).optional().default([]),
  configData: z.any().optional(),
  isPublic: z.boolean().optional().default(true),
  visibility: z.enum(['public', 'private', 'team']).optional().default('public'),
  minTier: z.enum(['free', 'pro']).optional().default('free'),
})

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  category: z.enum(['mcal', 'ecual', 'service', 'full', 'bsw']).optional(),
  tags: z.array(z.string()).optional(),
  moduleType: z.string().optional(),
  modules: z.array(z.object({
    id: z.string(),
    name: z.string(),
    layer: z.enum(['MCAL', 'ECUAL', 'Service', 'RTE']),
    parameters: z.record(z.any()).optional(),
  })).optional(),
  configData: z.any().optional(),
  isPublic: z.boolean().optional(),
  visibility: z.enum(['public', 'private', 'team']).optional(),
  minTier: z.enum(['free', 'pro']).optional(),
})

const createVersionSchema = z.object({
  name: z.string().min(1).max(200).optional().default(''),
  description: z.string().max(2000).optional().default(''),
  modules: z.array(z.object({
    id: z.string(),
    name: z.string(),
    layer: z.enum(['MCAL', 'ECUAL', 'Service', 'RTE']),
    parameters: z.record(z.any()).optional(),
  })).optional().default([]),
  configData: z.any().optional(),
  changelog: z.string().optional(),
})

const statusUpdateSchema = z.object({
  status: z.enum(['draft', 'published', 'rejected', 'archived']),
  reviewNote: z.string().optional(),
})

// ── Helper ────────────────────────────────────────────────────────────────────

function jsonParseSafe(val: string | null | undefined, fallback: any = null): any {
  if (!val) return fallback
  try { return JSON.parse(val) } catch { return fallback }
}

// ── Routes ────────────────────────────────────────────────────────────────────

export async function bswTemplatesRoutes(app: FastifyInstance) {
  const { prisma } = await import('../lib/prisma.js')

  // ── GET /api/bsw-templates — list public templates ───────────────────────
  app.get('/', async (request) => {
    const query = request.query as {
      category?: string
      search?: string
      tag?: string
      sortBy?: string
      sortOrder?: string
      page?: string
      pageSize?: string
      authorId?: string
      status?: string
    }

    const page = Math.max(1, parseInt(query.page || '1', 10) || 1)
    const pageSize = Math.min(50, Math.max(1, parseInt(query.pageSize || '12', 10) || 12))
    const sortBy = query.sortBy || 'createdAt'
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc'

    const where: any = {
      status: query.status || 'published',
    }

    // If not admin filtering, only show public templates
    if (!query.status) {
      where.isPublic = true
      where.visibility = 'public'
    }

    if (query.category) {
      where.category = query.category
    }

    if (query.tag) {
      // For SQLite, filter in JS after fetching
    }

    if (query.authorId) {
      where.authorId = parseInt(query.authorId, 10)
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
      ]
    }

    const [total, raw] = await Promise.all([
      prisma.bSWTemplate.count({ where }),
      prisma.bSWTemplate.findMany({
        where,
        include: {
          author: { select: { id: true, username: true, avatar: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    let templates = raw.map(t => ({
      ...t,
      tags: jsonParseSafe(t.tags, []),
      modules: jsonParseSafe(t.modules, []),
    }))

    // Post-filter by tag if needed (SQLite compat)
    if (query.tag) {
      templates = templates.filter(t => (t.tags as string[]).includes(query.tag!))
    }

    return {
      data: templates,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  })

  // ── GET /api/bsw-templates/my — current user's templates ────────────────
  app.get('/my', { onRequest: [(app as any).authenticate] }, async (request) => {
    const user = request.user as { id: number }
    const templates = await prisma.bSWTemplate.findMany({
      where: { authorId: user.id },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return templates.map(t => ({
      ...t,
      tags: jsonParseSafe(t.tags, []),
      modules: jsonParseSafe(t.modules, []),
    }))
  })

  // ── GET /api/bsw-templates/admin/list — admin view all templates ────────
  app.get('/admin/list', { onRequest: [(app as any).authenticate] }, async (request) => {
    const user = request.user as { id: number; role: string }
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      throw { statusCode: 403, message: 'Forbidden: admin only' }
    }

    const query = request.query as { status?: string; page?: string; pageSize?: string }
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1)
    const pageSize = Math.min(50, Math.max(1, parseInt(query.pageSize || '20', 10) || 20))

    const where: any = {}
    if (query.status) where.status = query.status

    const [total, templates] = await Promise.all([
      prisma.bSWTemplate.count({ where }),
      prisma.bSWTemplate.findMany({
        where,
        include: {
          author: { select: { id: true, username: true, avatar: true } },
          reviewedBy: { select: { id: true, username: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return {
      data: templates.map(t => ({
        ...t,
        tags: jsonParseSafe(t.tags, []),
        modules: jsonParseSafe(t.modules, []),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  })

  // ── GET /api/bsw-templates/:id — template detail ────────────────────────
  app.get('/:id', async (request) => {
    const { id } = request.params as { id: string }
    const templateId = parseInt(id, 10)
    if (isNaN(templateId)) {
      throw { statusCode: 400, message: 'Invalid template ID' }
    }

    const template = await prisma.bSWTemplate.findUnique({
      where: { id: templateId },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        versions: { orderBy: { version: 'desc' } },
        reviews: {
          select: { rating: true },
        },
      },
    })

    if (!template) {
      throw { statusCode: 404, message: 'Template not found' }
    }

    // Calculate avgRating and reviewCount
    const reviews = template.reviews || []
    const reviewCount = reviews.length
    const avgRating = reviewCount > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
      : 0

    // Increment view count (fire and forget)
    prisma.bSWTemplate.update({
      where: { id: templateId },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {})

    const { reviews: _, ...templateWithoutReviews } = template

    return {
      ...templateWithoutReviews,
      tags: jsonParseSafe(template.tags, []),
      modules: jsonParseSafe(template.modules, []),
      versions: template.versions.map(v => ({
        ...v,
        modules: jsonParseSafe(v.modules, []),
      })),
      avgRating,
      reviewCount,
    }
  })

  // ── POST /api/bsw-templates — create template (Pro required) ────────────
  app.post('/', { onRequest: [(app as any).authenticate] }, async (request, reply) => {
    const parsed = createTemplateSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() })
    }

    const user = request.user as { id: number }

    // Check license — must be Pro to upload
    const license = await prisma.licenseKey.findFirst({
      where: { userId: user.id, active: true },
    })
    const isPro = license?.tier === 'pro'
    if (!isPro) {
      throw { statusCode: 403, message: 'Pro license required to upload templates' }
    }

    const data = parsed.data
    const template = await prisma.bSWTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        tags: JSON.stringify(data.tags),
        moduleType: data.moduleType || null,
        modules: JSON.stringify(data.modules),
        configData: data.configData ? JSON.stringify(data.configData) : null,
        isPublic: data.isPublic,
        visibility: data.visibility,
        minTier: data.minTier,
        authorId: user.id,
        version: 1,
      },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
      },
    })

    // Create initial version
    await prisma.bSWTemplateVersion.create({
      data: {
        templateId: template.id,
        version: 1,
        name: data.name,
        description: data.description,
        modules: JSON.stringify(data.modules),
        configData: data.configData ? JSON.stringify(data.configData) : null,
        changelog: 'Initial version',
      },
    })

    return {
      ...template,
      tags: data.tags,
      modules: data.modules,
      configData: data.configData,
    }
  })

  // ── PUT /api/bsw-templates/:id — update template (author/admin only) ────
  app.put('/:id', { onRequest: [(app as any).authenticate] }, async (request, reply) => {
    const parsed = updateTemplateSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() })
    }

    const { id } = request.params as { id: string }
    const templateId = parseInt(id, 10)
    const user = request.user as { id: number; role: string }

    const existing = await prisma.bSWTemplate.findUnique({ where: { id: templateId } })
    if (!existing) throw { statusCode: 404, message: 'Template not found' }
    if (existing.authorId !== user.id && user.role !== 'admin' && user.role !== 'super_admin') {
      throw { statusCode: 403, message: 'Forbidden' }
    }

    const data = parsed.data as any
    if (data.tags) data.tags = JSON.stringify(data.tags)
    if (data.modules) data.modules = JSON.stringify(data.modules)
    if (data.configData) data.configData = JSON.stringify(data.configData)

    const updated = await prisma.bSWTemplate.update({
      where: { id: templateId },
      data,
      include: {
        author: { select: { id: true, username: true, avatar: true } },
      },
    })

    return {
      ...updated,
      tags: jsonParseSafe(updated.tags, []),
      modules: jsonParseSafe(updated.modules, []),
    }
  })

  // ── DELETE /api/bsw-templates/:id — delete template (author/admin) ──────
  app.delete('/:id', { onRequest: [(app as any).authenticate] }, async (request) => {
    const { id } = request.params as { id: string }
    const templateId = parseInt(id, 10)
    const user = request.user as { id: number; role: string }

    const existing = await prisma.bSWTemplate.findUnique({ where: { id: templateId } })
    if (!existing) throw { statusCode: 404, message: 'Template not found' }
    if (existing.authorId !== user.id && user.role !== 'admin' && user.role !== 'super_admin') {
      throw { statusCode: 403, message: 'Forbidden' }
    }

    await prisma.bSWTemplate.delete({ where: { id: templateId } })
    return { message: 'Template deleted' }
  })

  // ── POST /api/bsw-templates/:id/versions — new version ──────────────────
  app.post('/:id/versions', { onRequest: [(app as any).authenticate] }, async (request, reply) => {
    const parsed = createVersionSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() })
    }

    const { id } = request.params as { id: string }
    const templateId = parseInt(id, 10)
    const user = request.user as { id: number; role: string }

    const existing = await prisma.bSWTemplate.findUnique({ where: { id: templateId } })
    if (!existing) throw { statusCode: 404, message: 'Template not found' }
    if (existing.authorId !== user.id && user.role !== 'admin' && user.role !== 'super_admin') {
      throw { statusCode: 403, message: 'Forbidden' }
    }

    const data = parsed.data
    const newVersion = existing.version + 1

    const version = await prisma.bSWTemplateVersion.create({
      data: {
        templateId,
        version: newVersion,
        name: data.name || existing.name,
        description: data.description || existing.description,
        modules: JSON.stringify(data.modules),
        configData: data.configData ? JSON.stringify(data.configData) : existing.configData,
        changelog: data.changelog || null,
      },
    })

    // Update template's current version number
    await prisma.bSWTemplate.update({
      where: { id: templateId },
      data: {
        version: newVersion,
        modules: JSON.stringify(data.modules),
        configData: data.configData ? JSON.stringify(data.configData) : existing.configData,
      },
    })

    return {
      ...version,
      modules: data.modules,
    }
  })

  // ── GET /api/bsw-templates/:id/versions — list versions ─────────────────
  app.get('/:id/versions', async (request) => {
    const { id } = request.params as { id: string }
    const templateId = parseInt(id, 10)

    const versions = await prisma.bSWTemplateVersion.findMany({
      where: { templateId },
      orderBy: { version: 'desc' },
    })

    return versions.map(v => ({
      ...v,
      modules: jsonParseSafe(v.modules, []),
    }))
  })

  // ── GET /api/bsw-templates/:id/versions/:versionId — specific version ───
  app.get('/:id/versions/:versionId', async (request) => {
    const { id, versionId } = request.params as { id: string; versionId: string }
    const templateId = parseInt(id, 10)
    const vId = parseInt(versionId, 10)

    const version = await prisma.bSWTemplateVersion.findFirst({
      where: { id: vId, templateId },
    })
    if (!version) throw { statusCode: 404, message: 'Version not found' }

    return {
      ...version,
      modules: jsonParseSafe(version.modules, []),
    }
  })

  // ── POST /api/bsw-templates/:id/download — increment download count ─────
  app.post('/:id/download', async (request) => {
    const { id } = request.params as { id: string }
    const templateId = parseInt(id, 10)

    const updated = await prisma.bSWTemplate.update({
      where: { id: templateId },
      data: { downloadCount: { increment: 1 } },
    })

    return { downloadCount: updated.downloadCount }
  })

  // ── PUT /api/bsw-templates/:id/status — admin review/status change ──────
  app.put('/:id/status', { onRequest: [(app as any).authenticate] }, async (request, reply) => {
    const parsed = statusUpdateSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() })
    }

    const { id } = request.params as { id: string }
    const templateId = parseInt(id, 10)
    const user = request.user as { id: number; role: string }

    if (user.role !== 'admin' && user.role !== 'super_admin') {
      throw { statusCode: 403, message: 'Forbidden: admin only' }
    }

    const existing = await prisma.bSWTemplate.findUnique({ where: { id: templateId } })
    if (!existing) throw { statusCode: 404, message: 'Template not found' }

    const updated = await prisma.bSWTemplate.update({
      where: { id: templateId },
      data: {
        status: parsed.data.status,
        reviewedById: user.id,
      },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        reviewedBy: { select: { id: true, username: true } },
      },
    })

    return {
      ...updated,
      tags: jsonParseSafe(updated.tags, []),
      modules: jsonParseSafe(updated.modules, []),
    }
  })
}
