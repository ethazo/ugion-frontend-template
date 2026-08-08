import type { LinkProps } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface NavItem {
  label: string
  /** 用 LinkProps['to'] 而非 string,写错路径在类型检查阶段就会暴露 */
  to: NonNullable<LinkProps['to']>
  icon: LucideIcon
  /** 段落首页要开 exact,否则停在子路由时它也会亮 */
  exact?: boolean
}

export interface LayoutProps {
  roleLabel: string
  nav: readonly NavItem[]
  children: ReactNode
}
