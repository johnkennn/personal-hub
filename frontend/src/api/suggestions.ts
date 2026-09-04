import { request } from './request'
import type { ApiResponse } from '../types/api'

export interface SuggestionItem {
  id: number
  content: string
  createdAt: string
}

export interface AdminSuggestionItem extends SuggestionItem {
  userId: number
  userName: string
}

export function fetchMySuggestions() {
  return request.get<ApiResponse<SuggestionItem[]>>('/api/me/suggestions')
}

export function createSuggestion(content: string) {
  return request.post<ApiResponse<SuggestionItem>>('/api/me/suggestions', { content })
}

export function deleteMySuggestion(id: number) {
  return request.delete<ApiResponse<null>>(`/api/me/suggestions/${id}`)
}

export function fetchAdminSuggestions() {
  return request.get<ApiResponse<AdminSuggestionItem[]>>('/api/admin/suggestions')
}

export function deleteAdminSuggestion(id: number) {
  return request.delete<ApiResponse<null>>(`/api/admin/suggestions/${id}`)
}
