import { createLazyFileRoute } from '@tanstack/react-router'

import { PlaceholderPage } from '@/features/example'

export const Route = createLazyFileRoute('/admin/')({
  component: () => <PlaceholderPage title="管理首页" description="管理员角色的落地页。" />,
})
