import type { FastifyInstance } from 'fastify';

export async function tagsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const { prisma } = await import('../lib/prisma.js');
    return prisma.tag.findMany({
      orderBy: { postCount: 'desc' },
    });
  });
}
