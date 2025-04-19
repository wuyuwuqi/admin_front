<template>
  <div class="user-container">
    <h1>用户管理</h1>
    <div class="user-content">
      <!-- 搜索筛选区域 -->
      <div class="search-area">
        <div class="search-form">
          <div class="form-item">
            <label>状态</label>
            <el-select v-model="searchForm.status" placeholder="全部" clearable>
              <el-option label="全部" value=""></el-option>
              <el-option label="启用" value="1"></el-option>
              <el-option label="禁用" value="0"></el-option>
            </el-select>
          </div>
          <div class="form-item">
            <label>真实姓名</label>
            <el-input v-model="searchForm.realName" placeholder="请输入" clearable></el-input>
          </div>
          <div class="form-item">
            <label>账号</label>
            <el-input v-model="searchForm.account" placeholder="请输入" clearable></el-input>
          </div>
          <div class="form-item date-range">
            <label>创建时间</label>
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            ></el-date-picker>
          </div>
          <div class="form-item">
            <el-button type="primary" @click="handleSearch">查询</el-button>
          </div>
        </div>
      </div>
      
      <!-- 用户列表 -->
      <div class="user-list">
        <div class="list-header">
          <el-button type="primary" size="small" @click="handleAdd">添加</el-button>
          <el-button size="small" @click="handleExport">导出</el-button>
        </div>
        
        <el-table :data="userList" style="width: 100%" border stripe>
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="account" label="账号" width="120" align="center" />
          <el-table-column prop="realName" label="真实姓名" width="120" align="center" />
          <el-table-column prop="phone" label="手机号码" width="120" align="center" />
          <el-table-column prop="email" label="邮箱" min-width="180" align="center" />
          <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
          <el-table-column label="状态" width="100" align="center">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(scope.row)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="scope">
              <div class="operation-buttons">
                <el-tooltip content="编辑" placement="top">
                  <el-button circle size="small" type="primary" @click="handleEdit(scope.row)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button circle size="small" type="danger" @click="handleDelete(scope.row)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    
    <!-- 新增/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="30%"
      :before-close="handleClose"
    >
      <div class="dialog-content">
        <el-form :model="userForm" :rules="rules" ref="userFormRef" label-width="100px">
          <el-form-item label="账号" prop="account">
            <el-input v-model="userForm.account" placeholder="请输入" clearable></el-input>
          </el-form-item>
          
          <el-form-item label="真实姓名" prop="realName">
            <el-input v-model="userForm.realName" placeholder="请输入" clearable></el-input>
          </el-form-item>
          
          <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
            <el-input v-model="userForm.password" type="password" placeholder="请输入" clearable show-password></el-input>
          </el-form-item>
          
          <el-form-item label="密码" prop="password" v-else>
            <el-input v-model="userForm.password" type="password" placeholder="请输入" clearable show-password></el-input>
            <el-button type="primary" size="small" class="reset-btn" @click="handleResetPassword">重置密码</el-button>
          </el-form-item>
          
          <el-form-item label="确认密码" prop="confirmPassword" v-if="dialogType === 'add' || showConfirmPassword">
            <el-input v-model="userForm.confirmPassword" type="password" placeholder="请再次输入密码" clearable show-password></el-input>
          </el-form-item>
          
          <el-form-item label="手机号码" prop="phone">
            <el-input v-model="userForm.phone" placeholder="请输入" clearable></el-input>
          </el-form-item>
          
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="userForm.email" placeholder="请输入" clearable></el-input>
          </el-form-item>
          
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="userForm.status">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="角色" prop="roleId">
            <el-select v-model="userForm.roleId" placeholder="请选择">
              <el-option 
                v-for="item in roleOptions" 
                :key="item.id" 
                :label="item.name" 
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" class="cancel-btn">取 消</el-button>
          <el-button type="primary" @click="submitForm" class="confirm-btn">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 删除用户确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="删除确认"
      width="30%"
      :show-close="false"
    >
      <div class="delete-confirm-content">
        <p>确定要删除该用户吗？</p>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false" class="cancel-btn">取 消</el-button>
          <el-button type="primary" @click="confirmDelete" class="confirm-btn">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete } from '@element-plus/icons-vue'

