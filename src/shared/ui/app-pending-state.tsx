import { Skeleton } from './skeleton'

/** 启动引导与路由切换期间的占位。撑满视口高度,避免内容到位时页面整体跳动。 */
function AppPendingState() {
  return (
    <div className="flex min-h-svh flex-col gap-4 p-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">加载中</span>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="flex-1" />
    </div>
  )
}

export { AppPendingState }
