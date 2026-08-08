import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderPage } from '@/features/example'

export const Route = createFileRoute('/student/')({
  component: () => <PlaceholderPage title="学生首页" description="学生角色的落地页。" />,
})
