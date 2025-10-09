<template>
  <div class="video-detail-page">
    <div class="page-header">
      <h1>视频分析</h1>
      <p>深度分析单个视频的表现数据</p>
    </div>

    <div class="content-grid">
      <div class="tech-card">
        <h3 class="section-title">视频基本信息</h3>
        <div class="video-info">
          <div class="info-item">
            <span class="label">视频标题：</span>
            <span class="value">示例视频标题</span>
          </div>
          <div class="info-item">
            <span class="label">UP主：</span>
            <span class="value">示例UP主</span>
          </div>
          <div class="info-item">
            <span class="label">发布时间：</span>
            <span class="value">2024-10-09</span>
          </div>
          <div class="info-item">
            <span class="label">分区：</span>
            <span class="value">科技</span>
          </div>
        </div>
      </div>

      <div class="tech-card">
        <h3 class="section-title">数据趋势</h3>
        <div class="chart-container">
          <LineChart
            :data="viewTrendData"
            height="300px"
          />
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="tech-card">
        <h3>播放量</h3>
        <p class="stat-number">1,234,567</p>
        <p class="stat-desc">累计播放</p>
      </div>

      <div class="tech-card">
        <h3>点赞数</h3>
        <p class="stat-number">89,123</p>
        <p class="stat-desc">用户点赞</p>
      </div>

      <div class="tech-card">
        <h3>投币数</h3>
        <p class="stat-number">45,678</p>
        <p class="stat-desc">硬币投递</p>
      </div>

      <div class="tech-card">
        <h3>收藏数</h3>
        <p class="stat-number">67,890</p>
        <p class="stat-desc">用户收藏</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LineChart from '@/components/charts/LineChart.vue'

const viewTrendData = ref({
  xAxis: ['10-01', '10-02', '10-03', '10-04', '10-05', '10-06', '10-07'],
  series: [120, 200, 150, 80, 70, 110, 130]
})
</script>

<style scoped>
.video-detail-page {
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

.video-info {
  padding: 15px 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #2d3748;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  color: var(--text-secondary);
  font-weight: 500;
}

.value {
  color: var(--text-primary);
  font-weight: 600;
}

.chart-container {
  height: 300px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-number {
  font-size: 2rem;
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
  .video-detail-page {
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

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .stat-number {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
