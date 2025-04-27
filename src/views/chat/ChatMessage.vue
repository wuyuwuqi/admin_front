<template>
  <div class="chat-message-container">
    <div class="message-list" ref="messageList">
      <div v-for="(msg, index) in messages" 
           :key="index" 
           class="message" 
           :id="'msg-' + (index + 1)" 
           :class="{
             'my-message': msg.isSelf, 
             'system-message': isSystemMessage(msg), 
             'broadcast-message': isBroadcastMessage(msg)
           }"
      >
        <div class="message-content">
          <span class="message-text">{{ typeof msg === 'object' ? msg.mes : msg }}</span>
          <span v-if="msg.time" class="message-time">{{ msg.time }}</span>
        </div>
      </div>
    </div>
    
    <div class="connection-status" v-if="connectionStatus">
      <span>{{ connectionStatus }}</span>
    </div>
    
    <div class="message-status">
      <span>已接收消息: {{ receivedMessageCount }} 条</span>
      <span v-if="lastReceivedTime">最近接收时间: {{ lastReceivedTime }}</span>
      <span v-else>尚未收到消息</span>
    </div>
    
    <div class="input-area">
      <el-input
        v-model="inputMsg"
        type="text"
        placeholder="请输入消息..."
        @keyup.enter="sendMessage"
      />
      <el-button type="primary" @click="sendMessage" :disabled="!inputMsg.trim()">
        发送
      </el-button>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import axios from 'axios'

