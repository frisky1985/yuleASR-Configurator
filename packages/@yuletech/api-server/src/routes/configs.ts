import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { db } from '../db/index.js'
import { configs, configVersions } from '../db/schema.js'
import { eq, desc } from 'drizzle-orm'
import crypto from 'crypto'

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  data: z.any(), // ConfigFile JSON
})

const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  data: z.any().optional(),
})

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user as { userId: number }
  const list = await db.select({
    id: configs.id,
    name: configs.name,
    description: configs.description,
    version: configs.version,
    shareToken: configs.shareToken,
    createdAt: configs.createdAt,
    updatedAt: configs.updatedAt,
  }).from(configs).where(eq(configs.userId, userId)).orderBy(desc(configs.updatedAt))
  return reply.send(list)
}

export async function get(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user as { userId: number }
  const { id } = request.params as { id: string }
  const [config] = await db.select().from(configs).where(eq(configs.id, parseInt(id))).limit(1)
  if (!config || config.userId !== userId) {
    return reply.status(404).send({ error: 'Config not found' })
  }
  return reply.send(config)
}

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user as { userId: number }
  const body = createSchema.parse(request.body)
  const [config] = await db.insert(configs).values({
    userId,
    name: body.name,
    description: body.description || '',
    data: body.data,
    shareToken: crypto.randomBytes(16).toString('hex'),
  }).returning()
  return reply.status(201).send(config)
}

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user as { userId: number }
  const { id } = request.params as { id: string }
  const body = updateSchema.parse(request.body)

  const [existing] = await db.select().from(configs).where(eq(configs.id, parseInt(id))).limit(1)
  if (!existing || existing.userId !== userId) {
    return reply.status(404).send({ error: 'Config not found' })
  }

  // Save current version to history before updating
  await db.insert(configVersions).values({
    configId: existing.id,
    version: existing.version,
    data: existing.data,
  })

  const [updated] = await db.update(configs).set({
    ...(body.name && { name: body.name }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.data && { data: body.data }),
    version: existing.version + 1,
    updatedAt: new Date(),
  }).where(eq(configs.id, parseInt(id))).returning()

  return reply.send(updated)
}

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user as { userId: number }
  const { id } = request.params as { id: string }
  const [existing] = await db.select().from(configs).where(eq(configs.id, parseInt(id))).limit(1)
  if (!existing || existing.userId !== userId) {
    return reply.status(404).send({ error: 'Config not found' })
  }
  await db.delete(configVersions).where(eq(configVersions.configId, existing.id))
  await db.delete(configs).where(eq(configs.id, existing.id))
  return reply.status(204).send()
}

export async function getVersions(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user as { userId: number }
  const { id } = request.params as { id: string }
  const [existing] = await db.select().from(configs).where(eq(configs.id, parseInt(id))).limit(1)
  if (!existing || existing.userId !== userId) {
    return reply.status(404).send({ error: 'Config not found' })
  }
  const versions = await db.select().from(configVersions)
    .where(eq(configVersions.configId, existing.id))
    .orderBy(desc(configVersions.version))
  return reply.send(versions)
}

export async function getByShareToken(request: FastifyRequest, reply: FastifyReply) {
  const { token } = request.params as { token: string }
  const [config] = await db.select().from(configs).where(eq(configs.shareToken, token)).limit(1)
  if (!config) {
    return reply.status(404).send({ error: 'Config not found' })
  }
  return reply.send({
    id: config.id,
    name: config.name,
    description: config.description,
    data: config.data,
    version: config.version,
  })
}
