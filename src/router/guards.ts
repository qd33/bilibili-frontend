import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

// 路由守卫配置
export const setupRouterGuards = (router: any) => {
  // 全局前置守卫
  router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const userStore = useUserStore()

    // 检查页面是否需要认证
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

    // 如果路由需要认证
    if (requiresAuth) {
      // 检查用户是否已认证
      if (userStore.isAuthenticated) {
        // 如果还需要管理员权限
        if (requiresAdmin && !userStore.isAdmin) {
          console.warn('⚠️ 权限不足，需要管理员权限')
          next('/') // 重定向到首页或无权限页面
          return
        }
        next() // 已认证，允许访问
      } else {
        console.warn('⚠️ 未登录，跳转到登录页')
        // 保存目标路由，登录后可以重定向
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
      }
    } else {
      // 不需要认证的路由，直接放行
      next()
    }
  })

  // 全局后置守卫
  router.afterEach((to: RouteLocationNormalized) => {
    // 可以在这里添加页面跟踪等逻辑
    console.log(`📍 路由跳转: ${from.name} -> ${to.name}`)
  })
}

// 路由元信息类型扩展
declare module 'vue-router' {
  interface RouteMeta {
    // 是否需要认证
    requiresAuth?: boolean
    // 是否需要管理员权限
    requiresAdmin?: boolean
    // 页面标题
    title?: string
  }
}
