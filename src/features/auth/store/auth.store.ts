import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { UserRole } from '../types'

interface AuthState {
  currentRole: UserRole | null
  isAuthenticated: boolean

  signIn: (role: UserRole) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentRole: null,
      isAuthenticated: false,

      signIn: (role) =>
        set({
          currentRole: role,
          isAuthenticated: true,
        }),

      signOut: () =>
        set({
          currentRole: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentRole: state.currentRole,
      }),
    },
  ),
)
