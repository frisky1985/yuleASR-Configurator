/**
 * Shared Config Gallery API service for yulecommunity.
 * Communicates with the backend /api/shared-configs endpoints.
 */
import { getApiToken } from './apiClient'
import type { SharedConfig, SharedConfigListParams } from '../types/bswTemplate'

const BASE_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta as Record<string, any>).env?.VITE_API_BASE_URL) ||
  'http://localhost:3002'

interface PaginatedSharedConfigs {
  data: SharedConfig[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

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

  const env = parsed as { data?: T; message?: string }
  if (env && typeof env === 'object' && 'data' in env) {
    return env.data as T
  }

  return parsed as T
}

export const sharedConfigApi = {
  list(params?: SharedConfigListParams): Promise<PaginatedSharedConfigs> {
    const q = new URLSearchParams()
    if (params?.search) q.set('search', params.search)
    if (params?.tag) q.set('tag', params.tag)
    if (params?.mcuType) q.set('mcuType', params.mcuType)
    if (params?.sortBy) q.set('sortBy', params.sortBy)
    if (params?.sortOrder) q.set('sortOrder', params.sortOrder)
    if (params?.page) q.set('page', String(params.page))
    if (params?.pageSize) q.set('pageSize', String(params.pageSize))
    const qs = q.toString()
    return request<PaginatedSharedConfigs>('GET', `/api/shared-configs${qs ? `?${qs}` : ''}`)
  },

  get(id: number): Promise<SharedConfig> {
    return request<SharedConfig>('GET', `/api/shared-configs/${id}`)
  },

  create(data: {
    name: string
    description?: string
    mcuType?: string
    modules?: any[]
    configData?: any
    screenshotUrl?: string
    tags?: string[]
  }): Promise<SharedConfig> {
    return request<SharedConfig>('POST', '/api/shared-configs', data)
  },

  remove(id: number): Promise<void> {
    return request<void>('DELETE', `/api/shared-configs/${id}`)
  },

  like(id: number): Promise<{ likeCount: number }> {
    return request<{ likeCount: number }>('POST', `/api/shared-configs/${id}/like`)
  },
}

export default sharedConfigApi
