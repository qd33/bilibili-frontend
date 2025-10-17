<!-- views/TagAnalysis.vue -->
<template>
  <div class="tag-analysis-system dark-theme">
    <!-- 头部导航 -->
    <div class="system-header">
      <div class="header-main">
        <h1>🏷️ B站标签智能分析系统</h1>
        <p>基于B站API的实时标签数据分析与趋势预测</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="triggerDataUpdate">
          <el-icon><Refresh /></el-icon>
          更新数据
        </el-button>
        <el-button @click="showSystemInfo">
          <el-icon><InfoFilled /></el-icon>
          系统信息
        </el-button>
      </div>
    </div>

    <!-- 主控制区 -->
    <div class="main-controls">
      <div class="control-group">
        <div class="control-item">
          <span class="control-label">时间范围:</span>
          <el-radio-group v-model="filters.timeRange" @change="updateData">
            <el-radio-button label="1d">24小时</el-radio-button>
            <el-radio-button label="7d">7天</el-radio-button>
            <el-radio-button label="30d">30天</el-radio-button>
          </el-radio-group>
        </div>

        <div class="control-item">
          <span class="control-label">内容分区:</span>
          <el-select v-model="filters.partition" placeholder="全部分区" @change="updateData">
            <el-option label="全部分区" value="all" />
            <el-option v-for="partition in partitions" :key="partition.value" :label="partition.label" :value="partition.value" />
          </el-select>
        </div>

        <div class="control-item">
          <span class="control-label">标签分类:</span>
          <el-select v-model="filters.category" placeholder="全部分类" @change="updateData">
            <el-option label="全部分类" value="all" />
            <el-option v-for="category in categories" :key="category.value" :label="category.label" :value="category.value" />
          </el-select>
        </div>
      </div>

      <div class="search-group">
        <el-input v-model="searchKeyword" placeholder="搜索标签名称..." clearable @keyup.enter="handleSearch" @clear="handleClearSearch">
          <template #prepend>
            <el-select v-model="searchType" style="width: 110px">
              <el-option label="标签名" value="name" />
              <el-option label="视频标题" value="title" />
              <el-option label="UP主" value="up" />
            </el-select>
          </template>
          <template #append>
            <el-button type="primary" @click="handleSearch" :loading="searchLoading">
              <el-icon><Search /></el-icon>搜索
            </el-button>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 数据概览 -->
    <div class="data-overview">
      <el-row :gutter="20">
        <el-col :span="6" v-for="stat in overviewStats" :key="stat.title">
          <div class="overview-card" :style="{ borderLeftColor: stat.color }">
            <div class="overview-icon" :style="{ backgroundColor: stat.color }">{{ stat.icon }}</div>
            <div class="overview-content">
              <div class="overview-value">{{ stat.value }}</div>
              <div class="overview-title">{{ stat.title }}</div>
              <div class="overview-trend" :class="stat.trend">
                <el-icon v-if="stat.trend === 'up'"><Top /></el-icon>
                <el-icon v-else-if="stat.trend === 'down'"><Bottom /></el-icon>
                {{ stat.change }}
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 热门标签云 -->
    <div class="tag-cloud-section">
      <h3>🌈 热门标签云</h3>
      <div class="tag-cloud">
        <span
          v-for="tag in tagCloud"
          :key="tag.name"
          class="tag"
          :style="{
            fontSize: `${tag.size}px`,
            color: tag.color,
            opacity: tag.opacity
          }"
          @click="selectTag(tag)"
        >
          {{ tag.name }}
        </span>
      </div>
    </div>

    <!-- 操作面板 -->
    <div class="action-panel">
      <el-button-group>
        <el-button type="primary" @click="triggerCrawl" :loading="crawling">
          <el-icon><Refresh /></el-icon>更新数据
        </el-button>
        <el-button type="success" @click="exportData">
          <el-icon><Download /></el-icon>导出数据
        </el-button>
        <el-button type="warning" @click="showComparison = !showComparison">
          <el-icon><DataAnalysis /></el-icon>{{ showComparison ? '隐藏' : '显示' }}数据对比
        </el-button>
      </el-button-group>
    </div>

    <!-- 数据对比面板 -->
    <div v-if="showComparison" class="comparison-panel">
      <h3>📊 标签数据对比</h3>
      <div class="comparison-cards">
        <div v-for="tag in comparedTags" :key="tag.name" class="comparison-card" :style="{ borderColor: tag.color }">
          <div class="comparison-header">
            <span class="tag-name">{{ tag.name }}</span>
            <el-button type="danger" size="small" text @click="removeFromComparison(tag)">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <div class="comparison-stats">
            <div class="comparison-stat"><span>视频数量</span><span class="stat-value">{{ formatNumber(tag.videoCount) }}</span></div>
            <div class="comparison-stat"><span>月播放量</span><span class="stat-value">{{ formatNumber(tag.monthlyPlay) }}</span></div>
            <div class="comparison-stat"><span>增长率</span><span class="stat-value" :class="tag.growth > 0 ? 'positive' : 'negative'">{{ tag.growth > 0 ? '+' : '' }}{{ tag.growth }}%</span></div>
          </div>
        </div>
        <div v-if="comparedTags.length < 3" class="add-comparison-card" @click="addCurrentToComparison">
          <el-icon><Plus /></el-icon><span>添加对比</span>
        </div>
      </div>
    </div>

    <!-- 标签榜单 -->
    <div class="tag-ranking-section">
      <el-card class="ranking-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>🔥 标签热度榜单</span>
            <div class="header-actions">
              <el-radio-group v-model="rankingType" size="small">
                <el-radio-button label="hot">热度榜</el-radio-button>
                <el-radio-button label="growth">飙升榜</el-radio-button>
                <el-radio-button label="new">新锐榜</el-radio-button>
              </el-radio-group>
              <el-button size="small" @click="exportRankingData"><el-icon><Download /></el-icon>导出</el-button>
            </div>
          </div>
        </template>

        <el-table
          :data="currentRanking"
          style="width: 100%"
          @row-click="handleRowClick"
          v-loading="tableLoading"
          class="dark-table"
        >
          <el-table-column label="排名" width="80">
            <template #default="{ $index }">
              <div class="rank-cell" :class="getRankClass($index)">{{ $index + 1 }}</div>
            </template>
          </el-table-column>

          <el-table-column label="标签" min-width="150">
            <template #default="{ row }">
              <div class="tag-info">
                <span class="tag-name">{{ row.name }}</span>
                <el-tag size="small" effect="plain" :color="row.categoryColor">{{ row.category }}</el-tag>
                <el-tag v-if="row.isNew" size="small" type="danger" class="new-badge">新</el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="热度值" width="120" v-if="rankingType === 'hot'">
            <template #default="{ row }"><div class="metric-value">{{ formatNumber(row.hotValue) }}</div></template>
          </el-table-column>

          <el-table-column label="增长率" width="120" v-if="rankingType === 'growth'">
            <template #default="{ row }"><div class="metric-value" :class="row.growth > 0 ? 'positive' : 'negative'">{{ row.growth > 0 ? '+' : '' }}{{ row.growth }}%</div></template>
          </el-table-column>

          <el-table-column label="新增视频" width="100" v-if="rankingType === 'new'">
            <template #default="{ row }"><div class="metric-value">+{{ row.newVideos }}</div></template>
          </el-table-column>

          <el-table-column label="视频数量" width="120">
            <template #default="{ row }">{{ formatNumber(row.videoCount) }}</template>
          </el-table-column>

          <el-table-column label="播放量" width="120">
            <template #default="{ row }">{{ formatNumber(row.playCount) }}</template>
          </el-table-column>

          <el-table-column label="互动率" width="120">
            <template #default="{ row }">
              <el-progress :percentage="row.interactionRate" :show-text="false" :stroke-width="8" :color="getInteractionColor(row.interactionRate)" />
              <span class="interaction-text">{{ row.interactionRate }}%</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click.stop="analyzeTag(row)">分析</el-button>
              <el-button size="small" type="primary" @click.stop="compareTag(row)">对比</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 标签详情分析 -->
    <div class="tag-detail-analysis" v-if="selectedTag">
      <el-row :gutter="20">
        <!-- 左侧：基础信息 -->
        <el-col :span="8">
          <el-card class="info-card" shadow="hover">
            <template #header><span>📋 标签基本信息</span></template>
            <div class="tag-basic-info">
              <div class="tag-header">
                <h3>{{ selectedTag.name }}</h3>
                <el-tag :type="getTagLevel(selectedTag.hotValue)">{{ getTagLevelText(selectedTag.hotValue) }}</el-tag>
              </div>

              <div class="info-grid">
                <div class="info-item" v-for="item in basicInfo" :key="item.label">
                  <span class="info-label">{{ item.label }}:</span>
                  <span class="info-value">{{ item.value }}</span>
                </div>
              </div>

              <div class="partition-distribution">
                <h4>分区分布</h4>
                <div class="partition-list">
                  <div v-for="partition in selectedTag.partitions" :key="partition.name" class="partition-item">
                    <div class="partition-header">
                      <span>{{ partition.name }}</span>
                      <span>{{ partition.percentage }}%</span>
                    </div>
                    <el-progress :percentage="partition.percentage" :stroke-width="10" :color="partition.color" />
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 中间：趋势分析 -->
        <el-col :span="8">
          <el-card class="trend-card" shadow="hover">
            <template #header><span>📈 趋势分析</span></template>
            <div class="trend-content">
              <div class="trend-tabs">
                <el-radio-group v-model="trendMetric" size="small">
                  <el-radio-button label="play">播放量</el-radio-button>
                  <el-radio-button label="video">视频数</el-radio-button>
                  <el-radio-button label="interaction">互动率</el-radio-button>
                </el-radio-group>
              </div>

              <div class="trend-chart">
                <div v-for="(point, index) in trendData" :key="index" class="trend-bar" :style="{ height: `${point.value}%` }" :class="getTrendBarClass(point.value)" @mouseenter="showTrendTooltip(point, index)" @mouseleave="hideTooltip">
                  <div class="bar-value">{{ point.value }}</div>
                  <div class="bar-label">{{ point.label }}</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：关联分析 -->
        <el-col :span="8">
          <el-card class="relation-card" shadow="hover">
            <template #header><span>🔗 关联分析</span></template>
            <div class="relation-content">
              <div class="related-tags">
                <h4>相关标签</h4>
                <div class="tags-cloud">
                  <el-tag v-for="tag in relatedTags" :key="tag.name" class="related-tag" :color="tag.color" effect="dark" @click="analyzeTag(tag)">
                    {{ tag.name }}<span class="correlation">{{ tag.correlation }}</span>
                  </el-tag>
                </div>
              </div>

              <div class="top-videos">
                <h4>热门视频</h4>
                <div class="video-list">
                  <div v-for="video in topVideos" :key="video.id" class="video-item" @click="openVideo(video)">
                    <div class="video-cover"><img :src="video.cover" :alt="video.title" /></div>
                    <div class="video-info">
                      <div class="video-title">{{ video.title }}</div>
                      <div class="video-up">{{ video.upName }}</div>
                      <div class="video-stats">
                        <span>播放: {{ formatNumber(video.play) }}</span>
                        <span>点赞: {{ formatNumber(video.like) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 对比分析 -->
    <div class="comparison-analysis" v-if="comparedTags.length > 0">
      <el-card shadow="hover">
        <template #header>
          <div class="comparison-header">
            <span>📊 标签对比分析</span>
            <el-button size="small" @click="clearComparison"><el-icon><Close /></el-icon>清空对比</el-button>
          </div>
        </template>

        <div class="comparison-content">
          <el-table :data="comparisonData" style="width: 100%" class="dark-table">
            <el-table-column label="指标" width="150" fixed>
              <template #default="{ row }"><strong>{{ row.metric }}</strong></template>
            </el-table-column>
            <el-table-column v-for="tag in comparedTags" :key="tag.name" :label="tag.name" width="200">
              <template #default="{ row }">
                <div class="comparison-value" :class="getComparisonClass(row.values[tag.name], row.metric)">{{ row.values[tag.name] }}</div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>

    <!-- 演示控制 -->
    <div class="demo-controls">
      <el-button type="primary" @click="autoPlayDemo" :loading="autoPlaying">
        {{ autoPlaying ? '自动演示中...' : '开始自动演示' }}
      </el-button>
      <el-button @click="stopAutoPlay">停止演示</el-button>
    </div>

    <!-- 数据更新时间 -->
    <div class="update-time">数据更新时间: {{ lastUpdateTime }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, InfoFilled, Search, Download, DataAnalysis, Close, Plus, Top, Bottom } from '@element-plus/icons-vue'
import { useTagStore } from '@/stores/tagStore'

// 使用标签store
const tagStore = useTagStore()

// 响应式数据
const filters = ref({
  timeRange: '7d',
  partition: 'all',
  category: 'all'
})

const searchKeyword = ref('')
const searchType = ref('name')
const searchLoading = ref(false)
const rankingType = ref('hot')
const tableLoading = ref(false)
const selectedTag = ref<any>(null)
const comparedTags = ref<any[]>([])
const trendMetric = ref('play')
const lastUpdateTime = ref('')
const showComparison = ref(false)
const crawling = ref(false)
const autoPlaying = ref(false)
let autoPlayInterval: number

// 模拟数据 - 标签分类
const tagCategories = [
  { name: '题材', color: '#ff6b6b' },
  { name: '风格', color: '#4ecdc4' },
  { name: '情感', color: '#45b7d1' },
  { name: '场景', color: '#96ceb4' },
  { name: '技术', color: '#feca57' },
  { name: '人物', color: '#ff9ff3' }
]

const partitions = ref([
  { label: '生活', value: 'life' }, { label: '游戏', value: 'game' }, { label: '知识', value: 'knowledge' },
  { label: '音乐', value: 'music' }, { label: '科技', value: 'tech' }, { label: '动画', value: 'animation' }
])

const categories = ref([
  { label: '题材类型', value: 'theme' }, { label: '内容风格', value: 'style' }, { label: '情感表达', value: 'emotion' }
])

// 生成模拟标签数据
const generateTags = () => {
  const tagNames = [
    'Vlog', '教程', '开箱', '测评', '美食', '旅行', '音乐', '舞蹈',
    '游戏', '动画', '科技', '知识', '搞笑', '治愈', '励志', '科普',
    '手工', '摄影', '运动', '宠物', '时尚', '美妆', '家居', '汽车',
    '数码', '电影', '读书', '历史', '科学', '编程', '设计', '创业'
  ]

  return tagNames.map((name, index) => {
    const categoryIndex = index % tagCategories.length
    const category = tagCategories[categoryIndex]
    const hotValue = Math.floor(Math.random() * 1000000) + 100000
    const growth = (Math.random() * 50 - 10).toFixed(1)
    const trend = growth > 5 ? 'up' : growth < -5 ? 'down' : 'stable'

    return {
      id: `tag-${index}`, name,
      category: category.name,
      categoryColor: category.color,
      color: category.color,
      hotValue,
      growth: parseFloat(growth),
      trend,
      trendText: trend === 'up' ? '上升' : trend === 'down' ? '下降' : '平稳',
      videoCount: Math.floor(Math.random() * 50000) + 5000,
      playCount: Math.floor(Math.random() * 10000000) + 1000000,
      monthlyPlay: Math.floor(Math.random() * 5000000) + 500000,
      interactionRate: parseFloat((Math.random() * 10 + 2).toFixed(1)),
      isNew: Math.random() > 0.7,
      newVideos: Math.floor(Math.random() * 100) + 10,
      partitions: generatePartitions(),
      subscribeCount: Math.floor(Math.random() * 100000) + 10000,
      size: Math.floor(Math.random() * 10) + 14,
      opacity: Math.random() * 0.5 + 0.5,
      avgPlay: Math.floor(Math.random() * 50000) + 10000,
      avgLike: Math.floor(Math.random() * 5000) + 1000
    }
  })
}

const generatePartitions = () => {
  const partitionNames = ['生活', '游戏', '知识', '音乐', '科技', '动画']
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3']

  return partitionNames.map((name, index) => ({
    name, percentage: Math.floor(Math.random() * 40) + 10, color: colors[index],
    videoCount: Math.floor(Math.random() * 10000) + 1000, playCount: Math.floor(Math.random() * 1000000) + 100000
  })).slice(0, 3)
}

// 初始化数据
const allTags = ref(generateTags())

// 计算属性
const overviewStats = computed(() => [
  { icon: '🏷️', title: '活跃标签', value: '1,234', change: '+5.2%', trend: 'up', color: '#ff6b6b' },
  { icon: '📊', title: '总播放量', value: '2.3亿', change: '+12.8%', trend: 'up', color: '#4ecdc4' },
  { icon: '🔥', title: '日均新增', value: '256', change: '+0.3%', trend: 'stable', color: '#45b7d1' },
  { icon: '📈', title: '平均互动率', value: '8.7%', change: '+2.1%', trend: 'up', color: '#96ceb4' }
])

const tagCloud = computed(() =>
  allTags.value
    .sort(() => Math.random() - 0.5)
    .slice(0, 30)
)

const currentRanking = computed(() => {
  let sorted = [...allTags.value]
  switch (rankingType.value) {
    case 'growth': sorted.sort((a, b) => b.growth - a.growth); break
    case 'new': sorted.sort((a, b) => b.newVideos - a.newVideos); break
    default: sorted.sort((a, b) => b.hotValue - a.hotValue)
  }
  return sorted.slice(0, 15)
})

const basicInfo = computed(() => {
  if (!selectedTag.value) return []
  return [
    { label: '标签ID', value: selectedTag.value.id }, { label: '分类', value: selectedTag.value.category },
    { label: '订阅数', value: formatNumber(selectedTag.value.subscribeCount || 0) }, { label: '视频数量', value: formatNumber(selectedTag.value.videoCount) },
    { label: '总播放量', value: formatNumber(selectedTag.value.playCount) }, { label: '互动率', value: `${selectedTag.value.interactionRate}%` },
    { label: '增长率', value: `${selectedTag.value.growth > 0 ? '+' : ''}${selectedTag.value.growth}%` }
  ]
})

const trendData = computed(() => {
  const baseValue = selectedTag.value ? Math.floor(Math.random() * 30) + 50 : Math.floor(Math.random() * 40) + 40
  return Array.from({ length: 7 }, (_, i) => ({
    label: `Day${i + 1}`, value: Math.max(10, baseValue + Math.floor(Math.random() * 40 - 20))
  }))
})

const relatedTags = computed(() =>
  allTags.value.filter(tag => tag.name !== selectedTag.value?.name).sort(() => Math.random() - 0.5).slice(0, 8).map(tag => ({
    ...tag, correlation: (Math.random() * 0.3 + 0.5).toFixed(2)
  }))
)

const topVideos = computed(() =>
  Array.from({ length: 3 }, (_, i) => ({
    id: `video-${i}`, title: `【${selectedTag.value?.name}】热门视频示例 ${i + 1}`,
    upName: ['老番茄', '罗翔说刑法', '何同学'][i], cover: `https://picsum.photos/80/60?random=${selectedTag.value?.name}${i}`,
    play: Math.floor(Math.random() * 100000) + 10000, like: Math.floor(Math.random() * 5000) + 1000,
    danmaku: Math.floor(Math.random() * 1000) + 100, duration: '10:30', publishTime: '3天前'
  }))
)

const comparisonData = computed(() => {
  if (comparedTags.value.length === 0) return []
  const metrics = [
    { metric: '热度值', key: 'hotValue', format: (v: number) => formatNumber(v) },
    { metric: '增长率', key: 'growth', format: (v: number) => `${v > 0 ? '+' : ''}${v}%` },
    { metric: '视频数量', key: 'videoCount', format: (v: number) => formatNumber(v) },
    { metric: '播放量', key: 'playCount', format: (v: number) => formatNumber(v) },
    { metric: '互动率', key: 'interactionRate', format: (v: number) => `${v}%` }
  ]

  return metrics.map(metric => ({
    metric: metric.metric, values: comparedTags.value.reduce((acc, tag) => {
      acc[tag.name] = metric.format((tag as any)[metric.key]); return acc
    }, {} as Record<string, string>)
  }))
})

// 方法
const updateData = () => {
  tableLoading.value = true
  setTimeout(() => { tableLoading.value = false; ElMessage.success('数据已更新') }, 1000)
}

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) { ElMessage.warning('请输入搜索关键词'); return }
  searchLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  const found = allTags.value.find(tag => tag.name.includes(searchKeyword.value))
  if (found) { analyzeTag(found); ElMessage.success(`找到标签: ${found.name}`) }
  else ElMessage.warning(`未找到包含"${searchKeyword.value}"的标签`)
  searchLoading.value = false
}

