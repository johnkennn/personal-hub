import { request } from './request'
import type { ApiResponse } from '../types/api'
import type { Article } from '../types/article'

/** 管理台：已发布文章列表（不含他人草稿） */
export function fetchAdminArticles() {
  return request.get<ApiResponse<Article[]>>('/api/admin/articles')
}

export function unpublishAdminArticle(id: number) {
  return request.post<ApiResponse<Article>>(`/api/admin/articles/${id}/unpublish`)
}
