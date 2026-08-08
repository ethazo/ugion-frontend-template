import { createFileRoute, redirect } from '@tanstack/react-router'

import { loadCurrentUser } from '@/app/guards'
import { ROLE_LANDING } from '@/app/roles'

/** 根路径不渲染任何内容,只按角色把人送到自己的落地页。 */
export const Route = createFileRoute('/')({
  beforeLoad: async ({ context }) => {
    const user = await loadCurrentUser(context.queryClient)
    throw redirect({ to: ROLE_LANDING[user.role] })
  },
})
