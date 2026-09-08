import { request } from './request'
import type { ApiResponse } from '../types/api'
import type {
  Article,
  ArticleCreateRequest,
  ArticleUpdateRequest,
} from '../types/article'

export function createArticle(data: ArticleCreateRequest) {
  return request.post<ApiResponse<Article>>('/api/articles', data)
}
export function fetchArticles() {
  return request.get<ApiResponse<Article[]>>('/api/articles')
}

export function fetchArticleById(id: number | string) {
  return request.get<ApiResponse<Article>>(`/api/articles/${id}`)
}

export function fetchArticleForManage(id: number | string) {
  return request.get<ApiResponse<Article>>(`/api/articles/${id}/manage`)
}

/** 某项目下已发布的关联文章（制作特辑） */
export function fetchProjectRelatedArticles(projectId: number | string) {
  return request.get<ApiResponse<Article[]>>(`/api/projects/${projectId}/articles`)
}

export function updateArticle(id: number | string, data: ArticleUpdateRequest) {
  return request.put<ApiResponse<Article>>(`/api/articles/${id}`, data)
}

export function deleteArticle(id: number | string) {
  return request.delete<ApiResponse<null>>(`/api/articles/${id}`)
}

export function fetchAllArticles() {
  return request.get<ApiResponse<Article[]>>('/api/articles/manage')
}

export function fetchMyArticleDrafts() {
  return request.get<ApiResponse<Article[]>>('/api/me/articles/drafts')
}

export function fetchMyArticlePublished() {
  return request.get<ApiResponse<Article[]>>('/api/me/articles/published')
}

export function batchPublishMyArticles(ids: number[]) {
  return request.post<ApiResponse<{ affected: number }>>('/api/me/articles/batch-publish', {
    ids,
  })
}

export function batchUnpublishMyArticles(ids: number[]) {
  return request.post<ApiResponse<{ affected: number }>>('/api/me/articles/batch-unpublish', {
    ids,
  })
}

export function batchDeleteMyArticles(ids: number[]) {
  return request.post<ApiResponse<{ affected: number }>>('/api/me/articles/batch-delete', {
    ids,
  })
}

export function uploadArticleCover(id: number | string, file: File) {
  const form = new FormData()
  form.append('file', file)
  return request.post<ApiResponse<Article>>(`/api/me/articles/${id}/cover`, form)
}