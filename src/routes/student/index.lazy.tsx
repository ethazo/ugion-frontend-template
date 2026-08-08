import { createLazyFileRoute } from '@tanstack/react-router'

import { PlaceholderPage } from '@/features/example'

export const Route = createLazyFileRoute('/student/')({
  component: () => <PlaceholderPage title="学生首页" description="学生角色的落地页。" />,
})
