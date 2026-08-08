import { createLazyFileRoute } from '@tanstack/react-router'

import { PlaceholderPage } from '@/features/example'

export const Route = createLazyFileRoute('/admin/settings')({
  component: () => <PlaceholderPage title="系统设置" description="全站参数与开关。" />,
})
