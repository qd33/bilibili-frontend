<template>
  <div class="tag-analysis-page">
    <div class="page-header">
      <h1>标签分析</h1>
      <p>探索视频标签的热度分布和关联关系</p>
    </div>

    <div class="content-grid">
      <div class="tech-card">
        <h3 class="section-title">热门标签</h3>
        <div class="tags-cloud">
          <span
            v-for="tag in hotTags"
            :key="tag.name"
            class="tag"
            :style="{ fontSize: tag.size + 'px', color: tag.color }"
          >
            {{ tag.name }}
          </span>
        </div>
      </div>

      <div class="tech-card">
        <h3 class="section-title">标签使用频率</h3>
        <div class="chart-placeholder">
          <p>📊 标签频率图表开发中...</p>
          <p>显示各标签的使用次数</p>
        </div>
      </div>
    </div>

    <div class="tech-card">
      <h3 class="section-title">标签关联分析</h3>
      <div class="chart-placeholder">
        <p>🔗 关系图开发中...</p>
        <p>显示标签之间的关联关系</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const hotTags = ref([
  { name: 'Vlog', size: 24, color: '#00aeec' },
  { name: '游戏', size: 32, color: '#8b5cf6' },
  { name: '音乐', size: 20, color: '#10b981' },
  { name: '科技', size: 28, color: '#f59e0b' },
  { name: '生活', size: 36, color: '#ef4444' },
  { name: '知识', size: 26, color: '#00aeec' },
  { name: '动画', size: 22, color: '#8b5cf6' },
  { name: '美食', size: 18, color: '#10b981' },
  { name: '运动', size: 16, color: '#f59e0b' },
  { name: '搞笑', size: 30, color: '#ef4444' }
])
</script>

<style scoped>
.tag-analysis-page {
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
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.tag {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.tag:hover {
  transform: scale(1.1);
  background: rgba(0, 174, 236, 0.3);
}

.chart-placeholder {
  height: 300px;
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
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .tag-analysis-page {
    padding: 10px;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .page-header p {
    font-size: 0.9rem;
  }

  .content-grid {
    gap: 15px;
  }

  .tags-cloud {
    padding: 15px;
    min-height: 250px;
  }

  .tag {
    padding: 4px 8px;
    font-size: 14px !important;
  }

  .chart-placeholder {
    height: 250px;
  }
}
</style>
