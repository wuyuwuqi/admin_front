<template>
  <div class="chat-page">
    <h1>消息中心</h1>
    <div class="chat-container">
      <!-- 左侧联系人列表 -->
      <div class="contact-list">
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索联系人"
            prefix-icon="Search"
            clearable
          />
        </div>
        <div class="new-chat-btn">
          <el-button type="success" size="large" round>
            <el-icon><Plus /></el-icon> 新建会话
          </el-button>
        </div>
        <div class="contact-items">
          <div 
            v-for="contact in filteredContacts" 
            :key="contact.id"
            class="contact-item"
            :class="{ 'active': currentContact && currentContact.id === contact.id }"
            @click="selectContact(contact)"
          >
            <div class="avatar">
              <el-avatar :size="40" :src="contact.avatar">
                {{ contact.name.charAt(0) }}
              </el-avatar>
              <div class="status-indicator" :class="contact.online ? 'online' : 'offline'"></div>
            </div>
            <div class="contact-info">
              <div class="contact-header">
                <span class="contact-name">{{ contact.name }}</span>
                <span class="message-time">{{ contact.lastMessageTime }}</span>
              </div>
              <div class="last-message">{{ contact.lastMessage }}</div>
            </div>
            <div class="unread-badge" v-if="contact.unreadCount > 0">
              {{ contact.unreadCount }}
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧聊天区域 -->
      <div class="chat-area">
        <template v-if="currentContact">
          <!-- 聊天头部 -->
          <div class="chat-header">
            <div class="contact-name">
              {{ currentContact.name }}
              <span class="online-status" v-if="currentContact.online">● 在线</span>
            </div>
          </div>

          <!-- 使用ChatMessage组件 -->
          <ChatMessage 
            :username="username"
            :chatWith="currentContact.name"
            :contactId="currentContact.id"
          />
        </template>

        <!-- 未选择联系人时的提示 -->
        <div v-else class="no-contact-selected">
          <el-empty description="请选择一个联系人开始聊天" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Plus, Position } from '@element-plus/icons-vue'
import LandlordStorage from '../utils/LandlordStorage'
import ChatMessage from './chat/ChatMessage.vue'

const router = useRouter()

// 用户信息
const username = ref(LandlordStorage.getUserInfo()?.username || '管理员')
const userAvatar = ref('')

// 搜索关键词
const searchKeyword = ref('')

// 联系人列表
const contacts = ref([
  {
    id: 1,
    name: '张三',
    avatar: '',
    online: true,
    lastMessage: '您好，我想咨询一下关于民宿的问题',
    lastMessageTime: '12:32',
    unreadCount: 2
  },
  {
    id: 2,
    name: '李四',
    avatar: '',
    online: true,
    lastMessage: '好的，我知道了，谢谢您的解答！',
    lastMessageTime: '昨天',
    unreadCount: 0
  },
  {
    id: 3,
    name: '小强',
    avatar: '',
    online: false,
    lastMessage: '请问民宿有提供早餐吗？',
    lastMessageTime: '16:47',
    unreadCount: 1
  },
  {
    id: 4,
    name: '社区网络',
    avatar: '',
    online: true,
    lastMessage: '@张三 有问题请联系我',
    lastMessageTime: '周三',
    unreadCount: 0
  }
])

