import { defineStore } from 'pinia'
import { ref } from 'vue'
import { videoApi, upApi, statsApi } from '@/services/api'

export const useDataStore = defineStore('data', () => {
  // 状态数据
  const overviewStats = ref({
    videoCount: 0,
    upCount: 0,
    totalViews: 0,
    totalLikes: 0
  })

  const videoTrendData = ref({
    xAxis: [] as string[],
    series: [] as number[]
  })

  const partitionData = ref([] as any[])

  const currentVideo = ref(null)
  const currentUp = ref(null)

  // 🆕 UP主相关状态
  const upCrawlStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const upVideoList = ref<any[]>([])

  // Actions - 获取数据的方法
  const fetchOverviewStats = async () => {
    try {
      // 先使用模拟数据，后续替换为真实API
      overviewStats.value = {
        videoCount: 156,
        upCount: 42,
        totalViews: 1258473,
        totalLikes: 89234
      }

      // 真实API调用（注释状态，等后端就绪后启用）
      // const data = await statsApi.getOverviewStats()
      // overviewStats.value = data
    } catch (error) {
      console.error('获取总体统计失败:', error)
    }
  }

  const fetchVideoTrend = async (bvId?: string) => {
    try {
      // 模拟数据
      videoTrendData.value = {
        xAxis: ['10-01', '10-02', '10-03', '10-04', '10-05', '10-06', '10-07'],
        series: [120, 200, 150, 80, 70, 110, 130]
      }

      // 真实API调用
      // if (bvId) {
      //   const data = await videoApi.getVideoTrend(bvId)
      //   videoTrendData.value = data
      // }
    } catch (error) {
      console.error('获取视频趋势失败:', error)
    }
  }

  const fetchPartitionData = async () => {
    try {
      // 模拟数据
      partitionData.value = [
        { value: 40, name: '生活' },
        { value: 30, name: '科技' },
        { value: 20, name: '游戏' },
        { value: 10, name: '音乐' }
      ]

      // 真实API调用
      // const data = await statsApi.getPartitionStats()
      // partitionData.value = data
    } catch (error) {
      console.error('获取分区数据失败:', error)
    }
  }

  const fetchVideoDetail = async (bvId: string) => {
    try {
      // 这里会调用真实API获取视频详情
      console.log('获取视频详情:', bvId)
      // const data = await videoApi.getVideoDetail(bvId)
      // currentVideo.value = data
    } catch (error) {
      console.error('获取视频详情失败:', error)
    }
  }

  const fetchUpDetail = async (uid: string) => {
    try {
      // 这里会调用真实API获取UP主详情
      console.log('获取UP主详情:', uid)
      // const data = await upApi.getUpDetail(uid)
      // currentUp.value = data
    } catch (error) {
      console.error('获取UP主详情失败:', error)
    }
  }

  // 🆕 触发UP主数据抓取
  const triggerUpCrawl = async (uid: string) => {
    upCrawlStatus.value = 'loading'
    try {
      const result = await upApi.triggerUpCrawl(uid)
      upCrawlStatus.value = 'success'
      return result
    } catch (error) {
      upCrawlStatus.value = 'error'
      throw error
    }
  }

  // 🆕 设置UP主视频列表
  const setUpVideoList = (videos: any[]) => {
    upVideoList.value = videos
  }

  return {
    // 状态
    overviewStats,
    videoTrendData,
    partitionData,
    currentVideo,
    currentUp,
    upCrawlStatus,
    upVideoList,

    // Actions
    fetchOverviewStats,
    fetchVideoTrend,
    fetchPartitionData,
    fetchVideoDetail,
    fetchUpDetail,
    triggerUpCrawl,
    setUpVideoList
  }
})
