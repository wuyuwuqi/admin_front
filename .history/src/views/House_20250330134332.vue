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
            <el-option label="单人间" value="单人间" />
            <el-option label="双人间" value="双人间" />
            <el-option label="三人间" value="三人间" />
            <el-option label="四人间" value="四人间" />
            <el-option label="五人间" value="五人间" />
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
        <el-table-column prop="rentType" label="房屋类型" width="100" />
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
      width="70%"
      :before-close="handleDialogClose"
    >
      <el-form :model="houseForm" label-width="100px">
        <el-tabs type="border-card">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息">
            <el-form-item label="民宿名称" required>
              <el-input v-model="houseForm.name" placeholder="请输入民宿名称" />
            </el-form-item>
            <el-form-item label="地址" required>
              <el-cascader
                v-model="houseForm.areaCode"
                :options="regionData"
                placeholder="请选择省/市/区"
                style="width: 100%; margin-bottom: 10px;"
              />
              <el-input v-model="houseForm.detailAddress" placeholder="请输入详细地址" />
            </el-form-item>
            <el-form-item label="价格" required>
              <el-input-number v-model="houseForm.price" :min="0" :precision="0" :step="10" />
            </el-form-item>
            <el-form-item label="位置">
              <el-input v-model="houseForm.position" placeholder="请输入位置，如：长沙" />
            </el-form-item>
            <el-form-item label="区域划分">
              <el-input v-model="houseForm.regionalDivision" placeholder="请输入区域划分，如：五一广场" />
            </el-form-item>
            <el-form-item label="评分">
              <el-rate v-model="houseForm.rating" :max="5" />
            </el-form-item>
            <el-form-item label="评论数">
              <el-input v-model="houseForm.reviews" placeholder="请输入评论数，如：5条评论" />
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
          </el-tab-pane>
          
          <!-- 规格信息 -->
          <el-tab-pane label="规格信息">
            <el-form-item label="面积">
              <el-input v-model="houseForm.specs.area" placeholder="请输入面积，如：52m²" />
            </el-form-item>
            <el-form-item label="房间配置">
              <el-input v-model="houseForm.specs.rooms" placeholder="请输入房间配置，如：2卧2卫1厨" />
            </el-form-item>
            <el-form-item label="容纳人数">
              <el-input v-model="houseForm.specs.capacity" placeholder="请输入容纳人数，如：2床4人" />
            </el-form-item>
            <el-form-item label="特点">
              <el-input v-model="houseForm.specs.features" placeholder="请输入特点，如：有窗户" />
            </el-form-item>
            <el-form-item label="楼层">
              <el-input v-model="houseForm.specs.floor" placeholder="请输入楼层，如：五层" />
            </el-form-item>
            <el-form-item label="房间类型" required>
              <el-select v-model="houseForm.specs.type" placeholder="请选择房间类型">
                <el-option label="单人间" value="单人间" />
                <el-option label="双人间" value="双人间" />
                <el-option label="三人间" value="三人间" />
                <el-option label="四人间" value="四人间" />
                <el-option label="豪华四人间" value="豪华四人间" />
                <el-option label="五人间" value="五人间" />
              </el-select>
            </el-form-item>
          </el-tab-pane>
          
          <!-- 设施信息 -->
          <el-tab-pane label="设施信息">
            <el-form-item label="基础设施">
              <el-checkbox-group v-model="houseForm.facilities.basic">
                <el-checkbox label="付费停车位" />
                <el-checkbox label="电梯" />
                <el-checkbox label="无线网络" />
                <el-checkbox label="客厅" />
                <el-checkbox label="按摩浴缸床品" />
                <el-checkbox label="拖鞋" />
                <el-checkbox label="行李寄存" />
                <el-checkbox label="免费停车场" />
                <el-checkbox label="有洗衣机" />
                <el-checkbox label="公共区域WIFI" />
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="浴室设施">
              <el-checkbox-group v-model="houseForm.facilities.bathroom">
                <el-checkbox label="热水淋浴" />
                <el-checkbox label="牙具" />
                <el-checkbox label="毛巾" />
                <el-checkbox label="电吹风" />
                <el-checkbox label="浴液洗发水" />
                <el-checkbox label="香皂" />
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="服务设施">
              <el-checkbox-group v-model="houseForm.facilities.service">
                <el-checkbox label="门禁系统" />
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          
          <!-- 特色描述 -->
          <el-tab-pane label="特色描述">
            <el-form-item label="民宿特色">
              <el-input v-model="houseForm.features" type="textarea" rows="4" placeholder="请输入民宿特色描述" />
            </el-form-item>
            <el-form-item label="特点标签">
              <el-select
                v-model="houseForm.characteristics"
                multiple
                placeholder="请选择特点标签"
                style="width: 100%"
              >
                <el-option label="行李寄存" value="行李寄存" />
                <el-option label="免费停车场" value="免费停车场" />
                <el-option label="有洗衣机" value="有洗衣机" />
                <el-option label="公共区域WIFI" value="公共区域WIFI" />
                <el-option label="旅游" value="旅游" />
                <el-option label="居家" value="居家" />
                <el-option label="放松" value="放松" />
                <el-option label="休闲" value="休闲" />
              </el-select>
            </el-form-item>
          </el-tab-pane>
          
          <!-- 房东信息 -->
          <el-tab-pane label="房东信息">
            <el-form-item label="房东名称">
              <el-input v-model="houseForm.hostInfo.name" placeholder="请输入房东名称" />
            </el-form-item>
            <el-form-item label="房东头像">
              <el-input v-model="houseForm.hostInfo.avatar" placeholder="请输入房东头像路径" />
            </el-form-item>
            <el-form-item label="房东链接">
              <el-input v-model="houseForm.hostInfo.link" placeholder="请输入房东链接" />
            </el-form-item>
            <el-form-item label="房东描述">
              <el-input v-model="houseForm.hostInfo.description" type="textarea" rows="3" placeholder="请输入房东描述" />
            </el-form-item>
          </el-tab-pane>
          
          <!-- 预订规则 -->
          <el-tab-pane label="预订规则">
            <el-form-item label="入住时间">
              <el-input v-model="houseForm.bookingRules.checkIn" placeholder="请输入入住时间，如：14:00-24:00入住，12:00前可退房" />
            </el-form-item>
            <el-form-item label="押金规则">
              <el-input v-model="houseForm.bookingRules.deposit" placeholder="请输入押金规则，如：不收取押金" />
            </el-form-item>
            <el-form-item label="加客规则">
              <el-input v-model="houseForm.bookingRules.addCustFee" placeholder="请输入加客规则，如：不允许加客" />
            </el-form-item>
            <el-form-item label="房东要求">
              <el-checkbox-group v-model="houseForm.bookingRules.landlordRequest">
                <el-checkbox label="不允许做饭" />
                <el-checkbox label="不允许携带宠物" />
                <el-checkbox label="不允许举办派对" />
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="取消政策">
              <el-input v-model="houseForm.bookingRules.cancelPolicy" type="textarea" rows="2" placeholder="请输入取消政策" />
            </el-form-item>
          </el-tab-pane>
          
          <!-- 发布状态 -->
          <el-tab-pane label="发布状态">
            <el-form-item label="发布状态">
              <el-switch v-model="houseForm.published" />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
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
import LandlordStorage from '../utils/LandlordStorage'
import { regionData, codeToText } from 'element-china-area-data'

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
  areaCode: [], // 省市区三级联动选择的区域码数组
  detailAddress: '', // 详细地址
  landlord_id: '',
  price: 500,
  image: '',
  specs: {
    area: '',
    rooms: '',
    capacity: '',
    features: '',
    floor: '',
    type: '单人间'
  },
  facilities: {
    basic: [],
    bathroom: [],
    service: []
  },
  features: '',
  hostInfo: {
    name: '',
    avatar: '',
    link: '',
    description: ''
  },
  bookingRules: {
    checkIn: '',
    deposit: '',
    addCustFee: '',
    landlordRequest: [],
    cancelPolicy: ''
  },
  rating: 5,
  reviews: '',
  position: '',
  characteristics: [],
  regionalDivision: '',
  published: false
})

