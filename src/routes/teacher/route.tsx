import { createFileRoute } from '@tanstack/react-router'

import { loadCurrentUser, requireRole } from '@/app/guards'
import { RoleShell } from '@/app/RoleShell'

export const Route = createFileRoute('/teacher')({
  beforeLoad: async ({ context }) => {
    const user = await loadCurrentUser(context.queryClient)
    requireRole(user.role, 'teacher')
  },
  component: () => <RoleShell role="teacher" />,
})
