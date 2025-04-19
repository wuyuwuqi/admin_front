<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <h2>个人信息</h2>
        </div>
      </template>
      <div class="profile-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="avatar-container">
              <el-avatar :size="120" :icon="UserFilled" />
              <div class="username">{{ userInfo.username }}</div>
              <div class="role">{{ userInfo.roleName }}</div>
            </div>
          </el-col>
          <el-col :span="16">
            <div class="info-list">
              <div class="info-item">
                <span class="label">用户名：</span>
                <span class="value">{{ userInfo.username }}</span>
              </div>
              <div class="info-item">
                <span class="label">手机号码：</span>
                <span class="value">{{ maskedPhone }}</span>
              </div>
              <div class="info-item">
                <span class="label">邮箱：</span>
                <span class="value">{{ userInfo.email }}</span>
              </div>
              <div class="info-item">
                <span class="label">地址：</span>
                <span class="value">{{ userInfo.address }}</span>
              </div>
              <div class="info-item">
                <span class="label">创建时间：</span>
                <span class="value">{{ formattedCreatedAt }}</span>
              </div>
              <div class="info-item">
                <span class="label">角色：</span>
                <span class="value">{{ userInfo.role }}</span>
              </div>
              <div class="info-item">
                <span class="label">最后登录时间：</span>
                <span class="value">{{ userInfo.loginTime }}</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'

// 从localStorage获取用户信息
const userInfo = ref({
  username: '',
  phoneNumber: '',
  email: '',
  address: '',
  role: '',
  createdAt: '',
  loginTime: ''
})

// 页面加载时获取localStorage中的用户信息
const loadUserInfo = () => {
  try {
    const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (storedUserInfo) {
      // 打印用户信息，便于调试
      console.log('从localStorage获取的用户信息:', storedUserInfo)
      
      // 确保正确映射字段
      userInfo.value = {
        ...userInfo.value,
        username: storedUserInfo.username || '',
        phoneNumber: storedUserInfo.phoneNumber || '',
        email: storedUserInfo.email || '',
        address: storedUserInfo.address || '',  // 确保地址字段正确映射
        role: localStorage.getItem('role') || '',  // 从localStorage获取角色信息
        createdAt: storedUserInfo.createdAt || '',
        roleName: storedUserInfo.roleName || ''
      }
    }
    
    // 获取最后登录时间
    const loginTime = localStorage.getItem('loginTime')
    if (loginTime) {
      userInfo.value.loginTime = new Date(loginTime).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 调用加载函数
loadUserInfo()

// 手机号码脱敏处理
const maskedPhone = computed(() => {
  if (!userInfo.value.phoneNumber) return ''
  const phone = userInfo.value.phoneNumber
  return phone.substring(0, 3) + '****' + phone.substring(7)
})

// 格式化创建时间
const formattedCreatedAt = computed(() => {
  if (!userInfo.value.createdAt) return ''
  const date = new Date(userInfo.value.createdAt)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.profile-card {
  width: 100%;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.username {
  margin-top: 15px;
  font-size: 18px;
  font-weight: bold;
}

.role {
  margin-top: 5px;
  color: #909399;
}

.info-list {
  padding: 20px 0;
}

.info-item {
  margin-bottom: 15px;
  font-size: 14px;
  display: flex;
}

.label {
  color: #606266;
  width: 120px;
}

.value {
  color: #303133;
  font-weight: 500;
}
</style>