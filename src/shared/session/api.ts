import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { api, noContentSchema } from '@/shared/api'
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

export const sessionKeys = {
  all: ['session'] as const,
  currentUser: () => ['session', 'currentUser'] as const,
}

export function fetchCurrentUser(signal?: AbortSignal) {
  return api.get('/auth/me', { schema: currentUserSchema, signal })
}

export const currentUserQueryOptions = queryOptions({
  queryKey: sessionKeys.currentUser(),
  queryFn: ({ signal }) => fetchCurrentUser(signal),
  // 当前用户在一次会话里几乎不变,失效由登录、退出两处显式触发
  staleTime: 5 * 60 * 1000,
})

export async function logout() {
  await api.post('/auth/logout', undefined, { schema: noContentSchema })
}
