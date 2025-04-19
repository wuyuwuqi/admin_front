<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>共享民宿管理平台</h2>
        <p>欢迎登录</p>
      </div>
      
      <div class="login-form">
        <div class="form-item">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名"
            prefix-icon="User"
          />
        </div>
        
        <div class="form-item">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </div>
        
        <div class="form-item remember">
          <el-checkbox v-model="loginForm.remember">7天内免登录</el-checkbox>
        </div>
        
        <el-button type="primary" class="login-button" @click="handleLogin">登录</el-button>
        
        <div class="login-footer">
          <a href="#">忘记密码？</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loginForm = ref({
  username: '',
  password: '',
  remember: false
})

const handleLogin = () => {
  // 这里添加登录逻辑
  // 模拟登录成功
  if (loginForm.value.username && loginForm.value.password) {
    // 实际项目中应该调用API进行身份验证
    router.push('/')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #8a6bff 0%, #6d5dfc 100%);
  overflow: hidden;
}

.login-card {
  width: 400px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
  text-align: center;
}

.login-header {
  margin-bottom: 30px;
}

.login-header h2 {
  font-size: 22px;
  color: #333;
  margin-bottom: 10px;
}

.login-header p {
  font-size: 16px;
  color: #666;
}

.login-form {
  text-align: left;
}

.form-item {
  margin-bottom: 20px;
}

.remember {
  display: flex;
  align-items: center;
}

.login-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
  background-color: #6d5dfc;
  border: none;
}

.login-button:hover {
  background-color: #5a4ae3;
}

.login-footer {
  margin-top: 15px;
  text-align: center;
}

.login-footer a {
  color: #6d5dfc;
  text-decoration: none;
  font-size: 14px;
}
</style>