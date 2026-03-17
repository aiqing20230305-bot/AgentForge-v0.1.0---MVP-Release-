/**
 * 指标收集器
 * 负责收集系统、应用和业务指标
 */

import {
  Metric,
  MetricType,
  MetricCategory,
  SystemMetrics,
  ApplicationMetrics,
  BusinessMetrics,
  DataPoint,
  TimeSeriesMetric
} from './types';

class MetricsCollector {
  private metrics: Map<string, TimeSeriesMetric> = new Map();
  private collectors: Map<string, () => Promise<number>> = new Map();
  private collectionInterval: number = 5000; // 5秒
  private intervalId?: NodeJS.Timeout;
  private maxDataPoints: number = 1000;
  private listeners: Set<(metrics: Metric[]) => void> = new Set();

  constructor() {
    this.initializeDefaultCollectors();
  }

  /**
   * 初始化默认收集器
   */
  private initializeDefaultCollectors(): void {
    // 系统指标收集器
    this.registerCollector('system.cpu.usage', async () => {
      return await this.collectCPUUsage();
    });

    this.registerCollector('system.memory.usage', async () => {
      return await this.collectMemoryUsage();
    });

    this.registerCollector('system.disk.usage', async () => {
      return await this.collectDiskUsage();
    });

    this.registerCollector('system.network.bytes', async () => {
      return await this.collectNetworkBytes();
    });

    // 应用指标收集器
    this.registerCollector('app.requests.rate', async () => {
      return await this.collectRequestRate();
    });

    this.registerCollector('app.response.time', async () => {
      return await this.collectResponseTime();
    });

    this.registerCollector('app.errors.rate', async () => {
      return await this.collectErrorRate();
    });

    this.registerCollector('app.cache.hitRate', async () => {
      return await this.collectCacheHitRate();
    });
  }

  /**
   * 注册指标收集器
   */
  registerCollector(
    metricName: string,
    collector: () => Promise<number>
  ): void {
    this.collectors.set(metricName, collector);
  }

  /**
   * 注册指标
   */
  registerMetric(
    name: string,
    type: MetricType,
    category: MetricCategory,
    options: {
      unit?: string;
      description?: string;
      tags?: Record<string, string>;
    } = {}
  ): void {
    const metric: TimeSeriesMetric = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      category,
      value: 0,
      timestamp: Date.now(),
      dataPoints: [],
      tags: options.tags,
      unit: options.unit,
      description: options.description,
      interval: this.collectionInterval
    };

