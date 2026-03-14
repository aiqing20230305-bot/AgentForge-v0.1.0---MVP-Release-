/**
 * Loading Spinner Component
 * 统一的加载旋转动画组件
 */

import { motion } from 'framer-motion'
import { spinVariants } from '../../utils/animations'
import { Loader2, RefreshCw } from 'lucide-react'

interface LoadingSpinnerProps {
  /** 尺寸（像素） */
  size?: number
  /** 颜色 */
  color?: string
  /** 显示文本 */
  text?: string
  /** 使用哪种图标 */
  variant?: 'default' | 'refresh'
  /** 自定义类名 */
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 24,
  color = 'text-cyan-500',
  text,
  variant = 'default',
  className = ''
}) => {
  const Icon = variant === 'refresh' ? RefreshCw : Loader2

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <motion.div
        variants={spinVariants}
        animate="spin"
        className={color}
      >
        <Icon size={size} />
      </motion.div>
      {text && (
        <p className="text-sm text-gray-400">{text}</p>
      )}
    </div>
  )
}

/**
 * Loading Overlay - 全屏加载遮罩
 */
export const LoadingOverlay: React.FC<{
  text?: string
  variant?: 'default' | 'refresh'
}> = ({ text = '加载中...', variant = 'default' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <LoadingSpinner
        size={48}
        text={text}
        variant={variant}
        color="text-cyan-400"
      />
    </div>
  )
}

/**
 * Loading Dots - 点点点加载动画
 */
export const LoadingDots: React.FC<{
  size?: number
  color?: string
  className?: string
}> = ({ size = 8, color = 'bg-cyan-500', className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`rounded-full ${color}`}
          style={{ width: size, height: size }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  )
}

/**
 * Loading Progress - 进度条加载
 */
export const LoadingProgress: React.FC<{
  progress: number
  showPercentage?: boolean
  color?: string
  className?: string
}> = ({
  progress,
  showPercentage = true,
  color = 'from-cyan-500 to-blue-600',
  className = ''
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      {showPercentage && (
        <div className="mt-1 text-xs text-gray-400 text-center">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )
}
