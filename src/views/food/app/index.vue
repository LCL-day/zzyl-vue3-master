<template>
  <div class="app-shell">
    <!-- 顶部导航（原底部导航上移，作为上边框） -->
    <app-tabbar v-if="showTabbar" />
    <div class="app-body" :class="{ 'has-topbar': showTabbar }">
      <router-view />
    </div>
  </div>
</template>

<script setup name="AppLayout">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppTabbar from './components/AppTabbar/index.vue'

const route = useRoute()
const showTabbar = computed(() => route.meta && route.meta.tabbar !== false)
</script>

<style scoped lang="scss">
.app-shell {
  min-height: 100%;
  background: #f6f7fb;
  display: flex;
  flex-direction: column;

  .app-body {
    flex: 1;

    /* 顶部导航为固定定位，这里留出高度，避免内容被遮挡 */
    &.has-topbar {
      padding-top: 58px;
    }
  }
}
</style>
