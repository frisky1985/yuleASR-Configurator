import crypto from 'node:crypto';

import { and, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { db } from '../db/index.js';
import { licenseKeys, paymentEvents } from '../db/schema.js';

// ── Environment ───────────────────────────────────────────────────────────

const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY || '';
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID || '';
const LEMONSQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Whether LemonSqueezy is actually configured
const LEMON_ENABLED = !!(LEMONSQUEEZY_API_KEY && LEMONSQUEEZY_STORE_ID);

// ── LemonSqueezy variant IDs (configured in .env or hard-coded here for now)
// You can obtain these from the LemonSqueezy dashboard → Products → Variants
const LEMON_VARIANT_ID_MONTHLY = process.env.LEMON_VARIANT_ID_MONTHLY || '';
const LEMON_VARIANT_ID_YEARLY = process.env.LEMON_VARIANT_ID_YEARLY || '';

const VARIANT_IDS: Record<string, string> = {
  pro_monthly: LEMON_VARIANT_ID_MONTHLY,
  pro_yearly: LEMON_VARIANT_ID_YEARLY,
};

// ── Prices (in cents/fen — for mock mode) ──────────────────────────────────

// ── Schemas ───────────────────────────────────────────────────────────────

const createCheckoutSchema = z.object({
  priceId: z.enum(['pro_monthly', 'pro_yearly']),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
  customerEmail: z.string().email().optional(),
});

// ── License key generator ─────────────────────────────────────────────────

function generateLicenseKey(): string {
  const part = () => crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 4);
  return `YULE-${part()}-${part()}-${part()}`;
}

// ── LemonSqueezy API helpers ──────────────────────────────────────────────

const LEMON_API_BASE = 'https://api.lemonsqueezy.com/v1';

interface LemonCheckoutResponse {
  data: {
    id: string;
    attributes: {
      url: string;
      product_name: string;
      variant_name: string;
      price: number;
    };
  };
}

async function createLemonCheckout(params: {
  variantId: string;
  email?: string;
  userId: number;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string; checkoutId: string }> {
  const body = {
    data: {
      type: 'checkouts',
      attributes: {
        store_id: parseInt(LEMONSQUEEZY_STORE_ID, 10),
        variant_id: parseInt(params.variantId, 10),
        custom_price: null,
        product_options: {
          enabled_variants: [parseInt(params.variantId, 10)],
          redirect_url: params.successUrl,
        },
        checkout_options: {
          embed: false,
          media: false,
          logo: true,
          dark: false,
          subscription_preview: true,
        },
        checkout_data: {
          email: params.email || '',
          custom: {
            user_id: String(params.userId),
          },
        },
      },
    },
  };

  const res = await fetch(`${LEMON_API_BASE}/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LemonSqueezy API error (${res.status}): ${text}`);
  }

  const json = (await res.json()) as LemonCheckoutResponse;
  return {
    url: json.data.attributes.url,
    checkoutId: json.data.id,
  };
}

/**
 * Verify LemonSqueezy webhook signature.
 * The signature is HMAC-SHA256 of the raw body, signed with the webhook secret.
 * Fix 9: 未配置 secret 直接返回 false（不跳过校验）；支持官方 `v1=` 前缀格式。
 * 导出以便单测：verifyLemonSignature(v1= 前缀/裸 hex/错误签名/未配置 secret)。
 */
