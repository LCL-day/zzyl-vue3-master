// 图片地址工具：把后端返回的资源相对路径拼成可访问地址
const baseApi = (import.meta.env.VITE_APP_BASE_API || '').replace(/\/+$/, '')

/**
 * 解析美食封面地址。
 * 后端 /common/upload 返回的是 /profile/upload/... 形式，需要拼接基础接口前缀；
 * 示例数据里 image 为空，此时返回空串由页面展示占位图。
 *
 * @param {string} path 后端返回的图片路径
 * @returns {string} 可直接用于 img src 的地址
 */
export function resolveImage(path) {
  if (!path) {
    return ''
  }
  const value = String(path).trim()
  if (!value) {
    return ''
  }
  // 已经是完整地址或 data/base64，直接返回
  if (/^(https?:)?\/\//i.test(value) || value.indexOf('data:') === 0) {
    return value
  }
  const normalized = '/' + value.replace(/^\/+/, '')
  return baseApi + normalized
}

/**
 * 头像地址：框架默认头像为空，回退到内置图片
 *
 * @param {string} path 头像路径
 * @returns {string} 头像地址
 */
export function resolveAvatar(path) {
  return resolveImage(path)
}
