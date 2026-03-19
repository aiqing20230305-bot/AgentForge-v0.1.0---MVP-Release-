/**
 * Web Performance Utilities
 * Performance monitoring and optimization for Web version
 */

/**
 * Performance Metrics
 */
export interface PerformanceMetrics {
  // Core Web Vitals
  fcp: number | null        // First Contentful Paint
  lcp: number | null        // Largest Contentful Paint
  fid: number | null        // First Input Delay
  cls: number | null        // Cumulative Layout Shift
  ttfb: number | null       // Time to First Byte
  tti: number | null        // Time to Interactive

  // Custom Metrics
  loadTime: number
  domReady: number
  resourceCount: number
  transferSize: number
}

/**
 * Resource Timing Entry
 */
export interface ResourceTiming {
  name: string
  type: string
  duration: number
  size: number
  cached: boolean
}

/**
 * Performance Monitor Class
 */
export class WebPerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {}
  private observers: PerformanceObserver[] = []

  /**
   * Start monitoring
   */
  start(): void {
    console.log('[Performance] Starting monitoring')

    // Monitor navigation timing
    this.observeNavigation()

    // Monitor paint timing
    this.observePaint()

    // Monitor layout shift
    this.observeLayoutShift()

    // Monitor first input
    this.observeFirstInput()

    // Monitor largest contentful paint
    this.observeLCP()
  }

  /**
   * Observe navigation timing
   */
  private observeNavigation(): void {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing

      // Wait for load event
      window.addEventListener('load', () => {
        const loadTime = timing.loadEventEnd - timing.navigationStart
        const domReady = timing.domContentLoadedEventEnd - timing.navigationStart
        const ttfb = timing.responseStart - timing.navigationStart

        this.metrics.loadTime = loadTime
        this.metrics.domReady = domReady
        this.metrics.ttfb = ttfb

        console.log('[Performance] Navigation:', {
          loadTime: `${loadTime}ms`,
          domReady: `${domReady}ms`,
          ttfb: `${ttfb}ms`
        })

        this.reportMetrics()
      })
    }
  }

  /**
   * Observe paint timing
   */
  private observePaint(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime
            console.log('[Performance] FCP:', `${entry.startTime.toFixed(2)}ms`)
          }
        }
      })

      observer.observe({ entryTypes: ['paint'] })
      this.observers.push(observer)
    } catch (e) {
      console.warn('[Performance] Paint observer not supported')
    }
  }

  /**
   * Observe layout shift
   */
  private observeLayoutShift(): void {
    try {
      let clsValue = 0

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
            this.metrics.cls = clsValue
          }
        }
      })

      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(observer)
    } catch (e) {
      console.warn('[Performance] Layout shift observer not supported')
    }
  }

  /**
   * Observe first input delay
   */
  private observeFirstInput(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.fid = (entry as any).processingStart - entry.startTime
          console.log('[Performance] FID:', `${this.metrics.fid.toFixed(2)}ms`)
        }
      })

      observer.observe({ entryTypes: ['first-input'] })
      this.observers.push(observer)
    } catch (e) {
      console.warn('[Performance] First input observer not supported')
    }
  }

  /**
   * Observe largest contentful paint
   */
  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.metrics.lcp = lastEntry.startTime
        console.log('[Performance] LCP:', `${lastEntry.startTime.toFixed(2)}ms`)
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(observer)
    } catch (e) {
      console.warn('[Performance] LCP observer not supported')
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics }
  }

  /**
   * Get resource timings
   */
  getResourceTimings(): ResourceTiming[] {
    if (!window.performance || !window.performance.getEntriesByType) {
      return []
    }

    const entries = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[]

    return entries.map(entry => ({
      name: entry.name,
      type: this.getResourceType(entry.name),
      duration: entry.duration,
      size: entry.transferSize,
      cached: entry.transferSize === 0
    }))
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.match(/\.(js|mjs)$/)) return 'script'
    if (url.match(/\.css$/)) return 'stylesheet'
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image'
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font'
    if (url.match(/\.json$/)) return 'json'
    return 'other'
  }

  /**
   * Get performance grade
   */
  getGrade(): 'A' | 'B' | 'C' | 'D' | 'F' {
    const { fcp, lcp, fid, cls } = this.metrics

    let score = 0
    let count = 0

    if (fcp !== null) {
      score += fcp < 1500 ? 100 : fcp < 2500 ? 75 : fcp < 4000 ? 50 : 25
      count++
    }

    if (lcp !== null) {
      score += lcp < 2500 ? 100 : lcp < 4000 ? 75 : lcp < 5500 ? 50 : 25
      count++
    }

    if (fid !== null) {
      score += fid < 100 ? 100 : fid < 300 ? 75 : fid < 500 ? 50 : 25
      count++
    }

    if (cls !== null) {
      score += cls < 0.1 ? 100 : cls < 0.25 ? 75 : cls < 0.4 ? 50 : 25
      count++
    }

    const avg = count > 0 ? score / count : 0

    if (avg >= 90) return 'A'
    if (avg >= 75) return 'B'
    if (avg >= 60) return 'C'
    if (avg >= 40) return 'D'
    return 'F'
  }

  /**
   * Report metrics to analytics
   */
  private reportMetrics(): void {
    const metrics = this.getMetrics()
    const grade = this.getGrade()

    console.log('[Performance] Metrics:', metrics)
    console.log('[Performance] Grade:', grade)

    // Send to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: 'Web Vitals',
        value: Math.round(metrics.lcp || 0),
        metric_fcp: Math.round(metrics.fcp || 0),
        metric_lcp: Math.round(metrics.lcp || 0),
        metric_fid: Math.round(metrics.fid || 0),
        metric_cls: (metrics.cls || 0).toFixed(3),
        grade
      })
    }
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    console.log('[Performance] Monitoring stopped')
  }
}

