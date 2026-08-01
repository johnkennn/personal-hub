import { request } from './request'
import type { ApiResponse } from '../types/api'
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth'

export function login(data: LoginRequest) {
  return request.post<ApiResponse<LoginResponse>>('/api/auth/login', data)
}

export function register(data: RegisterRequest) {
    return request.post<ApiResponse<LoginResponse>>('/api/auth/register', data)
  }