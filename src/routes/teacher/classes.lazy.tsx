import { createLazyFileRoute } from '@tanstack/react-router'

import { PlaceholderPage } from '@/features/example'

export const Route = createLazyFileRoute('/teacher/classes')({
  component: () => <PlaceholderPage title="我的班级" description="教师任教的班级列表。" />,
})
