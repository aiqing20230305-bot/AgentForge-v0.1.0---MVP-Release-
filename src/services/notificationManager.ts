/**
 * 通知管理器
 * Notification Manager - Centralized notification system
 */

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: number
  read: boolean
  autoClose?: boolean // 是否自动关闭（Toast）
  duration?: number // 自动关闭时间（毫秒）
  actions?: NotificationAction[] // 操作按钮
  metadata?: Record<string, any> // 元数据
}

export interface NotificationAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
}

// 通知事件类型
export type NotificationEventType = 'add' | 'update' | 'remove' | 'markRead' | 'clearAll'

export interface NotificationEvent {
  type: NotificationEventType
  notification?: Notification
  notifications?: Notification[]
}

// 通知监听器
type NotificationListener = (event: NotificationEvent) => void

// 通知管理器类
class NotificationManager {
  private notifications: Notification[] = []
  private listeners: Set<NotificationListener> = new Set()
  private maxNotifications = 100 // 最大通知数
  private storageKey = 'agentforge_notifications'

  constructor() {
    this.loadNotifications()
    this.startCleanupInterval()
  }

  /**
   * 添加通知
   */
  add(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: Date.now(),
      read: false,
    }

    this.notifications.unshift(newNotification)

    // 限制数量
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications)
    }

    this.saveNotifications()
    this.emit({ type: 'add', notification: newNotification })

    console.log('[NotificationManager] Added:', newNotification)

    // 自动关闭（Toast）
    if (newNotification.autoClose) {
      const duration = newNotification.duration || 3000
      setTimeout(() => {
        this.remove(newNotification.id)
      }, duration)
    }

    return newNotification
  }

  /**
   * 移除通知
   */
  remove(id: string): void {
    const index = this.notifications.findIndex((n) => n.id === id)
    if (index !== -1) {
      const notification = this.notifications[index]
      this.notifications.splice(index, 1)
      this.saveNotifications()
      this.emit({ type: 'remove', notification })
      console.log('[NotificationManager] Removed:', id)
    }
  }

  /**
   * 标记为已读
   */
  markAsRead(id: string): void {
    const notification = this.notifications.find((n) => n.id === id)
    if (notification && !notification.read) {
      notification.read = true
      this.saveNotifications()
      this.emit({ type: 'markRead', notification })
      console.log('[NotificationManager] Marked as read:', id)
    }
  }

  /**
   * 全部标记为已读
   */
  markAllAsRead(): void {
    let updated = false
    this.notifications.forEach((n) => {
      if (!n.read) {
        n.read = true
        updated = true
      }
    })

    if (updated) {
      this.saveNotifications()
      this.emit({ type: 'markRead', notifications: this.notifications })
      console.log('[NotificationManager] Marked all as read')
    }
  }

  /**
   * 清空所有通知
   */
  clearAll(): void {
    this.notifications = []
    this.saveNotifications()
    this.emit({ type: 'clearAll' })
    console.log('[NotificationManager] Cleared all')
  }

  /**
   * 获取所有通知
   */
  getAll(): Notification[] {
    return [...this.notifications]
  }

  /**
   * 获取未读数量
   */
  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length
  }

  /**
   * 按类型过滤
   */
  getByType(type: NotificationType): Notification[] {
    return this.notifications.filter((n) => n.type === type)
  }

  /**
   * 添加监听器
   */
  addListener(listener: NotificationListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * 触发事件
   */
  private emit(event: NotificationEvent): void {
    this.listeners.forEach((listener) => listener(event))
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 加载通知（从localStorage）
   */
  private loadNotifications(): void {
    try {
      const saved = localStorage.getItem(this.storageKey)
      if (saved) {
        this.notifications = JSON.parse(saved)
        console.log('[NotificationManager] Loaded', this.notifications.length, 'notifications')
      }
    } catch (error) {
      console.error('[NotificationManager] Failed to load notifications:', error)
    }
  }

  /**
   * 保存通知（到localStorage）
   */
  private saveNotifications(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.notifications))
    } catch (error) {
      console.error('[NotificationManager] Failed to save notifications:', error)
    }
  }

  /**
   * 启动清理任务（清理过期通知）
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now()
      const expiryTime = 7 * 24 * 60 * 60 * 1000 // 7天
      const before = this.notifications.length

      this.notifications = this.notifications.filter(
        (n) => now - n.timestamp < expiryTime
      )

      if (this.notifications.length < before) {
        this.saveNotifications()
        console.log('[NotificationManager] Cleaned up', before - this.notifications.length, 'expired notifications')
      }
    }, 60 * 60 * 1000) // 每小时检查一次
  }
}

// 单例实例
let notificationManagerInstance: NotificationManager | null = null

/**
 * 获取通知管理器实例
 */
export function getNotificationManager(): NotificationManager {
  if (!notificationManagerInstance) {
    notificationManagerInstance = new NotificationManager()
  }
  return notificationManagerInstance
}

// 便捷方法
export const notify = {
  info: (title: string, message: string, options?: Partial<Notification>) => {
    return getNotificationManager().add({
      type: 'info',
      title,
      message,
      ...options,
    })
  },
  success: (title: string, message: string, options?: Partial<Notification>) => {
    return getNotificationManager().add({
      type: 'success',
      title,
      message,
      ...options,
    })
  },
  warning: (title: string, message: string, options?: Partial<Notification>) => {
    return getNotificationManager().add({
      type: 'warning',
      title,
      message,
      ...options,
    })
  },
  error: (title: string, message: string, options?: Partial<Notification>) => {
    return getNotificationManager().add({
      type: 'error',
      title,
      message,
      ...options,
    })
  },
  system: (title: string, message: string, options?: Partial<Notification>) => {
    return getNotificationManager().add({
      type: 'system',
      title,
      message,
      ...options,
    })
  },
}

export default NotificationManager
