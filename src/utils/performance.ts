/**
 * Performance Monitoring Utilities
 * 性能监控工具集
 */

/**
 * 测量组件渲染时间
 */
export function measureRenderTime(componentName: string, callback: () => void): number {
  const startTime = performance.now()
  callback()
  const endTime = performance.now()
  const duration = endTime - startTime

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms`)
  }

  return duration
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 请求动画帧节流
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null

  return function executedFunction(...args: Parameters<T>) {
    if (rafId) {
      cancelAnimationFrame(rafId)
    }

    rafId = requestAnimationFrame(() => {
      func(...args)
      rafId = null
    })
  }
}

/**
 * 检测是否应该减少动画（用户偏好）
 */
export function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * 延迟执行（Promise 版本）
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 批量执行任务（避免阻塞）
 */
export async function batchExecute<T>(
  items: T[],
  callback: (item: T, index: number) => void | Promise<void>,
  batchSize: number = 10,
  delayMs: number = 0
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    await Promise.all(batch.map((item, index) => callback(item, i + index)))

    if (delayMs > 0 && i + batchSize < items.length) {
      await delay(delayMs)
    }
  }
}

/**
 * 空闲时执行（使用 requestIdleCallback）
 */
export function runWhenIdle(
  callback: () => void,
  options?: IdleRequestOptions
): number | NodeJS.Timeout {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options)
  }

  // Fallback for browsers that don't support requestIdleCallback
  return setTimeout(callback, 0)
}

/**
 * 取消空闲执行
 */
export function cancelIdle(id: number | NodeJS.Timeout): void {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window && typeof id === 'number') {
    window.cancelIdleCallback(id)
  } else {
    clearTimeout(id as NodeJS.Timeout)
  }
}

/**
 * 性能标记（用于 Chrome DevTools）
 */
export class PerformanceMarker {
  private marks: Map<string, number> = new Map()

  mark(name: string): void {
    if (typeof performance === 'undefined') return

    const markName = `mark:${name}`
    this.marks.set(name, performance.now())

    try {
      performance.mark(markName)
    } catch {
      // Fallback: just store the time
    }
  }

  measure(name: string, startMark: string, endMark?: string): number | undefined {
    if (typeof performance === 'undefined') return undefined

    const measureName = `measure:${name}`

    try {
      const startMarkName = `mark:${startMark}`
      const endMarkName = endMark ? `mark:${endMark}` : undefined

      if (endMarkName) {
        performance.measure(measureName, startMarkName, endMarkName)
      } else {
        performance.measure(measureName, startMarkName)
      }

      // Get the measurement
      const entries = performance.getEntriesByName(measureName, 'measure')
      if (entries.length > 0) {
        const duration = entries[0].duration
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
        return duration
      }

      // Fallback: calculate manually if measure didn't work
      const startTime = this.marks.get(startMark)
      const endTime = endMark ? this.marks.get(endMark) : performance.now()

      if (startTime !== undefined && endTime !== undefined) {
        const duration = endTime - startTime
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
        return duration
      }
    } catch (error) {
      console.warn('[Performance] Failed to measure:', error)
    }

    return undefined
  }

  clear(): void {
    this.marks.clear()

    if (typeof performance !== 'undefined') {
      try {
        performance.clearMarks()
        performance.clearMeasures()
      } catch {
        // Ignore if not supported
      }
    }
  }
}

/**
 * 全局性能监控器实例
 */
export const perfMarker = new PerformanceMarker()

/**
 * 内存使用监控（仅在开发环境）
 */
export function logMemoryUsage(): void {
  if (process.env.NODE_ENV !== 'development') return
  if (typeof performance === 'undefined') return

  // @ts-ignore - memory is not in TypeScript definitions
  const memory = performance.memory

  if (memory) {
    const usedMB = (memory.usedJSHeapSize / 1048576).toFixed(2)
    const totalMB = (memory.totalJSHeapSize / 1048576).toFixed(2)
    const limitMB = (memory.jsHeapSizeLimit / 1048576).toFixed(2)

    console.log(`[Memory] Used: ${usedMB}MB / Total: ${totalMB}MB / Limit: ${limitMB}MB`)
  }
}

/**
 * FPS 监控
 */
export class FPSMonitor {
  private frames: number[] = []
  private lastTime: number = performance.now()
  private rafId: number | null = null

  start(onUpdate?: (fps: number) => void): void {
    const measure = (time: number) => {
      const delta = time - this.lastTime
      this.lastTime = time

      const fps = 1000 / delta
      this.frames.push(fps)

      // 保留最近 60 帧
      if (this.frames.length > 60) {
        this.frames.shift()
      }

      if (onUpdate) {
        const avgFps = this.frames.reduce((sum, f) => sum + f, 0) / this.frames.length
        onUpdate(Math.round(avgFps))
      }

      this.rafId = requestAnimationFrame(measure)
    }

    this.rafId = requestAnimationFrame(measure)
  }

  stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  getAverageFPS(): number {
    if (this.frames.length === 0) return 0
    const sum = this.frames.reduce((acc, fps) => acc + fps, 0)
    return Math.round(sum / this.frames.length)
  }
}
