import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(['draft', 'published']).optional().default('published'),
  configId: z.number().optional(),
})

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).optional(),
})

export async function postsRoutes(app: FastifyInstance) {
  // GET /posts — list all published posts
  app.get('/', async (request) => {
    const { prisma } = await import('../lib/prisma.js')
    const query = request.query as { tag?: string }

    const posts = await prisma.forumPost.findMany({
      where: { status: 'published' },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Filter by tag in JS (SQLite doesn't support array contains)
    let result = posts
    if (query.tag) {
      result = posts.filter((p) => {
        const tags: string[] = JSON.parse(p.tags)
        return tags.includes(query.tag!)
      })
    }

    return result.map((p) => ({
      ...p,
      tags: JSON.parse(p.tags),
    }))
  })

  // GET /posts/:id — single post with comments
  app.get('/:id', async (request) => {
    const { prisma } = await import('../lib/prisma.js')
    const { id } = request.params as { id: string }
    const postId = parseInt(id, 10)
    if (isNaN(postId)) {
      throw { statusCode: 400, message: 'Invalid post ID' }
    }
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        comments: {
          include: { user: { select: { id: true, username: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    if (!post) {
      throw { statusCode: 404, message: 'Post not found' }
    }
    return {
      ...post,
      tags: JSON.parse(post.tags),
    }
  })

  // POST /posts — create post
  app.post('/', { onRequest: [(app as any).authenticate] }, async (request) => {
    const parsed = createPostSchema.safeParse(request.body)
    if (!parsed.success) {
      throw { statusCode: 400, message: 'Invalid input' }
    }
    const { prisma } = await import('../lib/prisma.js')
    const user = request.user as { id: number }

    const post = await prisma.forumPost.create({
      data: {
        ...parsed.data,
        tags: JSON.stringify(parsed.data.tags),
        userId: user.id,
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    })

    // Update tag counts
    for (const tagName of parsed.data.tags ?? []) {
      await prisma.tag.upsert({
        where: { name: tagName },
        update: { postCount: { increment: 1 } },
        create: { name: tagName, postCount: 1 },
      })
    }

    return { ...post, tags: parsed.data.tags }
  })

  // PUT /posts/:id — update post
  app.put('/:id', { onRequest: [(app as any).authenticate] }, async (request) => {
    const parsed = updatePostSchema.safeParse(request.body)
    if (!parsed.success) {
      throw { statusCode: 400, message: 'Invalid input' }
    }
    const { prisma } = await import('../lib/prisma.js')
    const { id } = request.params as { id: string }
    const postId = parseInt(id, 10)
    const user = request.user as { id: number }

    const existing = await prisma.forumPost.findUnique({ where: { id: postId } })
    if (!existing) throw { statusCode: 404, message: 'Post not found' }
    if (existing.userId !== user.id) throw { statusCode: 403, message: 'Forbidden' }

    const data: any = { ...parsed.data }
    if (data.tags) data.tags = JSON.stringify(data.tags)

    const post = await prisma.forumPost.update({
      where: { id: postId },
      data,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    })
    return { ...post, tags: JSON.parse(post.tags) }
  })

  // DELETE /posts/:id — delete post
  app.delete('/:id', { onRequest: [(app as any).authenticate] }, async (request) => {
    const { prisma } = await import('../lib/prisma.js')
    const { id } = request.params as { id: string }
    const postId = parseInt(id, 10)
    const user = request.user as { id: number }

    const existing = await prisma.forumPost.findUnique({ where: { id: postId } })
    if (!existing) throw { statusCode: 404, message: 'Post not found' }
    if (existing.userId !== user.id) throw { statusCode: 403, message: 'Forbidden' }

    await prisma.forumPost.delete({ where: { id: postId } })
    return { message: 'Post deleted' }
  })
}
