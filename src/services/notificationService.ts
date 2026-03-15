/**
 * Notification Service
 * Unified interface for desktop notifications, browser notifications, and sound effects
 */

/// <reference path="../types/electron.d.ts" />

import { soundPlayer, type SoundType } from '../utils/soundPlayer'

export type NotificationType = 'task_complete' | 'task_failed' | 'agent_idle' | 'level_up' | 'achievement' | 'system'

export interface NotificationOptions {
  type: NotificationType
  title: string
  message: string
  agentId?: string
  taskId?: string
  actionUrl?: string
  silent?: boolean // Override sound setting
  icon?: string
}

export interface NotificationSettings {
  desktopEnabled: boolean
  browserEnabled: boolean
  soundEnabled: boolean
  soundVolume: number
}

const DEFAULT_SETTINGS: NotificationSettings = {
  desktopEnabled: true,
  browserEnabled: true,
  soundEnabled: true,
  soundVolume: 0.5
}

const SETTINGS_KEY = 'notification-settings'

class NotificationService {
  private settings: NotificationSettings = DEFAULT_SETTINGS
  private isElectron: boolean = false

  constructor() {
    this.isElectron = typeof window !== 'undefined' && 'electronAPI' in window
    this.loadSettings()
    this.applySoundSettings()
  }

  /**
   * Show a notification
   */
  async show(options: NotificationOptions): Promise<void> {
    const { type, title, message, silent, icon } = options

    // Play sound first (unless silent)
    if (!silent) {
      this.playSound(type)
    }

    // Desktop notification (Electron)
    if (this.settings.desktopEnabled && this.isElectron) {
      await this.showDesktopNotification(title, message, icon, silent)
    }

    // Browser notification (fallback or when not in Electron)
    if (this.settings.browserEnabled && !this.isElectron) {
      await this.showBrowserNotification(title, message, icon)
    }

    // Store notification in history (for NotificationCenter)
    this.storeNotification(options)
  }

  /**
   * Show desktop notification via Electron
   */
  private async showDesktopNotification(
    title: string,
    body: string,
    icon?: string,
    silent?: boolean
  ): Promise<void> {
    if (!this.isElectron) return

    try {
      // Type assertion for electronAPI with showNotification
      const electronAPI = window.electronAPI as any
      if (typeof electronAPI.showNotification === 'function') {
        const result = await electronAPI.showNotification({
          title,
          body,
          icon,
          silent: silent ?? false
        })

        if (!result.success) {
          console.warn('Desktop notification failed:', result.error)
        }
      } else {
        console.warn('showNotification is not available in electronAPI')
      }
    } catch (error) {
      console.error('Failed to show desktop notification:', error)
    }
  }

  /**
   * Show browser notification (web standard)
   */
  private async showBrowserNotification(
    title: string,
    body: string,
    icon?: string
  ): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('Browser notifications not supported')
      return
    }

    // Request permission if needed
    if (Notification.permission === 'default') {
      await Notification.requestPermission()
    }

    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon,
          badge: '/icon.png'
        })
      } catch (error) {
        console.error('Failed to show browser notification:', error)
      }
    }
  }

  /**
   * Play sound for notification type
   */
  private playSound(type: NotificationType): void {
    if (!this.settings.soundEnabled) return

    let soundType: SoundType

    switch (type) {
      case 'task_complete':
        soundType = 'task-complete'
        break
      case 'task_failed':
        soundType = 'task-failed'
        break
      case 'level_up':
      case 'achievement':
        soundType = 'level-up'
        break
      default:
        // No sound for other types
        return
    }

    soundPlayer.play(soundType).catch(err => {
      console.warn('Failed to play sound:', err)
    })
  }

  /**
   * Store notification in history
   */
  private storeNotification(options: NotificationOptions): void {
    try {
      const notifications = this.getNotificationHistory()
      const notification = {
        id: `${Date.now()}-${Math.random()}`,
        ...options,
        timestamp: new Date().toISOString(),
        read: false
      }

      notifications.unshift(notification)

      // Keep last 50 notifications
      if (notifications.length > 50) {
        notifications.splice(50)
      }

      localStorage.setItem('notification-history', JSON.stringify(notifications))
    } catch (error) {
      console.error('Failed to store notification:', error)
    }
  }

  /**
   * Get notification history
   */
  getNotificationHistory(): Array<NotificationOptions & { id: string; timestamp: string; read: boolean }> {
    try {
      const data = localStorage.getItem('notification-history')
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    try {
      const notifications = this.getNotificationHistory()
      const notification = notifications.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
        localStorage.setItem('notification-history', JSON.stringify(notifications))
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): void {
    try {
      const notifications = this.getNotificationHistory()
      notifications.forEach(n => n.read = true)
      localStorage.setItem('notification-history', JSON.stringify(notifications))
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  /**
   * Clear notification history
   */
  clearHistory(): void {
    localStorage.removeItem('notification-history')
  }

  /**
   * Update settings
   */
  updateSettings(settings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...settings }
    this.saveSettings()
    this.applySoundSettings()
  }

  /**
   * Get current settings
   */
  getSettings(): NotificationSettings {
    return { ...this.settings }
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const data = localStorage.getItem(SETTINGS_KEY)
      if (data) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(data) }
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error)
      this.settings = DEFAULT_SETTINGS
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings))
    } catch (error) {
      console.error('Failed to save notification settings:', error)
    }
  }

  /**
   * Apply sound settings to sound player
   */
  private applySoundSettings(): void {
    soundPlayer.setEnabled(this.settings.soundEnabled)
    soundPlayer.setVolume(this.settings.soundVolume)
  }

  /**
   * Request browser notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied'
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission()
    }

    return Notification.permission
  }
}

// Global singleton instance
export const notificationService = new NotificationService()

// Convenient helper functions
export const notify = {
  taskComplete: (taskTitle: string, agentName: string) =>
    notificationService.show({
      type: 'task_complete',
      title: '任务完成 ✅',
      message: `${agentName} 已完成任务: ${taskTitle}`
    }),

  taskFailed: (taskTitle: string, agentName: string, error: string) =>
    notificationService.show({
      type: 'task_failed',
      title: '任务失败 ❌',
      message: `${agentName} 任务失败: ${taskTitle}\n错误: ${error}`
    }),

  levelUp: (agentName: string, newLevel: number) =>
    notificationService.show({
      type: 'level_up',
      title: '升级啦！🎉',
      message: `${agentName} 升到了 ${newLevel} 级！`
    }),

  achievement: (achievementTitle: string, description: string) =>
    notificationService.show({
      type: 'achievement',
      title: `成就解锁！🏆`,
      message: `${achievementTitle}: ${description}`
    }),

  agentIdle: (agentName: string) =>
    notificationService.show({
      type: 'agent_idle',
      title: 'Agent 空闲',
      message: `${agentName} 已完成所有任务，等待新任务...`,
      silent: true // Don't play sound for idle notifications
    })
}