export default {
  name: 'ChatMessage',
  
  props: {
    username: {
      type: String,
      default: 'user2'
    },
    chatWith: {
      type: String,
      default: 'user1'
    },
    contactId: {
      type: [Number, String],
      default: 1
    }
  },
  
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // 组件实例创建后的回调
      if (vm.socket && vm.socket.readyState === WebSocket.OPEN) {
        console.log('WebSocket 连接已存在且处于打开状态')
        return
      }
      vm.handleChatChange()
    })
  },
  
  beforeRouteUpdate(to, from, next) {
    // 路由参数更新时的处理
    next()
    this.handleChatChange()
  },
  
  beforeRouteLeave(to, from, next) {
    // 在路由离开时清理连接
    if (this?.socket) {
      console.log('路由离开，清理 WebSocket 连接')
      this.closeConnection()
    }
    next()
  },
  
  data() {
    return {
      inputMsg: '',
      messages: [],
      socket: null,
      userId: 'test-user-' + Math.floor(Math.random() * 1000),
      receivedMessageCount: 0,
      lastReceivedTime: null,
      connectionStatus: '正在连接...',
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      isConnecting: false,
      shouldReconnect: true,
      isConnectionActive: false,
      isLoadingHistory: false
    }
  },

  watch: {
    chatWith: {
      handler(newVal, oldVal) {
        console.log('聊天对象已更改为:', newVal, '原对象:', oldVal)
        if (newVal !== oldVal) {
          this.handleChatChange()
        }
      }
    },
    
    messages: {
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      },
      deep: true
    }
  },
  
  mounted() {
    this.loadHistoryMessages()
    this.handleChatChange()
  },
  
  beforeUnmount() {
    this.closeConnection()
  },
  
  methods: {
    async loadHistoryMessages() {
      if (this.isLoadingHistory) return
      
      this.isLoadingHistory = true
      this.connectionStatus = '正在加载历史消息...'
      
      try {
        const response = await axios({
          method: 'get',
          url: `/chat/messages`,
          params: {
            sender: this.username,
            receiver: this.chatWith
          }
        })
        
        // 新接口格式处理
        const data = response.data
        let allMessages = []
        // 处理自己发送的消息（右侧）
        if (data.sentMessages && Array.isArray(data.sentMessages)) {
          data.sentMessages.forEach(item => {
            if (item.MesArray && Array.isArray(item.MesArray)) {
              item.MesArray.forEach(msg => {
                allMessages.push({
                  mes: msg.mes,
                  time: new Date(msg.time * 1000).toLocaleTimeString(),
                  isSelf: true
                })
              })
            }
          })
        }
        // 处理接收的消息（左侧）
        if (data.receivedMessages && Array.isArray(data.receivedMessages)) {
          data.receivedMessages.forEach(item => {
            if (item.MesArray && Array.isArray(item.MesArray)) {
              item.MesArray.forEach(msg => {
                allMessages.push({
                  mes: msg.mes,
                  time: new Date(msg.time * 1000).toLocaleTimeString(),
                  isSelf: false
                })
              })
            }
          })
        }
        // 按时间排序
        allMessages.sort((a, b) => {
          // 还原时间戳进行排序
          const getTimestamp = (msg) => {
            // time 字段是 toLocaleTimeString 了，无法直接比较，需保留原始时间戳
            // 但接口只给了秒级时间戳，需在 push 时保留
            return msg._timestamp || 0
          }
          return (a._timestamp || 0) - (b._timestamp || 0)
        })
        // 重新生成带原始时间戳的消息
        this.messages = []
        // 重新处理，保留原始时间戳用于排序
        if (data.sentMessages && Array.isArray(data.sentMessages)) {
          data.sentMessages.forEach(item => {
            if (item.MesArray && Array.isArray(item.MesArray)) {
              item.MesArray.forEach(msg => {
                this.messages.push({
                  mes: msg.mes,
                  time: new Date(msg.time * 1000).toLocaleTimeString(),
                  isSelf: true,
                  _timestamp: msg.time
                })
              })
            }
          })
        }
        if (data.receivedMessages && Array.isArray(data.receivedMessages)) {
          data.receivedMessages.forEach(item => {
            if (item.MesArray && Array.isArray(item.MesArray)) {
              item.MesArray.forEach(msg => {
                this.messages.push({
                  mes: msg.mes,
                  time: new Date(msg.time * 1000).toLocaleTimeString(),
                  isSelf: false,
                  _timestamp: msg.time
                })
              })
            }
          })
        }
        // 按时间戳排序
        this.messages.sort((a, b) => a._timestamp - b._timestamp)
        // 移除 _timestamp 字段
        this.messages = this.messages.map(msg => {
          const { _timestamp, ...rest } = msg
          return rest
        })
        this.receivedMessageCount = this.messages.length
        this.lastReceivedTime = this.messages.length > 0 ? this.messages[this.messages.length - 1].time : null
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      } catch (error) {
        console.error('加载历史消息失败:', error)
        this.messages.push({
          content: '[系统] 加载历史消息失败',
          isSystem: true
        })
      } finally {
        this.isLoadingHistory = false
        // this.connectionStatus = '正在连接...'
      }
    },

    handleChatChange() {
      this.closeConnection()
      this.messages = []
      this.receivedMessageCount = 0
      this.lastReceivedTime = null
      this.reconnectAttempts = 0
      this.shouldReconnect = false
      this.isConnectionActive = false
      
      // 先加载历史消息，再显示连接状态
      this.loadHistoryMessages().then(() => {
        this.messages.push({
          content: '[系统] 正在连接聊天服务器...',
          isSystem: true
        })
        this.connectWebSocket()
      })
    },

    closeConnection() {
      if (this.socket && this.isConnectionActive) {
        console.log('关闭与', this.chatWith, '的连接')
        this.shouldReconnect = false
        this.isConnectionActive = false
        this.socket.close()
        this.socket = null
      }
      this.isConnecting = false
    },

    connectWebSocket() {
      if (this.isConnecting || this.isConnectionActive) {
        console.log('已存在活动连接或正在连接中，跳过连接')
        return
      }

      this.isConnecting = true
      this.connectionStatus = '正在连接...'
      
      try {
        console.log('开始建立新连接:', this.username, this.chatWith)
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${wsProtocol}//${window.location.host}/ws?username=${this.username}&chatWith=${this.chatWith}`
        console.log('WebSocket 连接地址:', wsUrl)
        this.socket = new WebSocket(wsUrl)
        
        this.socket.onopen = () => {
          console.log('WebSocket连接已打开')
          this.connectionStatus = '已连接'
          this.isConnecting = false
          this.isConnectionActive = true
          this.reconnectAttempts = 0
          this.messages.push({
            content: '[系统] 已连接到聊天服务器',
            isSystem: true
          })
        }
        
        this.socket.onmessage = (event) => {
          console.log('收到消息:', event.data)
          // 解析接收到的 JSON 消息
          const messageData = JSON.parse(event.data)
          // 接收到的消息标记为对方发送的
          this.messages.push({
            mes: messageData.mes,
            isSelf: false,
            time: new Date().toLocaleTimeString()
          })
          this.receivedMessageCount++
          this.lastReceivedTime = new Date().toLocaleTimeString()
        }
        
        this.socket.onerror = (error) => {
          console.error('WebSocket错误:', error)
          this.connectionStatus = '连接错误，正在重试...'
          // 添加更详细的错误日志
          console.log('WebSocket 错误详情:', {
            readyState: this.socket?.readyState,
            url: this.socket?.url,
            protocol: this.socket?.protocol,
            bufferedAmount: this.socket?.bufferedAmount
          })
          this.tryReconnect()
        }
        
        this.socket.onclose = (event) => {
          console.log('WebSocket连接已关闭，代码:', event.code, '原因:', event.reason || '无原因')
          this.isConnectionActive = false
          this.isConnecting = false
          
          if (this.shouldReconnect && event.code !== 1000 && event.code !== 1005) {
            console.log('尝试重新连接...')
            this.tryReconnect()
          } else {
            this.connectionStatus = '连接已关闭'
            this.messages.push({
              content: `[系统] 连接已关闭 (代码: ${event.code}, 原因: ${event.reason || '无原因'})`,
              isSystem: true
            })
          }
        }
        
      } catch (error) {
        console.error('创建WebSocket连接失败:', error)
        this.connectionStatus = '连接失败'
        this.isConnecting = false
        this.isConnectionActive = false
      }
    },
    
    tryReconnect() {
      if (!this.shouldReconnect || this.isConnectionActive || this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('跳过重连：', {
          shouldReconnect: this.shouldReconnect,
          isConnectionActive: this.isConnectionActive,
          reconnectAttempts: this.reconnectAttempts
        })
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.connectionStatus = '连接失败，请刷新页面重试'
        }
        return
      }

      this.reconnectAttempts++
      console.log(`尝试第 ${this.reconnectAttempts} 次重连...`)
      
      setTimeout(() => {
        if (!this.isConnectionActive && this.shouldReconnect) {
          this.connectWebSocket()
        }
      }, 3000)
    },
    
    sendMessage() {
      if (this.inputMsg.trim()) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
          this.$message.error('未连接到服务器')
          return
        }
        
        const message = {
          username: this.username,
          chatWith: this.chatWith,
          time: Date.now(),
          mes: this.inputMsg.trim()
        }
        
        try {
          this.socket.send(JSON.stringify(message))
          // 添加到本地消息列表时，标记为自己发送的消息
          this.messages.push({
            mes: message.mes,
            isSelf: true,
            time: new Date(message.time).toLocaleTimeString()
          })
          this.inputMsg = ''
        } catch (error) {
          console.error('发送消息失败:', error)
          this.$message.error('发送失败')
        }
      }
    },
    
    scrollToBottom() {
      const messageList = this.$refs.messageList
      if (messageList) {
        messageList.scrollTop = messageList.scrollHeight
      }
    },
    
    isMine(index) {
      const msg = this.messages[index]
      return msg && msg.isSelf === true
    },
    
    isSystemMessage(msg) {
      return msg.isSystem === true || (typeof msg === 'string' && msg.startsWith('[系统]'))
    },
    
    isBroadcastMessage(msg) {
      return !msg.isSelf && !msg.isSystem
    }
  }
}
</script>

