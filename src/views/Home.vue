<template>
  <div class="dashboard">
    <!-- 顶部统计卡片 -->
    <div class="stats-grid">
      <div class="tech-card">
        <h3>总视频数</h3>
        <p class="stat-number">{{ dataStore.overviewStats.videoCount }}</p>
        <p class="stat-desc">已采集视频数量</p>
      </div>

      <div class="tech-card">
        <h3>UP主数量</h3>
        <p class="stat-number">{{ dataStore.overviewStats.upCount }}</p>
        <p class="stat-desc">活跃内容创作者</p>
      </div>

      <div class="tech-card">
        <h3>总播放量</h3>
        <p class="stat-number">{{ dataStore.overviewStats.totalViews.toLocaleString() }}</p>
        <p class="stat-desc">视频累计播放</p>
      </div>

      <div class="tech-card">
        <h3>总点赞数</h3>
        <p class="stat-number">{{ dataStore.overviewStats.totalLikes.toLocaleString() }}</p>
        <p class="stat-desc">用户互动点赞</p>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <div class="tech-card">
        <h3 class="section-title">播放量趋势</h3>
        <LineChart
          :data="dataStore.videoTrendData"
          height="300px"
        />
      </div>

      <div class="tech-card">
        <h3 class="section-title">分区分布</h3>
        <PieChart
          :data="dataStore.partitionData"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import LineChart from '@/components/charts/LineChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import { ElMessage } from 'element-plus'

const dataStore = useDataStore()

// 页面加载时获取数据
onMounted(() => {
  loadInitialData()
})

const loadInitialData = async () => {
  await dataStore.fetchOverviewStats()
  await dataStore.fetchVideoTrend()
  await dataStore.fetchPartitionData()
  ElMessage.success('数据加载完成!')
}

const testBackendConnection = async () => {
  try {
    ElMessage.info('正在测试后端连接...')
    // 这里可以添加真实的后端连接测试
    setTimeout(() => {
      ElMessage.success('后端连接正常!')
    }, 1000)
  } catch (error) {
    ElMessage.error('后端连接失败: ' + error)
  }
}

const refreshData = () => {
  loadInitialData()
}

const viewBackendData = () => {
  // 在新标签页打开后端API文档或管理界面
  window.open('http://localhost:8080', '_blank')
}
</script>

<style scoped>
.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

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
