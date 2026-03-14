/**
 * 通知中心组件
 * 显示所有历史通知
 */

import React from 'react'
import { useNotificationStore } from '../store/useNotificationStore'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, clearNotification, clearAll } = useNotificationStore()

  if (!isOpen) return null

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* 侧边栏 */}
      <div className="fixed top-0 right-0 h-full w-96 bg-gray-900 shadow-xl z-50 flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🔔</span>
              <span>通知中心</span>
            </h2>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-400 mt-1">
                {unreadCount} 条未读
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* 操作按钮 */}
        {notifications.length > 0 && (
          <div className="p-4 border-b border-gray-700 flex gap-2">
            <button
              onClick={markAllAsRead}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
            >
              全部已读
            </button>
            <button
              onClick={clearAll}
              className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded transition-colors"
            >
              清空全部
            </button>
          </div>
        )}

        {/* 通知列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p>暂无通知</p>
            </div>
          ) : (
            notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={() => markAsRead(notification.id)}
                onDelete={() => clearNotification(notification.id)}
              />
            ))
          )}
        </div>
      </div>
    </>
  )
}

interface NotificationItemProps {
  notification: any
  onMarkAsRead: () => void
  onDelete: () => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete
}) => {
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString()
  }

  return (
    <div
      className={`
        p-3 rounded-lg border transition-all cursor-pointer
        ${
          notification.read
            ? 'bg-gray-800 border-gray-700'
            : 'bg-blue-900/30 border-blue-600/50'
        }
        hover:bg-gray-750
      `}
      onClick={onMarkAsRead}
    >
      <div className="flex items-start gap-3">
        <div className="text-xl">{getIcon(notification.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-white text-sm mb-1">
            {notification.title}
          </div>
          <div className="text-xs text-gray-400 mb-2">
            {notification.message}
          </div>
          <div className="text-xs text-gray-500">
            {formatTime(notification.timestamp)}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="text-gray-500 hover:text-red-400 text-lg"
        >
          ×
        </button>
      </div>
    </div>
  )
}
