import { Link } from '@tanstack/react-router'

import { cn } from '@/shared/lib/cn'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

import type { NavItem } from '../nav'

interface SidebarNavProps {
  nav: readonly NavItem[]
  isCollapsed: boolean
  onNavigate?: () => void
}

export function SidebarNav({ nav, isCollapsed, onNavigate }: SidebarNavProps) {
  return (
    <nav className="flex flex-col gap-1 p-2">
      {nav.map((item) => {
        const link = (
          <Link
            to={item.to}
            activeOptions={{ exact: item.exact ?? false }}
            onClick={onNavigate}
            className={cn(
              'text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
              'data-[status=active]:bg-muted data-[status=active]:text-foreground data-[status=active]:font-medium',
              isCollapsed && 'justify-center px-0',
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span className={cn(isCollapsed && 'sr-only')}>{item.label}</span>
          </Link>
        )

        if (!isCollapsed) return <div key={item.to}>{link}</div>

        // 收起后只剩图标,标签靠 tooltip 补回来
        return (
          <Tooltip key={item.to}>
            <TooltipTrigger render={link} />
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        )
      })}
    </nav>
  )
}
