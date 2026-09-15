import request from '@/utils/request'

// 首页美食列表（支持搜索与分类筛选）
export function listAppFood(query) {
  return request({
    url: '/food/app/list',
    method: 'get',
    params: query
  })
}

// 分类列表
export function listAppCategories() {
  return request({
    url: '/food/app/categories',
    method: 'get'
  })
}

// 美食详情
export function getAppFood(id) {
  return request({
    url: '/food/app/detail/' + id,
    method: 'get'
  })
}

// 点赞 / 取消点赞
export function toggleLike(foodId) {
  return request({
    url: '/food/app/like/' + foodId,
    method: 'post'
  })
}

// 收藏 / 取消收藏
export function toggleFavorite(foodId) {
  return request({
    url: '/food/app/favorite/' + foodId,
    method: 'post'
  })
}

// 取消收藏
export function removeFavorite(foodId) {
  return request({
    url: '/food/app/favorite/' + foodId,
    method: 'delete'
  })
}

// 我的收藏
export function listFavorites(query) {
  return request({
    url: '/food/app/favorites',
    method: 'get',
    params: query
  })
}

// 发布美食
export function publishFood(data) {
  return request({
    url: '/food/app/publish',
    method: 'post',
    data: data
  })
}

// 我发布的
export function listMine(query) {
  return request({
    url: '/food/app/mine',
    method: 'get',
    params: query
  })
}

// 我发布的某条内容详情（编辑回显）
export function getMine(foodId) {
  return request({
    url: '/food/app/mine/' + foodId,
    method: 'get'
  })
}

// 修改我发布的内容
export function updateMine(foodId, data) {
  return request({
    url: '/food/app/mine/' + foodId,
    method: 'put',
    data: data
  })
}

// 删除我发布的
export function removeMine(foodId) {
  return request({
    url: '/food/app/mine/' + foodId,
    method: 'delete'
  })
}

// 某美食的评论列表
export function listFoodComments(foodId, query) {
  return request({
    url: '/food/app/comments/' + foodId,
    method: 'get',
    params: query
  })
}

// 发表评论 / 回复评论
export function addFoodComment(data) {
  return request({
    url: '/food/app/comment',
    method: 'post',
    data: data
  })
}

// 删除我的评论
export function delFoodComment(id) {
  return request({
    url: '/food/app/comment/' + id,
    method: 'delete'
  })
}

// 我的评论 / 收到的评论（type: mine | received）
export function listProfileComments(type, query) {
  return request({
    url: '/food/app/profile/comments',
    method: 'get',
    params: { type: type, ...query }
  })
}

// 我的信息与统计
export function getAppProfile() {
  return request({
    url: '/food/app/profile',
    method: 'get'
  })
}

// 当前登录用户信息（框架内置）
export function getUserInfo() {
  return request({
    url: '/getInfo',
    method: 'get'
  })
}

// 是否开放注册
export function getRegisterEnabled() {
  return request({
    url: '/food/app/auth/registerEnabled',
    headers: {
      isToken: false
    },
    method: 'get'
  })
}

// 注册新账号
export function register(data) {
  return request({
    url: '/food/app/auth/register',
    headers: {
      isToken: false,
      repeatSubmit: false
    },
    method: 'post',
    data: data
  })
}
