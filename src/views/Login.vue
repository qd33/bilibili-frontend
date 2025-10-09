<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card tech-card">
        <div class="login-header">
          <h1>用户登录</h1>
          <p>访问B站数据分析平台</p>
        </div>

        <el-form class="login-form">
          <el-form-item>
            <el-input
              placeholder="请输入用户名"
              size="large"
              prefix-icon="User"
            />
          </el-form-item>

          <el-form-item>
            <el-input
              type="password"
              placeholder="请输入密码"
              size="large"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" size="large" class="login-btn">
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <p>还没有账号？<a href="#" class="register-link">立即注册</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 登录逻辑将在后续开发
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary) 0%, #151b2d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  padding: 40px 30px;
  text-align: center;
}

.login-header {
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.login-header p {
  color: var(--text-secondary);
  font-size: 1rem;
}

.login-form {
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  background: var(--accent-blue);
  border: none;
  font-size: 1rem;
  height: 48px;
}

.login-btn:hover {
  background: #0099cc;
}

.login-footer {
  border-top: 1px solid #2d3748;
  padding-top: 20px;
}

.login-footer p {
  color: var(--text-secondary);
  margin: 0;
}

.register-link {
  color: var(--accent-blue);
  text-decoration: none;
}

.register-link:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-page {
    padding: 10px;
  }

  .login-card {
    padding: 30px 20px;
  }

  .login-header h1 {
    font-size: 1.5rem;
  }

  .login-header p {
    font-size: 0.9rem;
  }
}
</style>
