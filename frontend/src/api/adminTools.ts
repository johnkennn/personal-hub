import { request } from './request'
import type { ApiResponse } from '../types/api'
import type { ToolCategoryDto, ToolDto } from '../types/tool'

export type AdminToolUpsertBody = {
  slug: string
  name: string
  categoryId: number
  summary: string
  intro: string
  audience?: string | null
  pricing: string
  websiteUrl: string
  affiliateUrl?: string | null
  keywordsJson?: string | null
  tagsJson?: string | null
  useCasesJson?: string | null
  prosJson?: string | null
  consJson?: string | null
  featured?: boolean
  weight?: number
  published?: boolean
}

export type AdminCategoryUpsertBody = {
  name: string
  slug: string
  sortOrder: number
}

export function fetchAdminTools() {
  return request.get<ApiResponse<ToolDto[]>>('/api/admin/tools')
}

export function fetchAdminTool(id: number) {
  return request.get<ApiResponse<ToolDto>>(`/api/admin/tools/${id}`)
}

export function createAdminTool(body: AdminToolUpsertBody) {
  return request.post<ApiResponse<ToolDto>>('/api/admin/tools', body)
}

export function updateAdminTool(id: number, body: AdminToolUpsertBody) {
  return request.put<ApiResponse<ToolDto>>(`/api/admin/tools/${id}`, body)
}

export function unpublishAdminTool(id: number) {
  return request.post<ApiResponse<ToolDto>>(`/api/admin/tools/${id}/unpublish`)
}

export function deleteAdminTool(id: number) {
  return request.delete<ApiResponse<null>>(`/api/admin/tools/${id}`)
}

export function fetchAdminToolCategories() {
  return request.get<ApiResponse<ToolCategoryDto[]>>('/api/admin/tool-categories')
}

export function createAdminToolCategory(body: AdminCategoryUpsertBody) {
  return request.post<ApiResponse<ToolCategoryDto>>('/api/admin/tool-categories', body)
}

export function updateAdminToolCategory(id: number, body: AdminCategoryUpsertBody) {
  return request.put<ApiResponse<ToolCategoryDto>>(`/api/admin/tool-categories/${id}`, body)
}

export function deleteAdminToolCategory(id: number) {
  return request.delete<ApiResponse<null>>(`/api/admin/tool-categories/${id}`)
}
