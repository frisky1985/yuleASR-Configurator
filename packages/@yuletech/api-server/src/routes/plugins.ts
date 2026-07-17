/**
 * @yuletech/api-server — Plugin Management Routes
 *
 * GET    /v1/api/plugins            — List all installed plugins
 * GET    /v1/api/plugins/:id        — Get plugin details
 * PUT    /v1/api/plugins/:id/config — Update plugin configuration
 * POST   /v1/api/plugins/:id/toggle — Enable / disable a plugin
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

// ── Validation Schemas ────────────────────────────────────────────────────

const updateConfigSchema = z.object({
  config: z.record(z.unknown()),
});

const toggleSchema = z.object({
  enabled: z.boolean(),
});

// ── Route Registration ────────────────────────────────────────────────────

export async function pluginRoutes(app: FastifyInstance): Promise<void> {
  // Lazy-import core to avoid hard dependency at module level
  const { pluginManager } = await import('@yuletech/core');

  // GET /v1/api/plugins — List all installed plugins
  app.get('/', async (_request, reply) => {
    return reply.send(pluginManager.listPlugins());
  });

  // GET /v1/api/plugins/:id — Get plugin details
  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const meta = pluginManager.getPluginMeta(id);
    if (!meta) {
      return reply.status(404).send({ error: `Plugin "${id}" not found` });
    }
    return reply.send(meta);
  });

  // PUT /v1/api/plugins/:id/config — Update plugin configuration
  app.put<{ Params: { id: string } }>('/:id/config', async (request, reply) => {
    const { id } = request.params;

    const parsed = updateConfigSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid request body',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const updated = pluginManager.updateConfig(id, parsed.data.config);
    if (!updated) {
      return reply.status(404).send({ error: `Plugin "${id}" not found` });
    }
    return reply.send({ ok: true });
  });

  // POST /v1/api/plugins/:id/toggle — Enable / disable a plugin
  app.post<{ Params: { id: string } }>('/:id/toggle', async (request, reply) => {
    const { id } = request.params;

    const parsed = toggleSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid request body',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { enabled } = parsed.data;
    const result = await pluginManager.toggle(id, enabled);
    if (!result) {
      return reply.status(404).send({ error: `Plugin "${id}" not found` });
    }
    return reply.send({ ok: true, enabled });
  });
}
