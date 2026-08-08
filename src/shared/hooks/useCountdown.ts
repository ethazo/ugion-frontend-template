import { useEffect, useState } from 'react'

/**
 * 秒级倒计时。用 setTimeout 逐秒重排而不是 setInterval:
 * 每次只欠一个定时器,组件卸载或重新开始时不会留下漏掉清理的 interval。
 */
export function useCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (secondsLeft <= 0) return

    const timer = window.setTimeout(() => {
      setSecondsLeft(secondsLeft - 1)
    }, 1000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [secondsLeft])

  return { secondsLeft, isRunning: secondsLeft > 0, start: setSecondsLeft }
}
