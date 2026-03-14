/**
 * useThrottle Hook
 * 节流Hook，用于优化滚动、窗口调整等高频事件
 */

import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * 节流值Hook - 限制值更新频率
 *
 * @param value - 要节流的值
 * @param interval - 最小更新间隔（毫秒）
 * @returns 节流后的值
 *
 * @example
 * const [scrollY, setScrollY] = useState(0)
 * const throttledScrollY = useThrottle(scrollY, 200)
 *
 * useEffect(() => {
 *   // 只在每200ms更新一次
 *   updateNavbar(throttledScrollY)
 * }, [throttledScrollY])
 */
export function useThrottle<T>(value: T, interval: number = 200): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastExecuted = useRef<number>(Date.now())

  useEffect(() => {
    const now = Date.now()
    const timeSinceLastExecution = now - lastExecuted.current

    if (timeSinceLastExecution >= interval) {
      lastExecuted.current = now
      setThrottledValue(value)
    } else {
      const timeoutId = setTimeout(() => {
        lastExecuted.current = Date.now()
        setThrottledValue(value)
      }, interval - timeSinceLastExecution)

      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [value, interval])

  return throttledValue
}

/**
 * 节流回调Hook - 限制函数执行频率
 *
 * @param callback - 要节流的回调函数
 * @param interval - 最小执行间隔（毫秒）
 * @returns 节流后的函数
 *
 * @example
 * const handleScroll = useThrottledCallback(() => {
 *   console.log('Scroll position:', window.scrollY)
 * }, 200)
 *
 * <div onScroll={handleScroll}>...</div>
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  interval: number = 200
): (...args: Parameters<T>) => void {
  const lastRun = useRef<number>(Date.now())
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      const timeSinceLastRun = now - lastRun.current

      if (timeSinceLastRun >= interval) {
        lastRun.current = now
        callback(...args)
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          lastRun.current = Date.now()
          callback(...args)
        }, interval - timeSinceLastRun)
      }
    },
    [callback, interval]
  )
}

/**
 * RAF节流Hook - 使用requestAnimationFrame节流（最适合动画和滚动）
 *
 * @param callback - 要节流的回调函数
 * @returns RAF节流后的函数
 *
 * @example
 * const handleScroll = useRAFThrottle(() => {
 *   // 每帧最多执行一次，保证60fps
 *   updateParallax(window.scrollY)
 * })
 */
export function useRAFThrottle<T extends (...args: any[]) => any>(
  callback: T
): (...args: Parameters<T>) => void {
  const rafRef = useRef<number>()
  const argsRef = useRef<Parameters<T>>()

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: Parameters<T>) => {
      argsRef.current = args

      if (rafRef.current) {
        return
      }

      rafRef.current = requestAnimationFrame(() => {
        if (argsRef.current) {
          callback(...argsRef.current)
        }
        rafRef.current = undefined
      })
    },
    [callback]
  )
}

/**
 * 带前缘触发的节流Hook
 *
 * @param callback - 要节流的回调函数
 * @param interval - 最小执行间隔（毫秒）
 * @param leading - 是否在前缘触发（默认true）
 * @param trailing - 是否在后缘触发（默认true）
 * @returns 节流后的函数
 *
 * @example
 * // 立即执行第一次，后续节流
 * const handleClick = useThrottledCallbackWithOptions(
 *   () => console.log('Clicked'),
 *   1000,
 *   true,
 *   false
 * )
 */
export function useThrottledCallbackWithOptions<T extends (...args: any[]) => any>(
  callback: T,
  interval: number = 200,
  leading: boolean = true,
  trailing: boolean = true
): (...args: Parameters<T>) => void {
  const lastRun = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastArgs = useRef<Parameters<T>>()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      const timeSinceLastRun = now - lastRun.current

      lastArgs.current = args

      // 前缘触发
      if (leading && timeSinceLastRun >= interval) {
        lastRun.current = now
        callback(...args)
        return
      }

      // 后缘触发
      if (trailing) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          lastRun.current = Date.now()
          if (lastArgs.current) {
            callback(...lastArgs.current)
          }
        }, interval - timeSinceLastRun)
      }
    },
    [callback, interval, leading, trailing]
  )
}
