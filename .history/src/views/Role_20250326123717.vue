<template>
  <div class="role-container">
    <h1>角色管理</h1>
    <div class="role-content">
      <!-- 搜索筛选区域 -->
      <div class="search-area">
        <div class="search-form">
          <div class="form-item">
            <label>角色名称</label>
            <el-input v-model="searchForm.name" placeholder="请输入" clearable></el-input>
          </div>
          <div class="form-item">
            <label>角色编号</label>
            <el-input v-model="searchForm.code" placeholder="请输入" clearable></el-input>
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
      
      <!-- 角色列表 -->
      <div class="role-list">
        <div class="list-header">
          <el-button type="primary" size="small" @click="handleAdd">新增</el-button>
          <el-button size="small" @click="handleExport">导出</el-button>
        </div>
        
        <el-table :data="roleList" style="width: 100%" border stripe>
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="code" label="角色编号" width="120" align="center" />
          <el-table-column prop="name" label="角色名称" width="180" align="center" />
          <el-table-column prop="description" label="角色描述" min-width="180" align="center" />
          <el-table-column prop="relatedCount" label="关联数量" width="100" align="center" />
          <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
          <el-table-column label="操作" width="180" align="center">
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
                <el-tooltip content="权限" placement="top">
                  <el-button circle size="small" type="success" @click="handlePermission(scope.row)">
                    <el-icon><Setting /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    
    <!-- 新增/编辑角色对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="50%"
      :before-close="handleClose"
    >
      <el-form :model="roleForm" :rules="rules" ref="roleFormRef" label-width="100px">
        <el-form-item label="角色编号" prop="code">
          <el-input v-model="roleForm.code" placeholder="请输入角色编号"></el-input>
        </el-form-item>
        
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        
        <el-form-item label="角色描述" prop="description">
          <el-input 
            v-model="roleForm.description" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入角色描述"
          ></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 权限设置对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="权限设置"
      width="50%"
      :before-close="handlePermissionDialogClose"
    >
      <div class="permission-content">
        <p>当前角色: {{ currentRole.name }}</p>
        <el-tree
          ref="permissionTree"
          :data="permissionList"
          show-checkbox
          node-key="id"
          :default-checked-keys="checkedPermissions"
          :props="{ label: 'name' }"
        ></el-tree>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="savePermissions">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Setting } from '@element-plus/icons-vue'

// 搜索表单数据
const searchForm = reactive({
  name: '',
  code: '',
  dateRange: []
})

// 对话框相关变量
const dialogVisible = ref(false)
const dialogType = ref('add') // add 或 edit
const roleFormRef = ref(null)

// 权限对话框相关变量
const permissionDialogVisible = ref(false)
const permissionTree = ref(null)
const currentRole = ref({})
const checkedPermissions = ref([])

// 表单数据
const roleForm = reactive({
  id: '',
  code: '',
  name: '',
  description: ''
})

