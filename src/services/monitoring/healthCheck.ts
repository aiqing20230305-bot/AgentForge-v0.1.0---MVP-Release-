/**
 * 健康检查服务
 * 负责系统健康状态监测和评分
 */

import {
  HealthStatus,
  HealthCheck
} from './types';
import { metricsCollector } from './metricsCollector';

interface HealthCheckConfig {
  name: string;
  check: () => Promise<HealthCheck>;
  weight: number; // 权重（用于计算总分）
  critical: boolean; // 是否关键检查
}

class HealthCheckService {
  private checks: Map<string, HealthCheckConfig> = new Map();
  private lastStatus?: HealthStatus;
  private checkInterval: number = 30000; // 30秒
  private intervalId?: NodeJS.Timeout;
  private listeners: Set<(status: HealthStatus) => void> = new Set();

  constructor() {
    this.initializeDefaultChecks();
  }

  /**
   * 初始化默认检查
   */
  private initializeDefaultChecks(): void {
    // CPU健康检查
    this.registerCheck({
      name: 'cpu',
      check: async () => {
        const startTime = Date.now();
        const metrics = await metricsCollector.collectSystemMetrics();
        const cpuUsage = metrics.cpu.usage;

        let status: 'pass' | 'warn' | 'fail' = 'pass';
        let message = `CPU usage: ${cpuUsage.toFixed(2)}%`;

        if (cpuUsage > 90) {
          status = 'fail';
          message += ' (critical)';
        } else if (cpuUsage > 70) {
          status = 'warn';
          message += ' (high)';
        }

        return {
          name: 'cpu',
          status,
          message,
          timestamp: Date.now(),
          duration: Date.now() - startTime
        };
      },
      weight: 2,
      critical: true
    });

    // 内存健康检查
    this.registerCheck({
      name: 'memory',
      check: async () => {
        const startTime = Date.now();
        const metrics = await metricsCollector.collectSystemMetrics();
        const memoryUsage = metrics.memory.usage;

        let status: 'pass' | 'warn' | 'fail' = 'pass';
        let message = `Memory usage: ${memoryUsage.toFixed(2)}%`;

        if (memoryUsage > 90) {
          status = 'fail';
          message += ' (critical)';
        } else if (memoryUsage > 75) {
          status = 'warn';
          message += ' (high)';
        }

        return {
          name: 'memory',
          status,
          message,
          timestamp: Date.now(),
          duration: Date.now() - startTime
        };
      },
      weight: 2,
      critical: true
    });

    // 响应时间健康检查
    this.registerCheck({
      name: 'response_time',
      check: async () => {
        const startTime = Date.now();
        const metrics = await metricsCollector.collectApplicationMetrics();
        const avgTime = metrics.response.avgTime;

        let status: 'pass' | 'warn' | 'fail' = 'pass';
        let message = `Avg response time: ${avgTime.toFixed(2)}ms`;

        if (avgTime > 2000) {
          status = 'fail';
          message += ' (too slow)';
        } else if (avgTime > 1000) {
          status = 'warn';
          message += ' (slow)';
        }

        return {
          name: 'response_time',
          status,
          message,
          timestamp: Date.now(),
          duration: Date.now() - startTime
        };
      },
      weight: 1.5,
      critical: false
    });

    // 错误率健康检查
    this.registerCheck({
      name: 'error_rate',
      check: async () => {
        const startTime = Date.now();
        const metrics = await metricsCollector.collectApplicationMetrics();
        const errorRate = metrics.errors.rate;

        let status: 'pass' | 'warn' | 'fail' = 'pass';
        let message = `Error rate: ${errorRate.toFixed(2)}%`;

        if (errorRate > 10) {
          status = 'fail';
          message += ' (critical)';
        } else if (errorRate > 5) {
          status = 'warn';
          message += ' (high)';
        }

        return {
          name: 'error_rate',
          status,
          message,
          timestamp: Date.now(),
          duration: Date.now() - startTime
        };
      },
      weight: 2,
      critical: true
    });

    // 磁盘健康检查
    this.registerCheck({
      name: 'disk',
      check: async () => {
        const startTime = Date.now();
        const metrics = await metricsCollector.collectSystemMetrics();
        const diskUsage = metrics.disk.usage;

        let status: 'pass' | 'warn' | 'fail' = 'pass';
        let message = `Disk usage: ${diskUsage.toFixed(2)}%`;

        if (diskUsage > 95) {
          status = 'fail';
          message += ' (critical)';
        } else if (diskUsage > 80) {
          status = 'warn';
          message += ' (high)';
        }

        return {
          name: 'disk',
          status,
          message,
          timestamp: Date.now(),
          duration: Date.now() - startTime
        };
      },
      weight: 1,
      critical: false
    });
  }

  /**
   * 注册健康检查
   */
  registerCheck(config: HealthCheckConfig): void {
    this.checks.set(config.name, config);
    console.log(`[HealthCheck] Registered check: ${config.name}`);
  }

