import type { QueryClient } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'

import { isAuthError } from '@/shared/api'
import { currentUserQueryOptions } from '@/shared/session'
import type { Role } from '@/shared/types/role'

import { ROLE_LANDING } from './roles'

/**
 * 启动引导的第一道关卡。放在 beforeLoad 里而不是组件的 useEffect 里,
 * 业务界面在它返回之前根本不会挂载。
 *
 * 401 在这里转成跳登录:启动时这次失败是「还没登录」,redirect 是路由自己的机制,
 * 比等一轮渲染再命令式跳转直白。会话中途失效由 queryClient 的 onError 兜。
 */
export async function loadCurrentUser(queryClient: QueryClient) {
  try {
    return await queryClient.ensureQueryData(currentUserQueryOptions)
  } catch (error) {
    if (isAuthError(error)) {
      throw redirect({ to: '/login' })
    }
    // 网络与 5xx 交给路由的 errorComponent 显示重试入口
    throw error
  }
}

/** 手输 URL 进了别人的角色区域时,送回自己的落地页。前端分流不是安全边界。 */
export function requireRole(role: Role, expected: Role) {
  if (role === expected) return
  throw redirect({ to: ROLE_LANDING[role] })
}
