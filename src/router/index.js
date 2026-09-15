import { createWebHistory, createRouter } from 'vue-router'

const routes = [
  {
    path: '/login',
    component: () => import('@/views/login')
  },
  {
    path: '/register',
    component: () => import('@/views/register')
  },
  {
    path: '',
    redirect: '/app/home',
  },
  {
    path: '/app',
    component: () => import('@/views/food/app/index'),
    redirect: '/app/home',
    children: [
      {
        path: 'home',
        component: () => import('@/views/food/app/home/index'),
        meta: { title: '首页', tabbar: true }
      },
      {
        path: 'favorite',
        component: () => import('@/views/food/app/favorite/index'),
        meta: { title: '我的收藏', tabbar: true }
      },
      {
        path: 'publish',
        component: () => import('@/views/food/app/publish/index'),
        meta: { title: '发布美食', tabbar: true }
      },
      {
        path: 'mine',
        component: () => import('@/views/food/app/mine/index'),
        meta: { title: '我的', tabbar: true }
      },
      {
        path: 'detail/:id',
        component: () => import('@/views/food/app/detail/index'),
        meta: { title: '美食详情', tabbar: false }
      }
    ]
  },
  {
    path: '/index',
    redirect: '/app/home'
  },
  {
    path: '/food/info',
    component: () => import('@/views/food/info')
  },
  {
    path: '/food/category',
    component: () => import('@/views/food/category')
  },
  {
    path: '/food/like',
    component: () => import('@/views/food/like')
  },
  {
    path: '/food/favorite',
    component: () => import('@/views/food/favorite')
  },
  {
    path: '/food/comment',
    component: () => import('@/views/food/comment')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/app/home'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
});

export default router;