// 创建人列表
const creatorList = ref(['张三三', '李四', '王五'])

// 民宿数据，从后端获取
const houses = ref([])

// 从后端获取民宿数据
const fetchHouses = async () => {
  try {
    // 从LandlordStorage获取当前登录用户信息
    const userInfo = LandlordStorage.getUserInfo()
    const landlordId = userInfo?.id || ''
    
    const response = await axios({
      method: 'get',
      url: `/api/hotel/byLandlordId?landlordId=${landlordId}`,
      headers: {}
    })
    
    // 将后端数据转换为前端所需格式
    houses.value = response.data.map(item => ({
      id: item.id,
      name: item.name,
      address: item.address,
      rentType: item.specs?.type || '日租', // 使用房间类型作为租赁类型
      deposit: 300, // 默认押金
      rent: item.price, // 使用价格作为租金
      thumbnail: item.image, // 使用图片路径
      description: item.features || item.description || '', // 使用特色或描述
      tags: item.characteristics || [], // 使用特色标签
      creator: item.hostInfo?.name || '管理员', // 使用房东名称
      published: true // 默认已发布
    }))
    
    // 更新总数
    totalHouses.value = houses.value.length
    
    console.log('民宿数据获取成功:', houses.value)
  } catch (error) {
    console.error('获取民宿数据失败:', error)
    ElMessage.error('获取民宿数据失败')
  }
}

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

