import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { authKeys, currentUserQueryOptions, logout } from './api'

export function useCurrentUser() {
  return useQuery(currentUserQueryOptions)
}

/**
 * 登录成功后用它把当前用户拉回来:登录接口的返回值不可信(缺 avatar 和 phone),
 * 且调用方需要在拿到角色之后才能决定跳去哪里,所以这里等 fetch 结束再 resolve。
 */
export function useRefreshCurrentUser() {
  const queryClient = useQueryClient()

  return useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: authKeys.all })
    return queryClient.fetchQuery(currentUserQueryOptions)
  }, [queryClient])
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    // 整体清空而不是只删 auth:换账号登录时,上一个用户的列表、详情都不该留在缓存里
    onSuccess: () => {
      queryClient.clear()
    },
  })
}
