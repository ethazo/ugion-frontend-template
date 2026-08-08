import { Link } from '@tanstack/react-router'

import { cn } from '@/shared/lib/cn'

import type { LayoutProps } from '../nav'
import { UserArea } from '../user-area'

/** 导航横排在顶栏,适合入口数量少的角色。 */
export function TopNavLayout({ roleLabel, nav, children }: LayoutProps) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4">
          <span className="text-sm font-semibold">ugion</span>

          <nav className="flex flex-1 items-center gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact ?? false }}
                className={cn(
                  'text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                  'data-[status=active]:bg-muted data-[status=active]:text-foreground data-[status=active]:font-medium',
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <UserArea roleLabel={roleLabel} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  )
}
