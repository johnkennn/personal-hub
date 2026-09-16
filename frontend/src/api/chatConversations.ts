import { request } from './request'
import type { ApiResponse } from '../types/api'
import type { ChatMessage } from '../utils/chatStorage'

export type CloudConversationSummary = {
  id: number
  title: string
  createdAt: number
  updatedAt: number
  messageCount: number
}

export type CloudConversationDetail = {
  id: number
  title: string
  createdAt: number
  updatedAt: number
  messages: ChatMessage[]
}

function unwrap<T>(body: ApiResponse<T>, fallbackMsg: string): T {
  if (body.code !== 0 && body.code !== 200) {
    throw new Error(body.message || fallbackMsg)
  }
  if (body.data == null) {
    throw new Error(fallbackMsg)
  }
  return body.data
}

export async function listCloudConversations(
  signal?: AbortSignal,
): Promise<CloudConversationSummary[]> {
  const res = await request.get<ApiResponse<CloudConversationSummary[]>>(
    '/api/chat/conversations',
    { signal },
  )
  return unwrap(res.data, '读取会话列表失败')
}

export async function createCloudConversation(
  title?: string,
): Promise<CloudConversationDetail> {
  const res = await request.post<ApiResponse<CloudConversationDetail>>(
    '/api/chat/conversations',
    title ? { title } : {},
  )
  return unwrap(res.data, '创建会话失败')
}

export async function getCloudConversation(
  id: number,
  signal?: AbortSignal,
): Promise<CloudConversationDetail> {
  const res = await request.get<ApiResponse<CloudConversationDetail>>(
    `/api/chat/conversations/${id}`,
    { signal },
  )
  return unwrap(res.data, '读取会话失败')
}

export async function renameCloudConversation(
  id: number,
  title: string,
): Promise<CloudConversationSummary> {
  const res = await request.put<ApiResponse<CloudConversationSummary>>(
    `/api/chat/conversations/${id}`,
    { title },
  )
  return unwrap(res.data, '重命名失败')
}

export async function deleteCloudConversation(id: number): Promise<void> {
  const res = await request.delete<ApiResponse<null>>(
    `/api/chat/conversations/${id}`,
  )
  if (res.data.code !== 0 && res.data.code !== 200) {
    throw new Error(res.data.message || '删除会话失败')
  }
}

export async function replaceCloudMessages(
  id: number,
  messages: ChatMessage[],
): Promise<CloudConversationDetail> {
  const res = await request.put<ApiResponse<CloudConversationDetail>>(
    `/api/chat/conversations/${id}/messages`,
    { messages },
    { timeout: 30_000 },
  )
  return unwrap(res.data, '保存会话失败')
}

/** 增量写入：有则更新 payload，无则追加（需后端 upsert 接口） */
export async function upsertCloudMessages(
  id: number,
  messages: ChatMessage[],
): Promise<CloudConversationDetail> {
  const res = await request.post<ApiResponse<CloudConversationDetail>>(
    `/api/chat/conversations/${id}/messages`,
    { messages },
    { timeout: 30_000 },
  )
  return unwrap(res.data, '保存会话失败')
}
