export interface Article {
  id: number
  title: string
  content: string
  published: boolean
  authorId?: number
  coverUrl?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

  export interface ArticleCreateRequest {
    title: string
    content: string
    published?: boolean
  }

  export interface ArticleUpdateRequest {
    title: string
    content: string
    published: boolean
  }