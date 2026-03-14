/**
 * 性能监控工具
 * 用于监测和优化应用性能
 */

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private marks: Map<string, number> = new Map()
  private metrics: Map<string, number[]> = new Map()

  private constructor() {
    this.init()
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * 初始化性能监控
   */
  private init() {
    if (typeof window === 'undefined') return

    // 监控First Contentful Paint
    this.observePaint()

    // 监控Long Tasks
    this.observeLongTasks()

    // 监控Layout Shift
    this.observeLayoutShift()
  }

  /**
   * 监控绘制性能
   */
  private observePaint() {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`[Performance] ${entry.name}: ${entry.startTime.toFixed(2)}ms`)
        }
      })
      observer.observe({ entryTypes: ['paint'] })
    } catch (e) {
      console.warn('[Performance] Paint observer not supported')
    }
  }

  /**
   * 监控长任务（>50ms）
   */
  private observeLongTasks() {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn(`[Performance] Long task detected: ${entry.duration.toFixed(2)}ms`)
        }
      })
      observer.observe({ entryTypes: ['longtask'] })
    } catch (e) {
      // Long task API not supported
    }
  }

  /**
   * 监控布局偏移
   */
  private observeLayoutShift() {
    if (!('PerformanceObserver' in window)) return

    try {
      let clsScore = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsScore += (entry as any).value
            console.log(`[Performance] CLS: ${clsScore.toFixed(4)}`)
          }
        }
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      console.warn('[Performance] Layout shift observer not supported')
    }
  }

  /**
   * 标记性能起点
   */
  mark(name: string) {
    const now = performance.now()
    this.marks.set(name, now)
    console.log(`[Performance] Mark: ${name} at ${now.toFixed(2)}ms`)
  }

  /**
   * 测量性能区间
   */
  measure(name: string, startMark: string): number {
    const startTime = this.marks.get(startMark)
    if (!startTime) {
      console.warn(`[Performance] Start mark "${startMark}" not found`)
      return 0
    }

    const duration = performance.now() - startTime
    this.marks.delete(startMark)

    // 记录到metrics
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(duration)

    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
    return duration
  }

  /**
   * 获取性能统计
   */
  getStats(name: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(name)
    if (!values || values.length === 0) return null

    const avg = values.reduce((sum, v) => sum + v, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)

    return { avg, min, max, count: values.length }
  }

  /**
   * 打印所有性能统计
   */
  printAllStats() {
    console.group('[Performance] All Stats')
    for (const [name, values] of this.metrics.entries()) {
      const stats = this.getStats(name)
      if (stats) {
        console.log(`${name}:`, {
          avg: `${stats.avg.toFixed(2)}ms`,
          min: `${stats.min.toFixed(2)}ms`,
          max: `${stats.max.toFixed(2)}ms`,
          count: stats.count
        })
      }
    }
    console.groupEnd()
  }

  /**
   * 清除所有数据
   */
  clear() {
    this.marks.clear()
    this.metrics.clear()
  }
}

// 导出单例
export const performanceMonitor = PerformanceMonitor.getInstance()

/**
 * 使用示例：
 *
 * // 测量组件渲染时间
 * performanceMonitor.mark('component-render-start')
 * // ... 组件渲染
 * performanceMonitor.measure('ComponentRender', 'component-render-start')
 *
 * // 测量API请求时间
 * performanceMonitor.mark('api-fetch-start')
 * const data = await fetch('/api/data')
 * performanceMonitor.measure('APIFetch', 'api-fetch-start')
 *
 * // 获取统计
 * const stats = performanceMonitor.getStats('ComponentRender')
 * console.log('Average render time:', stats?.avg)
 *
 * // 打印所有统计
 * performanceMonitor.printAllStats()
 */

/**
 * React Hook封装
 */
export function usePerformanceMeasure(name: string) {
  const markName = `${name}-start`

  return {
    start: () => performanceMonitor.mark(markName),
    end: () => performanceMonitor.measure(name, markName)
  }
}

/**
 * 内存使用监控
 */
export function logMemoryUsage() {
  if ('memory' in performance && (performance as any).memory) {
    const memory = (performance as any).memory
    console.log('[Performance] Memory:', {
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
    })
  }
}

/**
 * Bundle大小分析
 */
export function analyzeBundleSize() {
  if (!('PerformanceObserver' in window)) return

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      console.group('[Performance] Resource Sizes')
      entries.forEach((entry: any) => {
        if (entry.initiatorType === 'script' || entry.initiatorType === 'link') {
          const size = entry.transferSize || entry.encodedBodySize || 0
          console.log(`${entry.name}: ${(size / 1024).toFixed(2)} KB`)
        }
      })
      console.groupEnd()
    })
    observer.observe({ entryTypes: ['resource'] })
  } catch (e) {
    console.warn('[Performance] Resource observer not supported')
  }
}
