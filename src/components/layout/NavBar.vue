<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Logo -->
      <div class="nav-logo">
        <router-link to="/" class="logo-link">
          <span class="logo-icon">📊</span>
          <span class="logo-text">B站数据分析</span>
        </router-link>
      </div>

      <!-- 桌面端导航菜单 -->
      <div class="nav-menu desktop-menu">
        <router-link
          to="/"
          class="nav-item"
          :class="{ active: currentRouteName === 'Home' }"
        >
          <el-icon><DataAnalysis /></el-icon>
          <span class="nav-text">数据总览</span>
        </router-link>

        <router-link
          to="/up"
          class="nav-item"
          :class="{ active: currentRouteName === 'UpAnalysis' }"
        >
          <el-icon><User /></el-icon>
          <span class="nav-text">UP主分析</span>
        </router-link>

        <router-link
          to="/partitions"
          class="nav-item"
          :class="{ active: currentRouteName === 'PartitionAnalysis' }"
        >
          <el-icon><PieChart /></el-icon>
          <span class="nav-text">分区分析</span>
        </router-link>

        <!-- 标签分析菜单项 -->
        <router-link
          to="/tags"
          class="nav-item"
          :class="{ active: currentRouteName === 'TagAnalysis' }"
        >
          <el-icon><PriceTag /></el-icon>
          <span class="nav-text">标签分析</span>
        </router-link>

        <router-link
          v-if="userStore.isAdmin"
          to="/admin"
          class="nav-item"
          :class="{ active: currentRouteName === 'Admin' }"
        >
          <el-icon><Setting /></el-icon>
          <span class="nav-text">管理后台</span>
        </router-link>
      </div>

      <!-- 移动端汉堡菜单 -->
      <div class="mobile-menu">
        <el-button
          class="hamburger-btn"
          @click="showMobileMenu = !showMobileMenu"
          text
          :icon="Menu"
        />

        <div v-if="showMobileMenu" class="mobile-dropdown">
          <router-link
            to="/"
            class="mobile-nav-item"
            :class="{ active: currentRouteName === 'Home' }"
            @click="showMobileMenu = false"
          >
            <el-icon><DataAnalysis /></el-icon>
            <span>数据总览</span>
          </router-link>

          <router-link
            to="/up"
            class="mobile-nav-item"
            :class="{ active: currentRouteName === 'UpAnalysis' }"
            @click="showMobileMenu = false"
          >
            <el-icon><User /></el-icon>
            <span>UP主分析</span>
          </router-link>

          <router-link
            to="/partitions"
            class="mobile-nav-item"
            :class="{ active: currentRouteName === 'PartitionAnalysis' }"
            @click="showMobileMenu = false"
          >
            <el-icon><PieChart /></el-icon>
            <span>分区分析</span>
          </router-link>

          <!-- 标签分析移动端菜单项 -->
          <router-link
            to="/tags"
            class="mobile-nav-item"
            :class="{ active: currentRouteName === 'TagAnalysis' }"
            @click="showMobileMenu = false"
          >
            <el-icon><PriceTag /></el-icon>
            <span>标签分析</span>
          </router-link>

          <router-link
            v-if="userStore.isAdmin"
            to="/admin"
            class="mobile-nav-item"
            :class="{ active: currentRouteName === 'Admin' }"
            @click="showMobileMenu = false"
          >
            <el-icon><Setting /></el-icon>
            <span>管理后台</span>
          </router-link>

          <div class="mobile-auth-buttons" v-if="!userStore.isAuthenticated">
            <router-link
              to="/login"
              class="mobile-login-btn"
              @click="showMobileMenu = false"
            >
              <el-icon><User /></el-icon>
              <span>登录</span>
            </router-link>
            <router-link
              to="/register"
              class="mobile-register-btn"
              @click="showMobileMenu = false"
            >
              <el-icon><Edit /></el-icon>
              <span>注册</span>
            </router-link>
          </div>

          <div class="mobile-user-info" v-if="userStore.isAuthenticated">
            <div class="user-welcome">欢迎, {{ userStore.user?.username }}</div>
            <el-button
              size="small"
              @click="handleLogout"
              class="mobile-logout-btn"
            >
              退出登录
            </el-button>
          </div>
        </div>
      </div>

      <!-- 用户操作 -->
      <div class="nav-actions">
        <template v-if="userStore.isAuthenticated">
          <div class="user-info">
            <span class="welcome-text">欢迎, </span>
            <span class="username">{{ userStore.user?.username }}</span>
            <span class="user-role" :class="userStore.user?.role?.toLowerCase()">
              {{ userStore.user?.role === 'ADMIN' ? '管理员' : '用户' }}
            </span>
          </div>
          <el-button
            class="logout-btn"
            @click="handleLogout"
            size="small"
          >
            <el-icon><SwitchButton /></el-icon>
            <span class="logout-text">退出</span>
          </el-button>
        </template>
        <template v-else>
          <div class="auth-buttons">
            <router-link to="/register" class="register-btn">
              <el-icon><Edit /></el-icon>
              <span class="register-text">注册</span>
            </router-link>
            <router-link to="/login" class="login-btn">
              <el-icon><User /></el-icon>
              <span class="login-text">登录</span>
            </router-link>
          </div>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DataAnalysis,
  PieChart,
  User,
  Setting,
  Menu,
  SwitchButton,
  Edit,
  PriceTag
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const showMobileMenu = ref(false)

