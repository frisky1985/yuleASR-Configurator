import { FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(100),
  password: z.string().min(6).max(100),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const body = registerSchema.parse(request.body)
  
  const existing = await db.select().from(users).where(eq(users.email, body.email)).limit(1)
  if (existing.length > 0) {
    return reply.status(409).send({ error: 'Email already registered' })
  }

  const passwordHash = await bcrypt.hash(body.password, 10)
  const [user] = await db.insert(users).values({
    email: body.email,
    username: body.username,
    passwordHash,
  }).returning()

  const token = request.server.jwt.sign({ userId: user.id, email: user.email })
  return reply.status(201).send({
    token,
    user: { id: user.id, email: user.email, username: user.username },
  })
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const body = loginSchema.parse(request.body)
  
  const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1)
  if (!user) {
    return reply.status(401).send({ error: 'Invalid email or password' })
  }

  const valid = await bcrypt.compare(body.password, user.passwordHash)
  if (!valid) {
    return reply.status(401).send({ error: 'Invalid email or password' })
  }

  const token = request.server.jwt.sign({ userId: user.id, email: user.email })
  return reply.send({
    token,
    user: { id: user.id, email: user.email, username: user.username },
  })
}

export async function me(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user as { userId: number }
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user) {
    return reply.status(404).send({ error: 'User not found' })
  }
  return reply.send({ id: user.id, email: user.email, username: user.username })
}
