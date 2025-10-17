// 认证相关类型定义

export interface UserDTO {
  id: number
  username: string
  email: string
  role: string
  createTime: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  token?: string
  user?: UserDTO
}

export interface AuthCheckResponse {
  authenticated: boolean
  message: string
  username?: string
  role?: string
}

export interface RegisterRequest {
  username: string
  password: string
}

export interface RegisterResponse {
  success: boolean
  message: string
}
