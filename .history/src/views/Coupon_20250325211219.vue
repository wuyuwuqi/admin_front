<template>
  <div class="coupon-container">
    <h1>优惠券管理</h1>
    <div class="coupon-content">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>优惠券列表</span>
            <el-button type="primary" size="small" @click="openDialog('add')">新增优惠券</el-button>
          </div>
        </template>
        <div class="coupon-table">
          <el-table :data="couponList" style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="优惠券名称" width="180" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="value" label="面值/折扣" width="120" />
            <el-table-column prop="minAmount" label="最低消费" width="120" />
            <el-table-column prop="startTime" label="开始时间" width="180" />
            <el-table-column prop="endTime" label="结束时间" width="180" />
            <el-table-column prop="status" label="状态" width="100" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button size="small" type="primary" @click="openDialog('edit', scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>
    
    <!-- 新增/编辑优惠券对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增优惠券' : '编辑优惠券'"
      width="50%"
      :before-close="handleClose"
    >
      <el-form :model="couponForm" :rules="rules" ref="couponFormRef" label-width="100px">
        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="couponForm.name" placeholder="请输入优惠券名称"></el-input>
        </el-form-item>
        
        <el-form-item label="面值" prop="value">
          <el-input v-model="couponForm.value" placeholder="请输入面值"></el-input>
        </el-form-item>
        
        <el-form-item label="订单金额" prop="minAmount">
          <el-radio-group v-model="couponForm.limitType">
            <el-radio :label="0">无限制</el-radio>
            <el-radio :label="1">满</el-radio>
          </el-radio-group>
          <el-input 
            v-if="couponForm.limitType === 1" 
            v-model="couponForm.minAmount" 
            placeholder="请输入金额" 
            style="width: 150px; margin-left: 10px;"
          ></el-input>
          <span v-if="couponForm.limitType === 1">可用</span>
        </el-form-item>
        
        <el-form-item label="发放数量" prop="quantity">
          <el-input v-model="couponForm.quantity" placeholder="请输入发放数量"></el-input>
        </el-form-item>
        
        <el-form-item label="适用民宿" prop="applyTo">
          <el-select v-model="couponForm.applyTo" placeholder="请选择适用民宿">
            <el-option label="全部" value="all"></el-option>
            <el-option label="指定民宿" value="specific"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="有效期" prop="validPeriod">
          <el-date-picker
            v-model="couponForm.validPeriod"
            type="daterange"
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        
        <el-form-item label="领取方式" prop="obtainMethod">
          <el-select v-model="couponForm.obtainMethod" placeholder="请选择领取方式">
            <el-option label="限时领取" value="limited"></el-option>
            <el-option label="新用户专享" value="newUser"></el-option>
            <el-option label="活动赠送" value="activity"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="补充说明">
          <el-input 
            v-model="couponForm.description" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入补充说明"
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 对话框相关变量
const dialogVisible = ref(false)
const dialogType = ref('add') // add 或 edit
const couponFormRef = ref(null)

