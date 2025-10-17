<template>
  <div class="dashboard">
    <!-- 顶部统计卡片 -->
    <div class="stats-grid">
      <div class="tech-card">
        <h3>总视频数</h3>
        <p class="stat-number">{{ stats.videoCount }}</p>
        <p class="stat-desc">已采集视频数量</p>
      </div>

      <div class="tech-card">
        <h3>UP主数量</h3>
        <p class="stat-number">{{ stats.upCount }}</p>
        <p class="stat-desc">活跃内容创作者</p>
      </div>

      <div class="tech-card">
        <h3>总播放量</h3>
        <p class="stat-number">{{ stats.totalViews.toLocaleString() }}</p>
        <p class="stat-desc">视频累计播放</p>
      </div>

      <div class="tech-card">
        <h3>总点赞数</h3>
        <p class="stat-number">{{ stats.totalLikes.toLocaleString() }}</p>
        <p class="stat-desc">用户互动点赞</p>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <div class="tech-card">
        <h3 class="section-title">播放量趋势</h3>
        <div v-if="lineChartData.xAxis.length > 0" class="chart-container">
          <LineChart
            :data="lineChartData"
            height="300px"
          />
        </div>
        <div v-else class="no-data">
          <el-empty description="暂无趋势数据" :image-size="80" />
        </div>
      </div>

      <div class="tech-card">
        <h3 class="section-title">分区分布</h3>
        <div v-if="pieChartData.length > 0" class="chart-container">
          <PieChart
            :data="pieChartData"
            height="300px"
          />
        </div>
        <div v-else class="no-data">
          <el-empty description="暂无分区数据" :image-size="80" />
        </div>
      </div>
    </div>

    <!-- 快速操作区域 -->
    <div class="tech-card">
      <h3 class="section-title">数据采集</h3>
      <div class="action-buttons">
        <el-button type="primary" @click="testBackendConnection" :loading="testingConnection">
          测试后端连接
        </el-button>
        <el-button type="success" @click="refreshData" :loading="dataStore.loading">
          刷新数据
        </el-button>
        <el-button type="warning" @click="triggerRealTimeCrawl" :loading="crawling">
          实时爬取数据
        </el-button>
        <el-button type="info" @click="viewBackendData">
          查看后端数据
        </el-button>
      </div>

      <!-- 连接状态显示 -->
      <div v-if="connectionStatus" class="connection-status">
        <el-alert
          :title="connectionStatus.title"
          :type="connectionStatus.type"
          :closable="false"
          show-icon
        />
      </div>

      <!-- 爬取任务状态 -->
      <div v-if="crawlTaskStatus" class="crawl-status">
        <el-alert
          :title="crawlTaskStatus.title"
          :type="crawlTaskStatus.type"
          :closable="true"
          show-icon
          @close="clearCrawlStatus"
        />
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="dataStore.loading" class="loading-overlay">
      <el-icon class="is-loading" color="#00aeec" :size="32">
        <Loading />
      </el-icon>
      <p>数据加载中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import LineChart from '@/components/charts/LineChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import { useDataStore } from '@/stores/dataStore'
// 🆕 修复：使用命名导入而不是默认导入
import { get } from '@/utils/request'

const dataStore = useDataStore()

// 使用计算属性确保数据存在
const stats = computed(() => dataStore.overviewStats)

// 转换图表数据格式
const lineChartData = computed(() => {
  const trendData = dataStore.videoTrendData
  if (trendData && trendData.length > 0) {
    return {
      xAxis: trendData.map((item: any) => item.date || item.name),
      series: trendData.map((item: any) => item.views || item.value)
    }
  }
  return { xAxis: [], series: [] }
})

const pieChartData = computed(() => {
  const partitionData = dataStore.partitionData
  if (partitionData && partitionData.length > 0) {
    return partitionData.map((item: any) => ({
      name: item.name,
      value: item.value
    }))
  }
  return []
})

const connectionStatus = ref<{title: string, type: 'success' | 'error' | 'info'} | null>(null)
const crawlTaskStatus = ref<{title: string, type: 'success' | 'error' | 'info' | 'warning'} | null>(null)
const testingConnection = ref(false)
const crawling = ref(false)

// 页面加载时获取数据
onMounted(async () => {
  try {
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '加载首页数据...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    await dataStore.fetchOverviewStats()
    await dataStore.fetchVideoTrend()
    await dataStore.fetchPartitionData()

    loadingInstance.close()
    ElMessage.success('首页数据加载完成')
  } catch (error) {
    console.error('首页数据加载失败:', error)
    ElMessage.warning('使用模拟数据展示，部分功能可能受限')
  }
})

const testBackendConnection = async () => {
  try {
    testingConnection.value = true
    ElMessage.info('正在测试后端连接...')
    connectionStatus.value = { title: '正在连接后端服务...', type: 'info' }

    // 🆕 修复：使用命名导入的 get 方法
    // 测试基础连接
    const helloResponse = await get('/test/hello')
    console.log('基础连接测试:', helloResponse)

    // 测试统计接口
    const statsResponse = await get('/api/stats/overview')
    console.log('统计接口测试:', statsResponse)

    // 测试服务层
    const serviceResponse = await get('/api/test/services')
    console.log('服务层测试:', serviceResponse)

    connectionStatus.value = {
      title: `后端连接正常！服务状态: 所有接口测试通过`,
      type: 'success'
    }
    ElMessage.success('所有后端接口测试通过！')

  } catch (error: any) {
    const errorMsg = error.message || '未知错误'
    connectionStatus.value = {
      title: `连接失败: ${errorMsg}`,
      type: 'error'
    }
    ElMessage.error('后端连接测试失败: ' + errorMsg)
    console.error('连接测试错误:', error)
  } finally {
    testingConnection.value = false
  }
}

