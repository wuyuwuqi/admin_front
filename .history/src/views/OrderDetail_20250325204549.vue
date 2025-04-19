<template>
  <div class="order-detail-page">
    <!-- 顶部导航栏 -->
    <div class="page-header">
      <div class="back-button" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <div class="order-status">{{ orderStatusText }}</div>
    </div>

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
          <span class="info-value">{{ order.paymentMethod }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">付款状态</span>
          <span class="info-value">{{ order.paymentStatus }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">优惠金额</span>
          <span class="info-value">¥ {{ order.discountAmount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">订单金额</span>
          <span class="info-value">¥ {{ order.totalAmount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">实付金额</span>
          <span class="info-value">¥ {{ order.actualAmount }}</span>
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
          <img :src="order.houseImage" alt="民宿图片" />
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">民宿名称</span>
            <span class="info-value">{{ order.houseName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">详细地址</span>
            <span class="info-value">{{ order.houseAddress }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">出租类型</span>
            <span class="info-value">{{ order.houseType }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">押金</span>
            <span class="info-value">¥ {{ order.deposit }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">房费</span>
            <span class="info-value">¥ {{ order.roomPrice }}</span>
          </div>
          <div class="info-item">
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
          <span class="info-value">{{ order.username }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">联系地址</span>
          <span class="info-value">{{ order.userAddress }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">下单方式</span>
          <span class="info-value">{{ order.orderMethod }}</span>
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
        <div class="log-item" v-for="(log, index) in order.logs" :key="index">
          <div class="log-time">{{ log.time }}</div>
          <div class="log-content">{{ log.content }}</div>
        </div>
      </div>
    </el-card>

    <!-- 底部操作按钮 -->
    <div class="action-buttons">
      <el-button @click="cancelOrder" v-if="order.status === 'pending-payment'">取消订单</el-button>
      <el-button type="primary" @click="confirmPayment" v-if="order.status === 'pending-payment'">确认支付</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const orderId = computed(() => route.params.id)

// 模拟订单数据
const order = ref({
  id: '20220507120000000000',
  createTime: '2022-05-07 12:00:00',
  status: 'pending-payment',
  paymentMethod: '微信',
  paymentStatus: '待支付',
  discountAmount: '100.00',
  totalAmount: '2350.00',
  actualAmount: '2250.00',
  houseName: '伊甸之星',
  houseAddress: '广东省深圳市南山区桃源路129号',
  houseType: '日租',
  deposit: '500',
  roomPrice: '500',
  houseImage: '/src/assets/house-illustration.svg',
  houseTags: ['风景优美', '周边设施', '靠近干道'],
  username: '张三',
  userAddress: '云南省西双版纳傣族自治州勐XX镇',
  orderMethod: '共享民宿APP下单',
  userMessage: '收拾干净，谢谢！',
  logs: [
    {
      time: '2022-05-07 12:00:00',
      content: '用户【张三】在共享民宿APP下了单'
    }
  ]
})

// 订单状态文本
const orderStatusText = computed(() => {
  const statusMap = {
    'pending-payment': '待支付',
    'confirmed': '已确认',
    'checked-in': '已入住',
    'refunding': '退款中',
    'reviewed': '已评价',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[order.value.status] || '未知状态'
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 取消订单
const cancelOrder = () => {
  ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实际项目中这里会调用API取消订单
    ElMessage.success('订单已取消')
    order.value.status = 'cancelled'
    // 添加日志
    order.value.logs.push({
      time: new Date().toLocaleString(),
      content: '管理员取消了订单'
    })
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
  }).then(() => {
    // 实际项目中这里会调用API确认支付
    ElMessage.success('订单已确认支付')
    order.value.status = 'confirmed'
    order.value.paymentStatus = '已支付'
    // 添加日志
    order.value.logs.push({
      time: new Date().toLocaleString(),
      content: '管理员确认了订单支付'
    })
  }).catch(() => {
    // 取消操作
  })
}

onMounted(async () => {
  // 实际项目中这里会根据orderId从API获取订单详情
  console.log('订单详情页已加载，订单ID:', orderId.value)
  
  // 这里模拟从API获取订单详情数据
  // 在实际项目中，这里应该调用真实的API
  // 例如: const response = await axios.get(`/api/orders/${orderId.value}`)
  //       order.value = response.data
  
  // 为了演示，我们从模拟数据中查找对应ID的订单
   if (orderId.value) {
    // 导入模拟订单数据
    import('../views/Order.vue').then(module => {
      // 获取Order.vue中的模拟订单数据
      const ordersData = module.default.setup ? undefined : module.orders.value
      
      if (ordersData) {
        // 查找对应ID的订单
        const foundOrder = ordersData.find(o => o.id === orderId.value)
        
        if (foundOrder) {
          // 更新订单基本信息
          order.value.id = foundOrder.id
          order.value.createTime = foundOrder.createTime
          order.value.status = foundOrder.status
          order.value.paymentMethod = foundOrder.paymentMethod || '微信'
          order.value.paymentStatus = foundOrder.status === 'pending-payment' ? '待支付' : '已支付'
          order.value.totalAmount = foundOrder.totalPrice.toString()
          order.value.actualAmount = foundOrder.totalPrice.toString()
          
          // 更新民宿信息
          order.value.houseName = foundOrder.houseName
          
          // 更新用户信息
          order.value.username = foundOrder.username
          
          // 添加日志
          if (order.value.logs.length === 0) {
            order.value.logs.push({
              time: foundOrder.createTime,
              content: `用户【${foundOrder.username}】下了单`
            })
          }
        } else {
          console.error('未找到对应ID的订单:', orderId.value)
        }
      } else {
        console.error('无法获取模拟订单数据')
      }
    }).catch(err => {
      console.error('导入Order.vue模块失败:', err)
    })
  }
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

.order-status {
  font-size: 18px;
  font-weight: bold;
  color: #E6A23C; /* 待支付状态颜色 */
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