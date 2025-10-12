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
        <LineChart
          :data="chartData.viewTrend"
          height="300px"
        />
      </div>

      <div class="tech-card">
        <h3 class="section-title">分区分布</h3>
        <PieChart
          :data="chartData.partitionData"
          height="300px"
        />
      </div>
    </div>

    <!-- 快速操作区域 -->
    <div class="tech-card">
      <h3 class="section-title">数据采集</h3>
      <div class="action-buttons">
        <el-button type="primary" @click="testBackendConnection">
          测试后端连接
        </el-button>
        <el-button type="success" @click="refreshData">
          刷新数据
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import LineChart from '@/components/charts/LineChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import { useDataStore } from '@/stores/dataStore'
import request from '@/utils/request'

const dataStore = useDataStore()

// 使用真实数据
const stats = ref(dataStore.overviewStats)
const chartData = ref({
  viewTrend: dataStore.videoTrendData,
  partitionData: dataStore.partitionData
})

const connectionStatus = ref<{title: string, type: 'success' | 'error' | 'info'} | null>(null)

// 页面加载时获取真实数据
onMounted(async () => {
  await dataStore.fetchOverviewStats()
  await dataStore.fetchVideoTrend()
  await dataStore.fetchPartitionData()
})

const testBackendConnection = async () => {
  try {
    ElMessage.info('正在测试后端连接...')
    connectionStatus.value = { title: '正在连接后端服务...', type: 'info' }

    // 测试基础连接
    const helloResponse = await request.get('/test/hello')
    console.log('基础连接测试:', helloResponse)

    // 测试视频接口
    const videoTest = await request.get('/video/test')
    console.log('视频接口测试:', videoTest)

    // 测试服务层
    const serviceTest = await request.get('/test/services')
    console.log('服务层测试:', serviceTest)

    connectionStatus.value = {
      title: `后端连接正常！服务状态: ${videoTest}`,
      type: 'success'
    }
    ElMessage.success('所有后端接口测试通过！')

  } catch (error: any) {
    const errorMsg = error.response?.data || error.message
    connectionStatus.value = {
      title: `连接失败: ${errorMsg}`,
      type: 'error'
    }
    ElMessage.error('后端连接测试失败: ' + errorMsg)
    console.error('连接测试错误:', error)
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

const viewBackendData = () => {
  window.open('http://localhost:8080', '_blank')
}
</script>

<style scoped>
.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--accent-blue);
  margin: 10px 0;
  text-shadow: 0 0 10px rgba(0, 174, 236, 0.3);
}

.stat-desc {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.connection-status {
  margin-top: 15px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button {
    width: 100%;
  }
}
</style>
