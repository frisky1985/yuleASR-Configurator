import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import path from 'path'
import { fileURLToPath } from 'url'

import { config } from './config.js'
import { register, login, me } from './routes/auth.js'
import { list, get, create, update, remove, getVersions } from './routes/configs.js'
import { getByShareToken } from './routes/share.js'
import { listPosts, getPost, createPost, updatePost, deletePost, listTags } from './routes/community.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = Fastify({ logger: true })

// Plugins
await app.register(cors, { origin: true })
await app.register(jwt, { secret: config.jwtSecret })

// Auth decorator
async function authenticate(request: any, reply: any) {
  try {
    await request.jwtVerify()
  } catch {
    return reply.status(401).send({ error: 'Unauthorized' })
  }
}

// Auth routes (public)
app.post('/api/auth/register', register)
app.post('/api/auth/login', login)
app.get('/api/auth/me', { preHandler: [authenticate] }, me)

// Config routes (protected)
app.get('/api/configs', { preHandler: [authenticate] }, list)
app.get('/api/configs/:id', { preHandler: [authenticate] }, get)
app.post('/api/configs', { preHandler: [authenticate] }, create)
app.put('/api/configs/:id', { preHandler: [authenticate] }, update)
app.delete('/api/configs/:id', { preHandler: [authenticate] }, remove)
app.get('/api/configs/:id/versions', { preHandler: [authenticate] }, getVersions)

// Share route (public)
app.get('/api/share/:token', getByShareToken)

// Community routes (public)
app.get('/api/posts', listPosts)
app.get('/api/posts/:id', getPost)
app.get('/api/tags', listTags)

// Community routes (protected)
app.post('/api/posts', { preHandler: [authenticate] }, createPost)
app.put('/api/posts/:id', { preHandler: [authenticate] }, updatePost)
app.delete('/api/posts/:id', { preHandler: [authenticate] }, deletePost)

// Health check
app.get('/api/health', async () => ({ status: 'ok', time: new Date().toISOString() }))

// Start
try {
  await app.listen({ port: config.port, host: config.host })
  console.log(`🚀 Server running at http://${config.host}:${config.port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
