import request from '@/utils/request'

// 查询美食分类列表
export function listCategory(query) {
  return request({
    url: '/food/category/list',
    method: 'get',
    params: query
  })
}

// 查询美食分类详细
export function getCategory(id) {
  return request({
    url: '/food/category/' + id,
    method: 'get'
  })
}

// 新增美食分类
export function addCategory(data) {
  return request({
    url: '/food/category',
    method: 'post',
    data: data
  })
}

// 修改美食分类
export function updateCategory(data) {
  return request({
    url: '/food/category',
    method: 'put',
    data: data
  })
}

// 删除美食分类
export function delCategory(id) {
  return request({
    url: '/food/category/' + id,
    method: 'delete'
  })
}
