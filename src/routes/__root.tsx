import { type QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from 'sonner'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => {
    return (
      <>
        <Outlet />
        <Toaster position="top-right" duration={3000} richColors />
        {import.meta.env.VITE_DEVTOOLS === true && (
          <>
            <ReactQueryDevtools buttonPosition="bottom-left" />
            <TanStackRouterDevtools position="bottom-right" />
          </>
        )}
      </>
    )
  },
  notFoundComponent: () => {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="mb-6 text-gray-600">抱歉，您访问的页面不存在。</p>
      </div>
    )
  },
  errorComponent: ({ error }) => {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <h1 className="text-4xl font-bold mb-4">出错啦</h1>
        <p className="mb-6 text-red-600">{error?.message ?? '发生了未知错误。'}</p>
      </div>
    )
  },
})