export function verifyLemonSignature(rawBody: string, signature: string): boolean {
  if (!LEMONSQUEEZY_WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac('sha256', LEMONSQUEEZY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  // LemonSqueezy 签名格式为 "v1=<hmac hex>"；兼容裸 hex 输入
  const provided = signature.startsWith('v1=') ? signature.slice(3) : signature;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  } catch {
    return false;
  }
}

// Fix 10: mock-success 端点仅在显式开启时注册（生产默认不注册，杜绝白嫖 Pro）
const ENABLE_MOCK_PAYMENT = process.env.ENABLE_MOCK_PAYMENT === 'true';

// ── Routes ────────────────────────────────────────────────────────────────

export async function paymentRoutes(app: FastifyInstance) {
  /**
   * POST /api/payment/create-checkout
   * Creates a checkout session.
   * - If LemonSqueezy is configured: creates a real LemonSqueezy checkout
   * - Otherwise: returns a mock checkout URL (for development)
   */
  app.post('/create-checkout', { onRequest: [app.authenticate] }, async (request, reply) => {
    const parsed = createCheckoutSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() });
    }

    const { priceId, customerEmail } = parsed.data;
    const userId = (request.user as { id: number }).id;
    const successUrl =
      parsed.data.successUrl || `${FRONTEND_URL}/settings/license?checkout=success`;
    const cancelUrl = parsed.data.cancelUrl || `${FRONTEND_URL}/settings/license?checkout=cancel`;

    // ── Live mode: LemonSqueezy ──────────────────────────────────────────
    if (LEMON_ENABLED) {
      const variantId = VARIANT_IDS[priceId];
      if (!variantId) {
        return reply.status(400).send({
          message: `No LemonSqueezy variant configured for priceId: ${priceId}. Set LEMON_VARIANT_ID_MONTHLY / LEMON_VARIANT_ID_YEARLY env vars.`,
        });
      }

      try {
        const result = await createLemonCheckout({
          variantId,
          email: customerEmail,
          userId,
          successUrl,
          cancelUrl,
        });
        return { url: result.url, checkoutId: result.checkoutId, provider: 'lemonsqueezy' };
      } catch (err: any) {
        return reply
          .status(500)
          .send({ message: 'Failed to create LemonSqueezy checkout', error: err.message });
      }
    }

    // ── Mock mode (no real payment gateway) ────────────────────────────
    const mockSessionId = `cs_mock_${Date.now()}_${userId}`;
    const mockUrl = `${FRONTEND_URL}/api/payment/mock-checkout?session_id=${mockSessionId}&price_id=${priceId}&user_id=${userId}`;

    return {
      url: mockUrl,
      mock: true,
      provider: 'mock',
      message: 'Mock checkout — use POST /api/payment/mock-success to simulate payment',
      sessionId: mockSessionId,
    };
  });

  /**
   * POST /api/payment/mock-success
   * Simulates a successful payment (for development/testing).
   * Creates a Pro LicenseKey bound to the current user.
   * Fix 10: 仅 ENABLE_MOCK_PAYMENT=true 时注册，生产默认 404，杜绝白嫖 Pro。
   */
  if (ENABLE_MOCK_PAYMENT) {
    app.post('/mock-success', { onRequest: [app.authenticate] }, async (request, reply) => {
      const parsed = z
        .object({
          priceId: z.enum(['pro_monthly', 'pro_yearly']),
        })
        .safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() });
      }

      const { priceId } = parsed.data;
      const userId = (request.user as { id: number }).id;

      // Deactivate any existing active Pro license for this user
      await db
        .update(licenseKeys)
        .set({ active: false })
        .where(
          and(
            eq(licenseKeys.userId, userId),
            eq(licenseKeys.tier, 'pro'),
            eq(licenseKeys.active, true)
          )
        );

      // Calculate expiry — monthly = 30 days, yearly = 365 days
      const days = priceId === 'pro_yearly' ? 365 : 30;
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      const [license] = await db
        .insert(licenseKeys)
        .values({
          key: generateLicenseKey(),
          tier: 'pro',
          maxModules: 9999,
          maxProjects: 9999,
          expiresAt,
          customerEmail: (request.user as any).email ?? null,
          userId,
          active: true,
        })
        .returning();

      return {
        message: 'Payment simulated successfully. Pro license activated.',
        license: {
          key: license.key,
          tier: license.tier,
          maxModules: license.maxModules,
          maxProjects: license.maxProjects,
          expiresAt: license.expiresAt,
        },
      };
    });
  }

  /**
   * POST /api/payment/webhook
   * Webhook endpoint for LemonSqueezy payment events.
   * - If LemonSqueezy is configured: validates the webhook signature
   * - Otherwise: processes the raw body directly (mock/dev mode)
   *
   * LemonSqueezy sends events like: order_created, subscription_created, etc.
   * We handle: order_created → activate license
   */
  app.post('/webhook', async (request, reply) => {
    // ── Get raw body for signature verification ─────────────────────────
    const rawBody = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);

    const body: any = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;

    // ── LemonSqueezy signature verification ────────────────────────────
    // Fix 9: 未配置 WEBHOOK_SECRET 时一律 503 拒绝（不再"跳过校验处理"）
    if (!LEMONSQUEEZY_WEBHOOK_SECRET) {
      return reply.status(503).send({ message: 'Webhook not configured' });
    }
    const signature = (request.headers['x-signature'] as string) || '';
    if (!signature || !verifyLemonSignature(rawBody, signature)) {
      return reply.status(401).send({ message: 'Invalid webhook signature' });
    }

    // ── Extract event info ──────────────────────────────────────────────
    // LemonSqueezy format: { data: { attributes: { ... } }, meta: { event_name: "order_created" } }
    const eventName = body?.meta?.event_name || body?.type || 'unknown';
    // Fix 9: eventId 绑定服务端可控的订单号（body.data.id），拒绝客户端伪造的 id/时间戳
    const lemonOrderIdRaw = String(body?.data?.id || '');
    const eventId = lemonOrderIdRaw ? `evt_${lemonOrderIdRaw}` : '';

    // ── Handle supported events (pre-check) ────────────────────────────
    const shouldActivate =
      eventName === 'order_created' ||
      eventName === 'subscription_created' ||
      eventName === 'payment.success' ||
      eventName === 'checkout.session.completed';

    // Fix 9: 激活类事件必须携带真实订单号（服务端可控数据），否则拒绝
    // 防止伪造无订单号的"激活类"事件绕过校验后签发 license
    if (shouldActivate && !lemonOrderIdRaw) {
      return reply.status(422).send({ received: true, ignored: 'missing order id' });
    }

    // ── Deduplication ───────────────────────────────────────────────────
    const [existing] = await db
      .select()
      .from(paymentEvents)
      .where(eq(paymentEvents.eventId, eventId))
      .limit(1);
    if (existing) {
      return reply.status(200).send({ received: true, duplicate: true });
    }

    // ── Extract LemonSqueezy order data ─────────────────────────────────
    const lsData = body?.data?.attributes || {};
    const lsCustomData = body?.meta?.custom_data || {};
    const lsRelationships = body?.data?.relationships || {};

    const lemonOrderId = String(body?.data?.id || '');
    const lemonCustomerId = String(lsData?.customer_id || '');
    const lemonProductId = String(lsRelationships?.product?.data?.id || lsData?.product_id || '');
    const lemonVariantId = String(lsRelationships?.variant?.data?.id || lsData?.variant_id || '');
    const email = lsData?.user_email || lsData?.email || body?.email || '';
    const userId =
      lsCustomData?.user_id || body?.data?.attributes?.custom_data?.user_id
        ? parseInt(lsCustomData?.user_id || body?.data?.attributes?.custom_data?.user_id)
        : null;

    const interval = lsData?.variant_name?.toLowerCase() || '';
    const isYearly = interval.includes('year');
    const isOrder = eventName === 'order_created';

    // ── Record the incoming event ────────────────────────────────────────
    await db.insert(paymentEvents).values({
      eventId,
      type: eventName,
      email,
      licenseKey: null, // will be set after license creation
      tier: 'pro',
      rawBody,
      processed: false,
      lemonOrderId,
      lemonCustomerId,
      lemonProductId,
      lemonVariantId,
    });

    // ── Handle supported events ─────────────────────────────────────────
    // order_created → one-time payment; activate license
    // subscription_created → subscription started; activate license
    // (shouldActivate 已在上面预计算；此处直接复用)
    if (shouldActivate && (email || userId || lemonOrderId)) {
      // Deactivate old licenses
      if (userId) {
        await db
          .update(licenseKeys)
          .set({ active: false })
          .where(and(eq(licenseKeys.userId, userId), eq(licenseKeys.active, true)));
      }

      const days = isYearly ? 365 : 30;
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      const [license] = await db
        .insert(licenseKeys)
        .values({
          key: generateLicenseKey(),
          tier: 'pro',
          maxModules: 9999,
          maxProjects: 9999,
          expiresAt,
          customerEmail: email || null,
          userId,
          active: true,
          lemonOrderId: lemonOrderId || null,
          lemonCustomerId: lemonCustomerId || null,
        })
        .returning();

      // Update the payment event with the generated license key
      await db
        .update(paymentEvents)
        .set({ processed: true, licenseKey: license.key })
        .where(eq(paymentEvents.eventId, eventId));
    }

    return reply.status(200).send({ received: true });
  });
}
