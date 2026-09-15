import request from '@/utils/request'

// 查询美食收藏记录列表
export function listFavorite(query) {
  return request({
    url: '/food/favorite/list',
    method: 'get',
    params: query
  })
}

// 查询美食收藏记录详细
export function getFavorite(id) {
  return request({
    url: '/food/favorite/' + id,
    method: 'get'
  })
}

// 删除美食收藏记录
export function delFavorite(id) {
  return request({
    url: '/food/favorite/' + id,
    method: 'delete'
  })
}
