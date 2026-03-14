/**
 * Loading States Component
 * 加载状态组件 - 展示 useTimeout 和动画 Hooks 的应用
 */

import React from 'react'
import { useTimeout, useToggle, useAnimatedCounter } from '@/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'
import { fadeVariants, scaleVariants, spinVariants, transitions } from '@/utils/animations'

/**
 * Auto-dismiss Toast
 * 自动消失的 Toast 通知
 */

interface AutoDismissToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  onDismiss?: () => void
}

export const AutoDismissToast: React.FC<AutoDismissToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onDismiss
}) => {
  const [isVisible, , , hide] = useToggle(true)

  useTimeout(() => {
    hide()
    setTimeout(() => onDismiss?.(), 300) // 等待退出动画完成
  }, duration)

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: AlertCircle,
    warning: AlertCircle
  }

  const colors = {
    success: 'bg-green-500/20 border-green-500/50 text-green-400',
    error: 'bg-red-500/20 border-red-500/50 text-red-400',
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
    warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
  }

  const Icon = icons[type]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={transitions.normal}
          className={`flex items-center gap-3 px-4 py-3 border rounded-lg backdrop-blur-sm ${colors[type]}`}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{message}</span>

          {/* 倒计时进度条 */}
          <div className="relative w-16 h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-white/50"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Loading Spinner with Timeout
 * 带超时的加载指示器
 */

interface LoadingSpinnerWithTimeoutProps {
  timeout?: number
  onTimeout?: () => void
  message?: string
  timeoutMessage?: string
}

export const LoadingSpinnerWithTimeout: React.FC<LoadingSpinnerWithTimeoutProps> = ({
  timeout = 10000,
  onTimeout,
  message = '加载中...',
  timeoutMessage = '加载超时'
}) => {
  const [isTimeout, , setTrue] = useToggle(false)

  useTimeout(() => {
    setTrue()
    onTimeout?.()
  }, timeout)

  if (isTimeout) {
    return (
      <motion.div
        variants={fadeVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-3 p-6 text-center"
      >
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="text-sm text-red-400">{timeoutMessage}</p>
        <p className="text-xs text-gray-500">请检查网络连接或稍后重试</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-3 p-6 text-center"
    >
      <motion.div
        variants={spinVariants}
        animate="animate"
      >
        <Loader2 className="w-8 h-8 text-blue-400" />
      </motion.div>
      <p className="text-sm text-gray-400">{message}</p>

      {/* 超时倒计时 */}
      <TimeoutCountdown duration={timeout} />
    </motion.div>
  )
}

/**
 * Timeout Countdown
 * 超时倒计时显示
 */

interface TimeoutCountdownProps {
  duration: number
}

const TimeoutCountdown: React.FC<TimeoutCountdownProps> = ({ duration }) => {
  const [remaining, setRemaining] = React.useState(duration)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 100))
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const seconds = Math.ceil(remaining / 1000)
  const progress = (remaining / duration) * 100

  return (
    <div className="w-full max-w-xs space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>超时时间</span>
        <span>{seconds}秒</span>
      </div>

      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  )
}

/**
 * Progress with Animation
 * 带动画的进度显示
 */

interface ProgressWithAnimationProps {
  value: number
  max: number
  label?: string
  showPercentage?: boolean
  showValue?: boolean
}

