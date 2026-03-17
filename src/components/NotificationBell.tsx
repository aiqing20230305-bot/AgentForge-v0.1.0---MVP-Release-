/**
 * 通知铃铛按钮
 * Notification Bell - Button with unread badge
 */

import React from 'react'
import { Bell } from 'lucide-react'
import { useNotificationStore } from '../store/useNotificationStore'
import { motion, AnimatePresence } from 'framer-motion'

interface NotificationBellProps {
  onClick: () => void
  className?: string
}

/**
 * NotificationBell - 通知铃铛按钮（显示未读数）
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({
  onClick,
  className = '',
}) => {
  const { unreadCount } = useNotificationStore()

  return (
    <button
      onClick={onClick}
      className={`relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ${className}`}
      title={`通知 ${unreadCount > 0 ? `(${unreadCount} 未读)` : ''}`}
    >
      <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />

      {/* 未读数角标 */}
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 脉冲动画（有未读时） */}
      {unreadCount > 0 && (
        <span className="absolute top-2 right-2 w-2 h-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        </span>
      )}
    </button>
  )
}

export default NotificationBell
