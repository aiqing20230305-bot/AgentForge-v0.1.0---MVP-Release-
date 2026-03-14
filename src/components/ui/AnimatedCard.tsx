/**
 * Animated Card Component
 * 带交互动画的卡片组件
 */

import { motion } from 'framer-motion'
import { cardHoverVariants, fadeVariants, transitions } from '../../utils/animations'
import type { ReactNode, MouseEvent } from 'react'

interface AnimatedCardProps {
  /** 子元素 */
  children: ReactNode
  /** 点击事件 */
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
  /** 是否启用悬停效果 */
  hoverEffect?: boolean
  /** 是否启用点击动画 */
  tapEffect?: boolean
  /** 自定义类名 */
  className?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否选中 */
  selected?: boolean
}

/**
 * AnimatedCard - 交互式动画卡片
 *
 * 特性：
 * - 悬停缩放效果
 * - 点击反馈动画
 * - 阴影变化
 * - 可选中状态
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onClick,
  hoverEffect = true,
  tapEffect = true,
  className = '',
  disabled = false,
  selected = false
}) => {
  return (
    <motion.div
      variants={hoverEffect ? cardHoverVariants : undefined}
      initial="rest"
      whileHover={!disabled && hoverEffect ? 'hover' : undefined}
      whileTap={!disabled && tapEffect ? 'tap' : undefined}
      onClick={disabled ? undefined : onClick}
      className={`
        rounded-xl transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${selected ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-gray-900' : ''}
        ${className}
      `}
      style={{
        boxShadow: selected
          ? '0 10px 30px rgba(6, 182, 212, 0.3)'
          : '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * AnimatedButton - 交互式动画按钮
 */
export const AnimatedButton: React.FC<{
  children: ReactNode
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  className?: string
}> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = ''
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900'

  const variantStyles = {
    primary: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white focus:ring-cyan-500',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-white/10 text-cyan-400 border border-cyan-500/30 focus:ring-cyan-500'
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={transitions.fast}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            ⏳
          </motion.span>
          加载中...
        </span>
      ) : (
        children
      )}
    </motion.button>
  )
}

/**
 * AnimatedBadge - 动画徽章
 */
export const AnimatedBadge: React.FC<{
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  pulse?: boolean
  className?: string
}> = ({
  children,
  variant = 'default',
  pulse = false,
  className = ''
}) => {
  const variantStyles = {
    default: 'bg-gray-700 text-gray-300',
    success: 'bg-green-500/20 text-green-400 border border-green-500',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500',
    error: 'bg-red-500/20 text-red-400 border border-red-500',
    info: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500'
  }

  return (
    <motion.span
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {pulse && (
        <motion.span
          className="w-2 h-2 rounded-full bg-current"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        />
      )}
      {children}
    </motion.span>
  )
}
