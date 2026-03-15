/**
 * 通知系统 Store
 * 管理桌面通知、浏览器通知和历史记录
 * 集成 notificationService 提供统一的通知接口
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { notificationService } from '../services/notificationService'

export type NotificationType = 'task_complete' | 'task_failed' | 'agent_idle' | 'level_up' | 'achievement_unlock' | 'battle_result' | 'system' | 'achievement'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  agentId?: string
  taskId?: string
  timestamp: string
  read: boolean
  actionUrl?: string
  icon?: string
}

export interface NotificationSettings {
  desktopEnabled: boolean
  browserEnabled: boolean
  soundEnabled: boolean
  volume: number // 0-100
}

interface NotificationStore {
  // 通知列表
  notifications: Notification[]

  // 设置
  settings: NotificationSettings

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  clearAll: () => void
  updateSettings: (settings: Partial<NotificationSettings>) => void

  // Getters
  getUnreadCount: () => number
  getRecentNotifications: (limit?: number) => Notification[]
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],

      settings: {
        desktopEnabled: true,
        browserEnabled: true,
        soundEnabled: true,
        volume: 50
      },

      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          read: false
        }

        set(state => ({
          notifications: [notification, ...state.notifications].slice(0, 100) // 保留最近100条
        }))

        // 使用新的 notificationService 处理所有通知
        notificationService.show({
          type: notification.type as any,
          title: notification.title,
          message: notification.message,
          agentId: notification.agentId,
          taskId: notification.taskId,
          actionUrl: notification.actionUrl,
          icon: notification.icon
        }).catch(err => {
          console.warn('Failed to show notification:', err)
        })
      },

      markAsRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          )
        }))
      },

      markAllAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true }))
        }))
      },

      clearNotification: (id) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }))
      },

      clearAll: () => {
        set({ notifications: [] })
      },

      updateSettings: (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }))
      },

      getUnreadCount: () => {
        return get().notifications.filter(n => !n.read).length
      },

      getRecentNotifications: (limit = 10) => {
        return get().notifications.slice(0, limit)
      }
    }),
    {
      name: 'notification-store'
    }
  )
)

// 旧的音效播放逻辑已迁移到 notificationService 中
