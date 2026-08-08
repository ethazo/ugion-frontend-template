/**
 * 请求层把所有失败归三类,业务代码只需区分这三类:
 * - auth   HTTP 401,请求层内部跳登录,不给业务代码处理
 * - business  HTTP 200 但 success 为 false,message 可直接展示
 * - system    其余全部:5xx、网络中断、超时、Zod 校验失败,以及 401 之外的 4xx
 */
export type ApiErrorKind = 'auth' | 'business' | 'system'

const GENERIC_SYSTEM_MESSAGE = '服务暂时不可用,请稍后重试'

interface ApiErrorOptions {
  /** 只有 5xx 与网络类错误值得重试,业务错误重试只是重复失败 */
  isRetryable?: boolean
  cause?: unknown
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly isRetryable: boolean

  constructor(kind: ApiErrorKind, message: string, options: ApiErrorOptions = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause })
    this.name = 'ApiError'
    this.kind = kind
    this.isRetryable = options.isRetryable ?? false
  }
}

export function authError() {
  return new ApiError('auth', '登录状态已失效,请重新登录')
}

export function businessError(message: string) {
  return new ApiError('business', message)
}

/** 系统错误不把原始堆栈或技术细节展示给用户,详情只留在 cause 里供控制台排查。 */
export function systemError(options: ApiErrorOptions = {}) {
  return new ApiError('system', GENERIC_SYSTEM_MESSAGE, options)
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/** 取给用户看的文案:业务错误用后端 message,其余一律通用文案。 */
export function errorMessage(error: unknown) {
  if (isApiError(error)) return error.message
  return GENERIC_SYSTEM_MESSAGE
}
