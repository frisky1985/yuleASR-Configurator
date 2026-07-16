import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import crypto from 'node:crypto'

// ── Environment ───────────────────────────────────────────────────────────

const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY || ''
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID || ''
const LEMONSQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || ''
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// Only used in legacy Stripe mock detection; we keep PAYMENT_MODE for backward compat
const PAYMENT_MODE: 'live' | 'test' | 'mock' =
  (process.env.PAYMENT_MODE as 'live' | 'test' | 'mock') || 'mock'

// Whether LemonSqueezy is actually configured
const LEMON_ENABLED = !!(LEMONSQUEEZY_API_KEY && LEMONSQUEEZY_STORE_ID)

// ── LemonSqueezy variant IDs (configured in .env or hard-coded here for now)
// You can obtain these from the LemonSqueezy dashboard → Products → Variants
const LEMON_VARIANT_ID_MONTHLY = process.env.LEMON_VARIANT_ID_MONTHLY || ''
const LEMON_VARIANT_ID_YEARLY = process.env.LEMON_VARIANT_ID_YEARLY || ''

const VARIANT_IDS: Record<string, string> = {
  pro_monthly: LEMON_VARIANT_ID_MONTHLY,
  pro_yearly: LEMON_VARIANT_ID_YEARLY,
}

// ── Prices (in cents/fen — for mock mode) ──────────────────────────────────

const PRICES = {
  pro_monthly: 29900,   // ¥299.00
  pro_yearly: 299900,   // ¥2999.00
}

// ── Schemas ───────────────────────────────────────────────────────────────

const createCheckoutSchema = z.object({
  priceId: z.enum(['pro_monthly', 'pro_yearly']),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
  customerEmail: z.string().email().optional(),
})

// ── License key generator ─────────────────────────────────────────────────

function generateLicenseKey(): string {
  const part = () => crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 4)
  return `YULE-${part()}-${part()}-${part()}`
}

// ── LemonSqueezy API helpers ──────────────────────────────────────────────

const LEMON_API_BASE = 'https://api.lemonsqueezy.com/v1'

interface LemonCheckoutResponse {
  data: {
    id: string
    attributes: {
      url: string
      product_name: string
      variant_name: string
      price: number
    }
  }
}

async function createLemonCheckout(params: {
  variantId: string
  email?: string
  userId: number
  successUrl: string
  cancelUrl: string
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
  }

  const res = await fetch(`${LEMON_API_BASE}/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`,
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`LemonSqueezy API error (${res.status}): ${text}`)
  }

  const json = (await res.json()) as LemonCheckoutResponse
  return {
    url: json.data.attributes.url,
    checkoutId: json.data.id,
  }
}

/**
 * Verify LemonSqueezy webhook signature.
 * The signature is HMAC-SHA256 of the raw body, signed with the webhook secret.
 */
function verifyLemonSignature(rawBody: string, signature: string): boolean {
  if (!LEMONSQUEEZY_WEBHOOK_SECRET) return false
  const hmac = crypto.createHmac('sha256', LEMONSQUEEZY_WEBHOOK_SECRET)
  hmac.update(rawBody)
  const digest = hmac.digest('hex')
  // Use timing-safe comparison
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
  } catch {
    return false
  }
}

// ── Routes ────────────────────────────────────────────────────────────────

