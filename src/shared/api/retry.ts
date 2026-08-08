import { isApiError } from './errors'

/** 内网网络稳定,只有 5xx 与网络类错误重试 1 次;认证失效、业务错误、其余 4xx 重试只是重复失败。 */
export function retryApiError(failureCount: number, error: unknown) {
  if (failureCount >= 1) return false
  return isApiError(error) && error.isRetryable
}
