import { defineStore } from 'pinia'
import { get, post } from '@/utils/request'
import { ElMessage } from 'element-plus'
import { getProxyImageUrl, getDefaultCover } from '@/utils/imageProxy' // 🆕 导入图片代理

export const usePartitionStore = defineStore('partition', {
  state: () => ({
    // 分区列表
    partitions: [
      { id: 'life', name: '生活', tid: 160, color: '#ff6b6b' },
      { id: 'game', name: '游戏', tid: 4, color: '#4ecdc4' },
      { id: 'knowledge', name: '知识', tid: 36, color: '#45b7d1' },
      { id: 'music', name: '音乐', tid: 3, color: '#96ceb4' },
      { id: 'tech', name: '科技', tid: 188, color: '#feca57' },
      { id: 'animation', name: '动画', tid: 1, color: '#ff9ff3' },
      { id: 'dance', name: '舞蹈', tid: 129, color: '#9b59b6' },
      { id: 'ent', name: '娱乐', tid: 5, color: '#e74c3c' }
    ],

    // 当前数据
    currentPartition: 'life',
    partitionStats: {} as Record<string, any[]>,
    partitionVideos: {} as Record<string, any[]>,
    partitionDistribution: [] as any[],

    // 状态
    loading: false,
    error: null as string | null
  }),

  actions: {
    // 获取分区完整数据
    async fetchPartitionOverview(partitionId: string) {
      try {
        this.loading = true
        this.error = null

        console.log(`📡 请求分区数据: ${partitionId}`)
        const response = await get(`/api/partition-analysis/${partitionId}/overview`)

        console.log('📊 分区数据完整响应:', JSON.parse(JSON.stringify(response)))

        if (response?.success) {
          this.currentPartition = partitionId

          // 转换统计数据格式
          this.partitionStats[partitionId] = this.transformStats(response.stats, partitionId)

          // 🆕 修复：使用改进的视频数据转换
          this.partitionVideos[partitionId] = this.extractAndTransformVideos(response, partitionId)

          // 转换分布数据格式
          this.partitionDistribution = this.transformDistribution(response.distribution)

          console.log(`✅ 分区数据加载成功: ${partitionId}`)
          console.log('转换后统计:', this.partitionStats[partitionId])
          console.log('转换后视频:', this.partitionVideos[partitionId])
          console.log('转换后分布:', this.partitionDistribution)
        } else {
          throw new Error(response?.message || '获取数据失败')
        }
      } catch (error: any) {
        this.error = error.message || '获取分区数据失败'
        console.error('❌ 获取分区数据失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 🆕 改进的视频数据提取方法
    extractAndTransformVideos(response: any, partitionId: string): any[] {
      console.log('开始提取视频数据，响应结构:', Object.keys(response))

      let videos: any[] = []

      // 优先从 videos 字段提取
      if (response.videos && Array.isArray(response.videos)) {
        console.log('从 response.videos 提取视频数据')
        videos = response.videos
      }
      // 然后尝试从 ranking 字段提取
      else if (response.ranking && Array.isArray(response.ranking)) {
        console.log('从 response.ranking 提取视频数据')
        videos = response.ranking
      }
      // 最后尝试深度搜索
      else {
        console.log('未找到直接视频字段，进行深度搜索')
        videos = this.deepSearchVideos(response)
      }

      console.log('提取到的原始视频数据数量:', videos.length)

      // 转换视频格式
      const transformedVideos = this.transformVideos(videos, partitionId)
      console.log('转换后的视频数据:', transformedVideos)

      return transformedVideos
    },

    // 🆕 改进的视频数据转换方法 - 集成图片代理
    transformVideos(videos: any[], partitionId: string): any[] {
      if (!videos || !Array.isArray(videos) || videos.length === 0) {
        console.log('视频数据为空，返回空数组')
        return []
      }

      return videos.map((video, index) => {
        console.log(`视频 ${index} 原始数据:`, video)

        // 🆕 修复封面URL处理 - 使用图片代理（与UP主分析保持一致）
        let coverUrl = video.cover || video.coverUrl || video.pic || video.cover_url

        // 🆕 关键修复：使用图片代理服务转换封面URL
        if (coverUrl) {
          coverUrl = getProxyImageUrl(coverUrl)
          console.log(`🖼️ 视频 ${index} 代理封面URL:`, coverUrl)
        } else {
          coverUrl = getDefaultCover()
          console.log(`🖼️ 视频 ${index} 使用默认封面`)
        }

        // 🆕 修复发布时间处理 - 更准确的格式化
        const publishTime = this.formatPublishTime(video.publishTime || video.publish_time)

        const videoInfo = {
          id: video.bvid || video.id || `video-${partitionId}-${index}`,
          title: video.title || '未知标题',
          upName: video.upName || video.up_name || video.owner?.name || '未知UP主',
          cover: coverUrl, // 🆕 使用代理后的URL
          play: this.safeNumber(video.play || video.playCount || video.view || 0),
          like: this.safeNumber(video.like || video.likeCount || 0),
          danmaku: this.safeNumber(video.danmaku || video.danmakuCount || 0),
          publishTime: publishTime, // 🆕 使用格式化后的时间
          rank: index + 1,
          // 添加原始数据用于调试
          _raw: video
        }

        console.log(`视频 ${index} 转换后:`, videoInfo)
        return videoInfo
      })
    },

    // 🆕 改进的发布时间格式化方法
    formatPublishTime(publishTime: any): string {
      if (!publishTime) {
        console.log('发布时间为空，返回默认值')
        return '最近发布'
      }

      try {
        let date: Date

        // 处理不同类型的发布时间数据
        if (typeof publishTime === 'string') {
          // 处理ISO格式时间（包含时区）
          if (publishTime.includes('T')) {
            date = new Date(publishTime)
          } else if (publishTime.includes('-')) {
            // 处理 "yyyy-MM-dd" 格式
            date = new Date(publishTime + 'T00:00:00')
          } else {
            // 尝试直接解析
            date = new Date(publishTime)
          }
        } else if (typeof publishTime === 'number') {
          // 处理时间戳（判断是秒还是毫秒）
          if (publishTime < 10000000000) {
            // 秒级时间戳
            date = new Date(publishTime * 1000)
          } else {
            // 毫秒级时间戳
            date = new Date(publishTime)
          }
        } else if (publishTime instanceof Date) {
          date = publishTime
        } else {
          console.log('无法识别的发布时间格式:', publishTime)
          return '最近发布'
        }

        // 检查日期是否有效
        if (isNaN(date.getTime())) {
          console.log('无效的日期:', publishTime)
          return '最近发布'
        }

        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        // 更精确的时间显示
        if (diffDays === 0) {
          const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
          if (diffHours <= 1) {
            return '1小时内发布'
          }
          return `${diffHours}小时前发布`
        } else if (diffDays === 1) {
          return '昨天发布'
        } else if (diffDays <= 7) {
          return `${diffDays}天前发布`
        } else if (diffDays <= 30) {
          const weeks = Math.floor(diffDays / 7)
          return `${weeks}周前发布`
        } else {
          // 显示具体日期
          return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        }
      } catch (error) {
        console.error('格式化发布时间失败:', error)
        return '最近发布'
      }
    },

    // 🆕 改进的深度搜索方法
    deepSearchVideos(obj: any): any[] {
      if (!obj || typeof obj !== 'object') return []

      const videos: any[] = []

      // 递归搜索包含视频特征的数组
      const search = (currentObj: any, path: string = '') => {
        if (Array.isArray(currentObj)) {
          // 检查数组中的元素是否包含视频特征
          if (currentObj.length > 0) {
            const firstItem = currentObj[0]
            // 🆕 更严格的视频特征判断
            if (firstItem &&
              (firstItem.title || firstItem.bvid || firstItem.upName) &&
              (firstItem.play !== undefined || firstItem.coverUrl !== undefined)) {
              console.log(`✅ 在路径 ${path} 找到视频数组，数量: ${currentObj.length}`)
              videos.push(...currentObj)
              return // 找到后停止当前分支的搜索
            }
          }
        }

        if (typeof currentObj === 'object' && currentObj !== null) {
          for (const key in currentObj) {
            if (Object.prototype.hasOwnProperty.call(currentObj, key)) {
              search(currentObj[key], path ? `${path}.${key}` : key)
            }
          }
        }
      }

      search(obj)
      console.log(`深度搜索找到 ${videos.length} 个视频`)
      return videos
    },

    // 🆕 获取默认封面 - 与UP主分析保持一致
    getDefaultCover(): string {
      return getDefaultCover()
    },

    // 🆕 修复：改进错误处理的分区爬取方法
    async triggerPartitionCrawl(partitionId: string) {
      try {
        console.log(`🚀 触发分区爬取: ${partitionId}`)
        const response = await post(`/api/partition-analysis/${partitionId}/crawl`)

        console.log('爬取响应:', response)

        if (response?.success) {
          ElMessage.success(`${this.getPartitionName(partitionId)}分区数据刷新成功`)
          // 重新获取数据
          await this.fetchPartitionOverview(partitionId)
          return response
        } else {
          // 🆕 修复：更详细的错误消息处理
          let errorMessage = response?.message || '刷新失败'

          // 处理特定的错误类型
          if (errorMessage.includes('Duplicate entry') || errorMessage.includes('数据重复')) {
            errorMessage = '数据重复，系统已自动处理，请刷新页面查看最新数据'
          } else if (errorMessage.includes('rollback-only')) {
            errorMessage = '数据保存过程中出现冲突，请稍后重试'
          }

          ElMessage.warning(`数据刷新完成但有警告: ${errorMessage}`)

          // 🆕 即使有警告也重新获取数据，因为可能部分数据已保存
          await this.fetchPartitionOverview(partitionId)
          return response
        }
      } catch (error: any) {
        console.error('❌ 分区爬取失败:', error)

        // 🆕 修复：更友好的错误处理
        let errorMessage = '数据刷新失败'
        if (error.message) {
          if (error.message.includes('rollback-only')) {
            errorMessage = '数据保存失败，可能存在重复数据，请稍后重试'
          } else if (error.message.includes('网络') || error.message.includes('请求')) {
            errorMessage = '网络连接失败，请检查网络设置'
          } else if (error.message.includes('Duplicate')) {
            errorMessage = '数据重复，系统正在处理，请刷新页面查看'
          } else {
            errorMessage = error.message
          }
        }

        ElMessage.error(errorMessage)
        throw error
      }
    },

    // 其他方法保持不变...
    transformStats(stats: any[], partitionId: string): any[] {
      console.log('原始统计数据:', stats)

      if (!stats || !Array.isArray(stats)) {
        console.log('统计数据为空，使用默认数据')
        return this.createDefaultStats(partitionId)
      }

      return stats.map(stat => ({
        icon: stat.icon || '📊',
        title: stat.title || '未知',
        value: stat.value || '0'
      }))
    },

    transformDistribution(distribution: any[]): any[] {
      console.log('原始分布数据:', distribution)

      if (!distribution || !Array.isArray(distribution)) {
        console.log('分布数据为空，使用默认数据')
        return this.createDefaultDistribution()
      }

      return distribution.map(item => ({
        name: item.name || '未知',
        value: this.safeNumber(item.value || 0),
        percentage: this.safeNumber(item.percentage || 0)
      }))
    },

    safeNumber(value: any): number {
      if (value === undefined || value === null) return 0
      const num = Number(value)
      return isNaN(num) ? 0 : num
    },

    createDefaultStats(partitionId: string) {
      console.log('创建默认统计数据')
      return [
        { icon: '📊', title: '视频数量', value: '0' },
        { icon: '🔥', title: '总播放量', value: '0' },
        { icon: '👍', title: '总点赞数', value: '0' },
        { icon: '📈', title: '热度值', value: '0' }
      ]
    },

    createDefaultDistribution() {
      return [
        { name: '生活', value: 25, percentage: 25 },
        { name: '游戏', value: 20, percentage: 20 },
        { name: '知识', value: 18, percentage: 18 },
        { name: '音乐', value: 15, percentage: 15 },
        { name: '科技', value: 12, percentage: 12 },
        { name: '动画', value: 10, percentage: 10 }
      ]
    },

    getPartitionName(partitionId: string): string {
      const partition = this.partitions.find(p => p.id === partitionId)
      return partition?.name || partitionId
    }
  }
})
