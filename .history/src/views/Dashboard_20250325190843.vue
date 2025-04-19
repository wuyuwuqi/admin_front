<template>
  <div class="dashboard">
    <!-- 经营概况 -->
    <div class="section-title">经营概况</div>
    <el-row :gutter="20" class="data-overview">
      <el-col :span="4">
        <el-card shadow="hover" class="data-card blue-gradient">
          <div class="data-title">民宿总数</div>
          <div class="data-value">65</div>
          <div class="data-compare">较昨日 <span class="up">↑ 12%</span></div>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card shadow="hover" class="data-card cyan-gradient">
          <div class="data-title">今日访问量</div>
          <div class="data-value">123,567</div>
          <div class="data-compare">较昨日 <span class="up">↑ 12%</span></div>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card shadow="hover" class="data-card orange-gradient">
          <div class="data-title">今日销售额</div>
          <div class="data-value">123,567</div>
          <div class="data-compare">较昨日 <span class="up">↑ 12%</span></div>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card shadow="hover" class="data-card purple-gradient">
          <div class="data-title">今日订单量</div>
          <div class="data-value">4890</div>
          <div class="data-compare">较昨日 <span class="up">↑ 8%</span></div>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card shadow="hover" class="data-card green-gradient">
          <div class="data-title">今日收入</div>
          <div class="data-value">46,5600</div>
          <div class="data-compare">较昨日 <span class="up">↑ 20%</span></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <div class="chart-title">订单状态占比</div>
          <div id="orderStatusChart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <div class="chart-title">资金收入占比</div>
          <div id="incomeChart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <div class="chart-title">访问量趋势</div>
          <div class="chart-tabs">
            <el-radio-group v-model="visitPeriod" size="small">
              <el-radio-button label="today">今日</el-radio-button>
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
              <el-radio-button label="custom">自定义</el-radio-button>
            </el-radio-group>
            <el-date-picker
              v-if="visitPeriod === 'custom'"
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              style="margin-top: 10px;"
            />
          </div>
          <div id="visitChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户画像和排行榜 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <div class="chart-title">用户画像</div>
          <el-tabs v-model="userProfileTab">
            <el-tab-pane label="客户性别占比" name="gender">
              <div id="genderChart" class="chart"></div>
            </el-tab-pane>
            <el-tab-pane label="人群年龄占比" name="age">
              <div id="ageChart" class="chart"></div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="chart-card">
          <div class="chart-title">订单量排行</div>
          <div class="rank-list">
            <div v-for="(item, index) in orderRankList" :key="index" class="rank-item">
              <div class="rank-index" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
              <div class="rank-info">
                <div class="rank-name">{{ item.name }}</div>
                <div class="rank-value">{{ item.value }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="chart-card">
          <div class="chart-title">销售额排行</div>
          <div class="rank-list">
            <div v-for="(item, index) in salesRankList" :key="index" class="rank-item">
              <div class="rank-index" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
              <div class="rank-info">
                <div class="rank-name">{{ item.name }}</div>
                <div class="rank-value">{{ item.value }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

// 访问量时间段选择
const visitPeriod = ref('week')
const dateRange = ref('')

// 用户画像标签页
const userProfileTab = ref('gender')

// 订单量排行榜数据
const orderRankList = ref([
  { name: '仙居minutes', value: '1200' },
  { name: '怡人居所', value: '1000' },
  { name: '德思嘉', value: '800' },
  { name: '智能屋', value: '600' },
  { name: '海城荟', value: '500' }
])

// 销售额排行榜数据
const salesRankList = ref([
  { name: '仙居minutes', value: '2728.00' },
  { name: '怡人居所', value: '930.20' },
  { name: '德思嘉', value: '832.09' },
  { name: '智能屋', value: '609.28' },
  { name: '海城荟', value: '492.29' }
])

// 初始化图表
onMounted(() => {
  // 订单状态占比图表
  const orderStatusChart = echarts.init(document.getElementById('orderStatusChart'))
  orderStatusChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: ['待支付', '已确认', '退款中', '已退款']
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 23, name: '待支付', itemStyle: { color: '#409EFF' } },
          { value: 12, name: '已确认', itemStyle: { color: '#67C23A' } },
          { value: 5, name: '退款中', itemStyle: { color: '#E6A23C' } },
          { value: 10, name: '已退款', itemStyle: { color: '#F56C6C' } }
        ]
      }
    ]
  })

  // 资金收入占比图表
  const incomeChart = echarts.init(document.getElementById('incomeChart'))
  incomeChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: ['住宿', '押金', '房费']
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 6799, name: '住宿', itemStyle: { color: '#409EFF' } },
          { value: 2500, name: '押金', itemStyle: { color: '#67C23A' } },
          { value: 1600, name: '房费', itemStyle: { color: '#E6A23C' } }
        ]
      }
    ]
  })

  // 访问量趋势图表
  const visitChart = echarts.init(document.getElementById('visitChart'))
  visitChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: ['05-01', '05-02', '05-03', '05-04', '05-05', '05-06', '05-07'],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '访问量',
        type: 'line',
        smooth: true,
        data: [50, 30, 60, 40, 90, 70, 30],
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(64, 158, 255, 0.7)'
              },
              {
                offset: 1,
                color: 'rgba(64, 158, 255, 0.1)'
              }
            ]
          }
        }
      }
    ]
  })

  // 性别占比图表
  const genderChart = echarts.init(document.getElementById('genderChart'))
  genderChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: ['男性', '女性']
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 23, name: '男性', itemStyle: { color: '#409EFF' } },
          { value: 12, name: '女性', itemStyle: { color: '#FF9EF8' } }
        ]
      }
    ]
  })

  // 年龄分布图表
  const ageChart = echarts.init(document.getElementById('ageChart'))
  ageChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: ['24岁以下', '25-30岁', '31-35岁', '36-40岁', '41岁以上'],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '人数',
        type: 'bar',
        barWidth: '60%',
        data: [
          { value: 80, itemStyle: { color: '#8378EA' } },
          { value: 30, itemStyle: { color: '#8378EA' } },
          { value: 45, itemStyle: { color: '#8378EA' } },
          { value: 50, itemStyle: { color: '#8378EA' } },
          { value: 25, itemStyle: { color: '#8378EA' } }
        ]
      }
    ]
  })

  // 监听窗口大小变化，调整图表大小
  window.addEventListener('resize', () => {
    orderStatusChart.resize()
    incomeChart.resize()
    visitChart.resize()
    genderChart.resize()
    ageChart.resize()
  })
})
</script>

