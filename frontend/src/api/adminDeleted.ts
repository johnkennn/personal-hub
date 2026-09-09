import { request } from './request'
import type { ApiResponse } from '../types/api'
import type { ProjectMedia } from '../types/projectMedia'

export type AdminDeletedContent = {
  id: number
  title: string
  authorId: number
  authorName: string
  deletedAt: string
  purgeAt: string
  retainDays: number
  published?: boolean | null
  coverUrl?: string | null
  body?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  relatedProjectId?: number | null
  techStack?: string | null
  repoUrl?: string | null
  demoUrl?: string | null
}

export function fetchAdminDeletedArticles() {
  return request.get<ApiResponse<AdminDeletedContent[]>>('/api/admin/articles/deleted')
}

export function fetchAdminDeletedArticle(id: number | string) {
  return request.get<ApiResponse<AdminDeletedContent>>(`/api/admin/articles/deleted/${id}`)
}

export function restoreAdminDeletedArticle(id: number | string) {
  return request.post<ApiResponse<AdminDeletedContent>>(`/api/admin/articles/deleted/${id}/restore`)
}

export function purgeAdminDeletedArticle(id: number | string) {
  return request.post<ApiResponse<null>>(`/api/admin/articles/deleted/${id}/purge`)
}

export function fetchAdminDeletedProjects() {
  return request.get<ApiResponse<AdminDeletedContent[]>>('/api/admin/projects/deleted')
}

export function fetchAdminDeletedProject(id: number | string) {
  return request.get<ApiResponse<AdminDeletedContent>>(`/api/admin/projects/deleted/${id}`)
}

export function fetchAdminDeletedProjectMedia(id: number | string) {
  return request.get<ApiResponse<ProjectMedia[]>>(`/api/admin/projects/deleted/${id}/media`)
}

export function restoreAdminDeletedProject(id: number | string) {
  return request.post<ApiResponse<AdminDeletedContent>>(`/api/admin/projects/deleted/${id}/restore`)
}

export function purgeAdminDeletedProject(id: number | string) {
  return request.post<ApiResponse<null>>(`/api/admin/projects/deleted/${id}/purge`)
}