// 从后端获取默认民宿模板数据
const fetchDefaultHouseTemplate = async () => {
  try {
    // 从LandlordStorage获取当前登录用户信息
    const userInfo = LandlordStorage.getUserInfo()
    const landlordId = userInfo?.id || ''
    
    const response = await axios({
      method: 'get',
      url: 'http://localhost:8080/hotel/getDefaultTemplate',
      headers: {}
    })
    
    if (response.data.code === 200 && response.data.data) {
      // 使用后端返回的模板数据
      const templateData = response.data.data
      
      // 确保所有必要的嵌套对象都存在
      if (!templateData.specs) templateData.specs = {}
      if (!templateData.facilities) templateData.facilities = { basic: [], bathroom: [], service: [] }
      if (!templateData.hostInfo) templateData.hostInfo = {}
      if (!templateData.bookingRules) templateData.bookingRules = {}
      
      return {
        id: '',
        name: '',
        address: '',
        landlord_id: landlordId,
        price: templateData.price || 500,
        image: templateData.image || '/static/accommodationImage/hotel1.png',
        specs: {
          area: templateData.specs.area || '52m²',
          rooms: templateData.specs.rooms || '2卧2卫1厨',
          capacity: templateData.specs.capacity || '2床4人',
          features: templateData.specs.features || '有窗户',
          floor: templateData.specs.floor || '五层',
          type: templateData.specs.type || '单人间'
        },
        facilities: {
          basic: templateData.facilities.basic || [],
          bathroom: templateData.facilities.bathroom || [],
          service: templateData.facilities.service || []
        },
        features: templateData.features || '',
        hostInfo: {
          name: userInfo?.name || templateData.hostInfo.name || '有味民宿',
          avatar: templateData.hostInfo.avatar || '/static/images/logo.png',
          link: templateData.hostInfo.link || '',
          description: templateData.hostInfo.description || ''
        },
        bookingRules: {
          checkIn: templateData.bookingRules.checkIn || '14:00-24:00入住，12:00前可退房（以当地城市时区为主）',
          deposit: templateData.bookingRules.deposit || '不收取押金',
          addCustFee: templateData.bookingRules.addCustFee || '不允许加客',
          landlordRequest: templateData.bookingRules.landlordRequest || [],
          cancelPolicy: templateData.bookingRules.cancelPolicy || '预订成功后30分钟内可免费取消订单，不收取费用；30分钟后取消将收取100%房费，查看详情'
        },
        rating: templateData.rating || 5,
        reviews: templateData.reviews || '0条评论',
        position: templateData.position || '',
        characteristics: templateData.characteristics || [],
        regionalDivision: templateData.regionalDivision || '',
        published: false
      }
    } else {
      // 如果API请求失败，返回默认值
      console.warn('获取默认民宿模板失败，使用默认值')
      return null
    }
  } catch (error) {
    console.error('获取默认民宿模板失败:', error)
    return null
  }
}

