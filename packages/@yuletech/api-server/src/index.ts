import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';

import { sql } from 'drizzle-orm';

import { db } from './db/index.js';
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
// Fix 30: 默认仅监听 loopback（避免无鉴权服务暴露到局域网），生产经 HOST 显式放开
const HOST = process.env.HOST || '127.0.0.1';
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

// Fix 30: CORS 白名单（替换原 origin: true 全放开；生产经 CORS_ORIGINS 显式配置）
const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

await app.register(cors, { origin: CORS_ORIGINS });

// Fix 30: helmet 安全头（frameguard/noSniff/referrerPolicy 等）。
// 开发环境关闭 CSP，避免破坏 /docs（swagger-ui 内联样式/脚本）；
// 生产环境启用完整 CSP。referrerPolicy no-referrer 配合 OIDC fragment token 防泄露。
await app.register(helmet, {
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  referrerPolicy: { policy: 'no-referrer' },
});

await app.register(jwt, { secret: JWT_SECRET });

// Fix 30: 全局限流（默认 100 请求/分钟/IP）；
// 敏感端点（auth/login、auth/register、license/validate、auth-sso/*）在各自路由注册处
// 用 per-route config.rateLimit 单独收紧为 10 请求/分钟。
await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

// Fix 30: swagger /docs 仅在非生产环境注册（生产不暴露接口文档）
if (process.env.NODE_ENV !== 'production') {
  await app.register(swagger, {
    openapi: {
      info: { title: 'yuleCommunity API', version: '0.1.0' },
    },
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });
}

// ── Decorate request with authenticate ──────────────────────────────────

app.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch {
    reply.status(401).send({ message: 'Unauthorized' });
  }
});

// Fix 12: 管理操作要求 admin/super_admin 角色（依赖 Fix 6 JWT 可信载荷）
app.decorate('requireAdmin', async function (request: any, reply: any) {
  const user = request.user as { role?: string } | undefined;
  if (!user || !['admin', 'super_admin'].includes(user.role ?? '')) {
    reply.status(403).send({ message: 'Forbidden: admin role required' });
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
    await db.execute(sql`SELECT 1`);
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
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📚 API docs at http://${HOST}:${PORT}/docs`);
  }
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

// Graceful shutdown
const shutdown = async () => {
  await app.close();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
