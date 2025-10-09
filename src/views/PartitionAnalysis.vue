<template>
  <div class="partition-analysis-page">
    <div class="page-header">
      <h1>分区分析</h1>
      <p>分析B站各分区的内容分布和热度趋势</p>
    </div>

    <div class="charts-grid">
      <div class="tech-card">
        <h3 class="section-title">分区视频数量分布</h3>
        <div class="chart-container">
          <PieChart
            :data="partitionData"
            height="350px"
          />
        </div>
      </div>

      <div class="tech-card">
        <h3 class="section-title">分区播放量对比</h3>
        <div class="chart-placeholder">
          <p>📊 柱状图开发中...</p>
          <p>显示各分区播放量对比</p>
        </div>
      </div>
    </div>

    <div class="tech-card">
      <h3 class="section-title">分区热度趋势</h3>
      <div class="chart-placeholder">
        <p>📈 多线图开发中...</p>
        <p>显示各分区随时间的热度变化</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PieChart from '@/components/charts/PieChart.vue'

const partitionData = ref([
  { value: 25, name: '生活区' },
  { value: 20, name: '游戏区' },
  { value: 18, name: '知识区' },
  { value: 15, name: '音乐区' },
  { value: 12, name: '科技区' },
  { value: 10, name: '动画区' }
])
</script>

<style scoped>
.partition-analysis-page {
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

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.chart-container {
  height: 350px;
}

.chart-placeholder {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px dashed #4a5568;
  color: var(--text-secondary);
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .partition-analysis-page {
    padding: 10px;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .page-header p {
    font-size: 0.9rem;
  }

  .charts-grid {
    gap: 15px;
  }

  .chart-container,
  .chart-placeholder {
    height: 300px;
  }
}
</style>
