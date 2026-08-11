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
    password: string
  }