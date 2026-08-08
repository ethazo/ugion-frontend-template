import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { errorMessage } from '@/shared/api'
import { useCountdown } from '@/shared/hooks/useCountdown'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'

import { loginWithSms, requestSmsCode } from './api'

const RESEND_SECONDS = 60

const schema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  code: z.string().regex(/^\d{6}$/, '验证码是 6 位数字'),
})

type Values = z.infer<typeof schema>

interface SmsLoginFormProps {
  onSuccess: () => Promise<unknown>
}

export function SmsLoginForm({ onSuccess }: SmsLoginFormProps) {
  // 后端要求登录时带回发码接口给的 sendToken,它不属于用户输入,所以不进表单
  const [sendToken, setSendToken] = useState<string | null>(null)
  const { secondsLeft, isRunning, start } = useCountdown()

  const { control, handleSubmit, getValues, trigger } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', code: '' },
  })

  const sendCode = useMutation({
    mutationFn: requestSmsCode,
    onSuccess: (data) => {
      setSendToken(data.sendToken)
      start(RESEND_SECONDS)
    },
  })

  const login = useMutation({
    mutationFn: loginWithSms,
    onSuccess,
  })

  const handleSendCode = async () => {
    // 只校验手机号:此时验证码还没填,整表校验会误报
    if (!(await trigger('phone'))) return

    sendCode.mutate({ phone: getValues('phone'), scene: 'login' })
  }

  const failure = login.error ?? sendCode.error

  return (
    <form
      onSubmit={handleSubmit((values) =>
        login.mutateAsync({ ...values, ...(sendToken === null ? {} : { sendToken }) }),
      )}
      noValidate
    >
      <FieldGroup>
        {failure !== null && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage(failure)}</AlertDescription>
          </Alert>
        )}

        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-phone">手机号</FieldLabel>
              <Input
                {...field}
                id="login-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="code"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-code">验证码</FieldLabel>
              <div className="flex gap-2">
                <Input
                  {...field}
                  id="login-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-invalid={fieldState.invalid}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  disabled={isRunning || sendCode.isPending}
                  onClick={handleSendCode}
                >
                  {isRunning ? `${secondsLeft} 秒后重发` : '获取验证码'}
                </Button>
              </div>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Button type="submit" disabled={login.isPending || login.isSuccess}>
          {login.isPending ? '登录中…' : '登录'}
        </Button>
      </FieldGroup>
    </form>
  )
}
