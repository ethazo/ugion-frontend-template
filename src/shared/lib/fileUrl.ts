import { apiUrl } from './env'

/**
 * 文件接口是公开的,不需要凭证,拿到的地址可以直接给 img 的 src。
 * fileId 按字符串原样透传:接口文档把路径参数标成 int64,但拼 URL 不需要知道它是不是数字,
 * 转换只会在遇到非数字 ID 时炸掉。
 */
export function fileUrl(fileId: string) {
  return apiUrl(`file/${encodeURIComponent(fileId)}`)
}
