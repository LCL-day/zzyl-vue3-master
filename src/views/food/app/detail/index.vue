<template>
  <div v-loading="loading" class="app-page detail-page">
    <div class="nav-bar">
      <el-icon class="back" @click="goBack"><ArrowLeft /></el-icon>
      <span class="nav-title">美食详情</span>
    </div>

    <template v-if="food.id">
      <div class="hero">
        <img v-if="cover" :src="cover" class="hero-img" @error="onImgError($event)" />
        <div v-else class="hero-fallback">
          <el-icon><Bowl /></el-icon>
        </div>
      </div>

      <div class="block">
        <h2 class="title">{{ food.title }}</h2>
        <div class="sub">
          <span v-if="food.categoryName" class="cate">{{ food.categoryName }}</span>
          <span class="author">by {{ food.authorName || '匿名' }}</span>
          <span class="time">{{ food.createTime }}</span>
        </div>
        <p v-if="food.description" class="desc">{{ food.description }}</p>
      </div>

      <div class="block">
        <div class="block-title">做法介绍</div>
        <div class="content">{{ food.content || '作者还没有填写详细内容' }}</div>
      </div>

      <div class="block">
        <div class="block-title">
          评论
          <span class="count">{{ comments.length }}</span>
        </div>
        <el-empty v-if="comments.length === 0" description="还没有评论，来抢沙发吧" :image-size="70" />
        <div v-for="item in topComments" :key="item.id" class="comment">
          <div class="avatar">{{ (item.nickName || '匿').slice(0, 1) }}</div>
          <div class="comment-main">
            <div class="comment-head">
              <span class="nick">{{ item.nickName || '匿名用户' }}</span>
              <span class="time">{{ item.createTime }}</span>
            </div>
            <div class="comment-text">{{ item.content }}</div>
            <div class="comment-ops">
              <span class="op" @click="startReply(item)">回复</span>
              <span v-if="item.replies.length > 0" class="op" @click="toggleReplies(item.id)">
                {{ expanded[item.id] ? '收起回复' : item.replies.length + ' 条回复' }}
              </span>
            </div>
            <div v-if="expanded[item.id]" class="replies">
              <div v-for="reply in item.replies" :key="reply.id" class="reply">
                <span class="reply-to">
                  {{ reply.nickName || '匿名用户' }}
                  <em v-if="reply.parentNickName"> 回复 {{ reply.parentNickName }}</em>
                </span>
                <span class="reply-text">{{ reply.content }}</span>
                <span class="op" @click="startReply(reply)">回复</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-holder"></div>

      <div class="action-bar">
        <div class="action" :class="{ active: food.liked }" @click="handleLike">
          <el-icon><Pointer /></el-icon>
          <span>{{ food.likeCount || 0 }}</span>
        </div>
        <div class="action" :class="{ active: food.favorited }" @click="handleFavorite">
          <el-icon><Star /></el-icon>
          <span>{{ food.favorited ? '已收藏' : '收藏' }}</span>
        </div>
        <el-input
          v-model="commentText"
          class="comment-input"
          :placeholder="replyTarget ? '回复 ' + (replyTarget.nickName || '匿名用户') : '说点什么...'"
          @keyup.enter="submitComment"
        />
        <el-button type="primary" class="send-btn" @click="submitComment">发送</el-button>
      </div>
    </template>

    <el-empty v-else-if="!loading" description="内容不存在或已下架" />
  </div>
</template>

<script setup name="AppFoodDetail">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Pointer, Star, Bowl } from '@element-plus/icons-vue'
import {
  getAppFood, toggleLike, toggleFavorite, listFoodComments, addFoodComment
} from '@/api/food/app'
import { resolveImage } from '@/utils/image'

const route = useRoute()
const router = useRouter()

const foodId = route.params.id
const food = ref({})
const comments = ref([])
const loading = ref(false)
const commentText = ref('')
const replyTarget = ref(null)
const expanded = reactive({})

const cover = computed(() => resolveImage(food.value.image))

// 把评论按父子关系整理成两层结构
const topComments = computed(() => {
  const tops = []
  const map = {}
  comments.value.forEach(item => {
    const node = { ...item, replies: [] }
    map[item.id] = node
    if (!item.parentId || item.parentId === 0) {
      tops.push(node)
    }
  })
  comments.value.forEach(item => {
    if (item.parentId && item.parentId !== 0) {
      const parent = map[item.parentId]
      if (parent) {
        parent.replies.push(item)
      } else if (map[item.id]) {
        tops.push(map[item.id])
      }
    }
  })
  return tops
})

function loadFood() {
  loading.value = true
  getAppFood(foodId).then(res => {
    food.value = res.data || {}
  }).finally(() => {
    loading.value = false
  })
}

