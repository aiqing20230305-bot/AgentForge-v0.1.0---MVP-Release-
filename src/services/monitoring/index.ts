/**
 * 监控系统主入口
 * 统一导出所有监控服务和类型
 */

// 服务导出
export { metricsCollector } from './metricsCollector';
export { alertManager } from './alertManager';
export { logAggregator } from './logAggregator';
export { tracingService } from './tracing';
export { healthCheckService } from './healthCheck';

// 类型导出
export * from './types';

// 监控管理器
import { metricsCollector } from './metricsCollector';
import { alertManager } from './alertManager';
import { logAggregator } from './logAggregator';
import { tracingService } from './tracing';
import { healthCheckService } from './healthCheck';
import {
  MonitoringConfig,
  PerformanceSnapshot,
  MonitoringReport,
  AlertLevel,
  NotificationChannel
} from './types';

class MonitoringManager {
  private config: MonitoringConfig;
  private isRunning: boolean = false;
  private snapshotInterval: number = 60000; // 1分钟
  private snapshotTimer?: NodeJS.Timeout;
  private snapshots: PerformanceSnapshot[] = [];
  private maxSnapshots: number = 1440; // 保留24小时（每分钟一个）

  constructor() {
    this.config = this.getDefaultConfig();
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): MonitoringConfig {
    return {
      enabled: true,
      collectInterval: 5000,
      retentionDays: 7,
      sampling: {
        enabled: true,
        rate: 1.0
      },
      alerts: {
        enabled: true,
        checkInterval: 10000
      },
      logging: {
        enabled: true,
        level: 'info' as any,
        maxSize: 100 * 1024 * 1024 // 100MB
      },
      tracing: {
        enabled: true,
        samplingRate: 1.0
      }
    };
  }

  /**
   * 初始化监控系统
   */
  async initialize(config?: Partial<MonitoringConfig>): Promise<void> {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    console.log('[Monitoring] Initializing monitoring system...');

    // 配置各个服务
    if (this.config.tracing.enabled) {
      tracingService.setSamplingRate(this.config.tracing.samplingRate);
    }

    // 设置默认告警规则
    this.setupDefaultAlerts();

    console.log('[Monitoring] Monitoring system initialized');
  }

  /**
   * 设置默认告警规则
   */
  private setupDefaultAlerts(): void {
    // CPU使用率告警
    alertManager.createRule(
      'High CPU Usage',
      'system.cpu.usage',
      {
        type: 'threshold',
        operator: '>',
        threshold: 80,
        duration: 60
      },
      AlertLevel.WARNING,
      [NotificationChannel.DESKTOP]
    );

    // 内存使用率告警
    alertManager.createRule(
      'High Memory Usage',
      'system.memory.usage',
      {
        type: 'threshold',
        operator: '>',
        threshold: 85,
        duration: 60
      },
      AlertLevel.WARNING,
      [NotificationChannel.DESKTOP]
    );

    // 错误率告警
    alertManager.createRule(
      'High Error Rate',
      'app.errors.rate',
      {
        type: 'threshold',
        operator: '>',
        threshold: 5,
        duration: 30
      },
      AlertLevel.ERROR,
      [NotificationChannel.DESKTOP]
    );

    // 响应时间告警
    alertManager.createRule(
      'Slow Response Time',
      'app.response.time',
      {
        type: 'threshold',
        operator: '>',
        threshold: 2000,
        duration: 60
      },
      AlertLevel.WARNING,
      [NotificationChannel.DESKTOP]
    );
  }

  /**
   * 启动监控
   */
  start(): void {
    if (this.isRunning) {
      console.log('[Monitoring] Already running');
      return;
    }

    console.log('[Monitoring] Starting monitoring system...');

    // 启动各个服务
    if (this.config.enabled) {
      metricsCollector.start();
    }

    if (this.config.alerts.enabled) {
      alertManager.start();
    }

    if (this.config.enabled) {
      healthCheckService.start();
    }

    // 启动性能快照
    this.startSnapshots();

    this.isRunning = true;
    console.log('[Monitoring] Monitoring system started');
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('[Monitoring] Stopping monitoring system...');

    metricsCollector.stop();
    alertManager.stop();
    healthCheckService.stop();
    this.stopSnapshots();

    this.isRunning = false;
    console.log('[Monitoring] Monitoring system stopped');
  }

  /**
   * 启动性能快照
   */
  private startSnapshots(): void {
    this.snapshotTimer = setInterval(() => {
      this.takeSnapshot();
    }, this.snapshotInterval);
  }

  /**
   * 停止性能快照
   */
  private stopSnapshots(): void {
    if (this.snapshotTimer) {
      clearInterval(this.snapshotTimer);
      this.snapshotTimer = undefined;
    }
  }

