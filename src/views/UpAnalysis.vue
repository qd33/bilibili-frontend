<template>
  <div class="up-analysis">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-input
        v-model="searchUid"
        placeholder="请输入UP主UID"
        :disabled="loading"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button
            :loading="loading"
            @click="handleSearch"
            type="primary"
          >
            {{ loading ? '查询中...' : '查询UP主' }}
          </el-button>
        </template>
      </el-input>

      <el-button
        v-if="dataStore.currentUp"
        @click="handleDebug"
        type="info"
        size="small"
      >
        调试数据
      </el-button>
    </div>

    <!-- 错误提示 -->
    <el-alert
      v-if="dataStore.error"
      :title="dataStore.error"
      type="error"
      show-icon
      closable
      class="error-alert"
    />

    <!-- UP主信息 -->
    <div v-if="dataStore.currentUp" class="up-info">
      <el-card class="up-card">
        <div class="up-header">
          <el-avatar :size="60" :src="dataStore.currentUp.avatar" />
          <div class="up-details">
            <h3>{{ dataStore.currentUp.name }}</h3>
            <p>UID: {{ dataStore.currentUp.uid }}</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 视频列表 -->
    <div v-if="dataStore.hasVideos" class="videos-section">
      <h3>视频列表 ({{ dataStore.videoCount }})</h3>

      <!-- 视频统计 -->
      <div class="video-stats">
        <el-tag type="success">有效视频: {{ dataStore.videoCount }} 个</el-tag>
        <el-tag v-if="dataStore.firstVideo" type="info">
          最新: {{ dataStore.firstVideo.title }}
        </el-tag>
      </div>

      <!-- 视频网格 -->
      <div class="video-grid">
        <div
          v-for="video in dataStore.videoList"
          :key="video.bvid"
          class="video-card"
        >
          <div class="video-cover">
            <img
              :src="video.cover"
              :alt="video.title"
              @error="handleImageError"
            />
          </div>
          <div class="video-info">
            <h4 class="video-title">{{ video.title }}</h4>
            <p class="video-desc" v-if="video.description">
              {{ video.description }}
            </p>
            <div class="video-meta">
              <span>播放: {{ video.play }}</span>
              <span>点赞: {{ video.like }}</span>
              <span>弹幕: {{ video.danmaku }}</span>
            </div>
            <div class="video-partition">
              <el-tag size="small">{{ video.partition }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="dataStore.currentUp && !loading" class="empty-state">
      <el-empty description="暂无视频数据">
        <el-button
          @click="handleCrawl"
          type="primary"
        >
          抓取视频数据
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useDataStore } from '../stores/dataStore';

// 状态管理
const dataStore = useDataStore();
const searchUid = ref('104777016'); // 默认测试UID
const loading = ref(false);

// 图片加载失败处理
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/default-cover.jpg';
  console.warn('🖼️ 图片加载失败:', img.src);
};

// 主搜索功能
const handleSearch = async () => {
  try {
    const uid = searchUid.value.trim();

    if (!uid) {
      ElMessage.error('请输入UP主UID');
      return;
    }

    console.log(`🎯 开始查询UP主: ${uid}`);
    loading.value = true;

    // 使用新的完整信息获取方法
    await dataStore.fetchUpWithVideos(uid);

    // 根据结果显示不同消息
    if (dataStore.hasVideos) {
      ElMessage.success(`成功加载 ${dataStore.videoCount} 个视频`);

      // 检查第一个视频的封面和标题
      const firstVideo = dataStore.firstVideo;
      if (firstVideo) {
        console.log('✅ 视频数据验证:', {
          标题: firstVideo.title,
          封面: firstVideo.cover,
          播放量: firstVideo.play
        });
      }
    } else {
      ElMessage.warning('该UP主暂无视频数据，请尝试抓取数据');
    }

  } catch (error: any) {
    console.error('❌ UP主查询失败:', error);

    // 更友好的错误提示
    if (error.message.includes('不存在')) {
      ElMessage.error('UP主不存在，请检查UID是否正确');
    } else if (error.message.includes('网络') || error.message.includes('请求')) {
      ElMessage.error('网络请求失败，请检查网络连接');
    } else if (error.message.includes('空')) {
      ElMessage.warning('UP主数据为空，请尝试抓取数据');
    } else {
      ElMessage.error('查询失败: ' + error.message);
    }

    // 开发模式下使用模拟数据
    if (process.env.NODE_ENV === 'development') {
      console.log('🛠️ 开发模式：使用模拟数据');
      useMockData();
    }
  } finally {
    loading.value = false;
  }
};

// 触发数据爬取
const handleCrawl = async () => {
  if (!dataStore.currentUp) return;

  try {
    await ElMessageBox.confirm(
      `确定要抓取 UP主 ${dataStore.currentUp.name} 的视频数据吗？`,
      '确认抓取',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    ElMessage.info('开始抓取数据，请稍候...');

    await dataStore.triggerUpCrawl(dataStore.currentUp.uid);

    ElMessage.success('数据抓取完成！');

    // 抓取完成后重新查询
    setTimeout(() => {
      handleSearch();
    }, 2000);

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('抓取失败: ' + error.message);
    }
  }
};

// 调试功能
const handleDebug = async () => {
  if (!dataStore.currentUp) return;

  try {
    ElMessage.info('开始调试数据，请查看控制台...');
    await dataStore.debugUpData(dataStore.currentUp.uid);
    ElMessage.success('调试完成，请查看控制台输出');
  } catch (error) {
    ElMessage.error('调试失败: ' + error.message);
  }
};

// 模拟数据（开发环境使用）
const useMockData = () => {
  dataStore.videoList = [
    {
      bvid: 'BV1A1234567',
      title: '【测试视频】这是一个测试视频标题',
      cover: 'https://example.com/cover1.jpg',
      description: '这是一个测试视频描述',
      play: 15000,
      like: 1200,
      danmaku: 450,
      publishTime: '2024-01-01T10:00:00',
      partition: '生活'
    },
    {
      bvid: 'BV1B1234567',
      title: '【另一个测试】第二个测试视频',
      cover: 'https://example.com/cover2.jpg',
      description: '第二个测试视频的描述',
      play: 8900,
      like: 650,
      danmaku: 230,
      publishTime: '2024-01-02T14:30:00',
      partition: '科技'
    }
  ];
};

// 组件挂载时自动查询默认UP主
onMounted(() => {
  // 可以从URL参数获取UID，或者使用默认值
  const urlParams = new URLSearchParams(window.location.search);
  const uidFromUrl = urlParams.get('uid');
  if (uidFromUrl) {
    searchUid.value = uidFromUrl;
  }

  // 自动查询（可选）
  // handleSearch();
});
</script>

<style scoped>
.up-analysis {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.error-alert {
  margin-bottom: 20px;
}

.up-info {
  margin-bottom: 30px;
}

.up-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.up-details h3 {
  margin: 0;
  font-size: 1.5em;
}

.up-details p {
  margin: 5px 0 0 0;
  color: #666;
}

.videos-section {
  margin-top: 30px;
}

.video-stats {
  margin: 15px 0;
  display: flex;
  gap: 10px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.video-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.video-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-cover {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.video-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-info {
  padding: 15px;
}

.video-title {
  margin: 0 0 10px 0;
  font-size: 1em;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-desc {
  font-size: 0.9em;
  color: #666;
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  color: #888;
  margin-bottom: 10px;
}

.video-partition {
  text-align: right;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}
</style>
