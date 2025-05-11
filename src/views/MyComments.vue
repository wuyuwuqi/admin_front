<template>
  <div class="my-comments-page">
    <h1>我的评论</h1>
    <el-card>
      <div v-for="comment in comments" :key="comment.id" style="margin-bottom: 32px;">
        <el-card class="comment-card" shadow="never">
          <div class="comment-user-id">用户ID：{{ comment.userId }}</div>
          <div class="comment-status">
            <el-tag v-if="comment.reportStatus === 'reported'" type="danger">已举报</el-tag>
            <el-tag v-else-if="comment.reportStatus === 'normal'" type="success">正常</el-tag>
            <span v-else>--</span>
          </div>
          <div class="comment-keywords-top
          ic-row">
            <div class="comment-keywords">
              <el-tag v-for="(kw, idx) in comment.keywords" :key="idx" type="info" style="margin-right: 4px;">{{ kw }}</el-tag>
            </div>
            <div class="comment-topic-wrapper">
              <el-tag type="success" effect="plain" class="comment-topic">{{ comment.topic }}</el-tag>
            </div>
          </div>
          <div class="comment-header">
            <el-rate v-model="comment.rating" :max="5" disabled size="small" style="margin-right: 10px;" />
            <span class="comment-time">{{ formatDate(comment.timestamp) }}</span>
          </div>
          <div class="comment-content">{{ comment.commentText }}</div>
          <div class="comment-media">
            <template v-if="comment.mediaUrl">
              <el-image v-if="isImage(comment.mediaUrl)" :src="comment.mediaUrl" style="width: 60px; height: 40px;" fit="cover" :preview-src-list="[comment.mediaUrl]" />
              <video v-else controls style="width: 60px; height: 40px;">
                <source :src="comment.mediaUrl" />
              </video>
            </template>
          </div>
          <div class="reply-card-wrapper">
            <el-card v-if="comment.commentResponses && comment.commentResponses.length" class="reply-card" shadow="never">
              <div v-for="(resp, idx) in comment.commentResponses" :key="idx" class="reply-content">
                <el-tag type="info">{{ resp.responseUserName }}</el-tag>
                <span style="margin-left: 6px;">{{ resp.responseContent }}</span>
                <span style="color: #999; margin-left: 8px; font-size: 12px;">{{ formatDate(resp.createTime) }}</span>
              </div>
              <div class="reply-btn-box">
                <el-button size="small" class="reply-btn" @click.stop="openReplyDialog(comment)">
                  <el-icon style="vertical-align: middle; margin-right: 4px;"><i class="el-icon-chat-dot-round"></i></el-icon>
                  回复
                </el-button>
              </div>
            </el-card>
            <el-card v-else class="reply-card" shadow="never">
              <div class="reply-content">暂无回复</div>
              <div class="reply-btn-box">
                <el-button size="small" class="reply-btn" @click.stop="openReplyDialog(comment)">
                  <el-icon style="vertical-align: middle; margin-right: 4px;"><i class="el-icon-chat-dot-round"></i></el-icon>
                  回复
                </el-button>
              </div>
            </el-card>
          </div>
          <div v-if="comment.orderId" class="comment-order-id">订单ID：{{ comment.orderId }}</div>
        </el-card>
      </div>
    </el-card>
    <el-dialog v-model="replyDialogVisible" title="回复评论" width="400px">
      <el-input
        v-model="replyContent"
        type="textarea"
        rows="4"
        placeholder="请输入回复内容"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="replyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleReplySubmit">提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import LandlordStorage from '../utils/LandlordStorage'

const comments = ref([])
const loading = ref(false)

// 回复对话框相关
const replyDialogVisible = ref(false)
const replyContent = ref('')
const replyTarget = ref(null)

const openReplyDialog = (row) => {
  replyTarget.value = row
  replyContent.value = ''
  replyDialogVisible.value = true
}

