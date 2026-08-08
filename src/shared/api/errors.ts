export const GENERIC_MESSAGE = '服务暂时不可用,请稍后重试'

interface ApiErrorInit {
  status: number | null
  code: number | null
  message: string
  cause?: unknown
}

/**
 * 只携带事实,不携带决定:status 和 code 是后端给的,该不该重试、该不该跳登录、
 * 文案能不能给用户看,由下面三个判断函数各自推。
 *
 * 分类字段(kind 之类)会把这些决定固化在请求层,而请求层看不到调用场景。
 */
export class ApiError extends Error {
  /** null 表示压根没拿到响应:网络中断、超时、DNS 失败。 */
  readonly status: number | null
  /** null 表示响应体不是后端那套包装:网关错误页、代理超时页,或 schema 不匹配。 */
  readonly code: number | null

  constructor({ status, code, message, cause }: ApiErrorInit) {
    super(message, { cause })
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function isAuthError(error: unknown) {
  return isApiError(error) && error.status === 401
}

/**
 * 交给 TanStack Query 的 retry。重试是 Query 的职责,所以判断放在这里读事实,
 * 而不是让请求层预先在错误上打一个 isRetryable 标记。
 *
 * 只重 5xx 与无响应:4xx 重一百次结果一样,200 + success:false 是业务拒绝,
 * schema 不匹配是前端的问题,都不该重。
 */
export function retryApiError(failureCount: number, error: unknown) {
  if (failureCount >= 1) return false
  if (!isApiError(error)) return false

  return error.status === null || error.status >= 500
}

/**
 * code 不为 null 就说明这句 message 来自后端包装,是写给人看的,直接展示。
 * 唯一例外是 5xx 与无响应:那时候的 message 常是堆栈或 SQL 片段,属于内部细节。
 */
export function errorMessage(error: unknown) {
  if (!isApiError(error)) return GENERIC_MESSAGE

  const fromBackend = error.code !== null
  const serverFault = error.status === null || error.status >= 500

  return fromBackend && !serverFault ? error.message : GENERIC_MESSAGE
}
