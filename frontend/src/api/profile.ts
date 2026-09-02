import { request } from './request'
import type { ApiResponse } from '../types/api'
import type { Profile, ProfileUpdateRequest } from '../types/profile'

export function fetchMyProfile() {
  return request.get<ApiResponse<Profile>>('/api/me/profile')
}

export function updateMyProfile(data: ProfileUpdateRequest) {
  return request.put<ApiResponse<Profile>>('/api/me/profile', data)
}

export function uploadAvatar(file: File) {
  const form = new FormData()
  form.append('file', file) // 字段名必须叫 file，与后端 @RequestParam("file") 一致
  return request.post<ApiResponse<Profile>>('/api/me/avatar', form)
}
