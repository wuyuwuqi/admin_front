<template>
  <div class="order-page">
    <h1>订单管理</h1>
    <div class="order-content">
      <!-- 顶部筛选区域 -->
      <el-card class="filter-card">
        <div class="filter-row">
          <div class="filter-item">
            <span class="filter-label">订单状态</span>
            <el-select v-model="filterStatus" placeholder="全部" clearable style="min-width: 120px;">
              <el-option v-for="(value, key) in statusMap" :key="key" :label="value" :value="key" />
              <el-option label="全部" value="" />
            </el-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">日期范围</span>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </div>
          <div class="filter-item search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索订单号/用户名/手机号"
              class="search-input"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </div>
        </div>
      </el-card>
      
      <!-- 订单列表 -->
      <el-card class="order-list-card">
        <div v-if="loadingError" class="error-message">
          <el-alert
            title="获取订单数据失败"
            type="error"
            description="请检查网络连接或稍后重试"
            show-icon
            :closable="false"
          />
          <el-button type="primary" @click="fetchOrders" style="margin-top: 15px;">重新加载</el-button>
        </div>
        <el-table 
          v-loading="loading" 
          element-loading-text="加载订单数据中..."
          :data="filteredOrders" 
          style="width: 100%" 
          border 
          stripe>
          <el-table-column prop="id" label="订单号" width="120" />
          <el-table-column prop="createTime" label="下单时间" width="150" />
          <el-table-column prop="username" label="用户" width="100" />
          <el-table-column prop="phone" label="手机号码" width="120" />
          <el-table-column prop="houseName" label="民宿名称" min-width="150" />
          <el-table-column prop="totalPrice" label="价格" width="100">
            <template #default="scope">
              <span>¥{{ scope.row.totalPrice }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="paymentMethod" label="支付方式" width="100" />
          <el-table-column prop="status" label="订单状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.statusText }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="130" fixed="right">
            <template #default="scope">
              <div class="operation-buttons">
                <el-button 
                  size="small" 
                  type="info" 
                  plain
                  @click="viewOrderDetail(scope.row.id)"
                >
                  <el-icon><View /></el-icon>
                  查看
                </el-button>
                <el-button 
                  size="small" 
                  type="primary" 
                  v-if="scope.row.status === 'unpaid'"
                  @click="confirmOrder(scope.row.id)"
                >
                  <el-icon><Check /></el-icon>
                  确认
                </el-button>
                <el-button 
                  size="small" 
                  type="primary" 
                  v-if="scope.row.status === 'ongoing'"
                  @click="markCheckedIn(scope.row.id)"
                >
                  <el-icon><HomeFilled /></el-icon>
                  标记入住
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  v-if="scope.row.status === 'afterSale'"
                  @click="confirmRefund(scope.row.id)"
                >
                  <el-icon><Money /></el-icon>
                  确认退款
                </el-button>
                <el-button 
                  size="small" 
                  type="primary" 
                  v-if="scope.row.status === 'afterSale'"
                  @click="markCheckedInFromAfterSale(scope.row.id)"
                >
                  <el-icon><HomeFilled /></el-icon>
                  标记入住
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalOrders"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
      
      <!-- 订单详情对话框 -->
      <el-dialog
        v-model="orderDetailVisible"
        title="订单详情"
        width="70%"
        :before-close="handleOrderDetailClose"
      >
        <!-- 加载中状态 -->
        <div v-if="detailLoading" class="loading-container">
          <el-skeleton style="width: 100%" :rows="10" animated />
        </div>

        <!-- 加载错误状态 -->
        <div v-else-if="detailLoadingError" class="error-message">
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
                <span class="info-value">{{ orderDetail.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">下单时间</span>
                <span class="info-value">{{ orderDetail.createTime }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">付款方式</span>
                <span class="info-value">{{ orderDetail.paymentMethod || '在线支付' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">付款状态</span>
                <span class="info-value">{{ orderDetail.paymentStatus }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">优惠金额</span>
                <span class="info-value">¥ {{ orderDetail.discountAmount || '0.00' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">订单金额</span>
                <span class="info-value">¥ {{ orderDetail.totalPrice }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">实付金额</span>
                <span class="info-value">¥ {{ orderDetail.actualAmount || orderDetail.totalPrice }}</span>
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
                <img :src="orderDetail.houseImage || '/src/assets/house-illustration.svg'" alt="民宿图片" />
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">民宿名称</span>
                  <span class="info-value">{{ orderDetail.accommodationName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">详细地址</span>
                  <span class="info-value">{{ orderDetail.accommodationAddress || orderDetail.houseAddress || '暂无地址信息' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">入住日期</span>
                  <span class="info-value">{{ orderDetail.startDate }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">退房日期</span>
                  <span class="info-value">{{ orderDetail.endDate }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">入住天数</span>
                  <span class="info-value">{{ orderDetail.checkDays || '1' }}天</span>
                </div>
                <div class="info-item">
                  <span class="info-label">房费</span>
                  <span class="info-value">¥ {{ orderDetail.totalPrice }}</span>
                </div>
                <div class="info-item" v-if="orderDetail.houseTags && orderDetail.houseTags.length > 0">
                  <span class="info-label">特色标签</span>
                  <span class="info-value">
                    <el-tag v-for="(tag, index) in orderDetail.houseTags" :key="index" size="small" class="house-tag">{{ tag }}</el-tag>
                  </span>
                </div>
              </div>
            </div>
          </el-card>
          
          <!-- 房间信息区块 -->
          <el-card class="info-card room-info-card" v-if="orderDetail.checkInfo">
            <template #header>
              <div class="card-header">
                <span>房间信息</span>
              </div>
            </template>
            <div class="info-grid">
              <div class="info-item" v-if="orderDetail.checkInfo.checkNumber">
                <span class="info-label">房间数量</span>
                <span class="info-value">{{ orderDetail.checkInfo.checkNumber }}</span>
              </div>
              <div class="info-item" v-if="orderDetail.checkInfo.checkType">
                <span class="info-label">房间类型</span>
                <span class="info-value">{{ orderDetail.checkInfo.checkType }}</span>
              </div>
              <div class="info-item" v-if="orderDetail.checkInfo.checkFeatures">
                <span class="info-label">房间特点</span>
                <span class="info-value">{{ orderDetail.checkInfo.checkFeatures }}</span>
              </div>
              <div class="info-item" v-if="orderDetail.checkInfo.checkFloor">
                <span class="info-label">所在楼层</span>
                <span class="info-value">{{ orderDetail.checkInfo.checkFloor }}</span>
              </div>
              <div class="info-item" v-if="orderDetail.checkInfo.checkArea">
                <span class="info-label">房间面积</span>
                <span class="info-value">{{ orderDetail.checkInfo.checkArea }}</span>
              </div>
              <div class="info-item" v-if="orderDetail.checkInfo.checkRequirements">
                <span class="info-label">特殊要求</span>
                <span class="info-value">{{ orderDetail.checkInfo.checkRequirements }}</span>
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
                <span class="info-value">{{ orderDetail.guestsStaying ? orderDetail.guestsStaying.length : 0 }}人</span>
              </div>
              <div class="info-item">
                <span class="info-label">留言内容</span>
                <span class="info-value">{{ orderDetail.userMessage || '无留言' }}</span>
              </div>
            </div>
          </el-card>
        </div>
        
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="handleOrderDetailClose">关闭</el-button>
            <el-button 
              type="primary" 
              v-if="orderDetail.status === 'unpaid'"
              @click="confirmOrder(orderDetail.id)"
            >确认支付</el-button>
            <el-button 
              type="primary" 
              v-if="orderDetail.status === 'ongoing'"
              @click="markCheckedIn(orderDetail.id)"
            >标记入住</el-button>
            <el-button 
              type="danger" 
              v-if="orderDetail.status === 'afterSale'"
              @click="confirmRefund(orderDetail.id)"
            >确认退款</el-button>
            <el-button 
              type="primary" 
              v-if="orderDetail.status === 'afterSale'"
              @click="markCheckedInFromAfterSale(orderDetail.id)"
            >标记入住</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, ArrowLeft, View, Check, HomeFilled, Money } from '@element-plus/icons-vue'
import { ElMessage, ElLoading } from 'element-plus'
import axios from 'axios'
import LandlordStorage from '../utils/LandlordStorage'

const route = useRoute()
const router = useRouter()

// 状态映射
const statusMap = {
  unpaid: '待支付',
  ongoing: '进行中',
  checkedIn: '入住中',
  afterSale: '售后中',
  completed: '已完成',
  canceled: '已取消',
  refunded: '已退款'
}

// 筛选条件
const filterStatus = ref('')
const dateRange = ref('')
const searchKeyword = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalOrders = ref(0) // 从API获取的总订单数

// 加载状态
const loading = ref(false)
const loadingError = ref(false)

// 订单数据
const orders = ref([])

// 订单详情相关
const orderDetailVisible = ref(false)
const currentOrderId = ref('')
const detailLoading = ref(false)
const detailLoadingError = ref(false)
const orderDetail = ref({})

// 从后端获取订单数据
const fetchOrders = async () => {
  loading.value = true
  loadingError.value = false
  
  try {
    // 从LandlordStorage获取认证信息
    const token = LandlordStorage.getToken()
    const userInfo = LandlordStorage.getUserInfo()

    // 检查认证信息是否存在
    console.log('token:', token) // 打印token，检查是否有值
    console.log('userInfo:', userInfo) // 打印userInfo，检查是否有值
    console.log('userInfo.id:', userInfo.id) // 打印userInfo.id，检查是否有值
    
    if (!token || !userInfo) {
      ElMessage.error('认证信息不存在，请重新登录')
      loading.value = false
      return
    }
    
    const landlordId = userInfo.id
    const username = userInfo.username
    
    // 构建请求配置
    let url = `/api/booking/bookingsByLandlordId?landlordId=${landlordId}`
    
    // 如果有状态筛选，添加状态参数
    if (filterStatus.value) {
      // 将路由中的状态名称转换为API需要的状态值
      const apiStatus = convertRouteStatusToApiStatus(filterStatus.value)
      if (apiStatus) {
        url += `&status=${apiStatus}`
      }
    }
    
    const config = {
      method: 'get',
      url: url,
      headers: {
        'Authorization': token,
        'Username': username
      }
    }
    
    console.log('获取订单数据，状态筛选:', filterStatus.value)
    console.log('API状态值:', convertRouteStatusToApiStatus(filterStatus.value))
    console.log('请求URL:', url)
    
    // 发送请求获取订单数据
    const response = await axios(config)
    
    if (response.data) {
      // 处理后端返回的数据，转换为前端需要的格式
      orders.value = response.data.map(item => {
        // 根据状态获取对应的中文文本
        const statusText = statusMap[item.status] || item.status
        
        return {
          id: item.orderId || item.id,
          createTime: formatDate(item.createdAt),
          username: item.guestsStaying && item.guestsStaying.length > 0 ? item.guestsStaying[0].name : '未知用户',
          phone: item.guestsStaying && item.guestsStaying.length > 0 ? item.guestsStaying[0].phone : '无',
          houseName: item.accommodationName,
          checkInDate: item.startDate,
          checkOutDate: item.endDate,
          totalPrice: item.totalPrice,
          paymentMethod: '在线支付', // 假设默认支付方式
          status: item.status,
          statusText: statusText
        }
      })
      
      // 更新总订单数
      totalOrders.value = orders.value.length
    } else {
      orders.value = []
      totalOrders.value = 0
    }
  } catch (error) {
    console.error('获取订单数据失败:', error)
    ElMessage.error('获取订单数据失败，请稍后重试')
    loadingError.value = true
    orders.value = []
    totalOrders.value = 0
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  try {
    // 处理类似 2025-03-20T22:07:53.000+00:00 格式的时间字符串
    // 首先分割日期和时间部分
    const parts = dateString.split('T')
    const datePart = parts[0] // 2025-03-20
    
    // 处理时间部分，去除毫秒和时区信息
    let timePart = ''
    if (parts.length > 1) {
      // 提取时间部分，去除毫秒和时区信息
      // 处理可能的几种情况：包含毫秒和时区、只有毫秒、只有时区或纯时间
      const timeStr = parts[1]
      if (timeStr.includes('.')) {
        // 有毫秒部分，先分割掉
        timePart = timeStr.split('.')[0]
      } else if (timeStr.includes('+')) {
        // 没有毫秒但有时区，分割掉时区
        timePart = timeStr.split('+')[0]
      } else if (timeStr.includes('Z')) {
        // UTC时间格式，去掉Z
        timePart = timeStr.replace('Z', '')
      } else {
        // 纯时间格式
        timePart = timeStr
      }
    }
    
    // 如果有日期和时间，返回完整格式
    if (datePart && timePart) {
      return `${datePart} ${timePart}`
    } else if (datePart) {
      return datePart
    } else {
      return dateString
    }
  } catch (e) {
    console.error('日期格式化错误:', e)
    return dateString
  }
}

// 根据筛选条件过滤订单
const filteredOrders = computed(() => {
  let result = orders.value
  
  // 按状态过滤
  if (filterStatus.value) {
    const apiStatus = convertRouteStatusToApiStatus(filterStatus.value)
    result = result.filter(order => order.status === apiStatus)
  }
  
  // 按日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const startDate = new Date(dateRange.value[0])
    const endDate = new Date(dateRange.value[1])
    endDate.setHours(23, 59, 59, 999) // 设置为当天结束时间
    
    result = result.filter(order => {
      const orderDate = new Date(order.createTime)
      return orderDate >= startDate && orderDate <= endDate
    })
  }
  
  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(order => 
      (order.id && order.id.toLowerCase().includes(keyword)) || 
      (order.username && order.username.toLowerCase().includes(keyword)) ||
      (order.phone && order.phone.includes(keyword))
    )
  }
  
  // 更新总订单数（过滤后）
  totalOrders.value = result.length
  
  // 分页处理
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return result.slice(start, end)
})

// 获取状态对应的标签类型
const getStatusType = (status) => {
  const typeMap = {
    'unpaid': 'warning',
    'confirmed': 'info',
    'ongoing': 'success',
    'checkedIn': 'primary',
    'afterSale': 'danger',
    'refunded': 'info',
    'completed': 'success',
    'canceled': 'info'
  }
  return typeMap[status] || 'info'
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
  // 本地筛选，无需重新请求API
  ElMessage.success('搜索成功')
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  // 使用本地分页，无需重新请求API
}

// 处理每页显示数量变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
  // 使用本地分页，无需重新请求API
}

// 查看订单详情
const viewOrderDetail = (orderId) => {
  console.log('查看订单详情:', orderId)
  if (orderId) {
    currentOrderId.value = orderId
    fetchOrderDetail()
    orderDetailVisible.value = true
  } else {
    console.error('订单ID不存在')
    ElMessage.error('订单ID不存在，无法查看详情')
  }
}

// 关闭订单详情对话框
const handleOrderDetailClose = () => {
  orderDetailVisible.value = false
}

// 从后端获取订单详情
const fetchOrderDetail = async () => {
  if (!currentOrderId.value) {
    ElMessage.error('订单ID不存在，无法获取详情')
    return
  }
  
  detailLoading.value = true
  detailLoadingError.value = false
  
  try {
    // 从LandlordStorage获取认证信息
    const token = LandlordStorage.getToken()
    const userInfo = LandlordStorage.getUserInfo()
    
    if (!token || !userInfo) {
      ElMessage.error('认证信息不存在，请重新登录')
      detailLoading.value = false
      return
    }
    
    // 构建请求配置
    const config = {
      method: 'get',
      url: `/api/booking/bookingByOrderId?orderId=${currentOrderId.value}`,
      headers: {
        'Authorization': token,
        'Username': userInfo.username
      }
    }
    
    // 发送请求获取订单详情数据
    const response = await axios(config)
    
    if (response.data) {
      // 处理后端返回的数据，转换为前端需要的格式
      orderDetail.value = {
        id: response.data.orderId || response.data.id,
        createTime: formatDate(response.data.createdAt),
        status: response.data.status,
        paymentMethod: '在线支付', // 假设默认支付方式
        paymentStatus: response.data.status === 'unpaid' ? '待支付' : '已支付',
        discountAmount: response.data.discountAmount || '0.00',
        totalPrice: response.data.totalPrice,
        actualAmount: response.data.actualAmount || response.data.totalPrice,
        accommodationName: response.data.accommodationName,
        houseAddress: response.data.accommodationAddress || '暂无地址信息',
        startDate: response.data.startDate,
        endDate: response.data.endDate,
        houseImage: response.data.accommodationImage || '/src/assets/house-illustration.svg',
        houseTags: response.data.accommodationTags || [],
        guestsStaying: response.data.guestsStaying || [],
        userMessage: response.data.userMessage || '',
        checkInfo: response.data.checkInfo || null,
        accommodationAddress: response.data.accommodationAddress,
        checkDays: response.data.checkDays || '1'
      }
      
      console.log('订单详情获取成功:', orderDetail.value)
    } else {
      throw new Error('获取订单详情失败：返回数据为空')
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败，请稍后重试')
    detailLoadingError.value = true
  } finally {
    detailLoading.value = false
  }
}

// 获取入住人姓名
const getGuestName = () => {
  if (orderDetail.value.guestsStaying && orderDetail.value.guestsStaying.length > 0) {
    return orderDetail.value.guestsStaying[0].name
  }
  return '未知用户'
}

// 获取入住人电话
const getGuestPhone = () => {
  if (orderDetail.value.guestsStaying && orderDetail.value.guestsStaying.length > 0) {
    return orderDetail.value.guestsStaying[0].phone
  }
  return '无'
}

// 确认订单
const confirmOrder = async (orderId) => {
  console.log('确认订单:', orderId)
  
  try {
    // 这里应该调用API确认订单
    // 实际项目中应该有一个确认订单的API
    // 这里仅做模拟
    ElMessage.success(`订单 ${orderId} 已确认支付并入住`)
    
    // 确认成功后重新获取订单列表
    await fetchOrders()
  } catch (error) {
    console.error('确认订单失败:', error)
    ElMessage.error('确认订单失败，请稍后重试')
  }
}

// 标记订单为入住中
const markCheckedIn = async (orderId) => {
  console.log('标记订单为入住中:', orderId)
  
  try {
    // 从LandlordStorage获取认证信息
    const token = LandlordStorage.getToken()
    const userInfo = LandlordStorage.getUserInfo()
    
    if (!token || !userInfo) {
      ElMessage.error('认证信息不存在，请重新登录')
      return
    }
    
    // 构建请求数据
    const data = JSON.stringify({
      "orderId": orderId,
      "oldStatus": "ongoing",
      "newStatus": "checkedIn"
    });
    
    // 构建请求配置
    const config = {
      method: 'post',
      url: '/api/booking/updateBookingStatus',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'Username': userInfo.username
      },
      data: data
    };
    
    // 发送请求更新订单状态
    const response = await axios(config);
    
    if (response.status === 200) {
      ElMessage.success(`订单 ${orderId} 已标记为入住中`);
      
      // 更新成功后重新获取订单列表
      await fetchOrders();
      
      // 如果当前有打开的订单详情，也需要刷新
      if (orderDetailVisible.value && currentOrderId.value === orderId) {
        fetchOrderDetail();
      }
    } else {
      throw new Error(`更新订单状态失败: ${response.data}`);
    }
  } catch (error) {
    console.error('标记入住中失败:', error)
    ElMessage.error('标记入住中失败，请稍后重试')
  }
}

// 确认退款
const confirmRefund = async (orderId) => {
  console.log('确认退款:', orderId)
  
  try {
    // 从LandlordStorage获取认证信息
    const token = LandlordStorage.getToken()
    const userInfo = LandlordStorage.getUserInfo()
    
    if (!token || !userInfo) {
      ElMessage.error('认证信息不存在，请重新登录')
      return
    }
    
    // 构建请求数据
    const data = JSON.stringify({
      "orderId": orderId,
      "oldStatus": "afterSale",
      "newStatus": "refunded"
    });
    
    // 构建请求配置
    const config = {
      method: 'post',
      url: '/api/booking/updateBookingStatus',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'Username': userInfo.username
      },
      data: data
    };
    
    // 发送请求更新订单状态
    const response = await axios(config);
    
    if (response.status === 200) {
      ElMessage.success(`订单 ${orderId} 已确认退款`);
      
      // 更新成功后重新获取订单列表
      await fetchOrders();
      
      // 如果当前有打开的订单详情，也需要刷新
      if (orderDetailVisible.value && currentOrderId.value === orderId) {
        fetchOrderDetail();
      }
    } else {
      throw new Error(`更新订单状态失败: ${response.data}`);
    }
  } catch (error) {
    console.error('确认退款失败:', error)
    ElMessage.error('确认退款失败，请稍后重试')
  }
}

// 从售后中状态标记为入住中
const markCheckedInFromAfterSale = async (orderId) => {
  console.log('从售后中标记为入住中:', orderId)
  
  try {
    // 从LandlordStorage获取认证信息
    const token = LandlordStorage.getToken()
    const userInfo = LandlordStorage.getUserInfo()
    
    if (!token || !userInfo) {
      ElMessage.error('认证信息不存在，请重新登录')
      return
    }
    
    // 构建请求数据
    const data = JSON.stringify({
      "orderId": orderId,
      "oldStatus": "afterSale",
      "newStatus": "checkedIn"
    });
    
    // 构建请求配置
    const config = {
      method: 'post',
      url: '/api/booking/updateBookingStatus',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'Username': userInfo.username
      },
      data: data
    };
    
    // 发送请求更新订单状态
    const response = await axios(config);
    
    if (response.status === 200) {
      ElMessage.success(`订单 ${orderId} 已从售后中状态标记为入住中`);
      
      // 更新成功后重新获取订单列表
      await fetchOrders();
      
      // 如果当前有打开的订单详情，也需要刷新
      if (orderDetailVisible.value && currentOrderId.value === orderId) {
        fetchOrderDetail();
      }
    } else {
      throw new Error(`更新订单状态失败: ${response.data}`);
    }
  } catch (error) {
    console.error('标记入住中失败:', error)
    ElMessage.error('标记入住中失败，请稍后重试')
  }
}

// 将路由状态转换为API状态
const convertRouteStatusToApiStatus = (routeStatus) => {
  // 路由状态和API状态的映射关系
  const statusMapping = {
    'pending-payment': 'unpaid',
    'in-progress': 'ongoing',
    'checked-in': 'checkedIn',
    'after-sale': 'afterSale',
    'completed': 'completed',
    'cancelled': 'canceled',
    'refunded': 'refunded'
  }
  
  return statusMapping[routeStatus] || routeStatus
}

// 监听路由变化，更新筛选条件
watch(
  () => [route.path, route.meta.orderStatus],
  ([newPath, newOrderStatus]) => {
    // 优先使用路由meta中的orderStatus
    if (newOrderStatus) {
      filterStatus.value = newOrderStatus
    } else {
      // 如果meta中没有orderStatus，则从路径中提取
      const pathSegments = newPath.split('/')
      const statusSegment = pathSegments[pathSegments.length - 1]
      
      console.log('路径提取的状态段:', statusSegment)
      const apiStatus = convertRouteStatusToApiStatus(statusSegment)
      console.log('转换后的API状态:', apiStatus)
      
      // 检查是否是有效的订单状态
      if (statusMap[apiStatus]) {
        filterStatus.value = statusSegment
        console.log('设置过滤状态为:', filterStatus.value)
      } else if (newPath === '/order') {
        // 如果是订单主页，显示全部订单
        filterStatus.value = ''
      }
    }
    
    // 路由变化时重新获取订单数据
    fetchOrders()
  },
  { immediate: true } // 立即执行一次
)

onMounted(() => {
  console.log('订单页面已加载')
  
  // 初始化时优先使用路由meta中的orderStatus
  if (route.meta.orderStatus) {
    filterStatus.value = route.meta.orderStatus
    console.log('从路由meta获取状态:', filterStatus.value)
  } else {
    // 如果meta中没有orderStatus，则从路径中提取
    const pathSegments = route.path.split('/')
    const statusSegment = pathSegments[pathSegments.length - 1]
    
    const apiStatus = convertRouteStatusToApiStatus(statusSegment)
    if (statusMap[apiStatus]) {
      filterStatus.value = statusSegment
      console.log('从路径提取状态:', filterStatus.value, '对应API状态:', apiStatus)
    }
  }
  
  // 从API获取订单数据
  fetchOrders()
})
</script>

<style scoped>
.order-page {
  padding: 20px;
}

.order-content {
  margin-top: 20px;
}

/* 筛选区域样式 */
.filter-card {
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
}

.filter-label {
  margin-right: 10px;
  white-space: nowrap;
}

.search-box {
  flex-grow: 1;
  display: flex;
  gap: 10px;
}

.search-input {
  flex-grow: 1;
}

/* 订单列表样式 */
.order-list-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 分页样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 错误信息样式 */
.error-message {
  padding: 20px;
  text-align: center;
}

/* 订单详情对话框样式 */
.info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 5px;
}

.info-value {
  font-size: 14px;
  word-break: break-all;
}

.house-info {
  display: flex;
  gap: 60px; /* 将间距从40px增加到60px */
  margin-bottom: 15px;
}

.house-image {
  flex-shrink: 0;
  width: 200px;
  height: 150px;
  overflow: hidden;
  border-radius: 4px;
  margin-right: 20px; /* 增加右侧边距从10px到20px */
}

.house-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.house-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.loading-container {
  padding: 20px;
}

.error-message {
  padding: 20px;
  text-align: center;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .filter-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-item {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .search-box {
    width: 100%;
  }
  
  .house-info {
    flex-direction: column;
  }
  
  .house-image {
    width: 100%;
    height: 200px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}

/* 操作按钮样式 */
.operation-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.operation-buttons .el-button {
  margin-left: 0;
  width: 100%;
}
</style>