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
              <el-option v-for="(value, key) in statusTextMap" :key="key" :label="value" :value="key" />
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
                v-if="scope.row.status === 'pending-payment'"
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
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 订单状态文本映射
const statusTextMap = {
  'pending-payment': '待支付',
  'checked-in': '已入住',
  'refunding': '退款中',
  'reviewed': '已评价',
  'completed': '已完成',
  'cancelled': '已取消'
}

// 筛选条件
const filterStatus = ref('')
const dateRange = ref('')
const searchKeyword = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalOrders = ref(100) // 实际项目中这个值应该从API获取

// 模拟订单数据
const orders = ref([
  {
    id: '24109',
    createTime: '2022-08-05 12:00:00',
    username: '张三',
    phone: '13787878787',
    houseName: '海景别墅',
    checkInDate: '2023-06-01',
    checkOutDate: '2023-06-03',
    totalPrice: 2350,
    paymentMethod: '微信支付',
    status: 'pending-payment',
    statusText: '待支付'
  },
  {
    id: '12123',
    createTime: '2022-08-05 12:00:00',
    username: '李四',
    phone: '13900000000',
    houseName: '山景木屋',
    checkInDate: '2023-06-05',
    checkOutDate: '2023-06-07',
    totalPrice: 2350,
    paymentMethod: '支付宝',
    status: 'confirmed',
    statusText: '已确认'
  },
  {
    id: '11242',
    createTime: '2022-08-05 12:00:00',
    username: '王五',
    phone: '13456789898',
    houseName: '城市公寓',
    checkInDate: '2023-06-10',
    checkOutDate: '2023-06-15',
    totalPrice: 2350,
    paymentMethod: '支付宝',
    status: 'checked-in',
    statusText: '已入住'
  },
  {
    id: '24345',
    createTime: '2022-08-05 12:00:00',
    username: '赵六',
    phone: '13456789898',
    houseName: '乡村小院',
    checkInDate: '2023-06-20',
    checkOutDate: '2023-06-22',
    totalPrice: 2350,
    paymentMethod: '支付宝',
    status: 'refunding',
    statusText: '退款中'
  },
  {
    id: '24852',
    createTime: '2022-08-05 12:00:00',
    username: '钱七',
    phone: '13456789898',
    houseName: '湖畔别墅',
    checkInDate: '2023-05-25',
    checkOutDate: '2023-05-28',
    totalPrice: 2350,
    paymentMethod: '支付宝',
    status: 'completed',
    statusText: '已完成'
  },
  {
    id: '11242',
    createTime: '2022-08-05 12:00:00',
    username: '孙八',
    phone: '13456789898',
    houseName: '森林木屋',
    checkInDate: '2023-05-15',
    checkOutDate: '2023-05-18',
    totalPrice: 2350,
    paymentMethod: '支付宝',
    status: 'cancelled',
    statusText: '已取消'
  },
  {
    id: '15351',
    createTime: '2022-08-05 12:00:00',
    username: '周九',
    phone: '13456789898',
    houseName: '海景别墅',
    checkInDate: '2023-06-25',
    checkOutDate: '2023-06-28',
    totalPrice: 2350,
    paymentMethod: '支付宝',
    status: 'reviewed',
    statusText: '已评价'
  },
  {
    id: '46574',
    createTime: '2022-08-05 12:00:00',
    username: '刘十',
    phone: '13456789898',
    houseName: '乡村小院',
    checkInDate: '2023-06-20',
    checkOutDate: '2023-06-22',
    totalPrice: 2350,
    paymentMethod: '支付宝',
    status: 'refunding',
    statusText: '退款中'
  },
  {
    id: '14434',
    createTime: '2022-08-05 12:00:00',
    username: '张三',
    phone: '13456789898',
    houseName: '湖畔别墅',
    checkInDate: '2023-05-25',
    checkOutDate: '2023-05-28',
    totalPrice: 2350,
    paymentMethod: '支付宝',
    status: 'completed',
    statusText: '已完成'
  }
])

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
      order.id.toLowerCase().includes(keyword) || 
      order.username.toLowerCase().includes(keyword) ||
      order.phone.includes(keyword)
    )
  }
  
  // 实际项目中这里应该只返回当前页的数据
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return result.slice(start, end)
})

// 获取状态对应的标签类型
const getStatusType = (status) => {
  const typeMap = {
    'pending-payment': 'warning',
    'confirmed': 'info',
    'checked-in': 'success',
    'refunding': 'danger',
    'reviewed': 'info',
    'completed': 'success',
    'cancelled': 'info'
  }
  return typeMap[status] || 'info'
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
  // 实际项目中这里会调用API获取数据
  ElMessage.success('搜索成功')
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  // 实际项目中这里会调用API获取对应页码的数据
}

// 处理每页显示数量变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
  // 实际项目中这里会调用API获取数据
}

// 查看订单详情
const viewOrderDetail = (orderId) => {
  console.log('查看订单详情:', orderId)
  // 跳转到订单详情页
  router.push(`/order/detail/${orderId}`)
}

// 确认订单
const confirmOrder = (orderId) => {
  console.log('确认订单:', orderId)
  // 实际项目中这里会调用API确认订单
  ElMessage.success(`订单 ${orderId} 已确认`)
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
    if (statusTextMap[statusSegment]) {
      filterStatus.value = statusSegment
    } else if (newPath === '/order') {
      // 如果是订单主页，显示全部订单
      filterStatus.value = ''
    }
  },
  { immediate: true } // 立即执行一次
)

onMounted(() => {
  // 实际项目中这里会从API获取订单数据
  console.log('订单页面已加载')
  
  // 初始化时优先使用路由meta中的orderStatus
  if (route.meta.orderStatus) {
    filterStatus.value = route.meta.orderStatus
    return
  }
  
  // 如果meta中没有orderStatus，则从路径中提取
  const pathSegments = route.path.split('/')
  const statusSegment = pathSegments[pathSegments.length - 1]
  
  if (statusTextMap[statusSegment]) {
    filterStatus.value = statusSegment
  }
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