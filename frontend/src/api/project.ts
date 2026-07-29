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