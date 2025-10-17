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

      <el-button
        v-if="!dataStore.currentUp"
        @click="handleCrawlFirst"
        type="warning"
        :loading="crawling"
      >
        {{ crawling ? '爬取中...' : '先爬取数据' }}
      </el-button>

      <!-- 爬取最新数据按钮 -->
      <el-button
        v-if="dataStore.currentUp && !showCrawlLatest"
        @click="showCrawlLatest = true"
        type="success"
        :loading="crawlingLatest"
      >
        <el-icon><Refresh /></el-icon>
        爬取最新数据
      </el-button>

      <el-button
        @click="testImageProxy"
        type="success"
        size="small"
      >
        测试图片代理
      </el-button>
    </div>

    <!-- 爬取最新数据确认弹窗 -->
    <el-dialog
      v-model="showCrawlLatest"
      title="🔄 爬取最新数据"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="dialog-content">
        <el-alert
          title="此操作将重新爬取UP主的最新数据，包括："
          type="info"
          :closable="false"
        />
        <ul class="feature-list">
          <li>📸 最新头像信息</li>
          <li>🎬 最新发布的视频</li>
          <li>📊 最新的统计数据</li>
          <li>🔄 更新数据库中的信息</li>
        </ul>

        <div class="timeout-note">
          <el-alert
            title="由于需要爬取最新数据，此操作可能需要较长时间（最长120秒），请耐心等待..."
            type="warning"
            :closable="false"
          />
        </div>

        <div class="up-info-preview" v-if="dataStore.currentUp">
          <h4>当前UP主信息：</h4>
          <div class="up-preview">
            <el-avatar :size="40" :src="dataStore.currentUp.avatar" />
            <div class="up-details">
              <p><strong>{{ dataStore.currentUp.name }}</strong></p>
              <p>UID: {{ dataStore.currentUp.uid }}</p>
              <p>当前视频数: {{ dataStore.videoCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button
            @click="showCrawlLatest = false"
            :disabled="crawlingLatest"
          >
            取消
          </el-button>
          <el-button
            type="success"
            @click="handleCrawlLatest"
            :loading="crawlingLatest"
            :disabled="!dataStore.currentUp"
          >
            {{ crawlingLatest ? '爬取中...' : '开始爬取' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

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
          <el-avatar
            :size="60"
            :src="dataStore.currentUp.avatar"
            @error="handleAvatarError"
          />
          <div class="up-details">
            <h3>{{ dataStore.currentUp.name }}</h3>
            <p>UID: {{ dataStore.currentUp.uid }}</p>
            <p class="avatar-info">头像状态: {{ avatarStatus }}</p>
            <p class="data-info" v-if="lastCrawlTime">
              最后爬取: {{ lastCrawlTime }}
            </p>
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
        <el-tag type="warning">
          图片代理: {{ proxyStatus }}
        </el-tag>
        <el-tag v-if="lastCrawlTime" type="info">
          更新时间: {{ lastCrawlTime }}
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
              @error="handleImageErrorEvent"
              @load="handleImageLoad"
              :data-video-id="video.bvid"
            />
            <div v-if="!imageLoaded[video.bvid]" class="image-loading">
              <el-icon class="is-loading" color="#00aeec">
                <Loading />
              </el-icon>
              <span>加载中...</span>
            </div>
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

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading" color="#00aeec" :size="32">
        <Loading />
      </el-icon>
      <p>数据加载中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Loading, Refresh } from '@element-plus/icons-vue';
import { useDataStore } from '@/stores/dataStore';
import { handleImageError, getDefaultCover, checkImageUrl } from '@/utils/imageProxy';

// 状态管理
const dataStore = useDataStore();
const searchUid = ref('23947287');
const loading = ref(false);
const crawling = ref(false);
const crawlingLatest = ref(false);
const showCrawlLatest = ref(false);
const avatarStatus = ref('未知');
const proxyStatus = ref('未知');
const imageLoaded = ref<Record<string, boolean>>({});
const lastCrawlTime = ref('');

// 计算属性 - 格式化当前时间
const currentTime = computed(() => {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
});

// 图片加载成功处理
const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement;
  const videoId = img.dataset.videoId;

  if (videoId) {
    imageLoaded.value[videoId] = true;
    console.log('✅ 图片加载成功:', videoId);
  }
};

// 图片加载错误处理
const handleImageErrorEvent = (event: Event) => {
  const img = event.target as HTMLImageElement;
  const videoId = img.dataset.videoId;

  if (videoId) {
    imageLoaded.value[videoId] = true;
  }

  console.warn('🖼️ 图片加载失败:', videoId);
  handleImageError(event);
};

// 头像加载错误处理
const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  console.warn('🖼️ 头像加载失败:', img.src);
  img.src = getDefaultCover();
  avatarStatus.value = '加载失败，使用默认头像';
};

// 测试图片代理服务
const testImageProxy = async () => {
  try {
    proxyStatus.value = '检测中';
    ElMessage.info('正在测试图片代理服务...');

    const isWorking = await dataStore.testImageProxy();

    if (isWorking) {
      proxyStatus.value = 'active';
      ElMessage.success('图片代理服务正常！');
    } else {
      proxyStatus.value = 'inactive';
      ElMessage.warning('图片代理服务异常，请检查后端服务');
    }
  } catch (error) {
    proxyStatus.value = 'error';
    ElMessage.error('图片代理测试失败: ' + error);
    console.error('❌ 图片代理测试失败:', error);
  }
};

// 爬取最新数据功能
const handleCrawlLatest = async () => {
  if (!dataStore.currentUp) return;

  try {
    crawlingLatest.value = true;
    const startTime = Date.now();

    ElMessage.info('开始爬取最新数据，这可能需要较长时间，请耐心等待...');

    const result = await dataStore.triggerUpCrawlWithTimeout(
      dataStore.currentUp.uid,
      120000
    );

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    if (result.success) {
      lastCrawlTime.value = currentTime.value;
      ElMessage.success(`最新数据爬取成功！耗时 ${duration} 秒`);

      showCrawlLatest.value = false;

      setTimeout(async () => {
        await handleSearch();
      }, 2000);
    } else {
      throw new Error(result.message || '爬取失败');
    }

  } catch (error: unknown) {
    console.error('❌ 爬取最新数据失败:', error);

    let errorMessage = '爬取最新数据失败';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as any).message);
    }

    if (errorMessage.includes('timeout') || errorMessage.includes('超时')) {
      ElMessage.warning('爬取操作超时，但数据可能仍在后台处理中，请稍后刷新查看');
    } else {
      ElMessage.error('爬取最新数据失败: ' + errorMessage);
    }
  } finally {
    crawlingLatest.value = false;
  }
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
    avatarStatus.value = '加载中...';
    imageLoaded.value = {};

    await testImageProxy();

    await dataStore.fetchUpWithVideos(uid);

    lastCrawlTime.value = currentTime.value;

    if (dataStore.currentUp?.avatar) {
      const avatarOk = await checkImageUrl(dataStore.currentUp.avatar);
      avatarStatus.value = avatarOk ? '✅ 加载成功' : '❌ 加载失败';
    }

    if (dataStore.hasVideos) {
      ElMessage.success(`成功加载 ${dataStore.videoCount} 个视频`);

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

  } catch (error: unknown) {
    console.error('❌ UP主查询失败:', error);

    let errorMessage = '查询失败';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as any).message);
    }

    if (errorMessage.includes('不存在')) {
      ElMessage.error('UP主不存在，请检查UID是否正确');
    } else if (errorMessage.includes('网络') || errorMessage.includes('请求')) {
      ElMessage.error('网络请求失败，请检查网络连接');
    } else if (errorMessage.includes('空')) {
      ElMessage.warning('UP主数据为空，请尝试抓取数据');
    } else {
      ElMessage.error('查询失败: ' + errorMessage);
    }
  } finally {
    loading.value = false;
  }
};

