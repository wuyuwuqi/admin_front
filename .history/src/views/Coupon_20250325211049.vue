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