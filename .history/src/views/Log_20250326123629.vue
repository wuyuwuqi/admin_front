<template>
  <div class="log-container">
    <h1>操作日志</h1>
    <div class="log-content">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>操作日志列表</span>
            <div class="search-box">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="small"
              />
              <el-button type="primary" size="small" style="margin-left: 10px">查询</el-button>
              <el-button type="info" size="small">导出</el-button>
            </div>
          </div>
        </template>
        <div class="log-table">
          <el-table :data="logList" style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="username" label="操作人" width="120" />
            <el-table-column prop="module" label="操作模块" width="120" />
            <el-table-column prop="action" label="操作类型" width="120" />
            <el-table-column prop="description" label="操作描述" width="250" />
            <el-table-column prop="ip" label="IP地址" width="120" />
            <el-table-column prop="createTime" label="操作时间" width="180" />
            <el-table-column prop="status" label="状态" width="100" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button size="small" type="primary">详情</el-button>
              </template>
            </el-table-column>
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
      </el-card>
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