// 先爬取数据再查询
const handleCrawlFirst = async () => {
  const uid = searchUid.value.trim();
  if (!uid) {
    ElMessage.error('请输入UP主UID');
    return;
  }

  try {
    crawling.value = true;
    ElMessage.info('开始爬取UP主数据，请稍候...');

    await dataStore.triggerUpCrawl(uid);
    ElMessage.success('数据爬取完成！');

    setTimeout(() => {
      handleSearch();
    }, 3000);

  } catch (error: unknown) {
    console.error('❌ 爬取失败:', error);

    let errorMessage = '爬取失败';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as any).message);
    }

    ElMessage.error('爬取失败: ' + errorMessage);
  } finally {
    crawling.value = false;
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

    setTimeout(() => {
      handleSearch();
    }, 2000);

  } catch (error: unknown) {
    if (error === 'cancel' || (error instanceof Error && error.message.includes('cancel'))) {
      return;
    }

    let errorMessage = '抓取失败';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as any).message);
    }

    ElMessage.error('抓取失败: ' + errorMessage);
  }
};

// 调试功能
const handleDebug = async () => {
  if (!dataStore.currentUp) return;

  try {
    ElMessage.info('开始调试数据，请查看控制台...');
    await dataStore.debugUpData(dataStore.currentUp.uid);
    ElMessage.success('调试完成，请查看控制台输出');
  } catch (error: unknown) {
    console.error('❌ 调试失败:', error);

    let errorMessage = '调试失败';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as any).message);
    }

    ElMessage.error('调试失败: ' + errorMessage);
  }
};

// 组件挂载时自动查询默认UP主
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const uidFromUrl = urlParams.get('uid');
  if (uidFromUrl) {
    searchUid.value = uidFromUrl;
  }

  testImageProxy();
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
  flex-wrap: wrap;
}

.error-alert {
  margin-bottom: 20px;
}

.dialog-content {
  margin-bottom: 20px;
}

.feature-list {
  margin: 16px 0;
  padding-left: 20px;
}

.feature-list li {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
}

.timeout-note {
  margin: 16px 0;
}

.up-info-preview {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.up-info-preview h4 {
  margin: 0 0 12px 0;
  color: #303133;
}

.up-preview {
  display: flex;
  align-items: center;
  gap: 12px;
}

.up-details p {
  margin: 4px 0;
  font-size: 14px;
}

.up-details strong {
  color: #303133;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

.avatar-info {
  font-size: 0.8em;
  color: #888;
}

.data-info {
  font-size: 0.8em;
  color: #67C23A;
  font-weight: 500;
}

.videos-section {
  margin-top: 30px;
}

.video-stats {
  margin: 15px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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
  position: relative;
}

.video-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-cover {
  width: 100%;
  height: 180px;
  overflow: hidden;
  position: relative;
}

.video-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9em;
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

.loading-state {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.loading-state p {
  margin-top: 15px;
}

@media (max-width: 768px) {
  .search-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-section .el-input {
    margin-bottom: 10px;
  }

  .video-grid {
    grid-template-columns: 1fr;
  }

  .dialog-footer {
    flex-direction: column;
  }
}
</style>
