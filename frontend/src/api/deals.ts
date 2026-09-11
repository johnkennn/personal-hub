import { request } from './request'
import type { ApiResponse } from '../types/api'
import type { DealDto } from '../types/deal'

/** 公开：仅进行中的优惠 */
export function fetchActiveDeals() {
  return request.get<ApiResponse<DealDto[]>>('/api/deals')
}
