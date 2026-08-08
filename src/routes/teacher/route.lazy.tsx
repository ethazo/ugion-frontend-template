import { createLazyFileRoute, Outlet } from '@tanstack/react-router'
import { GraduationCap, LayoutDashboard } from 'lucide-react'

import type { NavItem } from '@/layouts/nav'
import { TopNavLayout } from '@/layouts/top-nav'

const NAV: readonly NavItem[] = [
  { label: '首页', to: '/teacher', icon: LayoutDashboard, exact: true },
  { label: '我的班级', to: '/teacher/classes', icon: GraduationCap },
]

export const Route = createLazyFileRoute('/teacher')({
  component: () => (
    <TopNavLayout roleLabel="教师" nav={NAV}>
      <Outlet />
    </TopNavLayout>
  ),
})
