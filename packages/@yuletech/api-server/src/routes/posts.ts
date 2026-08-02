import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { eq, desc, sql, inArray } from 'drizzle-orm';

import { db } from '../db/index.js';
import { posts, comments, users, tags } from '../db/schema.js';

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(['draft', 'published']).optional().default('published'),
  configId: z.number().optional(),
});

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export async function postsRoutes(app: FastifyInstance) {
  // GET /posts — list all published posts
  app.get('/', async request => {
    const query = request.query as { tag?: string };

    const postList = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        configId: posts.configId,
        title: posts.title,
        content: posts.content,
        tags: posts.tags,
        status: posts.status,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        username: users.username,
        avatar: users.avatar,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.status, 'published'))
      .orderBy(desc(posts.createdAt));

    // Comment counts (one grouped query instead of N+1)
    const ids = postList.map(p => p.id);
    const countRows =
      ids.length > 0
        ? await db
            .select({ postId: comments.postId, count: sql<number>`count(*)` })
            .from(comments)
            .where(inArray(comments.postId, ids))
            .groupBy(comments.postId)
        : [];
    const countMap = new Map(countRows.map(r => [r.postId, r.count]));

    let result = postList.map(p => ({
      id: p.id,
      userId: p.userId,
      configId: p.configId,
      title: p.title,
      content: p.content,
      tags: p.tags ?? [],
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      user: { id: p.userId, username: p.username, avatar: p.avatar },
      _count: { comments: countMap.get(p.id) ?? 0 },
    }));

    // Filter by tag in JS (array column, kept compatible with previous behavior)
    if (query.tag) {
      result = result.filter(p => p.tags.includes(query.tag!));
    }

    return result;
  });

  // GET /posts/:id — single post with comments
  app.get('/:id', async request => {
    const { id } = request.params as { id: string };
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      throw { statusCode: 400, message: 'Invalid post ID' };
    }
    const [post] = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        configId: posts.configId,
        title: posts.title,
        content: posts.content,
        tags: posts.tags,
        status: posts.status,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        username: users.username,
        avatar: users.avatar,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, postId))
      .limit(1);
    if (!post) {
      throw { statusCode: 404, message: 'Post not found' };
    }

    const postComments = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        userId: comments.userId,
        content: comments.content,
        createdAt: comments.createdAt,
        username: users.username,
        avatar: users.avatar,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(comments.createdAt);

    return {
      id: post.id,
      userId: post.userId,
      configId: post.configId,
      title: post.title,
      content: post.content,
      tags: post.tags ?? [],
      status: post.status,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: { id: post.userId, username: post.username, avatar: post.avatar },
      comments: postComments,
    };
  });

  // POST /posts — create post
  app.post('/', { onRequest: [(app as any).authenticate] }, async request => {
    const parsed = createPostSchema.safeParse(request.body);
    if (!parsed.success) {
      throw { statusCode: 400, message: 'Invalid input' };
    }
    const authUser = request.user as { id: number };

    const [post] = await db
      .insert(posts)
      .values({
        title: parsed.data.title,
        content: parsed.data.content,
        tags: parsed.data.tags,
        status: parsed.data.status,
        configId: parsed.data.configId ?? null,
        userId: authUser.id,
      })
      .returning();

    // Update tag counts
    for (const tagName of parsed.data.tags ?? []) {
      const [existingTag] = await db.select().from(tags).where(eq(tags.name, tagName)).limit(1);
      if (existingTag) {
        await db
          .update(tags)
          .set({ postCount: sql`${tags.postCount} + 1` })
          .where(eq(tags.id, existingTag.id));
      } else {
        await db.insert(tags).values({ name: tagName, postCount: 1 });
      }
    }

    const [author] = await db
      .select({ id: users.id, username: users.username, avatar: users.avatar })
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);

    return {
      id: post.id,
      userId: post.userId,
      configId: post.configId,
      title: post.title,
      content: post.content,
      tags: parsed.data.tags,
      status: post.status,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: author!,
    };
  });

  // PUT /posts/:id — update post
  app.put('/:id', { onRequest: [(app as any).authenticate] }, async request => {
    const parsed = updatePostSchema.safeParse(request.body);
    if (!parsed.success) {
      throw { statusCode: 400, message: 'Invalid input' };
    }
    const { id } = request.params as { id: string };
    const postId = parseInt(id, 10);
    const authUser = request.user as { id: number };

    const [existing] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    if (!existing) throw { statusCode: 404, message: 'Post not found' };
    if (existing.userId !== authUser.id) throw { statusCode: 403, message: 'Forbidden' };

    const [post] = await db
      .update(posts)
      .set({
        ...(parsed.data.title !== undefined && { title: parsed.data.title }),
        ...(parsed.data.content !== undefined && { content: parsed.data.content }),
        ...(parsed.data.tags !== undefined && { tags: parsed.data.tags }),
        ...(parsed.data.status !== undefined && { status: parsed.data.status }),
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId))
      .returning();

    const [author] = await db
      .select({ id: users.id, username: users.username, avatar: users.avatar })
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);

    return {
      id: post.id,
      userId: post.userId,
      configId: post.configId,
      title: post.title,
      content: post.content,
      tags: post.tags ?? [],
      status: post.status,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: author!,
    };
  });

  // DELETE /posts/:id — delete post
  app.delete('/:id', { onRequest: [(app as any).authenticate] }, async request => {
    const { id } = request.params as { id: string };
    const postId = parseInt(id, 10);
    const authUser = request.user as { id: number };

    const [existing] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    if (!existing) throw { statusCode: 404, message: 'Post not found' };
    if (existing.userId !== authUser.id) throw { statusCode: 403, message: 'Forbidden' };

    // Delete comments first (postgres FK: no cascade on comments.postId)
    await db.delete(comments).where(eq(comments.postId, postId));
    await db.delete(posts).where(eq(posts.id, postId));
    return { message: 'Post deleted' };
  });
}
