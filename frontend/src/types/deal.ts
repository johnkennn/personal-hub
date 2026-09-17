/** AI 优惠（与后端 DealResponse 对齐） */
export type DealStatus = 'DRAFT' | 'ACTIVE' | 'ENDED' | 'OFFLINE'

export type DealDto = {
  id: number
  title: string
  description: string
  promoCode: string | null
  /** 活动链接；空则前台不展示 */
  url: string | null
  startsAt: string
  endsAt: string
  status: DealStatus
  toolId: number | null
  toolSlug: string | null
  toolName: string | null
  /** 关联产品 Logo（来自 tool.logo_url） */
  toolLogoUrl?: string | null
  createdAt?: string
  updatedAt?: string
}

export type DealUpsertBody = {
  title: string
  description: string
  promoCode?: string | null
  url?: string | null
  startsAt: string
  endsAt: string
  status: DealStatus
  /** 必填：关联 AI 产品（卡片展示其 Logo） */
  toolId: number
}
