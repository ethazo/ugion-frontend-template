import { create } from 'zustand'

const STORAGE_KEY = 'ugion-sidebar-collapsed'

function readStoredCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

interface SidebarState {
  isCollapsed: boolean
  toggle: () => void
}

/** 侧栏折叠是外壳级 UI 状态,和主题一样属于 Zustand 少数几个合理用途。 */
export const useSidebar = create<SidebarState>()((set, get) => ({
  isCollapsed: readStoredCollapsed(),
  toggle: () => {
    const next = !get().isCollapsed
    try {
      localStorage.setItem(STORAGE_KEY, String(next))
    } catch {
      // 存不下不影响当前会话
    }
    set({ isCollapsed: next })
  },
}))
