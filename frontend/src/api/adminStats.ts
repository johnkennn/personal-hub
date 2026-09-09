import { request } from './request'
import type { ApiResponse } from '../types/api'

/** 与后端 AdminStatsResponse 字段对齐 */
export interface AdminStats {
  userTotal: number
  userDisabled: number
  articlePublished: number
  projectPublished: number
  commentActive: number
  suggestionTotal: number
  articleDeleted: number
  projectDeleted: number
}

export function fetchAdminStats() {
  return request.get<ApiResponse<AdminStats>>('/api/admin/stats')
}
