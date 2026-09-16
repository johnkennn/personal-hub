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
  toolId?: number | null
}