// 搜索表单数据
const searchForm = reactive({
  status: '',
  realName: '',
  account: '',
  dateRange: []
})

// 对话框相关变量
const dialogVisible = ref(false)
const dialogType = ref('add') // add 或 edit
const userFormRef = ref(null)
const showConfirmPassword = ref(false)

// 角色选项
const roleOptions = ref([
  { id: '1001', name: '超级管理员' },
  { id: '1002', name: '运营管理员' },
  { id: '1003', name: '财务管理员' },
  { id: '1004', name: '客服人员' }
])

// 验证确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== userForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 表单数据
const userForm = reactive({
  id: '',
  account: '',
  realName: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: '',
  status: 1,
  roleId: ''
})

// 表单验证规则
const rules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  roleId: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 模拟用户数据
const userList = ref([
  {
    id: 1,
    account: 'admin',
    realName: '管理员',
    phone: '13487878787',
    email: '11111111@qq.com',
    createTime: '2022-05-07 12:00:00',
    status: 1,
    roleId: '1001'
  },
  {
    id: 2,
    account: 'admin1',
    realName: '管理管理员',
    phone: '19838383831',
    email: '11111111@qq.com',
    createTime: '2022-05-07 12:00:00',
    status: 1
  },
  {
    id: 3,
    account: 'zhangsan',
    realName: '张三',
    phone: '13499999090',
    email: '11111111@qq.com',
    createTime: '2022-05-07 12:00:00',
    status: 1
  },
  {
    id: 4,
    account: 'ceshi',
    realName: '测试账号',
    phone: '13488888888',
    email: '11111111@qq.com',
    createTime: '2022-05-07 12:00:00',
    status: 1
  },
  {
    id: 5,
    account: 'tesst',
    realName: '测试账号',
    phone: '15888888888',
    email: '11111111@qq.com',
    createTime: '2022-05-07 12:00:00',
    status: 1
  },
  {
    id: 6,
    account: 'test',
    realName: '测试账号',
    phone: '18787878787',
    email: '11111111@qq.com',
    createTime: '2022-05-07 12:00:00',
    status: 0
  },
  {
    id: 7,
    account: 'lisi',
    realName: '李思思',
    phone: '19090909090',
    email: '11111111@qq.com',
    createTime: '2022-05-07 12:00:00',
    status: 1
  },
  {
    id: 8,
    account: 'zhangliaqi',
    realName: '张俪琦',
    phone: '13090909090',
    email: '11111111@qq.com',
    createTime: '2022-05-07 12:00:00',
    status: 0
  },
  {
    id: 9,
    account: 'put',
    realName: '普通账号',
    phone: '13409090909',
    email: '11111111@qq.com',
    createTime: '2022-05-07 12:00:00',
    status: 0
  }
])

// 搜索处理
const handleSearch = () => {
  // 实际项目中这里应该调用API进行搜索
  ElMessage.success('搜索成功')
  console.log('搜索条件:', searchForm)
}

// 导出处理
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 打开新增对话框
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  
  // 重置表单
  resetForm()
}

// 打开编辑对话框
const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  
  // 重置表单
  resetForm()
  
  // 填充表单数据
  userForm.id = row.id
  userForm.account = row.account
  userForm.realName = row.realName
  userForm.phone = row.phone
  userForm.email = row.email
  userForm.status = row.status
  userForm.roleId = row.roleId || '1001' // 默认设置为超级管理员，实际项目中应该从后端获取
  
  // 编辑模式下不显示密码字段的验证错误
  if (userFormRef.value) {
    userFormRef.value.clearValidate(['password', 'confirmPassword'])
  }
}

