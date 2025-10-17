<template>
  <div class="loading-container" :class="{ 'fullscreen': fullscreen }">
    <div class="loading-content">
      <!-- 加载动画 -->
      <div class="loading-spinner">
        <div class="spinner-circle"></div>
        <div class="spinner-circle"></div>
        <div class="spinner-circle"></div>
      </div>

      <!-- 加载文本 -->
      <div class="loading-text">
        <p class="loading-message">{{ message }}</p>
        <p v-if="subMessage" class="loading-submessage">{{ subMessage }}</p>
      </div>

      <!-- 进度条 -->
      <div v-if="showProgress" class="loading-progress">
        <el-progress
          :percentage="progress"
          :stroke-width="6"
          :show-text="false"
          status="success"
        />
        <span class="progress-text">{{ progress }}%</span>
      </div>
    </div>

    <!-- 背景遮罩 -->
    <div v-if="fullscreen" class="loading-backdrop"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
  subMessage?: string
  fullscreen?: boolean
  showProgress?: boolean
  progress?: number
}

withDefaults(defineProps<Props>(), {
  message: '加载中...',
  subMessage: '',
  fullscreen: false,
  showProgress: false,
  progress: 0
})
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  padding: 0;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  z-index: 10000;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-width: 300px;
}

.fullscreen .loading-content {
  background: var(--bg-primary);
}

.loading-spinner {
  display: flex;
  gap: 8px;
}

.spinner-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent-blue);
  animation: bounce 1.4s infinite ease-in-out both;
}

.spinner-circle:nth-child(1) {
  animation-delay: -0.32s;
}

.spinner-circle:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-text {
  text-align: center;
}

.loading-message {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.loading-submessage {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.loading-progress {
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.progress-text {
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
}

.loading-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 20, 33, 0.8);
  backdrop-filter: blur(4px);
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
