import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

import { PasswordLoginForm } from './PasswordLoginForm'

interface LoginPageProps {
  /** 登录成功后由装配层决定跳去哪里,feature 不认识路由表 */
  onSuccess: () => Promise<unknown>
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>登录</CardTitle>
          <CardDescription>请使用学校分配的账号登录</CardDescription>
        </CardHeader>

        <CardContent>
          <PasswordLoginForm onSuccess={onSuccess} />
        </CardContent>
      </Card>
    </main>
  )
}
