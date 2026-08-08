import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark' | 'system'

// 与 index.html 里防闪烁脚本读取的 key 一致。存裸字符串而不是 JSON,
// 那段脚本在 React 之前运行,不该为了读一个值去解析结构。
const STORAGE_KEY = 'ugion-theme'

const THEME_MODES: readonly ThemeMode[] = ['light', 'dark', 'system']

function readStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return THEME_MODES.find((mode) => mode === stored) ?? 'system'
  } catch {
    // localStorage 被禁用时跟随系统
    return 'system'
  }
}

function writeStoredMode(mode: ThemeMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // 存不下不影响当前会话的主题
  }
}

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

const useThemeStore = create<ThemeState>()((set) => ({
  mode: readStoredMode(),
  setMode: (mode) => {
    writeStoredMode(mode)
    set({ mode })
    applyTheme(mode)
  },
}))

function darkQuery() {
  return window.matchMedia('(prefers-color-scheme: dark)')
}

function applyTheme(mode: ThemeMode) {
  const isDark = mode === 'dark' || (mode === 'system' && darkQuery().matches)
  document.documentElement.classList.toggle('dark', isDark)
}

/**
 * 由 app/ 在挂载前调用一次。订阅放模块级而不是 useEffect 里:
 * 主题是全局单例,每个用到 useTheme 的组件各挂一个 matchMedia 监听没有意义。
 */
export function initTheme() {
  const mode = useThemeStore.getState().mode
  applyTheme(mode)
  darkQuery().addEventListener('change', () => {
    if (useThemeStore.getState().mode !== 'system') return
    applyTheme('system')
  })
}

export function useTheme() {
  const mode = useThemeStore((state) => state.mode)
  const setMode = useThemeStore((state) => state.setMode)
  return { mode, setMode }
}
