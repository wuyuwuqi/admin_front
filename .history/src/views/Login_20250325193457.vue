<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 左侧区域：平台名称和图片 -->
      <div class="left-section">
        <div class="login-header">
          <h2>共享民宿管理平台</h2>
        </div>
        
        <div class="welcome-section">
          <p>欢迎登录</p>
        </div>
        
        <div class="house-image">
          <img src="/src/assets/house-illustration-new.svg" alt="民宿插图" />
        </div>
      </div>
      
      <!-- 右侧区域：登录表单 -->
      <div class="right-section">
        <div class="login-tabs">
          <div class="tab" :class="{ 'active': activeTab === 'account' }" @click="activeTab = 'account'">
            账号登录
          </div>
          <div class="tab" :class="{ 'active': activeTab === 'qrcode' }" @click="activeTab = 'qrcode'">
            扫码登录
          </div>
        </div>
        
        <div class="login-form" v-if="activeTab === 'account'">
          <div class="form-item">
            <el-input 
              v-model="loginForm.username" 
              placeholder="请输入账户"
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
        
        <div class="qrcode-container" v-if="activeTab === 'qrcode'">
          <div class="qrcode-placeholder">
            <el-icon><Picture /></el-icon>
            <p>请扫码登录</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Picture } from '@element-plus/icons-vue'

const router = useRouter()
const activeTab = ref('account')

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
    localStorage.setItem('isAuthenticated', 'true')
    
    // 如果选择了记住登录，设置7天的过期时间
    if (loginForm.value.remember) {
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 7)
      localStorage.setItem('authExpiry', expiryDate.toString())
    }
    
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
  width: 800px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  position: relative;
}

.login-header {
  margin-bottom: 5px;
}

.login-header h2 {
  font-size: 18px;
  color: #333;
  margin-bottom: 0;
  font-weight: 500;
}

.welcome-section {
  margin-bottom: 10px;
}

.welcome-section p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.house-image {
  margin: 10px auto;
  width: 150px;
  height: 120px;
}

.login-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.tab {
  padding: 8px 15px;
  margin: 0 10px;
  cursor: pointer;
  position: relative;
  color: #666;
  font-size: 14px;
}

.tab.active {
  color: #6d5dfc;
  font-weight: 500;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #6d5dfc;
}

.login-form {
  text-align: left;
  padding: 0 15px;
}

.form-item {
  margin-bottom: 15px;
}

.remember {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.login-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
  background-color: #6d5dfc;
  border: none;
  border-radius: 4px;
}

.login-button:hover {
  background-color: #5a4ae3;
}

.login-footer {
  margin-top: 10px;
  text-align: center;
}

.login-footer a {
  color: #6d5dfc;
  text-decoration: none;
  font-size: 12px;
}

.qrcode-container {
  padding: 20px 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.qrcode-placeholder {
  width: 180px;
  height: 180px;
  border: 1px dashed #ddd;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
}

.qrcode-placeholder .el-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .login-card {
    width: 90%;
    max-width: 380px;
  }
}
</style>