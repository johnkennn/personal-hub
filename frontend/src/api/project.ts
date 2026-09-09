import { request } from './request'
import type { ApiResponse } from '../types/api'
import type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from '../types/project'
import type { ProjectMedia } from '../types/projectMedia'

export function fetchProjects() {
  return request.get<ApiResponse<Project[]>>('/api/projects')
}

export function fetchProjectById(id: number | string) {
  return request.get<ApiResponse<Project>>(`/api/projects/${id}`)
}

export function createProject(data: ProjectCreateRequest) {
  return request.post<ApiResponse<Project>>('/api/projects', data)
}

export function fetchProjectForManage(id: number | string) {
  return request.get<ApiResponse<Project>>(`/api/projects/${id}/manage`)
}

export function updateProject(id: number | string, data: ProjectUpdateRequest) {
  return request.put<ApiResponse<Project>>(`/api/projects/${id}`, data)
}

export function deleteProject(id: number | string) {
  return request.delete<ApiResponse<null>>(`/api/projects/${id}`)
}

export function fetchAllProjects() {
  return request.get<ApiResponse<Project[]>>('/api/projects/manage')
}

export function fetchMyProjectDrafts() {
  return request.get<ApiResponse<Project[]>>('/api/me/projects/drafts')
}

export function fetchMyProjectPublished() {
  return request.get<ApiResponse<Project[]>>('/api/me/projects/published')
}

export function batchPublishMyProjects(ids: number[]) {
  return request.post<ApiResponse<{ affected: number }>>('/api/me/projects/batch-publish', {
    ids,
  })
}

export function batchUnpublishMyProjects(ids: number[]) {
  return request.post<ApiResponse<{ affected: number }>>('/api/me/projects/batch-unpublish', {
    ids,
  })
}

export function batchDeleteMyProjects(ids: number[]) {
  return request.post<ApiResponse<{ affected: number }>>('/api/me/projects/batch-delete', {
    ids,
  })
}

export function uploadProjectCover(id: number | string, file: File) {
  const form = new FormData()
  form.append('file', file, file.name)
  return request.post<ApiResponse<Project>>(`/api/me/projects/${id}/cover`, form)
}

export function fetchProjectMedia(projectId: number | string) {
  return request.get<ApiResponse<ProjectMedia[]>>(`/api/projects/${projectId}/media`)
}

/** 草稿编辑：作者可读自己的画廊（含未发布） */
export function fetchMyProjectMedia(projectId: number | string) {
  return request.get<ApiResponse<ProjectMedia[]>>(`/api/me/projects/${projectId}/media`)
}

export function uploadProjectMedia(projectId: number | string, file: File) {
  const form = new FormData()
  form.append('file', file, file.name)
  return request.post<ApiResponse<ProjectMedia>>(`/api/me/projects/${projectId}/media`, form)
}

export function deleteProjectMedia(projectId: number | string, mediaId: number | string) {
  return request.delete<ApiResponse<null>>(`/api/me/projects/${projectId}/media/${mediaId}`)
}
