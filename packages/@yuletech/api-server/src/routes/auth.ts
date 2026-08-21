import bcrypt from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { eq, or } from 'drizzle-orm';

import { db } from '../db/index.js';
import { users } from '../db/schema.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(32),
  password: z.string().min(6),
});

export async function authRoutes(app: FastifyInstance) {
  // Fix 30: 敏感端点单独配额（10 次/分钟，配合全局限流 100 次/分钟）
  app.post(
    '/login',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const parsed = loginSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() });
      }

      const { email, password } = parsed.data;

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return reply.status(401).send({ message: 'Invalid email or password' });
      }

      const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role });
      return {
        token,
        provider: 'email',
        user: { id: user.id, email: user.email, username: user.username, role: user.role },
      };
    }
  );

  app.post(
    '/register',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const parsed = registerSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() });
      }

      const { email, username, password } = parsed.data;

      const [existing] = await db
        .select()
        .from(users)
        .where(or(eq(users.email, email), eq(users.username, username)))
        .limit(1);
      if (existing) {
        return reply.status(409).send({
          message: existing.email === email ? 'Email already registered' : 'Username already taken',
        });
      }

      const hashed = await bcrypt.hash(password, 10);
      const [user] = await db
        .insert(users)
        .values({ email, username, passwordHash: hashed })
        .returning();

      const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role });
      return {
        token,
        provider: 'email',
        user: { id: user.id, email: user.email, username: user.username, role: user.role },
      };
    }
  );

  app.get('/me', { onRequest: [app.authenticate] }, async request => {
    const { id } = request.user as { id: number };
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        avatar: users.avatar,
        role: users.role,
        score: users.score,
        ssoProvider: users.ssoProvider,
        ssoId: users.ssoId,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }
    return {
      ...user,
      ssoBound: !!(user.ssoProvider && user.ssoProvider !== 'email'),
    };
  });

  // Fix 11: 管理员专用登录 — 校验邮箱/密码 + 角色 ∈ admin/super_admin，签发 JWT
  app.post('/admin/login', async (request, reply) => {
    const parsed = z
      .object({ email: z.string().email(), password: z.string().min(6) })
      .safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input' });
    }
    const { email, password } = parsed.data;
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (
      !user ||
      !(await bcrypt.compare(password, user.passwordHash)) ||
      !['admin', 'super_admin'].includes(user.role)
    ) {
      return reply.status(401).send({ message: 'Invalid credentials or not an admin' });
    }
    const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role });
    return {
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    };
  });
}
