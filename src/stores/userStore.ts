import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { get, post } from '@/utils/request'
import type { UserDTO } from '@/types/api'

// 用户信息接口
export interface UserInfo {
  id: number
  username: string
  email: string
  role: string
  createTime: string
}

// 登录请求参数
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应
export interface LoginResponse {
  success: boolean
  message: string
  token?: string
  user?: UserDTO
}

// 认证检查响应
export interface AuthCheckResponse {
  authenticated: boolean
  message: string
  username?: string
  role?: string
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<UserInfo | null>(null)
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // 登录方法
  const login = async (loginData: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await post<LoginResponse>('/api/auth/login', loginData)

      if (response.success && response.token && response.user) {
        // 保存token和用户信息
        token.value = response.token
        user.value = {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          role: response.user.role,
          createTime: response.user.createTime
        }

        // 持久化存储
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(user.value))

        console.log('✅ 登录成功:', user.value.username)
        return response
      } else {
        console.error('❌ 登录失败:', response.message)
        return response
      }
    } catch (error: any) {
      console.error('❌ 登录请求失败:', error.message)
      return {
        success: false,
        message: error.message || '登录请求失败'
      }
    }
  }

  // 注册方法
  const register = async (registerData: LoginRequest): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await post<{ success: boolean; message: string }>('/api/auth/register', registerData)
      return response
    } catch (error: any) {
      console.error('❌ 注册请求失败:', error.message)
      return {
        success: false,
        message: error.message || '注册请求失败'
      }
    }
  }

  // 退出登录
  const logout = (): void => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    console.log('✅ 已退出登录')
  }

  // 检查认证状态
  const checkAuth = async (): Promise<boolean> => {
    // 如果本地有token，先验证有效性
    if (token.value) {
      try {
        const response = await get<AuthCheckResponse>('/api/auth/check')

        if (response.authenticated && response.username && response.role) {
          // token有效，获取完整用户信息
          await fetchCurrentUser()
          return true
        } else {
          // token无效，清除本地存储
          logout()
          return false
        }
      } catch (error) {
        console.error('❌ 认证检查失败:', error)
        logout()
        return false
      }
    }
    return false
  }

  // 获取当前用户信息
  const fetchCurrentUser = async (): Promise<void> => {
    try {
      const response = await get<{ success: boolean; user?: UserDTO; message?: string }>('/api/auth/me')

      if (response.success && response.user) {
        user.value = {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          role: response.user.role,
          createTime: response.user.createTime
        }
        localStorage.setItem('user', JSON.stringify(user.value))
      } else {
        console.error('❌ 获取用户信息失败:', response.message)
        logout()
      }
    } catch (error) {
      console.error('❌ 获取用户信息请求失败:', error)
      logout()
    }
  }

  // 初始化：从本地存储恢复状态
  const initialize = (): void => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken) {
      token.value = savedToken
    }

    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('❌ 解析本地用户信息失败:', error)
        localStorage.removeItem('user')
      }
    }

    // 如果有token，验证其有效性
    if (token.value) {
      checkAuth()
    }
  }

  // 计算属性：是否为管理员
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  // 立即初始化
  initialize()



  return {
    // 状态
    token,
    user,
    isAuthenticated,
    isAdmin,

    // 方法
    login,
    register,
    logout,
    checkAuth,
    fetchCurrentUser,
    initialize
  }
})
