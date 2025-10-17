import axios, { type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';

// 定义请求配置接口 - 扩展标准的 AxiosRequestConfig
export interface RequestConfig extends AxiosRequestConfig {
  showError?: boolean; // 是否显示错误信息
  retryCount?: number; // 重试次数
  timeout?: number; // 自定义超时时间
}

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 使用正确的类型
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`🚀 发送请求: ${config.method?.toUpperCase()} ${config.url}`);

    // 添加 token 认证信息
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    return config;
  },
  (error) => {
    console.error('❌ 请求配置错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 使用正确的类型
request.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ 请求成功: ${response.config.url}`, response.data);
    return response.data;
  },
  (error) => {
    console.error('❌ 请求失败:', error);

    // Token 过期处理
    if (error.response?.status === 401) {
      const errorMessage = '登录已过期，请重新登录';

      // 清除本地存储的 token 和用户信息
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // 如果是前端路由，跳转到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      ElMessage.error(errorMessage);
    }

    // 统一错误处理
    let errorMessage = '网络请求失败';

    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response;

      switch (status) {
        case 400:
          errorMessage = data?.message || '请求参数错误';
          break;
        case 401:
          errorMessage = '未授权，请重新登录';
          break;
        case 403:
          errorMessage = '拒绝访问';
          break;
        case 404:
          errorMessage = `请求地址不存在: ${error.config.url}`;
          break;
        case 408:
          errorMessage = '请求超时';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        case 502:
          errorMessage = '网关错误';
          break;
        case 503:
          errorMessage = '服务不可用';
          break;
        case 504:
          errorMessage = '网关超时';
          break;
        default:
          errorMessage = data?.message || `请求失败 (${status})`;
      }
    } else if (error.request) {
      // 请求发送了但没有收到响应
      if (error.code === 'ECONNABORTED') {
        errorMessage = '请求超时';
      } else if (error.message === 'Network Error') {
        errorMessage = '网络连接失败，请检查网络设置';
      } else {
        errorMessage = '网络连接异常';
      }
    } else {
      // 其他错误
      errorMessage = error.message || '未知错误';
    }

    // 🆕 修复：安全地访问 error.config
    const config = error.config as RequestConfig | undefined;
    const showError = config?.showError !== false;
    if (showError && error.response?.status !== 401) {
      ElMessage.error(errorMessage);
    }

    return Promise.reject({
      message: errorMessage,
      code: error.response?.status,
      data: error.response?.data,
      originalError: error
    });
  }
);

// 基础请求方法
export const get = <T = any>(url: string, params?: any, config?: RequestConfig): Promise<T> => {
  return request.get(url, { params, ...config });
};

export const post = <T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> => {
  return request.post(url, data, config);
};

export const put = <T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> => {
  return request.put(url, data, config);
};

export const del = <T = any>(url: string, config?: RequestConfig): Promise<T> => {
  return request.delete(url, config);
};

export const patch = <T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> => {
  return request.patch(url, data, config);
};

// 专门用于爬虫请求的实例 - 超时时间更长
export const crawlRequest = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 60000, // 爬虫请求需要更长的超时时间
  headers: {
    'Content-Type': 'application/json'
  }
});

// 爬虫请求拦截器 - 使用正确的类型
crawlRequest.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`🕷️ 发送爬虫请求: ${config.method?.toUpperCase()} ${config.url}`);

    // 添加 token 认证信息
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('❌ 爬虫请求配置错误:', error);
    return Promise.reject(error);
  }
);

// 爬虫响应拦截器
crawlRequest.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ 爬虫请求成功:`, response.data);
    return response.data;
  },
  (error) => {
    console.error('❌ 爬虫请求失败:', error);

    let errorMessage = '数据采集失败';
    if (error.response?.status === 404) {
      errorMessage = '爬虫接口不存在，请检查后端服务';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = '数据采集超时，请稍后重试';
    } else if (error.response?.status === 500) {
      errorMessage = '爬虫服务内部错误';
    } else if (error.response?.status === 401) {
      errorMessage = '未授权，请重新登录';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    ElMessage.error(errorMessage);
    return Promise.reject({
      message: errorMessage,
      code: error.response?.status,
      data: error.response?.data,
      originalError: error
    });
  }
);

// 爬虫专用请求方法
export const crawlGet = <T = any>(url: string, params?: any, config?: RequestConfig): Promise<T> => {
  return crawlRequest.get(url, { params, ...config });
};

export const crawlPost = <T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> => {
  return crawlRequest.post(url, data, config);
};

