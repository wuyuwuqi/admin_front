<template>
  <div class="house-page">
    <h1>民宿管理</h1>
    
    <!-- 顶部筛选区域 -->
    <el-card class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">民宿名称</span>
          <el-input v-model="searchKeyword" placeholder="请输入" clearable style="width: 200px;" />
        </div>
        <div class="filter-item">
          <span class="filter-label">租房类型</span>
          <el-select v-model="filterType" placeholder="全部" clearable style="min-width: 120px;">
            <el-option label="全部" value="" />
            <el-option label="日租" value="日租" />
            <el-option label="月租" value="月租" />
            <el-option label="年租" value="年租" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">创建人</span>
          <el-select v-model="filterCreator" placeholder="全部" clearable style="min-width: 120px;">
            <el-option label="全部" value="" />
            <el-option v-for="creator in creatorList" :key="creator" :label="creator" :value="creator" />
          </el-select>
        </div>
        <div class="filter-item search-box">
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </div>
      </div>
    </el-card>
    
    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" @click="handleAdd">添加</el-button>
      <el-button @click="handleExport">导出</el-button>
    </div>
    
    <!-- 民宿列表 -->
    <el-card class="house-list-card">
      <el-table :data="filteredHouses" style="width: 100%" border stripe>
        <el-table-column prop="name" label="民宿名称" width="120" />
        <el-table-column prop="address" label="地址" width="200" />
        <el-table-column prop="rentType" label="租赁类型" width="100" />
        <el-table-column prop="deposit" label="押金" width="100">
          <template #default="scope">
            <span>¥{{ scope.row.deposit }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rent" label="租金" width="100">
          <template #default="scope">
            <span>¥{{ scope.row.rent }}</span>
          </template>
        </el-table-column>
        <el-table-column label="缩略图" width="120">
          <template #default="scope">
            <el-image 
              :src="scope.row.thumbnail" 
              style="width: 80px; height: 60px;"
              fit="cover"
              :preview-src-list="[scope.row.thumbnail]"
            />
          </template>
        </el-table-column>
        <el-table-column prop="description" label="民宿描述" min-width="150" />
        <el-table-column label="标签" width="200">
          <template #default="scope">
            <el-tag 
              v-for="(tag, index) in scope.row.tags" 
              :key="index" 
              :type="getTagType(tag)" 
              class="house-tag"
              size="small"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column label="发布" width="80">
          <template #default="scope">
            <el-switch
              v-model="scope.row.published"
              @change="handlePublishChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row.id)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
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
          :total="totalHouses"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 添加/编辑民宿对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑民宿' : '添加民宿'"
      width="50%"
      :before-close="handleDialogClose"
    >
      <el-form :model="houseForm" label-width="100px">
        <el-form-item label="民宿名称" required>
          <el-input v-model="houseForm.name" placeholder="请输入民宿名称" />
        </el-form-item>
        <el-form-item label="地址" required>
          <el-input v-model="houseForm.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="租赁类型" required>
          <el-select v-model="houseForm.rentType" placeholder="请选择租赁类型">
            <el-option label="日租" value="日租" />
            <el-option label="月租" value="月租" />
            <el-option label="年租" value="年租" />
          </el-select>
        </el-form-item>
        <el-form-item label="押金" required>
          <el-input-number v-model="houseForm.deposit" :min="0" :precision="0" :step="100" />
        </el-form-item>
        <el-form-item label="租金" required>
          <el-input-number v-model="houseForm.rent" :min="0" :precision="0" :step="100" />
        </el-form-item>
        <el-form-item label="民宿描述">
          <el-input v-model="houseForm.description" type="textarea" rows="3" placeholder="请输入民宿描述" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="houseForm.tags"
            multiple
            placeholder="请选择标签"
            style="width: 100%"
          >
            <el-option label="旅游" value="旅游" />
            <el-option label="居家" value="居家" />
            <el-option label="放松" value="放松" />
            <el-option label="休闲" value="休闲" />
          </el-select>
        </el-form-item>
        <el-form-item label="缩略图">
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :limit="1"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="发布状态">
          <el-switch v-model="houseForm.published" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取 消</el-button>
          <el-button type="primary" @click="saveHouse">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import axios from 'axios'

// 筛选条件
const searchKeyword = ref('')
const filterType = ref('')
const filterCreator = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalHouses = ref(100) // 实际项目中这个值应该从API获取

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const houseForm = ref({
  id: '',
  name: '',
  address: '',
  rentType: '日租',
  deposit: 300,
  rent: 500,
  description: '',
  tags: [],
  thumbnail: '',
  creator: '',
  published: false
})

// 创建人列表
const creatorList = ref(['张三三', '李四', '王五'])

// 模拟民宿数据
const houses = ref([
  {
    id: '1',
    name: '奇景瑞宿',
    address: '广东省深圳市南山区桃源街道',
    rentType: '日租',
    deposit: 300,
    rent: 500,
    thumbnail: '/src/assets/house-illustration.svg',
    description: '一共有3个房间，三层，可玩耍...',
    tags: ['旅游', '居家', '放松'],
    creator: '张三三',
    published: true
  },
  {
    id: '2',
    name: '爱琴小屋',
    address: '广东省深圳市南山区桃源街道',
    rentType: '日租',
    deposit: 300,
    rent: 500,
    thumbnail: '/src/assets/house-illustration.svg',
    description: '环境舒适',
    tags: ['休闲'],
    creator: '张三三',
    published: true
  },
  {
    id: '3',
    name: '伊甸之星',
    address: '广东省深圳市南山区桃源街道',
    rentType: '日租',
    deposit: 200,
    rent: 600,
    thumbnail: '/src/assets/house-illustration.svg',
    description: '适合家庭',
    tags: ['旅游', '居家', '放松'],
    creator: '张三三',
    published: true
  },
  {
    id: '4',
    name: '三味的民宿店',
    address: '广东省深圳市南山区桃源街道',
    rentType: '日租',
    deposit: 300,
    rent: 500,
    thumbnail: '/src/assets/house-illustration.svg',
    description: '春生夏长秋收',
    tags: ['旅游', '居家', '放松'],
    creator: '李琦',
    published: true
  },
  {
    id: '5',
    name: '农夫民宿',
    address: '广东省深圳市南山区桃源街道',
    rentType: '日租',
    deposit: 300,
    rent: 500,
    thumbnail: '/src/assets/house-illustration.svg',
    description: '风景宜人，适合居住',
    tags: ['旅游', '居家', '放松'],
    creator: '张三三',
    published: true
  },
  {
    id: '6',
    name: '沙泉度假店',
    address: '广东省深圳市南山区桃源街道',
    rentType: '日租',
    deposit: 300,
    rent: 500,
    thumbnail: '/src/assets/house-illustration.svg',
    description: '坐落在山景下',
    tags: ['旅游', '居家', '放松'],
    creator: '张三三',
    published: false
  },
  {
    id: '7',
    name: '小宠岛',
    address: '广东省深圳市南山区桃源街道',
    rentType: '日租',
    deposit: 300,
    rent: 500,
    thumbnail: '/src/assets/house-illustration.svg',
    description: '宠物环境',
    tags: ['旅游', '居家', '放松'],
    creator: '张三三',
    published: false
  },
  {
    id: '8',
    name: '小青云度假店',
    address: '广东省深圳市南山区桃源街道',
    rentType: '日租',
    deposit: 300,
    rent: 500,
    thumbnail: '/src/assets/house-illustration.svg',
    description: '生态旅游度假村',
    tags: ['旅游', '居家', '放松'],
    creator: '张三三',
    published: false
  },
  {
    id: '9',
    name: '清秀民宿',
    address: '广东省深圳市南山区桃源街道',
    rentType: '日租',
    deposit: 300,
    rent: 500,
    thumbnail: '/src/assets/house-illustration.svg',
    description: '山清水秀',
    tags: ['旅游', '居家', '放松'],
    creator: '张三三',
    published: false
  }
])

// 根据筛选条件过滤民宿
const filteredHouses = computed(() => {
  let result = houses.value
  
  // 按名称搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(house => 
      house.name.toLowerCase().includes(keyword)
    )
  }
  
  // 按租赁类型过滤
  if (filterType.value) {
    result = result.filter(house => house.rentType === filterType.value)
  }
  
  // 按创建人过滤
  if (filterCreator.value) {
    result = result.filter(house => house.creator === filterCreator.value)
  }
  
  // 实际项目中这里应该只返回当前页的数据
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return result.slice(start, end)
})

