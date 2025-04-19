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
        <el-table :data="filteredOrders" style="width: 100%" border stripe>
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
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="viewOrderDetail(scope.row.id)">查看</el-button>
              <el-button 
                size="small" 
                type="primary" 
                v-if="scope.row.status === 'unpaid'"
                @click="confirmOrder(scope.row.id)"
              >确认</el-button>
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElLoading } from 'element-plus'
import axios from 'axios'
import LandlordStorage from '../utils/LandlordStorage'

const route = useRoute()
const router = useRouter()

// 状态映射
const statusMap = {
  unpaid: '待支付',
  ongoing: '进行中',
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

// 从后端获取订单数据
const fetchOrders = async () => {
  loading.value = true
  loadingError.value = false
  
  try {
    // 从LandlordStorage获取认证信息
    const token = LandlordStorage.getToken()
    const userInfo = LandlordStorage.getUserInfo()
    
    if (!token || !userInfo) {
      ElMessage.error('认证信息不存在，请重新登录')
      loading.value = false
      return
    }
    
    const landlordId = userInfo.id
    const username = userInfo.username
    
    // 构建请求配置
    const config = {
      method: 'get',
      url: `http://localhost:8080/booking/bookingsByLandlordId?landlordId=${landlordId}`,
      headers: {
        'Authorization': token,
        'Username': username
      }
    }
    
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

// 根据筛选条件过滤订单
const filteredOrders = computed(() => {
  let result = orders.value
  
  // 按状态过滤
  if (filterStatus.value) {
    result = result.filter(order => order.status === filterStatus.value)
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
  // 跳转到订单详情页
  router.push(`/order/detail/${orderId}`)
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

// 监听路由变化，更新筛选条件
watch(
  () => [route.path, route.meta.orderStatus],
  ([newPath, newOrderStatus]) => {
    // 优先使用路由meta中的orderStatus
    if (newOrderStatus) {
      filterStatus.value = newOrderStatus
      return
    }
    
    // 如果meta中没有orderStatus，则从路径中提取
    const pathSegments = newPath.split('/')
    const statusSegment = pathSegments[pathSegments.length - 1]
    
    // 检查是否是有效的订单状态
    if (statusMap[statusSegment]) {
      filterStatus.value = statusSegment
    } else if (newPath === '/order') {
      // 如果是订单主页，显示全部订单
      filterStatus.value = ''
    }
  },
  { immediate: true } // 立即执行一次
)

onMounted(() => {
  console.log('订单页面已加载')
  
  // 初始化时优先使用路由meta中的orderStatus
  if (route.meta.orderStatus) {
    filterStatus.value = route.meta.orderStatus
  } else {
    // 如果meta中没有orderStatus，则从路径中提取
    const pathSegments = route.path.split('/')
    const statusSegment = pathSegments[pathSegments.length - 1]
    
    if (statusMap[statusSegment]) {
      filterStatus.value = statusSegment
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
}
</style>