import { request } from './request'
import type { ApiResponse } from '../types/api'

/** 聊天临时附件上传结果（与后端推荐契约一致） */
export type ChatAttachmentDto = {
  id: string
  url: string
  originalName: string
  contentType: string
  sizeBytes: number
  expiresAt: string
}

/**
 * 上传到服务器临时目录（TTL 由后端控制）。
 * 接口未部署时会抛错，调用方应降级为仅本会话。
 */
export function uploadChatAttachment(file: File) {
  const form = new FormData()
  form.append('file', file, file.name)
  return request.post<ApiResponse<ChatAttachmentDto>>('/api/chat/attachments', form)
}
