import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

import { AppErrorState } from '@/shared/ui/app-error-state'
import { AppPendingState } from '@/shared/ui/app-pending-state'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  pendingComponent: AppPendingState,
  errorComponent: AppErrorState,
  notFoundComponent: () => <AppErrorState title="页面不存在" description="地址可能已经变更。" />,
})
