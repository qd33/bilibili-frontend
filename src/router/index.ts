// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { setupRouterGuards } from './guards'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      requiresAuth: true,
      title: '数据总览'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      requiresAuth: false,
      title: '用户登录'
    }
  },
  {
    path: '/up',
    name: 'UpAnalysis',
    component: () => import('@/views/UpAnalysis.vue'),
    meta: {
      requiresAuth: true,
      title: 'UP主分析'
    }
  },
  {
    path: '/partitions',
    name: 'PartitionAnalysis',
    component: () => import('@/views/PartitionAnalysis.vue'),
    meta: {
      requiresAuth: true,
      title: '分区分析'
    }
  },
  // 🆕 标签分析路由
  {
    path: '/tags',
    name: 'TagAnalysis',
    component: () => import('@/views/TagAnalysis.vue'),
    meta: {
      requiresAuth: true,
      title: '标签分析'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

setupRouterGuards(router)

router.afterEach((to) => {
  const title = to.meta.title as string || 'B站数据分析平台'
  document.title = title
})

router.onError((error) => {
  console.error('🚨 路由错误:', error)
  ElMessage.error('页面加载失败，请刷新重试')
})

export default router
