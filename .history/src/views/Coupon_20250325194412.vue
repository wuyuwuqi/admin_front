<template>
  <div class="coupon-container">
    <h1>优惠券管理</h1>
    <div class="coupon-content">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>优惠券列表</span>
            <el-button type="primary" size="small">新增优惠券</el-button>
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
                <el-button size="small" type="primary">编辑</el-button>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

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