/**
 * 性能监控工具
 * 监控首屏加载、交互延迟、资源加载等指标
 */

// Web Vitals指标类型
interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
}

// 性能指标阈值
const THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 },  // First Contentful Paint
  LCP: { good: 2500, poor: 4000 },  // Largest Contentful Paint
  FID: { good: 100, poor: 300 },    // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },   // Cumulative Layout Shift
  TTFB: { good: 800, poor: 1800 }   // Time to First Byte
}

// 评级函数
function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metric as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// 收集的性能数据
const performanceData: Record<string, WebVitalsMetric> = {}

/**
 * 监控首屏加载时间（FCP - First Contentful Paint）
 */
export function measureFCP() {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      for (const entry of entries) {
        if (entry.name === 'first-contentful-paint') {
          const metric: WebVitalsMetric = {
            name: 'FCP',
            value: entry.startTime,
            rating: getRating('FCP', entry.startTime),
            delta: entry.startTime,
            id: crypto.randomUUID()
          }

          performanceData.FCP = metric
          console.log(`[Performance] FCP: ${Math.round(metric.value)}ms (${metric.rating})`)

          observer.disconnect()
        }
      }
    })

    observer.observe({ type: 'paint', buffered: true })
  } catch (error) {
    console.error('[Performance] FCP measurement failed:', error)
  }
}

/**
 * 监控最大内容绘制（LCP - Largest Contentful Paint）
 */
export function measureLCP() {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]

      const metric: WebVitalsMetric = {
        name: 'LCP',
        value: lastEntry.startTime,
        rating: getRating('LCP', lastEntry.startTime),
        delta: lastEntry.startTime,
        id: crypto.randomUUID()
      }

      performanceData.LCP = metric
      console.log(`[Performance] LCP: ${Math.round(metric.value)}ms (${metric.rating})`)
    })

    observer.observe({ type: 'largest-contentful-paint', buffered: true })
  } catch (error) {
    console.error('[Performance] LCP measurement failed:', error)
  }
}

/**
 * 初始化所有性能监控
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return

  console.log('[Performance] Initializing monitoring...')

  // 监控Core Web Vitals
  measureFCP()
  measureLCP()

  // 页面加载完成后输出报告
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('[Performance] Report:', performanceData)
    }, 3000)
  })
}

/**
 * 获取性能报告
 */
export function getPerformanceReport() {
  return {
    metrics: performanceData,
    summary: {
      fcp: performanceData.FCP?.value ? `${Math.round(performanceData.FCP.value)}ms` : 'N/A',
      lcp: performanceData.LCP?.value ? `${Math.round(performanceData.LCP.value)}ms` : 'N/A'
    }
  }
}
