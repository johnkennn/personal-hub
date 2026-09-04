import { request } from './request'
import type { ApiResponse } from '../types/api'

export type ContentTargetType = 'ARTICLE' | 'PROJECT'

export interface CommentItem {
  id: number
  body: string
  createdAt: string
  updatedAt: string
  userId: number
  username: string
  targetType: ContentTargetType
  targetId: number
}

export interface LikeSummary {
  likeCount: number
  liked: boolean
}

function basePath(kind: 'article' | 'project', contentId: number) {
  return kind === 'article' ? `/api/articles/${contentId}` : `/api/projects/${contentId}`
}

export function fetchComments(kind: 'article' | 'project', contentId: number) {
  return request.get<ApiResponse<CommentItem[]>>(`${basePath(kind, contentId)}/comments`)
}

export function createComment(kind: 'article' | 'project', contentId: number, body: string) {
  return request.post<ApiResponse<CommentItem>>(`${basePath(kind, contentId)}/comments`, { body })
}

export function deleteMyComment(id: number) {
  return request.delete<ApiResponse<null>>(`/api/comments/${id}`)
}

export function deleteCommentAsAdmin(id: number) {
  return request.delete<ApiResponse<null>>(`/api/admin/comments/${id}`)
}

export function fetchLikeSummary(kind: 'article' | 'project', contentId: number) {
  return request.get<ApiResponse<LikeSummary>>(`${basePath(kind, contentId)}/like`)
}

export function likeContent(kind: 'article' | 'project', contentId: number) {
  return request.post<ApiResponse<LikeSummary>>(`${basePath(kind, contentId)}/like`)
}

export function unlikeContent(kind: 'article' | 'project', contentId: number) {
  return request.delete<ApiResponse<LikeSummary>>(`${basePath(kind, contentId)}/like`)
}
