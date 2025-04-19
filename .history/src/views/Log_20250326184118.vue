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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  username: '',
  module: '',
  ip: '',
  dateRange: []
})

// 用户选项
const userOptions = ref(['admin', 'admin1', 'zhangsan', 'ceshi', 'tesst', 'test', 'lisi', 'zhangliaqi', 'put'])

// 模块选项
const moduleOptions = ref(['用户管理', '角色管理', '民宿管理', '财务管理', '系统设置', '订单管理', '优惠券管理'])

// 模拟数据
const logList = ref([
  {
    id: 1,
    username: 'admin',
    module: '登录',
    description: '登录系统',
    ip: '172.168.0.120',
    createTime: '2022-05-07 12:00:00'
  },
  {
    id: 2,
    username: 'admin1',
    module: '用户管理',
    description: '新增了用户【张三】',
    ip: '172.168.0.120',
    createTime: '2022-05-07 12:00:00'
  },
  {
    id: 3,
    username: 'zhangsan',
    module: '民宿管理',
    description: '新增了民宿【张小三的民宿】',
    ip: '172.168.0.120',
    createTime: '2022-05-07 12:00:00'
  },
  {
    id: 4,
    username: 'ceshi',
    module: '订单管理',
    description: '在订单编号【202205071212121212】添加了备注',
    ip: '172.168.0.120',
    createTime: '2022-05-07 12:00:00'
  },
  {
    id: 5,
    username: 'tesst',
    module: '角色管理',
    description: '新增了角色【超级管理员】',
    ip: '172.168.0.120',
    createTime: '2022-05-07 12:00:00'
  },
  {
    id: 6,
    username: 'test',
    module: '民宿管理',
    description: '发布了民宿【张小三的】',
    ip: '172.168.0.120',
    createTime: '2022-05-07 12:00:00'
  },
  {
    id: 7,
    username: 'lisi',
    module: '角色管理',
    description: '编辑了角色【管理员】',
    ip: '172.168.0.120',
    createTime: '2022-05-07 12:00:00'
  },
  {
    id: 8,
    username: 'zhangliaqi',
    module: '订单管理',
    description: '确认了订单编号【202205041212121212】',
    ip: '172.168.0.120',
    createTime: '2022-05-07 12:00:00'
  },
  {
    id: 9,
    username: 'put',
    module: '优惠券管理',
    description: '新增了优惠券【二十活动优惠券】',
    ip: '172.168.0.120',
    createTime: '2022-05-07 12:00:00'
  }
])

// 搜索处理
const handleSearch = () => {
  // 实际项目中这里应该调用API进行搜索
  ElMessage.success('搜索成功')
  console.log('搜索条件:', searchForm)
}

// 导出处理
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 页面加载时初始化数据
onMounted(() => {
  // 实际项目中这里应该调用API获取日志列表
  console.log('页面加载完成')
})
</script>

<style scoped>
.log-container {
  padding: 20px;
}

.log-content {
  margin-top: 20px;
}

.search-area {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.form-item {
  display: flex;
  align-items: center;
}

.form-item label {
  margin-right: 10px;
  white-space: nowrap;
}

.form-item .el-input,
.form-item .el-select {
  width: 200px;
}

.date-range .el-date-editor {
  width: 350px;
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