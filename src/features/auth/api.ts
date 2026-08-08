import { api, noContentSchema } from '@/shared/api'

export interface PasswordLoginInput {
  username: string
  password: string
}

/**
 * 登录返回的 LoginResult 里有 token、sessionId 和一份用户信息,一个都不用:
 * 凭证在 httpOnly cookie 里,用户信息统一从 shared/session 的 /auth/me 取,避免出现两份。
 */
export async function loginWithPassword(input: PasswordLoginInput) {
  await api.post('/auth/login', input, { schema: noContentSchema })
}
