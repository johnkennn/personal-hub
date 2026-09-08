export interface Article {
  id: number
  title: string
  content: string
  published: boolean
  authorId?: number
  coverUrl?: string | null
  /** 可选：关联项目，用于展映页制作特辑 */
  relatedProjectId?: number | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface ArticleCreateRequest {
  title: string
  content: string
  published?: boolean
  relatedProjectId?: number | null
}

export interface ArticleUpdateRequest {
  title: string
  content: string
  published: boolean
  relatedProjectId?: number | null
}