import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { request, retryApiError } from '@/shared/api'
import { roleFromBackend } from '@/shared/types/role'

// 后端角色是大写字符串。这里不用 z.enum:要那样得先把 ROLES 映射成大写元组,
// 而元组化绕不开类型断言。转换函数已经是唯一映射来源,直接用它校验更省事。
const roleSchema = z.string().transform((value, ctx) => {
  const role = roleFromBackend(value)

  if (role === undefined) {
    ctx.addIssue({ code: 'custom', message: `未知的角色取值:${value}` })
    return z.NEVER
  }

  return role
})

/** 描述后端 SimpleUserInfo 的实际形状,transform 之后这些字段名不再出现。 */
const currentUserSchema = z
  .object({
    id: z.number(),
    username: z.string(),
    realName: z.string(),
    role: roleSchema,
    // 文件 ID,不是地址;后端类型是字符串,原样透传不做数值转换
    avatar: z.string().nullish(),
    phone: z.string(),
  })
  .transform((user) => ({
    id: user.id,
    username: user.username,
    fullName: user.realName,
    role: user.role,
    avatarFileId: user.avatar ?? null,
    phone: user.phone,
  }))

export type CurrentUser = z.infer<typeof currentUserSchema>

const sendCodeSchema = z.object({
  sendToken: z.string(),
})

/**
 * 登录接口返回的 LoginResult 里有 token、sessionId 和一份用户信息,一个都不用:
 * 凭证在 httpOnly cookie 里,用户信息统一从 /api/auth/me 取,避免出现两份。
 */
const ignoredSchema = z.unknown()

export const SMS_SCENES = ['login', 'bind-phone'] as const

export type SmsScene = (typeof SMS_SCENES)[number]

// 后端场景值是 LOGIN / BIND_PHONE,前端小写。BIND_PHONE 里的下划线在前端写成连字符,
// 与其他前端标识的书写方式保持一致。
const BACKEND_SCENE_BY_SCENE: Record<SmsScene, string> = {
  login: 'LOGIN',
  'bind-phone': 'BIND_PHONE',
}

export interface PasswordLoginInput {
  username: string
  password: string
}

export interface SmsLoginInput {
  phone: string
  code: string
  sendToken?: string
}

export interface SendCodeInput {
  phone: string
  scene: SmsScene
}

export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => ['auth', 'currentUser'] as const,
}

export function fetchCurrentUser(signal?: AbortSignal) {
  return request('/auth/me', {
    schema: currentUserSchema,
    ...(signal === undefined ? {} : { signal }),
  })
}

export const currentUserQueryOptions = queryOptions({
  queryKey: authKeys.currentUser(),
  queryFn: ({ signal }) => fetchCurrentUser(signal),
  // 当前用户在一次会话里几乎不变,失效由登录、退出两处显式触发
  staleTime: 5 * 60 * 1000,
  retry: retryApiError,
})

export async function loginWithPassword(input: PasswordLoginInput) {
  await request('/auth/login', { method: 'POST', body: input, schema: ignoredSchema })
}

export async function loginWithSms({ phone, code, sendToken }: SmsLoginInput) {
  await request('/auth/sms-login', {
    method: 'POST',
    body: { phone, code, ...(sendToken === undefined ? {} : { sendToken }) },
    schema: ignoredSchema,
  })
}

export function requestSmsCode({ phone, scene }: SendCodeInput) {
  return request('/auth/send-code', {
    method: 'POST',
    body: { phone, scene: BACKEND_SCENE_BY_SCENE[scene] },
    schema: sendCodeSchema,
  })
}

export async function logout() {
  await request('/auth/logout', { method: 'POST', schema: ignoredSchema })
}
