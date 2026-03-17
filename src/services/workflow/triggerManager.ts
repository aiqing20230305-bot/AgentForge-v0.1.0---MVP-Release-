/**
 * 触发器管理器 - 管理各类型触发器
 * Trigger Manager - Manages different types of triggers
 */

import {
  TriggerConfig,
  TriggerType,
  ScheduledTrigger,
  WebhookTrigger,
  EventTrigger,
  WorkflowDefinition,
} from './types';
import { executionEngine } from './executionEngine';

/**
 * Cron 解析器 (简化版)
 */
class CronParser {
  /**
   * 计算下次执行时间
   */
  getNextExecution(cronExpression: string, fromDate: Date = new Date()): Date {
    // 简化实现，实际应该使用 node-cron 等库
    const parts = cronExpression.split(' ');
    if (parts.length !== 5) {
      throw new Error('Invalid cron expression');
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    const next = new Date(fromDate);

    // 简单递增到下一个匹配时间
    while (true) {
      next.setMinutes(next.getMinutes() + 1);

      if (this.matches(next, minute, hour, dayOfMonth, month, dayOfWeek)) {
        return next;
      }

      // 防止无限循环
      if (next.getTime() - fromDate.getTime() > 365 * 24 * 60 * 60 * 1000) {
        throw new Error('Cannot find next execution time within a year');
      }
    }
  }

  private matches(
    date: Date,
    minute: string,
    hour: string,
    dayOfMonth: string,
    month: string,
    dayOfWeek: string
  ): boolean {
    if (minute !== '*' && date.getMinutes() !== parseInt(minute)) return false;
    if (hour !== '*' && date.getHours() !== parseInt(hour)) return false;
    if (dayOfMonth !== '*' && date.getDate() !== parseInt(dayOfMonth)) return false;
    if (month !== '*' && date.getMonth() + 1 !== parseInt(month)) return false;
    if (dayOfWeek !== '*' && date.getDay() !== parseInt(dayOfWeek)) return false;
    return true;
  }
}

/**
 * 触发器管理器
 */
export class TriggerManager {
  private scheduledJobs = new Map<string, NodeJS.Timeout>();
  private webhooks = new Map<string, WebhookTrigger>();
  private eventListeners = new Map<string, EventTrigger>();
  private cronParser = new CronParser();

  /**
   * 注册工作流的所有触发器
   */
  registerWorkflowTriggers(workflow: WorkflowDefinition): void {
    for (const trigger of workflow.triggers) {
      if (!trigger.enabled) continue;

      switch (trigger.type) {
        case TriggerType.SCHEDULED:
          this.registerScheduledTrigger(workflow, trigger as ScheduledTrigger);
          break;

        case TriggerType.WEBHOOK:
          this.registerWebhookTrigger(workflow, trigger as WebhookTrigger);
          break;

        case TriggerType.EVENT:
          this.registerEventTrigger(workflow, trigger as EventTrigger);
          break;

        case TriggerType.FILE_WATCH:
          this.registerFileWatchTrigger(workflow, trigger);
          break;
      }
    }
  }

  /**
   * 注销工作流的所有触发器
   */
  unregisterWorkflowTriggers(workflowId: string): void {
    // 清理定时任务
    const jobId = `scheduled_${workflowId}`;
    const timeout = this.scheduledJobs.get(jobId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledJobs.delete(jobId);
    }

    // 清理 webhook
    this.webhooks.delete(workflowId);

    // 清理事件监听
    this.eventListeners.delete(workflowId);
  }

  /**
   * 注册定时触发器
   */
  private registerScheduledTrigger(
    workflow: WorkflowDefinition,
    trigger: ScheduledTrigger
  ): void {
    const { cron, timezone, startDate, endDate } = trigger.config;

    const schedule = () => {
      const now = new Date();

      // 检查时间范围
      if (startDate && now < startDate) {
        console.log(`[Trigger] Workflow ${workflow.id} not yet started`);
        return;
      }

      if (endDate && now > endDate) {
        console.log(`[Trigger] Workflow ${workflow.id} has ended`);
        this.unregisterWorkflowTriggers(workflow.id);
        return;
      }

      // 执行工作流
      console.log(`[Trigger] Executing scheduled workflow: ${workflow.name}`);
      executionEngine.execute(workflow, {}, 'scheduled').catch((error) => {
        console.error(`[Trigger] Scheduled workflow execution failed:`, error);
      });

      // 计算并设置下次执行
      try {
        const nextExecution = this.cronParser.getNextExecution(cron, now);
        const delay = nextExecution.getTime() - now.getTime();

        const jobId = `scheduled_${workflow.id}`;
        const timeout = setTimeout(schedule, delay);
        this.scheduledJobs.set(jobId, timeout);

        console.log(
          `[Trigger] Next execution for ${workflow.name}: ${nextExecution.toISOString()}`
        );
      } catch (error) {
        console.error(`[Trigger] Failed to schedule next execution:`, error);
      }
    };

    // 计算首次执行时间
    try {
      const nextExecution = this.cronParser.getNextExecution(cron);
      const delay = nextExecution.getTime() - Date.now();

      const jobId = `scheduled_${workflow.id}`;
      const timeout = setTimeout(schedule, delay);
      this.scheduledJobs.set(jobId, timeout);

      console.log(
        `[Trigger] Scheduled workflow ${workflow.name} for ${nextExecution.toISOString()}`
      );
    } catch (error) {
      console.error(`[Trigger] Failed to schedule workflow:`, error);
    }
  }

