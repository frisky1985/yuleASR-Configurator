import { eq, isNotNull, sql } from 'drizzle-orm';
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

    // Fetch all published posts (JS-side filters for tags/search compatibility)
    const rows = await db
      .select({
        post: blogPosts,
        author: { id: users.id, username: users.username, avatar: users.avatar },
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(isNotNull(blogPosts.publishedAt));

    let allPosts: any[] = rows.map(r => ({ ...r.post, author: r.author }));

    // Category filter
    if (category && category !== '全部') {
      allPosts = allPosts.filter((p: any) => p.category === category);
    }

    // Tag filter
    if (tag) {
      allPosts = allPosts.filter((p: any) => {
        const tags: string[] = p.tags ?? [];
        return tags.includes(tag!);
      });
    }

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      allPosts = allPosts.filter(
        (p: any) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    // Sort
    const sortMap = {
      date: (a: any, b: any) => (a.publishedAt?.getTime() || 0) - (b.publishedAt?.getTime() || 0),
      views: (a: any, b: any) => a.viewCount - b.viewCount,
      likes: (a: any, b: any) => a.likeCount - b.likeCount,
    };
    allPosts.sort(sortMap[sortBy]);
    if (sortOrder === 'desc') allPosts.reverse();

    const total = allPosts.length;
    const start = (page - 1) * pageSize;
    const data = allPosts.slice(start, start + pageSize).map((p: any) => ({
      ...p,
      tags: p.tags ?? [],
    }));

    return {
      data,
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
