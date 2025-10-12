<template>
  <div class="video-card" @click="handleClick">
    <div class="video-cover">
      <img
        :src="video.cover"
        :alt="video.title"
        @error="handleImageError"
      />
      <div class="video-duration" v-if="video.duration">
        {{ formatDuration(video.duration) }}
      </div>
    </div>

    <div class="video-content">
      <h4 class="video-title" :title="video.title">
        {{ video.title }}
      </h4>

      <p class="video-desc" v-if="showDescription && video.description">
        {{ video.description }}
      </p>

      <div class="video-meta">
        <span class="play-count">
          <el-icon><VideoPlay /></el-icon>
          {{ formatCount(video.play) }}
        </span>
        <span class="like-count">
          <el-icon><Star /></el-icon>
          {{ formatCount(video.like) }}
        </span>
        <span class="danmaku-count">
          <el-icon><ChatDotRound /></el-icon>
          {{ formatCount(video.danmaku) }}
        </span>
      </div>

      <div class="video-footer">
        <el-tag size="small" type="info">
          {{ video.partition }}
        </el-tag>
        <span class="publish-time">
          {{ formatTime(video.publishTime) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VideoPlay, Star, ChatDotRound } from '@element-plus/icons-vue';

interface Props {
  video: {
    bvid: string;
    title: string;
    cover: string;
    description: string;
    play: number;
    like: number;
    danmaku: number;
    publishTime: string;
    partition: string;
    duration?: number;
  };
  showDescription?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showDescription: true
});

const emit = defineEmits<{
  click: [video: Props['video']];
}>();

// 图片加载失败处理
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/default-cover.jpg';
  console.warn('🖼️ 视频封面加载失败:', props.video.bvid);
};

// 点击事件
const handleClick = () => {
  emit('click', props.video);
};

// 格式化数字
const formatCount = (count: number): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万';
  }
  return count.toString();
};

// 格式化时长
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 格式化时间
const formatTime = (timeStr: string): string => {
  try {
    const date = new Date(timeStr);
    return date.toLocaleDateString();
  } catch {
    return timeStr;
  }
};
</script>

<style scoped>
.video-card {
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.video-cover {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 60%; /* 16:9 比例 */
  overflow: hidden;
}

.video-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.video-card:hover .video-cover img {
  transform: scale(1.05);
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8em;
}

.video-content {
  padding: 12px;
}

.video-title {
  margin: 0 0 8px 0;
  font-size: 0.95em;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #333;
}

.video-desc {
  margin: 0 0 10px 0;
  font-size: 0.85em;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.8em;
  color: #888;
}

.video-meta span {
  display: flex;
  align-items: center;
  gap: 2px;
}

.video-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.publish-time {
  font-size: 0.8em;
  color: #999;
}
</style>