// 表单数据
const couponForm = reactive({
  id: '',
  name: '',
  type: '满减券', // 默认类型
  value: '',
  limitType: 0, // 0-无限制，1-满额可用
  minAmount: '',
  quantity: '',
  applyTo: 'all',
  validPeriod: [],
  obtainMethod: 'limited',
  description: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入优惠券名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  value: [
    { required: true, message: '请输入面值', trigger: 'blur' }
  ],
  minAmount: [
    { required: true, message: '请输入最低消费金额', trigger: 'blur' }
  ],
  quantity: [
    { required: true, message: '请输入发放数量', trigger: 'blur' },
    { pattern: /^[0-9]\d*$/, message: '请输入正整数', trigger: 'blur' }
  ],
  applyTo: [
    { required: true, message: '请选择适用民宿', trigger: 'change' }
  ],
  validPeriod: [
    { required: true, message: '请选择有效期', trigger: 'change' }
  ],
  obtainMethod: [
    { required: true, message: '请选择领取方式', trigger: 'change' }
  ]
}

// 模拟数据
const couponList = ref([
  {
    id: 1,
    name: '新用户优惠券',
    type: '满减券',
    value: '100元',
    minAmount: '500元',
    startTime: '2023-01-01 00:00:00',
    endTime: '2023-12-31 23:59:59',
    status: '有效'
  },
  {
    id: 2,
    name: '节日特惠券',
    type: '折扣券',
    value: '8折',
    minAmount: '300元',
    startTime: '2023-05-01 00:00:00',
    endTime: '2023-05-07 23:59:59',
    status: '已过期'
  },
  {
    id: 3,
    name: '会员专享券',
    type: '满减券',
    value: '50元',
    minAmount: '200元',
    startTime: '2023-06-01 00:00:00',
    endTime: '2023-12-31 23:59:59',
    status: '有效'
  }
])

// 打开对话框
const openDialog = (type, row) => {
  dialogType.value = type
  dialogVisible.value = true
  
  // 重置表单
  resetForm()
  
  // 如果是编辑，填充表单数据
  if (type === 'edit' && row) {
    couponForm.id = row.id
    couponForm.name = row.name
    couponForm.type = row.type
    
    // 处理面值
    couponForm.value = row.value.replace(/[^0-9.]/g, '')
    
    // 处理最低消费
    if (row.minAmount === '无限制') {
      couponForm.limitType = 0
      couponForm.minAmount = ''
    } else {
      couponForm.limitType = 1
      couponForm.minAmount = row.minAmount.replace(/[^0-9.]/g, '')
    }
    
    // 处理有效期
    couponForm.validPeriod = [
      new Date(row.startTime),
      new Date(row.endTime)
    ]
    
    // 其他字段根据实际情况填充
    couponForm.quantity = '100' // 假设数量
    couponForm.description = row.description || ''
  }
}

// 重置表单
const resetForm = () => {
  couponForm.id = ''
  couponForm.name = ''
  couponForm.type = '满减券'
  couponForm.value = ''
  couponForm.limitType = 0
  couponForm.minAmount = ''
  couponForm.quantity = ''
  couponForm.applyTo = 'all'
  couponForm.validPeriod = []
  couponForm.obtainMethod = 'limited'
  couponForm.description = ''
  
  // 重置表单验证
  if (couponFormRef.value) {
    couponFormRef.value.resetFields()
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

// 提交表单
const submitForm = async () => {
  if (!couponFormRef.value) return
  
  await couponFormRef.value.validate((valid) => {
    if (valid) {
      // 构造提交的数据
      const submitData = {
        id: couponForm.id,
        name: couponForm.name,
        type: couponForm.type,
        value: couponForm.type === '满减券' ? couponForm.value + '元' : couponForm.value + '折',
        minAmount: couponForm.limitType === 0 ? '无限制' : couponForm.minAmount + '元',
        startTime: couponForm.validPeriod[0] ? couponForm.validPeriod[0].toISOString().split('T')[0] + ' 00:00:00' : '',
        endTime: couponForm.validPeriod[1] ? couponForm.validPeriod[1].toISOString().split('T')[0] + ' 23:59:59' : '',
        status: new Date() < new Date(couponForm.validPeriod[1]) ? '有效' : '已过期',
        quantity: couponForm.quantity,
        applyTo: couponForm.applyTo,
        obtainMethod: couponForm.obtainMethod,
        description: couponForm.description
      }
      
      // 根据操作类型处理数据
      if (dialogType.value === 'add') {
        // 模拟添加操作
        submitData.id = couponList.value.length + 1
        couponList.value.push(submitData)
        ElMessage.success('添加成功')
      } else {
        // 模拟编辑操作
        const index = couponList.value.findIndex(item => item.id === submitData.id)
        if (index !== -1) {
          couponList.value[index] = submitData
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

// 删除优惠券
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除优惠券
</script>

<style scoped>
.coupon-container {
  padding: 20px;
}

.coupon-content {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coupon-table {
  margin-top: 20px;
}
</style>