// 获取标签对应的类型
const getTagType = (tag) => {
  const typeMap = {
    '旅游': 'success',
    '居家': 'warning',
    '放松': 'danger',
    '休闲': 'info'
  }
  return typeMap[tag] || 'info'
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

// 处理添加民宿
const handleAdd = () => {
  isEdit.value = false
  houseForm.value = {
    id: '',
    name: '',
    address: '',
    rentType: '日租',
    deposit: 300,
    rent: 500,
    description: '',
    tags: [],
    thumbnail: '',
    creator: '张三三', // 默认创建人
    published: false
  }
  dialogVisible.value = true
}

// 处理编辑民宿
const handleEdit = (id) => {
  isEdit.value = true
  const house = houses.value.find(h => h.id === id)
  if (house) {
    houseForm.value = { ...house }
    dialogVisible.value = true
  }
}

// 处理删除民宿
const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该民宿吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实际项目中这里会调用API删除民宿
    houses.value = houses.value.filter(h => h.id !== id)
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消操作
  })
}

// 处理发布状态变更
const handlePublishChange = (house) => {
  // 实际项目中这里会调用API更新发布状态
  ElMessage.success(`${house.name} ${house.published ? '已发布' : '已下线'}`)
}

// 处理导出
const handleExport = () => {
  // 实际项目中这里会调用API导出数据
  ElMessage.success('导出成功')
}

// 保存民宿
const saveHouse = () => {
  // 实际项目中这里会调用API保存民宿数据
  if (isEdit.value) {
    // 更新现有民宿
    const index = houses.value.findIndex(h => h.id === houseForm.value.id)
    if (index !== -1) {
      houses.value[index] = { ...houseForm.value }
    }
    ElMessage.success('更新成功')
  } else {
    // 添加新民宿
    const newId = Date.now().toString()
    houses.value.push({
      ...houseForm.value,
      id: newId,
      thumbnail: '/src/assets/house-illustration.svg' // 使用默认图片
    })
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
}

// 关闭对话框
const handleDialogClose = () => {
  dialogVisible.value = false
}

onMounted(() => {
  // 实际项目中这里会从API获取民宿数据
  console.log('民宿管理页面已加载')
})
</script>

<style scoped>
.house-page {
  padding: 20px;
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
  margin-left: auto;
}

/* 操作按钮样式 */
.action-buttons {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

/* 民宿列表样式 */
.house-list-card {
  margin-top: 20px;
}

.house-tag {
  margin-right: 5px;
  margin-bottom: 5px;
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