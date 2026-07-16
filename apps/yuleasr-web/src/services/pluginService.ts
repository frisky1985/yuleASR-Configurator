/**
 * Plugin API Service — communicates with the API server plugin management endpoints.
 *
 * API routes (from @yuletech/api-server):
 *   GET    /v1/api/plugins              → PluginMeta[]
 *   GET    /v1/api/plugins/:id          → PluginMeta
 *   PUT    /v1/api/plugins/:id/config   → { ok: boolean }
 *   POST   /v1/api/plugins/:id/toggle   → { ok: boolean, enabled: boolean }
 */

import { api } from './api'
import type { PluginMeta, ToggleResponse } from '@/types/plugin'

const BASE = '/v1/api/plugins'

/**
 * Fetch all installed plugins.
 */
export async function fetchPlugins(): Promise<PluginMeta[]> {
  return api.get<PluginMeta[]>(BASE)
}

/**
 * Fetch a single plugin by its id.
 */
export async function fetchPlugin(id: string): Promise<PluginMeta> {
  return api.get<PluginMeta>(`${BASE}/${encodeURIComponent(id)}`)
}

/**
 * Update a plugin's configuration.
 */
export async function updatePluginConfig(
  id: string,
  config: Record<string, unknown>,
): Promise<{ ok: boolean }> {
  return api.put<{ ok: boolean }>(`${BASE}/${encodeURIComponent(id)}/config`, { config })
}

/**
 * Enable or disable a plugin.
 */
export async function togglePlugin(
  id: string,
  enabled: boolean,
): Promise<ToggleResponse> {
  return api.post<ToggleResponse>(`${BASE}/${encodeURIComponent(id)}/toggle`, { enabled })
}