const refreshData = async () => {
  try {
    ElMessage.info('正在刷新数据...')
    await dataStore.fetchOverviewStats()
    await dataStore.fetchVideoTrend()
    await dataStore.fetchPartitionData()
    ElMessage.success('数据刷新完成！')
  } catch (error) {
    ElMessage.error('数据刷新失败: ' + error)
  }
}

const triggerRealTimeCrawl = async () => {
  try {
    crawling.value = true
    ElMessage.info('开始实时数据爬取...')
    crawlTaskStatus.value = { title: '正在爬取实时数据，请稍候...', type: 'info' }

    // 调用实时数据爬取接口
    const response = await dataStore.triggerRealtimeRefresh()

    // 🆕 修复：安全地访问响应属性
    if (response && response.success) {
      crawlTaskStatus.value = {
        title: `数据爬取任务已启动${response.taskId ? `，任务ID: ${response.taskId}` : ''}`,
        type: 'success'
      }
      ElMessage.success('实时数据爬取任务已启动')

      // 等待一段时间后自动刷新数据
      setTimeout(() => {
        refreshData()
      }, 10000)
    } else {
      crawlTaskStatus.value = {
        title: `数据爬取失败: ${response?.message || '未知错误'}`,
        type: 'error'
      }
      ElMessage.error('实时数据爬取失败: ' + (response?.message || '未知错误'))
    }

  } catch (error: any) {
    const errorMsg = error.message || '未知错误'
    crawlTaskStatus.value = {
      title: `数据爬取异常: ${errorMsg}`,
      type: 'error'
    }
    ElMessage.error('实时数据爬取异常: ' + errorMsg)
    console.error('爬取错误:', error)
  } finally {
    crawling.value = false
  }
}

const clearCrawlStatus = () => {
  crawlTaskStatus.value = null
}

const viewBackendData = () => {
  window.open('http://localhost:8080', '_blank')
}
</script>

<style scoped>
/* 定义CSS变量 - 桌面端专用 */
.dashboard {
  --bg-secondary: #1a2332;
  --border-color: #2d3748;
  --text-primary: #ffffff;
  --text-secondary: #a0aec0;
  --accent-blue: #00aeec;
  --accent-purple: #9f7aea;
}

.dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;
  position: relative;
  color: var(--text-primary);
  min-height: 100vh;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
  margin-bottom: 40px;
}

.tech-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  height: fit-content;
}

.tech-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 174, 236, 0.2);
  border-color: var(--accent-blue);
}

.tech-card h3 {
  color: var(--text-secondary);
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-number {
  font-size: 3rem;
  font-weight: bold;
  color: var(--accent-blue);
  margin: 15px 0;
  text-shadow: 0 0 15px rgba(0, 174, 236, 0.4);
  line-height: 1;
}

.stat-desc {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin: 0;
  font-weight: 400;
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
  margin-bottom: 40px;
  height: 400px;
}

.section-title {
  margin: 0 0 20px 0;
  color: var(--text-primary);
  font-size: 1.3rem;
  font-weight: 600;
  border-bottom: 2px solid var(--accent-blue);
  padding-bottom: 10px;
}

.chart-container {
  height: 320px;
  width: 100%;
}

.no-data {
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px dashed var(--border-color);
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: nowrap;
}

.action-buttons .el-button {
  min-width: 140px;
  height: 42px;
  font-weight: 500;
}

.connection-status {
  margin-top: 20px;
}

.crawl-status {
  margin-top: 15px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  color: white;
  backdrop-filter: blur(5px);
}

.loading-overlay p {
  margin-top: 20px;
  font-size: 1.2rem;
  font-weight: 500;
}

/* 桌面端专属优化 */
.tech-card {
  position: relative;
  overflow: hidden;
}

.tech-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 174, 236, 0.1), transparent);
  transition: left 0.6s;
}

.tech-card:hover::before {
  left: 100%;
}

/* 图表容器优化 */
.charts-grid .tech-card:first-child {
  grid-column: 1;
}

.charts-grid .tech-card:last-child {
  grid-column: 2;
}

/* 按钮组优化 */
.action-buttons {
  justify-content: flex-start;
}

/* 状态信息样式优化 */
:deep(.el-alert) {
  border-radius: 8px;
  border: 1px solid;
}

:deep(.el-alert--success) {
  background-color: rgba(72, 187, 120, 0.1);
  border-color: rgba(72, 187, 120, 0.3);
}

:deep(.el-alert--error) {
  background-color: rgba(245, 108, 108, 0.1);
  border-color: rgba(245, 108, 108, 0.3);
}

:deep(.el-alert--info) {
  background-color: rgba(144, 147, 153, 0.1);
  border-color: rgba(144, 147, 153, 0.3);
}

:deep(.el-alert--warning) {
  background-color: rgba(230, 162, 60, 0.1);
  border-color: rgba(230, 162, 60, 0.3);
}
</style>