// 处理添加民宿
const handleAdd = async () => {
  isEdit.value = false
  // 从LandlordStorage获取当前登录用户信息
  const userInfo = LandlordStorage.getUserInfo()
  const landlordId = userInfo?.id || ''
  
  // 尝试从后端获取默认模板
  const templateData = await fetchDefaultHouseTemplate()
  
  if (templateData) {
    // 使用从后端获取的模板数据
    houseForm.value = templateData
  } else {
    // 如果获取失败，使用默认值
    houseForm.value = {
      id: '',
      name: '',
      address: '',
      areaCode: [],
      detailAddress: '',
      landlord_id: landlordId,
      price: 500,
      image: '/static/accommodationImage/hotel1.png',
      specs: {
        area: '52m²',
        rooms: '2卧2卫1厨',
        capacity: '2床4人',
        features: '有窗户',
        floor: '五层',
        type: '单人间'
      },
      facilities: {
        basic: [],
        bathroom: [],
        service: []
      },
      features: '',
      hostInfo: {
        name: userInfo?.name || '有味民宿',
        avatar: '/static/images/logo.png',
        link: '',
        description: ''
      },
      bookingRules: {
        checkIn: '14:00-24:00入住，12:00前可退房（以当地城市时区为主）',
        deposit: '不收取押金',
        addCustFee: '不允许加客',
        landlordRequest: [],
        cancelPolicy: '预订成功后30分钟内可免费取消订单，不收取费用；30分钟后取消将收取100%房费，查看详情'
      },
      rating: 5,
      reviews: '0条评论',
      position: '',
      characteristics: [],
      regionalDivision: '',
      published: false
    }
  }
  
  dialogVisible.value = true
}

