import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'

import { useRefreshCurrentUser } from '@/shared/session'

import { LoginPage } from '@/features/auth'

import { ROLE_LANDING } from '@/app/roles'

export const Route = createLazyFileRoute('/login')({
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
        await navigate({ to: ROLE_LANDING[user.role], replace: true })
      }}
    />
  )
}
