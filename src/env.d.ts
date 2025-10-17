/// <reference types="vite/client" />

// Vite 环境变量类型定义
interface ImportMetaEnv {
  // 基础配置
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean

  // 服务器配置
  readonly VITE_API_BASE_URL: string
  readonly VITE_DEV_SERVER_URL: string

  // 应用配置
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string

  // 功能开关
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_DEBUG: string

  // 其他环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Vue 环境变量扩展（如果需要）
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 图片资源类型声明
declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}
