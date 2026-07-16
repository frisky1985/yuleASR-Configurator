/**
 * BSW Template service for yuleasr-web.
 */
import { api } from './api'
import type {
  BSWTemplate,
  BSWTemplateVersion,
  BSWTemplateUpload,
  PaginatedTemplateResult,
} from '../types/bswTemplate'

export const templateService = {
  /**
   * List public templates from the community market.
   */
  list(params?: {
    category?: string
    search?: string
    tag?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    page?: number
    pageSize?: number
  }): Promise<PaginatedTemplateResult> {
    const q = new URLSearchParams()
    if (params?.category) q.set('category', params.category)
    if (params?.search) q.set('search', params.search)
    if (params?.tag) q.set('tag', params.tag)
    if (params?.sortBy) q.set('sortBy', params.sortBy)
    if (params?.sortOrder) q.set('sortOrder', params.sortOrder)
    if (params?.page) q.set('page', String(params.page))
    if (params?.pageSize) q.set('pageSize', String(params.pageSize))
    const qs = q.toString()
    return api.get<PaginatedTemplateResult>(`/api/bsw-templates${qs ? `?${qs}` : ''}`)
  },

  /**
   * Get template detail.
   */
  get(id: number): Promise<BSWTemplate> {
    return api.get<BSWTemplate>(`/api/bsw-templates/${id}`)
  },

  /**
   * Create a new template (Pro only).
   */
  create(data: BSWTemplateUpload): Promise<BSWTemplate> {
    return api.post<BSWTemplate>('/api/bsw-templates', data)
  },

  /**
   * Update an existing template.
   */
  update(id: number, data: Partial<BSWTemplateUpload>): Promise<BSWTemplate> {
    return api.put<BSWTemplate>(`/api/bsw-templates/${id}`, data)
  },

  /**
   * Delete a template.
   */
  remove(id: number): Promise<void> {
    return api.delete(`/api/bsw-templates/${id}`)
  },

  /**
   * Get all versions of a template.
   */
  getVersions(templateId: number): Promise<BSWTemplateVersion[]> {
    return api.get<BSWTemplateVersion[]>(`/api/bsw-templates/${templateId}/versions`)
  },

  /**
   * Increment download count.
   */
  download(templateId: number): Promise<{ downloadCount: number }> {
    return api.post<{ downloadCount: number }>(`/api/bsw-templates/${templateId}/download`)
  },

  /**
   * Get templates belonging to the current user.
   */
  getMy(): Promise<BSWTemplate[]> {
    return api.get<BSWTemplate[]>('/api/bsw-templates/my')
  },
}

export type { BSWTemplate, BSWTemplateVersion, BSWTemplateUpload, PaginatedTemplateResult }
