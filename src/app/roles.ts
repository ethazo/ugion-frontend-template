import type { LinkProps } from '@tanstack/react-router'

import type { Role } from '@/shared/types/role'

/**
 * 只登记「拿到角色之后才知道去哪」的信息:守卫纠偏、根路径分流、登录后跳转。
 *
 * 布局与导航不在这里。那些只被已经知道自己是谁的代码读取(各角色的 route.lazy.tsx),
 * 集中登记会让三个角色的外壳互相牵连,打包时也分不开。
 */
export const ROLE_LANDING: Record<Role, NonNullable<LinkProps['to']>> = {
  student: '/student',
  teacher: '/teacher',
  admin: '/admin',
}
