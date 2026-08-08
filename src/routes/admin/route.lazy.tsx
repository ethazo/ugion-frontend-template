import { createLazyFileRoute, Outlet } from '@tanstack/react-router'
import { LayoutDashboard, Settings, Users } from 'lucide-react'

import type { NavItem } from '@/layouts/nav'
import { SidebarLayout } from '@/layouts/sidebar'

// 导航就近声明。路由路径已经写死了这里是管理员,再由注册表按角色查一次表
// 只会把三个角色的外壳绑进同一个 chunk。布局仍按形态选,内部不认识角色。
const NAV: readonly NavItem[] = [
  { label: '概览', to: '/admin', icon: LayoutDashboard, exact: true },
  { label: '用户管理', to: '/admin/users', icon: Users },
  { label: '系统设置', to: '/admin/settings', icon: Settings },
]

export const Route = createLazyFileRoute('/admin')({
  component: () => (
    <SidebarLayout roleLabel="管理员" nav={NAV}>
      <Outlet />
    </SidebarLayout>
  ),
})
