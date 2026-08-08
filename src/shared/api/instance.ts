import axios from 'axios'

import { apiUrl } from '@/shared/lib/env'

import { notifyAuthFailure } from './authFailure'
import { authError, systemError } from './errors'

/**
 * baseURL 走 apiUrl 而不是写死 '/api':子路径部署时前缀会变,
 * 让它和 fileUrl 共用同一处 base 处理。
 * 默认不设 Content-Type,由各请求自己声明,否则 FormData 上传时会顶掉 axios 自动生成的 boundary。
 */
export const http = axios.create({
  baseURL: apiUrl(''),
  withCredentials: true,
})

http.interceptors.response.use(undefined, (error: unknown) => {
  // 取消是调用方主动行为,原样抛出,Query 才能识别成取消而不是失败
  if (axios.isCancel(error)) return Promise.reject(error)

  if (!axios.isAxiosError(error)) {
    return Promise.reject(systemError({ cause: error }))
  }

  const status = error.response?.status

  if (status === 401) {
    // 会话中途失效由请求层统一收口,业务代码不重复防御
    notifyAuthFailure()
    return Promise.reject(authError())
  }

  if (status === undefined) {
    // 没有响应就是网络中断或超时,可重试
    return Promise.reject(systemError({ isRetryable: true, cause: error }))
  }

  // 401 之外的 4xx 与 5xx 都是系统错误,只有 5xx 值得重试
  return Promise.reject(systemError({ isRetryable: status >= 500, cause: error }))
})