// 重置表单
const resetForm = () => {
  userForm.id = ''
  userForm.account = ''
  userForm.realName = ''
  userForm.password = ''
  userForm.confirmPassword = ''
  userForm.phone = ''
  userForm.email = ''
  userForm.status = 1
  userForm.roleId = ''
  showConfirmPassword.value = false
  
  // 重置表单验证
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
}

// 处理密码重置
const handleResetPassword = () => {
  userForm.password = ''
  userForm.confirmPassword = ''
  showConfirmPassword.value = true
  
  // 重置密码相关的表单验证
  if (userFormRef.value) {
    userFormRef.value.clearValidate(['password', 'confirmPassword'])
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

// 提交表单
const submitForm = async () => {
  if (!userFormRef.value) return
  
  // 根据操作类型设置验证规则
  let validateFields = ['account', 'realName', 'phone', 'email', 'roleId']
  if (dialogType.value === 'add') {
    validateFields.push('password', 'confirmPassword')
  } else if (showConfirmPassword.value) {
    validateFields.push('password', 'confirmPassword')
  }
  
  try {
    // 只验证需要的字段
    await userFormRef.value.validateField(validateFields)
    
    // 构造提交的数据
    const submitData = {
      id: userForm.id,
      account: userForm.account,
      realName: userForm.realName,
      phone: userForm.phone,
      email: userForm.email,
      status: userForm.status,
      roleId: userForm.roleId,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    
    // 添加密码字段（如果有）
    if (dialogType.value === 'add' || showConfirmPassword.value) {
      submitData.password = userForm.password
    }
    
    // 根据操作类型处理数据
    if (dialogType.value === 'add') {
      // 模拟添加操作
      submitData.id = userList.value.length + 1
      userList.value.push(submitData)
      ElMessage.success('添加成功')
    } else {
      // 模拟编辑操作
      const index = userList.value.findIndex(item => item.id === submitData.id)
      if (index !== -1) {
        // 保留原有的创建时间
        submitData.createTime = userList.value[index].createTime
        userList.value[index] = submitData
        ElMessage.success('编辑成功')
      }
    }
    
    // 关闭对话框
    dialogVisible.value = false
    resetForm()
  } catch (error) {
    ElMessage.error('请填写完整表单')
    console.error(error)
    return false
  }
}

// 删除用户相关变量
const deleteDialogVisible = ref(false)
const userToDelete = ref({})

// 打开删除确认对话框
const handleDelete = (row) => {
  userToDelete.value = row
  deleteDialogVisible.value = true
}

// 确认删除用户
const confirmDelete = () => {
  // 模拟删除操作
  const index = userList.value.findIndex(item => item.id === userToDelete.value.id)
  if (index !== -1) {
    userList.value.splice(index, 1)
    ElMessage.success('删除成功')
  }
  deleteDialogVisible.value = false
}

// 处理状态变更
const handleStatusChange = (row) => {
  const statusText = row.status === 1 ? '启用' : '禁用'
  ElMessage.success(`已${statusText}用户: ${row.realName}`)
  
  // 实际项目中这里应该调用API更新状态
  console.log('状态变更:', row)
}
</script>

<style scoped>
.user-container {
  padding: 20px;
}

.user-content {
  margin-top: 20px;
}

.search-area {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.form-item {
  display: flex;
  align-items: center;
}

.form-item label {
  margin-right: 10px;
  white-space: nowrap;
}

.form-item .el-input,
.form-item .el-select {
  width: 200px;
}

.date-range .el-date-editor {
  width: 350px;
}

.list-header {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.operation-buttons .el-button {
  padding: 6px;
  transition: all 0.3s;
}

.operation-buttons .el-button:hover {
  transform: scale(1.1);
}

/* 对话框样式 */
.dialog-content {
  padding: 10px 20px;
}

.delete-confirm-content {
  text-align: center;
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  width: 100%;
}

.cancel-btn,
.confirm-btn {
  width: 80px;
  border-radius: 4px;
}
</style>