/**
 * 通知队列 - Notification Queue
 *
 * 负责：
 * - 通知排队
 * - 批量处理
 * - 失败重试
 * - 优先级处理
 */

import type { Notification } from './types';
import { notificationManager } from './notificationManager';

/**
 * 队列项
 */
interface QueueItem {
  notification: Omit<Notification, 'id' | 'createdAt'>;
  retries: number;
  maxRetries: number;
  addedAt: Date;
}

/**
 * 通知队列类
 */
export class NotificationQueue {
  private queue: QueueItem[] = [];
  private processing = false;
  private processInterval = 1000; // 1秒处理一次
  private maxRetries = 3;
  private timer: NodeJS.Timeout | null = null;

  /**
   * 启动队列处理
   */
  start(): void {
    if (this.processing) {
      return;
    }

    this.processing = true;
    this.timer = setInterval(() => {
      this.process();
    }, this.processInterval);

    console.log('🚀 Notification queue started');
  }

  /**
   * 停止队列处理
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.processing = false;
    console.log('⏸️ Notification queue stopped');
  }

  /**
   * 入队通知
   */
  enqueue(notification: Omit<Notification, 'id' | 'createdAt'>, maxRetries?: number): void {
    const item: QueueItem = {
      notification,
      retries: 0,
      maxRetries: maxRetries || this.maxRetries,
      addedAt: new Date(),
    };

    // 根据优先级插入
    const priorityOrder = ['urgent', 'high', 'normal', 'low'];
    const itemPriority = priorityOrder.indexOf(notification.priority);

    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      const queuePriority = priorityOrder.indexOf(this.queue[i].notification.priority);
      if (itemPriority < queuePriority) {
        insertIndex = i;
        break;
      }
    }

    this.queue.splice(insertIndex, 0, item);

    console.log(`📥 Notification enqueued (priority: ${notification.priority}, queue length: ${this.queue.length})`);
  }

  /**
   * 出队通知
   */
  dequeue(): QueueItem | undefined {
    return this.queue.shift();
  }

  /**
   * 处理队列
   */
  async process(): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }

    const item = this.dequeue();
    if (!item) {
      return;
    }

    try {
      // 创建通知
      await notificationManager.createNotification(item.notification);

      console.log(`✅ Notification processed successfully`);
    } catch (error) {
      console.error('❌ Failed to process notification:', error);

      // 重试
      if (item.retries < item.maxRetries) {
        item.retries++;
        this.queue.push(item); // 重新入队（放到队尾）

        console.log(`🔄 Notification re-queued (retry ${item.retries}/${item.maxRetries})`);
      } else {
        console.error(`❌ Notification failed after ${item.maxRetries} retries, dropping`);
      }
    }
  }

  /**
   * 批量入队
   */
  batchEnqueue(notifications: Array<Omit<Notification, 'id' | 'createdAt'>>): void {
    for (const notification of notifications) {
      this.enqueue(notification);
    }

    console.log(`📥 ${notifications.length} notifications enqueued`);
  }

  /**
   * 获取队列长度
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * 获取队列统计
   */
  getStats() {
    const byPriority: Record<string, number> = {
      urgent: 0,
      high: 0,
      normal: 0,
      low: 0,
    };

    for (const item of this.queue) {
      byPriority[item.notification.priority]++;
    }

    return {
      total: this.queue.length,
      byPriority,
      processing: this.processing,
      processInterval: this.processInterval,
    };
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue = [];
    console.log('🗑️ Notification queue cleared');
  }

  /**
   * 获取队列前N项（不移除）
   */
  peek(count: number = 10): QueueItem[] {
    return this.queue.slice(0, count);
  }
}

// 导出单例实例
export const notificationQueue = new NotificationQueue();

// 自动启动队列
notificationQueue.start();
