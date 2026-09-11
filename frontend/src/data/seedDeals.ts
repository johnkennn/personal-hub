import type { DealDto } from '../types/deal'

/** API 未就绪时的演示数据（关联导览种子产品） */
export const SEED_DEALS: DealDto[] = [
  {
    id: -1,
    title: '豆包会员限时礼遇',
    description: '新用户开通会员可享限时折扣（演示条目，以官网活动为准）。',
    promoCode: null,
    url: 'https://www.doubao.com',
    startsAt: new Date(Date.now() - 86400000).toISOString(),
    endsAt: new Date(Date.now() + 14 * 86400000).toISOString(),
    status: 'ACTIVE',
    toolId: null,
    toolSlug: 'doubao',
    toolName: '豆包',
  },
  {
    id: -2,
    title: '通义千问云服务试用加码',
    description: '阿里云通义相关产品限时试用额度（演示条目）。',
    promoCode: 'QIANWEN-DEMO',
    url: 'https://tongyi.aliyun.com',
    startsAt: new Date(Date.now() - 86400000).toISOString(),
    endsAt: new Date(Date.now() + 21 * 86400000).toISOString(),
    status: 'ACTIVE',
    toolId: null,
    toolSlug: 'qwen',
    toolName: '通义千问',
  },
]
