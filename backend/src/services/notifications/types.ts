/**
 * 通知系统 - 类型定义
 *
 * 后端通知服务的核心类型
 */

/**
 * 通知类型
 */
export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'achievement'
  | 'task'
  | 'team'
  | 'system'
  | 'social';

/**
 * 通知优先级
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * 通知操作
 */
export interface NotificationAction {
  id: string;
  label: string;
  action: string; // 'navigate', 'api_call', 'dismiss', etc.
  params?: Record<string, any>;
}

/**
 * 通知接口
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  link?: string;
  actions?: NotificationAction[];
  priority: NotificationPriority;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * 查询选项
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
  types?: NotificationType[];
  startDate?: Date;
  endDate?: Date;
}

/**
 * WebSocket消息类型
 */
export type WSMessageType =
  | 'notification'
  | 'ping'
  | 'pong'
  | 'auth'
  | 'subscribe'
  | 'unsubscribe'
  | 'ack';

/**
 * WebSocket消息
 */
export interface WSMessage {
  type: WSMessageType;
  data?: any;
  timestamp: number;
}

/**
 * 通知订阅
 */
export interface NotificationSubscription {
  userId: string;
  types?: NotificationType[];
  priority?: NotificationPriority[];
}
