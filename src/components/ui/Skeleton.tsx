/**
 * Skeleton Loading Component
 * 统一的骨架屏加载组件，使用 Framer Motion 实现流畅动画
 */

import { motion } from 'framer-motion'
import { skeletonPulse } from '../../utils/animations'
import type { HTMLMotionProps } from 'framer-motion'

interface SkeletonProps extends Omit<HTMLMotionProps<'div'>, 'animate'> {
  /** 宽度 */
  width?: string | number
  /** 高度 */
  height?: string | number
  /** 是否为圆形 */
  circle?: boolean
  /** 动画速度倍数（默认1） */
  speed?: number
  /** 自定义className */
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  circle = false,
  speed = 1,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      className={`bg-gray-800 ${circle ? 'rounded-full' : 'rounded-lg'} ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem'
      }}
      animate={{
        opacity: [0.5, 0.8, 0.5]
      }}
      transition={{
        ...skeletonPulse,
        duration: (skeletonPulse.duration || 1.2) / speed
      }}
      {...props}
    />
  )
}

/**
 * Skeleton Text - 文本骨架屏
 */
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="0.75rem"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  )
}

/**
 * Skeleton Card - 卡片骨架屏
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-gray-900 rounded-xl p-4 space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton circle width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton height="1rem" width="60%" />
          <Skeleton height="0.75rem" width="40%" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  )
}

/**
 * Skeleton Avatar - 头像骨架屏
 */
export const SkeletonAvatar: React.FC<{
  size?: number
  className?: string
}> = ({ size = 40, className = '' }) => {
  return <Skeleton circle width={size} height={size} className={className} />
}

/**
 * Skeleton Button - 按钮骨架屏
 */
export const SkeletonButton: React.FC<{
  width?: string | number
  className?: string
}> = ({ width = '100px', className = '' }) => {
  return <Skeleton height="2.5rem" width={width} className={className} />
}

/**
 * Skeleton Table - 表格骨架屏
 */
export const SkeletonTable: React.FC<{
  rows?: number
  columns?: number
  className?: string
}> = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* 表头 */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} height="2rem" />
        ))}
      </div>
      {/* 表格行 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} height="1.5rem" />
          ))}
        </div>
      ))}
    </div>
  )
}
