/**
 * Swipeable Item Component
 * 可滑动删除的列表项组件 (iOS/Android style)
 *
 * Features:
 * - Swipe to reveal actions (left/right)
 * - Smooth spring animations
 * - Auto-snap to positions
 * - Customizable actions
 */

import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { Trash2, Archive, Star, Edit, type LucideIcon } from 'lucide-react'

export interface SwipeAction {
  id: string
  label: string
  icon: LucideIcon
  color: string
  bgColor: string
  onClick: () => void
}

export interface SwipeableItemProps {
  children: React.ReactNode
  leftActions?: SwipeAction[]
  rightActions?: SwipeAction[]
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
  className?: string
}

export const SwipeableItem: React.FC<SwipeableItemProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  onSwipeLeft,
  onSwipeRight,
  threshold = 80,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const x = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate action widths
  const leftActionsWidth = leftActions.length * 80
  const rightActionsWidth = rightActions.length * 80

  // Transform for revealing actions
  const leftActionsOpacity = useTransform(x, [0, leftActionsWidth], [0, 1])
  const rightActionsOpacity = useTransform(x, [-rightActionsWidth, 0], [1, 0])

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false)

    const offsetX = info.offset.x
    const velocity = info.velocity.x

    // Swipe left (reveal right actions)
    if (offsetX < -threshold || velocity < -500) {
      if (onSwipeLeft) {
        onSwipeLeft()
      }
      x.set(-rightActionsWidth)
      return
    }

    // Swipe right (reveal left actions)
    if (offsetX > threshold || velocity > 500) {
      if (onSwipeRight) {
        onSwipeRight()
      }
      x.set(leftActionsWidth)
      return
    }

    // Snap back to center
    x.set(0)
  }

  const handleActionClick = (action: SwipeAction) => {
    action.onClick()
    // Snap back after action
    x.set(0)
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        touchAction: 'pan-y', // Allow vertical scrolling
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 flex items-stretch"
          style={{ opacity: leftActionsOpacity }}
        >
          {leftActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={`
                  w-20 flex flex-col items-center justify-center gap-1
                  text-white font-medium text-xs
                  transition-colors active:brightness-90
                  ${action.bgColor}
                `}
                style={{
                  touchAction: 'manipulation',
                  minHeight: '48px'
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{action.label}</span>
              </button>
            )
          })}
        </motion.div>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <motion.div
          className="absolute right-0 top-0 bottom-0 flex items-stretch"
          style={{ opacity: rightActionsOpacity }}
        >
          {rightActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={`
                  w-20 flex flex-col items-center justify-center gap-1
                  text-white font-medium text-xs
                  transition-colors active:brightness-90
                  ${action.bgColor}
                `}
                style={{
                  touchAction: 'manipulation',
                  minHeight: '48px'
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{action.label}</span>
              </button>
            )
          })}
        </motion.div>
      )}

      {/* Draggable Content */}
      <motion.div
        drag="x"
        dragConstraints={{
          left: -rightActionsWidth,
          right: leftActionsWidth
        }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={`
          relative z-10 bg-gray-800
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        `}
      >
        {children}
      </motion.div>
    </div>
  )
}

// ==================== Preset Actions ====================

export const SWIPE_ACTIONS = {
  delete: {
    id: 'delete',
    label: '删除',
    icon: Trash2,
    color: 'text-white',
    bgColor: 'bg-red-500',
    onClick: () => console.log('Delete action')
  } as SwipeAction,

  archive: {
    id: 'archive',
    label: '归档',
    icon: Archive,
    color: 'text-white',
    bgColor: 'bg-blue-500',
    onClick: () => console.log('Archive action')
  } as SwipeAction,

  favorite: {
    id: 'favorite',
    label: '收藏',
    icon: Star,
    color: 'text-white',
    bgColor: 'bg-yellow-500',
    onClick: () => console.log('Favorite action')
  } as SwipeAction,

  edit: {
    id: 'edit',
    label: '编辑',
    icon: Edit,
    color: 'text-white',
    bgColor: 'bg-purple-500',
    onClick: () => console.log('Edit action')
  } as SwipeAction
}

// ==================== Mobile List Item ====================

export interface MobileListItemProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  badge?: string | number
  rightContent?: React.ReactNode
  onClick?: () => void
  className?: string
}

export const MobileListItem: React.FC<MobileListItemProps> = ({
  title,
  subtitle,
  icon,
  badge,
  rightContent,
  onClick,
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3
        min-h-[60px]
        bg-gray-800 hover:bg-gray-750
        border-b border-gray-700
        transition-colors
        ${onClick ? 'cursor-pointer active:bg-gray-700' : ''}
        ${className}
      `}
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* Icon */}
      {icon && (
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-white truncate">
            {title}
          </h3>
          {badge && (
            <span className="
              px-2 py-0.5 text-xs font-medium
              bg-cyan-500/20 text-cyan-400
              rounded-full
            ">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Content */}
      {rightContent && (
        <div className="flex-shrink-0">
          {rightContent}
        </div>
      )}
    </div>
  )
}
