import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../db/index.js'
import { brandSettings } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { prisma } from '../lib/prisma.js'

// ── Validation Schema ───────────────────────────────────────────────────

const brandSettingsSchema = z.object({
  name: z.string().min(1).max(255),
  logoUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex color (#RRGGBB)').optional().nullable(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex color (#RRGGBB)').optional().nullable(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex color (#RRGGBB)').optional().nullable(),
  companyName: z.string().max(255).optional().nullable(),
  supportEmail: z.string().email().optional().nullable().or(z.literal('')),
  termsUrl: z.string().url().optional().nullable().or(z.literal('')),
  privacyUrl: z.string().url().optional().nullable().or(z.literal('')),
  customDomain: z.string().max(255).optional().nullable(),
  emailTemplateHeader: z.string().optional().nullable(),
  emailTemplateFooter: z.string().optional().nullable(),
  allowedDomains: z.array(z.string()).optional(),
})

// ── Helper: get first brand settings row (upsert pattern) ───────────────

async function getOrCreateBrandSettings() {
  const [existing] = await db.select().from(brandSettings).limit(1)
  if (existing) return existing

  // Create default row
  const [created] = await db.insert(brandSettings).values({
    name: 'yuleASR',
  }).returning()
  return created
}

// ── Routes ──────────────────────────────────────────────────────────────

export async function brandingRoutes(app: FastifyInstance) {
  /**
   * GET /api/branding — Public
   * Returns current brand settings (no auth required)
   */
  app.get('/', async () => {
    const settings = await getOrCreateBrandSettings()
    return {
      id: settings.id,
      name: settings.name,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      accentColor: settings.accentColor,
      companyName: settings.companyName,
      supportEmail: settings.supportEmail,
      termsUrl: settings.termsUrl,
      privacyUrl: settings.privacyUrl,
      customDomain: settings.customDomain,
      emailTemplateHeader: settings.emailTemplateHeader,
      emailTemplateFooter: settings.emailTemplateFooter,
      allowedDomains: settings.allowedDomains,
      updatedAt: settings.updatedAt,
    }
  })

  /**
   * PUT /api/branding — Admin only
   * Updates brand settings
   */
  app.put('/', { onRequest: [(app as any).authenticate] }, async (request, reply) => {
    // Check admin role — need to fetch user from Prisma (where roles live)
    const userData = (request as any).user as { id: number }
    const user = await prisma.user.findUnique({ where: { id: userData.id } })
    if (!user || user.role !== 'admin') {
      return reply.status(403).send({ message: 'Forbidden: admin access required' })
    }

    const parsed = brandSettingsSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() })
    }

    const data = parsed.data
    const [existing] = await db.select({ id: brandSettings.id }).from(brandSettings).limit(1)

    if (!existing) {
      const [created] = await db.insert(brandSettings).values({
        name: data.name,
        logoUrl: data.logoUrl ?? null,
        faviconUrl: data.faviconUrl ?? null,
        primaryColor: data.primaryColor ?? null,
        secondaryColor: data.secondaryColor ?? null,
        accentColor: data.accentColor ?? null,
        companyName: data.companyName ?? null,
        supportEmail: data.supportEmail ?? null,
        termsUrl: data.termsUrl ?? null,
        privacyUrl: data.privacyUrl ?? null,
        customDomain: data.customDomain ?? null,
        emailTemplateHeader: data.emailTemplateHeader ?? null,
        emailTemplateFooter: data.emailTemplateFooter ?? null,
        allowedDomains: data.allowedDomains ?? [],
      }).returning()
      return reply.send(created)
    }

    const [updated] = await db.update(brandSettings)
      .set({
        name: data.name,
        logoUrl: data.logoUrl ?? null,
        faviconUrl: data.faviconUrl ?? null,
        primaryColor: data.primaryColor ?? null,
        secondaryColor: data.secondaryColor ?? null,
        accentColor: data.accentColor ?? null,
        companyName: data.companyName ?? null,
        supportEmail: data.supportEmail ?? null,
        termsUrl: data.termsUrl ?? null,
        privacyUrl: data.privacyUrl ?? null,
        customDomain: data.customDomain ?? null,
        emailTemplateHeader: data.emailTemplateHeader ?? null,
        emailTemplateFooter: data.emailTemplateFooter ?? null,
        allowedDomains: data.allowedDomains ?? [],
        updatedAt: new Date(),
      })
      .where(eq(brandSettings.id, existing.id))
      .returning()

    return reply.send(updated)
  })

  /**
   * GET /api/branding/preview — Public
   * Returns brand settings as CSS custom properties for live preview
   */
  app.get('/preview', async () => {
    const settings = await getOrCreateBrandSettings()
    return {
      cssVariables: {
        '--brand-primary': settings.primaryColor || '#2563EB',
        '--brand-secondary': settings.secondaryColor || '#6366F1',
        '--brand-accent': settings.accentColor || '#06B6D4',
        '--brand-logo-url': settings.logoUrl ? `url(${settings.logoUrl})` : 'none',
        '--brand-company-name': `"${settings.companyName || settings.name}"`,
      },
      settings: {
        name: settings.name,
        companyName: settings.companyName,
        logoUrl: settings.logoUrl,
        supportEmail: settings.supportEmail,
        termsUrl: settings.termsUrl,
        privacyUrl: settings.privacyUrl,
      },
    }
  })
}
