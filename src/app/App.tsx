import { RouterProvider } from '@tanstack/react-router'

import { setAuthFailureHandler } from '@/shared/api'

import { Providers } from './providers'
import { queryClient } from './queryClient'
import { router } from './router'

/**
 * 401 的善后动作在这里注入请求层:清缓存与跳登录都是装配层的决定,
 * shared/ 只保留注册点,不反向依赖 app/。
 */
setAuthFailureHandler(() => {
  queryClient.clear()
  void router.navigate({ to: '/login', replace: true })
})

export function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}
