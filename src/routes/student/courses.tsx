import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderPage } from '@/features/example'

export const Route = createFileRoute('/student/courses')({
  component: () => <PlaceholderPage title="我的课程" description="学生已选课程列表。" />,
})
