import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const request = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 30000, // 增加到30秒
  headers: {
    'Content-Type': 'application/json'
  }
})

// 为爬取接口创建专门的实例（更长超时时间）
export const crawlRequest = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 120000, // 爬取接口120秒超时
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
const setupRequestInterceptors = (instance: any) => {
  instance.interceptors.request.use(
    (config: any) => {
      const method = config.method?.toUpperCase()
      const url = config.url
      console.log(`🚀 发送请求: ${method} ${url}`)

      // 添加认证token
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    (error: any) => {
      console.error('❌ 请求配置错误:', error)
      return Promise.reject(error)
    }
  )
}

// 响应拦截器
const setupResponseInterceptors = (instance: any, isCrawlRequest = false) => {
  instance.interceptors.response.use(
    (response: any) => {
      console.log(`✅ 请求成功: ${response.config.url}`)

      // 统一处理响应格式
      const data = response.data

      // 如果后端返回了标准的success字段且为false
      if (data && typeof data === 'object' && data.success === false) {
        const errorMessage = data.message || '操作失败'
        if (!isCrawlRequest) {
          ElMessage.error(errorMessage)
        }
        return Promise.reject(new Error(errorMessage))
      }

      return data
    },
    (error: any) => {
      console.error('❌ 请求失败:', error)

      if (isCrawlRequest) {
        // 爬取专用的错误处理
        if (error.code === 'ECONNABORTED') {
          ElMessage.warning('爬取任务执行时间较长，请稍后在数据管理中查看结果')
        } else if (error.response) {
          const { status, data } = error.response
          if (status === 500) {
            ElMessage.error('爬取服务暂时不可用，请稍后重试')
          } else {
            ElMessage.error(data?.message || `爬取失败: ${status}`)
          }
        } else {
          ElMessage.error('爬取服务连接失败')
        }
      } else {
        // 普通请求的错误处理
        if (error.response) {
          // 服务器返回错误状态码
          const { status, data } = error.response

          switch (status) {
            case 400:
              ElMessage.error(data?.message || '请求参数错误')
              break
            case 401:
              ElMessage.error('未授权，请重新登录')
              // 清除token并跳转到登录页
              localStorage.removeItem('auth_token')
              window.location.href = '/login'
              break
            case 403:
              ElMessage.error('没有权限访问')
              break
            case 404:
              ElMessage.error('请求的资源不存在')
              break
            case 500:
              ElMessage.error('服务器内部错误')
              break
            case 502:
              ElMessage.error('网关错误')
              break
            case 503:
              ElMessage.error('服务不可用')
              break
            default:
              ElMessage.error(data?.message || `网络错误: ${status}`)
          }
        } else if (error.request) {
          // 请求未收到响应
          if (error.code === 'ECONNABORTED') {
            ElMessage.error('请求超时，请检查网络连接')
          } else {
            ElMessage.error('网络连接失败，请检查后端服务是否启动')
          }
        } else {
          // 其他错误
          ElMessage.error(error.message || '未知错误')
        }
      }

      return Promise.reject(error)
    }
  )
}

// 设置拦截器
setupRequestInterceptors(request)
setupResponseInterceptors(request, false)

setupRequestInterceptors(crawlRequest)
setupResponseInterceptors(crawlRequest, true)

export default request
