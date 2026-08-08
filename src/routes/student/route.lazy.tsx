import { createLazyFileRoute, Outlet } from '@tanstack/react-router'
import { BookOpen, LayoutDashboard } from 'lucide-react'

import type { NavItem } from '@/layouts/nav'
import { TopNavLayout } from '@/layouts/top-nav'

const NAV: readonly NavItem[] = [
  { label: '首页', to: '/student', icon: LayoutDashboard, exact: true },
  { label: '我的课程', to: '/student/courses', icon: BookOpen },
]

export const Route = createLazyFileRoute('/student')({
  component: () => (
    <TopNavLayout roleLabel="学生" nav={NAV}>
      <Outlet />
    </TopNavLayout>
  ),
})
