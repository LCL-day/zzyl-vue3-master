import request from '@/utils/request'

// 查询美食点赞记录列表
export function listLike(query) {
  return request({
    url: '/food/like/list',
    method: 'get',
    params: query
  })
}

// 查询美食点赞记录详细
export function getLike(id) {
  return request({
    url: '/food/like/' + id,
    method: 'get'
  })
}

// 删除美食点赞记录
export function delLike(id) {
  return request({
    url: '/food/like/' + id,
    method: 'delete'
  })
}
