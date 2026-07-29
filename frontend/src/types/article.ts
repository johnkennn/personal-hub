  export interface Article {
    id: number
    title: string
    content: string
    published: boolean
    createdAt: string
    updatedAt: string
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