/**
 * GitHub Webhook Handler
 * 处理来自 GitHub 的 Webhook 事件
 */

import { githubSyncService } from './githubSyncService';

export interface GitHubWebhookEvent {
  action: string;
  issue?: any;
  pull_request?: any;
  comment?: any;
  review?: any;
  repository: {
    name: string;
    full_name: string;
  };
  sender: {
    login: string;
    avatar_url: string;
  };
}

export type WebhookEventType =
  | 'issues'
  | 'issue_comment'
  | 'pull_request'
  | 'pull_request_review'
  | 'pull_request_review_comment'
  | 'push'
  | 'create'
  | 'delete';

export interface WebhookHandler {
  eventType: WebhookEventType;
  handler: (event: GitHubWebhookEvent) => Promise<void>;
}

class GitHubWebhookHandler {
  private handlers: Map<WebhookEventType, WebhookHandler['handler'][]> = new Map();
  private webhookUrl: string = '';
  private webhookSecret: string = '';
  private eventQueue: { type: WebhookEventType; event: GitHubWebhookEvent }[] = [];
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
    // Issues 事件
    this.on('issues', async (event) => {
      const { action, issue } = event;

      switch (action) {
        case 'opened':
          console.log('GitHub issue opened:', issue.number);
          window.dispatchEvent(new CustomEvent('github:issue-opened', {
            detail: { issue }
          }));
          break;

        case 'edited':
          console.log('GitHub issue edited:', issue.number);
          window.dispatchEvent(new CustomEvent('github:issue-edited', {
            detail: { issue }
          }));
          break;

        case 'closed':
          console.log('GitHub issue closed:', issue.number);
          window.dispatchEvent(new CustomEvent('github:issue-closed', {
            detail: { issue }
          }));
          break;

        case 'reopened':
          console.log('GitHub issue reopened:', issue.number);
          window.dispatchEvent(new CustomEvent('github:issue-reopened', {
            detail: { issue }
          }));
          break;

        case 'assigned':
          console.log('GitHub issue assigned:', issue.number);
          window.dispatchEvent(new CustomEvent('github:issue-assigned', {
            detail: { issue }
          }));
          break;

        case 'labeled':
          console.log('GitHub issue labeled:', issue.number);
          window.dispatchEvent(new CustomEvent('github:issue-labeled', {
            detail: { issue }
          }));
          break;
      }
    });

    // Pull Request 事件
    this.on('pull_request', async (event) => {
      const { action, pull_request } = event;

      switch (action) {
        case 'opened':
          console.log('GitHub PR opened:', pull_request.number);
          window.dispatchEvent(new CustomEvent('github:pr-opened', {
            detail: { pullRequest: pull_request }
          }));
          break;

        case 'edited':
          console.log('GitHub PR edited:', pull_request.number);
          window.dispatchEvent(new CustomEvent('github:pr-edited', {
            detail: { pullRequest: pull_request }
          }));
          break;

        case 'closed':
          if (pull_request.merged) {
            console.log('GitHub PR merged:', pull_request.number);
            window.dispatchEvent(new CustomEvent('github:pr-merged', {
              detail: { pullRequest: pull_request }
            }));

            // 自动关闭关联的任务
            this.handlePRMerged(pull_request);
          } else {
            console.log('GitHub PR closed:', pull_request.number);
            window.dispatchEvent(new CustomEvent('github:pr-closed', {
              detail: { pullRequest: pull_request }
            }));
          }
          break;

        case 'reopened':
          console.log('GitHub PR reopened:', pull_request.number);
          window.dispatchEvent(new CustomEvent('github:pr-reopened', {
            detail: { pullRequest: pull_request }
          }));
          break;

        case 'review_requested':
          console.log('GitHub PR review requested:', pull_request.number);
          window.dispatchEvent(new CustomEvent('github:pr-review-requested', {
            detail: { pullRequest: pull_request }
          }));
          break;

        case 'ready_for_review':
          console.log('GitHub PR ready for review:', pull_request.number);
          window.dispatchEvent(new CustomEvent('github:pr-ready', {
            detail: { pullRequest: pull_request }
          }));
          break;
      }
    });

    // PR Review 事件
    this.on('pull_request_review', async (event) => {
      const { action, pull_request, review } = event;

      switch (action) {
        case 'submitted':
          console.log('GitHub PR review submitted:', pull_request.number);
          window.dispatchEvent(new CustomEvent('github:pr-review-submitted', {
            detail: {
              pullRequest: pull_request,
              review
            }
          }));
          break;

        case 'dismissed':
          console.log('GitHub PR review dismissed:', pull_request.number);
          window.dispatchEvent(new CustomEvent('github:pr-review-dismissed', {
            detail: {
              pullRequest: pull_request,
              review
            }
          }));
          break;
      }
    });

    // Comment 事件
    this.on('issue_comment', async (event) => {
      const { action, issue, comment } = event;

      switch (action) {
        case 'created':
          console.log('GitHub comment created:', issue.number);
          window.dispatchEvent(new CustomEvent('github:comment-created', {
            detail: {
              issue,
              comment
            }
          }));
          break;

        case 'edited':
          console.log('GitHub comment edited:', issue.number);
          window.dispatchEvent(new CustomEvent('github:comment-edited', {
            detail: {
              issue,
              comment
            }
          }));
          break;

        case 'deleted':
          console.log('GitHub comment deleted:', issue.number);
          window.dispatchEvent(new CustomEvent('github:comment-deleted', {
            detail: {
              issue,
              comment
            }
          }));
          break;
      }
    });

