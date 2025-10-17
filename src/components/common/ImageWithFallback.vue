<template>
  <div class="image-container" :class="{ 'loading': isLoading, 'error': hasError }">
    <img
      :src="currentSrc"
      :alt="alt"
      :class="imgClass"
      @load="handleLoad"
      @error="handleError"
      loading="lazy"
    />

    <!-- 加载状态 -->
    <div v-if="isLoading && !hasError" class="image-loading">
      <el-icon class="loading-icon" color="#00aeec"><Loading /></el-icon>
      <span class="loading-text">加载中...</span>
    </div>

    <!-- 错误状态 -->
    <div v-if="hasError" class="image-error">
      <el-icon class="error-icon" color="#ef4444"><Picture /></el-icon>
      <span class="error-text">图片加载失败</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, Picture } from '@element-plus/icons-vue'
import { getProxyImageUrl, getDefaultCover } from '@/utils/imageProxy'

interface Props {
  src: string
  alt?: string
  fallbackSrc?: string
  imgClass?: string
  enableProxy?: boolean
  showErrorToast?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  alt: '图片',
  fallbackSrc: '',
  imgClass: '',
  enableProxy: true,
  showErrorToast: true
})

// 响应式数据
const isLoading = ref(true)
const hasError = ref(false)
const currentSrc = ref('')

// 计算属性
const processedSrc = computed(() => {
  if (!props.src) return getDefaultCover()

  if (props.enableProxy) {
    return getProxyImageUrl(props.src)
  }

  return props.src
})

const finalFallbackSrc = computed(() => {
  return props.fallbackSrc || getDefaultCover()
})

// 方法
const handleLoad = () => {
  isLoading.value = false
  hasError.value = false
}

const handleError = () => {
  isLoading.value = false
  hasError.value = true

  if (currentSrc.value !== finalFallbackSrc.value) {
    // 切换到备用图片
    currentSrc.value = finalFallbackSrc.value
  } else if (props.showErrorToast) {
    ElMessage.warning(`图片加载失败: ${props.alt}`)
  }
}

const resetState = () => {
  isLoading.value = true
  hasError.value = false
  currentSrc.value = processedSrc.value
}

// 监听 src 变化
watch(() => props.src, () => {
  resetState()
})

// 初始化
resetState()
</script>

<style scoped>
.image-container {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.image-container img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.image-container.loading img {
  opacity: 0.3;
}

.image-container.error img {
  opacity: 0.1;
}

.image-loading,
.image-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text,
.error-text {
  font-size: 0.85rem;
  font-weight: 500;
}

.error-icon {
  font-size: 24px;
}

/* 深色主题变量 */
:root {
  --text-secondary: #a0aec0;
}
</style>
