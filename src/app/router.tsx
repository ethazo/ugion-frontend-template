import { createRouter } from '@tanstack/react-router'

import { BASE_PATH } from '@/shared/lib/env'

import { queryClient } from './queryClient'
import { routeTree } from './routeTree.gen'

export const router = createRouter({
  routeTree,
  // 与 Vite 的 base 同源,只配一处会导致资源或路由其中之一 404
  basepath: BASE_PATH,
  context: { queryClient },
  defaultPreload: 'intent',
  // Query 已经在缓存数据,Router 不需要再存一份
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
