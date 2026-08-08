import { createFileRoute } from '@tanstack/react-router'

import { loadCurrentUser, requireRole } from '@/app/guards'

export const Route = createFileRoute('/student')({
  beforeLoad: async ({ context }) => {
    const user = await loadCurrentUser(context.queryClient)
    requireRole(user.role, 'student')
  },
})
