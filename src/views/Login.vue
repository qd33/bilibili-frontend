<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card tech-card">
        <div class="login-header">
          <h1>用户登录</h1>
          <p>访问B站数据分析平台</p>
        </div>

        <el-form
          class="login-form"
          :model="loginForm"
          :rules="loginRules"
          ref="loginFormRef"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              prefix-icon="User"
              :disabled="loading"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              prefix-icon="Lock"
              show-password
              :disabled="loading"
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="test-accounts">
          <h3>测试账号</h3>
          <div class="account-list">
            <div class="account-item">
              <strong>管理员:</strong> admin / admin123
            </div>
            <div class="account-item">
              <strong>普通用户:</strong> user / user123
            </div>
          </div>
        </div>

        <div class="login-footer">
          <p>还没有账号？<router-link to="/register" class="register-link">立即注册</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 加载状态
const loading = ref(false)

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  // 表单验证
  try {
    await loginFormRef.value.validate()
  } catch (error) {
    console.log('❌ 表单验证失败')
    return
  }

  loading.value = true

  try {
    const result = await userStore.login(loginForm)

    if (result.success) {
      ElMessage.success('登录成功！')

      // 跳转到目标页面或首页
      const redirect = route.query.redirect as string
      if (redirect) {
        router.push(redirect)
      } else {
        router.push('/')
      }
    } else {
      ElMessage.error(result.message || '登录失败')
    }
  } catch (error: any) {
    console.error('❌ 登录异常:', error)
    ElMessage.error(error.message || '登录请求异常')
  } finally {
    loading.value = false
  }
}

// 自动填充测试账号（开发环境）
onMounted(() => {
  if (import.meta.env.DEV) {
    // 开发环境下可以自动填充测试账号，方便测试
    // loginForm.username = 'admin'
    // loginForm.password = 'admin123'
  }
})
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

.test-accounts {
  margin: 20px 0;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid #2d3748;
}

.test-accounts h3 {
  color: var(--text-primary);
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.account-list {
  text-align: left;
}

.account-item {
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-bottom: 5px;
}

.account-item:last-child {
  margin-bottom: 0;
}

.account-item strong {
  color: var(--accent-blue);
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
