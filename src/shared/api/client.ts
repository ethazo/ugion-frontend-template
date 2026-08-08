import type { AxiosRequestConfig } from 'axios'
import type { z } from 'zod'

import { unwrap } from './envelope'
import { http } from './instance'

/** 收窄到实际用到的动词。axios 自带的 Method 还含 purge、link 这些这里不会出现的值。 */
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions<TSchema extends z.ZodType> {
  method?: Method
  /** 统一 JSON,后端也收表单编码但只用一种。文件上传走 uploadFile。 */
  body?: unknown
  /** GET 的查询参数,axios 负责编码 */
  params?: Record<string, string | number | boolean | undefined>
  /** data 的形状。无返回体的接口用 z.null() 之类描述。 */
  schema: TSchema
  signal?: AbortSignal
}

export async function request<TSchema extends z.ZodType>(
  path: string,
  { method = 'GET', body, params, schema, signal }: RequestOptions<TSchema>,
): Promise<z.output<TSchema>> {
  // exactOptionalPropertyTypes 下不能把 undefined 显式赋给可选字段,所以按需展开而不是逐个赋值
  const config: AxiosRequestConfig = {
    url: path,
    method,
    ...(body === undefined ? {} : { data: body, headers: { 'Content-Type': 'application/json' } }),
    ...(params === undefined ? {} : { params }),
    ...(signal === undefined ? {} : { signal }),
  }

  const response = await http.request<unknown>(config)

  return unwrap(path, response.data, schema)
}
