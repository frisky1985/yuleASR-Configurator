import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { authRoutes } from './routes/auth.js'
import { postsRoutes } from './routes/posts.js'
import { blogRoutes } from './routes/blog.js'
import { tagsRoutes } from './routes/tags.js'
import { licenseRoutes } from './routes/license.js'
import { paymentRoutes } from './routes/payment.js'
import { bswTemplatesRoutes } from './routes/bswTemplates.js'
import { prisma } from './lib/prisma.js'

const PORT = parseInt(process.env.PORT || '3000', 10)
const HOST = process.env.HOST || '0.0.0.0'
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

const app = Fastify({ logger: true })

// ── Plugins ──────────────────────────────────────────────────────────────

await app.register(cors, { origin: true })
await app.register(jwt, { secret: JWT_SECRET })
await app.register(swagger, {
  openapi: {
    info: { title: 'yuleCommunity API', version: '0.1.0' },
  },
})
await app.register(swaggerUi, { routePrefix: '/docs' })

// ── Decorate request with authenticate ──────────────────────────────────

app.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify()
  } catch {
    reply.status(401).send({ message: 'Unauthorized' })
  }
})

// ── Routes ──────────────────────────────────────────────────────────────

await app.register(authRoutes, { prefix: '/auth' })
await app.register(postsRoutes, { prefix: '/posts' })
await app.register(blogRoutes, { prefix: '/blog' })
await app.register(tagsRoutes, { prefix: '/tags' })
await app.register(licenseRoutes, { prefix: '/api/license' })
await app.register(paymentRoutes, { prefix: '/api/payment' })
await app.register(bswTemplatesRoutes, { prefix: '/api/bsw-templates' })

// Health check
app.get('/health', async () => {
  let dbStatus = 'ok'
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch {
    dbStatus = 'error'
  }
  return {
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: process.uptime(),
  }
})

// ── Start ────────────────────────────────────────────────────────────────

try {
  await app.listen({ port: PORT, host: HOST })
  console.log(`🚀 yuleCommunity API running at http://${HOST}:${PORT}`)
  console.log(`📚 API docs at http://${HOST}:${PORT}/docs`)
} catch (err) {
  app.log.error(err)
  await prisma.$disconnect()
  process.exit(1)
}

// Graceful shutdown
const shutdown = async () => {
  await app.close()
  await prisma.$disconnect()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
