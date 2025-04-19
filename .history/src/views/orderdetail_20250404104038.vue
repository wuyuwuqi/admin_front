<template>
  <div class="order-detail-page">
    <!-- 顶部导航栏 -->
    <div class="page-header">
      <div class="back-button" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <div class="order-status">
        <el-tag :type="getStatusType(order.status)">{{ orderStatusText }}</el-tag>
      </div>
    </div>

    <!-- 加载中状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton style="width: 100%" :rows="10" animated />
    </div>

    <!-- 加载错误状态 -->
    <div v-else-if="loadingError" class="error-message">
      <el-alert
        title="获取订单数据失败"
        type="error"
        description="请检查网络连接或稍后重试"
        show-icon
        :closable="false"
      />
      <el-button type="primary" @click="fetchOrderDetail" style="margin-top: 15px;">重新加载</el-button>
    </div>

    <div v-else>
      <!-- 订单信息区块 -->
      <el-card class="info-card order-info-card">
        <template #header>
          <div class="card-header">
            <span>订单信息</span>
          </div>
        </template>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">订单编号</span>
            <span class="info-value">{{ order.id }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">下单时间</span>
            <span class="info-value">{{ order.createTime }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">付款方式</span>
            <span class="info-value">{{ order.paymentMethod || '在线支付' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">付款状态</span>
            <span class="info-value">{{ order.paymentStatus }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">优惠金额</span>
            <span class="info-value">¥ {{ order.discountAmount || '0.00' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">订单金额</span>
            <span class="info-value">¥ {{ order.totalPrice }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">实付金额</span>
            <span class="info-value">¥ {{ order.actualAmount || order.totalPrice }}</span>
          </div>
        </div>
      </el-card>

      <!-- 民宿信息区块 -->
      <el-card class="info-card house-info-card">
        <template #header>
          <div class="card-header">
            <span>民宿信息</span>
          </div>
        </template>
        <div class="house-info">
          <div class="house-image">
            <img :src="order.houseImage || '/src/assets/house-illustration.svg'" alt="民宿图片" />
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">民宿名称</span>
              <span class="info-value">{{ order.accommodationName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">详细地址</span>
              <span class="info-value">{{ order.houseAddress || '暂无地址信息' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">入住日期</span>
              <span class="info-value">{{ order.startDate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">退房日期</span>
              <span class="info-value">{{ order.endDate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">房费</span>
              <span class="info-value">¥ {{ order.totalPrice }}</span>
            </div>
            <div class="info-item" v-if="order.houseTags && order.houseTags.length > 0">
              <span class="info-label">特色标签</span>
              <span class="info-value">
                <el-tag v-for="(tag, index) in order.houseTags" :key="index" size="small" class="house-tag">{{ tag }}</el-tag>
              </span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 客户信息区块 -->
      <el-card class="info-card customer-info-card">
        <template #header>
          <div class="card-header">
            <span>客户信息</span>
          </div>
        </template>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">用户姓名</span>
            <span class="info-value">{{ getGuestName() }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">联系电话</span>
            <span class="info-value">{{ getGuestPhone() }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">入住人数</span>
            <span class="info-value">{{ order.guestsStaying ? order.guestsStaying.length : 0 }}人</span>
          </div>
          <div class="info-item">
            <span class="info-label">留言内容</span>
            <span class="info-value">{{ order.userMessage || '无留言' }}</span>
          </div>
        </div>
      </el-card>

      <!-- 订单记录区块 -->
      <el-card class="info-card order-log-card">
        <template #header>
          <div class="card-header">
            <span>订单记录</span>
          </div>
        </template>
        <div class="order-logs">
          <div v-if="order.logs && order.logs.length > 0">
            <div class="log-item" v-for="(log, index) in order.logs" :key="index">
              <div class="log-time">{{ log.time }}</div>
              <div class="log-content">{{ log.content }}</div>
            </div>
          </div>
          <div v-else class="empty-logs">
            <el-empty description="暂无订单记录" />
          </div>
        </div>
      </el-card>

      <!-- 底部操作按钮 -->
      <div class="action-buttons">
        <el-button @click="cancelOrder" v-if="order.status === 'unpaid'">取消订单</el-button>
        <el-button type="primary" @click="confirmPayment" v-if="order.status === 'unpaid'">确认支付</el-button>
        <el-button @click="showAddRemarkDialog">添加备注</el-button>
        <el-button type="danger" @click="showDeleteOrderDialog">删除订单</el-button>
      </div>
    </div>
    
    <!-- 添加备注对话框 -->
    <el-dialog
      v-model="remarkDialogVisible"
      title="添加备注"
      width="30%"
      :before-close="handleRemarkDialogClose"
    >
      <div class="remark-content">
        <span>备注内容</span>
        <el-input
          v-model="remarkContent"
          type="textarea"
          placeholder="请输入订单备注内容，100字以内"
          maxlength="100"
          show-word-limit
          rows="4"
        ></el-input>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleRemarkDialogClose">取 消</el-button>
          <el-button type="primary" @click="addRemark">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 删除订单对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="删除确认"
      width="30%"
      :before-close="handleDeleteDialogClose"
    >
      <div class="delete-content">
        <p>确定要将订单删除吗？</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDeleteDialogClose">取 消</el-button>
          <el-button type="danger" @click="deleteOrder">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import axios from 'axios'
import LandlordStorage from '../utils/LandlordStorage'

const route = useRoute()
const router = useRouter()
const orderId = computed(() => route.params.id)

// 加载状态
const loading = ref(true)
const loadingError = ref(false)

// 添加备注对话框相关变量
const remarkDialogVisible = ref(false)
const remarkContent = ref('')

// 删除订单对话框相关变量
const deleteDialogVisible = ref(false)

// 订单数据
const order = ref({
  id: '',
  createTime: '',
  status: '',
  paymentMethod: '',
  paymentStatus: '',
  discountAmount: '0.00',
  totalPrice: '0.00',
  actualAmount: '0.00',
  accommodationName: '',
  houseAddress: '',
  startDate: '',
  endDate: '',
  houseImage: '/src/assets/house-illustration.svg',
  houseTags: [],
  guestsStaying: [],
  userMessage: '',
  logs: []
})

// 订单状态文本
const orderStatusText = computed(() => {
  const statusMap = {
    'unpaid': '待支付',
    'ongoing': '进行中',
    'afterSale': '售后中',
    'refunded': '已退款',
    'completed': '已完成',
    'canceled': '已取消'
  }
  return statusMap[order.value.status] || '未知状态'
})

// 获取状态对应的标签类型
const getStatusType = (status) => {
  const typeMap = {
    'unpaid': 'warning',
    'confirmed': 'info',
    'ongoing': 'success',
    'afterSale': 'danger',
    'refunded': 'info',
    'completed': 'success',
    'canceled': 'info'
  }
  return typeMap[status] || 'info'
}

// 获取入住人姓名
const getGuestName = () => {
  if (order.value.guestsStaying && order.value.guestsStaying.length > 0) {
    return order.value.guestsStaying[0].name
  }
  return '未知用户'
}

// 获取入住人电话
const getGuestPhone = () => {
  if (order.value.guestsStaying && order.value.guestsStaying.length > 0) {
    return order.value.guestsStaying[0].phone
  }
  return '无'
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 从后端获取订单详情
const fetchOrderDetail = async () => {
  loading.value = true
  loadingError.value = false
  
  try {
    // 从LandlordStorage获取认证信息
    const token = LandlordStorage.getToken()
    const userInfo = LandlordStorage.getUserInfo()

    // 检查认证信息是否存在
    if (!token || !userInfo) {
      ElMessage.error('认证信息不存在，请重新登录')
      loading.value = false
      loadingError.value = true
      return
    }
    
    const username = userInfo.username

    console.log('获取订单详情，用户名:', username)
    console.log('获取订单详情，Token:', token)
    console.log('获取订单id', orderId.value)
    
    // 构建请求配置
    const config = {
      method: 'get',
      url: `/booking/bookingByOrderId?orderId=${orderId.value}`,
      headers: {
        'Authorization': token,
        'Username': username
      }
    }
    
    console.log('获取订单详情，订单ID:', orderId.value)
    
    // 发送请求获取订单详情数据
    const response = await axios(config)
    
    if (response.data) {
      // 处理后端返回的数据
      const orderData = response.data
      
      // 更新订单基本信息
      order.value = {
        id: orderData.orderId || orderData.id,
        createTime: formatDate(orderData.createdAt),
        status: orderData.status,
        paymentMethod: '在线支付', // 假设默认支付方式
        paymentStatus: orderData.status === 'unpaid' ? '待支付' : '已支付',
        discountAmount: orderData.discountAmount || '0.00',
        totalPrice: orderData.totalPrice,
        actualAmount: orderData.actualAmount || orderData.totalPrice,
        accommodationName: orderData.accommodationName,
        houseAddress: orderData.accommodationAddress || '暂无地址信息',
        startDate: orderData.startDate,
        endDate: orderData.endDate,
        houseImage: orderData.accommodationImage || '/src/assets/house-illustration.svg',
        houseTags: orderData.accommodationTags || [],
        guestsStaying: orderData.guestsStaying || [],
        userMessage: orderData.userMessage || '',
        logs: []
      }
      
      // 添加订单日志
      if (orderData.createdAt) {
        order.value.logs.push({
          time: formatDate(orderData.createdAt),
          content: `用户【${getGuestName()}】下了单`
        })
      }
      
      // 如果有订单状态变更记录，添加到日志
      if (orderData.statusChanges && Array.isArray(orderData.statusChanges)) {
        orderData.statusChanges.forEach(change => {
          order.value.logs.push({
            time: formatDate(change.changeTime),
            content: `订单状态变更为：${getStatusText(change.newStatus)}`
          })
        })
      }
      
      console.log('订单详情数据:', order.value)
    } else {
      throw new Error('获取订单详情失败：返回数据为空')
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败，请稍后重试')
    loadingError.value = true
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (e) {
    return dateString
  }
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'unpaid': '待支付',
    'ongoing': '进行中',
    'afterSale': '售后中',
    'refunded': '已退款',
    'completed': '已完成',
    'canceled': '已取消'
  }
  return statusMap[status] || status
}

// 取消订单
const cancelOrder = () => {
  ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 从LandlordStorage获取认证信息
      const token = LandlordStorage.getToken()
      const userInfo = LandlordStorage.getUserInfo()

      if (!token || !userInfo) {
        ElMessage.error('认证信息不存在，请重新登录')
        return
      }
      
      // 构建请求配置
      const config = {
        method: 'post',
        url: `/booking/cancelBooking`,
        headers: {
          'Authorization': token,
          'Username': userInfo.username
        },
        data: {
          orderId: orderId.value,
          landlordId: userInfo.id
        }
      }
      
      // 发送请求取消订单
      const response = await axios(config)
      
      if (response.data && response.data.code === 200) {
        ElMessage.success('订单已取消')
        order.value.status = 'canceled'
        // 添加日志
        order.value.logs.push({
          time: formatDate(new Date()),
          content: '管理员取消了订单'
        })
      } else {
        throw new Error(response.data?.message || '取消订单失败')
      }
    } catch (error) {
      console.error('取消订单失败:', error)
      ElMessage.error(`取消订单失败: ${error.message || '请稍后重试'}`)
    }
  }).catch(() => {
    // 取消操作
  })
}

// 确认支付
const confirmPayment = () => {
  ElMessageBox.confirm('确定要将此订单标记为已支付吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 从LandlordStorage获取认证信息
      const token = LandlordStorage.getToken()
      const userInfo = LandlordStorage.getUserInfo()

      if (!token || !userInfo) {
        ElMessage.error('认证信息不存在，请重新登录')
        return
      }
      
      // 构建请求配置
      const config = {
        method: 'post',
        url: `/api/booking/confirmPayment`,
        headers: {
          'Authorization': token,
          'Username': userInfo.username
        },
        data: {
          orderId: orderId.value,
          landlordId: userInfo.id
        }
      }
      
      // 发送请求确认支付
      const response = await axios(config)
      
      if (response.data && response.data.code === 200) {
        ElMessage.success('订单已确认支付')
        order.value.status = 'ongoing'
        order.value.paymentStatus = '已支付'
        // 添加日志
        order.value.logs.push({
          time: formatDate(new Date()),
          content: '管理员确认了订单支付'
        })
      } else {
        throw new Error(response.data?.message || '确认支付失败')
      }
    } catch (error) {
      console.error('确认支付失败:', error)
      ElMessage.error(`确认支付失败: ${error.message || '请稍后重试'}`)
    }
  }).catch(() => {
    // 取消操作
  })
}

// 显示添加备注对话框
const showAddRemarkDialog = () => {
  remarkDialogVisible.value = true
  remarkContent.value = ''
}

// 关闭添加备注对话框
const handleRemarkDialogClose = () => {
  remarkDialogVisible.value = false
  remarkContent.value = ''
}

// 添加备注
const addRemark = async () => {
  if (!remarkContent.value.trim()) {
    ElMessage.warning('备注内容不能为空')
    return
  }
  
  try {
    // 从LandlordStorage获取认证信息
    const token = LandlordStorage.getToken()
    const userInfo = LandlordStorage.getUserInfo()

    if (!token || !userInfo) {
      ElMessage.error('认证信息不存在，请重新登录')
      return
    }
    
    // 构建请求配置
    const config = {
      method: 'post',
      url: `/api/booking/addRemark`,
      headers: {
        'Authorization': token,
        'Username': userInfo.username
      },
      data: {
        orderId: orderId.value,
        landlordId: userInfo.id,
        remark: remarkContent.value
      }
    }
    
    // 发送请求添加备注
    const response = await axios(config)
    
    if (response.data && response.data.code === 200) {
      ElMessage.success('备注添加成功')
      // 添加日志
      order.value.logs.push({
        time: formatDate(new Date()),
        content: `管理员添加备注：${remarkContent.value}`
      })
      // 关闭对话框
      handleRemarkDialogClose()
    } else {
      throw new Error(response.data?.message || '添加备注失败')
    }
  } catch (error) {
    console.error('添加备注失败:', error)
    ElMessage.error(`添加备注失败: ${error.message || '请稍后重试'}`)
  }
}

// 显示删除订单对话框
const showDeleteOrderDialog = () => {
  deleteDialogVisible.value = true
}

// 关闭删除订单对话框
const handleDeleteDialogClose = () => {
  deleteDialogVisible.value = false
}

// 删除订单
const deleteOrder = async () => {
  try {
    // 从LandlordStorage获取认证信息
    const token = LandlordStorage.getToken()
    const userInfo = LandlordStorage.getUserInfo()

    if (!token || !userInfo) {
      ElMessage.error('认证信息不存在，请重新登录')
      return
    }
    
    // 构建请求配置
    const config = {
      method: 'delete',
      url: `/api/booking/deleteBooking?orderId=${orderId.value}&landlordId=${userInfo.id}`,
      headers: {
        'Authorization': token,
        'Username': userInfo.username
      }
    }
    
    // 发送请求删除订单
    const response = await axios(config)
    
    if (response.data && response.data.code === 200) {
      ElMessage.success('订单已删除')
      // 关闭对话框
      handleDeleteDialogClose()
      // 返回订单列表页
      router.push('/order')
    } else {
      throw new Error(response.data?.message || '删除订单失败')
    }
  } catch (error) {
    console.error('删除订单失败:', error)
    ElMessage.error(`删除订单失败: ${error.message || '请稍后重试'}`)
  }
}

onMounted(() => {
  console.log('订单详情页已加载，订单ID:', orderId.value)
  // 从API获取订单详情数据
  fetchOrderDetail()
})
</script>

<style scoped>
.order-detail-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #409EFF;
}

.back-button span {
  margin-left: 5px;
}

.loading-container {
  padding: 20px;
}

.error-message {
  padding: 20px;
  text-align: center;
}

.info-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: bold;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  min-width: 80px;
  color: #909399;
}

.info-value {
  font-weight: 500;
}

.house-info {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.house-image {
  width: 150px;
  height: 100px;
  overflow: hidden;
  border-radius: 4px;
}

.house-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.house-tag {
  margin-right: 5px;
}

.order-logs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.log-item {
  display: flex;
  align-items: flex-start;
  padding: 5px 0;
  border-bottom: 1px dashed #EBEEF5;
}

.log-time {
  min-width: 150px;
  color: #909399;
}

.empty-logs {
  padding: 20px 0;
  text-align: center;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .house-info {
    flex-direction: column;
  }
  
  .house-image {
    width: 100%;
    height: 150px;
  }
}
</style>