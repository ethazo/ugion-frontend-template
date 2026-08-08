import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../lib/cn'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  /** 放主动作按钮,比如「新建」 */
  action?: ReactNode
  className?: string
}

/** 区域级空态。数据为空不是错误,所以不用 Alert,只做低强度提示。 */
function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-12 text-center',
        className,
      )}
    >
      <Icon className="text-muted-foreground size-8" />
      <p className="text-sm font-medium">{title}</p>
      {description === undefined ? null : (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
      {action === undefined ? null : <div className="mt-2">{action}</div>}
    </div>
  )
}

export { EmptyState }
