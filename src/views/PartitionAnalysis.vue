<template>
  <div class="partition-analysis">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>📊 分区数据分析</h1>
      <p>实时监控B站各内容分区数据表现</p>
    </div>

    <!-- 分区选择器 -->
    <div class="partition-selector">
      <div class="selector-header">
        <h3>选择分区</h3>
        <el-button
          type="primary"
          size="small"
          @click="refreshCurrentPartition"
          :loading="loading"
        >
          <el-icon><Refresh /></el-icon>
          刷新当前分区
        </el-button>
      </div>

      <div class="partition-grid">
        <div
          v-for="partition in partitions"
          :key="partition.id"
          class="partition-card"
          :class="{ active: activePartition === partition.id }"
          @click="switchPartition(partition.id)"
          :style="{ borderColor: partition.color }"
        >
          <div class="partition-icon" :style="{ backgroundColor: partition.color }">
            {{ getPartitionIcon(partition.id) }}
          </div>
          <div class="partition-info">
            <h4>{{ partition.name }}</h4>
            <span class="partition-id">ID: {{ partition.id }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据概览 -->
    <div class="stats-section" v-if="currentStats.length > 0">
      <h3>📈 数据概览</h3>
      <div class="stats-grid">
        <div
          v-for="stat in currentStats"
          :key="stat.title"
          class="stat-item"
        >
          <div class="stat-icon">{{ stat.icon }}</div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-title">{{ stat.title }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门视频排行 -->
    <div class="ranking-section">
      <div class="section-header">
        <h3>🔥 {{ currentPartitionName }}热门视频排行</h3>
        <span class="video-count">TOP {{ rankingVideos.length }}</span>
      </div>

      <div v-if="rankingVideos.length > 0" class="video-list">
        <div
          v-for="(video, index) in rankingVideos"
          :key="video.id"
          class="video-item"
          @click="openVideo(video)"
        >
          <div class="video-rank" :class="getRankClass(index)">
            {{ index + 1 }}
          </div>
          <div class="video-content">
            <!-- 🆕 修复：使用 ImageWithFallback 组件处理封面 -->
            <ImageWithFallback
              :src="video.cover"
              :alt="video.title"
              :enable-proxy="true"
              class="video-cover"
              img-class="cover-image"
            />
            <div class="video-info">
              <h4 class="video-title">{{ video.title }}</h4>
              <div class="video-meta">
                <span class="up-name">{{ video.upName }}</span>
                <!-- 🆕 修复：显示格式化后的发布时间 -->
                <span class="publish-time">{{ video.publishTime }}</span>
              </div>
              <div class="video-stats">
                <span class="stat play">
                  <el-icon><VideoPlay /></el-icon>
                  {{ formatNumber(video.play) }}
                </span>
                <span class="stat like">
                  <el-icon><Star /></el-icon>
                  {{ formatNumber(video.like) }}
                </span>
                <span class="stat danmaku">
                  <el-icon><ChatDotRound /></el-icon>
                  {{ formatNumber(video.danmaku) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 无数据时的占位 -->
      <div v-else class="empty-videos">
        <div class="empty-icon">📺</div>
        <p class="empty-text">暂无视频数据</p>
        <el-button type="primary" @click="refreshCurrentPartition">
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 分区分布图表 -->
    <div class="distribution-section" v-if="partitionDistribution.length > 0">
      <h3>🎯 分区内容分布</h3>
      <PieChart
        :data="pieChartData"
        :width="'100%'"
        :height="'400px'"
      />
    </div>

    <!-- 加载状态 -->
    <Loading
      v-if="loading"
      :message="'正在加载分区数据...'"
      :fullscreen="false"
    />

    <!-- 错误状态 -->
    <div v-if="error" class="error-message">
      <el-alert
        :title="error"
        type="error"
        show-icon
        closable
        @close="clearError"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, VideoPlay, Star, ChatDotRound } from '@element-plus/icons-vue'
import { usePartitionStore } from '@/stores/partitionStore'
import PieChart from '@/components/charts/PieChart.vue'
import Loading from '@/components/common/Loading.vue'
import ImageWithFallback from '@/components/common/ImageWithFallback.vue' // 🆕 导入图片组件

const partitionStore = usePartitionStore()

// 响应式数据
const activePartition = ref('life')
const loading = computed(() => partitionStore.loading)
const error = computed(() => partitionStore.error)

// 计算属性
const partitions = computed(() => partitionStore.partitions)
const currentPartitionName = computed(() => {
  const partition = partitions.value.find(p => p.id === activePartition.value)
  return partition?.name || ''
})

const currentStats = computed(() => {
  const stats = partitionStore.partitionStats[activePartition.value]
  console.log('当前统计:', stats)
  return stats || []
})

const rankingVideos = computed(() => {
  const videos = partitionStore.partitionVideos[activePartition.value] || []
  console.log('当前视频:', videos)
  return videos.slice(0, 10) // 只显示前10个
})

const partitionDistribution = computed(() => {
  const distribution = partitionStore.partitionDistribution
  console.log('分布数据:', distribution)
  return distribution
})

// 为饼图准备数据
const pieChartData = computed(() => {
  return partitionDistribution.value.map(item => ({
    value: item.value || 0,
    name: item.name || '未知'
  }))
})

// 方法
const switchPartition = async (partitionId: string) => {
  activePartition.value = partitionId
  await partitionStore.fetchPartitionOverview(partitionId)
}

const refreshCurrentPartition = async () => {
  if (activePartition.value) {
    await partitionStore.triggerPartitionCrawl(activePartition.value)
  }
}

const getPartitionIcon = (partitionId: string) => {
  const icons: Record<string, string> = {
    life: '🏠', game: '🎮', knowledge: '📚', music: '🎵',
    tech: '💻', animation: '🎬', dance: '💃', ent: '🎭'
  }
  return icons[partitionId] || '📁'
}

const getRankClass = (index: number) => {
  if (index === 0) return 'rank-1'
  if (index === 1) return 'rank-2'
  if (index === 2) return 'rank-3'
  return 'rank-normal'
}

const formatNumber = (num: any): string => {
  // 防御性编程，处理undefined、null等情况
  if (num === undefined || num === null) {
    return '0'
  }

  // 如果是字符串，尝试清理
  if (typeof num === 'string') {
    // 移除逗号等分隔符
    num = num.replace(/,/g, '')
    // 处理带单位的字符串
    if (num.includes('万')) {
      num = parseFloat(num) * 10000
    } else if (num.includes('亿')) {
      num = parseFloat(num) * 100000000
    }
  }

  // 确保是数字类型
  const numberValue = Number(num)

  // 检查是否为有效数字
  if (isNaN(numberValue)) {
    return '0'
  }

  // 处理负数情况
  const absoluteValue = Math.abs(numberValue)

  if (absoluteValue >= 100000000) {
    return (absoluteValue / 100000000).toFixed(1) + '亿'
  } else if (absoluteValue >= 10000) {
    return (absoluteValue / 10000).toFixed(1) + '万'
  } else if (absoluteValue >= 1000) {
    return (absoluteValue / 1000).toFixed(1) + '千'
  }

  return Math.round(absoluteValue).toString()
}

const openVideo = (video: any) => {
  // 在实际项目中这里会跳转到视频详情页或新窗口打开
  if (video.id && (video.id.startsWith('BV') || video.id.includes('-'))) {
    ElMessage.info(`查看视频: ${video.title}`)
  } else {
    ElMessage.info('视频链接不可用')
  }
}

const clearError = () => {
  partitionStore.error = null
}

// 生命周期
onMounted(async () => {
  // 直接使用本地分区列表，不需要fetchPartitions方法
  if (partitions.value.length > 0) {
    await switchPartition(partitions.value[0].id)
  }
})
</script>

<style scoped>
.partition-analysis {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* 🆕 添加封面图片样式 */
.video-cover {
  width: 120px;
  height: 75px;
  border-radius: 6px;
  object-fit: cover;
  margin-right: 16px;
  transition: transform 0.3s ease;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-item:hover .video-cover {
  transform: scale(1.05);
}

/* 其他样式保持不变... */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.partition-selector {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  border: 1px solid var(--border-color);
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.partition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.partition-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.partition-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.partition-card.active {
  border-color: var(--accent-blue);
  background: rgba(0, 174, 236, 0.1);
}

.partition-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-right: 12px;
}

.partition-info h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  color: var(--text-primary);
}

.partition-id {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.stats-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  border: 1px solid var(--border-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
  margin-right: 16px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-title {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.ranking-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  border: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.video-count {
  background: var(--accent-blue);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: bold;
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.video-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.video-item:hover {
  transform: translateX(4px);
  border-color: var(--accent-blue);
  background: rgba(0, 174, 236, 0.05);
}

.video-rank {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 16px;
  flex-shrink: 0;
  font-size: 0.9rem;
}

.rank-1 {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #000;
}

.rank-2 {
  background: linear-gradient(135deg, #c0c0c0, #e0e0e0);
  color: #000;
}

.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #e59e5c);
  color: #000;
}

.rank-normal {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.video-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.video-info {
  flex: 1;
}

.video-title {
  margin: 0 0 8px 0;
  font-size: 1rem;
  line-height: 1.4;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.video-stats {
  display: flex;
  gap: 16px;
  font-size: 0.8rem;
}

.video-stats .stat {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
}

.video-stats .stat.play {
  color: #ff6b6b;
}

.video-stats .stat.like {
  color: #4ecdc4;
}

.video-stats .stat.danmaku {
  color: #45b7d1;
}

.empty-videos {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.distribution-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--border-color);
}

.error-message {
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .partition-analysis {
    padding: 16px;
  }

  .partition-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .video-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .video-cover {
    width: 100%;
    height: 150px;
    margin-right: 0;
    margin-bottom: 12px;
  }

  .video-meta {
    flex-direction: column;
    gap: 4px;
  }

  .video-stats {
    flex-wrap: wrap;
    gap: 8px;
  }
}

/* 深色主题变量 */
:root {
  --bg-primary: #0f1421;
  --bg-secondary: #1a2332;
  --text-primary: #ffffff;
  --text-secondary: #a0aec0;
  --border-color: #2d3748;
  --accent-blue: #00aeec;
}
</style>
