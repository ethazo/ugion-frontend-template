import { RouterProvider } from '@tanstack/react-router'

import { initTheme } from '@/shared/hooks/useTheme'

import { Providers } from './providers'
import { router } from './router'

// 模块级而不是 useEffect:StrictMode 下会跑两次,而系统主题监听只该挂一个
initTheme()

export function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}
