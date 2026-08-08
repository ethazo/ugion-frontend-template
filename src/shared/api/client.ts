import type { AxiosRequestConfig } from 'axios'
import { z } from 'zod'

import { IS_DEV } from '@/shared/lib/env'

import { ApiError, GENERIC_MESSAGE } from './errors'
import { http } from './http'

/** 响应体没有可用信息时用它:退出、登录(凭证在 cookie 里,返回体一概不用)。 */
export const noContentSchema = z.unknown()

/**
 * 直接透传 axios 的 config,不另发明一套参数形状:params 序列化、signal、timeout、
 * responseType 这些 axios 已经做好了,按子集重写一遍只会在需要新字段时回来改 shared/。
 *
 * 挡掉的四个由位置参数和实例决定,调用方设了只会造成两处真相。
 */
type CallConfig<TSchema extends z.ZodType> = Omit<
  AxiosRequestConfig,
  'url' | 'method' | 'data' | 'baseURL'
> & { schema: TSchema }

/**
 * 边界上校验一次,类型从 schema 推,不手写第二份。
 * 失败当系统错误而不是透传后端 message:这次问题在前端,后端那句「操作成功」不能给用户看。
 */
function parse<TSchema extends z.ZodType>(
  schema: TSchema,
  data: unknown,
  path: string,
): z.output<TSchema> {
  const parsed = schema.safeParse(data)

  if (parsed.success) return parsed.data

  // 真实后端、无 mock,接口会持续变化;打出差异才能立刻看出是哪个字段变了
  if (IS_DEV) {
    console.error(`[api] ${path} 响应结构与 schema 不匹配`, z.treeifyError(parsed.error))
  }

  throw new ApiError({ status: null, code: null, message: GENERIC_MESSAGE, cause: parsed.error })
}

/**
 * 业务代码唯一的请求入口。方法名和签名跟 axios 一一对应,多出来的只有 schema。
 * 不直接调 axios:baseURL、凭证、超时、拆包装、错误归一化都挂在实例上,绕过它就绕过全部约定。
 */
export const api = {
  get<TSchema extends z.ZodType>(path: string, { schema, ...config }: CallConfig<TSchema>) {
    return http.get<unknown>(path, config).then((response) => parse(schema, response.data, path))
  },

  post<TSchema extends z.ZodType>(
    path: string,
    body: unknown,
    { schema, ...config }: CallConfig<TSchema>,
  ) {
    return http
      .post<unknown>(path, body, config)
      .then((response) => parse(schema, response.data, path))
  },

  put<TSchema extends z.ZodType>(
    path: string,
    body: unknown,
    { schema, ...config }: CallConfig<TSchema>,
  ) {
    return http
      .put<unknown>(path, body, config)
      .then((response) => parse(schema, response.data, path))
  },

  delete<TSchema extends z.ZodType>(path: string, { schema, ...config }: CallConfig<TSchema>) {
    return http.delete<unknown>(path, config).then((response) => parse(schema, response.data, path))
  },

  /**
   * 只为改掉全局超时而存在:大文件传到一半被 15s 掐掉。
   * FormData 不需要特殊处理,axios 认出它就原样发,Content-Type 和 boundary 交给浏览器。
   */
  upload<TSchema extends z.ZodType>(
    path: string,
    form: FormData,
    { schema, ...config }: CallConfig<TSchema>,
  ) {
    return http
      .post<unknown>(path, form, { timeout: 0, ...config })
      .then((response) => parse(schema, response.data, path))
  },
}