function loadComments() {
  listFoodComments(foodId, { pageNum: 1, pageSize: 200 }).then(res => {
    comments.value = res.rows || []
  })
}

function handleLike() {
  toggleLike(foodId).then(res => {
    food.value.liked = res.data.active
    food.value.likeCount = res.data.count
  })
}

function handleFavorite() {
  toggleFavorite(foodId).then(res => {
    food.value.favorited = res.data.active
    food.value.favoriteCount = res.data.count
    ElMessage.success(res.data.active ? '已收藏' : '已取消收藏')
  })
}

function startReply(item) {
  replyTarget.value = item
  commentText.value = ''
  expanded[item.parentId && item.parentId !== 0 ? item.parentId : item.id] = true
}

function toggleReplies(id) {
  expanded[id] = !expanded[id]
}

function submitComment() {
  const content = commentText.value.trim()
  if (!content) {
    ElMessage.warning('请先输入评论内容')
    return
  }
  const parentId = replyTarget.value ? replyTarget.value.id : 0
  addFoodComment({ foodId: Number(foodId), content, parentId }).then(() => {
    ElMessage.success(replyTarget.value ? '回复成功' : '评论成功')
    commentText.value = ''
    replyTarget.value = null
    loadComments()
    loadFood()
  })
}

function onImgError(e) {
  e.target.style.display = 'none'
}

function goBack() {
  router.back()
}

onMounted(() => {
  loadFood()
  loadComments()
})
</script>

<style scoped lang="scss">
.detail-page {
  padding: 0 12px 12px;

  .nav-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 46px;

    .back {
      font-size: 20px;
      cursor: pointer;
      color: #303133;
    }

    .nav-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .hero {
    height: 180px;
    border-radius: 10px;
    overflow: hidden;
    background: #f2f3f5;

    .hero-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .hero-fallback {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 46px;
      background: linear-gradient(135deg, #ffb36b, #ff7a45);
    }
  }

  .block {
    margin-top: 12px;
    padding: 12px;
    background: #fff;
    border-radius: 10px;

    .title {
      margin: 0;
      font-size: 18px;
      color: #303133;
    }

    .sub {
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #909399;

      .cate {
        padding: 1px 8px;
        color: #ff7a45;
        background: #fff2e8;
        border-radius: 8px;
      }
    }

    .desc {
      margin: 8px 0 0;
      font-size: 13px;
      color: #606266;
      line-height: 20px;
    }

    .block-title {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;

      .count {
        margin-left: 4px;
        font-size: 12px;
        font-weight: 400;
        color: #909399;
      }
    }

    .content {
      font-size: 14px;
      line-height: 24px;
      color: #606266;
      white-space: pre-wrap;
    }
  }

  .comment {
    display: flex;
    gap: 8px;
    padding: 10px 0;
    border-bottom: 1px solid #f4f5f7;

    &:last-child {
      border-bottom: none;
    }

    .avatar {
      flex: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7ec8e3, #4a90d9);
      color: #fff;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .comment-main {
      flex: 1;
      min-width: 0;

      .comment-head {
        display: flex;
        justify-content: space-between;
        font-size: 12px;

        .nick {
          color: #4a90d9;
        }

        .time {
          color: #c0c4cc;
        }
      }

      .comment-text {
        margin-top: 3px;
        font-size: 14px;
        color: #303133;
        line-height: 20px;
        word-break: break-all;
      }

      .comment-ops {
        margin-top: 4px;
        display: flex;
        gap: 12px;
      }

      .op {
        font-size: 12px;
        color: #909399;
        cursor: pointer;

        &:hover {
          color: #ff7a45;
        }
      }

      .replies {
        margin-top: 8px;
        padding: 8px;
        background: #f7f8fa;
        border-radius: 8px;

        .reply {
          font-size: 13px;
          line-height: 20px;
          color: #606266;
          padding: 3px 0;

          .reply-to {
            color: #4a90d9;
            margin-right: 4px;

            em {
              color: #909399;
              font-style: normal;
            }
          }

          .reply-text {
            color: #303133;
          }

          .op {
            margin-left: 6px;
          }
        }
      }
    }
  }

  .bottom-holder {
    height: 62px;
  }

  .action-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1001;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #fff;
    border-top: 1px solid #ebedf0;

    .action {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 11px;
      color: #909399;
      cursor: pointer;
      min-width: 40px;

      .el-icon {
        font-size: 19px;
      }

      &.active {
        color: #ff7a45;
      }
    }

    .comment-input {
      flex: 1;
      :deep(.el-input__wrapper) {
        border-radius: 16px;
      }
    }

    .send-btn {
      border-radius: 16px;
    }
  }
}
</style>
