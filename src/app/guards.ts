import type { QueryClient } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'

import { isApiError } from '@/shared/api'
import type { Role } from '@/shared/types/role'

import { currentUserQueryOptions } from '@/features/auth'

import { ROLE_META } from './roles'

/**
 * 启动引导的第一道关卡。放在 beforeLoad 里而不是组件的 useEffect 里,
 * 业务界面在它返回之前根本不会挂载。
 *
 * 401 在这里转成跳登录:请求层的 notifyAuthFailure 负责会话中途失效,
 * 而启动时这次失败是「还没登录」,直接 redirect 更直白,也不必等一轮渲染。
 */
export async function loadCurrentUser(queryClient: QueryClient) {
  try {
    return await queryClient.ensureQueryData(currentUserQueryOptions)
  } catch (error) {
    if (isApiError(error) && error.kind === 'auth') {
      throw redirect({ to: '/login' })
    }
    // 网络与 5xx 交给路由的 errorComponent 显示重试入口
    throw error
  }
}

/** 手输 URL 进了别人的角色区域时,送回自己的落地页。前端分流不是安全边界。 */
export function requireRole(role: Role, expected: Role) {
  if (role === expected) return
  throw redirect({ to: ROLE_META[role].landing })
}
