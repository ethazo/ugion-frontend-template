import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderPage } from '@/features/example'

export const Route = createFileRoute('/teacher/classes')({
  component: () => <PlaceholderPage title="我的班级" description="教师任教的班级列表。" />,
})
