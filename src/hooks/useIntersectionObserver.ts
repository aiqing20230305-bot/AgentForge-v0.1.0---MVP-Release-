/**
 * useIntersectionObserver Hook
 * 交叉观察器Hook，用于懒加载、无限滚动、动画触发等场景
 */

import { useEffect, useRef, useState, RefObject } from 'react'

/**
 * Intersection Observer 配置选项
 */
export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /** 是否只触发一次 */
  triggerOnce?: boolean
  /** 初始可见性 */
  initialIsIntersecting?: boolean
}

/**
 * 使用 Intersection Observer 监听元素可见性
 *
 * @param options - 配置选项
 * @returns [ref, isIntersecting, entry]
 *
 * @example
 * const [ref, isVisible] = useIntersectionObserver({
 *   threshold: 0.5,
 *   triggerOnce: true
 * })
 *
 * <div ref={ref}>
 *   {isVisible && <HeavyComponent />}
 * </div>
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T>, boolean, IntersectionObserverEntry | null] {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    triggerOnce = false,
    initialIsIntersecting = false
  } = options

  const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const ref = useRef<T>(null)
  const frozen = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element || frozen.current) {
      return
    }

    // SSR 支持
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver is not supported')
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry)
        const isIntersecting = entry.isIntersecting

        setIsIntersecting(isIntersecting)

        // 只触发一次
        if (isIntersecting && triggerOnce) {
          frozen.current = true
          observer.disconnect()
        }
      },
      { root, rootMargin, threshold }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [root, rootMargin, threshold, triggerOnce])

  return [ref, isIntersecting, entry]
}

/**
 * 懒加载Hook - 元素进入视口时加载内容
 *
 * @param options - 配置选项
 * @returns [ref, shouldLoad]
 *
 * @example
 * const [ref, shouldLoad] = useLazyLoad({ rootMargin: '200px' })
 *
 * <img
 *   ref={ref}
 *   src={shouldLoad ? realImageUrl : placeholderUrl}
 * />
 */
export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T>, boolean] {
  const [ref, isIntersecting] = useIntersectionObserver<T>({
    triggerOnce: true,
    rootMargin: '50px',
    ...options
  })

  return [ref, isIntersecting]
}

/**
 * 无限滚动Hook - 监听滚动底部触发加载
 *
 * @param callback - 触发时的回调函数
 * @param options - 配置选项
 * @returns ref
 *
 * @example
 * const [isLoading, setIsLoading] = useState(false)
 *
 * const loadMoreRef = useInfiniteScroll(async () => {
 *   setIsLoading(true)
 *   await fetchMoreData()
 *   setIsLoading(false)
 * }, { rootMargin: '100px' })
 *
 * return (
 *   <>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={loadMoreRef}>{isLoading && 'Loading...'}</div>
 *   </>
 * )
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>(
  callback: () => void | Promise<void>,
  options: UseIntersectionObserverOptions = {}
): RefObject<T> {
  const [ref, isIntersecting] = useIntersectionObserver<T>({
    rootMargin: '100px',
    ...options
  })

  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (isIntersecting) {
      callbackRef.current()
    }
  }, [isIntersecting])

  return ref
}

/**
 * 视口动画触发Hook - 元素进入视口时触发动画
 *
 * @param options - 配置选项
 * @returns [ref, shouldAnimate, progress]
 *
 * @example
 * const [ref, shouldAnimate, progress] = useViewportAnimation({
 *   threshold: 0.3
 * })
 *
 * <motion.div
 *   ref={ref}
 *   initial={{ opacity: 0, y: 50 }}
 *   animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
 * >
 *   Content
 * </motion.div>
 */
export function useViewportAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T>, boolean, number] {
  const [ref, isIntersecting, entry] = useIntersectionObserver<T>({
    threshold: 0.1,
    triggerOnce: true,
    ...options
  })

  const progress = entry?.intersectionRatio || 0

  return [ref, isIntersecting, progress]
}

/**
 * 可见性追踪Hook - 追踪元素的可见性统计
 *
 * @param options - 配置选项
 * @returns [ref, stats]
 *
 * @example
 * const [ref, stats] = useVisibilityTracking()
 *
 * <div ref={ref}>
 *   Viewed {stats.viewCount} times
 *   Total visible for {stats.totalVisibleTime}ms
 * </div>
 */
export interface VisibilityStats {
  viewCount: number
  totalVisibleTime: number
  lastViewedAt: number | null
  isCurrentlyVisible: boolean
}

export function useVisibilityTracking<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T>, VisibilityStats] {
  const [ref, isIntersecting] = useIntersectionObserver<T>(options)

  const [stats, setStats] = useState<VisibilityStats>({
    viewCount: 0,
    totalVisibleTime: 0,
    lastViewedAt: null,
    isCurrentlyVisible: false
  })

  const visibleStartTime = useRef<number | null>(null)

  useEffect(() => {
    if (isIntersecting) {
      // 进入可见
      visibleStartTime.current = Date.now()
      setStats((prev) => ({
        ...prev,
        viewCount: prev.viewCount + 1,
        isCurrentlyVisible: true,
        lastViewedAt: Date.now()
      }))
    } else if (visibleStartTime.current) {
      // 离开可见
      const visibleDuration = Date.now() - visibleStartTime.current
      setStats((prev) => ({
        ...prev,
        totalVisibleTime: prev.totalVisibleTime + visibleDuration,
        isCurrentlyVisible: false
      }))
      visibleStartTime.current = null
    }
  }, [isIntersecting])

  return [ref, stats]
}

/**
 * 多元素交叉观察Hook - 同时监听多个元素
 *
 * @param options - 配置选项
 * @returns [refs, visibilityMap]
 *
 * @example
 * const [setRef, visibilityMap] = useMultipleIntersectionObserver()
 *
 * {items.map((item, index) => (
 *   <div
 *     key={item.id}
 *     ref={(el) => setRef(item.id, el)}
 *     style={{ opacity: visibilityMap[item.id] ? 1 : 0.5 }}
 *   >
 *     {item.content}
 *   </div>
 * ))}
 */
export function useMultipleIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = {}
): [(id: string, element: T | null) => void, Record<string, boolean>] {
  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>({})
  const observerRef = useRef<IntersectionObserver>()
  const elementsRef = useRef<Map<T, string>>(new Map())

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return
    }

    observerRef.current = new IntersectionObserver((entries) => {
      const updates: Record<string, boolean> = {}
      entries.forEach((entry) => {
        const id = elementsRef.current.get(entry.target as T)
        if (id) {
          updates[id] = entry.isIntersecting
        }
      })

      if (Object.keys(updates).length > 0) {
        setVisibilityMap((prev) => ({ ...prev, ...updates }))
      }
    }, options)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [options])

  const setRef = (id: string, element: T | null) => {
    if (!observerRef.current) return

    // 清理旧元素
    elementsRef.current.forEach((elementId, el) => {
      if (elementId === id) {
        observerRef.current?.unobserve(el)
        elementsRef.current.delete(el)
      }
    })

    // 添加新元素
    if (element) {
      elementsRef.current.set(element, id)
      observerRef.current.observe(element)
    }
  }

  return [setRef, visibilityMap]
}