export async function paymentRoutes(app: FastifyInstance) {
  /**
   * POST /api/payment/create-checkout
   * Creates a checkout session.
   * - If LemonSqueezy is configured: creates a real LemonSqueezy checkout
   * - Otherwise: returns a mock checkout URL (for development)
   */
  app.post('/create-checkout', { onRequest: [(app as any).authenticate] }, async (request, reply) => {
    const parsed = createCheckoutSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() })
    }

    const { priceId, customerEmail } = parsed.data
    const userId = (request.user as { id: number }).id
    const successUrl = parsed.data.successUrl || `${FRONTEND_URL}/settings/license?checkout=success`
    const cancelUrl = parsed.data.cancelUrl || `${FRONTEND_URL}/settings/license?checkout=cancel`

    // ── Live mode: LemonSqueezy ──────────────────────────────────────────
    if (LEMON_ENABLED) {
      const variantId = VARIANT_IDS[priceId]
      if (!variantId) {
        return reply.status(400).send({
          message: `No LemonSqueezy variant configured for priceId: ${priceId}. Set LEMON_VARIANT_ID_MONTHLY / LEMON_VARIANT_ID_YEARLY env vars.`,
        })
      }

      try {
        const result = await createLemonCheckout({
          variantId,
          email: customerEmail,
          userId,
          successUrl,
          cancelUrl,
        })
        return { url: result.url, checkoutId: result.checkoutId, provider: 'lemonsqueezy' }
      } catch (err: any) {
        return reply.status(500).send({ message: 'Failed to create LemonSqueezy checkout', error: err.message })
      }
    }

    // ── Mock mode (no real payment gateway) ────────────────────────────
    const mockSessionId = `cs_mock_${Date.now()}_${userId}`
    const mockUrl = `${FRONTEND_URL}/api/payment/mock-checkout?session_id=${mockSessionId}&price_id=${priceId}&user_id=${userId}`

    return {
      url: mockUrl,
      mock: true,
      provider: 'mock',
      message: 'Mock checkout — use POST /api/payment/mock-success to simulate payment',
      sessionId: mockSessionId,
    }
  })

  /**
   * POST /api/payment/mock-success
   * Simulates a successful payment (for development/testing).
   * Creates a Pro LicenseKey bound to the current user.
   */
  app.post('/mock-success', { onRequest: [(app as any).authenticate] }, async (request, reply) => {
    const parsed = z.object({
      priceId: z.enum(['pro_monthly', 'pro_yearly']),
    }).safeParse(request.body)

    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() })
    }

    const { priceId } = parsed.data
    const userId = (request.user as { id: number }).id
    const { prisma } = await import('../lib/prisma.js')

    // Deactivate any existing active Pro license for this user
    await prisma.licenseKey.updateMany({
      where: { userId, tier: 'pro', active: true },
      data: { active: false },
    })

    // Calculate expiry — monthly = 30 days, yearly = 365 days
    const days = priceId === 'pro_yearly' ? 365 : 30
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

    const license = await prisma.licenseKey.create({
      data: {
        key: generateLicenseKey(),
        tier: 'pro',
        maxModules: 9999,
        maxProjects: 9999,
        expiresAt,
        customerEmail: (request.user as any).email,
        userId,
        active: true,
      },
    })

    return {
      message: 'Payment simulated successfully. Pro license activated.',
      license: {
        key: license.key,
        tier: license.tier,
        maxModules: license.maxModules,
        maxProjects: license.maxProjects,
        expiresAt: license.expiresAt,
      },
    }
  })

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
    const { prisma } = await import('../lib/prisma.js')

    // ── Get raw body for signature verification ─────────────────────────
    const rawBody = typeof request.body === 'string'
      ? request.body
      : JSON.stringify(request.body)

    let body: any = typeof request.body === 'string'
      ? JSON.parse(request.body)
      : request.body

    // ── LemonSqueezy signature verification ────────────────────────────
    if (LEMON_ENABLED && LEMONSQUEEZY_WEBHOOK_SECRET) {
      const signature = (request.headers['x-signature'] as string) || ''
      if (!signature || !verifyLemonSignature(rawBody, signature)) {
        return reply.status(401).send({ message: 'Invalid webhook signature' })
      }
    }

    // ── Extract event info ──────────────────────────────────────────────
    // LemonSqueezy format: { data: { attributes: { ... } }, meta: { event_name: "order_created" } }
    const eventName = body?.meta?.event_name || body?.type || 'unknown'
    const eventId = body?.meta?.custom_data?.event_id || body?.id || `evt_${Date.now()}`

    // ── Deduplication ───────────────────────────────────────────────────
    const existing = await prisma.paymentEvent.findUnique({ where: { eventId } })
    if (existing) {
      return reply.status(200).send({ received: true, duplicate: true })
    }

    // ── Extract LemonSqueezy order data ─────────────────────────────────
    const lsData = body?.data?.attributes || {}
    const lsCustomData = body?.meta?.custom_data || {}
    const lsRelationships = body?.data?.relationships || {}

    const lemonOrderId = String(body?.data?.id || '')
    const lemonCustomerId = String(lsData?.customer_id || '')
    const lemonProductId = String(lsRelationships?.product?.data?.id || lsData?.product_id || '')
    const lemonVariantId = String(lsRelationships?.variant?.data?.id || lsData?.variant_id || '')
    const email = lsData?.user_email || lsData?.email || body?.email || ''
    const userId = lsCustomData?.user_id || body?.data?.attributes?.custom_data?.user_id
      ? parseInt(lsCustomData?.user_id || body?.data?.attributes?.custom_data?.user_id)
      : null

    const isSubscription = eventName === 'subscription_created' || eventName === 'subscription_updated'
    const interval = lsData?.variant_name?.toLowerCase() || ''
    const isYearly = interval.includes('year')
    const isOrder = eventName === 'order_created'

    // ── Record the incoming event ────────────────────────────────────────
    await prisma.paymentEvent.create({
      data: {
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
      },
    })

    // ── Handle supported events ─────────────────────────────────────────
    // order_created → one-time payment; activate license
    // subscription_created → subscription started; activate license
    const shouldActivate = isOrder ||
      eventName === 'subscription_created' ||
      eventName === 'payment.success' ||
      eventName === 'checkout.session.completed'

    if (shouldActivate && (email || userId || lemonOrderId)) {
      // Deactivate old licenses
      if (userId) {
        await prisma.licenseKey.updateMany({
          where: { userId, active: true },
          data: { active: false },
        })
      }

      const days = isYearly ? 365 : 30
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

      const license = await prisma.licenseKey.create({
        data: {
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
        },
      })

      // Update the payment event with the generated license key
      await prisma.paymentEvent.update({
        where: { eventId },
        data: { processed: true, licenseKey: license.key },
      })
    }

    return reply.status(200).send({ received: true })
  })
}
