import { and, asc, desc, eq, ilike, isNotNull, or, sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { db } from '../db/index.js';
import { blogPosts, users } from '../db/schema.js';

const querySchema = z.object({
  category: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  pageSize: z.coerce.number().min(1).max(100).optional().default(20),
  sortBy: z.enum(['date', 'views', 'likes']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export async function blogRoutes(app: FastifyInstance) {
  // GET /blog/posts — paginated list
  app.get('/posts', async request => {
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      throw { statusCode: 400, message: 'Invalid query params' };
    }
    const { category, tag, search, page, pageSize, sortBy, sortOrder } = parsed.data;

    // Fix 30: category/tag/search 全部下推 SQL，分页下沉 limit/offset（原实现全表拉取后 JS 过滤/排序）
    const conditions: any[] = [isNotNull(blogPosts.publishedAt)];
    if (category && category !== '全部') {
      conditions.push(eq(blogPosts.category, category));
    }
    if (tag) {
      // tags 为 jsonb 数组，@> 下推（参数绑定，防注入）
      conditions.push(sql`${blogPosts.tags} @> ${JSON.stringify([tag])}::jsonb`);
    }
    if (search) {
      const q = `%${search}%`;
      conditions.push(or(ilike(blogPosts.title, q), ilike(blogPosts.description, q)));
    }
    const where = and(...conditions);

    const orderByExpr =
      sortBy === 'views'
        ? sortOrder === 'asc'
          ? asc(blogPosts.viewCount)
          : desc(blogPosts.viewCount)
        : sortBy === 'likes'
          ? sortOrder === 'asc'
            ? asc(blogPosts.likeCount)
            : desc(blogPosts.likeCount)
          : sortOrder === 'asc'
            ? asc(blogPosts.publishedAt)
            : desc(blogPosts.publishedAt);

    const [totalRow, rows] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(blogPosts)
        .where(where),
      db
        .select({
          post: blogPosts,
          author: { id: users.id, username: users.username, avatar: users.avatar },
        })
        .from(blogPosts)
        .leftJoin(users, eq(blogPosts.authorId, users.id))
        .where(where)
        .orderBy(orderByExpr)
        .limit(pageSize)
        .offset((page - 1) * pageSize),
    ]);

    const total = totalRow?.[0]?.count ?? 0;

    return {
      data: rows.map(r => ({
        ...r.post,
        author: r.author,
        tags: r.post.tags ?? [],
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  // GET /blog/posts/:slug — single post
  app.get('/posts/:slug', async request => {
    const { slug } = request.params as { slug: string };

    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
    if (!post) {
      throw { statusCode: 404, message: 'Post not found' };
    }

    const [author] = await db
      .select({ id: users.id, username: users.username, avatar: users.avatar, role: users.role })
      .from(users)
      .where(eq(users.id, post.authorId))
      .limit(1);

    // Increment view count
    await db
      .update(blogPosts)
      .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
      .where(eq(blogPosts.id, post.id));

    return {
      ...post,
      author: author ?? null,
      tags: post.tags ?? [],
      viewCount: post.viewCount + 1,
    };
  });

  // GET /blog/tags — all blog tags with counts
  app.get('/tags', async () => {
    const tagRows = await db
      .select({ tags: blogPosts.tags })
      .from(blogPosts)
      .where(isNotNull(blogPosts.publishedAt));
    const tagMap = new Map<string, number>();
    for (const p of tagRows) {
      const tags: string[] = (p.tags ?? []) as string[];
      for (const tag of tags) {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      }
    }
    return Array.from(tagMap.entries()).map(([name, articleCount]) => ({
      name,
      articleCount,
    }));
  });
}
