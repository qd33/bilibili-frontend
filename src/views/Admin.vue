<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>管理员后台</h1>
      <p>系统管理和数据监控</p>
    </div>

    <div class="admin-grid">
      <div class="tech-card admin-card">
        <h3 class="section-title">用户管理</h3>
        <div class="admin-content">
          <p>用户列表和权限管理功能开发中...</p>
          <el-button type="primary" class="admin-btn">
            管理用户
          </el-button>
        </div>
      </div>

      <div class="tech-card admin-card">
        <h3 class="section-title">爬虫任务监控</h3>
        <div class="admin-content">
          <p>监控和管理数据采集任务</p>
          <el-button type="success" class="admin-btn">
            查看任务
          </el-button>
        </div>
      </div>

      <div class="tech-card admin-card">
        <h3 class="section-title">系统状态</h3>
        <div class="admin-content">
          <div class="status-item">
            <span class="status-label">后端服务：</span>
            <span class="status-value running">运行中</span>
          </div>
          <div class="status-item">
            <span class="status-label">数据库：</span>
            <span class="status-value running">正常</span>
          </div>
          <div class="status-item">
            <span class="status-label">爬虫服务：</span>
            <span class="status-value running">活跃</span>
          </div>
        </div>
      </div>

      <div class="tech-card admin-card">
        <h3 class="section-title">数据统计</h3>
        <div class="admin-content">
          <div class="stat-item">
            <span class="stat-label">总用户数：</span>
            <span class="stat-value">1,234</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">今日活跃：</span>
            <span class="stat-value">567</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">数据总量：</span>
            <span class="stat-value">89,012</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 管理员功能将在后续开发
</script>

<style scoped>
.admin-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.page-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.admin-card {
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 0;
}

.admin-btn {
  width: 100%;
  margin-top: 15px;
}

.status-item, .stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #2d3748;
}

.status-item:last-child, .stat-item:last-child {
  border-bottom: none;
}

.status-label, .stat-label {
  color: var(--text-secondary);
}

.status-value, .stat-value {
  color: var(--text-primary);
  font-weight: 600;
}

.running {
  color: #10b981;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-page {
    padding: 10px;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .page-header p {
    font-size: 0.9rem;
  }

  .admin-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .admin-card {
    min-height: 180px;
  }
}
</style>
