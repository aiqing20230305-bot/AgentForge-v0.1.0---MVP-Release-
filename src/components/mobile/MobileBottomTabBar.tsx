/**
 * Mobile Bottom Tab Bar Component
 * 移动端底部导航栏
 *
 * Features:
 * - Touch-friendly (48x48px minimum target)
 * - Smooth transitions
 * - Active state indication
 * - Badge support for notifications
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Activity,
  Zap,
  Trophy,
  Settings,
  Bell,
  type LucideIcon
} from 'lucide-react'
import { useBreakpoint } from '../../hooks/useMediaQuery'

export interface TabItem {
  id: string
  label: string
  icon: LucideIcon
  badge?: number
  onClick?: () => void
}

export interface MobileBottomTabBarProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export const MobileBottomTabBar: React.FC<MobileBottomTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  const isMobile = useBreakpoint('mobile')

  // Only show on mobile devices
  if (!isMobile) return null

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-gray-900/95 backdrop-blur-lg
        border-t border-white/10
        pb-safe
        ${className}
      `}
      style={{
        // iOS safe area support
        paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)'
      }}
    >
      {/* Tab Bar Container */}
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => {
                tab.onClick?.()
                onTabChange(tab.id)
              }}
              className={`
                relative flex flex-col items-center justify-center
                min-w-[48px] min-h-[48px] px-3 py-2
                rounded-xl transition-all duration-200
                active:scale-95
                ${isActive
                  ? 'text-cyan-400'
                  : 'text-gray-400 active:text-white'
                }
              `}
              style={{
                // Ensure minimum touch target size (48x48px)
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              {/* Icon Container */}
              <div className="relative">
                <Icon
                  className={`
                    w-6 h-6 transition-all duration-200
                    ${isActive ? 'scale-110' : ''}
                  `}
                />

                {/* Badge */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="
                      absolute -top-1 -right-1
                      min-w-[18px] h-[18px] px-1
                      flex items-center justify-center
                      bg-red-500 text-white text-[10px] font-bold
                      rounded-full
                    "
                  >
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </motion.div>
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  text-[10px] font-medium mt-0.5
                  transition-all duration-200
                  ${isActive ? 'opacity-100' : 'opacity-70'}
                `}
              >
                {tab.label}
              </span>

              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="
                    absolute inset-0
                    bg-cyan-500/20 rounded-xl
                    pointer-events-none
                  "
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30
                  }}
                />
              )}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ==================== Default Tab Configuration ====================

export const DEFAULT_MOBILE_TABS: TabItem[] = [
  {
    id: 'home',
    label: '首页',
    icon: Home
  },
  {
    id: 'tasks',
    label: '任务',
    icon: Activity,
    badge: 0
  },
  {
    id: 'energy',
    label: '能耗',
    icon: Zap
  },
  {
    id: 'achievements',
    label: '成就',
    icon: Trophy
  },
  {
    id: 'settings',
    label: '设置',
    icon: Settings
  }
]

// ==================== Floating Action Button (FAB) ====================

export interface FloatingActionButtonProps {
  icon: LucideIcon
  label?: string
  onClick: () => void
  badge?: number
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  className?: string
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  badge,
  position = 'bottom-right',
  className = ''
}) => {
  const isMobile = useBreakpoint('mobile')

  if (!isMobile) return null

  const positionClasses = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4',
    'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2'
  }

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`
        fixed z-40
        min-w-[56px] min-h-[56px]
        flex items-center justify-center gap-2
        bg-cyan-500 text-white
        rounded-full shadow-lg shadow-cyan-500/50
        active:shadow-xl
        ${positionClasses[position]}
        ${className}
      `}
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <Icon className="w-6 h-6" />
      {label && (
        <span className="text-sm font-medium pr-4">{label}</span>
      )}

      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="
            absolute -top-1 -right-1
            min-w-[24px] h-[24px] px-2
            flex items-center justify-center
            bg-red-500 text-white text-xs font-bold
            rounded-full border-2 border-gray-900
          "
        >
          {badge > 99 ? '99+' : badge}
        </motion.div>
      )}
    </motion.button>
  )
}
