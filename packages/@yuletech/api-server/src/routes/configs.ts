import crypto from 'crypto';

import { eq, desc, and, gt } from 'drizzle-orm';
import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

import { db } from '../db/index.js';
import { configs, configVersions, configLocks, users } from '../db/schema.js';

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  data: z.any(), // ConfigFile JSON
});

const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  data: z.any().optional(),
});

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user as { userId: number };
  const list = await db
    .select({
      id: configs.id,
      name: configs.name,
      description: configs.description,
      version: configs.version,
      shareToken: configs.shareToken,
      createdAt: configs.createdAt,
      updatedAt: configs.updatedAt,
    })
    .from(configs)
    .where(eq(configs.userId, userId))
    .orderBy(desc(configs.updatedAt));
  return reply.send(list);
}

export async function get(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user as { userId: number };
  const { id } = request.params as { id: string };
  const [config] = await db
    .select()
    .from(configs)
    .where(eq(configs.id, parseInt(id)))
    .limit(1);
  if (!config || config.userId !== userId) {
    return reply.status(404).send({ error: 'Config not found' });
  }
  return reply.send(config);
}

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user as { userId: number };
  const body = createSchema.parse(request.body);
  const [config] = await db
    .insert(configs)
    .values({
      userId,
      name: body.name,
      description: body.description || '',
      data: body.data,
      shareToken: crypto.randomBytes(16).toString('hex'),
    })
    .returning();
  return reply.status(201).send(config);
}

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user as { userId: number };
  const { id } = request.params as { id: string };
  const body = updateSchema.parse(request.body);

  const [existing] = await db
    .select()
    .from(configs)
    .where(eq(configs.id, parseInt(id)))
    .limit(1);
  if (!existing || existing.userId !== userId) {
    return reply.status(404).send({ error: 'Config not found' });
  }

  // Check config lock
  const now = new Date();
  const [activeLock] = await db
    .select()
    .from(configLocks)
    .where(and(eq(configLocks.configId, existing.id), gt(configLocks.expiresAt, now)))
    .limit(1);
  if (activeLock && activeLock.userId !== userId) {
    return reply.status(423).send({ error: 'Config is locked by another user' });
  }

  // Save current version to history before updating
  await db.insert(configVersions).values({
    configId: existing.id,
    version: existing.version,
    data: existing.data,
  });

  const [updated] = await db
    .update(configs)
    .set({
      ...(body.name && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.data && { data: body.data }),
      version: existing.version + 1,
      updatedAt: new Date(),
    })
    .where(eq(configs.id, parseInt(id)))
    .returning();

  return reply.send(updated);
}

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user as { userId: number };
  const { id } = request.params as { id: string };
  const [existing] = await db
    .select()
    .from(configs)
    .where(eq(configs.id, parseInt(id)))
    .limit(1);
  if (!existing || existing.userId !== userId) {
    return reply.status(404).send({ error: 'Config not found' });
  }
  await db.delete(configVersions).where(eq(configVersions.configId, existing.id));
  await db.delete(configs).where(eq(configs.id, existing.id));
  return reply.status(204).send();
}

export async function getVersions(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user as { userId: number };
  const { id } = request.params as { id: string };
  const [existing] = await db
    .select()
    .from(configs)
    .where(eq(configs.id, parseInt(id)))
    .limit(1);
  if (!existing || existing.userId !== userId) {
    return reply.status(404).send({ error: 'Config not found' });
  }
  const versions = await db
    .select()
    .from(configVersions)
    .where(eq(configVersions.configId, existing.id))
    .orderBy(desc(configVersions.version));
  return reply.send(versions);
}

export async function getByShareToken(request: FastifyRequest, reply: FastifyReply) {
  const { token } = request.params as { token: string };
  const [config] = await db.select().from(configs).where(eq(configs.shareToken, token)).limit(1);
  if (!config) {
    return reply.status(404).send({ error: 'Config not found' });
  }
  return reply.send({
    id: config.id,
    name: config.name,
    description: config.description,
    data: config.data,
    version: config.version,
  });
}

// ── Config Lock ────────────────────────────────────────────────────────────

const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export async function lock(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user as { userId: number };
  const { id } = request.params as { id: string };
  const configId = parseInt(id, 10);

  const [existing] = await db.select().from(configs).where(eq(configs.id, configId)).limit(1);
  if (!existing) {
    return reply.status(404).send({ error: 'Config not found' });
  }

  // Check if there's an active lock held by someone else
  const now = new Date();
  const [activeLock] = await db
    .select()
    .from(configLocks)
    .where(and(eq(configLocks.configId, configId), gt(configLocks.expiresAt, now)))
    .limit(1);

  if (activeLock && activeLock.userId !== userId) {
    // Look up who locked it
    const [lockUser] = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, activeLock.userId))
      .limit(1);
    return reply.status(423).send({
      error: 'Config is locked by another user',
      lockedBy: lockUser?.username || 'Unknown',
      lockedAt: activeLock.lockedAt,
      expiresAt: activeLock.expiresAt,
    });
  }

  // Upsert lock (same user can refresh their lock)
  if (activeLock) {
    // Refresh existing lock
    const expiresAt = new Date(Date.now() + LOCK_DURATION_MS);
    await db
      .update(configLocks)
      .set({ lockedAt: now, expiresAt })
      .where(eq(configLocks.id, activeLock.id));
    return reply.send({ locked: true, expiresAt });
  }

  const expiresAt = new Date(Date.now() + LOCK_DURATION_MS);
  await db.insert(configLocks).values({
    configId,
    userId,
    lockedAt: now,
    expiresAt,
  });
  return reply.send({ locked: true, expiresAt });
}

export async function unlock(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user as { userId: number };
  const { id } = request.params as { id: string };
  const configId = parseInt(id, 10);

  await db
    .delete(configLocks)
    .where(and(eq(configLocks.configId, configId), eq(configLocks.userId, userId)));
  return reply.send({ locked: false });
}

export async function getLockStatus(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const configId = parseInt(id, 10);

  const now = new Date();
  const [activeLock] = await db
    .select()
    .from(configLocks)
    .where(and(eq(configLocks.configId, configId), gt(configLocks.expiresAt, now)))
    .limit(1);

  if (!activeLock) {
    return reply.send({ locked: false });
  }

  const [lockUser] = await db
    .select({ id: users.id, username: users.username })
    .from(users)
    .where(eq(users.id, activeLock.userId))
    .limit(1);

  return reply.send({
    locked: true,
    userId: activeLock.userId,
    username: lockUser?.username || 'Unknown',
    lockedAt: activeLock.lockedAt,
    expiresAt: activeLock.expiresAt,
  });
}
