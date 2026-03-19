/**
 * Toast 通知组件
 * Toast - Temporary notification popup
 */

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Zap,
} from 'lucide-react'
import { Notification, NotificationType } from '../services/notificationManager'
import { useNotificationStore } from '../store/useNotificationStore'

// Toast 图标映射
const iconMap: Record<NotificationType, React.ReactNode> = {
  info: <Info className="w-5 h-5" />,
  success: <CheckCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  system: <Zap className="w-5 h-5" />,
}

// Toast 颜色映射
const colorMap: Record<NotificationType, { bg: string; border: string; icon: string }> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-500',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-500',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-500',
  },
  system: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-500',
  },
}

interface ToastProps {
  notification: Notification
  onClose: () => void
}

/**
 * Toast - 单个Toast通知
 */
export const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  const [progress, setProgress] = useState(100)
  const duration = notification.duration || 3000

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev - (100 / duration) * 16
        return next > 0 ? next : 0
      })
    }, 16)

    return () => clearInterval(interval)
  }, [duration])

  const colors = colorMap[notification.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`w-96 rounded-lg shadow-xl border ${colors.bg} ${colors.border} overflow-hidden`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* 图标 */}
          <div className={colors.icon}>{iconMap[notification.type]}</div>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {notification.title}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              {notification.message}
            </p>

            {/* 操作按钮 */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="flex gap-2 mt-3">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick()
                      onClose()
                    }}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      action.variant === 'primary'
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : action.variant === 'danger'
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* 进度条 */}
      {notification.autoClose && (
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <motion.div
            className={`h-full ${colors.icon}`}
            style={{
              width: `${progress}%`,
              background: 'currentColor',
            }}
            transition={{ duration: 0.016, ease: 'linear' }}
          />
        </div>
      )}
    </motion.div>
  )
}

/**
 * ToastContainer - Toast 容器（显示所有活动的Toast）
 */
export const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore()

  // 只显示 autoClose 的通知作为 Toast
  const toastNotifications = notifications.filter((n) => n.autoClose && !n.read)

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toastNotifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <Toast
              notification={notification}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default Toast
