import { useState } from 'react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { FieldSeparator } from '@/shared/ui/field'

import { PasswordLoginForm } from './PasswordLoginForm'
import { SmsLoginForm } from './SmsLoginForm'

type Mode = 'password' | 'sms'

const OTHER_MODE: Record<Mode, { mode: Mode; label: string }> = {
  password: { mode: 'sms', label: '用短信验证码登录' },
  sms: { mode: 'password', label: '用账号密码登录' },
}

interface LoginPageProps {
  /** 登录成功后由装配层决定跳去哪里,feature 不认识路由表 */
  onSuccess: () => Promise<unknown>
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const [mode, setMode] = useState<Mode>('password')
  const other = OTHER_MODE[mode]

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>登录</CardTitle>
          <CardDescription>请使用学校分配的账号登录</CardDescription>
        </CardHeader>

        <CardContent>
          {/* key 让切换方式时卸载旧表单:否则上一种方式的报错和输入会残留 */}
          {mode === 'password' ? (
            <PasswordLoginForm key="password" onSuccess={onSuccess} />
          ) : (
            <SmsLoginForm key="sms" onSuccess={onSuccess} />
          )}

          <FieldSeparator className="my-6" />

          <Button
            type="button"
            variant="link"
            className="mx-auto block"
            onClick={() => setMode(other.mode)}
          >
            {other.label}
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
