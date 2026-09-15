import { getToken } from '../utils/authStorage'
import type { LlmRouteDto } from '../services/chatRouter'
import type { ApiResponse } from '../types/api'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/**
 * 调用后端 LLM 意图路由（模糊句才用）。
 * 失败时由调用方回退到本地规则。
 */
export async function fetchChatRoute(
  message: string,
  signal?: AbortSignal,
): Promise<LlmRouteDto> {
  const token = getToken()
  const res = await fetch(`${baseURL}/api/chat/route`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message }),
    signal,
  })

  if (!res.ok) {
    throw new Error(`路由请求失败（HTTP ${res.status}）`)
  }

  const body = (await res.json()) as ApiResponse<LlmRouteDto>
  if (body.code !== 0 && body.code !== 200) {
    throw new Error(body.message || '意图路由失败')
  }
  if (!body.data?.intent) {
    throw new Error('意图路由未返回 intent')
  }
  return body.data
}
