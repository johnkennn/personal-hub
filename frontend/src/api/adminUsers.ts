import { request } from './request'
import type { ApiResponse } from '../types/api'
import type { AdminUser } from '../types/adminUser'

export function fetchAdminUsers() {
  return request.get<ApiResponse<AdminUser[]>>('/api/admin/users')
}

export function disableAdminUser(id: number) {
  return request.post<ApiResponse<AdminUser>>(`/api/admin/users/${id}/disable`)
}

export function enableAdminUser(id: number) {
  return request.post<ApiResponse<AdminUser>>(`/api/admin/users/${id}/enable`)
}
