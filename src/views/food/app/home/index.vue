<template>
  <div class="home-layout">
    <!-- 左侧边框：美食分类 -->
    <aside class="cate-aside">
      <div class="cate-aside__list">
        <div
          class="cate-item"
          :class="{ active: categoryId === null }"
          @click="selectCategory(null)"
        >
          <span class="cate-item__name">全部</span>
        </div>
        <div
          v-for="item in categories"
          :key="item.id"
          class="cate-item"
          :class="{ active: categoryId === item.id }"
          @click="selectCategory(item.id)"
        >
          <span class="cate-item__name">{{ item.name }}</span>
        </div>
      </div>
    </aside>

    <!-- 右侧内容 -->
    <section class="home-main">
      <!-- 结果统计 -->
      <div class="result-tip">
        <span class="result-tip__cate">{{ currentCategoryName }}</span>
        <span v-if="keyword">「{{ keyword }}」</span>
        <span>共 {{ total }} 道美食</span>
      </div>

      <!-- 卡片列表 -->
      <div v-loading="loading" class="card-grid">
        <div v-for="item in list" :key="item.id" class="food-card" @click="goDetail(item.id)">
          <div class="cover">
            <img v-if="resolveImage(item.image)" :src="resolveImage(item.image)" class="cover-img" @error="onImgError($event)" />
            <div v-else class="cover-fallback">
              <el-icon><Bowl /></el-icon>
              <span>{{ (item.title || '美食').slice(0, 1) }}</span>
            </div>
            <span v-if="item.categoryName" class="cate-tag">{{ item.categoryName }}</span>
          </div>
          <div class="card-body">
            <div class="title">{{ item.title }}</div>
            <div class="desc">{{ item.description || '暂无简介' }}</div>
            <div class="meta">
              <span class="meta-item"><el-icon><Pointer /></el-icon>{{ item.likeCount || 0 }}</span>
              <span class="meta-item"><el-icon><Star /></el-icon>{{ item.favoriteCount || 0 }}</span>
              <span class="meta-item"><el-icon><ChatDotRound /></el-icon>{{ item.commentCount || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-if="!loading && list.length === 0" description="没有找到相关美食，换个关键词试试" />
      <div v-if="list.length > 0" class="load-more" @click="loadMore">
        <span v-if="loadingMore">加载中...</span>
        <span v-else-if="finished">没有更多了</span>
        <span v-else>点击加载更多</span>
      </div>
    </section>
  </div>
</template>

<script setup name="AppHome">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Star, Pointer, ChatDotRound, Bowl } from '@element-plus/icons-vue'
import { listAppFood, listAppCategories } from '@/api/food/app'
import { resolveImage } from '@/utils/image'

const route = useRoute()
const router = useRouter()

const keyword = ref('')
const categoryId = ref(null)
const categories = ref([])
const list = ref([])
const total = ref(0)
const loading = ref(false)
const loadingMore = ref(false)
const finished = ref(false)

const query = reactive({
  pageNum: 1,
  pageSize: 8,
  title: '',
  categoryId: null
})

// 当前选中的分类名，用于结果栏展示
const currentCategoryName = computed(() => {
  if (categoryId.value === null) {
    return '全部分类'
  }
  const hit = categories.value.find(item => item.id === categoryId.value)
  return hit ? hit.name : '全部分类'
})

function loadCategories() {
  listAppCategories().then(res => {
    categories.value = res.data || []
  })
}

function loadData(append) {
  if (append) {
    loadingMore.value = true
  } else {
    loading.value = true
    finished.value = false
  }
  query.title = keyword.value
  query.categoryId = categoryId.value
  listAppFood(query).then(res => {
    const rows = res.rows || []
    list.value = append ? list.value.concat(rows) : rows
    total.value = res.total || 0
    finished.value = list.value.length >= total.value
  }).finally(() => {
    loading.value = false
    loadingMore.value = false
  })
}

function handleSearch() {
  query.pageNum = 1
  loadData(false)
}

/** 顶栏搜索：接收关键词并执行查询 */
function onTopbarSearch(e) {
  keyword.value = (e && e.detail && e.detail.keyword) || ''
  handleSearch()
}

/** 把当前关键词回传给顶栏输入框，保持两边一致 */
function syncKeywordToTopbar() {
  window.dispatchEvent(new CustomEvent('app-search-sync', { detail: { keyword: keyword.value } }))
}

function selectCategory(id) {
  categoryId.value = id
  query.pageNum = 1
  loadData(false)
}

function loadMore() {
  if (loadingMore.value || finished.value) {
    return
  }
  query.pageNum += 1
  loadData(true)
}

function goDetail(id) {
  router.push('/app/detail/' + id)
}

function onImgError(e) {
  e.target.style.display = 'none'
}

// 从详情/发布等页面返回时刷新列表，保证新发布内容立即可见
watch(
  () => route.path,
  (path) => {
    if (path === '/app/home') {
      query.pageNum = 1
      loadData(false)
    }
  }
)

// 关键词变化时同步回顶栏输入框
watch(keyword, () => {
  syncKeywordToTopbar()
})

onMounted(() => {
  window.addEventListener('app-search', onTopbarSearch)
  loadCategories()
  loadData(false)
})

onBeforeUnmount(() => {
  window.removeEventListener('app-search', onTopbarSearch)
})
</script>

<style scoped lang="scss">
/* 首页：左侧分类边框 + 右侧内容区 */
.home-layout {
  display: flex;
  align-items: stretch;
  /* 顶部导航固定为 58px，这里保证左右两栏都能铺满可视区 */
  min-height: calc(100vh - 58px);
}

/* ---------- 左侧分类边框 ---------- */
.cate-aside {
  flex: none;
  width: 104px;
  border-right: 1px solid #e7e9ef;
  background: #fbfbfd;
  display: flex;
  flex-direction: column;

  &__list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0 12px;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #dcdfe6;
      border-radius: 2px;
    }
  }

  .cate-item {
    position: relative;
    padding: 11px 10px 11px 14px;
    font-size: 13px;
    color: #606266;
    cursor: pointer;
    border-left: 3px solid transparent;
    transition: background 0.18s, color 0.18s, border-color 0.18s;

    &__name {
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:hover {
      background: #f3f5f9;
      color: #303133;
    }

    &.active {
      color: #ff7a45;
      font-weight: 600;
      background: linear-gradient(90deg, #fff3ea 0%, #fffaf6 100%);
      border-left-color: #ff7a45;
    }
  }
}

/* ---------- 右侧内容区 ---------- */
.home-main {
  flex: 1;
  min-width: 0;
  padding: 12px;
  display: flex;
  flex-direction: column;

  .result-tip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    color: #909399;
    padding: 8px 2px 6px;

    &__cate {
      padding: 2px 8px;
      color: #ff7a45;
      background: #fff2e8;
      border-radius: 8px;
    }
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    min-height: 120px;

    .food-card {
      background: #fff;
      border: 1px solid #eef0f4;
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(24, 30, 48, 0.04);
      transition: transform 0.15s, box-shadow 0.2s, border-color 0.2s;

      &:hover {
        border-color: #ffd6bd;
        box-shadow: 0 4px 14px rgba(255, 122, 69, 0.14);
      }

      &:active {
        transform: scale(0.98);
      }

      .cover {
        position: relative;
        height: 120px;
        background: #f2f3f5;

        .cover-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .cover-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: #fff;
          font-size: 22px;
          background: linear-gradient(135deg, #ffb36b, #ff7a45);

          span {
            font-size: 16px;
          }
        }

        .cate-tag {
          position: absolute;
          left: 6px;
          top: 6px;
          padding: 1px 7px;
          font-size: 11px;
          color: #fff;
          background: rgba(0, 0, 0, 0.35);
          border-radius: 8px;
          backdrop-filter: blur(2px);
        }
      }

      .card-body {
        padding: 8px 10px 10px;
        border-top: 1px solid #f4f5f8;

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
          height: 32px;
          line-height: 16px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .meta {
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px dashed #f0f1f5;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #a8abb2;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 2px;
          }
        }
      }
    }
  }

  .load-more {
    text-align: center;
    padding: 14px 0 6px;
    font-size: 13px;
    color: #909399;
    cursor: pointer;

    &:hover {
      color: #ff7a45;
    }
  }
}

/* 窄屏（手机）时左栏收窄 */
@media (max-width: 480px) {
  .cate-aside {
    width: 88px;
  }
  .home-main {
    padding: 10px;
  }
}
</style>
