<template>
  <div class="up-analysis-page">
    <div class="page-header">
      <h1>UP主分析</h1>
      <p>深入分析UP主的成长轨迹和内容表现</p>
    </div>

    <div class="content-grid">
      <div class="tech-card">
        <h3 class="section-title">UP主信息</h3>
        <div class="up-info">
          <div class="avatar-placeholder"></div>
          <div class="info-content">
            <h4>示例UP主</h4>
            <p>UID: 12345678</p>
            <p>粉丝数: 1,234,567</p>
            <p>视频数: 89</p>
          </div>
        </div>
      </div>

      <div class="tech-card">
        <h3 class="section-title">粉丝增长趋势</h3>
        <div class="chart-container">
          <LineChart
            :data="fansTrendData"
            height="300px"
          />
        </div>
      </div>
    </div>

    <div class="tech-card">
      <h3 class="section-title">视频数据分布</h3>
      <div class="chart-container">
        <PieChart
          :data="videoDistributionData"
          height="400px"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LineChart from '@/components/charts/LineChart.vue'
import PieChart from '@/components/charts/PieChart.vue'

const fansTrendData = ref({
  xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月'],
  series: [100, 150, 230, 340, 480, 650, 780, 900, 1100, 1234]
})

const videoDistributionData = ref([
  { value: 40, name: '生活区' },
  { value: 25, name: '科技区' },
  { value: 20, name: '游戏区' },
  { value: 15, name: '音乐区' }
])
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

.content-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  margin-bottom: 30px;
}

.up-info {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 0;
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
  font-size: 1.5rem;
}

.info-content h4 {
  font-size: 1.3rem;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.info-content p {
  color: var(--text-secondary);
  margin: 4px 0;
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

  .content-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .up-info {
    flex-direction: column;
    text-align: center;
  }

  .chart-container {
    height: 250px;
  }
}
</style>
