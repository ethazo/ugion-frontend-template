import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { errorMessage } from '@/shared/api'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'

import { loginWithPassword } from './api'

const schema = z.object({
  username: z.string().trim().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
})

type Values = z.infer<typeof schema>

interface PasswordLoginFormProps {
  onSuccess: () => Promise<unknown>
}

export function PasswordLoginForm({ onSuccess }: PasswordLoginFormProps) {
  const { control, handleSubmit } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  })

  const login = useMutation({
    mutationFn: loginWithPassword,
    onSuccess,
  })

  return (
    <form onSubmit={handleSubmit((values) => login.mutateAsync(values))} noValidate>
      <FieldGroup>
        {login.isError && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage(login.error)}</AlertDescription>
          </Alert>
        )}

        <Controller
          control={control}
          name="username"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-username">用户名</FieldLabel>
              <Input
                {...field}
                id="login-username"
                autoComplete="username"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-password">密码</FieldLabel>
              <Input
                {...field}
                id="login-password"
                type="password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        {/* isSuccess 也保持禁用:成功后要等 onSuccess 把用户拉回来并跳转,期间不该能再点 */}
        <Button type="submit" disabled={login.isPending || login.isSuccess}>
          {login.isPending ? '登录中…' : '登录'}
        </Button>
      </FieldGroup>
    </form>
  )
}
