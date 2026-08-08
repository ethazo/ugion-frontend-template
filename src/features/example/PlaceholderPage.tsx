import { Construction } from 'lucide-react'

import { EmptyState } from '@/shared/ui/empty-state'

interface PlaceholderPageProps {
  title: string
  description: string
}

/**
 * 示例页面,只为让骨架跑起来:能看到布局、导航高亮、用户区和主题切换。
 * 起新项目时整个 features/example 目录连同引用它的路由一起删掉。
 */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </header>

      <EmptyState
        icon={Construction}
        title="这里还没有内容"
        description="示例页面,换成真实业务时删掉 features/example。"
      />
    </div>
  )
}
