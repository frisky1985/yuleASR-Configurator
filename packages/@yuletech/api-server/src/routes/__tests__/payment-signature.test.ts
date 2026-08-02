/**
 * Fix 32: verifyLemonSignature 单测（Fix 9 回归防护）。
 *
 * 语义契约：
 * - 官方 `v1=<hmac-hex>` 前缀格式 → true
 * - 裸 hex（无 v1= 前缀，兼容输入）→ true
 * - 错误签名 / 篡改 body / 畸形签名 → false（不抛错）
 * - 未配置 LEMONSQUEEZY_WEBHOOK_SECRET → false（不得跳过校验）
 *
 * 注意：verifyLemonSignature 在模块加载时读取 env，测试通过
 * vi.resetModules() + 动态 import 保证每次以目标 env 重新加载模块。
 */
import crypto from 'node:crypto';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// db 仅在路由处理器中使用，单测不触达 —— mock 掉以避免实例化 postgres 客户端
vi.mock('../../db/index.js', () => ({ db: {} }));
vi.mock('../../db/schema.js', () => ({ licenseKeys: {}, paymentEvents: {} }));

const SECRET = 'whsec_test_1234567890abcdef';

function hmac(body: string): string {
  return crypto.createHmac('sha256', SECRET).update(body).digest('hex');
}

async function importPayment() {
  vi.resetModules();
  return (await import('../payment.js')) as typeof import('../payment.js');
}

describe('verifyLemonSignature（Fix 9）', () => {
  beforeEach(() => {
    vi.stubEnv('LEMONSQUEEZY_WEBHOOK_SECRET', SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('官方 v1= 前缀格式 → true', async () => {
    const { verifyLemonSignature } = await importPayment();
    const body = JSON.stringify({ meta: { event_name: 'order_created' } });
    expect(verifyLemonSignature(body, `v1=${hmac(body)}`)).toBe(true);
  });

  it('裸 hex（无 v1= 前缀）→ true', async () => {
    const { verifyLemonSignature } = await importPayment();
    const body = 'raw-body';
    expect(verifyLemonSignature(body, hmac(body))).toBe(true);
  });

  it('错误签名 → false', async () => {
    const { verifyLemonSignature } = await importPayment();
    expect(verifyLemonSignature('body', `v1=${'0'.repeat(64)}`)).toBe(false);
  });

  it('篡改 body → false（签名与内容绑定）', async () => {
    const { verifyLemonSignature } = await importPayment();
    const sig = hmac('original-body');
    expect(verifyLemonSignature('tampered-body', `v1=${sig}`)).toBe(false);
  });

  it('畸形签名（非 hex / 长度不符）→ false 且不抛错', async () => {
    const { verifyLemonSignature } = await importPayment();
    expect(verifyLemonSignature('body', 'v1=not-hex!!')).toBe(false);
    expect(verifyLemonSignature('body', 'short')).toBe(false);
    expect(verifyLemonSignature('body', '')).toBe(false);
  });

  it('未配置 WEBHOOK_SECRET → false（不跳过校验，Fix 9）', async () => {
    vi.stubEnv('LEMONSQUEEZY_WEBHOOK_SECRET', '');
    const { verifyLemonSignature } = await importPayment();
    const body = 'body';
    // 即使签名“正确”，未配置 secret 也必须拒绝
    expect(verifyLemonSignature(body, `v1=${hmac(body)}`)).toBe(false);
  });
});
