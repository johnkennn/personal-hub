import { request } from './request'
import type { ApiResponse } from '../types/api'
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../types/auth'

export function login(data: LoginRequest) {
  return request.post<ApiResponse<LoginResponse>>('/api/auth/login', data)
}

export function register(data: RegisterRequest) {
  return request.post<ApiResponse<LoginResponse>>('/api/auth/register', data)
}

export function forgotPassword(data: ForgotPasswordRequest) {
  return request.post<ApiResponse<null>>('/api/auth/forgot-password', data)
}

export function changePassword(data: ChangePasswordRequest) {
  return request.post<ApiResponse<null>>('/api/me/password', data)
}
