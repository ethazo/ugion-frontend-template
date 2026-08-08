import { createFileRoute } from '@tanstack/react-router'

import { loadCurrentUser, requireRole } from '@/app/guards'

// 守卫留在 eager 文件里:beforeLoad 必须在任何界面挂载前跑完。
// 外壳(布局与导航)在 route.lazy.tsx,那部分只有管理员会下载。
export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context }) => {
    const user = await loadCurrentUser(context.queryClient)
    requireRole(user.role, 'admin')
  },
})
