/**
 * useWindowSize Hook
 * 窗口尺寸监听Hook，实时获取窗口大小变化
 */

import { useState, useEffect } from 'react'

/**
 * 窗口尺寸接口
 */
export interface WindowSize {
  width: number
  height: number
  innerWidth: number
  innerHeight: number
  outerWidth: number
  outerHeight: number
}

/**
 * 获取窗口尺寸
 *
 * @param throttle - 节流延迟（毫秒，默认100）
 * @returns 窗口尺寸对象
 *
 * @example
 * const windowSize = useWindowSize()
 *
 * return (
 *   <div>
 *     Window: {windowSize.width} x {windowSize.height}
 *   </div>
 * )
 */
export function useWindowSize(throttle: number = 100): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>(() => {
    // SSR 支持
    if (typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
        innerWidth: 0,
        innerHeight: 0,
        outerWidth: 0,
        outerHeight: 0
      }
    }

    return {
      width: window.innerWidth,
      height: window.innerHeight,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    let timeoutId: NodeJS.Timeout

    const handleResize = () => {
      clearTimeout(timeoutId)

      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          outerWidth: window.outerWidth,
          outerHeight: window.outerHeight
        })
      }, throttle)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
    }
  }, [throttle])

  return windowSize
}

/**
 * 简化版窗口尺寸Hook - 只返回宽高
 *
 * @param throttle - 节流延迟（毫秒）
 * @returns [width, height]
 *
 * @example
 * const [width, height] = useWindowDimensions()
 */
export function useWindowDimensions(throttle: number = 100): [number, number] {
  const { width, height } = useWindowSize(throttle)
  return [width, height]
}

/**
 * 窗口宽度Hook
 *
 * @param throttle - 节流延迟（毫秒）
 * @returns 窗口宽度
 *
 * @example
 * const width = useWindowWidth()
 */
export function useWindowWidth(throttle: number = 100): number {
  const { width } = useWindowSize(throttle)
  return width
}

/**
 * 窗口高度Hook
 *
 * @param throttle - 节流延迟（毫秒）
 * @returns 窗口高度
 *
 * @example
 * const height = useWindowHeight()
 */
export function useWindowHeight(throttle: number = 100): number {
  const { height } = useWindowSize(throttle)
  return height
}

/**
 * 窗口方向Hook
 *
 * @returns 'portrait' | 'landscape'
 *
 * @example
 * const orientation = useWindowOrientation()
 *
 * if (orientation === 'portrait') {
 *   return <MobileLayout />
 * }
 */
export function useWindowOrientation(): 'portrait' | 'landscape' {
  const { width, height } = useWindowSize()

  return width > height ? 'landscape' : 'portrait'
}

/**
 * 窗口滚动位置Hook
 *
 * @param throttle - 节流延迟（毫秒）
 * @returns { x, y, scrollX, scrollY }
 *
 * @example
 * const scroll = useWindowScroll()
 *
 * return (
 *   <div>
 *     Scrolled: {scroll.y}px
 *   </div>
 * )
 */
export interface WindowScroll {
  x: number
  y: number
  scrollX: number
  scrollY: number
}

export function useWindowScroll(throttle: number = 100): WindowScroll {
  const [scroll, setScroll] = useState<WindowScroll>(() => {
    if (typeof window === 'undefined') {
      return { x: 0, y: 0, scrollX: 0, scrollY: 0 }
    }

    return {
      x: window.scrollX,
      y: window.scrollY,
      scrollX: window.scrollX,
      scrollY: window.scrollY
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      clearTimeout(timeoutId)

      timeoutId = setTimeout(() => {
        setScroll({
          x: window.scrollX,
          y: window.scrollY,
          scrollX: window.scrollX,
          scrollY: window.scrollY
        })
      }, throttle)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [throttle])

  return scroll
}

/**
 * 视口信息Hook（尺寸 + 滚动）
 *
 * @param throttle - 节流延迟（毫秒）
 * @returns 完整视口信息
 *
 * @example
 * const viewport = useViewport()
 *
 * console.log(viewport.width, viewport.height, viewport.scrollY)
 */
export interface Viewport extends WindowSize, WindowScroll {
  isScrolled: boolean
  isAtTop: boolean
  isAtBottom: boolean
  scrollDirection: 'up' | 'down' | 'none'
}

export function useViewport(throttle: number = 100): Viewport {
  const windowSize = useWindowSize(throttle)
  const windowScroll = useWindowScroll(throttle)

  const [viewport, setViewport] = useState<Viewport>({
    ...windowSize,
    ...windowScroll,
    isScrolled: windowScroll.y > 0,
    isAtTop: windowScroll.y === 0,
    isAtBottom: false,
    scrollDirection: 'none'
  })

  useEffect(() => {
    const isAtBottom =
      window.innerHeight + windowScroll.y >= document.documentElement.scrollHeight - 10

    const scrollDirection =
      windowScroll.y > viewport.y ? 'down' : windowScroll.y < viewport.y ? 'up' : 'none'

    setViewport({
      ...windowSize,
      ...windowScroll,
      isScrolled: windowScroll.y > 0,
      isAtTop: windowScroll.y === 0,
      isAtBottom,
      scrollDirection
    })
  }, [windowSize, windowScroll])

  return viewport
}

/**
 * 滚动方向Hook
 *
 * @param threshold - 触发阈值（像素）
 * @returns 'up' | 'down' | 'none'
 *
 * @example
 * const scrollDirection = useScrollDirection()
 *
 * // 根据滚动方向隐藏/显示导航栏
 * <Navbar visible={scrollDirection !== 'down'} />
 */
export function useScrollDirection(threshold: number = 10): 'up' | 'down' | 'none' {
  const [direction, setDirection] = useState<'up' | 'down' | 'none'>('none')
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      clearTimeout(timeoutId)

      timeoutId = setTimeout(() => {
        const currentScrollY = window.scrollY

        if (Math.abs(currentScrollY - lastScrollY) < threshold) {
          return
        }

        if (currentScrollY > lastScrollY) {
          setDirection('down')
        } else if (currentScrollY < lastScrollY) {
          setDirection('up')
        } else {
          setDirection('none')
        }

        setLastScrollY(currentScrollY)
      }, 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY, threshold])

  return direction
}

/**
 * 滚动到顶部检测Hook
 *
 * @param offset - 偏移量（像素）
 * @returns 是否在顶部
 *
 * @example
 * const isAtTop = useIsAtTop()
 *
 * <BackToTop visible={!isAtTop} />
 */
export function useIsAtTop(offset: number = 0): boolean {
  const { y } = useWindowScroll()
  return y <= offset
}

/**
 * 滚动到底部检测Hook
 *
 * @param offset - 偏移量（像素）
 * @returns 是否在底部
 *
 * @example
 * const isAtBottom = useIsAtBottom(100)
 *
 * if (isAtBottom) {
 *   loadMoreItems()
 * }
 */
export function useIsAtBottom(offset: number = 0): boolean {
  const [isAtBottom, setIsAtBottom] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      clearTimeout(timeoutId)

      timeoutId = setTimeout(() => {
        const scrollHeight = document.documentElement.scrollHeight
        const scrollTop = window.scrollY
        const clientHeight = window.innerHeight

        setIsAtBottom(scrollHeight - scrollTop - clientHeight <= offset)
      }, 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [offset])

  return isAtBottom
}