const handleReplySubmit = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  if (!replyTarget.value) return
  try {
    // 获取当前用户信息
    const userInfo = LandlordStorage.getUserInfo() || {}
    const responseUserId = userInfo.id || 'user_001'
    const responseUserName = userInfo.name || '商家'
    const now = new Date()
    // 转为北京时间（东八区），格式yyyy-MM-ddTHH:mm:ss
    const pad = n => n < 10 ? '0' + n : n
    const year = now.getFullYear()
    const month = pad(now.getMonth() + 1)
    const day = pad(now.getDate())
    const hour = pad(now.getHours())
    const minute = pad(now.getMinutes())
    const second = pad(now.getSeconds())
    const createTime = `${year}-${month}-${day}T${hour}:${minute}:${second}`
    const dataObj = {
      responseUserId,
      responseUserName,
      responseContent: replyContent.value,
      createTime
    }
    console.log('构造 回复评论消息 的数据:', dataObj)
    const commentId = replyTarget.value.id
    const res = await axios({
      method: 'post',
      url: `/comments/addCommentResponse?id=${commentId}`,
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(dataObj)
    })
    if (res.data && res.data.code === 200) {
      ElMessage.success('回复成功')
      replyDialogVisible.value = false
      fetchComments()
    } else {
      ElMessage.error(res.data.message || '回复失败')
    }
  } catch (e) {
    ElMessage.error('回复失败')
  }
}

// 判断媒体类型
const isImage = (url) => {
  return url && (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.gif'))
}

// 格式化时间
const formatDate = (dateStr) => {
  if (!dateStr) return '--'
  const d = new Date(dateStr)
  return d.toLocaleString('zh-CN', { hour12: false })
}

const fetchComments = async () => {
  loading.value = true
  try {
    // 实际项目中应从登录信息获取landlordId
    const landlordId = 2
    const response = await axios.get(`/comments/byLandlordId?landlordId=${landlordId}`)
    if (response.data && response.data.code === 200) {
      // 兼容commentResponses为null、对象、数组
      comments.value = (response.data.data || []).map(item => {
        let responses = item.commentResponses
        if (!responses) return { ...item, commentResponses: [] }
        if (!Array.isArray(responses)) responses = [responses]
        // 兼容responseContent为字符串
        responses = responses.map(r => ({
          ...r,
          responseContent: r && typeof r.responseContent === 'string' ? r.responseContent : ''
        }))
        return { ...item, commentResponses: responses }
      })
    } else {
      ElMessage.error(response.data.message || '获取评论失败')
    }
  } catch (e) {
    ElMessage.error('获取评论失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchComments()
})
</script>

<style scoped>
.my-comments-page {
  padding: 20px;
}

.reply-btn {
  background: #e6f9ea;
  color: #21b66f;
  border-radius: 12px;
  border: none;
  font-weight: 500;
  padding: 0 10px;
  height: 26px;
  min-width: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background 0.2s;
  text-align: center;
  vertical-align: middle;
  line-height: 26px;
}
.reply-btn:hover {
  background: #c8f5d6;
  color: #179c53;
}

.reply-card-wrapper {
  position: relative;
  width: 45%;
  margin-left: 0;
  margin-right: auto;
}
.reply-card {
  padding: 10px 12px 36px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  min-height: 48px;
  box-sizing: border-box;
  margin-bottom: 0;
}
.reply-content {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.reply-btn-box {
  position: absolute;
  right: 16px;
  bottom: 10px;
}

.comment-status {
  position: absolute;
  top: 10px;
  right: 18px;
  z-index: 2;
}
.comment-card {
  margin-bottom: 0;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e4e7ed;
  padding: 16px 18px 18px 18px;
  position: relative;
  min-height: 120px;
}
.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.comment-time {
  color: #999;
  font-size: 13px;
}
.comment-content {
  font-size: 15px;
  margin-bottom: 32px;
  color: #333;
}
.comment-keywords-topic-row {
  margin: 38px 0 24px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  position: absolute;
  top: 38px;
  right: 18px;
  z-index: 1;
  pointer-events: none;
}
.comment-keywords-topic-row > * {
  pointer-events: auto;
}
.comment-keywords {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 0;
}
.comment-topic-wrapper {
  display: flex;
  justify-content: flex-end;
}
.comment-topic {
  color: #21b66f;
  font-size: 13px;
  text-align: right;
  margin-top: 3px;
  white-space: nowrap;
  border-radius: 8px;
  padding: 0 10px;
  background: #f3fcf6;
  border: 1px solid #b7ebc6;
}
.comment-media {
  min-width: 70px;
}
.comment-user-id {
  position: absolute;
  top: 10px;
  left: 18px;
  color: #888;
  font-size: 15px;
  font-weight: 500;
  z-index: 2;
}
.comment-order-id {
  position: absolute;
  right: 18px;
  bottom: 12px;
  color: #aaa;
  font-size: 13px;
  z-index: 2;
}
</style> 