  /**
   * 注册 Webhook 触发器
   */
  private registerWebhookTrigger(workflow: WorkflowDefinition, trigger: WebhookTrigger): void {
    this.webhooks.set(workflow.id, trigger);
    console.log(`[Trigger] Registered webhook for ${workflow.name} at ${trigger.config.path}`);
  }

  /**
   * 处理 Webhook 请求
   */
  async handleWebhook(
    path: string,
    method: string,
    headers: Record<string, string>,
    body: any
  ): Promise<any> {
    // 查找匹配的 webhook
    for (const [workflowId, trigger] of this.webhooks.entries()) {
      if (trigger.config.path === path && trigger.config.method === method) {
        // 验证认证
        if (trigger.config.authentication) {
          const isValid = this.validateWebhookAuth(
            trigger.config.authentication,
            headers,
            body
          );
          if (!isValid) {
            throw new Error('Webhook authentication failed');
          }
        }

        // 获取工作流定义
        // 这里需要从存储中获取，简化处理
        console.log(`[Trigger] Webhook triggered workflow: ${workflowId}`);

        // 执行工作流
        return await executionEngine.execute(
          {} as any, // 需要从存储获取完整定义
          body,
          'webhook'
        );
      }
    }

    throw new Error('No matching webhook found');
  }

  /**
   * 验证 Webhook 认证
   */
  private validateWebhookAuth(
    auth: { type: string; secret?: string },
    headers: Record<string, string>,
    body: any
  ): boolean {
    switch (auth.type) {
      case 'none':
        return true;

      case 'token':
        const token = headers['authorization']?.replace('Bearer ', '');
        return token === auth.secret;

      case 'hmac':
        // 简化的 HMAC 验证
        const signature = headers['x-signature'];
        // 实际应该使用 crypto.createHmac 验证
        return signature !== undefined;

      default:
        return false;
    }
  }

  /**
   * 注册事件触发器
   */
  private registerEventTrigger(workflow: WorkflowDefinition, trigger: EventTrigger): void {
    this.eventListeners.set(workflow.id, trigger);
    console.log(
      `[Trigger] Registered event listener for ${workflow.name}: ${trigger.config.eventType}`
    );
  }

  /**
   * 触发事件
   */
  async triggerEvent(
    eventType: string,
    source: string,
    data: any
  ): Promise<void> {
    // 查找匹配的事件监听器
    for (const [workflowId, trigger] of this.eventListeners.entries()) {
      if (trigger.config.eventType === eventType) {
        // 检查来源过滤
        if (trigger.config.source && trigger.config.source !== source) {
          continue;
        }

        // 检查过滤条件
        if (trigger.config.filter && trigger.config.filter.length > 0) {
          // 这里需要使用 expressionEngine 评估条件
          // 简化处理
        }

        console.log(`[Trigger] Event triggered workflow: ${workflowId}`);

        // 执行工作流
        await executionEngine.execute(
          {} as any, // 需要从存储获取完整定义
          { event: { type: eventType, source, data } },
          'event'
        );
      }
    }
  }

  /**
   * 注册文件监控触发器
   */
  private registerFileWatchTrigger(workflow: WorkflowDefinition, trigger: TriggerConfig): void {
    // 文件监控实现 (需要使用 chokidar 等库)
    console.log(`[Trigger] File watch trigger registered for ${workflow.name}`);
  }

  /**
   * 手动触发工作流
   */
  async triggerManually(workflow: WorkflowDefinition, input: any = {}): Promise<any> {
    console.log(`[Trigger] Manually triggered workflow: ${workflow.name}`);
    return await executionEngine.execute(workflow, input, 'manual');
  }

  /**
   * 获取所有活跃的触发器
   */
  getActiveTriggers(): {
    scheduled: number;
    webhooks: number;
    events: number;
  } {
    return {
      scheduled: this.scheduledJobs.size,
      webhooks: this.webhooks.size,
      events: this.eventListeners.size,
    };
  }

  /**
   * 清理所有触发器
   */
  cleanup(): void {
    // 清理所有定时任务
    for (const timeout of this.scheduledJobs.values()) {
      clearTimeout(timeout);
    }
    this.scheduledJobs.clear();

    // 清理其他触发器
    this.webhooks.clear();
    this.eventListeners.clear();

    console.log('[Trigger] All triggers cleaned up');
  }
}

// 导出单例
export const triggerManager = new TriggerManager();
