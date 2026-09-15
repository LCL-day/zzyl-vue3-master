<template>
  <div class="app-page">
    <!-- 用户信息 -->
    <div class="user-card">
      <div class="avatar">
        <img v-if="avatarUrl" :src="avatarUrl" class="avatar-img" @error="onImgError($event)" />
        <span v-else>{{ (profile.nickName || profile.userName || 'U').slice(0, 1) }}</span>
      </div>
      <div class="user-info">
        <div class="nick">{{ profile.nickName || profile.userName || '未登录' }}</div>
        <div class="account">账号：{{ profile.userName || '-' }}</div>
      </div>
      <el-button class="logout" size="small" @click="handleLogout">退出</el-button>
    </div>

    <!-- 统计 -->
    <div class="stat-row">
      <div class="stat" @click="switchTab('published')">
        <div class="num">{{ profile.publishedCount || 0 }}</div>
        <div class="label">我的发布</div>
      </div>
      <div class="stat" @click="router.push('/app/favorite')">
        <div class="num">{{ profile.favoriteCount || 0 }}</div>
        <div class="label">我的收藏</div>
      </div>
      <div class="stat" @click="switchTab('mine')">
        <div class="num">{{ profile.commentCount || 0 }}</div>
        <div class="label">我的评论</div>
      </div>
      <div class="stat" @click="switchTab('received')">
        <div class="num">{{ profile.receivedCount || 0 }}</div>
        <div class="label">收到评论</div>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="tabs-card">
      <el-tabs v-model="activeTab" @tab-change="onTabChange">
        <el-tab-pane label="我的发布" name="published">
          <div v-loading="loading.published" class="fav-list">
            <div v-for="item in published" :key="item.id" class="fav-item" @click="goDetail(item.id)">
              <div class="thumb">
                <img v-if="resolveImage(item.image)" :src="resolveImage(item.image)" class="thumb-img" @error="onImgError($event)" />
                <div v-else class="thumb-fallback">{{ (item.title || '美').slice(0, 1) }}</div>
              </div>
              <div class="info">
                <div class="title">{{ item.title }}</div>
                <div class="desc">{{ item.description || '暂无简介' }}</div>
                <div class="meta">
                  <span v-if="item.categoryName" class="cate">{{ item.categoryName }}</span>
                  <span class="num"><el-icon><Pointer /></el-icon>{{ item.likeCount || 0 }}</span>
                  <span class="num"><el-icon><Star /></el-icon>{{ item.favoriteCount || 0 }}</span>
                  <span class="num"><el-icon><ChatDotRound /></el-icon>{{ item.commentCount || 0 }}</span>
                </div>
              </div>
              <div class="ops">
                <el-button class="op-btn" size="small" @click.stop="editPublished(item)">编辑</el-button>
                <el-button class="op-btn" size="small" type="danger" plain @click.stop="deletePublished(item)">删除</el-button>
              </div>
            </div>
          </div>
          <el-empty v-if="!loading.published && published.length === 0" description="还没有发布内容" :image-size="70" />
        </el-tab-pane>

        <el-tab-pane label="我的评论" name="mine">
          <div v-loading="loading.mine" class="comment-list">
            <div v-for="item in myComments" :key="item.id" class="comment-item">
              <div class="comment-top">
                <span class="food" @click="goDetail(item.foodId)">{{ item.foodTitle || '内容已删除' }}</span>
                <span class="time">{{ item.createTime }}</span>
              </div>
              <div class="comment-body">
                <span v-if="item.parentId && item.parentId !== 0" class="reply-flag">
                  回复 {{ item.parentNickName || '匿名用户' }}：
                </span>
                {{ item.content }}
              </div>
              <div v-if="item.parentContent" class="quote">原评论：{{ item.parentContent }}</div>
            </div>
          </div>
          <el-empty v-if="!loading.mine && myComments.length === 0" description="还没有发表过评论" :image-size="70" />
        </el-tab-pane>

        <el-tab-pane label="收到评论" name="received">
          <div v-loading="loading.received" class="comment-list">
            <div v-for="item in receivedComments" :key="item.id" class="comment-item">
              <div class="comment-top">
                <span class="nick">{{ item.nickName || '匿名用户' }}</span>
                <span class="time">{{ item.createTime }}</span>
              </div>
              <div class="comment-body">{{ item.content }}</div>
              <div class="comment-foot">
                评论了你的
                <span class="food" @click="goDetail(item.foodId)">《{{ item.foodTitle }}》</span>
              </div>
            </div>
          </div>
          <el-empty v-if="!loading.received && receivedComments.length === 0" description="还没有收到评论" :image-size="70" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup name="AppMine">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Pointer, Star, ChatDotRound } from '@element-plus/icons-vue'
import useUserStore from '@/store/modules/user'
import {
  getAppProfile, listMine, removeMine, listProfileComments
} from '@/api/food/app'
import { resolveImage } from '@/utils/image'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const profile = ref({})
const activeTab = ref('published')
const published = ref([])
const myComments = ref([])
const receivedComments = ref([])

const loading = reactive({
  published: false,
  mine: false,
  received: false
})

const loaded = reactive({
  mine: false,
  received: false
})

const avatarUrl = computed(() => resolveImage(profile.value.avatar))

