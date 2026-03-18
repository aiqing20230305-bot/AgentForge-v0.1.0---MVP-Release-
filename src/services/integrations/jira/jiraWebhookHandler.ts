/**
 * Jira Webhook Handler
 * 处理来自 Jira 的 Webhook 事件
 */

import { createHmac } from 'crypto'

export interface JiraWebhookEvent {
  webhookEvent: string;
  issue?: {
    id: string;
    key: string;
    fields: any;
  };
  changelog?: {
    items: Array<{
      field: string;
      fromString?: string;
      toString?: string;
    }>;
  };
  comment?: {
    id: string;
    body: any;
    author: any;
  };
  timestamp: number;
}

export type WebhookEventType =
  | 'jira:issue_created'
  | 'jira:issue_updated'
  | 'jira:issue_deleted'
  | 'comment_created'
  | 'comment_updated'
  | 'comment_deleted';

export interface WebhookHandler {
  eventType: WebhookEventType;
  handler: (event: JiraWebhookEvent) => Promise<void>;
}

class JiraWebhookHandler {
  private handlers: Map<WebhookEventType, WebhookHandler['handler'][]> = new Map();
  private webhookUrl: string = '';
  private webhookSecret: string = '';
  private eventQueue: JiraWebhookEvent[] = [];
  private processing: boolean = false;

  /**
   * 初始化 Webhook 处理器
   */
  initialize(webhookUrl: string, webhookSecret?: string): void {
    this.webhookUrl = webhookUrl;
    this.webhookSecret = webhookSecret || '';
    this.registerDefaultHandlers();
  }

  /**
   * 注册默认的事件处理器
   */
  private registerDefaultHandlers(): void {
    // Issue 创建事件
    this.on('jira:issue_created', async (event) => {
      console.log('Jira issue created:', event.issue?.key);

      window.dispatchEvent(new CustomEvent('jira:issue-created', {
        detail: {
          issueKey: event.issue?.key,
          issue: event.issue
        }
      }));
    });

    // Issue 更新事件
    this.on('jira:issue_updated', async (event) => {
      console.log('Jira issue updated:', event.issue?.key);

      // 检查状态变化
      const statusChange = event.changelog?.items.find(item => item.field === 'status');
      if (statusChange) {
        window.dispatchEvent(new CustomEvent('jira:status-changed', {
          detail: {
            issueKey: event.issue?.key,
            from: statusChange.fromString,
            to: statusChange.toString
          }
        }));
      }

      window.dispatchEvent(new CustomEvent('jira:issue-updated', {
        detail: {
          issueKey: event.issue?.key,
          issue: event.issue,
          changelog: event.changelog
        }
      }));
    });

    // Issue 删除事件
    this.on('jira:issue_deleted', async (event) => {
      console.log('Jira issue deleted:', event.issue?.key);

      window.dispatchEvent(new CustomEvent('jira:issue-deleted', {
        detail: {
          issueKey: event.issue?.key
        }
      }));
    });

    // 评论创建事件
    this.on('comment_created', async (event) => {
      console.log('Comment created on:', event.issue?.key);

      window.dispatchEvent(new CustomEvent('jira:comment-created', {
        detail: {
          issueKey: event.issue?.key,
          comment: event.comment
        }
      }));
    });
  }

