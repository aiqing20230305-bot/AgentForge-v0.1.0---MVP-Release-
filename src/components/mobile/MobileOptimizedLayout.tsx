/**
 * Mobile Optimized Layout Component
 * 移动端优化布局包装器
 *
 * Features:
 * - Responsive breakpoints
 * - Touch-friendly spacing
 * - Safe area support (iOS notch)
 * - Pull-to-refresh
 * - Bottom navigation spacing
 */

import React, { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBreakpoint } from '../../hooks/useMediaQuery'
import { MobileBottomTabBar, type TabItem } from './MobileBottomTabBar'
import { ChevronDown } from 'lucide-react'

export interface MobileOptimizedLayoutProps {
  children: React.ReactNode

  // Navigation
  showBottomNav?: boolean
  tabs?: TabItem[]
  activeTab?: string
  onTabChange?: (tabId: string) => void

  // Pull to refresh
  onRefresh?: () => Promise<void>

  // Header
  header?: React.ReactNode
  showHeader?: boolean
  headerTransparent?: boolean

  className?: string
}

export const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  showBottomNav = false,
  tabs = [],
  activeTab = '',
  onTabChange = () => {},
  onRefresh,
  header,
  showHeader = true,
  headerTransparent = false,
  className = ''
}) => {
  const isMobile = useBreakpoint('mobile')
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [pullDistance, setPullDistance] = React.useState(0)

  // Pull to refresh logic
  const touchStartY = useRef(0)
  const isPulling = useRef(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!onRefresh) return

    const scrollTop = containerRef.current?.scrollTop || 0
    if (scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY
      isPulling.current = true
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || !onRefresh) return

    const touchY = e.touches[0].clientY
    const distance = touchY - touchStartY.current

    if (distance > 0 && distance < 150) {
      setPullDistance(distance)
    }
  }

  const handleTouchEnd = async () => {
    if (!isPulling.current || !onRefresh) return

    isPulling.current = false

    if (pullDistance > 80) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }

  const pullProgress = Math.min(pullDistance / 80, 1)

  return (
    <div
      className={`
        h-full w-full flex flex-col
        ${isMobile ? 'mobile-layout' : 'desktop-layout'}
        ${className}
      `}
      style={{
        // iOS safe area support
        paddingTop: isMobile ? 'env(safe-area-inset-top)' : undefined,
        paddingBottom: isMobile && showBottomNav ? '80px' : undefined
      }}
    >
      {/* Header */}
      {showHeader && header && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`
            sticky top-0 z-40
            ${headerTransparent ? 'bg-transparent' : 'bg-gray-900/95 backdrop-blur-lg border-b border-white/10'}
          `}
        >
          {header}
        </motion.div>
      )}

      {/* Pull to Refresh Indicator */}
      {onRefresh && isMobile && (
        <AnimatePresence>
          {(pullDistance > 0 || isRefreshing) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full shadow-lg">
                <motion.div
                  animate={{
                    rotate: isRefreshing ? 360 : 0,
                    scale: isRefreshing ? 1 : pullProgress
                  }}
                  transition={{
                    rotate: { duration: 1, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 0.2 }
                  }}
                >
                  <ChevronDown className="w-5 h-5 text-cyan-400" />
                </motion.div>
                <span className="text-sm text-gray-300">
                  {isRefreshing ? '刷新中...' : pullProgress >= 1 ? '松开刷新' : '下拉刷新'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Main Content */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`
          flex-1 overflow-y-auto overflow-x-hidden
          ${isMobile ? 'px-4 py-4' : 'px-6 py-6'}
        `}
        style={{
          // Smooth scrolling on iOS
          WebkitOverflowScrolling: 'touch',
          // Pull down creates space
          transform: `translateY(${pullDistance * 0.5}px)`,
          transition: isPulling.current ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>

      {/* Bottom Navigation */}
      {showBottomNav && isMobile && tabs.length > 0 && (
        <MobileBottomTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      )}
    </div>
  )
}

// ==================== Mobile Card Component ====================

export interface MobileCardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  onClick?: () => void
  className?: string
  noPadding?: boolean
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  actions,
  onClick,
  className = '',
  noPadding = false
}) => {
  const isMobile = useBreakpoint('mobile')

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        bg-gray-800/50 backdrop-blur-sm
        border border-gray-700/50
        rounded-xl
        ${onClick ? 'cursor-pointer active:bg-gray-750' : ''}
        ${isMobile ? 'min-h-[60px]' : ''}
        ${className}
      `}
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* Card Header */}
      {(title || icon || actions) && (
        <div className={`
          flex items-center gap-3
          ${noPadding ? 'px-4 py-3' : 'px-4 py-3'}
          ${!title && !subtitle ? 'pb-0' : ''}
        `}>
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}

          {(title || subtitle) && (
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-sm font-semibold text-white truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {actions && (
            <div className="flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className={noPadding ? '' : 'px-4 pb-4'}>
        {children}
      </div>
    </motion.div>
  )
}

// ==================== Mobile Section Component ====================

export interface MobileSectionProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const MobileSection: React.FC<MobileSectionProps> = ({
  title,
  subtitle,
  action,
  children,
  className = ''
}) => {
  return (
    <section className={`space-y-3 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>

      {/* Section Content */}
      <div>
        {children}
      </div>
    </section>
  )
}
