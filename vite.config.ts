import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const DEFAULT_PROXY_TARGET = 'http://main.uniplt.tclocal.ugion.com'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [
      tanstackRouter({
        target: 'react',
        routesDirectory: 'src/routes',
        // 生成物属于装配层,和 router 实例放一起;留在 src/ 根上会显得像一个平级分层
        generatedRouteTree: 'src/app/routeTree.gen.ts',
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || DEFAULT_PROXY_TARGET,
          changeOrigin: true,
        },
      },
    },
    build: {
      target: 'es2023',
    },
  }
})
