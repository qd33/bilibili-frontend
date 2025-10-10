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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import LineChart from '@/components/charts/LineChart.vue'
import PieChart from '@/components/charts/PieChart.vue'

// 模拟数据 - 后续替换为真实API
const stats = ref({
  videoCount: 156,
  upCount: 42,
  totalViews: 1258473,
  totalLikes: 89234
})

const chartData = ref({
  viewTrend: {
    xAxis: ['10-01', '10-02', '10-03', '10-04', '10-05', '10-06', '10-07'],
    series: [120, 200, 150, 80, 70, 110, 130]
  },
  partitionData: [
    { value: 40, name: '生活' },
    { value: 30, name: '科技' },
    { value: 20, name: '游戏' },
    { value: 10, name: '音乐' }
  ]
})

// 模拟从后端获取数据
onMounted(() => {
  setTimeout(() => {
    console.log('加载B站数据...')
  }, 1000)
})

const testBackendConnection = async () => {
  try {
    ElMessage.info('正在测试后端连接...')
    setTimeout(() => {
      ElMessage.success('后端连接正常!')
    }, 1000)
  } catch (error) {
    ElMessage.error('后端连接失败: ' + error)
  }
}

const refreshData = () => {
  ElMessage.info('刷新数据...')
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
