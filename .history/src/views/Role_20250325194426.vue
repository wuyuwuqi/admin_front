<template>
  <div class="role-container">
    <h1>角色管理</h1>
    <div class="role-content">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>角色列表</span>
            <el-button type="primary" size="small">新增角色</el-button>
          </div>
        </template>
        <div class="role-table">
          <el-table :data="roleList" style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="角色名称" width="180" />
            <el-table-column prop="description" label="角色描述" width="250" />
            <el-table-column prop="createTime" label="创建时间" width="180" />
            <el-table-column prop="status" label="状态" width="100" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button size="small" type="primary">编辑</el-button>
                <el-button size="small" type="success">权限设置</el-button>
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
const roleList = ref([
  {
    id: 1,
    name: '超级管理员',
    description: '拥有所有权限',
    createTime: '2023-01-01 00:00:00',
    status: '启用'
  },
  {
    id: 2,
    name: '运营管理员',
    description: '负责日常运营管理',
    createTime: '2023-01-15 10:30:00',
    status: '启用'
  },
  {
    id: 3,
    name: '财务管理员',
    description: '负责财务相关操作',
    createTime: '2023-02-01 09:15:00',
    status: '启用'
  },
  {
    id: 4,
    name: '客服人员',
    description: '负责客户服务',
    createTime: '2023-03-10 14:20:00',
    status: '禁用'
  }
])
</script>

<style scoped>
.role-container {
  padding: 20px;
}

.role-content {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-table {
  margin-top: 20px;
}
</style>