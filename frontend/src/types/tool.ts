/** 与后端 ToolResponse / ToolCategory 对齐 */
export type ToolCategoryDto = {
  id: number
  name: string
  slug: string
  sortOrder: number
}

export type ToolDto = {
  id: number
  slug: string
  name: string
  categoryId: number
  categoryName: string | null
  categorySlug: string | null
  summary: string
  intro: string
  audience: string | null
  pricing: string
  websiteUrl: string
  logoUrl: string | null
  affiliateUrl: string | null
  keywordsJson: string | null
  tagsJson: string | null
  useCasesJson: string | null
  prosJson: string | null
  consJson: string | null
  featured: boolean
  weight: number
  published: boolean
  createdAt: string
  updatedAt: string
}

/** 前台统一视图（列表/详情/检索共用） */
export type HubTool = {
  slug: string
  name: string
  category: string
  categorySlug: string
  keywords: string[]
  summary: string
  intro: string
  audience: string
  useCases: string[]
  pricing: string
  tags: string[]
  pros: string[]
  cons: string[]
  websiteUrl: string
  logoUrl?: string | null
  featured: boolean
}
