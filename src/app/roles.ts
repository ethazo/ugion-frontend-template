import { BookOpen, GraduationCap, LayoutDashboard, Settings, Users } from 'lucide-react'

import type { Role } from '@/shared/types/role'

import type { NavItem } from '@/layouts/nav'

export type LayoutKind = 'top-nav' | 'sidebar'

interface RoleMeta {
  label: string
  /** 登录后与访问根路径时的落地页 */
  landing: NavItem['to']
  /** layout 是一次选择而非归属:学生和教师同选 top-nav,复用同一个布局组件 */
  layout: LayoutKind
  nav: readonly NavItem[]
}

export const ROLE_META: Record<Role, RoleMeta> = {
  student: {
    label: '学生',
    landing: '/student',
    layout: 'top-nav',
    nav: [
      { label: '首页', to: '/student', icon: LayoutDashboard, exact: true },
      { label: '我的课程', to: '/student/courses', icon: BookOpen },
    ],
  },
  teacher: {
    label: '教师',
    landing: '/teacher',
    layout: 'top-nav',
    nav: [
      { label: '首页', to: '/teacher', icon: LayoutDashboard, exact: true },
      { label: '我的班级', to: '/teacher/classes', icon: GraduationCap },
    ],
  },
  admin: {
    label: '管理员',
    landing: '/admin',
    layout: 'sidebar',
    nav: [
      { label: '概览', to: '/admin', icon: LayoutDashboard, exact: true },
      { label: '用户管理', to: '/admin/users', icon: Users },
      { label: '系统设置', to: '/admin/settings', icon: Settings },
    ],
  },
}
