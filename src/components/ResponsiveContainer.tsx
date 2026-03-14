/**
 * Responsive Container Component
 * 响应式容器组件 - 展示响应式 Hooks 的实际应用
 */

import React from 'react'
import { useBreakpoint, useWindowSize, useScrollDirection, useMediaQuery } from '@/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, Smartphone, Tablet, ArrowUp, ArrowDown } from 'lucide-react'

/**
 * Responsive Layout Container
 * 根据屏幕尺寸自动切换布局
 */

interface ResponsiveLayoutProps {
  children: React.ReactNode
  mobileLayout?: React.ReactNode
  tabletLayout?: React.ReactNode
  desktopLayout?: React.ReactNode
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  mobileLayout,
  tabletLayout,
  desktopLayout
}) => {
  const isMobile = useBreakpoint('mobile')
  const isTablet = useBreakpoint('tablet')
  const isDesktop = useBreakpoint('desktop')

  // 根据设备类型选择布局
  if (isMobile && mobileLayout) return <>{mobileLayout}</>
  if (isTablet && tabletLayout) return <>{tabletLayout}</>
  if (isDesktop && desktopLayout) return <>{desktopLayout}</>

  return <>{children}</>
}

/**
 * Scrollable Navbar
 * 根据滚动方向自动隐藏/显示的导航栏
 */

interface ScrollableNavbarProps {
  children: React.ReactNode
  threshold?: number
}

export const ScrollableNavbar: React.FC<ScrollableNavbarProps> = ({
  children,
  threshold = 50
}) => {
  const scrollDirection = useScrollDirection(threshold)
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    if (scrollDirection === 'down') {
      setIsVisible(false)
    } else if (scrollDirection === 'up') {
      setIsVisible(true)
    }
  }, [scrollDirection])

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800"
    >
      {children}
    </motion.div>
  )
}

/**
 * Device Info Badge
 * 显示当前设备信息的徽章
 */

export const DeviceInfoBadge: React.FC = () => {
  const windowSize = useWindowSize()
  const isMobile = useBreakpoint('mobile')
  const isTablet = useBreakpoint('tablet')
  const isTouch = useBreakpoint('touch')
  const isDarkMode = useBreakpoint('darkMode')

  const deviceType = isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'
  const DeviceIcon = isMobile ? Smartphone : isTablet ? Tablet : Monitor

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs">
      <DeviceIcon className="w-3 h-3 text-blue-400" />
      <span className="text-gray-300">{deviceType}</span>
      <span className="text-gray-500">|</span>
      <span className="text-gray-400 font-mono">
        {windowSize.width} × {windowSize.height}
      </span>

      {isTouch && (
        <>
          <span className="text-gray-500">|</span>
          <span className="text-green-400">Touch</span>
        </>
      )}

      {isDarkMode && (
        <>
          <span className="text-gray-500">|</span>
          <span className="text-purple-400">Dark</span>
        </>
      )}
    </div>
  )
}

/**
 * Scroll Indicator
 * 滚动指示器 - 显示滚动方向和位置
 */

export const ScrollIndicator: React.FC = () => {
  const scrollDirection = useScrollDirection()
  const windowSize = useWindowSize()

  const [scrollProgress, setScrollProgress] = React.useState(0)

  React.useEffect(() => {
    const updateScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - windowSize.height
      const scrollTop = window.scrollY
      const progress = (scrollTop / scrollHeight) * 100

      setScrollProgress(Math.min(100, Math.max(0, progress)))
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true })
    updateScrollProgress()

    return () => window.removeEventListener('scroll', updateScrollProgress)
  }, [windowSize.height])

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-lg shadow-lg">
      {/* 滚动方向 */}
      <div className="flex items-center gap-1">
        {scrollDirection === 'down' ? (
          <ArrowDown className="w-3 h-3 text-red-400" />
        ) : scrollDirection === 'up' ? (
          <ArrowUp className="w-3 h-3 text-green-400" />
        ) : (
          <div className="w-3 h-3" />
        )}
      </div>

      {/* 滚动进度条 */}
      <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* 进度百分比 */}
      <span className="text-xs text-gray-400 font-mono w-8 text-right">
        {Math.round(scrollProgress)}%
      </span>
    </div>
  )
}

/**
 * Responsive Grid
 * 响应式网格 - 根据屏幕大小自动调整列数
 */

interface ResponsiveGridProps {
  children: React.ReactNode
  cols?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: number
  className?: string
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  gap = 4,
  className = ''
}) => {
  const isXs = useMediaQuery('(max-width: 480px)')
  const isSm = useMediaQuery('(max-width: 640px)')
  const isMd = useMediaQuery('(max-width: 768px)')
  const isLg = useMediaQuery('(max-width: 1024px)')

  const columns = isXs ? (cols.xs || 1)
    : isSm ? (cols.sm || 2)
    : isMd ? (cols.md || 3)
    : isLg ? (cols.lg || 4)
    : (cols.xl || 5)

  return (
    <div
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap * 0.25}rem`
      }}
    >
      {children}
    </div>
  )
}

/**
 * Mobile Menu
 * 移动端菜单 - 根据设备类型切换显示方式
 */

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  children
}) => {
  const isMobile = useBreakpoint('mobile')

  if (!isMobile) {
    // 桌面端：侧边栏
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 border-r border-gray-800 z-50 overflow-y-auto"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // 移动端：全屏抽屉
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* 抽屉 */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 right-0 bottom-0 max-h-[90vh] bg-gray-900 rounded-t-2xl z-50 overflow-y-auto"
          >
            {/* 拖动指示器 */}
            <div className="flex justify-center pt-2 pb-4">
              <div className="w-12 h-1 bg-gray-700 rounded-full" />
            </div>

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * Responsive Image
 * 响应式图片 - 根据设备加载不同尺寸
 */

interface ResponsiveImageProps {
  src: string
  mobileSrc?: string
  tabletSrc?: string
  alt: string
  className?: string
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  mobileSrc,
  tabletSrc,
  alt,
  className = ''
}) => {
  const isMobile = useBreakpoint('mobile')
  const isTablet = useBreakpoint('tablet')

  const imageSrc = isMobile && mobileSrc ? mobileSrc
    : isTablet && tabletSrc ? tabletSrc
    : src

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
    />
  )
}