  /**
   * 拍摄性能快照
   */
  private async takeSnapshot(): Promise<void> {
    try {
      const [system, application, business, health] = await Promise.all([
        metricsCollector.collectSystemMetrics(),
        metricsCollector.collectApplicationMetrics(),
        metricsCollector.collectBusinessMetrics(),
        healthCheckService.performHealthCheck()
      ]);

      const snapshot: PerformanceSnapshot = {
        id: `snapshot_${Date.now()}`,
        timestamp: Date.now(),
        system,
        application,
        business,
        health
      };

      this.snapshots.push(snapshot);

      // 限制快照数量
      if (this.snapshots.length > this.maxSnapshots) {
        this.snapshots = this.snapshots.slice(-this.maxSnapshots);
      }
    } catch (err) {
      console.error('[Monitoring] Error taking snapshot:', err);
    }
  }

  /**
   * 获取性能快照
   */
  getSnapshots(
    startTime?: number,
    endTime?: number
  ): PerformanceSnapshot[] {
    if (!startTime && !endTime) {
      return this.snapshots;
    }

    return this.snapshots.filter(s => {
      if (startTime && s.timestamp < startTime) return false;
      if (endTime && s.timestamp > endTime) return false;
      return true;
    });
  }

  /**
   * 生成监控报告
   */
  async generateReport(
    name: string,
    startTime: number,
    endTime: number
  ): Promise<MonitoringReport> {
    const metrics = metricsCollector.getAllMetrics();
    const alerts = alertManager.getAllEvents().filter(
      e => e.triggeredAt >= startTime && e.triggeredAt <= endTime
    );

    const snapshots = this.getSnapshots(startTime, endTime);
    const avgHealthScore =
      snapshots.length > 0
        ? snapshots.reduce((sum, s) => sum + s.health.score, 0) / snapshots.length
        : 0;

    const recommendations = healthCheckService.getRecommendations();

    const report: MonitoringReport = {
      id: `report_${Date.now()}`,
      name,
      startTime,
      endTime,
      summary: {
        totalMetrics: metrics.length,
        alerts: alerts.length,
        incidents: alerts.filter(a => a.level === AlertLevel.CRITICAL || a.level === AlertLevel.ERROR).length,
        avgHealthScore
      },
      metrics,
      alerts,
      recommendations,
      generatedAt: Date.now()
    };

    return report;
  }

  /**
   * 获取当前状态
   */
  getStatus(): {
    isRunning: boolean;
    config: MonitoringConfig;
    stats: {
      metrics: number;
      alerts: number;
      logs: number;
      traces: number;
      snapshots: number;
    };
  } {
    return {
      isRunning: this.isRunning,
      config: this.config,
      stats: {
        metrics: metricsCollector.getAllMetrics().length,
        alerts: alertManager.getAllEvents().length,
        logs: logAggregator.getSize(),
        traces: tracingService.getAllTraces().length,
        snapshots: this.snapshots.length
      }
    };
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * 清理旧数据
   */
  cleanup(): void {
    const retentionMs = this.config.retentionDays * 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - retentionMs;

    metricsCollector.clearOldData(cutoffTime);
    alertManager.clearOldEvents(cutoffTime);
    logAggregator.clearOldLogs(cutoffTime);
    tracingService.clearOldData(cutoffTime);

    this.snapshots = this.snapshots.filter(s => s.timestamp >= cutoffTime);

    console.log(`[Monitoring] Cleaned up data older than ${this.config.retentionDays} days`);
  }

  /**
   * 重置所有数据
   */
  reset(): void {
    metricsCollector.reset();
    alertManager.reset();
    logAggregator.clear();
    tracingService.reset();
    healthCheckService.reset();
    this.snapshots = [];

    console.log('[Monitoring] All monitoring data reset');
  }

  /**
   * 导出数据
   */
  exportData(): any {
    return {
      metrics: metricsCollector.export(),
      alerts: {
        rules: alertManager.exportRules(),
        events: alertManager.getAllEvents()
      },
      logs: logAggregator.export('json'),
      traces: tracingService.export(),
      snapshots: this.snapshots,
      config: this.config
    };
  }

  /**
   * 导入数据
   */
  importData(data: any): void {
    if (data.metrics) {
      metricsCollector.import(data.metrics);
    }
    if (data.alerts?.rules) {
      alertManager.importRules(data.alerts.rules);
    }
    if (data.config) {
      this.config = data.config;
    }

    console.log('[Monitoring] Data imported');
  }
}

// 导出单例
export const monitoringManager = new MonitoringManager();
export default monitoringManager;
