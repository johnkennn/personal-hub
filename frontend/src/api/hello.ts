import { request } from './request'
import type { ApiResponse } from '../types/api'

export function fetchHello() {
  return request.get<ApiResponse<string>>('/api/hello')
}