// 计算当前路由名称
const currentRouteName = computed(() => route.name)

// 处理退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (error) {
    // 用户取消退出
    console.log('取消退出登录')
  }
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, var(--bg-secondary) 0%, #151b2d 100%);
  border-bottom: 1px solid #2d3748;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  height: 60px;
}

.nav-logo .logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--text-primary);
  font-weight: bold;
  font-size: 1.2rem;
}

.logo-icon {
  font-size: 1.5rem;
  margin-right: 8px;
}

.logo-text {
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 桌面端菜单 */
.desktop-menu {
  display: flex;
  gap: 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  text-decoration: none;
  color: var(--text-secondary);
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.nav-item.active {
  background: rgba(0, 174, 236, 0.2);
  color: var(--accent-blue);
  border: 1px solid rgba(0, 174, 236, 0.3);
}

/* 移动端菜单 */
.mobile-menu {
  display: none;
  position: relative;
}

.hamburger-btn {
  color: var(--text-primary) !important;
  font-size: 1.5rem;
}

.mobile-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid #2d3748;
  border-radius: 8px;
  padding: 10px;
  min-width: 180px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 1001;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  text-decoration: none;
  color: var(--text-secondary);
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.mobile-nav-item:hover,
.mobile-nav-item.active {
  background: rgba(0, 174, 236, 0.2);
  color: var(--accent-blue);
}

.mobile-auth-buttons {
  border-top: 1px solid #2d3748;
  padding-top: 10px;
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mobile-login-btn,
.mobile-register-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
  justify-content: center;
}

.mobile-login-btn {
  background: var(--accent-blue);
  color: white;
}

.mobile-register-btn {
  background: var(--accent-green);
  color: white;
}

.mobile-user-info {
  border-top: 1px solid #2d3748;
  padding-top: 10px;
  margin-top: 5px;
}

.user-welcome {
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-bottom: 8px;
  text-align: center;
}

.mobile-logout-btn {
  width: 100%;
}

/* 用户操作 */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.welcome-text {
  color: var(--text-secondary);
}

.username {
  color: var(--text-primary);
  font-weight: 500;
}

.user-role {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
}

.user-role.admin {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

.user-role.user {
  background: rgba(24, 144, 255, 0.2);
  color: #1890ff;
}

.auth-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.register-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--accent-green);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.register-btn:hover {
  background: #52c41a;
  transform: translateY(-1px);
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--accent-blue);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.login-btn:hover {
  background: #0099cc;
  transform: translateY(-1px);
}

.logout-btn {
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.3);
  color: #ff4d4f;
}

.logout-btn:hover {
  background: rgba(255, 77, 79, 0.2);
  border-color: #ff4d4f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar {
    padding: 0 10px;
  }

  .nav-logo .logo-link {
    font-size: 1rem;
  }

  .logo-icon {
    font-size: 1.2rem;
    margin-right: 6px;
  }

  .desktop-menu {
    display: none;
  }

  .mobile-menu {
    display: block;
  }

  .login-text, .logout-text, .register-text {
    display: none;
  }

  .user-info {
    display: none;
  }

  .auth-buttons {
    gap: 5px;
  }

  .register-btn, .login-btn {
    padding: 6px 8px;
  }
}

@media (max-width: 480px) {
  .nav-text {
    display: none;
  }

  .nav-item {
    padding: 8px 12px;
  }
}
</style>
