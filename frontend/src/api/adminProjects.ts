import { request } from './request'
import type { ApiResponse } from '../types/api'
import type { Project } from '../types/project'

/** 管理台：已发布项目列表（不含他人草稿） */
export function fetchAdminProjects() {
  return request.get<ApiResponse<Project[]>>('/api/admin/projects')
}

export function unpublishAdminProject(id: number) {
  return request.post<ApiResponse<Project>>(`/api/admin/projects/${id}/unpublish`)
}
