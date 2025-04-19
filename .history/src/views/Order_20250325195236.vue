<template>
  <div class="order-page">
    <h1>订单管理 - {{ orderStatusText }}</h1>
    <div class="order-content">
      <el-card v-if="!orderStatus">
        <template #header>
          <div class="card-header">
            <span>订单概览</span>
          </div>
        </template>
        <div class="order-stats">
          <el-row :gutter="20">
            <el-col :span="8" v-for="(stat, index) in orderStats" :key="index">
              <el-card shadow="hover" class="stat-card">
                <h3>{{ stat.title }}</h3>
                <p class="stat-number">{{ stat.count }}</p>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-card>
      
      <el-card v-else>
        <template #header>
          <div class="card-header">
            <span>{{ orderStatusText }}订单列表</span>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索订单号/用户名"
              class="search-input"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </template>
        
        <el-table :data="filteredOrders" style="width: 100%">
          <el-table-column prop="id" label="订单号" width="180" />
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="houseName" label="民宿名称" />
          <el-table-column prop="checkInDate" label="入住日期" width="120" />
          <el-table-column prop="checkOutDate" label="离店日期" width="120" />
          <el-table-column prop="totalPrice" label="总价" width="100">
            <template #default="scope">
              <span>¥{{ scope.row.totalPrice }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.statusText }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
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
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'

const route = useRoute()
const orderStatus = computed(() => route.meta.orderStatus || '')

// 订单状态文本映射
const statusTextMap = {
  'pending-payment': '待支付',
  'confirmed': '已确认',
  'checked-in': '已入住',
  'refunding': '退款中',
  'reviewed': '已评价',
  'completed': '已完成',
  'cancelled': '已取消'
}

// 当前订单状态文本
const orderStatusText = computed(() => {
  return orderStatus.value ? statusTextMap[orderStatus.value] : '全部'
})

// 订单统计数据
const orderStats = ref([
  { title: '待处理订单', count: 12 },
  { title: '本月订单总数', count: 45 },
  { title: '今日新增订单', count: 5 }
])

// 模拟订单数据
const orders = ref([
  {
    id: 'ORD20230001',
    username: '张三',
    houseName: '海景别墅',
    checkInDate: '2023-06-01',
    checkOutDate: '2023-06-03',
    totalPrice: 1200,
    status: 'pending-payment',
    statusText: '待支付'
  },
  {
    id: 'ORD20230002',
    username: '李四',
    houseName: '山景木屋',
    checkInDate: '2023-06-05',
    checkOutDate: '2023-06-07',
    totalPrice: 980,
    status: 'confirmed',
    statusText: '已确认'
  },
  {
    id: 'ORD20230003',
    username: '王五',
    houseName: '城市公寓',
    checkInDate: '2023-06-10',
    checkOutDate: '2023-06-15',
    totalPrice: 1500,
    status: 'checked-in',
    statusText: '已入住'
  },
  {
    id: 'ORD20230004',
    username: '赵六',
    houseName: '乡村小院',
    checkInDate: '2023-06-20',
    checkOutDate: '2023-06-22',
    totalPrice: 760,
    status: 'refunding',
    statusText: '退款中'
  },
  {
    id: 'ORD20230005',
    username: '钱七',
    houseName: '湖畔别墅',
    checkInDate: '2023-05-25',
    checkOutDate: '2023-05-28',
    totalPrice: 2100,
    status: 'completed',
    statusText: '已完成'
  },
  {
    id: 'ORD20230006',
    username: '孙八',
    houseName: '森林木屋',
    checkInDate: '2023-05-15',
    checkOutDate: '2023-05-18',
    totalPrice: 1350,
    status: 'cancelled',
    statusText: '已取消'
  },
  {
    id: 'ORD20230007',
    username: '周九',
    houseName: '海景别墅',
    checkInDate: '2023-06-25',
    checkOutDate: '2023-06-28',
    totalPrice: 1200,
    status: 'reviewed',
    statusText: '已评价'
  }
])

// 搜索关键词
const searchKeyword = ref('')

// 根据当前路由状态和搜索关键词过滤订单
const filteredOrders = computed(() => {
  let result = orders.value
  
  // 按状态过滤
  if (orderStatus.value) {
    result = result.filter(order => order.status === orderStatus.value)
  }
  
  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(order => 
      order.id.toLowerCase().includes(keyword) || 
      order.username.toLowerCase().includes(keyword)
    )
  }
  
  return result
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

// 查看订单详情
const viewOrderDetail = (orderId) => {
  console.log('查看订单详情:', orderId)
  // 实际项目中这里会跳转到订单详情页或打开详情弹窗
}

// 确认订单
const confirmOrder = (orderId) => {
  console.log('确认订单:', orderId)
  // 实际项目中这里会调用API确认订单
}

onMounted(() => {
  // 实际项目中这里会从API获取订单数据
  console.log('订单页面已加载，当前状态:', orderStatus.value)
})
</script>

<style scoped>
.order-page {
  padding: 20px;
}

.order-content {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  width: 250px;
}

.order-stats {
  margin-top: 20px;
}

.stat-card {
  text-align: center;
  margin-bottom: 20px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}
</style>