/**
 * Performance optimization utilities
 */
export const performanceUtils = {
  /**
   * Preload critical resources
   */
  preloadResources(urls: string[]): void {
    urls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = url

      // Determine resource type
      if (url.match(/\.(woff2?|ttf)$/)) {
        link.as = 'font'
        link.crossOrigin = 'anonymous'
      } else if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
        link.as = 'image'
      } else if (url.match(/\.(js|mjs)$/)) {
        link.as = 'script'
      } else if (url.match(/\.css$/)) {
        link.as = 'style'
      }

      document.head.appendChild(link)
    })
  },

  /**
   * Prefetch resources for future navigation
   */
  prefetchResources(urls: string[]): void {
    urls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = url
      document.head.appendChild(link)
    })
  },

  /**
   * Defer non-critical scripts
   */
  deferScript(src: string, onLoad?: () => void): void {
    const script = document.createElement('script')
    script.src = src
    script.defer = true
    if (onLoad) script.onload = onLoad
    document.body.appendChild(script)
  },

  /**
   * Load script dynamically
   */
  loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve()
      script.onerror = reject
      document.body.appendChild(script)
    })
  },

  /**
   * Lazy load images
   */
  lazyLoadImages(): void {
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading supported
      const images = document.querySelectorAll<HTMLImageElement>('img[data-src]')
      images.forEach(img => {
        img.src = img.dataset.src!
        img.removeAttribute('data-src')
      })
    } else {
      // Fallback to IntersectionObserver
      const images = document.querySelectorAll<HTMLImageElement>('img[data-src]')
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            img.src = img.dataset.src!
            img.removeAttribute('data-src')
            observer.unobserve(img)
          }
        })
      })

      images.forEach(img => observer.observe(img))
    }
  },

  /**
   * Measure function execution time
   */
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now()
    const result = fn()
    const duration = performance.now() - start
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
    return result
  },

  /**
   * Measure async function execution time
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    const result = await fn()
    const duration = performance.now() - start
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
    return result
  },

  /**
   * Request idle callback with fallback
   */
  requestIdleCallback(callback: () => void, timeout = 1000): void {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(callback, { timeout })
    } else {
      setTimeout(callback, 0)
    }
  },

  /**
   * Get memory usage
   */
  getMemoryUsage(): { used: number; total: number; limit: number } | null {
    if ((performance as any).memory) {
      const memory = (performance as any).memory
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      }
    }
    return null
  },

  /**
   * Check if connection is slow
   */
  isSlowConnection(): boolean {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection
      return conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g'
    }
    return false
  },

  /**
   * Get connection info
   */
  getConnectionInfo(): {
    type: string
    effectiveType: string
    downlink: number
    rtt: number
  } | null {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection
      return {
        type: conn.type || 'unknown',
        effectiveType: conn.effectiveType || 'unknown',
        downlink: conn.downlink || 0,
        rtt: conn.rtt || 0
      }
    }
    return null
  }
}

// Create global instance
let performanceMonitor: WebPerformanceMonitor | null = null

/**
 * Get performance monitor instance
 */
export const getPerformanceMonitor = (): WebPerformanceMonitor => {
  if (!performanceMonitor) {
    performanceMonitor = new WebPerformanceMonitor()
  }
  return performanceMonitor
}

/**
 * Auto-start monitoring in browser
 */
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    performanceUtils.requestIdleCallback(() => {
      const monitor = getPerformanceMonitor()
      monitor.start()
    })
  })
}