    // Push 事件
    this.on('push', async (event) => {
      console.log('GitHub push event');
      window.dispatchEvent(new CustomEvent('github:push', {
        detail: { event }
      }));
    });

    // Branch 创建事件
    this.on('create', async (event) => {
      console.log('GitHub branch/tag created');
      window.dispatchEvent(new CustomEvent('github:ref-created', {
        detail: { event }
      }));
    });

    // Branch 删除事件
    this.on('delete', async (event) => {
      console.log('GitHub branch/tag deleted');
      window.dispatchEvent(new CustomEvent('github:ref-deleted', {
        detail: { event }
      }));
    });
  }

  /**
   * 处理 PR 合并
   */
  private async handlePRMerged(pullRequest: any): Promise<void> {
    try {
      // 查找关联的任务
      const mappings = githubSyncService.getAllMappings();
      const mapping = mappings.find(m => m.prNumber === pullRequest.number);

      if (mapping) {
        // 触发任务关闭事件
        window.dispatchEvent(new CustomEvent('github:task-complete', {
          detail: {
            taskId: mapping.taskId,
            prNumber: pullRequest.number,
            mergedAt: pullRequest.merged_at
          }
        }));
      }
    } catch (error) {
      console.error('Error handling PR merge:', error);
    }
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
   * 处理 Webhook 事件
   */
  async handleWebhook(
    eventType: WebhookEventType,
    event: GitHubWebhookEvent,
    signature?: string
  ): Promise<void> {
    // 验证签名（如果配置了密钥）
    if (this.webhookSecret && signature) {
      const isValid = await this.verifySignature(JSON.stringify(event), signature);
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }
    }

    // 添加到队列
    this.eventQueue.push({ type: eventType, event });

    // 开始处理
    if (!this.processing) {
      await this.processQueue();
    }
  }

  /**
   * 验证 Webhook 签名
   */
  private async verifySignature(payload: string, signature: string): Promise<boolean> {
    try {
      // GitHub 使用 HMAC SHA-256
      const encoder = new TextEncoder();
      const keyData = encoder.encode(this.webhookSecret);
      const messageData = encoder.encode(payload);

      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);
      const signatureArray = Array.from(new Uint8Array(signatureBuffer));
      const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const expectedSignature = `sha256=${signatureHex}`;

      return signature === expectedSignature;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
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
      const { type, event } = this.eventQueue.shift()!;

      try {
        await this.processEvent(type, event);
      } catch (error) {
        console.error('Error processing webhook event:', error);
        this.logError(type, event, error);
      }
    }

    this.processing = false;
  }

  /**
   * 处理单个事件
   */
  private async processEvent(eventType: WebhookEventType, event: GitHubWebhookEvent): Promise<void> {
    const handlers = this.handlers.get(eventType);

    if (!handlers || handlers.length === 0) {
      console.warn(`No handlers registered for event type: ${eventType}`);
      return;
    }

    await Promise.all(
      handlers.map(handler => handler(event).catch(error => {
        console.error(`Handler error for ${eventType}:`, error);
      }))
    );
  }

  /**
   * 记录错误
   */
  private logError(eventType: string, event: GitHubWebhookEvent, error: any): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      eventType,
      action: event.action,
      issueNumber: event.issue?.number || event.pull_request?.number,
      error: error instanceof Error ? error.message : String(error)
    };

    try {
      const logs = this.getErrorLogs();
      logs.push(errorLog);

      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }

      localStorage.setItem('github_webhook_errors', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save error log:', e);
    }
  }

  /**
   * 获取错误日志
   */
  getErrorLogs(): any[] {
    try {
      const stored = localStorage.getItem('github_webhook_errors');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * 清除错误日志
   */
  clearErrorLogs(): void {
    localStorage.removeItem('github_webhook_errors');
  }

  /**
   * 获取 Webhook URL
   */
  getWebhookUrl(): string {
    return this.webhookUrl;
  }

  /**
   * 测试 Webhook
   */
  async testWebhook(): Promise<boolean> {
    try {
      const testEvent: GitHubWebhookEvent = {
        action: 'test',
        repository: {
          name: 'test',
          full_name: 'test/test'
        },
        sender: {
          login: 'test',
          avatar_url: ''
        }
      };

      await this.handleWebhook('issues', testEvent);
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
   * 获取 Webhook 配置（用于在 GitHub 中设置）
   */
  getWebhookConfig(): {
    url: string;
    content_type: string;
    secret?: string;
    events: string[];
  } {
    return {
      url: this.webhookUrl,
      content_type: 'application/json',
      secret: this.webhookSecret || undefined,
      events: [
        'issues',
        'issue_comment',
        'pull_request',
        'pull_request_review',
        'pull_request_review_comment',
        'push',
        'create',
        'delete'
      ]
    };
  }

  /**
   * 模拟 Webhook 事件（用于测试）
   */
  simulateEvent(eventType: WebhookEventType, action: string, number: number = 1): void {
    const event: GitHubWebhookEvent = {
      action,
      repository: {
        name: 'test-repo',
        full_name: 'test/test-repo'
      },
      sender: {
        login: 'test-user',
        avatar_url: 'https://github.com/test-user.png'
      }
    };

    if (eventType === 'issues' || eventType === 'issue_comment') {
      event.issue = {
        number,
        title: 'Test Issue',
        state: 'open'
      };
    }

    if (eventType === 'pull_request') {
      event.pull_request = {
        number,
        title: 'Test PR',
        state: 'open',
        merged: false
      };
    }

    this.handleWebhook(eventType, event).catch(console.error);
  }
}

export const githubWebhookHandler = new GitHubWebhookHandler();
