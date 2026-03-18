/**
 * 前端通知服务 - Notification Service
 *
 * 负责：
 * - WebSocket连接管理
 * - 通知接收和处理
 * - 桌面通知
 * - 本地通知状态管理
 */

import { io, Socket } from 'socket.io-client';
import type { Notification } from './types';

/**
 * 通知服务类
 */
export class NotificationService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private connected = false;

  // 回调函数
  private onNotificationCallbacks: Array<(notification: Notification) => void> = [];
  private onConnectCallbacks: Array<() => void> = [];
  private onDisconnectCallbacks: Array<() => void> = [];

  /**
   * 连接WebSocket服务器
   */
  async connect(userId: string, token: string): Promise<void> {
    if (this.connected) {
      console.warn('Already connected to notification server');
      return;
    }

    const serverUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    // 连接事件
    this.socket.on('connect', () => {
      console.log('🔗 Connected to notification server');
      this.connected = true;
      this.reconnectAttempts = 0;

      // 发送认证
      this.socket!.emit('auth', { userId, token });

      // 触发连接回调
      this.onConnectCallbacks.forEach((cb) => cb());
    });

    // 认证成功
    this.socket.on('auth_success', () => {
      console.log('✅ Authenticated successfully');
    });

    // 认证失败
    this.socket.on('auth_error', (data: { message: string }) => {
      console.error('❌ Authentication failed:', data.message);
      this.disconnect();
    });

    // 接收通知
    this.socket.on('notification', (message: { data: Notification; timestamp: number }) => {
      this.handleNotification(message.data);
    });

    // 心跳
    this.socket.on('heartbeat', () => {
      // 心跳响应
    });

    // 断开连接
    this.socket.on('disconnect', (reason: string) => {
      console.log('🔌 Disconnected from notification server:', reason);
      this.connected = false;

      // 触发断开回调
      this.onDisconnectCallbacks.forEach((cb) => cb());
    });

    // 重连
    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.connected = true;
    });

    // 重连失败
    this.socket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect to notification server');
    });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * 处理接收到的通知
   */
  private handleNotification(notification: Notification): void {
    console.log('📨 Notification received:', notification.title);

    // 触发回调
    this.onNotificationCallbacks.forEach((cb) => cb(notification));

    // 显示桌面通知
    if (this.shouldShowDesktopNotification(notification)) {
      this.showDesktopNotification(notification);
    }
  }

  /**
   * 判断是否显示桌面通知
   */
  private shouldShowDesktopNotification(notification: Notification): boolean {
    // 高优先级和紧急通知才显示桌面通知
    return notification.priority === 'high' || notification.priority === 'urgent';
  }

  /**
   * 显示桌面通知
   */
  private async showDesktopNotification(notification: Notification): Promise<void> {
    if (!('Notification' in window)) {
      return;
    }

    // 请求权限
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return;
      }
    }

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/icon.png',
        badge: '/badge.png',
        tag: notification.id,
      });
    }
  }

  /**
   * 监听通知
   */
  onNotification(callback: (notification: Notification) => void): () => void {
    this.onNotificationCallbacks.push(callback);

    // 返回取消订阅函数
    return () => {
      const index = this.onNotificationCallbacks.indexOf(callback);
      if (index > -1) {
        this.onNotificationCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * 监听连接
   */
  onConnect(callback: () => void): () => void {
    this.onConnectCallbacks.push(callback);

    return () => {
      const index = this.onConnectCallbacks.indexOf(callback);
      if (index > -1) {
        this.onConnectCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * 监听断开连接
   */
  onDisconnect(callback: () => void): () => void {
    this.onDisconnectCallbacks.push(callback);

    return () => {
      const index = this.onDisconnectCallbacks.indexOf(callback);
      if (index > -1) {
        this.onDisconnectCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * 请求桌面通知权限
   */
  async requestDesktopPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Desktop notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
}

// 导出单例实例
export const notificationService = new NotificationService();
