import { RotateCcw } from 'lucide-react'

import { errorMessage } from '../api'
import { Alert, AlertDescription, AlertTitle } from './alert'
import { Button } from './button'

interface AppErrorStateProps {
  title?: string
  description?: string
  error?: unknown
  /** 由 Router 的 errorComponent 传入,用来重置错误边界并重跑 loader */
  reset?: () => void
}

/**
 * 整页错误态。同时充当路由的 errorComponent,因此 props 兼容 Router 传进来的形状。
 * 启动引导拿不到当前用户时用户看到的就是这里,所以必须给出重试入口,不能停在空白页。
 */
function AppErrorState({ title = '加载失败', description, error, reset }: AppErrorStateProps) {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Alert variant="destructive" className="max-w-md">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-4">
          <span>{description ?? errorMessage(error)}</span>
          {reset === undefined ? null : (
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw />
              重试
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  )
}

export { AppErrorState }