<style scoped>
.dashboard {
  padding: 0 10px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 15px 0;
  color: #303133;
}

.data-overview {
  margin-bottom: 20px;
}

.data-card {
  height: 120px;
  border-radius: 8px;
  color: white;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.blue-gradient {
  background: linear-gradient(to right, #1890ff, #36cbcb);
}

.cyan-gradient {
  background: linear-gradient(to right, #36cbcb, #4ccb73);
}

.orange-gradient {
  background: linear-gradient(to right, #ff9900, #ed5a65);
}

.purple-gradient {
  background: linear-gradient(to right, #722ed1, #eb2f96);
}

.green-gradient {
  background: linear-gradient(to right, #52c41a, #1890ff);
}

.data-title {
  font-size: 14px;
  opacity: 0.8;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.data-compare {
  font-size: 12px;
  opacity: 0.8;
}

.up {
  color: #52c41a;
}

.down {
  color: #f5222d;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
  height: 350px;
}

.chart-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
}

.chart-tabs {
  margin-bottom: 15px;
}

.chart {
  height: 280px;
}

.rank-list {
  height: 300px;
  overflow-y: auto;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.rank-index {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  margin-right: 12px;
  color: #fff;
  background-color: #c0c4cc;
}

.rank-1 {
  background-color: #f56c6c;
}

.rank-2 {
  background-color: #e6a23c;
}

.rank-3 {
  background-color: #409eff;
}

.rank-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.rank-name {
  font-size: 14px;
  color: #303133;
}

.rank-value {
  font-size: 14px;
  color: #606266;
  font-weight: bold;
}
</style>