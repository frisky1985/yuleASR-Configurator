/**
 * API client with automatic JWT token attachment and 401 redirect.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

interface ApiResponse<T = unknown> {
  data: T
  message?: string
}

class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown) {
    super(typeof body === 'object' && body !== null && 'message' in body
      ? (body as { message: string }).message
      : `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = localStorage.getItem('yuleasr_token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // Handle 401 — redirect to login
  if (response.status === 401) {
    localStorage.removeItem('yuleasr_token')
    localStorage.removeItem('yuleasr_user')
    window.location.href = '/login'
    throw new ApiError(401, { message: 'Unauthorized' })
  }

  let parsed: unknown
  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    parsed = await response.json()
  } else {
    const text = await response.text()
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = { message: text }
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, parsed)
  }

  // If API wraps response in { data, message }, unwrap data
  const apiResp = parsed as ApiResponse<T>
  if (apiResp && typeof apiResp === 'object' && 'data' in apiResp) {
    return apiResp.data as T
  }

  return parsed as T
}

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>('GET', path)
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>('POST', path, body)
  },

  put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>('PUT', path, body)
  },

  delete<T>(path: string): Promise<T> {
    return request<T>('DELETE', path)
  },
}

export { ApiError }
export type { ApiResponse }
