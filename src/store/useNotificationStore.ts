/**
 * 通知状态管理 Store
 * Notification Store - Zustand state management for notifications
 */

import { create } from 'zustand'
import {
  getNotificationManager,
  Notification,
  NotificationType,
} from '../services/notificationManager'

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  isOpen: boolean // 通知中心是否打开

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  refresh: () => void
  setOpen: (open: boolean) => void
  getByType: (type: NotificationType) => Notification[]
}

export const useNotificationStore = create<NotificationStore>((set, get) => {
  const manager = getNotificationManager()

  // 监听通知管理器变化
  manager.addListener(() => {
    set({
      notifications: manager.getAll(),
      unreadCount: manager.getUnreadCount(),
    })
  })

  return {
    notifications: manager.getAll(),
    unreadCount: manager.getUnreadCount(),
    isOpen: false,

    addNotification: (notification) => {
      manager.add(notification)
    },

    removeNotification: (id) => {
      manager.remove(id)
    },

    markAsRead: (id) => {
      manager.markAsRead(id)
    },

    markAllAsRead: () => {
      manager.markAllAsRead()
    },

    clearAll: () => {
      manager.clearAll()
    },

    refresh: () => {
      set({
        notifications: manager.getAll(),
        unreadCount: manager.getUnreadCount(),
      })
    },

    setOpen: (open) => {
      set({ isOpen: open })
    },

    getByType: (type) => {
      return manager.getByType(type)
    },
  }
})

export default useNotificationStore
