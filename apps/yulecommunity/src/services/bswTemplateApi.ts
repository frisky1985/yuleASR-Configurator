/**
 * BSW Template API service for yulecommunity.
 * Communicates with the backend /api/bsw-templates endpoints.
 */
import { apiClient, getApiToken } from './apiClient'
import type {
  BSWTemplate,
  BSWTemplateVersion,
  BSWTemplateUpload,
  BSWTemplateListParams,
  PaginatedTemplateResult,
} from '../types/bswTemplate'

const BASE_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta as Record<string, any>).env?.VITE_API_BASE_URL) ||
  'http://localhost:3002'

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const token = getApiToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let parsed: unknown
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    parsed = await response.json()
  } else {
    const text = await response.text()
    try { parsed = JSON.parse(text) } catch { parsed = { message: text } }
  }

  if (!response.ok) {
    throw new Error(
      typeof parsed === 'object' && parsed !== null && 'message' in parsed
        ? (parsed as { message: string }).message
        : `Request failed with status ${response.status}`,
    )
  }

  // Unwrap { data } envelope if present
  const env = parsed as { data?: T; message?: string }
  if (env && typeof env === 'object' && 'data' in env) {
    return env.data as T
  }

  return parsed as T
}

export const bswTemplateApi = {
  // ── List public templates ─────────────────────────────────────────────
  list(params?: BSWTemplateListParams): Promise<PaginatedTemplateResult> {
    const q = new URLSearchParams()
    if (params?.category) q.set('category', params.category)
    if (params?.search) q.set('search', params.search)
    if (params?.tag) q.set('tag', params.tag)
    if (params?.sortBy) q.set('sortBy', params.sortBy)
    if (params?.sortOrder) q.set('sortOrder', params.sortOrder)
    if (params?.page) q.set('page', String(params.page))
    if (params?.pageSize) q.set('pageSize', String(params.pageSize))
    if (params?.authorId) q.set('authorId', String(params.authorId))
    const qs = q.toString()
    return request<PaginatedTemplateResult>('GET', `/api/bsw-templates${qs ? `?${qs}` : ''}`)
  },

  // ── Get template detail ───────────────────────────────────────────────
  get(id: number): Promise<BSWTemplate> {
    return request<BSWTemplate>('GET', `/api/bsw-templates/${id}`)
  },

  // ── Get my templates ──────────────────────────────────────────────────
  getMy(): Promise<BSWTemplate[]> {
    return request<BSWTemplate[]>('GET', '/api/bsw-templates/my')
  },

  // ── Create template (Pro only) ────────────────────────────────────────
  create(data: BSWTemplateUpload): Promise<BSWTemplate> {
    return request<BSWTemplate>('POST', '/api/bsw-templates', data)
  },

  // ── Update template ────────────────────────────────────────────────────
  update(id: number, data: Partial<BSWTemplateUpload>): Promise<BSWTemplate> {
    return request<BSWTemplate>('PUT', `/api/bsw-templates/${id}`, data)
  },

  // ── Delete template ────────────────────────────────────────────────────
  remove(id: number): Promise<void> {
    return request<void>('DELETE', `/api/bsw-templates/${id}`)
  },

  // ── List template versions ────────────────────────────────────────────
  getVersions(templateId: number): Promise<BSWTemplateVersion[]> {
    return request<BSWTemplateVersion[]>('GET', `/api/bsw-templates/${templateId}/versions`)
  },

  // ── Get specific version ──────────────────────────────────────────────
  getVersion(templateId: number, versionId: number): Promise<BSWTemplateVersion> {
    return request<BSWTemplateVersion>('GET', `/api/bsw-templates/${templateId}/versions/${versionId}`)
  },

  // ── Create new version ────────────────────────────────────────────────
  createVersion(
    templateId: number,
    data: { name?: string; description?: string; modules?: unknown[]; configData?: unknown; changelog?: string },
  ): Promise<BSWTemplateVersion> {
    return request<BSWTemplateVersion>('POST', `/api/bsw-templates/${templateId}/versions`, data)
  },

  // ── Download (increment count) ────────────────────────────────────────
  download(templateId: number): Promise<{ downloadCount: number }> {
    return request<{ downloadCount: number }>('POST', `/api/bsw-templates/${templateId}/download`)
  },

  // ── Admin: list all templates ─────────────────────────────────────────
  adminList(params?: { status?: string; page?: number; pageSize?: number }): Promise<PaginatedTemplateResult> {
    const q = new URLSearchParams()
    if (params?.status) q.set('status', params.status)
    if (params?.page) q.set('page', String(params.page))
    if (params?.pageSize) q.set('pageSize', String(params.pageSize))
    const qs = q.toString()
    return request<PaginatedTemplateResult>('GET', `/api/bsw-templates/admin/list${qs ? `?${qs}` : ''}`)
  },

  // ── Admin: update status ──────────────────────────────────────────────
  updateStatus(id: number, status: string, reviewNote?: string): Promise<BSWTemplate> {
    return request<BSWTemplate>('PUT', `/api/bsw-templates/${id}/status`, { status, reviewNote })
  },
}

export default bswTemplateApi
