/**
 * Fix 31 (3.13): Fastify 类型增强
 *
 * 消除路由内 `(app as any).authenticate / (app as any).jwt` 等 any 用法。
 *
 * 说明：
 * - `authenticate` / `requireAdmin` 由 src/index.ts 通过 app.decorate 注入，
 *   这里在 FastifyInstance 上补声明，路由内可直接 `app.authenticate`。
 * - `request.user` 由 @fastify/jwt 的 FastifyJWT 泛型驱动（@fastify/jwt 自带
 *   `FastifyInstance.jwt` 与 `FastifyRequest.jwtVerify/user` 的模块增强）。
 *   与 plan 原稿 `interface FastifyRequest { user?: ... }` 不同：
 *   直接声明会与 @fastify/jwt 已声明的 `user: UserType` 冲突（TS2717），
 *   因此改为声明 `FastifyJWT['user']`，效果等价且为官方推荐方式。
 */
import type { FastifyReply, FastifyRequest } from 'fastify';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: { id: number; email: string; role: string };
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
