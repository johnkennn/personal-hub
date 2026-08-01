export interface LoginRequest {
    username: string
    password: string
  }
  
  export interface LoginResponse {
    username: string
    token: string
  }

  export interface RegisterRequest {
    username: string
    email: string
    password: string
  }