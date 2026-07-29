import { request } from './request'
import type { ApiResponse } from '../types/api'
import type { Article } from '../types/article'
import type { ArticleCreateRequest } from '../types/article'

export function createArticle(data: ArticleCreateRequest) {
  return request.post<ApiResponse<Article>>('/api/articles', data)
}
export function fetchArticles() {
  return request.get<ApiResponse<Article[]>>('/api/articles')
}

export function fetchArticleById(id: number | string) {
    return request.get<ApiResponse<Article>>(`/api/articles/${id}`)
  }