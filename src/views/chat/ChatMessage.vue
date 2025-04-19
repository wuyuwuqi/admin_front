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
export default {
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
      maxReconnectAttempts: 5
    }
  },
  
  watch: {
    chatWith: {
      handler(newVal) {
        console.log('聊天对象已更改为:', newVal)
        this.messages = []
        this.receivedMessageCount = 0
        this.lastReceivedTime = null
        this.connectWebSocket()
      },
      immediate: true
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
    this.connectWebSocket()
    this.messages.push({
      content: '[系统] 正在连接聊天服务器...',
      isSystem: true
    })
  },
  
  beforeUnmount() {
    if (this.socket) {
      this.socket.close()
    }
  },
  
  methods: {
    connectWebSocket() {
      this.connectionStatus = '正在连接...'
      
      try {
        this.socket = new WebSocket(`ws://localhost:9090/ws?username=${this.username}&chatWith=${this.chatWith}`)
        
        this.socket.onopen = () => {
          console.log('WebSocket连接已打开')
          this.connectionStatus = '已连接'
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
          this.tryReconnect()
        }
        
        this.socket.onclose = () => {
          console.log('WebSocket连接已关闭')
          this.connectionStatus = '连接已关闭，正在重试...'
          this.tryReconnect()
        }
        
      } catch (error) {
        console.error('创建WebSocket连接失败:', error)
        this.connectionStatus = '连接失败，正在重试...'
        this.tryReconnect()
      }
    },
    
    tryReconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        setTimeout(() => {
          this.connectWebSocket()
        }, 3000)
      } else {
        this.connectionStatus = '连接失败，请刷新页面重试'
      }
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