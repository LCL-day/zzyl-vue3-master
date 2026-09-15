import request from '@/utils/request'

// 查询美食评论列表
export function listComment(query) {
  return request({
    url: '/food/comment/list',
    method: 'get',
    params: query
  })
}

// 查询美食评论详细
export function getComment(id) {
  return request({
    url: '/food/comment/' + id,
    method: 'get'
  })
}

// 新增美食评论
export function addComment(data) {
  return request({
    url: '/food/comment',
    method: 'post',
    data: data
  })
}

// 修改美食评论
export function updateComment(data) {
  return request({
    url: '/food/comment',
    method: 'put',
    data: data
  })
}

// 删除美食评论
export function delComment(id) {
  return request({
    url: '/food/comment/' + id,
    method: 'delete'
  })
}