function loadProfile() {
  getAppProfile().then(res => {
    profile.value = res.data || {}
  })
}

function loadPublished() {
  loading.published = true
  listMine({ pageNum: 1, pageSize: 50 }).then(res => {
    published.value = res.rows || []
  }).finally(() => {
    loading.published = false
  })
}

function loadComments(type) {
  const key = type === 'received' ? 'received' : 'mine'
  loading[key] = true
  listProfileComments(type, { pageNum: 1, pageSize: 50 }).then(res => {
    const rows = res.rows || []
    if (key === 'received') {
      receivedComments.value = rows
    } else {
      myComments.value = rows
    }
    loaded[key] = true
  }).finally(() => {
    loading[key] = false
  })
}

function onTabChange(name) {
  if (name === 'published') {
    loadPublished()
  } else if (!loaded[name]) {
    loadComments(name)
  }
}

function switchTab(name) {
  activeTab.value = name
  onTabChange(name)
}

function goDetail(id) {
  if (id) {
    router.push('/app/detail/' + id)
  }
}

function deletePublished(item) {
  ElMessageBox.confirm('确认删除「' + item.title + '」？删除后不可恢复', '提示', { type: 'warning' }).then(() => {
    removeMine(item.id).then(() => {
      ElMessage.success('已删除')
      loadPublished()
      loadProfile()
    })
  }).catch(() => {})
}

// 编辑：跳到发布页的编辑模式（带内容 id）
function editPublished(item) {
  router.push({ path: '/app/publish', query: { id: item.id } })
}

function handleLogout() {
  ElMessageBox.confirm('确认退出登录？', '提示', { type: 'warning' }).then(() => {
    userStore.logOut().then(() => {
      router.push('/login')
    })
  }).catch(() => {})
}

function onImgError(e) {
  e.target.style.display = 'none'
}

// 从发布/详情等页面返回时重新拉取，避免统计与列表停留在旧数据
watch(
  () => route.path,
  (path) => {
    if (path === '/app/mine') {
      loadProfile()
      loadPublished()
      if (activeTab.value !== 'published' && loaded[activeTab.value]) {
        loadComments(activeTab.value)
      }
    }
  }
)

onMounted(() => {
  loadProfile()
  loadPublished()
})
</script>

<style scoped lang="scss">
.app-page {
  padding: 8px 12px 12px;

  .user-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 14px;
    border-radius: 10px;
    background: linear-gradient(135deg, #ffb36b, #ff7a45);

    .avatar {
      flex: none;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.35);
      color: #fff;
      font-size: 22px;
      display: flex;
      align-items: center;
      justify-content: center;

      .avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
    }

    .user-info {
      flex: 1;
      min-width: 0;
      color: #fff;

      .nick {
        font-size: 17px;
        font-weight: 600;
      }

      .account {
        margin-top: 3px;
        font-size: 12px;
        opacity: 0.9;
      }
    }

    .logout {
      flex: none;
    }
  }

  .stat-row {
    display: flex;
    margin-top: 10px;
    padding: 12px 0;
    background: #fff;
    border-radius: 10px;

    .stat {
      flex: 1;
      text-align: center;
      cursor: pointer;

      .num {
        font-size: 17px;
        font-weight: 600;
        color: #303133;
      }

      .label {
        margin-top: 2px;
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .tabs-card {
    margin-top: 10px;
    padding: 6px 12px 12px;
    background: #fff;
    border-radius: 10px;
  }

  .fav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid #f4f5f7;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    .thumb {
      flex: none;
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      background: #f2f3f5;

      .thumb-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .thumb-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 20px;
        background: linear-gradient(135deg, #ffb36b, #ff7a45);
      }
    }

    .info {
      flex: 1;
      min-width: 0;

      .title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .desc {
        margin-top: 3px;
        font-size: 12px;
        color: #909399;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .meta {
        margin-top: 5px;
        display: flex;
        align-items: center;
        gap: 9px;
        font-size: 12px;
        color: #a8abb2;

        .cate {
          padding: 1px 7px;
          color: #ff7a45;
          background: #fff2e8;
          border-radius: 8px;
        }

        .num {
          display: flex;
          align-items: center;
          gap: 2px;
        }
      }
    }

    .ops {
      flex: none;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .op-btn {
        margin-left: 0;
        width: 52px;
      }
    }
  }

  .comment-list {
    min-height: 60px;

    .comment-item {
      padding: 10px 0;
      border-bottom: 1px solid #f4f5f7;

      &:last-child {
        border-bottom: none;
      }

      .comment-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;

        .food {
          color: #4a90d9;
          cursor: pointer;
          max-width: 70%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .nick {
          color: #4a90d9;
        }

        .time {
          color: #c0c4cc;
        }
      }

      .comment-body {
        margin-top: 4px;
        font-size: 14px;
        color: #303133;
        line-height: 20px;
        word-break: break-all;

        .reply-flag {
          color: #909399;
        }
      }

      .quote {
        margin-top: 5px;
        padding: 6px 8px;
        font-size: 12px;
        color: #909399;
        background: #f7f8fa;
        border-radius: 6px;
      }

      .comment-foot {
        margin-top: 5px;
        font-size: 12px;
        color: #909399;

        .food {
          color: #4a90d9;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
