<template>
  <div class="log-container">
    <h1>操作日志</h1>
    <div class="log-content">
      <!-- 搜索筛选区域 -->
      <div class="search-area">
        <div class="search-form">
          <div class="form-item">
            <label>操作账号</label>
            <el-select v-model="searchForm.username" placeholder="全部" clearable>
              <el-option label="全部" value=""></el-option>
              <el-option v-for="item in userOptions" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </div>
          <div class="form-item">
            <label>操作模块</label>
            <el-select v-model="searchForm.module" placeholder="全部" clearable>
              <el-option label="全部" value=""></el-option>
              <el-option v-for="item in moduleOptions" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </div>
          <div class="form-item">
            <label>IP地址</label>
            <el-input v-model="searchForm.ip" placeholder="请输入" clearable></el-input>
          </div>
          <div class="form-item date-range">
            <label>操作时间</label>
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
            <el-button type="info" @click="handleExport">导出</el-button>
          </div>
        </div>
      </div>
      
      <!-- 日志列表 -->
      <div class="log-table">
        <el-table :data="logList" style="width: 100%" border stripe>
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="username" label="操作账号" width="120" align="center" />
          <el-table-column prop="module" label="操作模块" width="120" align="center" />
          <el-table-column prop="description" label="操作记录" min-width="250" align="center" />
          <el-table-column prop="ip" label="IP地址" width="120" align="center" />
          <el-table-column prop="createTime" label="操作时间" width="180" align="center" />
        </el-table>
        <div class="pagination">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="100"
            :page-size="10"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 日期范围
const dateRange = ref([])

// 模拟数据
const logList = ref([
  {
    id: 1,
    username: 'admin',
    module: '用户管理',
    action: '新增',
    description: '新增用户：张三',
    ip: '192.168.1.1',
    createTime: '2023-06-01 10:30:00',
    status: '成功'
  },
  {
    id: 2,
    username: 'admin',
    module: '角色管理',
    action: '修改',
    description: '修改角色：运营管理员',
    ip: '192.168.1.1',
    createTime: '2023-06-01 11:15:00',
    status: '成功'
  },
  {
    id: 3,
    username: 'operator',
    module: '民宿管理',
    action: '删除',
    description: '删除民宿：海景别墅',
    ip: '192.168.1.2',
    createTime: '2023-06-02 09:20:00',
    status: '成功'
  },
  {
    id: 4,
    username: 'finance',
    module: '财务管理',
    action: '导出',
    description: '导出财务报表',
    ip: '192.168.1.3',
    createTime: '2023-06-02 14:45:00',
    status: '成功'
  },
  {
    id: 5,
    username: 'admin',
    module: '系统设置',
    action: '修改',
    description: '修改系统配置',
    ip: '192.168.1.1',
    createTime: '2023-06-03 16:30:00',
    status: '失败'
  }
])
</script>

<style scoped>
.log-container {
  padding: 20px;
}

.log-content {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
}

.log-table {
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>