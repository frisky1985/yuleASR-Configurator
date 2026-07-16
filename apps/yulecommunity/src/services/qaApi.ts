/**
 * QA API client for yuleCommunity Q&A system.
 */

const BASE_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta as Record<string, any>).env?.VITE_API_BASE_URL) ||
  'http://localhost:3002'

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = localStorage.getItem('yulecommunity_token') || localStorage.getItem('token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let parsed: unknown
  const ct = response.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    parsed = await response.json()
  } else {
    const text = await response.text()
    try { parsed = JSON.parse(text) } catch { parsed = { message: text } }
  }

  if (!response.ok) {
    throw new Error(typeof parsed === 'object' && parsed && 'message' in (parsed as any)
      ? (parsed as any).message : `Request failed with status ${response.status}`)
  }

  return parsed as T
}

export interface QAUser {
  id: number
  username: string
  avatar: string | null
}

export interface Question {
  id: number
  title: string
  content: string
  authorId: number
  author: QAUser
  tags: string[]
  viewCount: number
  likeCount: number
  answerCount: number
  acceptedAnswerId: number | null
  status: 'open' | 'resolved' | 'closed'
  createdAt: string
  updatedAt: string
  answers?: Answer[]
}

export interface Answer {
  id: number
  questionId: number
  authorId: number
  author: QAUser
  content: string
  isAccepted: boolean
  likeCount: number
  createdAt: string
  updatedAt: string
}

export interface PaginatedQuestions {
  data: Question[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface QuestionDetail extends Question {
  answers: Answer[]
}

export const qaApi = {
  getQuestions(params?: {
    page?: number; pageSize?: number; search?: string; tag?: string; status?: string; sort?: string
  }): Promise<PaginatedQuestions> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.pageSize) query.set('pageSize', String(params.pageSize))
    if (params?.search) query.set('search', params.search)
    if (params?.tag) query.set('tag', params.tag)
    if (params?.status) query.set('status', params.status)
    if (params?.sort) query.set('sort', params.sort)
    const qs = query.toString()
    return request<PaginatedQuestions>('GET', `/api/questions${qs ? `?${qs}` : ''}`)
  },

  getQuestion(id: number): Promise<QuestionDetail> {
    return request<QuestionDetail>('GET', `/api/questions/${id}`)
  },

  createQuestion(data: { title: string; content: string; tags?: string[] }): Promise<Question> {
    return request<Question>('POST', '/api/questions', data)
  },

  updateQuestion(id: number, data: { title?: string; content?: string; tags?: string[] }): Promise<Question> {
    return request<Question>('PUT', `/api/questions/${id}`, data)
  },

  deleteQuestion(id: number): Promise<void> {
    return request<void>('DELETE', `/api/questions/${id}`)
  },

  createAnswer(questionId: number, data: { content: string }): Promise<Answer> {
    return request<Answer>('POST', `/api/questions/${questionId}/answers`, data)
  },

  updateAnswer(id: number, data: { content: string }): Promise<Answer> {
    return request<Answer>('PUT', `/api/answers/${id}`, data)
  },

  acceptAnswer(id: number): Promise<void> {
    return request<void>('POST', `/api/answers/${id}/accept`)
  },

  vote(data: { targetType: 'question' | 'answer'; targetId: number; voteType: 'up' | 'down' }): Promise<{ action: string; voteType: string }> {
    return request('POST', '/api/vote', data)
  },
}

export default qaApi
