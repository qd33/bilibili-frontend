<<<<<<< HEAD
<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
    // 这里后续替换为真实的API调用
    console.log('加载B站数据...')
  }, 1000)
})
</script>

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

    <!-- 视频列表区域 -->
    <div class="tech-card">
      <h3 class="section-title">热门视频</h3>
      <div class="video-list-placeholder">
        <p>🎬 视频列表瀑布流开发中...</p>
      </div>
    </div>
  </div>
</template>

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

.video-list-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: var(--text-secondary);
  border: 1px dashed #4a5568;
}
</style>
=======
<script setup lang="ts"></script>

<template>
  <h1>You did it!</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
</template>

<style scoped></style>
>>>>>>> 8288dbe540b89ef5495d00e47bb32151c33fee87
