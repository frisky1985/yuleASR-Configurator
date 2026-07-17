import { eq, desc, and, sql } from 'drizzle-orm';
import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

import { db } from '../db/index.js';
import { posts, comments, users, tags } from '../db/schema.js';

const createPostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  tags: z.array(z.string().max(100)).optional(),
  status: z.enum(['draft', 'published']).optional().default('draft'),
  configId: z.number().optional(),
});

const updatePostSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  tags: z.array(z.string().max(100)).optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export async function listPosts(request: FastifyRequest, reply: FastifyReply) {
  const query = request.query as { tag?: string };

  const conditions = [eq(posts.status, 'published')];

  if (query.tag) {
    conditions.push(sql`${query.tag} = ANY(${posts.tags})`);
  }

  const postList = await db
    .select({
      id: posts.id,
      userId: posts.userId,
      configId: posts.configId,
      title: posts.title,
      content: posts.content,
      tags: posts.tags,
      status: posts.status,
      username: users.username,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(posts.createdAt));

  return reply.send(postList);
}

export async function getPost(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };

  const [post] = await db
    .select({
      id: posts.id,
      userId: posts.userId,
      configId: posts.configId,
      title: posts.title,
      content: posts.content,
      tags: posts.tags,
      status: posts.status,
      username: users.username,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .where(eq(posts.id, parseInt(id)))
    .limit(1);

  if (!post) {
    return reply.status(404).send({ error: 'Post not found' });
  }

  const postComments = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      userId: comments.userId,
      content: comments.content,
      username: users.username,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.postId, parseInt(id)))
    .orderBy(desc(comments.createdAt));

  return reply.send({ ...post, comments: postComments });
}

export async function createPost(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user as { userId: number };
  const body = createPostSchema.parse(request.body);

  const [post] = await db
    .insert(posts)
    .values({
      userId,
      configId: body.configId || null,
      title: body.title,
      content: body.content,
      tags: body.tags || [],
      status: body.status || 'draft',
    })
    .returning();

  // Update tag post counts
  if (body.tags && body.tags.length > 0) {
    for (const tagName of body.tags) {
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
  }

  return reply.status(201).send(post);
}

export async function updatePost(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user as { userId: number };
  const { id } = request.params as { id: string };
  const body = updatePostSchema.parse(request.body);

  const [existing] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, parseInt(id)))
    .limit(1);
  if (!existing || existing.userId !== userId) {
    return reply.status(404).send({ error: 'Post not found' });
  }

  // Handle tag changes — decrement old tags if tags are being updated
  if (body.tags && existing.tags && existing.tags.length > 0) {
    for (const tagName of existing.tags) {
      const [existingTag] = await db.select().from(tags).where(eq(tags.name, tagName)).limit(1);
      if (existingTag) {
        await db
          .update(tags)
          .set({ postCount: sql`GREATEST(${tags.postCount} - 1, 0)` })
          .where(eq(tags.id, existingTag.id));
      }
    }
  }

  const [updated] = await db
    .update(posts)
    .set({
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.status !== undefined && { status: body.status }),
      updatedAt: new Date(),
    })
    .where(eq(posts.id, parseInt(id)))
    .returning();

  // Increment new tags
  if (body.tags && body.tags.length > 0) {
    for (const tagName of body.tags) {
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
  }

  return reply.send(updated);
}

export async function deletePost(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user as { userId: number };
  const { id } = request.params as { id: string };

  const [existing] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, parseInt(id)))
    .limit(1);
  if (!existing || existing.userId !== userId) {
    return reply.status(404).send({ error: 'Post not found' });
  }

  // Decrement tag counts
  if (existing.tags && existing.tags.length > 0) {
    for (const tagName of existing.tags) {
      const [existingTag] = await db.select().from(tags).where(eq(tags.name, tagName)).limit(1);
      if (existingTag) {
        const newCount = Math.max((existingTag.postCount || 1) - 1, 0);
        await db.update(tags).set({ postCount: newCount }).where(eq(tags.id, existingTag.id));
      }
    }
  }

  // Delete comments first
  await db.delete(comments).where(eq(comments.postId, existing.id));
  await db.delete(posts).where(eq(posts.id, existing.id));
  return reply.status(204).send();
}

export async function listTags(_request: FastifyRequest, reply: FastifyReply) {
  const tagList = await db
    .select({
      id: tags.id,
      name: tags.name,
      postCount: tags.postCount,
    })
    .from(tags)
    .where(sql`${tags.postCount} > 0`)
    .orderBy(desc(tags.postCount));

  return reply.send(tagList);
}