  /**
   * 注销健康检查
   */
  unregisterCheck(name: string): boolean {
    return this.checks.delete(name);
  }

  /**
   * 执行所有健康检查
   */
  async performHealthCheck(): Promise<HealthStatus> {
    const checks: HealthCheck[] = [];
    const promises: Promise<void>[] = [];

    for (const config of this.checks.values()) {
      promises.push(
        config
          .check()
          .then(result => {
            checks.push(result);
          })
          .catch(err => {
            checks.push({
              name: config.name,
              status: 'fail',
              message: `Check failed: ${err.message}`,
              timestamp: Date.now()
            });
          })
      );
    }

    await Promise.all(promises);

    // 计算健康分数
    const score = this.calculateHealthScore(checks);

    // 确定整体状态
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    const hasCriticalFailure = checks.some(
      c =>
        c.status === 'fail' &&
        this.checks.get(c.name)?.critical
    );

    if (hasCriticalFailure || score < 50) {
      overallStatus = 'unhealthy';
    } else if (score < 80) {
      overallStatus = 'degraded';
    }

    const status: HealthStatus = {
      status: overallStatus,
      score,
      checks,
      lastUpdate: Date.now()
    };

    this.lastStatus = status;
    this.notifyListeners(status);

    return status;
  }

  /**
   * 计算健康分数
   */
  private calculateHealthScore(checks: HealthCheck[]): number {
    let totalWeight = 0;
    let weightedScore = 0;

    checks.forEach(check => {
      const config = this.checks.get(check.name);
      if (!config) return;

      const weight = config.weight;
      totalWeight += weight;

      let score = 0;
      switch (check.status) {
        case 'pass':
          score = 100;
          break;
        case 'warn':
          score = 50;
          break;
        case 'fail':
          score = 0;
          break;
      }

      weightedScore += score * weight;
    });

    return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  }

  /**
   * 获取最新状态
   */
  getLastStatus(): HealthStatus | undefined {
    return this.lastStatus;
  }

  /**
   * 开始定期检查
   */
  start(): void {
    if (this.intervalId) {
      return;
    }

    // 立即执行一次
    this.performHealthCheck();

    this.intervalId = setInterval(() => {
      this.performHealthCheck();
    }, this.checkInterval);

    console.log('[HealthCheck] Started periodic health checks');
  }

  /**
   * 停止定期检查
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      console.log('[HealthCheck] Stopped periodic health checks');
    }
  }

  /**
   * 设置检查间隔
   */
  setCheckInterval(interval: number): void {
    this.checkInterval = interval;
    if (this.intervalId) {
      this.stop();
      this.start();
    }
  }

  /**
   * 订阅健康状态更新
   */
  subscribe(listener: (status: HealthStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 通知监听器
   */
  private notifyListeners(status: HealthStatus): void {
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (err) {
        console.error('[HealthCheck] Error notifying listener:', err);
      }
    });
  }

  /**
   * 生成健康报告
   */
  generateReport(): string {
    if (!this.lastStatus) {
      return 'No health check data available';
    }

    const { status, score, checks, lastUpdate } = this.lastStatus;

    let report = `Health Status Report\n`;
    report += `====================\n\n`;
    report += `Overall Status: ${status.toUpperCase()}\n`;
    report += `Health Score: ${score}/100\n`;
    report += `Last Update: ${new Date(lastUpdate).toISOString()}\n\n`;
    report += `Checks:\n`;
    report += `-------\n`;

    checks.forEach(check => {
      const icon =
        check.status === 'pass'
          ? '✓'
          : check.status === 'warn'
          ? '⚠'
          : '✗';
      report += `${icon} ${check.name}: ${check.message}\n`;
    });

    return report;
  }

  /**
   * 获取健康建议
   */
  getRecommendations(): string[] {
    if (!this.lastStatus) {
      return [];
    }

    const recommendations: string[] = [];

    this.lastStatus.checks.forEach(check => {
      if (check.status === 'fail' || check.status === 'warn') {
        switch (check.name) {
          case 'cpu':
            recommendations.push(
              'High CPU usage detected. Consider optimizing performance or scaling resources.'
            );
            break;
          case 'memory':
            recommendations.push(
              'High memory usage detected. Check for memory leaks or increase available memory.'
            );
            break;
          case 'disk':
            recommendations.push(
              'Disk space running low. Clean up old files or add more storage.'
            );
            break;
          case 'error_rate':
            recommendations.push(
              'High error rate detected. Review application logs and fix underlying issues.'
            );
            break;
          case 'response_time':
            recommendations.push(
              'Slow response times detected. Optimize queries, add caching, or scale resources.'
            );
            break;
        }
      }
    });

    return recommendations;
  }

  /**
   * 重置
   */
  reset(): void {
    this.lastStatus = undefined;
  }
}

// 导出单例
export const healthCheckService = new HealthCheckService();
export default healthCheckService;
