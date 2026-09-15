import request from '@/utils/request'

// 查询美食信息列表
export function listInfo(query) {
  return request({
    url: '/food/info/list',
    method: 'get',
    params: query
  })
}

// 查询美食信息详细
export function getInfo(id) {
  return request({
    url: '/food/info/' + id,
    method: 'get'
  })
}

// 新增美食信息
export function addInfo(data) {
  return request({
    url: '/food/info',
    method: 'post',
    data: data
  })
}

// 修改美食信息
export function updateInfo(data) {
  return request({
    url: '/food/info',
    method: 'put',
    data: data
  })
}

// 删除美食信息
export function delInfo(id) {
  return request({
    url: '/food/info/' + id,
    method: 'delete'
  })
}
