/**
 * BSW Template type definitions for yuleasr-web
 */

export type TemplateCategory = 'mcal' | 'ecual' | 'service' | 'full' | 'bsw'
export type TemplateStatus = 'draft' | 'published' | 'rejected' | 'archived'
export type TemplateVisibility = 'public' | 'private' | 'team'
export type TemplateLayer = 'MCAL' | 'ECUAL' | 'Service' | 'RTE'

export interface TemplateModule {
  id: string
  name: string
  layer: TemplateLayer
  parameters?: Record<string, unknown>
}

export interface BSWTemplateAuthor {
  id: number
  username: string
  avatar?: string | null
}

export interface BSWTemplate {
  id: number
  name: string
  description: string
  category: TemplateCategory
  tags: string[]
  moduleType?: string | null
  modules: TemplateModule[]
  configData?: string | null
  version: number
  downloads: number
  rating: number
  isPublic: boolean
  status: TemplateStatus
  visibility: TemplateVisibility
  isOfficial: boolean
  minTier: 'free' | 'pro'
  downloadCount: number
  viewCount: number
  favoriteCount: number
  authorId: number
  author: BSWTemplateAuthor
  reviewedById?: number | null
  reviewedBy?: BSWTemplateAuthor | null
  latestVersionId?: number | null
  createdAt: string
  updatedAt: string
  versions?: BSWTemplateVersion[]
}

export interface BSWTemplateVersion {
  id: number
  templateId: number
  version: number
  name: string
  description: string
  modules: TemplateModule[]
  configData?: string | null
  changelog?: string | null
  createdAt: string
}

export interface BSWTemplateUpload {
  name: string
  description: string
  category: TemplateCategory
  tags?: string[]
  icon?: string
  moduleType?: string
  modules?: TemplateModule[]
  configData?: unknown
  isPublic?: boolean
  visibility?: TemplateVisibility
  minTier?: 'free' | 'pro'
}

export interface PaginatedTemplateResult {
  data: BSWTemplate[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
