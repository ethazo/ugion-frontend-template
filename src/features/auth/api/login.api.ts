import { http } from '@/lib/axios'

import type { LoginRequest, UserRole } from '../types'

export const loginApi = (data: LoginRequest): Promise<UserRole> => {
  return http.post<UserRole>('/login', data, {
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  })
}
