import type { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(32),
  password: z.string().min(6),
})

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() })
    }

    const { email, password } = parsed.data
    const { prisma } = await import('../lib/prisma.js')

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return reply.status(401).send({ message: 'Invalid email or password' })
    }

    const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role })
    return {
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    }
  })

  app.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() })
    }

    const { email, username, password } = parsed.data
    const { prisma } = await import('../lib/prisma.js')

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })
    if (existing) {
      return reply.status(409).send({
        message: existing.email === email ? 'Email already registered' : 'Username already taken',
      })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, username, password: hashed },
    })

    const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role })
    return {
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    }
  })

  app.get('/me', { onRequest: [(app as any).authenticate] }, async (request) => {
    const { id } = request.user as { id: number }
    const { prisma } = await import('../lib/prisma.js')
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, username: true, avatar: true, role: true, createdAt: true },
    })
    if (!user) {
      throw { statusCode: 404, message: 'User not found' }
    }
    return user
  })
}
