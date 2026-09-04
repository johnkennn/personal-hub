import { request } from './request'
import type { ApiResponse } from '../types/api'
import type { PageResult } from '../types/page'
import type { Profile } from '../types/profile'
import type { Article } from '../types/article'
import type { Project } from '../types/project'
import type { UserSummary } from '../types/userSummary'

export function fetchPublicProfile(userId: number | string) {
  return request.get<ApiResponse<Profile>>(`/api/users/${userId}/profile`)
}

export function fetchUserArticles(userId: number | string) {
  return request.get<ApiResponse<Article[]>>(`/api/users/${userId}/articles`)
}

export function fetchUserProjects(userId: number | string) {
  return request.get<ApiResponse<Project[]>>(`/api/users/${userId}/projects`)
}

export function followUser(userId: number | string) {
  return request.post<ApiResponse<null>>(`/api/users/${userId}/follow`)
}

export function unfollowUser(userId: number | string) {
  return request.delete<ApiResponse<null>>(`/api/users/${userId}/follow`)
}

/** page 从 0 开始 */
export function fetchFollowers(userId: number | string, page = 0, size = 20) {
  return request.get<ApiResponse<PageResult<UserSummary>>>(`/api/users/${userId}/followers`, {
    params: { page, size },
  })
}

/** page 从 0 开始 */
export function fetchFollowing(userId: number | string, page = 0, size = 20) {
  return request.get<ApiResponse<PageResult<UserSummary>>>(`/api/users/${userId}/following`, {
    params: { page, size },
  })
}
