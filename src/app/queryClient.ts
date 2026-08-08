import { QueryClient } from '@tanstack/react-query'

import { retryApiError } from '@/shared/api'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 重试策略由请求层的错误分类决定:只有 5xx 与网络错误值得再试一次
      retry: retryApiError,
      staleTime: 30 * 1000,
      // 内网环境窗口切换频繁,聚焦就重拉会产生大量无意义请求
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
