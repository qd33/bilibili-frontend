import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import UpAnalysis from '@/views/UpAnalysis.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/up/:uid?',
      name: 'UpAnalysis',
      component: UpAnalysis,
      props: true
    }
  ],
})

export default router
