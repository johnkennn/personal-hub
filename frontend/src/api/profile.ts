import { request } from './request'
import type { ApiResponse } from '../types/api'
import type { Profile, ProfileUpdateRequest } from '../types/profile'

export function fetchMyProfile() {
  return request.get<ApiResponse<Profile>>('/api/me/profile')
}

export function updateMyProfile(data: ProfileUpdateRequest) {
  return request.put<ApiResponse<Profile>>('/api/me/profile', data)
}