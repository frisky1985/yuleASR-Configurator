import { FastifyRequest, FastifyReply } from 'fastify'
import { db } from '../db/index.js'
import { configs } from '../db/schema.js'
import { eq } from 'drizzle-orm'

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
