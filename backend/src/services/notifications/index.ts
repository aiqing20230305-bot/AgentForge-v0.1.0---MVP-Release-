/**
 * 通知系统 - 统一导出
 *
 * @module notifications
 */

// 类型定义
export type * from './types';

// WebSocket服务器
export { WebSocketServer, websocketServer } from './websocketServer';

// 通知管理器
export { NotificationManager, notificationManager } from './notificationManager';

// 通知队列
export { NotificationQueue, notificationQueue } from './notificationQueue';

// 通知模板
export { notificationTemplates, createCustomNotification } from './notificationTemplates';