const handleClearSearch = () => { searchKeyword.value = '' }

const handleRowClick = (tag: any) => { analyzeTag(tag) }

const analyzeTag = (tag: any) => {
  selectedTag.value = tag
  ElMessage.info(`开始分析标签: ${tag.name}`)
}

const selectTag = (tag: any) => {
  selectedTag.value = tag
  ElMessage.info(`选中标签: ${tag.name}`)
}

const compareTag = (tag: any) => {
  if (comparedTags.value.length >= 3) { ElMessage.warning('最多可以比较3个标签'); return }
  if (!comparedTags.value.find(t => t.id === tag.id)) {
    comparedTags.value.push(tag); ElMessage.success(`已将"${tag.name}"添加到对比`)
  }
}

const clearComparison = () => { comparedTags.value = []; ElMessage.info('已清空对比列表') }

const triggerDataUpdate = async () => {
  ElMessage.info('开始更新数据...'); await new Promise(resolve => setTimeout(resolve, 2000))
  allTags.value = generateTags(); lastUpdateTime.value = new Date().toLocaleString()
  ElMessage.success('数据更新完成')
}

const triggerCrawl = async () => {
  crawling.value = true
  try {
    await tagStore.triggerTagCrawl(selectedTag.value?.name || '热门标签')
    ElMessage.success('数据爬取完成')
  } catch (error) {
    ElMessage.error('数据爬取失败')
  } finally {
    crawling.value = false
  }
}

