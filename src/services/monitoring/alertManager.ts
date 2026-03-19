/**
 * 告警管理器
 * 负责告警规则管理、告警检测和通知发送
 */

import {
  AlertRule,
  AlertEvent,
  AlertLevel,
  AlertStatus,
  AlertCondition,
  NotificationChannel,
  Metric,
  AlertNotification
} from './types';
import { metricsCollector } from './metricsCollector';

interface AlertHistory {
  ruleId: string;
  lastTriggered: number;
  triggerCount: number;
}

class AlertManager {
  private rules: Map<string, AlertRule> = new Map();
  private events: Map<string, AlertEvent> = new Map();
  private history: Map<string, AlertHistory> = new Map();
  private checkInterval: number = 10000; // 10秒
  private intervalId?: NodeJS.Timeout;
  private listeners: Set<(event: AlertEvent) => void> = new Set();
  private notificationHandlers: Map<
    NotificationChannel,
    (event: AlertEvent) => Promise<void>
  > = new Map();

  constructor() {
    this.initializeDefaultHandlers();
  }

  /**
   * 初始化默认通知处理器
   */
  private initializeDefaultHandlers(): void {
    // 桌面通知
    this.registerNotificationHandler(
      NotificationChannel.DESKTOP,
      async (event: AlertEvent) => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Alert: ${event.ruleName}`, {
            body: event.message,
            icon: this.getIconForLevel(event.level),
            tag: event.id
          });
        }
      }
    );

    // Email通知（需要后端支持）
    this.registerNotificationHandler(
      NotificationChannel.EMAIL,
      async (event: AlertEvent) => {
        // 实际实现应调用后端API
        console.log(`[Alert] Email notification for: ${event.ruleName}`);
      }
    );

    // Webhook通知
    this.registerNotificationHandler(
      NotificationChannel.WEBHOOK,
      async (event: AlertEvent) => {
        // 实际实现应调用配置的webhook URL
        console.log(`[Alert] Webhook notification for: ${event.ruleName}`);
      }
    );
  }

  /**
   * 创建告警规则
   */
  createRule(
    name: string,
    metric: string,
    condition: AlertCondition,
    level: AlertLevel,
    channels: NotificationChannel[],
    options: {
      description?: string;
      cooldown?: number;
      tags?: Record<string, string>;
    } = {}
  ): AlertRule {
    const rule: AlertRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: options.description,
      enabled: true,
      metric,
      condition,
      level,
      channels,
      cooldown: options.cooldown || 300, // 默认5分钟
      tags: options.tags,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.rules.set(rule.id, rule);
    console.log(`[AlertManager] Created rule: ${name} (${rule.id})`);
    return rule;
  }

  /**
   * 更新告警规则
   */
  updateRule(id: string, updates: Partial<AlertRule>): boolean {
    const rule = this.rules.get(id);
    if (!rule) {
      return false;
    }

    Object.assign(rule, updates, {
      id: rule.id,
      createdAt: rule.createdAt,
      updatedAt: Date.now()
    });

    this.rules.set(id, rule);
    console.log(`[AlertManager] Updated rule: ${id}`);
    return true;
  }

  /**
   * 删除告警规则
   */
  deleteRule(id: string): boolean {
    const deleted = this.rules.delete(id);
    if (deleted) {
      console.log(`[AlertManager] Deleted rule: ${id}`);
    }
    return deleted;
  }

  /**
   * 启用/禁用规则
   */
  toggleRule(id: string, enabled: boolean): boolean {
    return this.updateRule(id, { enabled });
  }

  /**
   * 获取告警规则
   */
  getRule(id: string): AlertRule | undefined {
    return this.rules.get(id);
  }

  /**
   * 获取所有规则
   */
  getAllRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * 获取激活的规则
   */
  getActiveRules(): AlertRule[] {
    return this.getAllRules().filter(r => r.enabled);
  }

  /**
   * 开始监控
   */
  start(): void {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
      this.checkAlerts();
    }, this.checkInterval);

    console.log('[AlertManager] Started alert monitoring');
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      console.log('[AlertManager] Stopped alert monitoring');
    }
  }

  /**
   * 检查告警
   */
  private async checkAlerts(): Promise<void> {
    const activeRules = this.getActiveRules();

    for (const rule of activeRules) {
      try {
        // 检查冷却时间
        if (this.isInCooldown(rule)) {
          continue;
        }

        // 获取指标
        const metric = metricsCollector.getMetric(rule.metric);
        if (!metric) {
          continue;
        }

        // 评估条件
        const shouldTrigger = this.evaluateCondition(metric, rule.condition);

        if (shouldTrigger) {
          await this.triggerAlert(rule, metric);
        }
      } catch (err) {
        console.error(`[AlertManager] Error checking rule ${rule.id}:`, err);
      }
    }
  }

  /**
   * 评估告警条件
   */
  private evaluateCondition(metric: Metric, condition: AlertCondition): boolean {
    const currentValue = metric.value;

    switch (condition.type) {
      case 'threshold':
        return this.evaluateThreshold(currentValue, condition);

      case 'trend':
        return this.evaluateTrend(metric, condition);

      case 'anomaly':
        return this.evaluateAnomaly(metric, condition);

      default:
        return false;
    }
  }

  /**
   * 评估阈值条件
   */
  private evaluateThreshold(
    value: number,
    condition: AlertCondition
  ): boolean {
    if (!condition.threshold || !condition.operator) {
      return false;
    }

    switch (condition.operator) {
      case '>':
        return value > condition.threshold;
      case '<':
        return value < condition.threshold;
      case '>=':
        return value >= condition.threshold;
      case '<=':
        return value <= condition.threshold;
      case '==':
        return value === condition.threshold;
      case '!=':
        return value !== condition.threshold;
      default:
        return false;
    }
  }

  /**
   * 评估趋势条件
   */
  private evaluateTrend(metric: Metric, condition: AlertCondition): boolean {
    const tsMetric = metricsCollector.getMetric(metric.name);
    if (!tsMetric || tsMetric.dataPoints.length < 2) {
      return false;
    }

    const recentPoints = tsMetric.dataPoints.slice(-10);
    const firstValue = recentPoints[0].value;
    const lastValue = recentPoints[recentPoints.length - 1].value;

    const change = ((lastValue - firstValue) / firstValue) * 100;
    const threshold = condition.percentage || 0;

    return Math.abs(change) >= threshold;
  }

  /**
   * 评估异常条件
   */
  private evaluateAnomaly(metric: Metric, condition: AlertCondition): boolean {
    const tsMetric = metricsCollector.getMetric(metric.name);
    if (!tsMetric || tsMetric.dataPoints.length < 10) {
      return false;
    }

    // 使用简单的标准差方法检测异常
    const values = tsMetric.dataPoints.slice(-20).map(dp => dp.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const currentValue = metric.value;
    const deviation = Math.abs(currentValue - mean) / stdDev;

    // 如果偏离超过3个标准差，认为是异常
    return deviation > 3;
  }

  /**
   * 触发告警
   */
  private async triggerAlert(rule: AlertRule, metric: Metric): Promise<void> {
    const event: AlertEvent = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      level: rule.level,
      status: AlertStatus.PENDING,
      message: this.generateAlertMessage(rule, metric),
      metric,
      triggeredAt: Date.now(),
      notifications: []
    };

    this.events.set(event.id, event);

    // 更新历史
    this.updateHistory(rule.id);

    // 发送通知
    await this.sendNotifications(event, rule.channels);

    // 通知监听器
    this.notifyListeners(event);

    console.log(`[AlertManager] Alert triggered: ${rule.name} (${event.id})`);
  }

  /**
   * 生成告警消息
   */
  private generateAlertMessage(rule: AlertRule, metric: Metric): string {
    const condition = rule.condition;
    let message = `${rule.name}: `;

    switch (condition.type) {
      case 'threshold':
        message += `${metric.name} is ${metric.value.toFixed(2)}${metric.unit || ''} (threshold: ${condition.operator} ${condition.threshold})`;
        break;

      case 'trend':
        message += `${metric.name} has changed by more than ${condition.percentage}%`;
        break;

      case 'anomaly':
        message += `${metric.name} shows anomalous behavior (current: ${metric.value.toFixed(2)}${metric.unit || ''})`;
        break;

      default:
        message += `${metric.name} = ${metric.value.toFixed(2)}${metric.unit || ''}`;
    }

    return message;
  }

  /**
   * 发送通知
   */
  private async sendNotifications(
    event: AlertEvent,
    channels: NotificationChannel[]
  ): Promise<void> {
    const promises = channels.map(async channel => {
      const notification: AlertNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channel,
        sentAt: Date.now(),
        status: 'pending'
      };

      try {
        const handler = this.notificationHandlers.get(channel);
        if (handler) {
          await handler(event);
          notification.status = 'sent';
        } else {
          notification.status = 'failed';
          notification.error = 'No handler registered';
        }
      } catch (err) {
        notification.status = 'failed';
        notification.error = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[AlertManager] Notification failed for ${channel}:`, err);
      }

