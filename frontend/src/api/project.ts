import { request } from './request'
import type { ApiResponse } from '../types/api'
import type { Project, ProjectCreateRequest } from '../types/project'

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