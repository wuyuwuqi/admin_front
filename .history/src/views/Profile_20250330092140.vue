<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <h2>个人信息</h2>
          <el-button type="primary" size="small" @click="showEditForm">修改信息</el-button>
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
    
    <!-- 修改信息对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="修改个人信息"
      width="500px"
    >
      <el-form :model="editForm" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="用户名" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="phoneNumber">
          <el-input v-model="editForm.phoneNumber" placeholder="请输入手机号码"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="editForm.address" placeholder="请输入地址"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'
import LandlordStorage from '../utils/LandlordStorage'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 从LandlordStorage获取用户信息
const userInfo = ref({
  id: '',
  username: '',
  phoneNumber: '',
  email: '',
  address: '',
  role: '',
  createdAt: '',
  loginTime: ''
})

// 表单引用
const formRef = ref(null)

// 对话框可见性
const dialogVisible = ref(false)

// 编辑表单数据
const editForm = reactive({
  name: '',
  email: '',
  phoneNumber: '',
  address: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phoneNumber: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  address: [
    { required: false, message: '请输入地址', trigger: 'blur' }
  ]
}

// 页面加载时获取LandlordStorage中的用户信息
const loadUserInfo = () => {
  try {
    const storedUserInfo = LandlordStorage.getUserInfo()
    if (storedUserInfo) {
      // 打印用户信息，便于调试
      console.log('从LandlordStorage获取的用户信息:', storedUserInfo)
      
      // 确保正确映射字段
      userInfo.value = {
        ...userInfo.value,
        id: storedUserInfo.id || '',  // 保存房东ID，用于更新信息
        username: storedUserInfo.username || '',
        phoneNumber: storedUserInfo.phoneNumber || '',
        email: storedUserInfo.email || '',
        address: storedUserInfo.address || '',  // 确保地址字段正确映射
        role: LandlordStorage.getRole() || '',  // 从LandlordStorage获取角色信息
        createdAt: storedUserInfo.createdAt || '',
        roleName: storedUserInfo.roleName || ''
      }
    }
    
    // 获取最后登录时间
    const loginTime = LandlordStorage.getLoginTime()
    if (loginTime) {
      console.log('获取到的登录时间:', loginTime)
      // 直接使用Date对象，不需要parseInt
      try {
        userInfo.value.loginTime = loginTime.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      } catch (error) {
        console.error('格式化登录时间失败:', error)
        userInfo.value.loginTime = '暂无记录'
      }
    } else {
      console.log('未找到最后登录时间')
      userInfo.value.loginTime = '暂无记录'
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 在组件挂载时加载用户信息
onMounted(() => {
  loadUserInfo()
})

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

// 显示编辑表单
const showEditForm = () => {
  // 初始化表单数据
  editForm.name = userInfo.value.username
  editForm.email = userInfo.value.email
  editForm.phoneNumber = userInfo.value.phoneNumber
  editForm.address = userInfo.value.address
  
  // 显示对话框
  dialogVisible.value = true
}

// 更新单个字段信息
const updateField = async (fieldName, fieldValue) => {
  try {
    const landlordId = userInfo.value.id
    if (!landlordId) {
      ElMessage.error('获取房东ID失败，请重新登录')
      return false
    }
    
    const response = await axios({
      method: 'post',
      url: `/api/landlord/updateLandlordInfo?landlordId=${landlordId}&fieldName=${fieldName}&fieldValue=${fieldValue}`,
      headers: {}
    })
    
    console.log('更新结果:', response.data)
    
    if (response.data && response.data.statusCode === 200) {
      ElMessage.success(response.data.message || `${fieldName}更新成功`)
      return true
    } else {
      ElMessage.error(response.data?.message || `${fieldName}更新失败`)
      return false
    }
  } catch (error) {
    console.error(`更新${fieldName}失败:`, error)
    ElMessage.error(`更新${fieldName}失败: ${error.message || '未知错误'}`)
    return false
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      // 显示加载中
      const loading = ElMessage({
        message: '正在更新个人信息...',
        type: 'info',
        duration: 0
      })
      
      try {
        // 检查每个字段是否有变化，有变化则更新
        let updateSuccess = true
        
        // 更新用户名
        if (editForm.name !== userInfo.value.username) {
          const nameResult = await updateField('name', editForm.name)
          if (nameResult) userInfo.value.username = editForm.name
          updateSuccess = updateSuccess && nameResult
        }
        
        // 更新邮箱
        if (editForm.email !== userInfo.value.email) {
          const emailResult = await updateField('email', editForm.email)
          if (emailResult) userInfo.value.email = editForm.email
          updateSuccess = updateSuccess && emailResult
        }
        
        // 更新手机号
        if (editForm.phoneNumber !== userInfo.value.phoneNumber) {
          const phoneResult = await updateField('phoneNumber', editForm.phoneNumber)
          if (phoneResult) userInfo.value.phoneNumber = editForm.phoneNumber
          updateSuccess = updateSuccess && phoneResult
        }
        
        // 更新地址
        if (editForm.address !== userInfo.value.address) {
          const addressResult = await updateField('address', editForm.address)
          if (addressResult) userInfo.value.address = editForm.address
          updateSuccess = updateSuccess && addressResult
        }
        
        // 关闭加载提示
        loading.close()
        
        if (updateSuccess) {
          ElMessage.success('个人信息更新成功')
          dialogVisible.value = false
          
          // 更新本地存储中的用户信息
          const storedUserInfo = LandlordStorage.getUserInfo()
          if (storedUserInfo) {
            storedUserInfo.username = userInfo.value.username
            storedUserInfo.email = userInfo.value.email
            storedUserInfo.phoneNumber = userInfo.value.phoneNumber
            storedUserInfo.address = userInfo.value.address
            localStorage.setItem(LandlordStorage.KEYS.USER_INFO, JSON.stringify(storedUserInfo))
          }
        }
      } catch (error) {
        console.error('更新个人信息失败:', error)
        loading.close()
        ElMessage.error('更新个人信息失败: ' + (error.message || '未知错误'))
      }
    } else {
      ElMessage.warning('请正确填写表单信息')
      return false
    }
  })
}
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