// 表单验证规则
const rules = {
  code: [
    { required: true, message: '请输入角色编号', trigger: 'blur' },
    { pattern: /^\d{4}$/, message: '角色编号必须为4位数字', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' }
  ]
}

// 模拟角色数据
const roleList = ref([
  {
    id: 1,
    code: '1001',
    name: '超级管理员',
    description: '拥有最高权限管理权限',
    relatedCount: 1,
    createTime: '2023-05-07 12:00:00'
  },
  {
    id: 2,
    code: '1002',
    name: '普通管理员',
    description: '负责日常运营管理',
    relatedCount: 5,
    createTime: '2023-05-07 12:00:00'
  },
  {
    id: 3,
    code: '1003',
    name: 'CEO',
    description: '公司最高管理者',
    relatedCount: 6,
    createTime: '2023-05-07 12:00:00'
  },
  {
    id: 4,
    code: '1004',
    name: '店长',
    description: '负责门店管理',
    relatedCount: 10,
    createTime: '2023-05-07 12:00:00'
  },
  {
    id: 5,
    code: '1005',
    name: '店员',
    description: '负责日常接待和服务',
    relatedCount: 30,
    createTime: '2023-05-07 12:00:00'
  },
  {
    id: 6,
    code: '1006',
    name: '收银员',
    description: '负责收银和账务处理',
    relatedCount: 20,
    createTime: '2023-05-07 12:00:00'
  },
  {
    id: 7,
    code: '1007',
    name: '财务专员',
    description: '负责财务管理和报表',
    relatedCount: 10,
    createTime: '2023-05-07 12:00:00'
  },
  {
    id: 8,
    code: '1008',
    name: '客服专员',
    description: '负责客户服务和投诉处理',
    relatedCount: 12,
    createTime: '2023-05-07 12:00:00'
  },
  {
    id: 9,
    code: '1009',
    name: 'PMO',
    description: '负责项目管理和协调',
    relatedCount: 5,
    createTime: '2023-05-07 12:00:00'
  }
])

// 模拟权限数据
const permissionList = ref([
  {
    id: 1,
    name: '系统管理',
    children: [
      { id: 11, name: '用户管理' },
      { id: 12, name: '角色管理' },
      { id: 13, name: '菜单管理' },
      { id: 14, name: '部门管理' }
    ]
  },
  {
    id: 2,
    name: '业务管理',
    children: [
      { id: 21, name: '订单管理' },
      { id: 22, name: '商品管理' },
      { id: 23, name: '库存管理' },
      { id: 24, name: '客户管理' }
    ]
  },
  {
    id: 3,
    name: '财务管理',
    children: [
      { id: 31, name: '收入管理' },
      { id: 32, name: '支出管理' },
      { id: 33, name: '报表管理' }
    ]
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
  roleForm.id = row.id
  roleForm.code = row.code
  roleForm.name = row.name
  roleForm.description = row.description
}

// 重置表单
const resetForm = () => {
  roleForm.id = ''
  roleForm.code = ''
  roleForm.name = ''
  roleForm.description = ''
  
  // 重置表单验证
  if (roleFormRef.value) {
    roleFormRef.value.resetFields()
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

// 提交表单
const submitForm = async () => {
  if (!roleFormRef.value) return
  
  await roleFormRef.value.validate((valid) => {
    if (valid) {
      // 构造提交的数据
      const submitData = {
        id: roleForm.id,
        code: roleForm.code,
        name: roleForm.name,
        description: roleForm.description,
        relatedCount: 0,
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }
      
      // 根据操作类型处理数据
      if (dialogType.value === 'add') {
        // 模拟添加操作
        submitData.id = roleList.value.length + 1
        roleList.value.push(submitData)
        ElMessage.success('添加成功')
      } else {
        // 模拟编辑操作
        const index = roleList.value.findIndex(item => item.id === submitData.id)
        if (index !== -1) {
          // 保留原有的关联数量和创建时间
          submitData.relatedCount = roleList.value[index].relatedCount
          submitData.createTime = roleList.value[index].createTime
          roleList.value[index] = submitData
          ElMessage.success('编辑成功')
        }
      }
      
      // 关闭对话框
      dialogVisible.value = false
      resetForm()
    } else {
      ElMessage.error('请填写完整表单')
      return false
    }
  })
}

// 删除角色
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除角色 "${row.name}" 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟删除操作
    const index = roleList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      roleList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 打开权限设置对话框
const handlePermission = (row) => {
  currentRole.value = row
  permissionDialogVisible.value = true
  
  // 模拟获取当前角色的权限
  if (row.id === 1) { // 超级管理员拥有所有权限
    checkedPermissions.value = [11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33]
  } else if (row.id === 2) { // 普通管理员拥有部分权限
    checkedPermissions.value = [11, 12, 21, 22, 24]
  } else {
    // 其他角色随机分配一些权限
    checkedPermissions.value = [11, 21, 31]
  }
}

// 关闭权限对话框
const handlePermissionDialogClose = () => {
  permissionDialogVisible.value = false
  checkedPermissions.value = []
}

// 保存权限设置
const savePermissions = () => {
  if (!permissionTree.value) return
  
  // 获取选中的节点
  const checkedNodes = permissionTree.value.getCheckedNodes()
  const checkedKeys = permissionTree.value.getCheckedKeys()
  
  console.log('选中的权限节点:', checkedNodes)
  console.log('选中的权限ID:', checkedKeys)
  
  ElMessage.success(`已成功为角色 "${currentRole.value.name}" 分配权限`)
  permissionDialogVisible.value = false
}
</script>

<style scoped>
.role-container {
  padding: 20px;
}

.role-content {
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

.form-item .el-input {
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

.permission-content {
  margin-top: 20px;
}

.permission-content p {
  margin-bottom: 15px;
  font-weight: bold;
}
</style>