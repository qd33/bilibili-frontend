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
          :class="{ active: $route.name === 'Home' }"
        >
          <el-icon><DataAnalysis /></el-icon>
          <span class="nav-text">数据总览</span>
        </router-link>

        <router-link
          to="/up"
          class="nav-item"
          :class="{ active: $route.name === 'UpAnalysis' }"
        >
          <el-icon><User /></el-icon>
          <span class="nav-text">UP主分析</span>
        </router-link>

        <router-link
          to="/partitions"
          class="nav-item"
          :class="{ active: $route.name === 'PartitionAnalysis' }"
        >
          <el-icon><PieChart /></el-icon>
          <span class="nav-text">分区分析</span>
        </router-link>

        <router-link
          to="/tags"
          class="nav-item"
          :class="{ active: $route.name === 'TagAnalysis' }"
        >
          <el-icon><PriceTag /></el-icon>
          <span class="nav-text">标签分析</span>
        </router-link>

        <router-link
          to="/admin"
          class="nav-item"
          :class="{ active: $route.name === 'Admin' }"
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
            :class="{ active: $route.name === 'Home' }"
            @click="showMobileMenu = false"
          >
            <el-icon><DataAnalysis /></el-icon>
            <span>数据总览</span>
          </router-link>

          <router-link
            to="/up"
            class="mobile-nav-item"
            :class="{ active: $route.name === 'UpAnalysis' }"
            @click="showMobileMenu = false"
          >
            <el-icon><User /></el-icon>
            <span>UP主分析</span>
          </router-link>

          <router-link
            to="/partitions"
            class="mobile-nav-item"
            :class="{ active: $route.name === 'PartitionAnalysis' }"
            @click="showMobileMenu = false"
          >
            <el-icon><PieChart /></el-icon>
            <span>分区分析</span>
          </router-link>

          <router-link
            to="/tags"
            class="mobile-nav-item"
            :class="{ active: $route.name === 'TagAnalysis' }"
            @click="showMobileMenu = false"
          >
            <el-icon><PriceTag /></el-icon>
            <span>标签分析</span>
          </router-link>

          <router-link
            to="/admin"
            class="mobile-nav-item"
            :class="{ active: $route.name === 'Admin' }"
            @click="showMobileMenu = false"
          >
            <el-icon><Setting /></el-icon>
            <span>管理后台</span>
          </router-link>
        </div>
      </div>

      <!-- 用户操作 -->
      <div class="nav-actions">
        <router-link to="/login" class="login-btn">
          <el-icon><User /></el-icon>
          <span class="login-text">登录</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  DataAnalysis,
  PieChart,
  PriceTag,
  User,
  Setting,
  Menu
} from '@element-plus/icons-vue'

const showMobileMenu = ref(false)
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
  min-width: 150px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
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
}

.mobile-nav-item:hover,
.mobile-nav-item.active {
  background: rgba(0, 174, 236, 0.2);
  color: var(--accent-blue);
}

/* 用户操作 */
.nav-actions .login-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--accent-blue);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.nav-actions .login-btn:hover {
  background: #0099cc;
  transform: translateY(-2px);
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

  .nav-actions .login-btn {
    padding: 6px 12px;
  }

  .login-text {
    display: none;
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
