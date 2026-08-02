import type { FastifyInstance } from 'fastify';
import { desc } from 'drizzle-orm';

import { db } from '../db/index.js';
import { tags } from '../db/schema.js';

export async function tagsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return db.select().from(tags).orderBy(desc(tags.postCount));
  });
}
