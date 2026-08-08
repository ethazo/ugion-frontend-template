/**
 * 401 要做的事情(清 Query 缓存、跳登录)属于装配层,但拦截发生在请求层。
 * shared/ 不能反向依赖 app/,所以这里只留一个注册点,由 app/ 在启动时填入具体行为。
 */
type AuthFailureHandler = () => void

let handler: AuthFailureHandler | null = null

export function setAuthFailureHandler(next: AuthFailureHandler) {
  handler = next
}

export function notifyAuthFailure() {
  handler?.()
}
