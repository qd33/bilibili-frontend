<template>
  <div class="up-analysis-page">
    <div class="page-header">
      <h1>UP主分析</h1>
      <p>深入分析UP主的成长轨迹和内容表现</p>
    </div>

    <!-- 🆕 数据抓取卡片 -->
    <div class="tech-card">
      <h3 class="section-title">UP主数据抓取</h3>
      <div class="crawl-section">
        <div class="crawl-form">
          <el-input
            v-model="upUid"
            placeholder="请输入B站UP主UID"
            style="width: 300px; margin-right: 15px;"
            :prefix-icon="User"
            clearable
          ></el-input>
          <el-button
            type="primary"
            @click="handleCrawl"
            :loading="crawlLoading"
            :icon="Download"
          >
            一键抓取数据
          </el-button>
        </div>
        <p class="demo-tip">示例UID: 123456789 (请替换为真实B站UP主UID)</p>

        <!-- 🆕 抓取状态显示 -->
        <div v-if="crawlStatus" class="crawl-status" :class="crawlStatus.type">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ crawlStatus.message }}</span>
        </div>
      </div>
    </div>

    <!-- 🆕 UP主基本信息 -->
    <div class="tech-card" v-if="upData">
      <h3 class="section-title">UP主信息</h3>
      <div class="up-info">
        <div class="avatar-section">
          <div class="avatar-placeholder" v-if="!upData.avatar">
            <el-icon><User /></el-icon>
          </div>
          <img v-else :src="upData.avatar" alt="UP主头像" class="avatar-image">
        </div>
        <div class="info-content">
          <h4>{{ upData.name || '未知UP主' }}</h4>
          <div class="up-stats">
            <div class="stat-item">
              <span class="label">UID:</span>
              <span class="value">{{ upUid }}</span>
            </div>
            <div class="stat-item">
              <span class="label">粉丝数:</span>
              <span class="value">{{ formatNumber(latestStats?.followerCount) }}</span>
            </div>
            <div class="stat-item">
              <span class="label">总播放:</span>
              <span class="value">{{ formatNumber(latestStats?.totalViewCount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 🆕 粉丝增长趋势 -->
    <div class="tech-card" v-if="trendData.length > 0">
      <h3 class="section-title">粉丝增长趋势</h3>
      <div class="chart-container">
        <LineChart
          :data="chartData"
          height="300px"
        />
      </div>
    </div>

    <!-- 🆕 视频数据表格 -->
    <div class="tech-card" v-if="videoList && videoList.length > 0">
      <h3 class="section-title">视频列表 ({{ videoList.length }}个)</h3>
      <el-table :data="videoList" style="width: 100%" class="video-table">
        <el-table-column prop="title" label="视频标题" min-width="300">
          <template #default="{ row }">
            <div class="video-title">
              <span class="title-text">{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="播放量" width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ formatNumber(row.viewCount) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="likeCount" label="点赞" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="success">{{ formatNumber(row.likeCount) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="coinCount" label="投币" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="warning">{{ formatNumber(row.coinCount) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="favoriteCount" label="收藏" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="danger">{{ formatNumber(row.favoriteCount) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="120" align="center">
          <template #default="{ row }">
            <span class="publish-time">{{ formatTime(row.publishTime) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 🆕 空状态 -->
    <div class="tech-card" v-else-if="upData">
      <el-empty description="暂无视频数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { User, Download, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { upApi } from '@/services/api'

const route = useRoute()
const upUid = ref('')
const crawlLoading = ref(false)
const crawlStatus = ref<{type: string, message: string} | null>(null)
const upData = ref<any>(null)
const trendData = ref<any[]>([])
const videoList = ref<any[]>([])

// 计算最新统计数据
const latestStats = computed(() => {
  if (trendData.value.length === 0) return null
  return trendData.value[trendData.value.length - 1]
})

// 计算图表数据
const chartData = computed(() => {
  return {
    xAxis: trendData.value.map(item => {
      const date = new Date(item.recordDate)
      return `${date.getMonth() + 1}/${date.getDate()}`
    }),
    series: trendData.value.map(item => item.followerCount)
  }
})

// 处理抓取按钮点击
const handleCrawl = async () => {
  if (!upUid.value.trim()) {
    ElMessage.warning('请输入UP主UID')
    return
  }

  crawlLoading.value = true
  crawlStatus.value = { type: 'info', message: '开始抓取UP主数据...' }

  try {
    // 1. 调用后端抓取接口
    const crawlResult = await upApi.triggerUpCrawl(upUid.value)
    console.log('抓取结果:', crawlResult)

    crawlStatus.value = { type: 'success', message: '数据抓取任务已提交，正在获取详情...' }
    ElMessage.success('数据抓取任务已提交')

    // 2. 抓取成功后，延时片刻然后查询UP主详情
    setTimeout(() => {
      fetchUpData(upUid.value)
    }, 2000)

  } catch (error) {
    console.error('抓取失败:', error)
    crawlStatus.value = { type: 'error', message: '数据抓取失败，请重试' }
    ElMessage.error('数据抓取失败，请重试')

    // 即使抓取失败，也尝试使用模拟数据展示
    setTimeout(() => {
      useMockData(upUid.value)
    }, 1000)
  } finally {
    crawlLoading.value = false
  }
}

// 获取UP主详细信息
const fetchUpData = async (uid: string) => {
  try {
    crawlStatus.value = { type: 'info', message: '正在获取UP主详情...' }

    const data = await upApi.getUpDetail(uid)
    console.log('UP主详情:', data)

    if (data.success) {
      upData.value = data.up
      trendData.value = data.stats || []

      // 🆕 获取UP主的视频列表（这里需要后端支持）
      // 暂时使用模拟数据
      if (!videoList.value.length) {
        videoList.value = generateMockVideos(uid)
      }

      crawlStatus.value = { type: 'success', message: '数据加载完成' }
      ElMessage.success('UP主数据加载成功')
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error('获取UP主数据失败:', error)
    crawlStatus.value = { type: 'error', message: '获取UP主信息失败，使用演示数据' }
    ElMessage.warning('使用演示数据进行展示')
    useMockData(uid)
  }
}

// 格式化数字显示
const formatNumber = (num: number) => {
  if (!num && num !== 0) return '-'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + '千'
  }
  return num.toString()
}

// 格式化时间显示
const formatTime = (timeStr: string) => {
  if (!timeStr) return '-'
  try {
    const date = new Date(timeStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  } catch {
    return timeStr
  }
}

// 🆕 使用模拟数据（备用方案）
const useMockData = (uid: string) => {
  upData.value = {
    name: `UP主${uid}`,
    avatar: null
  }

  // 生成模拟趋势数据
  trendData.value = Array.from({ length: 7 }, (_, i) => ({
    recordDate: `2025-10-${i + 1}`,
    followerCount: 10000 + i * 2000,
    totalViewCount: 500000 + i * 100000
  }))

  // 生成模拟视频数据
  videoList.value = generateMockVideos(uid)

  ElMessage.info('正在使用演示数据')
}

// 🆕 生成模拟视频数据
const generateMockVideos = (uid: string) => {
  return Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    title: `【测试数据】视频标题${i + 1} - UP主${uid}`,
    viewCount: 5000 + Math.floor(Math.random() * 50000),
    likeCount: 200 + Math.floor(Math.random() * 2000),
    coinCount: 100 + Math.floor(Math.random() * 1000),
    favoriteCount: 150 + Math.floor(Math.random() * 1500),
    publishTime: `2025-10-${Math.max(1, 15 - i)}T10:00:00`
  }))
}

// 页面加载时检查URL参数
onMounted(() => {
  const uidFromRoute = route.params.uid as string
  if (uidFromRoute) {
    upUid.value = uidFromRoute
    // 自动加载数据
    fetchUpData(uidFromRoute)
  }
})
</script>

<style scoped>
.up-analysis-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.page-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* 🆕 抓取区域样式 */
.crawl-section {
  padding: 20px 0;
}

.crawl-form {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 15px;
}

.demo-tip {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 10px 0;
}

.crawl-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border-radius: 6px;
  margin-top: 15px;
  font-size: 0.9rem;
}

.crawl-status.info {
  background-color: var(--accent-blue);
  color: white;
}

.crawl-status.success {
  background-color: var(--success-color);
  color: white;
}

.crawl-status.error {
  background-color: var(--error-color);
  color: white;
}

/* 🆕 UP主信息样式 */
.up-info {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 20px 0;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
}

.avatar-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.info-content {
  flex: 1;
}

.info-content h4 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 15px;
}

.up-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-item .label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.stat-item .value {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

/* 🆕 视频表格样式 */
.video-table {
  margin-top: 10px;
}

.video-title {
  max-width: 400px;
}

.title-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.publish-time {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.chart-container {
  height: 300px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .up-analysis-page {
    padding: 10px;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .page-header p {
    font-size: 0.9rem;
  }

  .crawl-form {
    flex-direction: column;
    align-items: stretch;
  }

  .crawl-form .el-input {
    width: 100% !important;
    margin-right: 0 !important;
    margin-bottom: 10px;
  }

  .up-info {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }

  .up-stats {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 250px;
  }

  .video-table {
    font-size: 0.8rem;
  }
}
</style>
