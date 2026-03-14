/**
 * 懒加载工具
 * 用于优化组件和资源加载
 */

import { lazy, ComponentType } from 'react'

/**
 * 带重试机制的懒加载
 * 用于处理网络不稳定导致的chunk加载失败
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  retries = 3,
  interval = 1000
): React.LazyExoticComponent<T> {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      const attempt = (retriesLeft: number) => {
        importFunc()
          .then(resolve)
          .catch((error) => {
            if (retriesLeft === 0) {
              reject(error)
              return
            }

            console.warn(
              `[LazyLoad] Failed to load chunk, retrying... (${retriesLeft} retries left)`,
              error
            )

            setTimeout(() => {
              attempt(retriesLeft - 1)
            }, interval)
          })
      }

      attempt(retries)
    })
  })
}

/**
 * 预加载组件
 * 在用户可能需要之前提前加载
 */
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  importFunc()
    .then(() => console.log('[LazyLoad] Component preloaded'))
    .catch((error) => console.error('[LazyLoad] Preload failed:', error))
}

/**
 * 条件懒加载
 * 根据条件决定是否懒加载
 */
export function conditionalLazy<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  condition: boolean
): React.LazyExoticComponent<T> | Promise<{ default: T }> {
  if (condition) {
    return lazy(importFunc)
  }
  return importFunc() as any
}

/**
 * 图片懒加载Hook
 */
export function useLazyImage(src: string) {
  const [imageSrc, setImageSrc] = React.useState<string | undefined>()
  const [isLoaded, setIsLoaded] = React.useState(false)

  React.useEffect(() => {
    if (!src) return

    const img = new Image()
    img.src = src

    img.onload = () => {
      setImageSrc(src)
      setIsLoaded(true)
    }

    img.onerror = () => {
      console.error(`[LazyLoad] Failed to load image: ${src}`)
      setIsLoaded(false)
    }

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return { imageSrc, isLoaded }
}

/**
 * IntersectionObserver懒加载Hook
 * 用于列表项按需渲染
 */
export function useInView(options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting)
    }, options)

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [options])

  return { ref, isInView }
}

/**
 * 使用示例：
 *
 * // 1. 懒加载组件（带重试）
 * const LazyLeaderboard = lazyWithRetry(
 *   () => import('./components/LeaderboardPanel')
 * )
 *
 * // 2. 预加载
 * preloadComponent(() => import('./components/BattleArena'))
 *
 * // 3. 条件懒加载
 * const LazyComponent = conditionalLazy(
 *   () => import('./HeavyComponent'),
 *   isProduction
 * )
 *
 * // 4. 图片懒加载
 * function Avatar({ src }) {
 *   const { imageSrc, isLoaded } = useLazyImage(src)
 *   return (
 *     <img
 *       src={imageSrc || '/placeholder.png'}
 *       className={isLoaded ? 'loaded' : 'loading'}
 *     />
 *   )
 * }
 *
 * // 5. 元素可见性检测
 * function ListItem() {
 *   const { ref, isInView } = useInView({ threshold: 0.1 })
 *   return (
 *     <div ref={ref}>
 *       {isInView ? <ExpensiveComponent /> : <Placeholder />}
 *     </div>
 *   )
 * }
 */

// 导入React（用于Hook）
import React from 'react'
