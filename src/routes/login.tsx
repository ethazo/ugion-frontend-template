import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { LoginPage, useRefreshCurrentUser } from '@/features/auth'

import { ROLE_META } from '@/app/roles'

export const Route = createFileRoute('/login')({
  component: LoginRoute,
})

function LoginRoute() {
  const refreshCurrentUser = useRefreshCurrentUser()
  const navigate = useNavigate()

  return (
    <LoginPage
      onSuccess={async () => {
        // 登录成功后才知道角色,落地路径由注册表决定,feature 不认识路由表
        const user = await refreshCurrentUser()
        await navigate({ to: ROLE_META[user.role].landing, replace: true })
      }}
    />
  )
}
