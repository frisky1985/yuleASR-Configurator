import * as crypto from 'node:crypto';

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

// ── Validation Schemas ────────────────────────────────────────────────────

const validateSchema = z.object({
  key: z.string().regex(/^YULE-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, 'Invalid license key format'),
});

const activateSchema = z.object({
  key: z.string().regex(/^YULE-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, 'Invalid license key format'),
});

// ── Feature definitions per tier ──────────────────────────────────────────

export const FEATURE_DEFINITIONS: Record<
  string,
  { name: string; free: boolean | number; pro: boolean | number }
> = {
  maxModules: { name: 'maxModules', free: 5, pro: 9999 },
  maxProjects: { name: 'maxProjects', free: 1, pro: 9999 },
  arxmlExport: { name: 'arxmlExport', free: false, pro: true },
  codeGen: { name: 'codeGen', free: true, pro: true },
  vscodeExtension: { name: 'vscodeExtension', free: false, pro: true },
  templateMarketUpload: { name: 'templateMarketUpload', free: false, pro: true },
};

function getFeaturesForTier(tier: string) {
  const features: Record<string, boolean | number> = {};
  for (const [, def] of Object.entries(FEATURE_DEFINITIONS)) {
    features[def.name] = tier === 'pro' ? def.pro : def.free;
  }
  return features;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function generateLicenseKey(): string {
  const part = () => crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 4);
  return `YULE-${part()}-${part()}-${part()}`;
}

// ── Routes ────────────────────────────────────────────────────────────────

export async function licenseRoutes(app: FastifyInstance) {
  /**
   * POST /api/license/validate
   * Validate a license key and return tier + feature permissions.
   */
  app.post('/validate', async (request, reply) => {
    const parsed = validateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() });
    }

    const { key } = parsed.data;
    const { prisma } = await import('../lib/prisma.js');

    const license = await prisma.licenseKey.findUnique({ where: { key } });
    if (!license) {
      return reply.status(404).send({ message: 'License key not found' });
    }

    if (!license.active) {
      return reply.status(403).send({ message: 'License key is deactivated' });
    }

    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      return reply.status(403).send({ message: 'License key has expired' });
    }

    return {
      tier: license.tier,
      maxModules: license.maxModules,
      maxProjects: license.maxProjects,
      expiresAt: license.expiresAt,
      features: getFeaturesForTier(license.tier),
    };
  });

  /**
   * POST /api/license/activate
   * Activate a license key and bind it to the currently authenticated user.
   */
  app.post('/activate', { onRequest: [(app as any).authenticate] }, async (request, reply) => {
    const parsed = activateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() });
    }

    const { key } = parsed.data;
    const userId = (request.user as { id: number }).id;
    const { prisma } = await import('../lib/prisma.js');

    const license = await prisma.licenseKey.findUnique({ where: { key } });
    if (!license) {
      return reply.status(404).send({ message: 'License key not found' });
    }

    if (!license.active) {
      return reply.status(403).send({ message: 'License key is deactivated' });
    }

    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      return reply.status(403).send({ message: 'License key has expired' });
    }

    if (license.userId && license.userId !== userId) {
      return reply.status(409).send({ message: 'License key is already bound to another user' });
    }

    // Bind the license to the current user
    const updated = await prisma.licenseKey.update({
      where: { id: license.id },
      data: { userId },
    });

    return {
      message: 'License activated successfully',
      tier: updated.tier,
      maxModules: updated.maxModules,
      maxProjects: updated.maxProjects,
      expiresAt: updated.expiresAt,
      features: getFeaturesForTier(updated.tier),
    };
  });

  /**
   * GET /api/license/status
   * Get the current user's active license status (from their bound key or default free).
   */
  app.get('/status', { onRequest: [(app as any).authenticate] }, async request => {
    const userId = (request.user as { id: number }).id;
    const { prisma } = await import('../lib/prisma.js');

    const license = await prisma.licenseKey.findFirst({
      where: { userId, active: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!license) {
      return {
        tier: 'free',
        maxModules: 5,
        maxProjects: 1,
        expiresAt: null,
        features: getFeaturesForTier('free'),
      };
    }

    const expired = license.expiresAt && new Date(license.expiresAt) < new Date();
    if (expired) {
      return {
        tier: 'free',
        maxModules: 5,
        maxProjects: 1,
        expiresAt: null,
        features: getFeaturesForTier('free'),
        message: 'License expired, falling back to free tier',
      };
    }

    return {
      tier: license.tier,
      maxModules: license.maxModules,
      maxProjects: license.maxProjects,
      expiresAt: license.expiresAt,
      features: getFeaturesForTier(license.tier),
    };
  });
}

// Export helpers for seeding / testing
export { generateLicenseKey };
