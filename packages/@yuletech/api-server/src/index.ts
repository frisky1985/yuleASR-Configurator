import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';

import { prisma } from './lib/prisma.js';
import { ssoRoutes } from './routes/auth-sso.js';
import { authRoutes } from './routes/auth.js';
import { blogRoutes } from './routes/blog.js';
import { brandingRoutes } from './routes/branding.js';
import { bswTemplatesRoutes } from './routes/bswTemplates.js';
import { configsRoutes } from './routes/configs.js';
import { licenseRoutes } from './routes/license.js';
import { paymentRoutes } from './routes/payment.js';
import { pluginRoutes } from './routes/plugins.js';
import { postsRoutes } from './routes/posts.js';
import { qaRoutes } from './routes/qa.js';
import { sharedConfigsRoutes } from './routes/sharedConfigs.js';
import { tagsRoutes } from './routes/tags.js';
import { templateReviewsRoutes } from './routes/templateReviews.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
// Fix 6: JWT_SECRET 缺失或过短直接拒绝启动（fail-fast），杜绝硬编码默认密钥可伪造管理员令牌
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error(
    'FATAL: JWT_SECRET 环境变量未配置或长度不足 32 字符。\n' +
      '生成方式: openssl rand -hex 32\n' +
      '示例: JWT_SECRET=<生成的密钥> pnpm dev'
  );
  process.exit(1);
}

const app = Fastify({ logger: true });

// ── Plugins ──────────────────────────────────────────────────────────────

await app.register(cors, { origin: true });
await app.register(jwt, { secret: JWT_SECRET });
await app.register(swagger, {
  openapi: {
    info: { title: 'yuleCommunity API', version: '0.1.0' },
  },
});
await app.register(swaggerUi, { routePrefix: '/docs' });

// ── Decorate request with authenticate ──────────────────────────────────

app.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch {
    reply.status(401).send({ message: 'Unauthorized' });
  }
});

// ── Register built-in AUTOSAR plugins ───────────────────────────────────
try {
  const { registerBuiltinPlugins } = await import('@yuletech/core/plugins');
  await registerBuiltinPlugins();
  console.log('✅ Built-in AUTOSAR plugins registered');
} catch (err) {
  console.warn('⚠️ Failed to register built-in plugins:', err);
}

// ── Routes ──────────────────────────────────────────────────────────────

await app.register(authRoutes, { prefix: '/v1/auth' });
await app.register(ssoRoutes, { prefix: '/v1/auth' });
await app.register(postsRoutes, { prefix: '/v1/posts' });
await app.register(blogRoutes, { prefix: '/v1/blog' });
await app.register(tagsRoutes, { prefix: '/v1/tags' });
await app.register(licenseRoutes, { prefix: '/v1/api/license' });
await app.register(paymentRoutes, { prefix: '/v1/api/payment' });
await app.register(bswTemplatesRoutes, { prefix: '/v1/api/bsw-templates' });
await app.register(templateReviewsRoutes, { prefix: '/v1/api' });
await app.register(sharedConfigsRoutes, { prefix: '/v1/api/shared-configs' });
await app.register(configsRoutes, { prefix: '/v1/api/configs' });
await app.register(qaRoutes, { prefix: '/v1/api' });

// ── Branding (OEM White-Label) ─────────────────────────────────────────
await app.register(brandingRoutes, { prefix: '/v1/api/branding' });

// ── Plugin Management ─────────────────────────────────────────────────
await app.register(pluginRoutes, { prefix: '/v1/api/plugins' });

// Health check
app.get('/health', async () => {
  let dbStatus = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'error';
  }
  return {
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: process.uptime(),
  };
});

// ── Start ────────────────────────────────────────────────────────────────

try {
  await app.listen({ port: PORT, host: HOST });
  console.log(`🚀 yuleCommunity API running at http://${HOST}:${PORT}`);
  console.log(`📚 API docs at http://${HOST}:${PORT}/docs`);
} catch (err) {
  app.log.error(err);
  await prisma.$disconnect();
  process.exit(1);
}

// Graceful shutdown
const shutdown = async () => {
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
