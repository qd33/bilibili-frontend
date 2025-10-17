<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">
        <el-icon color="#ef4444" :size="64"><Warning /></el-icon>
      </div>
      <h2 class="error-title">组件渲染错误</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <div class="error-stack" v-if="showDetails">
        <pre class="stack-trace">{{ errorStack }}</pre>
      </div>
      <div class="error-actions">
        <el-button type="primary" @click="handleRetry">
          <el-icon><Refresh /></el-icon>
          重试组件
        </el-button>
        <el-button @click="toggleDetails">
          {{ showDetails ? '隐藏' : '显示' }}详细信息
        </el-button>
        <el-button type="warning" @click="handleReport">
          <el-icon><Warning /></el-icon>
          报告错误
        </el-button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { ElMessage } from 'element-plus'
import { Warning, Refresh } from '@element-plus/icons-vue'

// 响应式数据
const hasError = ref(false)
const errorMessage = ref('')
const errorStack = ref('')
const showDetails = ref(false)

// 错误捕获
onErrorCaptured((err, instance, info) => {
  console.error('🚨 组件错误捕获:', {
    error: err,
    component: instance,
    info: info
  })

  hasError.value = true
  errorMessage.value = err.message
  errorStack.value = err.stack || '无堆栈信息'

  // 可以在这里发送错误报告
  reportError(err, info)

  // 阻止错误继续向上传播
  return false
})

// 方法
const handleRetry = () => {
  hasError.value = false
  errorMessage.value = ''
  errorStack.value = ''
  showDetails.value = false
  ElMessage.success('组件已重置，请重试操作')
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

const handleReport = () => {
  ElMessage.info('错误报告功能开发中')
  // 实际项目中可以集成错误上报服务
}

const reportError = (error: Error, info: string) => {
  // 这里可以集成 Sentry、Bugsnag 等错误监控服务
  console.group('🚨 错误报告')
  console.error('错误信息:', error.message)
  console.error('组件信息:', info)
  console.error('堆栈跟踪:', error.stack)
  console.groupEnd()
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  margin: 20px 0;
}

.error-content {
  text-align: center;
  max-width: 600px;
}

.error-icon {
  margin-bottom: 20px;
}

.error-title {
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.error-message {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.error-stack {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
  text-align: left;
  max-height: 200px;
  overflow-y: auto;
}

.stack-trace {
  color: #ef4444;
  font-size: 0.8rem;
  line-height: 1.4;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

/* 深色主题变量 */
:root {
  --bg-primary: #0f1421;
  --bg-secondary: #1a2332;
  --text-primary: #ffffff;
  --text-secondary: #a0aec0;
  --border-color: #2d3748;
}

/* 滚动条样式 */
.error-stack::-webkit-scrollbar {
  width: 6px;
}

.error-stack::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.error-stack::-webkit-scrollbar-thumb {
  background: rgba(239, 68, 68, 0.5);
  border-radius: 3px;
}

.error-stack::-webkit-scrollbar-thumb:hover {
  background: rgba(239, 68, 68, 0.7);
}
</style>