      event.notifications.push(notification);
    });

    await Promise.all(promises);
  }

  /**
   * 注册通知处理器
   */
  registerNotificationHandler(
    channel: NotificationChannel,
    handler: (event: AlertEvent) => Promise<void>
  ): void {
    this.notificationHandlers.set(channel, handler);
  }

  /**
   * 确认告警
   */
  acknowledgeAlert(id: string, acknowledgedBy: string): boolean {
    const event = this.events.get(id);
    if (!event || event.status !== AlertStatus.PENDING) {
      return false;
    }

    event.status = AlertStatus.ACKNOWLEDGED;
    event.acknowledgedAt = Date.now();
    event.acknowledgedBy = acknowledgedBy;

    console.log(`[AlertManager] Alert acknowledged: ${id}`);
    return true;
  }

  /**
   * 解决告警
   */
  resolveAlert(id: string, resolvedBy: string): boolean {
    const event = this.events.get(id);
    if (!event || event.status === AlertStatus.RESOLVED) {
      return false;
    }

    event.status = AlertStatus.RESOLVED;
    event.resolvedAt = Date.now();
    event.resolvedBy = resolvedBy;

    console.log(`[AlertManager] Alert resolved: ${id}`);
    return true;
  }

  /**
   * 静默告警
   */
  silenceAlert(id: string): boolean {
    const event = this.events.get(id);
    if (!event) {
      return false;
    }

    event.status = AlertStatus.SILENCED;
    console.log(`[AlertManager] Alert silenced: ${id}`);
    return true;
  }

  /**
   * 获取告警事件
   */
  getEvent(id: string): AlertEvent | undefined {
    return this.events.get(id);
  }

  /**
   * 获取所有事件
   */
  getAllEvents(): AlertEvent[] {
    return Array.from(this.events.values());
  }

  /**
   * 按状态获取事件
   */
  getEventsByStatus(status: AlertStatus): AlertEvent[] {
    return this.getAllEvents().filter(e => e.status === status);
  }

  /**
   * 按级别获取事件
   */
  getEventsByLevel(level: AlertLevel): AlertEvent[] {
    return this.getAllEvents().filter(e => e.level === level);
  }

  /**
   * 检查是否在冷却期
   */
  private isInCooldown(rule: AlertRule): boolean {
    const history = this.history.get(rule.id);
    if (!history) {
      return false;
    }

    const cooldownMs = (rule.cooldown || 300) * 1000;
    return Date.now() - history.lastTriggered < cooldownMs;
  }

  /**
   * 更新历史
   */
  private updateHistory(ruleId: string): void {
    const history = this.history.get(ruleId) || {
      ruleId,
      lastTriggered: 0,
      triggerCount: 0
    };

    history.lastTriggered = Date.now();
    history.triggerCount++;

    this.history.set(ruleId, history);
  }

  /**
   * 订阅告警事件
   */
  subscribe(listener: (event: AlertEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 通知监听器
   */
  private notifyListeners(event: AlertEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (err) {
        console.error('[AlertManager] Error notifying listener:', err);
      }
    });
  }

  /**
   * 获取告警图标
   */
  private getIconForLevel(level: AlertLevel): string {
    switch (level) {
      case AlertLevel.INFO:
        return '📘';
      case AlertLevel.WARNING:
        return '⚠️';
      case AlertLevel.ERROR:
        return '❌';
      case AlertLevel.CRITICAL:
        return '🚨';
      default:
        return '📢';
    }
  }

  /**
   * 请求桌面通知权限
   */
  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  /**
   * 清除旧事件
   */
  clearOldEvents(beforeTimestamp: number): void {
    for (const [id, event] of this.events) {
      if (event.triggeredAt < beforeTimestamp) {
        this.events.delete(id);
      }
    }
  }

  /**
   * 导出规则
   */
  exportRules(): AlertRule[] {
    return this.getAllRules();
  }

  /**
   * 导入规则
   */
  importRules(rules: AlertRule[]): void {
    rules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
    console.log(`[AlertManager] Imported ${rules.length} rules`);
  }

  /**
   * 重置
   */
  reset(): void {
    this.rules.clear();
    this.events.clear();
    this.history.clear();
  }
}

// 导出单例
export const alertManager = new AlertManager();
export default alertManager;
