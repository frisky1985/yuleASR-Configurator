import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

// ── Environment ───────────────────────────────────────────────────────────

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''
const PAYMENT_MODE: 'live' | 'test' = (process.env.PAYMENT_MODE as 'live' | 'test') || 'test'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

const PRICES = {
  pro_monthly: 29900,   // ¥299.00 in cents/fen
  pro_yearly: 299900,   // ¥2999.00 in cents/fen
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
  const part = () => require('node:crypto').randomBytes(3).toString('hex').toUpperCase().slice(0, 4)
  return `YULE-${part()}-${part()}-${part()}`
}

// ── Routes ────────────────────────────────────────────────────────────────

export async function paymentRoutes(app: FastifyInstance) {
  /**
   * POST /api/payment/create-checkout
   * Creates a checkout session (Stripe) or returns a mock URL when not configured.
   * Returns a checkout URL for frontend redirect.
   */
  app.post('/create-checkout', { onRequest: [(app as any).authenticate] }, async (request, reply) => {
    const parsed = createCheckoutSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() })
    }

    const { priceId, customerEmail } = parsed.data
    const userId = (request.user as { id: number }).id

    // If Stripe is configured, use real Stripe
    if (STRIPE_SECRET_KEY && PAYMENT_MODE === 'live' && !STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      try {
        const stripe = require('stripe')(STRIPE_SECRET_KEY)
        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [{ price: priceId, quantity: 1 }],
          client_reference_id: String(userId),
          customer_email: customerEmail,
          success_url: parsed.data.successUrl || `${FRONTEND_URL}/settings/license?checkout=success`,
          cancel_url: parsed.data.cancelUrl || `${FRONTEND_URL}/settings/license?checkout=cancel`,
          metadata: { tier: 'pro', userId: String(userId) },
        })
        return { url: session.url }
      } catch (err: any) {
        return reply.status(500).send({ message: 'Failed to create Stripe checkout', error: err.message })
      }
    }

    // ── Mock mode (no real payment gateway) ────────────────────────────
    // In test mode, return a simulated checkout URL
    const mockSessionId = `cs_mock_${Date.now()}_${userId}`
    const mockUrl = `${FRONTEND_URL}/api/payment/mock-checkout?session_id=${mockSessionId}&price_id=${priceId}&user_id=${userId}`

    return {
      url: mockUrl,
      mock: true,
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
        maxModules: 9999,  // effectively unlimited
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
   * Webhook endpoint for real Stripe/LemonSqueezy payment events.
   * In production, validate the webhook signature.
   */
  app.post('/webhook', async (request, reply) => {
    const body = request.body as any
    const eventType = body?.type || body?.event_name || 'unknown'
    const { prisma } = await import('../lib/prisma.js')

    // Record the incoming event
    const eventId = body?.id || body?.event_id || `evt_${Date.now()}`
    const existing = await prisma.paymentEvent.findUnique({ where: { eventId } })
    if (existing) {
      return reply.status(200).send({ received: true, duplicate: true })
    }

    await prisma.paymentEvent.create({
      data: {
        eventId,
        type: eventType,
        email: body?.data?.customer_email || body?.customer_email || body?.email,
        licenseKey: body?.data?.license_key || body?.license_key,
        tier: body?.data?.tier || body?.tier || 'pro',
        rawBody: JSON.stringify(body),
        processed: false,
      },
    })

    // Handle payment.success
    if (eventType === 'payment.success' || eventType === 'checkout.session.completed' || eventType === 'order_created') {
      const email = body?.data?.customer_email || body?.customer_email || body?.email
      const tier = body?.data?.tier || body?.tier || 'pro'
      const userId = body?.data?.user_id || body?.client_reference_id
        ? parseInt(body?.data?.user_id || body?.client_reference_id)
        : null

      if (email || userId) {
        const where = userId ? { userId } : { customerEmail: email }
        // Deactivate old licenses
        if (userId) {
          await prisma.licenseKey.updateMany({
            where: { userId, active: true },
            data: { active: false },
          })
        }

        const days = body?.data?.interval === 'year' ? 365 : 30
        const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

        await prisma.licenseKey.create({
          data: {
            key: generateLicenseKey(),
            tier,
            maxModules: 9999,
            maxProjects: 9999,
            expiresAt,
            customerEmail: email,
            userId,
            active: true,
          },
        })

        // Mark event as processed
        await prisma.paymentEvent.update({
          where: { eventId },
          data: { processed: true },
        })
      }
    }

    return reply.status(200).send({ received: true })
  })
}
