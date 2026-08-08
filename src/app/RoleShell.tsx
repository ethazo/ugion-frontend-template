import { Outlet } from '@tanstack/react-router'

import type { Role } from '@/shared/types/role'

import { SidebarLayout } from '@/layouts/sidebar'
import { TopNavLayout } from '@/layouts/top-nav'

import { type LayoutKind, ROLE_META } from './roles'

const LAYOUT_BY_KIND: Record<LayoutKind, typeof TopNavLayout> = {
  'top-nav': TopNavLayout,
  sidebar: SidebarLayout,
}

interface RoleShellProps {
  role: Role
}

/**
 * 注册表到布局组件的唯一转换点。路由文件只写 `<RoleShell role="admin" />`,
 * 换布局是改注册表里的一行,不牵动路由。
 */
export function RoleShell({ role }: RoleShellProps) {
  const meta = ROLE_META[role]
  const Layout = LAYOUT_BY_KIND[meta.layout]

  return (
    <Layout roleLabel={meta.label} nav={meta.nav}>
      <Outlet />
    </Layout>
  )
}