const showSystemInfo = () => {
  ElMessageBox.alert('B站标签分析系统 v1.0\n\n数据来源: B站公开API\n更新频率: 每6小时\n数据范围: 全站标签', '系统信息')
}

const exportRankingData = () => { ElMessage.success('榜单数据导出成功') }
const exportData = () => { ElMessage.success('数据导出成功') }

const openVideo = (video: any) => { ElMessage.info(`打开视频: ${video.title}`) }
const addCurrentToComparison = () => { selectedTag.value ? compareTag(selectedTag.value) : ElMessage.warning('请先选择一个标签') }
const removeFromComparison = (tag: any) => { comparedTags.value = comparedTags.value.filter(t => t.id !== tag.id) }

const autoPlayDemo = () => {
  autoPlaying.value = true
  let tagIndex = 0

  autoPlayInterval = setInterval(() => {
    tagIndex = (tagIndex + 1) % allTags.value.length
    selectedTag.value = allTags.value[tagIndex]
  }, 2000)
}

const stopAutoPlay = () => {
  autoPlaying.value = false
  clearInterval(autoPlayInterval)
}

const formatNumber = (num: number): string => {
  if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿'
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  if (num >= 1000) return (num / 1000).toFixed(1) + '千'
  return num.toString()
}

const getRankClass = (index: number) => {
  if (index === 0) return 'rank-1'
  if (index === 1) return 'rank-2'
  if (index === 2) return 'rank-3'
  return 'rank-normal'
}

