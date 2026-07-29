import { request } from './request'
import type { ApiResponse } from '../types/api'
import type { Article } from '../types/article'

export function fetchArticles() {
  return request.get<ApiResponse<Article[]>>('/api/articles')
}

export function fetchArticleById(id: number | string) {
    return request.get<ApiResponse<Article>>(`/api/articles/${id}`)
  }