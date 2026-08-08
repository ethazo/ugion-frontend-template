// 环境变量在这里集中读取一次,应用其余位置不出现 import.meta.env。
// 部署子路径读 BASE_URL 而不是 VITE_BASE_PATH:后者由 vite.config.ts 喂给 Vite 的 base,
// Vite 归一化后就是 BASE_URL(始终以 / 结尾),再读一遍原始变量只会多一份需要对齐的值。
export const BASE_PATH = import.meta.env.BASE_URL

export const IS_DEV = import.meta.env.DEV

/** 拼接带部署子路径的绝对地址,子路径部署时才不会 404。 */
export function withBasePath(path: string) {
  return `${BASE_PATH}${path.replace(/^\//, '')}`
}

/**
 * 接口地址只经这一个函数产出,请求层与 fileUrl 共用。
 * 分成两处拼会让子路径部署时两者对 base 的处理不一致,而这类问题只在交付当天才暴露。
 */
export function apiUrl(path: string) {
  return withBasePath(`/api/${path.replace(/^\//, '')}`)
}
