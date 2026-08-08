import { createLazyFileRoute } from '@tanstack/react-router'

import { PlaceholderPage } from '@/features/example'

export const Route = createLazyFileRoute('/admin/users')({
  component: () => <PlaceholderPage title="用户管理" description="全站用户的增删改查。" />,
})