<style scoped>
.chat-message-container {
  display: flex;
  flex-direction: column;
  height: calc(100% - 60px);
  background-color: #f5f7fa;
}

.message-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.message {
  margin-bottom: 16px;
  display: flex;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
}

.message-text {
  word-break: break-word;
  line-height: 1.5;
}

.message-time {
  position: absolute;
  bottom: -20px;
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.my-message {
  justify-content: flex-end;
}

.my-message .message-content {
  background-color: #95ec69;
}

.my-message .message-time {
  right: 0;
}

.system-message .message-content {
  background-color: #f0f0f0;
  color: #666;
  font-style: italic;
  margin: 8px auto;
}

.broadcast-message .message-content {
  background-color: #e3f2fd;
  color: #0d47a1;
}

.broadcast-message .message-time {
  left: 0;
}

.connection-status {
  text-align: center;
  padding: 8px;
  font-size: 12px;
  color: #666;
  background-color: #fff;
  border-top: 1px solid #eee;
}

.message-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  font-size: 12px;
  color: #666;
  background-color: #f0f0f0;
  border-top: 1px solid #eee;
}

.input-area {
  display: flex;
  gap: 12px;
  padding: 16px;
  background-color: white;
  border-top: 1px solid #eee;
}

.input-area .el-input {
  flex: 1;
}

.input-area .el-button {
  width: 80px;
}
</style> 