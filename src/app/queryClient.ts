import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'

import { isAuthError, retryApiError } from '@/shared/api'

/**
 * 会话中途失效的善后点。启动时的 401 由 guards.ts 的 redirect 负责,
 * 那条路在 beforeLoad 里、是路由自己的机制;这里管的是用户已经在页面上、
 * 某个请求突然 401 的情况——它不经过 beforeLoad,没人接就只能显示一个看不懂的错误态。
 *
 * router 反过来依赖 queryClient(要拿它做 context),所以在函数里动态引入而不是顶部 import,
 * 静态成环会让 createRouter 读到还没赋值的 queryClient。
 */
function redirectToLogin() {
  void import('./router').then(({ router }) => {
    // 登录页自己的 401(比如密码错误)要留给表单展示,不能把人从登录页再送回登录页
    if (router.state.location.pathname.endsWith('/login')) return

    void router.navigate({ to: '/login', replace: true })
  })
}

function handleError(error: unknown) {
  if (isAuthError(error)) redirectToLogin()
}

export const queryClient = new QueryClient({
  // 全局 onError 而不是在请求层注册回调:跳转是装配层的决定,而这里已经在装配层
  queryCache: new QueryCache({ onError: handleError }),
  mutationCache: new MutationCache({ onError: handleError }),
  defaultOptions: {
    queries: {
      // 只有 5xx 与网络错误值得再试一次,4xx 与 schema 不匹配重试只是重复失败
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
