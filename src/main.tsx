import '@/styles/global.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/app/App'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('#root 不存在,index.html 被改坏了')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