export const ProgressWithAnimation: React.FC<ProgressWithAnimationProps> = ({
  value,
  max,
  label,
  showPercentage = true,
  showValue = false
}) => {
  const animatedValue = useAnimatedCounter(value, { duration: 500 })
  const percentage = Math.round((animatedValue / max) * 100)

  return (
    <div className="w-full space-y-2">
      {/* 标题行 */}
      <div className="flex items-center justify-between text-sm">
        {label && <span className="text-gray-400">{label}</span>}

        <div className="flex items-center gap-2 text-gray-300 font-mono">
          {showValue && (
            <span>
              {Math.round(animatedValue)} / {max}
            </span>
          )}

          {showPercentage && (
            <span className="text-blue-400 font-semibold">
              {percentage}%
            </span>
          )}
        </div>
      </div>

      {/* 进度条 */}
      <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* 光泽效果 */}
        <motion.div
          className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['0%', '400%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  )
}

/**
 * Skeleton with Delayed Content
 * 带延迟加载的骨架屏
 */

interface SkeletonWithDelayedContentProps {
  isLoading: boolean
  delay?: number
  skeletonContent: React.ReactNode
  children: React.ReactNode
}

export const SkeletonWithDelayedContent: React.FC<SkeletonWithDelayedContentProps> = ({
  isLoading,
  delay = 300,
  skeletonContent,
  children
}) => {
  const [showContent, setShowContent] = React.useState(!isLoading)

  React.useEffect(() => {
    if (!isLoading) {
      const timeoutId = setTimeout(() => {
        setShowContent(true)
      }, delay)

      return () => clearTimeout(timeoutId)
    } else {
      setShowContent(false)
    }
  }, [isLoading, delay])

  return (
    <AnimatePresence mode="wait">
      {!showContent ? (
        <motion.div
          key="skeleton"
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {skeletonContent}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Retry Button with Countdown
 * 带倒计时的重试按钮
 */

interface RetryButtonWithCountdownProps {
  onRetry: () => void
  cooldown?: number
  label?: string
  countdownLabel?: string
}

export const RetryButtonWithCountdown: React.FC<RetryButtonWithCountdownProps> = ({
  onRetry,
  cooldown = 5000,
  label = '重试',
  countdownLabel = '秒后可重试'
}) => {
  const [isOnCooldown, setIsOnCooldown] = React.useState(false)
  const [remaining, setRemaining] = React.useState(0)

  const handleRetry = () => {
    setIsOnCooldown(true)
    setRemaining(cooldown)
    onRetry()

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 100) {
          clearInterval(interval)
          setIsOnCooldown(false)
          return 0
        }
        return prev - 100
      })
    }, 100)
  }

  const seconds = Math.ceil(remaining / 1000)

  return (
    <motion.button
      onClick={handleRetry}
      disabled={isOnCooldown}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        isOnCooldown
          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
      variants={scaleVariants}
      whileHover={!isOnCooldown ? 'hover' : undefined}
      whileTap={!isOnCooldown ? 'tap' : undefined}
    >
      <div className="flex items-center gap-2">
        {isOnCooldown ? (
          <>
            <Clock className="w-4 h-4" />
            <span>{seconds}{countdownLabel}</span>
          </>
        ) : (
          <span>{label}</span>
        )}
      </div>
    </motion.button>
  )
}

/**
 * Loading Step Indicator
 * 加载步骤指示器
 */

interface LoadingStep {
  id: string
  label: string
  duration?: number
}

interface LoadingStepIndicatorProps {
  steps: LoadingStep[]
  currentStep: number
}

export const LoadingStepIndicator: React.FC<LoadingStepIndicatorProps> = ({
  steps,
  currentStep
}) => {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const isActive = index === currentStep
        const isCompleted = index < currentStep

        return (
          <motion.div
            key={step.id}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* 步骤图标 */}
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                isCompleted
                  ? 'bg-green-500 border-green-500'
                  : isActive
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-gray-800 border-gray-700'
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="w-4 h-4 text-white" />
              ) : isActive ? (
                <motion.div variants={spinVariants} animate="animate">
                  <Loader2 className="w-4 h-4 text-white" />
                </motion.div>
              ) : (
                <span className="text-xs text-gray-500">{index + 1}</span>
              )}
            </div>

            {/* 步骤标签 */}
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  isCompleted
                    ? 'text-green-400'
                    : isActive
                    ? 'text-white'
                    : 'text-gray-500'
                }`}
              >
                {step.label}
              </p>

              {/* 进度条（仅激活步骤显示） */}
              {isActive && step.duration && (
                <div className="mt-1 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: step.duration / 1000, ease: 'linear' }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
