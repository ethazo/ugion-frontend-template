import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import { toast } from 'sonner'

/**
 * Generic API wrapper returned by backend services.
 */
export interface ApiResponse<T = unknown> {
  code: string
  msg: string
  data: T
}

/**
 * Standard structure for paginated responses.
 */
export interface PaginatedResponse<T = unknown> {
  rows: T[]
  total: number
  page: number
  size: number
  totalPage: number
}

/**
 * Query parameters used for paginated API calls.
 */
export interface PaginationParams {
  page: number
  size: number
}

/**
 * Custom request configuration extending Axios config.
 *
 * silent:
 *   Prevents automatic error notifications.
 */
export interface RequestConfig extends AxiosRequestConfig {
  silent?: boolean
}

/**
 * Backend success indicator.
 */
const SUCCESS_CODE = '00000'

/**
 * Unified error object thrown by the HTTP layer.
 */
export class ApiError extends Error {
  readonly code: string
  readonly response?: AxiosResponse

  constructor(message: string, code: string, response?: AxiosResponse) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.response = response
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Handler executed when authentication becomes invalid.
 */
type UnauthorizedHandler = () => void

let _unauthorizedHandler: UnauthorizedHandler = () => {
  if (typeof window === 'undefined') return

  const path = window.location.pathname

  if (!path.startsWith('/login')) {
    const redirect = encodeURIComponent(path + window.location.search)
    window.location.replace(`/login?redirect=${redirect}`)
  }
}

/**
 * Allows overriding the default unauthorized behavior.
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  _unauthorizedHandler = handler
}

/**
 * Shared Axios instance used across the application.
 */
export const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15_000,
  withCredentials: true,
  headers: { Accept: 'application/json' },
})

/**
 * Request interceptor.
 * Can be used for injecting auth headers or tracing information.
 */
instance.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => Promise.reject(error),
)

/**
 * Response interceptor focused only on HTTP-level concerns.
 * Business response handling is implemented elsewhere.
 */
instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      _unauthorizedHandler()
    }
    return Promise.reject(error)
  },
)

/**
 * Extracts the business payload from a standard API response.
 * Throws ApiError when the backend indicates failure.
 */
function resolveResponse<T>(response: AxiosResponse<ApiResponse<T>>, config?: RequestConfig): T {
  const body = response.data

  if (!isApiResponse(body)) {
    return body as T
  }

  if (!isSuccess(body.code)) {
    if (!config?.silent) showError(body.msg)

    throw new ApiError(body.msg, body.code, response)
  }

  return body.data
}

/**
 * Maps Axios errors into readable messages.
 */
function resolveErrorMessage(error: AxiosError<ApiResponse>): string {
  if (error.response?.data && isApiResponse(error.response.data)) {
    return error.response.data.msg
  }

  switch (error.response?.status) {
    case 400:
      return '请求参数错误'
    case 401:
      return '登录已过期'
    case 403:
      return '没有权限'
    case 404:
      return '资源不存在'
    case 408:
      return '请求超时'
    case 429:
      return '请求过于频繁'
    case 500:
      return '服务器错误'
    case 502:
      return '网关错误'
    case 503:
      return '服务不可用'
    default:
      break
  }

  if (error.code === 'ECONNABORTED') return '请求超时'
  if (error.code === 'ERR_NETWORK') return '网络异常'
  if (!error.response) return '网络连接失败'
  return '请求失败'
}

/**
 * Centralized request execution pipeline.
 *
 * Responsibilities:
 *  - Execute HTTP request
 *  - Optionally skip business parsing
 *  - Normalize errors
 */
async function execute<T>(
  requestFn: () => Promise<AxiosResponse<ApiResponse<T>>>,
  config?: RequestConfig,
): Promise<T> {
  try {
    const response = await requestFn()

    if (config?.responseType === 'blob' || config?.responseType === 'arraybuffer') {
      return response as unknown as T
    }

    return resolveResponse<T>(response, config)
  } catch (error) {
    if (error instanceof ApiError) throw error

    const axiosError = error as AxiosError<ApiResponse>
    const message = resolveErrorMessage(axiosError)

    if (!config?.silent) showError(message)

    throw new ApiError(
      message,
      String(axiosError.response?.status ?? axiosError.code ?? 'UNKNOWN'),
      axiosError.response,
    )
  }
}

/**
 * Runtime guard verifying the response matches ApiResponse structure.
 */
function isApiResponse(data: unknown): data is ApiResponse {
  if (!data || typeof data !== 'object') return false

  const record = data as Record<string, unknown>
  return typeof record.code === 'string' && typeof record.msg === 'string' && 'data' in record
}

/**
 * Determines whether a business code represents success.
 */
function isSuccess(code: string): boolean {
  return code === SUCCESS_CODE
}

/**
 * Displays error messages using the UI notification system.
 */
function showError(message: string): void {
  if (typeof window !== 'undefined') {
    toast.error(message)
  }
}

/**
 * Lightweight HTTP client exposing typed request methods.
 */
export const http = {
  get<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return execute<T>(() => instance.get(url, config), config)
  },

  post<T = unknown, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<T> {
    return execute<T>(() => instance.post(url, data, config), config)
  },

  put<T = unknown, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<T> {
    return execute<T>(() => instance.put(url, data, config), config)
  },

  patch<T = unknown, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<T> {
    return execute<T>(() => instance.patch(url, data, config), config)
  },

  delete<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return execute<T>(() => instance.delete(url, config), config)
  },

  request<T = unknown>(config: RequestConfig): Promise<T> {
    return execute<T>(() => instance.request(config), config)
  },

  raw<T = unknown>(config: RequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return instance.request<ApiResponse<T>>(config)
  },
}