const getInteractionColor = (rate: number) => {
  if (rate > 8) return '#52c41a'
  if (rate > 5) return '#faad14'
  return '#ff4d4f'
}

const getTagLevel = (hotValue: number) => {
  if (hotValue > 800000) return 'danger'
  if (hotValue > 500000) return 'warning'
  if (hotValue > 200000) return 'success'
  return 'info'
}

const getTagLevelText = (hotValue: number) => {
  if (hotValue > 800000) return '爆火'
  if (hotValue > 500000) return '热门'
  if (hotValue > 200000) return '活跃'
  return '一般'
}

const getTrendBarClass = (value: number) => {
  if (value > 80) return 'high'
  if (value > 60) return 'medium'
  return 'low'
}

const getComparisonClass = (value: string, metric: string) => {
  if (metric === '增长率' || metric === '互动率') {
    if (value.includes('+')) return 'positive'
    if (parseFloat(value) < 0) return 'negative'
  }
  return ''
}

const showTrendTooltip = (point: any, index: number) => {}
const hideTooltip = () => {}

// 生命周期
onMounted(() => {
  lastUpdateTime.value = new Date().toLocaleString()
  if (allTags.value.length > 0) selectedTag.value = allTags.value[0]
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<style scoped lang="scss">
.tag-analysis-system {
  padding: 20px;
  background: #0f0f23;
  min-height: 100vh;
  color: #e0e0e0;

  &.dark-theme {
    background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  }
}

.system-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-main h1 {
  margin: 0 0 8px 0;
  color: #ffffff;
  font-size: 28px;
  font-weight: 600;
}

.header-main p {
  margin: 0;
  color: #b0b0b0;
  font-size: 14px;
}

.main-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.control-group {
  display: flex;
  gap: 24px;
  align-items: center;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-label {
  font-weight: 500;
  color: #b0b0b0;
  white-space: nowrap;
}

.search-group {
  width: 400px;
}

.data-overview {
  margin-bottom: 24px;
}

.overview-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-left: 4px solid;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.2);
  }
}

