import request from '@/utils/request'

// 视频相关API
export const videoApi = {
  // 获取视频详情
  getVideoDetail: (bvId: string) => {
    return request.get(`/video/${bvId}`)
  },

  // 获取视频数据趋势
  getVideoTrend: (bvId: string) => {
    return request.get(`/video/${bvId}/trend`)
  },

  // 检查视频是否存在
  checkVideoExists: (bvId: string) => {
    return request.get(`/video/${bvId}/exists`)
  },

  // 保存视频信息
  saveVideo: (videoData: any) => {
    return request.post('/video', videoData)
  }
}

// UP主相关API
export const upApi = {
  // 获取UP主详情
  getUpDetail: (uid: string) => {
    return request.get(`/up/${uid}`)
  },

  // 获取UP主粉丝趋势
  getUpTrend: (uid: string) => {
    return request.get(`/up/${uid}/trend`)
  },

  // 检查UP主是否存在
  checkUpExists: (uid: string) => {
    return request.get(`/up/${uid}/exists`)
  },

  // 保存UP主信息
  saveUp: (upData: any) => {
    return request.post('/up', upData)
  }
}

// 数据统计相关API
export const statsApi = {
  // 获取总体统计数据
  getOverviewStats: () => {
    return request.get('/stats/overview')
  },

  // 获取分区分布数据
  getPartitionStats: () => {
    return request.get('/stats/partitions')
  }
}
