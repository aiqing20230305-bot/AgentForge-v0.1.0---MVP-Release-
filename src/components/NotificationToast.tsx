/**
 * 通知气泡组件
 * 从右上角滑入的浏览器通知
 */

import React, { useEffect, useState } from 'react'
import { useNotificationStore } from '../store/useNotificationStore'
import type { Notification } from '../store/useNotificationStore'

export const NotificationToast: React.FC = () => {
  const { notifications, markAsRead } = useNotificationStore()
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // 只显示最近3秒内的未读通知
    const unread = notifications.filter(n => !n.read)
    const recent = unread.filter(n => {
      const age = Date.now() - new Date(n.timestamp).getTime()
      return age < 5000 // 5秒内
    })

    setVisibleNotifications(recent.slice(0, 3)) // 最多显示3个

    // 3秒后自动标记为已读
    const timers = recent.map(n => {
      return setTimeout(() => {
        markAsRead(n.id)
      }, 3000)
    })

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [notifications, markAsRead])

  if (visibleNotifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {visibleNotifications.map((notification, index) => (
        <Toast key={notification.id} notification={notification} delay={index * 100} />
      ))}
    </div>
  )
}

interface ToastProps {
  notification: Notification
  delay: number
}

const Toast: React.FC<ToastProps> = ({ notification, delay }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), delay)
    const hideTimer = setTimeout(() => setIsVisible(false), delay + 2900)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [delay])

  const getTypeStyles = (type: string) => {
    const styles = {
      task_complete: 'bg-green-600 border-green-500',
      task_failed: 'bg-red-600 border-red-500',
      level_up: 'bg-purple-600 border-purple-500',
      achievement_unlock: 'bg-yellow-600 border-yellow-500',
      battle_result: 'bg-blue-600 border-blue-500',
      agent_idle: 'bg-gray-600 border-gray-500',
      system: 'bg-indigo-600 border-indigo-500'
    }
    return styles[type as keyof typeof styles] || styles.system
  }

  const getIcon = (type: string) => {
    const icons = {
      task_complete: '✅',
      task_failed: '❌',
      level_up: '⬆️',
      achievement_unlock: '🏆',
      battle_result: '⚔️',
      agent_idle: '💤',
      system: '🔔'
    }
    return icons[type as keyof typeof icons] || icons.system
  }

  return (
    <div
      className={`
        transform transition-all duration-300 pointer-events-auto
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div
        className={`
          ${getTypeStyles(notification.type)}
          text-white rounded-lg shadow-lg border-2
          p-4 min-w-[300px] max-w-md
        `}
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl">{getIcon(notification.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm mb-1">{notification.title}</div>
            <div className="text-xs opacity-90 line-clamp-2">{notification.message}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
