import { z } from 'zod'

import { IS_DEV } from '@/shared/lib/env'

import { businessError, systemError } from './errors'

/** 包装层只在请求层出现,业务代码只见到 data。 */
const envelopeSchema = z.object({
  code: z.number(),
  message: z.string(),
  success: z.boolean(),
  data: z.unknown(),
})

function logSchemaMismatch(path: string, error: z.ZodError) {
  if (!IS_DEV) return
  // 接口会持续变化,开发环境打出差异才能立刻定位到是哪个字段变了
  console.error(`[api] ${path} 响应结构与 schema 不匹配`, z.treeifyError(error))
}

/**
 * 拆包装并校验 data。普通请求与文件上传共用:两者的响应约定相同,
 * 差异只在传输方式,分开写会让错误分类逐渐漂移。
 */
export function unwrap<TSchema extends z.ZodType>(
  path: string,
  payload: unknown,
  schema: TSchema,
): z.output<TSchema> {
  const envelope = envelopeSchema.safeParse(payload)

  if (!envelope.success) {
    // 非包装响应(网关错误页之类),归系统错误
    throw systemError({ cause: envelope.error })
  }

  if (!envelope.data.success) {
    // 业务错误走 HTTP 200,只看状态码会全部漏掉
    throw businessError(envelope.data.message)
  }

  const parsed = schema.safeParse(envelope.data.data)

  if (!parsed.success) {
    logSchemaMismatch(path, parsed.error)
    throw systemError({ cause: parsed.error })
  }

  return parsed.data
}
