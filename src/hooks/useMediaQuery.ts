/**
 * useMediaQuery Hook
 * 响应式设计Hook，监听媒体查询变化
 */

import { useState, useEffect } from 'react'

/**
 * 监听媒体查询
 *
 * @param query - CSS媒体查询字符串
 * @returns 是否匹配当前媒体查询
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)')
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
 * const isLandscape = useMediaQuery('(orientation: landscape)')
 *
 * return isMobile ? <MobileLayout /> : <DesktopLayout />
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // SSR支持
    if (typeof window === 'undefined') {
      return false
    }

    return window.matchMedia(query).matches
  })

  useEffect(() => {
    // SSR支持
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // 现代浏览器
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    } else {
      // 旧版浏览器兼容
      mediaQuery.addListener(handleChange)
      return () => {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [query])

  return matches
}

/**
 * 预定义的断点
 */
export const BREAKPOINTS = {
  xs: '(max-width: 480px)',
  sm: '(max-width: 640px)',
  md: '(max-width: 768px)',
  lg: '(max-width: 1024px)',
  xl: '(max-width: 1280px)',
  '2xl': '(max-width: 1536px)',
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  darkMode: '(prefers-color-scheme: dark)',
  lightMode: '(prefers-color-scheme: light)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  highContrast: '(prefers-contrast: high)',
  touch: '(hover: none) and (pointer: coarse)',
  mouse: '(hover: hover) and (pointer: fine)'
} as const

/**
 * 使用预定义断点
 *
 * @param breakpoint - 断点名称
 * @returns 是否匹配断点
 *
 * @example
 * const isMobile = useBreakpoint('mobile')
 * const isDarkMode = useBreakpoint('darkMode')
 * const prefersReducedMotion = useBreakpoint('reducedMotion')
 */
export function useBreakpoint(breakpoint: keyof typeof BREAKPOINTS): boolean {
  return useMediaQuery(BREAKPOINTS[breakpoint])
}

/**
 * 获取当前屏幕尺寸类别
 *
 * @returns 当前屏幕尺寸类别
 *
 * @example
 * const screenSize = useScreenSize()
 * // screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 *
 * if (screenSize === 'xs') {
 *   return <TinyLayout />
 * }
 */
export function useScreenSize(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' {
  const isXs = useMediaQuery(BREAKPOINTS.xs)
  const isSm = useMediaQuery(BREAKPOINTS.sm)
  const isMd = useMediaQuery(BREAKPOINTS.md)
  const isLg = useMediaQuery(BREAKPOINTS.lg)
  const isXl = useMediaQuery(BREAKPOINTS.xl)

  if (isXs) return 'xs'
  if (isSm) return 'sm'
  if (isMd) return 'md'
  if (isLg) return 'lg'
  if (isXl) return 'xl'
  return '2xl'
}

/**
 * 监听多个媒体查询
 *
 * @param queries - 媒体查询对象
 * @returns 所有查询的匹配结果
 *
 * @example
 * const matches = useMediaQueries({
 *   isMobile: '(max-width: 768px)',
 *   isDark: '(prefers-color-scheme: dark)',
 *   isTouch: '(hover: none)'
 * })
 *
 * // matches = { isMobile: true, isDark: false, isTouch: true }
 */
export function useMediaQueries<T extends Record<string, string>>(
  queries: T
): Record<keyof T, boolean> {
  const [matches, setMatches] = useState<Record<keyof T, boolean>>(() => {
    if (typeof window === 'undefined') {
      return Object.keys(queries).reduce((acc, key) => {
        acc[key as keyof T] = false
        return acc
      }, {} as Record<keyof T, boolean>)
    }

    return Object.entries(queries).reduce((acc, [key, query]) => {
      acc[key as keyof T] = window.matchMedia(query as string).matches
      return acc
    }, {} as Record<keyof T, boolean>)
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQueries = Object.entries(queries).map(([key, query]) => ({
      key,
      mq: window.matchMedia(query as string)
    }))

    const handleChange = () => {
      const newMatches = mediaQueries.reduce((acc, { key, mq }) => {
        acc[key as keyof T] = mq.matches
        return acc
      }, {} as Record<keyof T, boolean>)

      setMatches(newMatches)
    }

    mediaQueries.forEach(({ mq }) => {
      if (mq.addEventListener) {
        mq.addEventListener('change', handleChange)
      } else {
        mq.addListener(handleChange)
      }
    })

    return () => {
      mediaQueries.forEach(({ mq }) => {
        if (mq.removeEventListener) {
          mq.removeEventListener('change', handleChange)
        } else {
          mq.removeListener(handleChange)
        }
      })
    }
  }, [queries])

  return matches
}

/**
 * 响应式值Hook - 根据断点返回不同的值
 *
 * @param values - 断点值对象
 * @param defaultValue - 默认值
 * @returns 当前断点对应的值
 *
 * @example
 * const columns = useResponsiveValue({
 *   xs: 1,
 *   sm: 2,
 *   md: 3,
 *   lg: 4
 * }, 1)
 *
 * <Grid columns={columns}>...</Grid>
 */
export function useResponsiveValue<T>(
  values: Partial<Record<keyof typeof BREAKPOINTS, T>>,
  defaultValue: T
): T {
  const screenSize = useScreenSize()

  // 按优先级检查
  const breakpointOrder: Array<keyof typeof BREAKPOINTS> = [
    'xs',
    'sm',
    'md',
    'lg',
    'xl',
    '2xl'
  ]

  const currentIndex = breakpointOrder.indexOf(screenSize)

  // 向下查找最近的断点值
  for (let i = currentIndex; i >= 0; i--) {
    const breakpoint = breakpointOrder[i]
    if (values[breakpoint] !== undefined) {
      return values[breakpoint] as T
    }
  }

  return defaultValue
}
