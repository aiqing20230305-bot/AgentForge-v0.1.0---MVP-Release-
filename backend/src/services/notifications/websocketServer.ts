/**
 * WebSocket服务器 - WebSocket Server
 *
 * 负责：
 * - WebSocket连接管理
 * - 实时消息推送
 * - 心跳检测
 * - 用户认证
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { Notification, WSMessage, NotificationSubscription } from './types';

/**
 * WebSocket服务器类
 */
export class WebSocketServer {
  private io: SocketIOServer | null = null;
  private connections: Map<string, Socket> = new Map(); // userId -> socket
  private subscriptions: Map<string, NotificationSubscription> = new Map(); // userId -> subscription
  private heartbeatInterval = 30000; // 30秒心跳
  private heartbeatTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * 初始化WebSocket服务器
   */
  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupEventHandlers();

    console.log('🔌 WebSocket Server initialized');
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`🔗 New connection: ${socket.id}`);

      // 处理认证
      socket.on('auth', (data: { userId: string; token: string }) => {
        this.handleAuth(socket, data);
      });

      // 处理订阅
      socket.on('subscribe', (data: NotificationSubscription) => {
        this.handleSubscribe(socket, data);
      });

      // 处理取消订阅
      socket.on('unsubscribe', (data: { userId: string }) => {
        this.handleUnsubscribe(socket, data);
      });

      // 处理ping
      socket.on('ping', () => {
        this.handlePing(socket);
      });

      // 处理断开连接
      socket.on('disconnect', (reason: string) => {
        this.handleDisconnect(socket, reason);
      });

      // 处理错误
      socket.on('error', (error: Error) => {
        console.error(`❌ Socket error: ${socket.id}`, error);
      });
    });
  }

  /**
   * 处理用户认证
   */
  private handleAuth(socket: Socket, data: { userId: string; token: string }): void {
    // 实际应验证JWT token
    // 这里简化为直接接受
    const { userId, token } = data;

    // 验证token（简化版）
    if (!this.validateToken(token)) {
      socket.emit('auth_error', { message: 'Invalid token' });
      socket.disconnect();
      return;
    }

    // 保存连接
    this.connections.set(userId, socket);

    // 启动心跳
    this.startHeartbeat(userId, socket);

    // 发送认证成功消息
    socket.emit('auth_success', { userId });

    console.log(`✅ User authenticated: ${userId}`);
  }

  /**
   * 验证token（简化版）
   */
  private validateToken(token: string): boolean {
    // 实际应使用jsonwebtoken验证
    // 这里简化为检查token是否存在
    return !!token && token.length > 0;
  }

  /**
   * 处理订阅
   */
  private handleSubscribe(socket: Socket, subscription: NotificationSubscription): void {
    const { userId } = subscription;

    // 保存订阅信息
    this.subscriptions.set(userId, subscription);

    socket.emit('subscribe_success', { userId });

    console.log(`📌 User subscribed: ${userId}`);
  }

  /**
   * 处理取消订阅
   */
  private handleUnsubscribe(socket: Socket, data: { userId: string }): void {
    const { userId } = data;

    // 删除订阅信息
    this.subscriptions.delete(userId);

    socket.emit('unsubscribe_success', { userId });

    console.log(`📌 User unsubscribed: ${userId}`);
  }

  /**
   * 处理ping
   */
  private handlePing(socket: Socket): void {
    socket.emit('pong', { timestamp: Date.now() });
  }

  /**
   * 处理断开连接
   */
  private handleDisconnect(socket: Socket, reason: string): void {
    // 找到对应的userId
    let disconnectedUserId: string | null = null;
    for (const [userId, userSocket] of this.connections) {
      if (userSocket.id === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }

    if (disconnectedUserId) {
      // 清理连接
      this.connections.delete(disconnectedUserId);
      this.subscriptions.delete(disconnectedUserId);

      // 停止心跳
      this.stopHeartbeat(disconnectedUserId);

      console.log(`🔌 User disconnected: ${disconnectedUserId} (reason: ${reason})`);
    } else {
      console.log(`🔌 Connection disconnected: ${socket.id} (reason: ${reason})`);
    }
  }

  /**
   * 启动心跳检测
   */
  private startHeartbeat(userId: string, socket: Socket): void {
    // 清除旧的心跳定时器
    this.stopHeartbeat(userId);

    // 创建新的心跳定时器
    const timer = setInterval(() => {
      if (socket.connected) {
        socket.emit('heartbeat', { timestamp: Date.now() });
      } else {
        this.stopHeartbeat(userId);
      }
    }, this.heartbeatInterval);

    this.heartbeatTimers.set(userId, timer);
  }

  /**
   * 停止心跳检测
   */
  private stopHeartbeat(userId: string): void {
    const timer = this.heartbeatTimers.get(userId);
    if (timer) {
      clearInterval(timer);
      this.heartbeatTimers.delete(userId);
    }
  }

  /**
   * 发送通知给指定用户
   */
  sendNotification(userId: string, notification: Notification): void {
    const socket = this.connections.get(userId);

    if (!socket) {
      console.warn(`⚠️ User not connected: ${userId}`);
      return;
    }

    // 检查订阅过滤
    const subscription = this.subscriptions.get(userId);
    if (subscription) {
      // 检查类型过滤
      if (subscription.types && !subscription.types.includes(notification.type)) {
        return;
      }

      // 检查优先级过滤
      if (subscription.priority && !subscription.priority.includes(notification.priority)) {
        return;
      }
    }

    // 发送通知
    const message: WSMessage = {
      type: 'notification',
      data: notification,
      timestamp: Date.now(),
    };

    socket.emit('notification', message);

    console.log(`📨 Notification sent to ${userId}: ${notification.title}`);
  }

  /**
   * 广播通知给所有用户
   */
  broadcast(notification: Notification): void {
    if (!this.io) return;

    const message: WSMessage = {
      type: 'notification',
      data: notification,
      timestamp: Date.now(),
    };

    this.io.emit('notification', message);

    console.log(`📢 Notification broadcasted: ${notification.title}`);
  }

  /**
   * 发送通知给多个用户
   */
  sendToMultiple(userIds: string[], notification: Notification): void {
    userIds.forEach((userId) => {
      this.sendNotification(userId, notification);
    });
  }

  /**
   * 获取在线用户列表
   */
  getOnlineUsers(): string[] {
    return Array.from(this.connections.keys());
  }

  /**
   * 检查用户是否在线
   */
  isUserOnline(userId: string): boolean {
    return this.connections.has(userId);
  }

  /**
   * 获取在线用户数量
   */
  getOnlineUserCount(): number {
    return this.connections.size;
  }

  /**
   * 关闭服务器
   */
  close(): void {
    // 清除所有心跳定时器
    for (const timer of this.heartbeatTimers.values()) {
      clearInterval(timer);
    }
    this.heartbeatTimers.clear();

    // 关闭所有连接
    if (this.io) {
      this.io.close();
    }

    console.log('🔌 WebSocket Server closed');
  }

  /**
   * 获取服务器统计信息
   */
  getStats() {
    return {
      onlineUsers: this.getOnlineUserCount(),
      activeSubscriptions: this.subscriptions.size,
      activeHeartbeats: this.heartbeatTimers.size,
    };
  }
}

// 导出单例实例
export const websocketServer = new WebSocketServer();
