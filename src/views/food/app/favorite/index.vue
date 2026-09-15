<template>
  <div class="app-page">
    <div class="page-title">我的收藏</div>

    <div v-loading="loading" class="fav-list">
      <div v-for="item in list" :key="item.id" class="fav-item" @click="goDetail(item.id)">
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
            <span class="num"><el-icon><ChatDotRound /></el-icon>{{ item.commentCount || 0 }}</span>
          </div>
        </div>
        <el-button class="cancel" size="small" @click.stop="cancelFavorite(item)">取消收藏</el-button>
      </div>
    </div>

    <el-empty v-if="!loading && list.length === 0" description="还没有收藏，去首页逛逛吧" />

    <div v-if="list.length > 0" class="load-more" @click="loadMore">
      <span v-if="loadingMore">加载中...</span>
      <span v-else-if="finished">没有更多了</span>
      <span v-else>点击加载更多</span>
    </div>
  </div>
</template>

<script setup name="AppFavorite">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Pointer, ChatDotRound } from '@element-plus/icons-vue'
import { listFavorites, removeFavorite } from '@/api/food/app'
import { resolveImage } from '@/utils/image'

const router = useRouter()

const list = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const finished = ref(false)

const query = reactive({
  pageNum: 1,
  pageSize: 8
})

function loadData(append) {
  if (append) {
    loadingMore.value = true
  } else {
    loading.value = true
    finished.value = false
  }
  listFavorites(query).then(res => {
    const rows = res.rows || []
    list.value = append ? list.value.concat(rows) : rows
    finished.value = list.value.length >= (res.total || 0)
  }).finally(() => {
    loading.value = false
    loadingMore.value = false
  })
}

function loadMore() {
  if (loadingMore.value || finished.value) {
    return
  }
  query.pageNum += 1
  loadData(true)
}

function cancelFavorite(item) {
  ElMessageBox.confirm('确认取消收藏「' + item.title + '」？', '提示', { type: 'warning' }).then(() => {
    removeFavorite(item.id).then(() => {
      ElMessage.success('已取消收藏')
      query.pageNum = 1
      loadData(false)
    })
  }).catch(() => {})
}

function goDetail(id) {
  router.push('/app/detail/' + id)
}

function onImgError(e) {
  e.target.style.display = 'none'
}

onMounted(() => {
  loadData(false)
})
</script>

<style scoped lang="scss">
.app-page {
  padding: 8px 12px 12px;

  .page-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    padding: 4px 2px 10px;
  }

  .fav-list {
    min-height: 100px;

    .fav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      margin-bottom: 10px;
      background: #fff;
      border-radius: 10px;
      cursor: pointer;

      .thumb {
        flex: none;
        width: 68px;
        height: 68px;
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
          font-size: 22px;
          color: #fff;
          background: linear-gradient(135deg, #ffb36b, #ff7a45);
        }
      }

      .info {
        flex: 1;
        min-width: 0;

        .title {
          font-size: 15px;
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
          height: 17px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .meta {
          margin-top: 6px;
          display: flex;
          align-items: center;
          gap: 10px;
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

      .cancel {
        flex: none;
      }
    }
  }

  .load-more {
    text-align: center;
    padding: 10px 0 6px;
    font-size: 13px;
    color: #909399;
    cursor: pointer;
  }
}
</style>
