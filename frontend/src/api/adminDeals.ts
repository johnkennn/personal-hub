import { request } from './request'
import type { ApiResponse } from '../types/api'
import type { DealDto, DealUpsertBody } from '../types/deal'

export function fetchAdminDeals() {
  return request.get<ApiResponse<DealDto[]>>('/api/admin/deals')
}

export function createAdminDeal(body: DealUpsertBody) {
  return request.post<ApiResponse<DealDto>>('/api/admin/deals', body)
}

export function updateAdminDeal(id: number, body: DealUpsertBody) {
  return request.put<ApiResponse<DealDto>>(`/api/admin/deals/${id}`, body)
}

export function deleteAdminDeal(id: number) {
  return request.delete<ApiResponse<null>>(`/api/admin/deals/${id}`)
}
