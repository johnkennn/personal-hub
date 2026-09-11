import { request } from './request'
import type { ApiResponse } from '../types/api'
import type { ToolCategoryDto, ToolDto } from '../types/tool'

export function fetchToolCategories() {
  return request.get<ApiResponse<ToolCategoryDto[]>>('/api/tool-categories')
}

export function fetchTools(categorySlug?: string) {
  return request.get<ApiResponse<ToolDto[]>>('/api/tools', {
    params: categorySlug ? { category: categorySlug } : undefined,
  })
}

export function fetchToolBySlug(slug: string) {
  return request.get<ApiResponse<ToolDto>>(`/api/tools/${encodeURIComponent(slug)}`)
}
