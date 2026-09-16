export interface Article {
  id: number
  title: string
  content: string
  published: boolean
  authorId?: number
  coverUrl?: string | null
  /** 可选：关联项目 */
  relatedProjectId?: number | null
  /** 关联 AI 工具 slug */
  relatedToolSlugs?: string[]
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface ArticleCreateRequest {
  title: string
  content: string
  published?: boolean
  relatedProjectId?: number | null
  relatedToolSlugs?: string[]
}

export interface ArticleUpdateRequest {
  title: string
  content: string
  published: boolean
  relatedProjectId?: number | null
  relatedToolSlugs?: string[]
}