    this.metrics.set(name, metric);
  }

  /**
   * 记录指标值
   */
  record(name: string, value: number, tags?: Record<string, string>): void {
    let metric = this.metrics.get(name);

    if (!metric) {
      // 自动注册未知指标
      this.registerMetric(name, MetricType.GAUGE, MetricCategory.CUSTOM, { tags });
      metric = this.metrics.get(name)!;
    }

    const dataPoint: DataPoint = {
      timestamp: Date.now(),
      value,
      tags
    };

    metric.value = value;
    metric.timestamp = dataPoint.timestamp;
    metric.dataPoints.push(dataPoint);

    // 限制数据点数量
    if (metric.dataPoints.length > this.maxDataPoints) {
      metric.dataPoints = metric.dataPoints.slice(-this.maxDataPoints);
    }

    this.notifyListeners([metric]);
  }

  /**
   * 增加计数器
   */
  increment(name: string, delta: number = 1, tags?: Record<string, string>): void {
    const metric = this.metrics.get(name);
    if (metric && metric.type === MetricType.COUNTER) {
      this.record(name, metric.value + delta, tags);
    } else {
      this.record(name, delta, tags);
    }
  }

  /**
   * 设置仪表值
   */
  gauge(name: string, value: number, tags?: Record<string, string>): void {
    this.record(name, value, tags);
  }

  /**
   * 记录直方图
   */
  histogram(name: string, value: number, tags?: Record<string, string>): void {
    // 简化实现，实际应该维护分布桶
    this.record(name, value, tags);
  }

  /**
   * 开始收集
   */
  start(): void {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
      this.collect();
    }, this.collectionInterval);

    console.log('[MetricsCollector] Started collecting metrics');
  }

  /**
   * 停止收集
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      console.log('[MetricsCollector] Stopped collecting metrics');
    }
  }

  /**
   * 执行收集
   */
  private async collect(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const [name, collector] of this.collectors) {
      promises.push(
        collector()
          .then(value => this.record(name, value))
          .catch(err => {
            console.error(`[MetricsCollector] Error collecting ${name}:`, err);
          })
      );
    }

    await Promise.all(promises);
  }

  /**
   * 获取指标
   */
  getMetric(name: string): TimeSeriesMetric | undefined {
    return this.metrics.get(name);
  }

  /**
   * 获取所有指标
   */
  getAllMetrics(): TimeSeriesMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * 按类别获取指标
   */
  getMetricsByCategory(category: MetricCategory): TimeSeriesMetric[] {
    return this.getAllMetrics().filter(m => m.category === category);
  }

  /**
   * 查询指标数据点
   */
  queryDataPoints(
    name: string,
    startTime: number,
    endTime: number
  ): DataPoint[] {
    const metric = this.metrics.get(name);
    if (!metric) {
      return [];
    }

    return metric.dataPoints.filter(
      dp => dp.timestamp >= startTime && dp.timestamp <= endTime
    );
  }

  /**
   * 聚合数据点
   */
  aggregateDataPoints(
    dataPoints: DataPoint[],
    aggregation: 'avg' | 'sum' | 'min' | 'max' | 'count'
  ): number {
    if (dataPoints.length === 0) {
      return 0;
    }

    const values = dataPoints.map(dp => dp.value);

    switch (aggregation) {
      case 'avg':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'count':
        return values.length;
      default:
        return 0;
    }
  }

  /**
   * 订阅指标更新
   */
  subscribe(listener: (metrics: Metric[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 通知监听器
   */
  private notifyListeners(metrics: Metric[]): void {
    this.listeners.forEach(listener => {
      try {
        listener(metrics);
      } catch (err) {
        console.error('[MetricsCollector] Error notifying listener:', err);
      }
    });
  }

  /**
   * 清除旧数据
   */
  clearOldData(beforeTimestamp: number): void {
    for (const metric of this.metrics.values()) {
      metric.dataPoints = metric.dataPoints.filter(
        dp => dp.timestamp >= beforeTimestamp
      );
    }
  }

  /**
   * 收集系统指标
   */
  async collectSystemMetrics(): Promise<SystemMetrics> {
    const metrics: SystemMetrics = {
      cpu: {
        usage: await this.collectCPUUsage(),
        cores: navigator.hardwareConcurrency || 1,
        loadAverage: [0, 0, 0] // 浏览器环境无法获取
      },
      memory: {
        total: (performance as any).memory?.jsHeapSizeLimit || 0,
        used: (performance as any).memory?.usedJSHeapSize || 0,
        free: ((performance as any).memory?.jsHeapSizeLimit || 0) -
              ((performance as any).memory?.usedJSHeapSize || 0),
        usage: await this.collectMemoryUsage()
      },
      disk: {
        total: 0, // 浏览器环境无法获取
        used: 0,
        free: 0,
        usage: 0,
        readSpeed: 0,
        writeSpeed: 0
      },
      network: {
        bytesIn: 0,
        bytesOut: 0,
        packetsIn: 0,
        packetsOut: 0,
        errorRate: 0
      },
      process: {
        pid: 0,
        uptime: performance.now() / 1000,
        threads: 1,
        handles: 0
      }
    };

    return metrics;
  }

  /**
   * 收集应用指标
   */
  async collectApplicationMetrics(): Promise<ApplicationMetrics> {
    const metrics: ApplicationMetrics = {
      requests: {
        total: await this.collectTotalRequests(),
        success: await this.collectSuccessRequests(),
        failed: await this.collectFailedRequests(),
        rate: await this.collectRequestRate()
      },
      response: {
        avgTime: await this.collectResponseTime(),
        p50: 0,
        p95: 0,
        p99: 0,
        maxTime: 0
      },
      errors: {
        total: await this.collectTotalErrors(),
        rate: await this.collectErrorRate(),
        byType: {}
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: await this.collectCacheHitRate(),
        size: 0
      },
      database: {
        connections: 0,
        activeQueries: 0,
        slowQueries: 0,
        avgQueryTime: 0
      }
    };

    return metrics;
  }

  /**
   * 收集业务指标
   */
  async collectBusinessMetrics(): Promise<BusinessMetrics> {
    const metrics: BusinessMetrics = {
      users: {
        active: 0,
        online: 0,
        registered: 0,
        churnRate: 0
      },
      tasks: {
        total: 0,
        completed: 0,
        failed: 0,
        pending: 0,
        avgDuration: 0
      },
      agents: {
        total: 0,
        active: 0,
        idle: 0,
        avgResponseTime: 0
      },
      revenue: {
        total: 0,
        daily: 0,
        monthly: 0,
        arpu: 0
      }
    };

    return metrics;
  }

  // 具体收集方法实现
  private async collectCPUUsage(): Promise<number> {
    // 简化实现，实际应通过性能API计算
    return Math.random() * 100;
  }

  private async collectMemoryUsage(): Promise<number> {
    const memory = (performance as any).memory;
    if (memory) {
      return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    }
    return 0;
  }

  private async collectDiskUsage(): Promise<number> {
    // 浏览器环境无法直接获取
    return 0;
  }

  private async collectNetworkBytes(): Promise<number> {
    // 简化实现
    return 0;
  }

  private async collectRequestRate(): Promise<number> {
    return this.calculateRate('app.requests.total');
  }

  private async collectResponseTime(): Promise<number> {
    const metric = this.metrics.get('app.response.time');
    if (metric && metric.dataPoints.length > 0) {
      return this.aggregateDataPoints(
        metric.dataPoints.slice(-10),
        'avg'
      );
    }
    return 0;
  }

  private async collectErrorRate(): Promise<number> {
    return this.calculateRate('app.errors.total');
  }

  private async collectCacheHitRate(): Promise<number> {
    const hits = this.metrics.get('app.cache.hits')?.value || 0;
    const total = hits + (this.metrics.get('app.cache.misses')?.value || 0);
    return total > 0 ? (hits / total) * 100 : 0;
  }

  private async collectTotalRequests(): Promise<number> {
    return this.metrics.get('app.requests.total')?.value || 0;
  }

  private async collectSuccessRequests(): Promise<number> {
    return this.metrics.get('app.requests.success')?.value || 0;
  }

  private async collectFailedRequests(): Promise<number> {
    return this.metrics.get('app.requests.failed')?.value || 0;
  }

  private async collectTotalErrors(): Promise<number> {
    return this.metrics.get('app.errors.total')?.value || 0;
  }

  /**
   * 计算速率
   */
  private calculateRate(metricName: string): number {
    const metric = this.metrics.get(metricName);
    if (!metric || metric.dataPoints.length < 2) {
      return 0;
    }

    const recent = metric.dataPoints.slice(-2);
    const timeDiff = (recent[1].timestamp - recent[0].timestamp) / 1000; // 转换为秒
    const valueDiff = recent[1].value - recent[0].value;

    return timeDiff > 0 ? valueDiff / timeDiff : 0;
  }

  /**
   * 重置所有指标
   */
  reset(): void {
    this.metrics.clear();
    this.initializeDefaultCollectors();
  }

  /**
   * 导出指标数据
   */
  export(): any {
    const data: any = {};
    for (const [name, metric] of this.metrics) {
      data[name] = {
        value: metric.value,
        timestamp: metric.timestamp,
        dataPoints: metric.dataPoints
      };
    }
    return data;
  }

  /**
   * 导入指标数据
   */
  import(data: any): void {
    for (const [name, metricData] of Object.entries(data)) {
      const metric = this.metrics.get(name);
      if (metric) {
        metric.value = (metricData as any).value;
        metric.timestamp = (metricData as any).timestamp;
        metric.dataPoints = (metricData as any).dataPoints;
      }
    }
  }
}

// 导出单例
export const metricsCollector = new MetricsCollector();
export default metricsCollector;
