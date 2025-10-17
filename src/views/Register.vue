<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card tech-card">
        <div class="register-header">
          <h1>用户注册</h1>
          <p>创建B站数据分析平台账号</p>
        </div>

        <el-form
          class="register-form"
          :model="registerForm"
          :rules="registerRules"
          ref="registerFormRef"
          @submit.prevent="handleRegister"
        >
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              size="large"
              prefix-icon="User"
              :disabled="loading"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              prefix-icon="Lock"
              show-password
              :disabled="loading"
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              size="large"
              prefix-icon="Lock"
              show-password
              :disabled="loading"
              @keyup.enter="handleRegister"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="register-btn"
              :loading="loading"
              @click="handleRegister"
            >
              {{ loading ? '注册中...' : '注册' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="password-tips">
          <h4>密码要求：</h4>
          <ul>
            <li>长度6-20个字符</li>
            <li>建议包含字母和数字</li>
            <li>区分大小写</li>
          </ul>
        </div>

        <div class="register-footer">
          <p>已有账号？<router-link to="/login" class="login-link">立即登录</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const registerFormRef = ref<FormInstance>()

// 表单数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

// 加载状态
const loading = ref(false)

// 自定义验证规则：确认密码
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

// 表单验证规则
const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: '用户名只能包含字母、数字和下划线',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value.length < 6) {
          callback(new Error('密码长度不能少于6位'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return

  // 表单验证
  try {
    await registerFormRef.value.validate()
  } catch (error) {
    console.log('❌ 表单验证失败')
    return
  }

  loading.value = true

  try {
    const result = await userStore.register({
      username: registerForm.username,
      password: registerForm.password
    })

    if (result.success) {
      ElMessage.success('注册成功！正在跳转到登录页面...')

      // 延迟跳转到登录页面
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      ElMessage.error(result.message || '注册失败')
    }
  } catch (error: any) {
    console.error('❌ 注册异常:', error)
    ElMessage.error(error.message || '注册请求异常')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary) 0%, #151b2d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 400px;
}

.register-card {
  padding: 40px 30px;
  text-align: center;
}

.register-header {
  margin-bottom: 30px;
}

.register-header h1 {
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.register-header p {
  color: var(--text-secondary);
  font-size: 1rem;
}

.register-form {
  margin-bottom: 20px;
}

.register-btn {
  width: 100%;
  background: var(--accent-green);
  border: none;
  font-size: 1rem;
  height: 48px;
}

.register-btn:hover {
  background: #52c41a;
}

.password-tips {
  margin: 20px 0;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid #2d3748;
  text-align: left;
}

.password-tips h4 {
  color: var(--text-primary);
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.password-tips ul {
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin: 0;
  padding-left: 16px;
}

.password-tips li {
  margin-bottom: 4px;
}

.password-tips li:last-child {
  margin-bottom: 0;
}

.register-footer {
  border-top: 1px solid #2d3748;
  padding-top: 20px;
}

.register-footer p {
  color: var(--text-secondary);
  margin: 0;
}

.login-link {
  color: var(--accent-blue);
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-page {
    padding: 10px;
  }

  .register-card {
    padding: 30px 20px;
  }

  .register-header h1 {
    font-size: 1.5rem;
  }

  .register-header p {
    font-size: 0.9rem;
  }
}
</style>
