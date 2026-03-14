/**
 * useAnimatedCounter Hook
 * 数字递增动画Hook，用于经验值、金币等数值的平滑过渡
 */

import { useState, useEffect, useRef } from 'react'

interface UseAnimatedCounterOptions {
  /** 动画持续时间（毫秒） */
  duration?: number
  /** 缓动函数 */
  easing?: (t: number) => number
  /** 小数位数 */
  decimals?: number
  /** 是否立即开始动画 */
  autoStart?: boolean
}

/**
 * 数字递增动画Hook
 *
 * @example
 * const count = useAnimatedCounter(1000, { duration: 800 })
 * return <div>{count}</div>
 */
export function useAnimatedCounter(
  target: number,
  options: UseAnimatedCounterOptions = {}
): number {
  const {
    duration = 800,
    easing = easeOutQuad,
    decimals = 0,
    autoStart = true
  } = options

  const [current, setCurrent] = useState(autoStart ? 0 : target)
  const rafRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const startValueRef = useRef(current)

  useEffect(() => {
    if (!autoStart) {
      setCurrent(target)
      return
    }

    startValueRef.current = current
    startTimeRef.current = undefined

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easing(progress)

      const nextValue = startValueRef.current + (target - startValueRef.current) * easedProgress
      setCurrent(Number(nextValue.toFixed(decimals)))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [target, duration, easing, decimals, autoStart])

  return current
}

/**
 * 缓动函数集合
 */

// easeOutQuad
function easeOutQuad(t: number): number {
  return t * (2 - t)
}

// easeInOutQuad
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

// easeOutCubic
function easeOutCubic(t: number): number {
  return --t * t * t + 1
}

// easeOutExpo
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/**
 * 带暂停/恢复的数字动画Hook
 */
export function useControllableCounter(
  target: number,
  options: UseAnimatedCounterOptions = {}
) {
  const [isPaused, setIsPaused] = useState(false)
  const [internalTarget, setInternalTarget] = useState(target)

  const count = useAnimatedCounter(internalTarget, {
    ...options,
    autoStart: !isPaused
  })

  useEffect(() => {
    if (!isPaused) {
      setInternalTarget(target)
    }
  }, [target, isPaused])

  const pause = () => setIsPaused(true)
  const resume = () => setIsPaused(false)
  const reset = () => {
    setInternalTarget(0)
    setIsPaused(false)
  }

  return {
    count,
    pause,
    resume,
    reset,
    isPaused
  }
}

/**
 * 导出缓动函数供外部使用
 */
export const easingFunctions = {
  easeOutQuad,
  easeInOutQuad,
  easeOutCubic,
  easeOutExpo
}
