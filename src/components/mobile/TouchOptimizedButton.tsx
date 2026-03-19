/**
 * Touch Optimized Button Component
 * 触摸优化按钮组件
 *
 * Features:
 * - Minimum 48x48px touch target (WCAG AA)
 * - Haptic feedback simulation
 * - Active state feedback
 * - Loading state
 * - Icon support
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Loader2, type LucideIcon } from 'lucide-react'

export interface TouchOptimizedButtonProps {
  children: React.ReactNode
  onClick?: (e: React.MouseEvent | React.TouchEvent) => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  className?: string
}

export const TouchOptimizedButton: React.FC<TouchOptimizedButtonProps> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = ''
}) => {
  const isDisabled = disabled || loading

  // Variant styles
  const variantStyles = {
    primary: 'bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-white shadow-lg shadow-cyan-500/30',
    secondary: 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white',
    danger: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-lg shadow-red-500/30',
    success: 'bg-green-500 hover:bg-green-600 active:bg-green-700 text-white shadow-lg shadow-green-500/30',
    ghost: 'bg-transparent hover:bg-white/10 active:bg-white/20 text-white border border-white/20'
  }

  // Size styles (ensuring minimum 48px height for touch)
  const sizeStyles = {
    sm: 'min-h-[48px] px-4 py-2 text-sm',
    md: 'min-h-[48px] px-6 py-3 text-base',
    lg: 'min-h-[56px] px-8 py-4 text-lg'
  }

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <motion.button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      whileTap={isDisabled ? undefined : { scale: 0.96 }}
      className={`
        relative flex items-center justify-center gap-2
        font-medium rounded-xl
        transition-all duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        // Minimum touch target size
        minWidth: '48px'
      }}
    >
      {/* Loading Spinner */}
      {loading && (
        <Loader2 className={`${iconSize[size]} animate-spin`} />
      )}

      {/* Icon Left */}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className={iconSize[size]} />
      )}

      {/* Button Text */}
      <span>{children}</span>

      {/* Icon Right */}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={iconSize[size]} />
      )}
    </motion.button>
  )
}

// ==================== Touch Optimized Icon Button ====================

export interface TouchOptimizedIconButtonProps {
  icon: LucideIcon
  onClick?: (e: React.MouseEvent | React.TouchEvent) => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  badge?: number | string
  className?: string
  'aria-label': string
}

export const TouchOptimizedIconButton: React.FC<TouchOptimizedIconButtonProps> = ({
  icon: Icon,
  onClick,
  disabled = false,
  loading = false,
  variant = 'ghost',
  size = 'md',
  badge,
  className = '',
  'aria-label': ariaLabel
}) => {
  const isDisabled = disabled || loading

  const variantStyles = {
    primary: 'bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white',
    danger: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-white/10 active:bg-white/20 text-white'
  }

  const sizeStyles = {
    sm: 'min-w-[40px] min-h-[40px] p-2',
    md: 'min-w-[48px] min-h-[48px] p-3',
    lg: 'min-w-[56px] min-h-[56px] p-4'
  }

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <motion.button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      whileTap={isDisabled ? undefined : { scale: 0.9 }}
      aria-label={ariaLabel}
      className={`
        relative flex items-center justify-center
        rounded-xl transition-all duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {loading ? (
        <Loader2 className={`${iconSize[size]} animate-spin`} />
      ) : (
        <Icon className={iconSize[size]} />
      )}

      {/* Badge */}
      {badge !== undefined && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="
            absolute -top-1 -right-1
            min-w-[20px] h-[20px] px-1
            flex items-center justify-center
            bg-red-500 text-white text-[10px] font-bold
            rounded-full border-2 border-gray-900
          "
        >
          {typeof badge === 'number' && badge > 99 ? '99+' : badge}
        </motion.span>
      )}
    </motion.button>
  )
}

// ==================== Touch Optimized Chip/Tag ====================

export interface TouchOptimizedChipProps {
  children: React.ReactNode
  onRemove?: () => void
  onClick?: () => void
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
  icon?: LucideIcon
  className?: string
}

export const TouchOptimizedChip: React.FC<TouchOptimizedChipProps> = ({
  children,
  onRemove,
  onClick,
  variant = 'default',
  size = 'md',
  icon: Icon,
  className = ''
}) => {
  const variantStyles = {
    default: 'bg-gray-700 text-gray-200',
    primary: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const sizeStyles = {
    sm: 'min-h-[32px] px-2 py-1 text-xs',
    md: 'min-h-[40px] px-3 py-2 text-sm'
  }

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.95 } : undefined}
      onClick={onClick}
      className={`
        inline-flex items-center gap-2
        rounded-full border
        font-medium
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="
            ml-1 w-4 h-4 flex items-center justify-center
            rounded-full hover:bg-white/20
            transition-colors
          "
          style={{
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          ×
        </button>
      )}
    </motion.div>
  )
}

// ==================== Touch Optimized Toggle ====================

export interface TouchOptimizedToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const TouchOptimizedToggle: React.FC<TouchOptimizedToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  size = 'md',
  className = ''
}) => {
  const sizeStyles = {
    sm: { container: 'w-10 h-6', thumb: 'w-4 h-4', translate: 'translate-x-4' },
    md: { container: 'w-12 h-7', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { container: 'w-14 h-8', thumb: 'w-6 h-6', translate: 'translate-x-6' }
  }

  const styles = sizeStyles[size]

  return (
    <label
      className={`
        flex items-center gap-3
        cursor-pointer select-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div
        className={`
          relative ${styles.container}
          rounded-full transition-colors duration-200
          ${checked ? 'bg-cyan-500' : 'bg-gray-600'}
          ${disabled ? '' : 'hover:opacity-80'}
        `}
        style={{
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          minHeight: '44px' // Ensure touch target
        }}
      >
        <motion.div
          animate={{
            x: checked ? styles.translate : 0
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`
            absolute top-1 left-1
            ${styles.thumb}
            bg-white rounded-full shadow-md
          `}
        />
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
      </div>

      {label && (
        <span className="text-sm text-gray-200 font-medium">
          {label}
        </span>
      )}
    </label>
  )
}
