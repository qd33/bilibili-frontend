import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import UpAnalysis from '@/views/UpAnalysis.vue'
import PartitionAnalysis from '@/views/PartitionAnalysis.vue'
import TagAnalysis from '@/views/TagAnalysis.vue'
import Login from '@/views/Login.vue'
import Admin from '@/views/Admin.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {
        title: '数据总览 - B站数据分析平台'
      }
    },
    {
      path: '/up',
      name: 'UpAnalysis',
      component: UpAnalysis,
      meta: {
        title: 'UP主分析 - B站数据分析平台'
      }
    },
    {
      path: '/up/:uid',
      name: 'UpAnalysisWithId',
      component: UpAnalysis,
      props: true,
      meta: {
        title: 'UP主分析 - B站数据分析平台'
      }
    },
    {
      path: '/partitions',
      name: 'PartitionAnalysis',
      component: PartitionAnalysis,
      meta: {
        title: '分区分析 - B站数据分析平台'
      }
    },
    {
      path: '/tags',
      name: 'TagAnalysis',
      component: TagAnalysis,
      meta: {
        title: '标签分析 - B站数据分析平台'
      }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        title: '登录 - B站数据分析平台'
      }
    },
    {
      path: '/admin',
      name: 'Admin',
      component: Admin,
      meta: {
        title: '管理后台 - B站数据分析平台'
      }
    },
    // 404页面捕获
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: '/'
    }
  ]
})

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  next()
})

export default router
