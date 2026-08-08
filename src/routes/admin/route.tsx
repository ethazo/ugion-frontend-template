import { createFileRoute } from '@tanstack/react-router'

import { loadCurrentUser, requireRole } from '@/app/guards'
import { RoleShell } from '@/app/RoleShell'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context }) => {
    const user = await loadCurrentUser(context.queryClient)
    requireRole(user.role, 'admin')
  },
  component: () => <RoleShell role="admin" />,
})
