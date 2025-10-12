import request, { crawlRequest } from '@/utils/request'

// API基础配置
const API_BASE_URL = '/api'

// 视频相关API
export const videoApi = {
  // 获取视频详情
  getVideoDetail: (bvId: string) => {
    return request.get(`${API_BASE_URL}/video/${bvId}`)
  },

  // 获取视频数据趋势
  getVideoTrend: (bvId: string) => {
    return request.get(`${API_BASE_URL}/video/${bvId}/trend`)
  },

  // 检查视频是否存在
  checkVideoExists: (bvId: string) => {
    return request.get(`${API_BASE_URL}/video/${bvId}/exists`)
  },

  // 保存视频信息
  saveVideo: (videoData: any) => {
    return request.post(`${API_BASE_URL}/video`, videoData)
  },

  // 保存视频统计数据
  saveVideoStats: (bvId: string, statData: any) => {
    return request.post(`${API_BASE_URL}/video/${bvId}/stats`, statData)
  },

  // 获取热门视频
  getHotVideos: () => {
    return request.get(`${API_BASE_URL}/video/hot`)
  },

  // 搜索视频
  searchVideos: (keyword: string) => {
    return request.get(`${API_BASE_URL}/video/search?keyword=${keyword}`)
  }
}

// UP主相关API
export const upApi = {
  // 获取UP主详情
  getUpDetail: (uid: string) => {
    return request.get(`${API_BASE_URL}/up/${uid}`)
  },

  // 获取UP主粉丝趋势
  getUpTrend: (uid: string) => {
    return request.get(`${API_BASE_URL}/up/${uid}/trend`)
  },

  // 检查UP主是否存在
  checkUpExists: (uid: string) => {
    return request.get(`${API_BASE_URL}/up/${uid}/exists`)
  },

  // 保存UP主信息
  saveUp: (upData: any) => {
    return request.post(`${API_BASE_URL}/up`, upData)
  },

  // 触发UP主数据抓取 - 使用专门的爬取请求实例
  triggerUpCrawl: (uid: string) => {
    return crawlRequest.post(`${API_BASE_URL}/up/${uid}/crawl`)
  },

  // 获取UP主视频列表
  getUpVideos: (uid: string) => {
    return request.get(`${API_BASE_URL}/up/${uid}/videos`)
  },

  // 获取UP主详细信息（包含视频）
  getUpDetailWithVideos: (uid: string) => {
    return request.get(`${API_BASE_URL}/up/${uid}/detail`)
  },

  // 检查Python环境
  checkPythonEnvironment: () => {
    return request.get(`${API_BASE_URL}/up/python/check`)
  }
}

// 数据统计相关API
export const statsApi = {
  // 获取总体统计数据
  getOverviewStats: () => {
    return request.get(`${API_BASE_URL}/stats/overview`)
  },

  // 获取分区分布数据
  getPartitionStats: () => {
    return request.get(`${API_BASE_URL}/stats/partitions`)
  },

  // 获取系统状态
  getSystemStatus: () => {
    return request.get(`${API_BASE_URL}/stats/system`)
  }
}

// 测试相关API
export const testApi = {
  // 基础连接测试
  testHello: () => {
    return request.get(`${API_BASE_URL}/test/hello`)
  },

  // 连接测试
  testConnection: () => {
    return request.get(`${API_BASE_URL}/test/connection`)
  },

  // 视频控制器测试
  testVideoController: () => {
    return request.get(`${API_BASE_URL}/video/test`)
  },

  // UP主控制器测试
  testUpController: () => {
    return request.get(`${API_BASE_URL}/up/test`)
  },

  // 回显测试
  testEcho: (data: any) => {
    return request.post(`${API_BASE_URL}/test/echo`, data)
  }
}

// 统一的API导出
export default {
  video: videoApi,
  up: upApi,
  stats: statsApi,
  test: testApi
}
