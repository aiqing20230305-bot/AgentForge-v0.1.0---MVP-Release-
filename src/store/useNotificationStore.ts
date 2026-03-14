/**
 * 通知系统 Store
 * 管理桌面通知、浏览器通知和历史记录
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotificationType = 'task_complete' | 'task_failed' | 'agent_idle' | 'level_up' | 'achievement_unlock' | 'battle_result' | 'system'

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

        // 触发浏览器通知
        const { settings } = get()
        if (settings.browserEnabled) {
          // 会在组件中处理
        }

        // 播放声音
        if (settings.soundEnabled) {
          playNotificationSound(notification.type, settings.volume)
        }

        // 桌面通知（Electron）
        if (settings.desktopEnabled && window.electron) {
          window.electron.showNotification({
            title: notification.title,
            body: notification.message,
            icon: notification.icon
          })
        }
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

/**
 * 播放通知音效
 */
function playNotificationSound(type: NotificationType, volume: number) {
  const soundMap: Record<NotificationType, string> = {
    task_complete: '/sounds/task-complete.mp3',
    task_failed: '/sounds/task-failed.mp3',
    level_up: '/sounds/level-up.mp3',
    achievement_unlock: '/sounds/achievement.mp3',
    battle_result: '/sounds/battle-end.mp3',
    agent_idle: '/sounds/notification.mp3',
    system: '/sounds/notification.mp3'
  }

  const soundPath = soundMap[type]
  if (soundPath) {
    const audio = new Audio(soundPath)
    audio.volume = volume / 100
    audio.play().catch(err => {
      console.warn('无法播放通知音效:', err)
    })
  }
}

/**
 * 声明 Electron API
 */
declare global {
  interface Window {
    electron?: {
      showNotification: (options: { title: string; body: string; icon?: string }) => void
    }
  }
}
