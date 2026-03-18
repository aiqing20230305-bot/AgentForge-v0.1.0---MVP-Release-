/**
 * 通知管理器 - Notification Manager
 *
 * 负责：
 * - 通知CRUD操作
 * - 通知持久化（内存/数据库）
 * - 未读计数
 * - 通知查询
 */

import type { Notification, NotificationType, NotificationPriority, QueryOptions } from './types';
import { websocketServer } from './websocketServer';

/**
 * 通知管理器类
 */
export class NotificationManager {
  private notifications: Map<string, Notification> = new Map();
  private userNotifications: Map<string, Set<string>> = new Map(); // userId -> notificationIds

  /**
   * 创建通知
   */
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const fullNotification: Notification = {
      ...notification,
      id: this.generateId(),
      createdAt: new Date(),
    };

    // 保存通知
    this.notifications.set(fullNotification.id, fullNotification);

    // 添加到用户通知列表
    this.addToUserNotifications(fullNotification.userId, fullNotification.id);

    // 实时推送
    websocketServer.sendNotification(fullNotification.userId, fullNotification);

    console.log(`📬 Notification created: ${fullNotification.id} for ${fullNotification.userId}`);

    return fullNotification;
  }

  /**
   * 标记为已读
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);

    if (!notification) {
      throw new Error(`Notification not found: ${notificationId}`);
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized: notification does not belong to user');
    }

    if (!notification.readAt) {
      notification.readAt = new Date();
      console.log(`✅ Notification marked as read: ${notificationId}`);
    }
  }

  /**
   * 标记所有为已读
   */
  async markAllAsRead(userId: string): Promise<number> {
    const userNotificationIds = this.userNotifications.get(userId);

    if (!userNotificationIds) {
      return 0;
    }

    let count = 0;
    for (const notificationId of userNotificationIds) {
      const notification = this.notifications.get(notificationId);
      if (notification && !notification.readAt) {
        notification.readAt = new Date();
        count++;
      }
    }

    console.log(`✅ Marked ${count} notifications as read for ${userId}`);
    return count;
  }

  /**
   * 删除通知
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);

    if (!notification) {
      throw new Error(`Notification not found: ${notificationId}`);
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized: notification does not belong to user');
    }

    // 从用户通知列表中移除
    this.removeFromUserNotifications(userId, notificationId);

    // 删除通知
    this.notifications.delete(notificationId);

    console.log(`🗑️ Notification deleted: ${notificationId}`);
  }

  /**
   * 删除所有通知
   */
  async deleteAllNotifications(userId: string): Promise<number> {
    const userNotificationIds = this.userNotifications.get(userId);

    if (!userNotificationIds) {
      return 0;
    }

    const count = userNotificationIds.size;

    // 删除所有通知
    for (const notificationId of userNotificationIds) {
      this.notifications.delete(notificationId);
    }

    // 清空用户通知列表
    this.userNotifications.delete(userId);

    console.log(`🗑️ Deleted ${count} notifications for ${userId}`);
    return count;
  }

  /**
   * 获取未读数量
   */
  async getUnreadCount(userId: string): Promise<number> {
    const userNotificationIds = this.userNotifications.get(userId);

    if (!userNotificationIds) {
      return 0;
    }

    let count = 0;
    for (const notificationId of userNotificationIds) {
      const notification = this.notifications.get(notificationId);
      if (notification && !notification.readAt) {
        count++;
      }
    }

    return count;
  }

  /**
   * 获取用户的通知列表
   */
  async getNotifications(userId: string, options: QueryOptions = {}): Promise<Notification[]> {
    const userNotificationIds = this.userNotifications.get(userId);

    if (!userNotificationIds) {
      return [];
    }

    // 获取所有通知
    let notifications: Notification[] = [];
    for (const notificationId of userNotificationIds) {
      const notification = this.notifications.get(notificationId);
      if (notification) {
        notifications.push(notification);
      }
    }

    // 应用过滤器
    notifications = this.applyFilters(notifications, options);

    // 排序（最新的在前）
    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // 分页
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    notifications = notifications.slice(offset, offset + limit);

    return notifications;
  }

  /**
   * 应用过滤器
   */
  private applyFilters(notifications: Notification[], options: QueryOptions): Notification[] {
    let filtered = notifications;

    // 只显示未读
    if (options.unreadOnly) {
      filtered = filtered.filter((n) => !n.readAt);
    }

    // 类型过滤
    if (options.types && options.types.length > 0) {
      filtered = filtered.filter((n) => options.types!.includes(n.type));
    }

    // 日期范围过滤
    if (options.startDate) {
      filtered = filtered.filter((n) => n.createdAt >= options.startDate!);
    }

    if (options.endDate) {
      filtered = filtered.filter((n) => n.createdAt <= options.endDate!);
    }

    return filtered;
  }

  /**
   * 获取单个通知
   */
  async getNotification(notificationId: string): Promise<Notification | null> {
    return this.notifications.get(notificationId) || null;
  }

  /**
   * 批量创建通知
   */
  async batchCreate(notifications: Array<Omit<Notification, 'id' | 'createdAt'>>): Promise<Notification[]> {
    const created: Notification[] = [];

    for (const notification of notifications) {
      const fullNotification = await this.createNotification(notification);
      created.push(fullNotification);
    }

    return created;
  }

  /**
   * 创建系统通知（发送给所有用户）
   */
  async createSystemNotification(
    notification: Omit<Notification, 'id' | 'createdAt' | 'userId' | 'type'>
  ): Promise<void> {
    // 获取所有在线用户
    const onlineUsers = websocketServer.getOnlineUsers();

    // 为每个用户创建通知
    for (const userId of onlineUsers) {
      await this.createNotification({
        ...notification,
        userId,
        type: 'system',
      });
    }

    console.log(`📢 System notification sent to ${onlineUsers.length} users`);
  }

  /**
   * 清理过期通知
   */
  async cleanupExpired(): Promise<number> {
    const now = new Date();
    let count = 0;

    for (const [id, notification] of this.notifications) {
      if (notification.expiresAt && notification.expiresAt < now) {
        this.notifications.delete(id);
        this.removeFromUserNotifications(notification.userId, id);
        count++;
      }
    }

    if (count > 0) {
      console.log(`🗑️ Cleaned up ${count} expired notifications`);
    }

    return count;
  }

  /**
   * 获取通知统计
   */
  async getStats(userId: string) {
    const userNotificationIds = this.userNotifications.get(userId);

    if (!userNotificationIds) {
      return {
        total: 0,
        unread: 0,
        byType: {},
        byPriority: {},
      };
    }

    const notifications: Notification[] = [];
    for (const notificationId of userNotificationIds) {
      const notification = this.notifications.get(notificationId);
      if (notification) {
        notifications.push(notification);
      }
    }

    const unread = notifications.filter((n) => !n.readAt).length;
    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    for (const notification of notifications) {
      byType[notification.type] = (byType[notification.type] || 0) + 1;
      byPriority[notification.priority] = (byPriority[notification.priority] || 0) + 1;
    }

    return {
      total: notifications.length,
      unread,
      byType,
      byPriority,
    };
  }

  /**
   * 添加到用户通知列表
   */
  private addToUserNotifications(userId: string, notificationId: string): void {
    let userNotifications = this.userNotifications.get(userId);

    if (!userNotifications) {
      userNotifications = new Set();
      this.userNotifications.set(userId, userNotifications);
    }

    userNotifications.add(notificationId);
  }

  /**
   * 从用户通知列表移除
   */
  private removeFromUserNotifications(userId: string, notificationId: string): void {
    const userNotifications = this.userNotifications.get(userId);

    if (userNotifications) {
      userNotifications.delete(notificationId);

      if (userNotifications.size === 0) {
        this.userNotifications.delete(userId);
      }
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取全局统计
   */
  getGlobalStats() {
    return {
      totalNotifications: this.notifications.size,
      totalUsers: this.userNotifications.size,
      onlineUsers: websocketServer.getOnlineUserCount(),
    };
  }
}

// 导出单例实例
export const notificationManager = new NotificationManager();
