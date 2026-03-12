import { useMutation } from '@tanstack/react-query'

import { loginApi } from '../api/login.api'
import { useAuthStore } from '../store/auth.store'

export const useLogin = () => {
  const signIn = useAuthStore((s) => s.signIn)

  return useMutation({
    mutationFn: loginApi,

    onSuccess: (role) => {
      signIn(role)
    },
  })
}
