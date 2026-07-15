/**
 * API client for yuleCommunity backend integration.
 * Provides typed fetch-based calls to the backend API server.
 *
 * Base URL is configurable via VITE_API_BASE_URL env var or the default.
 */

const BASE_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta as Record<string, any>).env?.VITE_API_BASE_URL) ||
  'http://localhost:3002/api'

// ---------------------------------------------------------------------------
// Types — aligned with existing data types in @/types/blog and the API server
// ---------------------------------------------------------------------------

/** Minimal user returned by auth endpoints */
export interface AuthUser {
  id: number
  email: string
  username: string
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

export interface UserProfile {
  id: number
  email: string
  username: string
}

// ---- Forum types (matches GET /api/posts and GET /api/posts/:id) ---------

export interface ForumPostSummary {
  id: number
  userId: number
  configId: number | null
  title: string
  content: string
  tags: string[]
  status: string
  username: string
  createdAt: string
  updatedAt: string
}

export interface ForumComment {
  id: number
  postId: number
  userId: number
  content: string
  username: string
  createdAt: string
}

export interface ForumPostDetail extends ForumPostSummary {
  comments: ForumComment[]
}

export interface ForumTag {
  id: number
  name: string
  postCount: number
}

// ---- Blog types (aligns with @/types/blog) ------------------------------

export interface BlogAuthor {
  id: string
  name: string
  avatar: string
  role: string
  bio?: string
}

export interface BlogSEO {
  title: string
  description: string
  keywords: string[]
  ogImage?: string
}

export type BlogCategory =
  | 'MCAL'
  | 'ECUAL'
  | 'Service'
  | '工具链'
  | '功能安全'
  | '架构设计'
  | '全部'

export interface BlogPost {
  id: string
  title: string
  slug: string
  description: string
  content: string
  author: BlogAuthor
  publishDate: string
  updatedAt?: string
  readTime: number
  viewCount: number
  likeCount: number
  commentCount: number
  tags: string[]
  category: BlogCategory
  isHot: boolean
  coverImage?: string
  seo: BlogSEO
}

export interface BlogCommentItem {
  id: string
  articleId: string
  content: string
  author: { id: string; name: string; avatar: string }
  likes: number
  likedBy: string[]
  parentId?: string
  createdAt: string
  updatedAt?: string
}

export interface BlogTagItem {
  name: string
  articleCount: number
  color?: string
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ArticleQueryParams {
  category?: BlogCategory
  tag?: string
  search?: string
  page?: number
  pageSize?: number
  sortBy?: 'date' | 'views' | 'likes'
  sortOrder?: 'asc' | 'desc'
}

// ---- Auth request types --------------------------------------------------

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
}

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

export class ApiClientError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown) {
    super(
      typeof body === 'object' &&
        body !== null &&
        'message' in (body as Record<string, unknown>)
        ? (body as { message: string }).message
        : `API request failed with status ${status}`,
    )
    this.name = 'ApiClientError'
    this.status = status
    this.body = body
  }
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

let _token: string | null = null

/** Set or clear the auth token for subsequent requests. */
export function setApiToken(token: string | null) {
  _token = token
}

/** Retrieve the current auth token. */
export function getApiToken(): string | null {
  return _token
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (_token) {
    headers['Authorization'] = `Bearer ${_token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // Parse response body
  let parsed: unknown
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
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
    throw new ApiClientError(response.status, parsed)
  }

  // Unwrap { data, message } envelope if present
  const env = parsed as { data?: T; message?: string }
  if (env && typeof env === 'object' && 'data' in env) {
    return env.data as T
  }

  return parsed as T
}

// ---------------------------------------------------------------------------
// API methods
// ---------------------------------------------------------------------------

export const apiClient = {
  // ---- Auth ---------------------------------------------------------------

  login(data: LoginRequest): Promise<AuthResponse> {
    return request<AuthResponse>('POST', '/auth/login', data)
  },

  register(data: RegisterRequest): Promise<AuthResponse> {
    return request<AuthResponse>('POST', '/auth/register', data)
  },

  getCurrentUser(): Promise<UserProfile> {
    return request<UserProfile>('GET', '/auth/me')
  },

  // ---- Forum posts --------------------------------------------------------

  getForumPosts(params?: {
    tag?: string
  }): Promise<ForumPostSummary[]> {
    const query = params?.tag ? `?tag=${encodeURIComponent(params.tag)}` : ''
    return request<ForumPostSummary[]>('GET', `/posts${query}`)
  },

  getForumPost(id: number | string): Promise<ForumPostDetail> {
    return request<ForumPostDetail>('GET', `/posts/${id}`)
  },

  getForumTags(): Promise<ForumTag[]> {
    return request<ForumTag[]>('GET', '/tags')
  },

  createForumPost(data: {
    title: string
    content: string
    tags?: string[]
    status?: 'draft' | 'published'
    configId?: number
  }): Promise<ForumPostSummary> {
    return request<ForumPostSummary>('POST', '/posts', data)
  },

  updateForumPost(
    id: number | string,
    data: {
      title?: string
      content?: string
      tags?: string[]
      status?: 'draft' | 'published'
    },
  ): Promise<ForumPostSummary> {
    return request<ForumPostSummary>('PUT', `/posts/${id}`, data)
  },

  deleteForumPost(id: number | string): Promise<void> {
    return request<void>('DELETE', `/posts/${id}`)
  },

  // ---- Blog posts (expected endpoints — backend may need implementing) ----

  getBlogPosts(params?: ArticleQueryParams): Promise<PaginatedResult<BlogPost>> {
    const query = new URLSearchParams()
    if (params?.category && params.category !== '全部') query.set('category', params.category)
    if (params?.tag) query.set('tag', params.tag)
    if (params?.search) query.set('search', params.search)
    if (params?.page) query.set('page', String(params.page))
    if (params?.pageSize) query.set('pageSize', String(params.pageSize))
    if (params?.sortBy) query.set('sortBy', params.sortBy)
    if (params?.sortOrder) query.set('sortOrder', params.sortOrder)
    const qs = query.toString()
    return request<PaginatedResult<BlogPost>>('GET', `/blog/posts${qs ? `?${qs}` : ''}`)
  },

  getBlogPost(slug: string): Promise<BlogPost> {
    return request<BlogPost>('GET', `/blog/posts/${slug}`)
  },

  getBlogTags(): Promise<BlogTagItem[]> {
    return request<BlogTagItem[]>('GET', '/blog/tags')
  },
}

export default apiClient
