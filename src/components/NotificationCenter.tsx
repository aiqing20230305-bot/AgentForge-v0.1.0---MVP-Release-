/**
 * 通知中心组件
 * Notification Center - Sidebar panel for notifications
 */

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Zap,
  Check,
  CheckCheck,
  Trash2,
  Filter,
} from 'lucide-react'
import { useNotificationStore } from '../store/useNotificationStore'
import { Notification, NotificationType } from '../services/notificationManager'
import { formatRelativeTime } from '../utils/localization'

// 图标映射
const iconMap: Record<NotificationType, React.ReactNode> = {
  info: <Info className="w-4 h-4" />,
  success: <CheckCircle className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
  error: <AlertCircle className="w-4 h-4" />,
  system: <Zap className="w-4 h-4" />,
}

// 颜色映射
const colorMap: Record<NotificationType, { bg: string; icon: string }> = {
  info: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-500' },
  success: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-500' },
  warning: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-500' },
  error: { bg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-500' },
  system: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-500' },
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * NotificationCenter - 通知中心侧边栏
 */
export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
  } = useNotificationStore()

  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  // 过滤通知
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // 过滤类型
      if (filterType !== 'all' && n.type !== filterType) return false
      // 过滤未读
      if (showUnreadOnly && n.read) return false
      // 不显示 Toast 通知（autoClose的已经在Toast中显示了）
      if (n.autoClose) return false
      return true
    })
  }, [notifications, filterType, showUnreadOnly])

  // 分类统计
  const stats = useMemo(() => {
    const result: Record<NotificationType | 'all', number> = {
      all: 0,
      info: 0,
      success: 0,
      warning: 0,
      error: 0,
      system: 0,
    }

    notifications.forEach((n) => {
      if (!n.autoClose) {
        result.all++
        result[n.type]++
      }
    })

    return result
  }, [notifications])

  return (
    <>
      {/* 遮罩层 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[998]"
          />
        )}
      </AnimatePresence>

      {/* 侧边栏 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[400px] bg-white dark:bg-gray-900 shadow-2xl z-[999] flex flex-col"
          >
            {/* 标题栏 */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    通知中心
                  </h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  全部已读
                </button>
                <button
                  onClick={clearAll}
                  disabled={notifications.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  清空
                </button>
                <button
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    showUnreadOnly
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  未读
                </button>
              </div>
            </div>

            {/* 分类过滤 */}
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex gap-2 overflow-x-auto">
              {(['all', 'info', 'success', 'warning', 'error', 'system'] as const).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                      filterType === type
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {type === 'all' ? '全部' : type.charAt(0).toUpperCase() + type.slice(1)}{' '}
                    ({stats[type]})
                  </button>
                )
              )}
            </div>

            {/* 通知列表 */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Bell className="w-16 h-16 mb-3 opacity-20" />
                  <p className="text-sm">暂无通知</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={() => markAsRead(notification.id)}
                      onRemove={() => removeNotification(notification.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * NotificationItem - 单个通知项
 */
interface NotificationItemProps {
  notification: Notification
  onMarkRead: () => void
  onRemove: () => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  onRemove,
}) => {
  const colors = colorMap[notification.type]

  return (
    <div
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
        !notification.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
      }`}
    >
      <div className="flex gap-3">
        {/* 图标 */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center ${colors.icon}`}>
          {iconMap[notification.type]}
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
            )}
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {formatRelativeTime(notification.timestamp)}
            </span>

            <div className="flex items-center gap-1">
              {!notification.read && (
                <button
                  onClick={onMarkRead}
                  className="p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                  title="标记为已读"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={onRemove}
                className="p-1 text-gray-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                title="删除"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 操作按钮 */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex gap-2 mt-3">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
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
      </div>
    </div>
  )
}

export default NotificationCenter
