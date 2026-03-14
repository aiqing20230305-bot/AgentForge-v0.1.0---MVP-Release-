/**
 * useTimeout & useInterval Hooks
 * 定时器Hook，简化setTimeout和setInterval的使用和清理
 */

import { useEffect, useRef, useCallback, useState } from 'react'

/**
 * 使用setTimeout
 *
 * @param callback - 回调函数
 * @param delay - 延迟时间（毫秒），null则不启动
 *
 * @example
 * useTimeout(() => {
 *   console.log('Executed after 3 seconds')
 * }, 3000)
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) {
      return
    }

    const timeoutId = setTimeout(() => {
      savedCallback.current()
    }, delay)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [delay])
}

/**
 * 可控制的Timeout Hook
 *
 * @param callback - 回调函数
 * @param delay - 延迟时间（毫秒）
 * @returns [start, cancel, reset]
 *
 * @example
 * const [start, cancel, reset] = useControllableTimeout(() => {
 *   console.log('Timeout!')
 * }, 5000)
 *
 * <button onClick={start}>Start</button>
 * <button onClick={cancel}>Cancel</button>
 * <button onClick={reset}>Reset</button>
 */
export function useControllableTimeout(
  callback: () => void,
  delay: number
): [() => void, () => void, () => void] {
  const savedCallback = useRef(callback)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  const start = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      savedCallback.current()
    }, delay)
  }, [delay])

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  const reset = useCallback(() => {
    cancel()
    start()
  }, [cancel, start])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [start, cancel, reset]
}

/**
 * 使用setInterval
 *
 * @param callback - 回调函数
 * @param delay - 间隔时间（毫秒），null则不启动
 *
 * @example
 * useInterval(() => {
 *   console.log('Executed every second')
 * }, 1000)
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) {
      return
    }

    const intervalId = setInterval(() => {
      savedCallback.current()
    }, delay)

    return () => {
      clearInterval(intervalId)
    }
  }, [delay])
}

/**
 * 可控制的Interval Hook
 *
 * @param callback - 回调函数
 * @param delay - 间隔时间（毫秒）
 * @returns [start, stop, toggle, isRunning]
 *
 * @example
 * const [start, stop, toggle, isRunning] = useControllableInterval(() => {
 *   console.log('Tick')
 * }, 1000)
 *
 * <button onClick={toggle}>
 *   {isRunning ? 'Pause' : 'Start'}
 * </button>
 */
export function useControllableInterval(
  callback: () => void,
  delay: number
): [() => void, () => void, () => void, boolean] {
  const [isRunning, setIsRunning] = useState(false)
  const savedCallback = useRef(callback)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  const start = useCallback(() => {
    if (intervalRef.current) {
      return
    }

    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      savedCallback.current()
    }, delay)
  }, [delay])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
      setIsRunning(false)
    }
  }, [])

  const toggle = useCallback(() => {
    if (isRunning) {
      stop()
    } else {
      start()
    }
  }, [isRunning, start, stop])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return [start, stop, toggle, isRunning]
}

/**
 * 倒计时Hook
 *
 * @param initialSeconds - 初始秒数
 * @param onComplete - 倒计时完成的回调
 * @returns [seconds, start, pause, reset, isRunning]
 *
 * @example
 * const [seconds, start, pause, reset, isRunning] = useCountdown(60, () => {
 *   alert('Time is up!')
 * })
 *
 * <div>
 *   {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
 * </div>
 * <button onClick={isRunning ? pause : start}>
 *   {isRunning ? 'Pause' : 'Start'}
 * </button>
 */
export function useCountdown(
  initialSeconds: number,
  onComplete?: () => void
): [number, () => void, () => void, () => void, boolean] {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!isRunning) {
      return
    }

    if (seconds <= 0) {
      setIsRunning(false)
      onCompleteRef.current?.()
      return
    }

    const intervalId = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          onCompleteRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [isRunning, seconds])

  const start = useCallback(() => {
    if (seconds > 0) {
      setIsRunning(true)
    }
  }, [seconds])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    setSeconds(initialSeconds)
    setIsRunning(false)
  }, [initialSeconds])

  return [seconds, start, pause, reset, isRunning]
}

/**
 * 计时器Hook（正向计数）
 *
 * @param autoStart - 是否自动开始
 * @returns [seconds, start, pause, reset, isRunning]
 *
 * @example
 * const [seconds, start, pause, reset, isRunning] = useStopwatch()
 *
 * <div>Elapsed: {seconds}s</div>
 * <button onClick={isRunning ? pause : start}>
 *   {isRunning ? 'Pause' : 'Start'}
 * </button>
 */
export function useStopwatch(
  autoStart: boolean = false
): [number, () => void, () => void, () => void, boolean] {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(autoStart)

  useEffect(() => {
    if (!isRunning) {
      return
    }

    const intervalId = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [isRunning])

  const start = useCallback(() => {
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    setSeconds(0)
    setIsRunning(false)
  }, [])

  return [seconds, start, pause, reset, isRunning]
}

/**
 * 延迟执行Hook（等待delay后执行）
 *
 * @param value - 要延迟的值
 * @param delay - 延迟时间（毫秒）
 * @returns 延迟后的值
 *
 * @example
 * const deferredValue = useDeferredValue(searchQuery, 500)
 *
 * // deferredValue 会在 searchQuery 变化后 500ms 更新
 */
export function useDeferredValue<T>(value: T, delay: number): T {
  const [deferredValue, setDeferredValue] = useState(value)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDeferredValue(value)
    }, delay)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [value, delay])

  return deferredValue
}

/**
 * RAF循环Hook（使用requestAnimationFrame）
 *
 * @param callback - 每帧执行的回调
 * @param isRunning - 是否运行
 *
 * @example
 * const [isAnimating, setIsAnimating] = useState(true)
 *
 * useRAFLoop((deltaTime) => {
 *   // 每帧更新动画
 *   updateAnimation(deltaTime)
 * }, isAnimating)
 */
export function useRAFLoop(callback: (deltaTime: number) => void, isRunning: boolean = true) {
  const savedCallback = useRef(callback)
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!isRunning) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
      return
    }

    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current
        savedCallback.current(deltaTime)
      }

      previousTimeRef.current = time
      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [isRunning])
}

/**
 * 空闲回调Hook（使用requestIdleCallback）
 *
 * @param callback - 空闲时执行的回调
 * @param options - requestIdleCallback选项
 *
 * @example
 * useIdleCallback(() => {
 *   // 浏览器空闲时执行低优先级任务
 *   processLowPriorityData()
 * })
 */
export function useIdleCallback(
  callback: () => void,
  options?: IdleRequestOptions
) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (typeof window === 'undefined' || !('requestIdleCallback' in window)) {
      // 降级到 setTimeout
      const timeoutId = setTimeout(() => {
        savedCallback.current()
      }, 0)

      return () => {
        clearTimeout(timeoutId)
      }
    }

    const idleCallbackId = window.requestIdleCallback(() => {
      savedCallback.current()
    }, options)

    return () => {
      window.cancelIdleCallback(idleCallbackId)
    }
  }, [options])
}