  /**
   * 注册事件处理器
   */
  on(eventType: WebhookEventType, handler: WebhookHandler['handler']): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  /**
   * 注销事件处理器
   */
  off(eventType: WebhookEventType, handler: WebhookHandler['handler']): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 验证 Webhook 签名
   */
  private verifySignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      return true // 如果没有配置密钥，跳过验证
    }

    try {
      const hmac = createHmac('sha256', this.webhookSecret)
      hmac.update(payload)
      const computedSignature = `sha256=${hmac.digest('hex')}`

      // 使用时序安全的比较避免时序攻击
      return this.timingSafeEqual(computedSignature, signature)
    } catch (error) {
      console.error('[JiraWebhook] Signature verification failed:', error)
      return false
    }
  }

  /**
   * 时序安全的字符串比较
   */
  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false
    }

    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }

    return result === 0
  }

  /**
   * 处理 Webhook 事件
   */
  async handleWebhook(event: JiraWebhookEvent, signature?: string): Promise<void> {
    // 验证签名（如果配置了密钥）
    if (this.webhookSecret && signature) {
      const payload = JSON.stringify(event)
      if (!this.verifySignature(payload, signature)) {
        console.error('[JiraWebhook] Invalid signature - rejecting webhook')
        throw new Error('Invalid webhook signature')
      }
      console.log('[JiraWebhook] Signature verified successfully')
    }

    // 添加到队列
    this.eventQueue.push(event);

    // 开始处理
    if (!this.processing) {
      await this.processQueue();
    }
  }

  /**
   * 处理事件队列
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.eventQueue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;

      try {
        await this.processEvent(event);
      } catch (error) {
        console.error('Error processing webhook event:', error);

        // 记录错误
        this.logError(event, error);
      }
    }

    this.processing = false;
  }

  /**
   * 处理单个事件
   */
  private async processEvent(event: JiraWebhookEvent): Promise<void> {
    const eventType = event.webhookEvent as WebhookEventType;
    const handlers = this.handlers.get(eventType);

    if (!handlers || handlers.length === 0) {
      console.warn(`No handlers registered for event type: ${eventType}`);
      return;
    }

    // 并行执行所有处理器
    await Promise.all(
      handlers.map(handler => handler(event).catch(error => {
        console.error(`Handler error for ${eventType}:`, error);
      }))
    );
  }

  /**
   * 记录错误
   */
  private logError(event: JiraWebhookEvent, error: any): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      eventType: event.webhookEvent,
      issueKey: event.issue?.key,
      error: error instanceof Error ? error.message : String(error)
    };

    // 保存到本地存储
    try {
      const logs = this.getErrorLogs();
      logs.push(errorLog);

      // 只保留最近 100 条错误日志
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }

      localStorage.setItem('jira_webhook_errors', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save error log:', e);
    }
  }

  /**
   * 获取错误日志
   */
  getErrorLogs(): any[] {
    try {
      const stored = localStorage.getItem('jira_webhook_errors');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * 清除错误日志
   */
  clearErrorLogs(): void {
    localStorage.removeItem('jira_webhook_errors');
  }

  /**
   * 获取 Webhook URL
   */
  getWebhookUrl(): string {
    return this.webhookUrl;
  }

  /**
   * 测试 Webhook 连接
   */
  async testWebhook(): Promise<boolean> {
    try {
      // 发送测试事件
      const testEvent: JiraWebhookEvent = {
        webhookEvent: 'test',
        timestamp: Date.now()
      };

      await this.handleWebhook(testEvent);
      return true;
    } catch (error) {
      console.error('Webhook test failed:', error);
      return false;
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalHandlers: number;
    queueLength: number;
    processing: boolean;
    errorCount: number;
  } {
    let totalHandlers = 0;
    this.handlers.forEach(handlers => {
      totalHandlers += handlers.length;
    });

    return {
      totalHandlers,
      queueLength: this.eventQueue.length,
      processing: this.processing,
      errorCount: this.getErrorLogs().length
    };
  }

  /**
   * 重试失败的事件
   */
  async retryFailedEvents(): Promise<void> {
    const logs = this.getErrorLogs();

    // 这里可以实现重试逻辑
    console.log(`Found ${logs.length} failed events`);

    // 清除错误日志
    this.clearErrorLogs();
  }

  /**
   * 创建 Webhook 配置（用于在 Jira 中设置）
   */
  getWebhookConfig(): {
    url: string;
    events: string[];
    filters?: any;
  } {
    return {
      url: this.webhookUrl,
      events: [
        'jira:issue_created',
        'jira:issue_updated',
        'jira:issue_deleted',
        'comment_created',
        'comment_updated',
        'comment_deleted'
      ],
      filters: {
        'issue-related-events-section': true
      }
    };
  }

  /**
   * 模拟 Webhook 事件（用于测试）
   */
  simulateEvent(eventType: WebhookEventType, issueKey: string): void {
    const event: JiraWebhookEvent = {
      webhookEvent: eventType,
      issue: {
        id: '10001',
        key: issueKey,
        fields: {
          summary: 'Test Issue',
          status: { name: 'In Progress' }
        }
      },
      timestamp: Date.now()
    };

    this.handleWebhook(event).catch(console.error);
  }
}

export const jiraWebhookHandler = new JiraWebhookHandler();