.overview-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
  color: white;
}

.overview-content {
  flex: 1;
}

.overview-value {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 4px;
}

.overview-title {
  font-size: 14px;
  color: #b0b0b0;
  margin-bottom: 4px;
}

.overview-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.overview-trend.up {
  color: #52c41a;
}

.overview-trend.down {
  color: #ff4d4f;
}

/* 热门标签云样式 */
.tag-cloud-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.tag-cloud-section h3 {
  margin-bottom: 20px;
  font-size: 1.5rem;
  text-align: center;
  color: #ffffff;
  font-weight: 600;
}

.tag-cloud {
  text-align: center;
  line-height: 2.5;
  min-height: 200px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.tag {
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid currentColor;
  transition: all 0.3s ease;
  display: inline-block;
  font-weight: 500;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }
}

.action-panel {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 24px;
}

.comparison-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 25px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.comparison-panel h3 {
  margin-bottom: 20px;
  font-size: 1.5rem;
  text-align: center;
  color: #ffffff;
  font-weight: 600;
}

.comparison-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.comparison-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 2px solid;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
  }
}

.comparison-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.tag-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffffff;
}

.comparison-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comparison-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.comparison-stat:last-child {
  border-bottom: none;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
}

.stat-value.positive {
  color: #52c41a;
}

