import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

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
    const { prisma } = await import('../lib/prisma.js');
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      throw { statusCode: 400, message: 'Invalid query params' };
    }
    const { category, tag, search, page, pageSize, sortBy, sortOrder } = parsed.data;

    // Fetch all published posts (SQLite can't do some filters natively)
    let allPosts = await prisma.blogPost.findMany({
      where: { publishedAt: { not: null } },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
      },
    });

    // Category filter
    if (category && category !== '全部') {
      allPosts = allPosts.filter((p: any) => p.category === category);
    }

    // Tag filter
    if (tag) {
      allPosts = allPosts.filter((p: any) => {
        const tags: string[] = JSON.parse(p.tags);
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
      tags: JSON.parse(p.tags),
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
    const { prisma } = await import('../lib/prisma.js');
    const { slug } = request.params as { slug: string };

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, username: true, avatar: true, role: true } },
      },
    });
    if (!post) {
      throw { statusCode: 404, message: 'Post not found' };
    }

    // Increment view count
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return {
      ...post,
      tags: JSON.parse(post.tags),
      viewCount: post.viewCount + 1,
    };
  });

  // GET /blog/tags — all blog tags with counts
  app.get('/tags', async () => {
    const { prisma } = await import('../lib/prisma.js');
    const posts = await prisma.blogPost.findMany({
      where: { publishedAt: { not: null } },
      select: { tags: true },
    });
    const tagMap = new Map<string, number>();
    for (const p of posts) {
      const tags: string[] = JSON.parse(p.tags);
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
