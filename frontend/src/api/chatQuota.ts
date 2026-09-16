import { request } from './request'
import type { ApiResponse } from '../types/api'

export type ChatQuotaDto = {
  remainingQuota: number
  dailyQuota: number
  /** 配额开关关闭时可为 false；前端仍可展示「不限」 */
  quotaEnabled?: boolean
}

/** 打开小智页时拉取今日剩余额度（访客按 IP，登录按用户） */
export async function fetchChatQuota(signal?: AbortSignal): Promise<ChatQuotaDto> {
  const res = await request.get<ApiResponse<ChatQuotaDto>>('/api/chat/quota', { signal })
  const body = res.data
  if (body.code !== 0 && body.code !== 200) {
    throw new Error(body.message || '读取额度失败')
  }
  const data = body.data
  if (!data || !Number.isFinite(data.dailyQuota)) {
    throw new Error('额度数据不完整')
  }
  return data
}