// 处理编辑民宿
const handleEdit = async (id) => {
  isEdit.value = true
  try {
    // 从LandlordStorage获取当前登录用户信息
    const userInfo = LandlordStorage.getUserInfo()
    const landlordId = userInfo?.id || ''
    
    // 从后端获取完整的民宿信息
    const response = await axios({
      method: 'get',
      url: `/api/hotel/byHotelId?id=${id}`,
      headers: {}
    })
    
    // 处理后端返回的数据
    if (response.data) {
      // 将后端返回的完整数据填充到表单中
      const hotelData = response.data
      
      // 确保所有必要的嵌套对象都存在
      if (!hotelData.specs) hotelData.specs = {}
      if (!hotelData.facilities) hotelData.facilities = { basic: [], bathroom: [], service: [] }
      if (!hotelData.hostInfo) hotelData.hostInfo = {}
      if (!hotelData.bookingRules) hotelData.bookingRules = {}
      
      // 尝试解析地址，分离省市区和详细地址
      let areaCode = [];
      let detailAddress = '';
      
      if (hotelData.address) {
        // 尝试从地址中提取省市区信息
        const addressParts = hotelData.address.split(' ');
        if (addressParts.length > 0) {
          // 尝试将前三部分解析为省市区
          const provinceName = addressParts[0];
          const cityName = addressParts.length > 1 ? addressParts[1] : '';
          const districtName = addressParts.length > 2 ? addressParts[2] : '';
          
          // 使用TextToCode尝试将地址文本转换为区域码
          try {
            if (provinceName) {
              const provinceCode = TextToCode[provinceName].code;
              if (provinceCode) areaCode.push(provinceCode);
              
              if (cityName && TextToCode[provinceName][cityName]) {
                const cityCode = TextToCode[provinceName][cityName].code;
                if (cityCode) areaCode.push(cityCode);
                
                if (districtName && TextToCode[provinceName][cityName][districtName]) {
                  const districtCode = TextToCode[provinceName][cityName][districtName].code;
                  if (districtCode) areaCode.push(districtCode);
                }
              }
            }
          } catch (e) {
            console.warn('解析地址失败:', e);
          }
          
          // 剩余部分作为详细地址
          if (areaCode.length > 0 && addressParts.length > areaCode.length) {
            detailAddress = addressParts.slice(areaCode.length).join(' ');
          } else {
            // 如果解析失败，将整个地址作为详细地址
            detailAddress = hotelData.address;
          }
        } else {
          detailAddress = hotelData.address;
        }
      }
      
      houseForm.value = {
        id: hotelData.id,
        name: hotelData.name || '',
        address: hotelData.address || '',
        areaCode: areaCode,
        detailAddress: detailAddress,
        landlord_id: hotelData.landlord_id || '',
        price: hotelData.price || 0,
        image: hotelData.image || '',
        specs: {
          area: hotelData.specs.area || '',
          rooms: hotelData.specs.rooms || '',
          capacity: hotelData.specs.capacity || '',
          features: hotelData.specs.features || '',
          floor: hotelData.specs.floor || '',
          type: hotelData.specs.type || '单人间'
        },
        facilities: {
          basic: hotelData.facilities.basic || [],
          bathroom: hotelData.facilities.bathroom || [],
          service: hotelData.facilities.service || []
        },
        features: hotelData.features || '',
        hostInfo: {
          name: hotelData.hostInfo.name || '',
          avatar: hotelData.hostInfo.avatar || '',
          link: hotelData.hostInfo.link || '',
          description: hotelData.hostInfo.description || ''
        },
        bookingRules: {
          checkIn: hotelData.bookingRules.checkIn || '',
          deposit: hotelData.bookingRules.deposit || '',
          addCustFee: hotelData.bookingRules.addCustFee || '',
          landlordRequest: hotelData.bookingRules.landlordRequest || [],
          cancelPolicy: hotelData.bookingRules.cancelPolicy || ''
        },
        rating: hotelData.rating || 5,
        reviews: hotelData.reviews || '',
        position: hotelData.position || '',
        characteristics: hotelData.characteristics || [],
        regionalDivision: hotelData.regionalDivision || '',
        published: hotelData.published !== undefined ? hotelData.published : true
      }
      
      dialogVisible.value = true
    } else {
      ElMessage.error('获取民宿详情失败')
    }
  } catch (error) {
    console.error('获取民宿详情失败:', error)
    ElMessage.error('获取民宿详情失败: ' + (error.message || '未知错误'))
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
const saveHouse = async () => {
  try {
    // 表单验证
    if (!houseForm.value.name) {
      ElMessage.warning('请输入民宿名称')
      return
    }
    // 检查是否选择了省市区或输入了详细地址
    if ((!houseForm.value.areaCode || houseForm.value.areaCode.length === 0) && !houseForm.value.detailAddress) {
      ElMessage.warning('请输入民宿地址')
      return
    }
    if (!houseForm.value.price) {
      ElMessage.warning('请输入民宿价格')
      return
    }
    
    // 合并省市区和详细地址
    let fullAddress = '';
    if (houseForm.value.areaCode && houseForm.value.areaCode.length > 0) {
      // 使用codeToText将区域码转为中文名称
      const province = codeToText[houseForm.value.areaCode[0]];
      const city = houseForm.value.areaCode[1] ? codeToText[houseForm.value.areaCode[1]] : '';
      const district = houseForm.value.areaCode[2] ? codeToText[houseForm.value.areaCode[2]] : '';
      
      fullAddress = province + (city ? ' ' + city : '') + (district ? ' ' + district : '');
      if (houseForm.value.detailAddress) {
        fullAddress += ' ' + houseForm.value.detailAddress;
      }
    } else {
      fullAddress = houseForm.value.detailAddress || '';
    }
    
    // 从LandlordStorage获取当前登录用户信息
    const userInfo = LandlordStorage.getUserInfo()
    const landlordId = userInfo?.id || '2'
    
    // 准备API请求数据，确保landlordId作为第一个字段
    const requestData = {
      landlordId: landlordId, // 使用从LandlordStorage获取的房东ID
      name: houseForm.value.name,
      image: houseForm.value.image,
      address: fullAddress, // 使用合并后的完整地址
      price: houseForm.value.price,
      specs: houseForm.value.specs,
      facilities: houseForm.value.facilities,
      features: houseForm.value.features,
      hostInfo: houseForm.value.hostInfo,
      bookingRules: houseForm.value.bookingRules,
      rating: houseForm.value.rating,
      reviews: houseForm.value.reviews,
      position: houseForm.value.position,
      characteristics: houseForm.value.characteristics,
      regionalDivision: houseForm.value.regionalDivision
    }
    
    if (isEdit.value) {
      // 更新现有民宿
      // 根据后端提供的接口格式构建请求数据
      const hotelId = houseForm.value.id
      
      // 构建符合后端要求的请求体
      const requestObj = {
        "request": {
          "name": houseForm.value.name,
          "address": fullAddress,
          "price": houseForm.value.price,
          "specs": houseForm.value.specs.type || '',
          "facilities": houseForm.value.facilities.basic || [],
          "features": houseForm.value.characteristics || [],
          "position": houseForm.value.position || '',
          "regionalDivision": houseForm.value.regionalDivision || '',
          "landlordId": landlordId // 添加房东ID确保后端能正确关联
        }
      }
      
      // 添加调试日志，查看请求数据
      console.log('更新民宿请求数据:', requestObj)
      
      // 发送请求到后端API，使用代理方式避免跨域问题
      const response = await axios({
        method: 'post',
        url: `/api/hotel/updateHotel?id=${hotelId}`,
        headers: { 
          'Content-Type': 'application/json'
        },
        data: { request: requestObj.request }
      })
      
      // 添加详细日志，便于调试
      console.log('更新民宿响应:', response.data)
      
      // 根据后端响应格式进行判断，只检查statusCode
      if (response.data.statusCode === 200) {
        ElMessage.success(response.data.message || '更新成功')
        // 刷新民宿列表
        await fetchHouses() // 使用await确保数据刷新完成
        // 关闭对话框前确保数据已刷新
        dialogVisible.value = false
      } else {
        console.error('更新失败，响应数据:', response.data)
        ElMessage.error(response.data.message || '更新失败')
      }
    } else {
      // 添加新民宿
      const response = await axios({
        method: 'post',
        url: '/api/hotel/addHotel',
        headers: { 
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(requestData)
      })
      
      // 添加详细日志，便于调试
      console.log('添加民宿响应:', response.data)
      
      // 根据后端新的响应格式进行判断
      if (response.data.statusCode === 200) {
        ElMessage.success(response.data.message || '添加成功')
        // 刷新民宿列表
        await fetchHouses() // 使用await确保数据刷新完成
        // 关闭对话框前确保数据已刷新
        dialogVisible.value = false
      } else {
        console.error('添加失败，响应数据:', response.data)
        ElMessage.error(response.data.message || '添加失败')
      }
    }
  } catch (error) {
    console.error('保存民宿失败:', error)
    ElMessage.error('保存失败: ' + (error.message || '未知错误'))
  }
}

// 关闭对话框
const handleDialogClose = () => {
  dialogVisible.value = false
}

onMounted(() => {
  // 从后端API获取民宿数据
  fetchHouses()
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