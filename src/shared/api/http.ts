import axios, { type AxiosResponse } from 'axios'
import { z } from 'zod'

import { apiUrl } from '@/shared/lib/env'

import { ApiError, GENERIC_MESSAGE } from './errors'

export const http = axios.create({
  // 走 apiUrl 而不是写死 /api:子路径部署时前缀跟着 base 变
  baseURL: apiUrl(''),
  // 凭证是 httpOnly cookie,经开发代理也要带上
  withCredentials: true,
  // axios 默认 timeout 为 0,也就是永不超时。服务端接了连接却不返回时(内网里常见,
  // 比如后端线程池打满)请求会一直悬着:重试等不到触发,用户看到转不停的骨架屏。
  timeout: 15_000,
})

/** 包装层只在这个文件里出现,出了拦截器业务代码只见到 data。 */
const envelopeSchema = z.object({
  code: z.number(),
  message: z.string(),
  success: z.boolean(),
  data: z.unknown(),
})

/**
 * 两个分支都要拆包装:后端非 2xx 也回同一套结构,把可操作的提示写在 message 里。
 * 只在成功分支拆,4xx 的原文就丢了,用户永远只能看到通用文案。
 */
http.interceptors.response.use(
  (response: AxiosResponse<unknown>) => {
    const envelope = envelopeSchema.safeParse(response.data)

    if (!envelope.success) {
      throw new ApiError({
        status: response.status,
        code: null,
        message: GENERIC_MESSAGE,
        cause: envelope.error,
      })
    }

    if (!envelope.data.success) {
      // 业务错误走 HTTP 200,只看状态码会全部漏掉。
      // 这里 throw 不会被本次 use() 的第二个参数接住(.then(f, r) 的语义),
      // ApiError 原样到调用方——别「顺手」改成 Promise.reject 挪进下面的分支。
      throw new ApiError({
        status: response.status,
        code: envelope.data.code,
        message: envelope.data.message,
      })
    }

    // 改写而不是返回 data:成功拦截器的返回类型被 axios 钉死在 AxiosResponse
    response.data = envelope.data.data

    return response
  },
  (error: unknown) => {
    // 取消不是失败:Query 换 key 时会主动 abort,包成 ApiError 会让组件闪一下错误态
    if (axios.isCancel(error)) return Promise.reject(error)

    if (!axios.isAxiosError(error)) {
      return Promise.reject(
        new ApiError({ status: null, code: null, message: GENERIC_MESSAGE, cause: error }),
      )
    }

    const envelope = envelopeSchema.safeParse(error.response?.data)

    return Promise.reject(
      new ApiError({
        status: error.response?.status ?? null,
        code: envelope.success ? envelope.data.code : null,
        message: envelope.success ? envelope.data.message : GENERIC_MESSAGE,
        cause: error,
      }),
    )
  },
)
