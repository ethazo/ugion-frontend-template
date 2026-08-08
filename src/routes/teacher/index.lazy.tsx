import { createLazyFileRoute } from '@tanstack/react-router'

import { PlaceholderPage } from '@/features/example'

export const Route = createLazyFileRoute('/teacher/')({
  component: () => <PlaceholderPage title="教师首页" description="教师角色的落地页。" />,
})
