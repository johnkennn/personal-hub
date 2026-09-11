import { request } from './request'
import type { ApiResponse } from '../types/api'

export type AiRunResponse = {
  text: string
  remainingQuota: number
  dailyQuota: number
}

export function runAiTool(slug: string, prompt: string) {
  return request.post<ApiResponse<AiRunResponse>>(
    `/api/ai-tools/${encodeURIComponent(slug)}/run`,
    { prompt },
    { timeout: 60_000 },
  )
}
