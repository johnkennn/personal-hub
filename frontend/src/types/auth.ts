export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  username: string
  token: string
  userId: number
  role: 'AUTHOR' | 'ADMIN'
}

export interface RegisterRequest {
  username: string
  email: string
  phone: string
  password: string
}

/** 忘记密码：校验手机号 + 邮箱后设新密码（后续可改为验证码） */
export interface ForgotPasswordRequest {
  email: string
  phone: string
  newPassword: string
}

/** 登录后改密：校验旧密码 */
export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}