export const crawlPut = <T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> => {
  return crawlRequest.put(url, data, config);
};

// 文件上传请求实例
export const uploadRequest = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 30000,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// 上传请求拦截器
uploadRequest.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`📤 发送上传请求: ${config.method?.toUpperCase()} ${config.url}`);

    // 添加 token 认证信息
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('❌ 上传请求配置错误:', error);
    return Promise.reject(error);
  }
);

// 上传响应拦截器
uploadRequest.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ 上传请求成功:`, response.data);
    return response.data;
  },
  (error) => {
    console.error('❌ 上传请求失败:', error);

    let errorMessage = '文件上传失败';
    if (error.code === 'ECONNABORTED') {
      errorMessage = '上传超时，请检查网络连接';
    } else if (error.response?.status === 413) {
      errorMessage = '文件大小超过限制';
    } else if (error.response?.status === 401) {
      errorMessage = '未授权，请重新登录';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    ElMessage.error(errorMessage);
    return Promise.reject({
      message: errorMessage,
      code: error.response?.status,
      data: error.response?.data,
      originalError: error
    });
  }
);

// 文件上传方法
export const upload = <T = any>(url: string, formData: FormData, config?: RequestConfig): Promise<T> => {
  return uploadRequest.post(url, formData, config);
};

// 下载文件方法
export const download = (url: string, params?: any, config?: RequestConfig): Promise<Blob> => {
  return request.get(url, {
    params,
    responseType: 'blob',
    ...config
  });
};

// 并发请求控制
export const all = axios.all;
export const spread = axios.spread;

// 取消请求相关
export const CancelToken = axios.CancelToken;
export const isCancel = axios.isCancel;

// 创建取消令牌源
export const createCancelTokenSource = () => {
  return axios.CancelToken.source();
};

// 请求重试机制
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  retryCount: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await requestFn();
  } catch (error: any) {
    if (retryCount > 0 && error.code !== 401 && error.code !== 403) {
      console.log(`🔄 请求失败，${delay}ms后重试，剩余重试次数: ${retryCount}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(requestFn, retryCount - 1, delay * 2);
    }
    throw error;
  }
};

// 带重试的请求方法
export const getWithRetry = <T = any>(
  url: string,
  params?: any,
  config?: RequestConfig & { retryCount?: number }
): Promise<T> => {
  const retryCount = config?.retryCount || 3;
  return retryRequest(() => get<T>(url, params, config), retryCount);
};

export const postWithRetry = <T = any>(
  url: string,
  data?: any,
  config?: RequestConfig & { retryCount?: number }
): Promise<T> => {
  const retryCount = config?.retryCount || 3;
  return retryRequest(() => post<T>(url, data, config), retryCount);
};

// 进度监控请求（用于大文件上传/下载）
export const withProgress = <T = any>(
  requestFn: () => Promise<T>,
  onProgress?: (progress: number) => void
): Promise<T> => {
  return new Promise((resolve, reject) => {
    requestFn()
      .then(resolve)
      .catch(reject);

    // 模拟进度更新（实际项目中需要根据具体API实现）
    if (onProgress) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress >= 100) {
          clearInterval(interval);
          onProgress(100);
        } else {
          onProgress(progress);
        }
      }, 100);
    }
  });
};

// 批量请求方法
export const batchRequests = <T>(
  requests: Array<() => Promise<T>>,
  concurrency: number = 5
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    let currentIndex = 0;
    let running = 0;
    let hasError = false;

    const runNext = () => {
      if (hasError) return;

      if (currentIndex >= requests.length && running === 0) {
        resolve(results);
        return;
      }

      while (running < concurrency && currentIndex < requests.length) {
        const index = currentIndex++;
        running++;

        requests[index]()
          .then(result => {
            results[index] = result;
            running--;
            runNext();
          })
          .catch(error => {
            hasError = true;
            reject(error);
          });
      }
    };

    runNext();
  });
};

// 默认导出所有方法
export default {
  // 基础方法
  get,
  post,
  put,
  del,
  patch,

  // 爬虫方法
  crawlGet,
  crawlPost,
  crawlPut,

  // 文件方法
  upload,
  download,

  // 高级方法
  getWithRetry,
  postWithRetry,
  withProgress,
  batchRequests,

  // 工具方法
  all,
  spread,
  CancelToken,
  isCancel,
  createCancelTokenSource,

  // 实例
  request,
  crawlRequest,
  uploadRequest
};
