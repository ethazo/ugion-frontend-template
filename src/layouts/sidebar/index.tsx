import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useState } from 'react'

import { useSidebar } from '@/shared/hooks/useSidebar'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui/sheet'

import type { LayoutProps } from '../nav'
import { UserArea } from '../user-area'
import { SidebarNav } from './SidebarNav'

/** 导航竖排在侧栏,适合入口较多、需要分组的角色。 */
export function SidebarLayout({ roleLabel, nav, children }: LayoutProps) {
  const isCollapsed = useSidebar((state) => state.isCollapsed)
  const toggle = useSidebar((state) => state.toggle)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex min-h-svh">
      <aside
        className={cn(
          'bg-sidebar text-sidebar-foreground hidden shrink-0 flex-col border-r transition-[width] md:flex',
          isCollapsed ? 'w-14' : 'w-56',
        )}
      >
        <div className={cn('flex h-14 items-center px-3', isCollapsed && 'justify-center px-0')}>
          <span className={cn('text-sm font-semibold', isCollapsed && 'sr-only')}>ugion</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SidebarNav nav={nav} isCollapsed={isCollapsed} />
        </div>

        <div className={cn('flex p-2', isCollapsed ? 'justify-center' : 'justify-end')}>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggle}
            aria-label={isCollapsed ? '展开侧栏' : '收起侧栏'}
          >
            {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/80 sticky top-0 z-40 flex h-14 items-center gap-2 border-b px-4 backdrop-blur">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="打开导航" />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
              <SheetHeader>
                <SheetTitle>导航</SheetTitle>
              </SheetHeader>
              <SidebarNav nav={nav} isCollapsed={false} onNavigate={() => setIsMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex-1" />
          <UserArea roleLabel={roleLabel} />
        </header>

        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
