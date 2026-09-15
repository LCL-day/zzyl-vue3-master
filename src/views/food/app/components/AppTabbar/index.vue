<template>
  <header class="app-header">
    <div class="app-header__inner">
      <!-- 站点标识（搜索框左侧） -->
      <div class="brand" @click="goHome">
        <span class="brand__logo">
          <el-icon><Bowl /></el-icon>
        </span>
        <span class="brand__name">知味仓</span>
      </div>

      <!-- 搜索框 + 搜索按钮 -->
      <div class="search-box">
        <el-input
          v-model="keyword"
          class="search-box__input"
          placeholder="搜索美食标题或简介"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button class="search-box__btn" type="primary" @click="handleSearch">搜索</el-button>
      </div>

      <!-- 四个入口（搜索按钮右侧） -->
      <nav class="header-nav">
        <div
          v-for="item in tabs"
          :key="item.path"
          class="nav-item"
          :class="{ active: isActive(item) }"
          @click="go(item)"
        >
          <el-icon class="nav-item__icon"><component :is="item.icon" /></el-icon>
          <span class="nav-item__text">{{ item.title }}</span>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup name="AppHeader">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HomeFilled, Star, EditPen, User, Search, Bowl } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const keyword = ref('')

const tabs = [
  { title: '首页', path: '/app/home', icon: HomeFilled },
  { title: '收藏', path: '/app/favorite', icon: Star },
  { title: '发布', path: '/app/publish', icon: EditPen },
  { title: '我的', path: '/app/mine', icon: User }
]

function isActive(item) {
  return route.path === item.path || route.path.indexOf(item.path + '/') === 0
}

function go(item) {
  if (route.path !== item.path) {
    router.push(item.path)
  }
}

function goHome() {
  if (route.path !== '/app/home') {
    router.push('/app/home')
  }
}

/** 搜索：不在首页时先跳首页，再广播关键词由首页执行查询 */
function handleSearch() {
  const kw = keyword.value.trim()
  if (route.path !== '/app/home') {
    router.push('/app/home')
  }
  // 首页监听该事件，统一在首页完成搜索与重置分页
  window.dispatchEvent(new CustomEvent('app-search', { detail: { keyword: kw } }))
}

/** 首页会把当前关键词回传，保持顶栏输入框与首页一致 */
function onKeywordSync(e) {
  if (e && e.detail && typeof e.detail.keyword === 'string') {
    keyword.value = e.detail.keyword
  }
}

onMounted(() => {
  window.addEventListener('app-search-sync', onKeywordSync)
})

onBeforeUnmount(() => {
  window.removeEventListener('app-search-sync', onKeywordSync)
})
</script>

<style scoped lang="scss">
/* 顶部边框：站点标识 + 搜索 + 四个入口 */
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 58px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 2px solid #f0f1f5;
  box-shadow: 0 2px 10px rgba(24, 30, 48, 0.06);

  &__inner {
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 12px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* 站点标识 */
  .brand {
    flex: none;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    user-select: none;

    &__logo {
      width: 30px;
      height: 30px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 17px;
      background: linear-gradient(135deg, #ffb36b, #ff7a45);
      box-shadow: 0 2px 6px rgba(255, 122, 69, 0.35);
    }

    &__name {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #303133;
    }
  }

  /* 搜索 */
  .search-box {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;

    &__input {
      flex: 1;
      min-width: 0;

      :deep(.el-input__wrapper) {
        border-radius: 18px;
      }
    }

    &__btn {
      flex: none;
      border-radius: 18px;
    }
  }

  /* 四个入口 */
  .header-nav {
    flex: none;
    display: flex;
    align-items: center;
    gap: 2px;
    height: 100%;

    .nav-item {
      position: relative;
      height: 100%;
      padding: 0 12px;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 14px;
      color: #7d7e80;
      cursor: pointer;
      transition: color 0.18s, background 0.18s;

      &__icon {
        font-size: 17px;
      }

      &.active {
        color: #ff7a45;
        font-weight: 600;

        &::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: -2px;
          transform: translateX(-50%);
          width: 24px;
          height: 3px;
          border-radius: 2px 2px 0 0;
          background: linear-gradient(90deg, #ff9a44, #ff7a45);
        }
      }

      &:hover:not(.active) {
        color: #303133;
        background: #fafbfd;
      }
    }
  }
}

/* 窄屏：隐藏站点名与导航文字，保证搜索框可用 */
@media (max-width: 720px) {
  .app-header {
    .brand__name {
      display: none;
    }
    .header-nav .nav-item {
      padding: 0 8px;
    }
    .header-nav .nav-item__text {
      display: none;
    }
    .search-box__btn {
      display: none;
    }
  }
}
</style>