// 根据搜索关键词过滤联系人
const filteredContacts = computed(() => {
  if (!searchKeyword.value) {
    return contacts.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return contacts.value.filter(contact => 
    contact.name.toLowerCase().includes(keyword) ||
    contact.lastMessage.toLowerCase().includes(keyword)
  )
})

// 当前选中的联系人
const currentContact = ref(null)

// 选择联系人
const selectContact = (contact) => {
  currentContact.value = contact
  // 清除未读消息计数
  if (contact.unreadCount > 0) {
    contact.unreadCount = 0
  }
  // 滚动到最新消息
  nextTick(() => {
    scrollToBottom()
  })
}

// 消息输入
const messageInput = ref('')

// 模拟消息数据
const messagesByContact = ref({
  1: [
    { content: '您好，我想咨询一下关于民宿的问题', time: '12:32', isSelf: false, date: '今天' },
    { content: '好的，请问您有什么需要了解的？', time: '12:33', isSelf: true, date: '今天' },
    { content: '我想了解一下民宿的价格和设施', time: '12:35', isSelf: false, date: '今天' },
    { content: '我们的民宿价格在200-500元/晚，设施包括空调、热水器、WiFi等基本设施，部分房型还有独立阳台和厨房。', time: '12:36', isSelf: true, date: '今天' },
  ],
  2: [
    { content: '您好，请问有双人间吗？', time: '昨天 10:15', isSelf: false, date: '昨天' },
    { content: '有的，我们有多种类型的双人间可供选择', time: '昨天 10:20', isSelf: true, date: '昨天' },
    { content: '好的，我知道了，谢谢您的解答！', time: '昨天 10:25', isSelf: false, date: '昨天' },
  ],
  3: [
    { content: '请问民宿有提供早餐吗？', time: '16:47', isSelf: false, date: '今天' },
  ],
  4: [
    { content: '欢迎加入社区网络群', time: '周三 09:30', isSelf: false, date: '周三' },
    { content: '@张三 有问题请联系我', time: '周三 09:35', isSelf: false, date: '周三' },
    { content: '好的，谢谢', time: '周三 09:40', isSelf: true, date: '周三' },
  ]
})

// 获取当前联系人的消息
const currentMessages = computed(() => {
  if (!currentContact.value) return []
  return messagesByContact.value[currentContact.value.id] || []
})

// 获取消息日期分组
const messageDates = computed(() => {
  if (!currentMessages.value.length) return []
  const dates = new Set()
  currentMessages.value.forEach(msg => {
    if (msg.date) dates.add(msg.date)
  })
  return Array.from(dates)
})

// 消息容器引用
const messageContainer = ref(null)

// 滚动到底部
const scrollToBottom = () => {
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

// 发送消息
const sendMessage = () => {
  if (!messageInput.value.trim() || !currentContact.value) return
  
  // 创建新消息对象
  const newMessage = {
    content: messageInput.value,
    time: formatTime(new Date()),
    isSelf: true,
    date: '今天'
  }
  
  // 添加到当前联系人的消息列表
  const contactId = currentContact.value.id
  if (!messagesByContact.value[contactId]) {
    messagesByContact.value[contactId] = []
  }
  messagesByContact.value[contactId].push(newMessage)
  
  // 更新联系人的最后一条消息
  const contact = contacts.value.find(c => c.id === contactId)
  if (contact) {
    contact.lastMessage = messageInput.value
    contact.lastMessageTime = '刚刚'
  }
  
  // 清空输入框
  messageInput.value = ''
  
  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
  
  // 模拟对方回复
  setTimeout(() => {
    simulateReply(contactId)
  }, 1000 + Math.random() * 2000)
}

// 模拟对方回复
const simulateReply = (contactId) => {
  const replies = [
    '好的，我明白了',
    '谢谢您的解答',
    '还有其他问题想请教一下',
    '这个价格可以接受',
    '请问有优惠活动吗？',
    '我需要再考虑一下'
  ]
  
  const randomReply = replies[Math.floor(Math.random() * replies.length)]
  
  const replyMessage = {
    content: randomReply,
    time: formatTime(new Date()),
    isSelf: false,
    date: '今天'
  }
  
  messagesByContact.value[contactId].push(replyMessage)
  
  // 更新联系人的最后一条消息
  const contact = contacts.value.find(c => c.id === contactId)
  if (contact) {
    contact.lastMessage = randomReply
    contact.lastMessageTime = '刚刚'
  }
  
  // 如果当前正在查看这个联系人的消息，滚动到底部
  if (currentContact.value && currentContact.value.id === contactId) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 格式化时间
const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 监听当前联系人变化，滚动到底部
watch(currentContact, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

// 组件挂载后滚动到底部
onMounted(() => {
  // 默认选中第一个联系人
  if (contacts.value.length > 0) {
    selectContact(contacts.value[0])
  }
})
</script>

<style scoped>
.chat-page {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

h1 {
  margin-bottom: 20px;
  color: #303133;
}

.chat-container {
  display: flex;
  height: calc(100% - 60px);
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 联系人列表样式 */
.contact-list {
  width: 280px;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.search-box {
  padding: 16px;
  border-bottom: 1px solid #e6e6e6;
}

.new-chat-btn {
  padding: 10px 16px;
  border-bottom: 1px solid #e6e6e6;
}

.contact-items {
  flex: 1;
  overflow-y: auto;
}

.contact-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;
}

.contact-item:hover {
  background-color: #ecf5ff;
}

.contact-item.active {
  background-color: #ecf5ff;
}

.avatar {
  position: relative;
  margin-right: 12px;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #f5f7fa;
}

.status-indicator.online {
  background-color: #67c23a;
}

.status-indicator.offline {
  background-color: #909399;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.contact-name {
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

.last-message {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-badge {
  background-color: #f56c6c;
  color: white;
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
}

/* 聊天区域样式 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.chat-header {
  padding: 16px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-header .contact-name {
  font-size: 16px;
  font-weight: 500;
}

.online-status {
  font-size: 12px;
  color: #67c23a;
  margin-left: 8px;
  font-weight: normal;
}

.message-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background-color: #f5f7fa;
}

.empty-messages,
.no-contact-selected {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-divider {
  display: flex;
  align-items: center;
  margin: 16px 0;
  color: #909399;
  font-size: 12px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #e6e6e6;
}

.divider-text {
  padding: 0 16px;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.self-message {
  flex-direction: row-reverse;
}

.message-avatar {
  margin-right: 12px;
}

.self-avatar {
  margin-right: 0;
  margin-left: 12px;
}

.message-content {
  max-width: 70%;
}

.message-bubble {
  padding: 10px 16px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  word-break: break-word;
  line-height: 1.5;
}

.self-content .message-bubble {
  background-color: #95ec69;
  color: #303133;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  text-align: left;
}

.self-content .message-time {
  text-align: right;
}

.message-input-area {
  padding: 16px;
  border-top: 1px solid #e6e6e6;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.hint {
  font-size: 12px;
  color: #909399;
}
</style>