.stat-value.negative {
  color: #ff4d4f;
}

.add-comparison-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 120px;
  color: #b0b0b0;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
    color: #ffffff;
  }
}

.tag-ranking-section {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.rank-cell {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
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
  background: rgba(255, 255, 255, 0.1);
  color: #b0b0b0;
}

.tag-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tag-name {
  font-weight: 500;
  color: #ffffff;
}

.new-badge {
  margin-left: 8px;
}

.metric-value {
  font-weight: 500;
  color: #ffffff;
}

.metric-value.positive {
  color: #52c41a;
}

.metric-value.negative {
  color: #ff4d4f;
}

.interaction-text {
  font-size: 12px;
  color: #b0b0b0;
  margin-left: 8px;
}

.tag-detail-analysis {
  margin-bottom: 24px;
}

.info-card, .trend-card, .relation-card {
  height: 500px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  :deep(.el-card__header) {
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: #ffffff;
    font-weight: 600;
  }
}

.tag-basic-info {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tag-header h3 {
  margin: 0;
  color: #ffffff;
}

.info-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-label {
  color: #b0b0b0;
  font-size: 14px;
}

.info-value {
  color: #ffffff;
  font-weight: 500;
}

.partition-distribution h4 {
  margin: 0 0 12px 0;
  color: #ffffff;
}

.partition-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.partition-item {
  padding: 8px 0;
}

.partition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 14px;
  color: #ffffff;
}

.trend-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.trend-tabs {
  margin-bottom: 20px;
}

.trend-chart {
  flex: 1;
  display: flex;
  align-items: end;
  justify-content: space-around;
  padding: 20px 0;
}

.trend-bar {
  flex: 1;
  margin: 0 4px;
  background: linear-gradient(to top, #409eff, #79bbff);
  border-radius: 4px 4px 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: end;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  min-width: 40px;
}

.trend-bar:hover {
  transform: scale(1.05);
}

.trend-bar.high {
  background: linear-gradient(to top, #f56c6c, #f89898);
}

.trend-bar.medium {
  background: linear-gradient(to top, #e6a23c, #eebe77);
}

.bar-value {
  position: absolute;
  top: -20px;
  font-size: 12px;
  font-weight: bold;
  color: #ffffff;
}

.bar-label {
  margin-top: 4px;
  font-size: 12px;
  color: #b0b0b0;
}

.relation-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.related-tag {
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.correlation {
  font-size: 10px;
  opacity: 0.7;
  margin-left: 4px;
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.video-item {
  display: flex;
  gap: 12px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  background: rgba(255, 255, 255, 0.05);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.video-cover {
  width: 80px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.video-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.video-title {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #ffffff;
}

.video-up {
  font-size: 11px;
  color: #b0b0b0;
}

.video-stats {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #b0b0b0;
}

.comparison-analysis {
  margin-bottom: 24px;
}

.comparison-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comparison-value.positive {
  color: #52c41a;
  font-weight: 500;
}

.comparison-value.negative {
  color: #ff4d4f;
  font-weight: 500;
}

.demo-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
  margin-bottom: 24px;
}

.update-time {
  text-align: center;
  color: #b0b0b0;
  font-size: 12px;
  margin-top: 20px;
}

/* 深色表格样式 */
:deep(.dark-table) {
  background: transparent;
  color: #e0e0e0;

  .el-table__header {
    background: rgba(255, 255, 255, 0.05);

    th {
      background: rgba(255, 255, 255, 0.05);
      color: #ffffff;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }

  .el-table__body {
    tr {
      background: rgba(255, 255, 255, 0.02);

      &:hover {
        background: rgba(255, 255, 255, 0.05) !important;
      }

      td {
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        color: #e0e0e0;
      }
    }
  }

  .el-table__empty-block {
    background: rgba(255, 255, 255, 0.02);
    color: #b0b0b0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tag-analysis-system {
    padding: 15px;
  }

  .main-controls {
    flex-direction: column;
    gap: 15px;
  }

  .control-group {
    flex-direction: column;
    gap: 15px;
  }

  .search-group {
    width: 100%;
  }

  .tag-cloud {
    gap: 8px;
  }

  .tag {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}
</style>
