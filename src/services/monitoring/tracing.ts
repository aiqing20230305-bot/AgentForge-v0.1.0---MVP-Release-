/**
 * 分布式追踪服务
 * 实现Trace和Span管理，用于性能分析和调用链追踪
 */

import {
  Trace,
  Span,
  SpanLog,
  SlowQuery
} from './types';

interface ActiveSpan {
  span: Span;
  startTime: number;
}

class TracingService {
  private traces: Map<string, Trace> = new Map();
  private activeSpans: Map<string, ActiveSpan> = new Map();
  private slowQueries: SlowQuery[] = [];
  private samplingRate: number = 1.0; // 100%采样
  private maxTraces: number = 1000;
  private slowQueryThreshold: number = 1000; // 1秒
  private listeners: Set<(trace: Trace) => void> = new Set();

  constructor() {
    // 初始化
  }

  /**
   * 开始一个新的Trace
   */
  startTrace(operationName: string): string {
    // 采样决策
    if (Math.random() > this.samplingRate) {
      return '';
    }

    const traceId = this.generateTraceId();
    const trace: Trace = {
      traceId,
      spans: [],
      startTime: Date.now(),
      duration: 0,
      services: [],
      errorCount: 0
    };

    this.traces.set(traceId, trace);
    return traceId;
  }

  /**
   * 开始一个Span
   */
  startSpan(
    operationName: string,
    traceId: string,
    parentSpanId?: string
  ): string {
    if (!traceId) {
      return '';
    }

    const span: Span = {
      traceId,
      spanId: this.generateSpanId(),
      parentSpanId,
      operationName,
      startTime: Date.now(),
      duration: 0,
      status: 'ok',
      tags: {},
      logs: []
    };

    this.activeSpans.set(span.spanId, {
      span,
      startTime: Date.now()
    });

    return span.spanId;
  }

  /**
   * 结束一个Span
   */
  finishSpan(
    spanId: string,
    options: {
      status?: 'ok' | 'error';
      errorMessage?: string;
      tags?: Record<string, string>;
    } = {}
  ): void {
    const activeSpan = this.activeSpans.get(spanId);
    if (!activeSpan) {
      return;
    }

    const { span, startTime } = activeSpan;
    span.duration = Date.now() - startTime;

    if (options.status) {
      span.status = options.status;
    }
    if (options.errorMessage) {
      span.errorMessage = options.errorMessage;
    }
    if (options.tags) {
      span.tags = { ...span.tags, ...options.tags };
    }

    // 添加到Trace
    const trace = this.traces.get(span.traceId);
    if (trace) {
      trace.spans.push(span);

      // 更新Trace信息
      if (span.status === 'error') {
        trace.errorCount++;
      }

      // 提取服务名
      const service = span.tags?.service;
      if (service && !trace.services.includes(service)) {
        trace.services.push(service);
      }
    }

    this.activeSpans.delete(spanId);
  }

  /**
   * 添加Span日志
   */
  logSpan(spanId: string, fields: Record<string, any>): void {
    const activeSpan = this.activeSpans.get(spanId);
    if (!activeSpan) {
      return;
    }

    const log: SpanLog = {
      timestamp: Date.now(),
      fields
    };

    activeSpan.span.logs!.push(log);
  }

  /**
   * 设置Span标签
   */
  setSpanTag(spanId: string, key: string, value: string): void {
    const activeSpan = this.activeSpans.get(spanId);
    if (!activeSpan) {
      return;
    }

    if (!activeSpan.span.tags) {
      activeSpan.span.tags = {};
    }

    activeSpan.span.tags[key] = value;
  }

  /**
   * 结束Trace
   */
  finishTrace(traceId: string): void {
    const trace = this.traces.get(traceId);
    if (!trace) {
      return;
    }

    // 计算总持续时间
    if (trace.spans.length > 0) {
      const maxEndTime = Math.max(
        ...trace.spans.map(s => s.startTime + s.duration)
      );
      trace.duration = maxEndTime - trace.startTime;
    }

    // 限制Trace数量
    if (this.traces.size > this.maxTraces) {
      const oldestTraceId = Array.from(this.traces.keys())[0];
      this.traces.delete(oldestTraceId);
    }

    // 通知监听器
    this.notifyListeners(trace);

    console.log(`[Tracing] Trace completed: ${traceId}, duration: ${trace.duration}ms`);
  }

  /**
   * 获取Trace
   */
  getTrace(traceId: string): Trace | undefined {
    return this.traces.get(traceId);
  }

  /**
   * 获取所有Traces
   */
  getAllTraces(): Trace[] {
    return Array.from(this.traces.values());
  }

  /**
   * 查询Traces
   */
  queryTraces(options: {
    startTime?: number;
    endTime?: number;
    minDuration?: number;
    maxDuration?: number;
    hasErrors?: boolean;
    service?: string;
    limit?: number;
  } = {}): Trace[] {
    let results = this.getAllTraces();

    // 时间过滤
    if (options.startTime !== undefined) {
      results = results.filter(t => t.startTime >= options.startTime!);
    }
    if (options.endTime !== undefined) {
      results = results.filter(t => t.startTime <= options.endTime!);
    }

    // 持续时间过滤
    if (options.minDuration !== undefined) {
      results = results.filter(t => t.duration >= options.minDuration!);
    }
    if (options.maxDuration !== undefined) {
      results = results.filter(t => t.duration <= options.maxDuration!);
    }

    // 错误过滤
    if (options.hasErrors !== undefined) {
      results = results.filter(t =>
        options.hasErrors ? t.errorCount > 0 : t.errorCount === 0
      );
    }

    // 服务过滤
    if (options.service) {
      results = results.filter(t => t.services.includes(options.service!));
    }

    // 限制数量
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * 获取慢Traces
   */
  getSlowTraces(threshold: number = 1000, limit: number = 10): Trace[] {
    return this.getAllTraces()
      .filter(t => t.duration >= threshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * 记录慢查询
   */
  recordSlowQuery(
    query: string,
    duration: number,
    database: string,
    options: {
      table?: string;
      plan?: any;
      traceId?: string;
    } = {}
  ): void {
    if (duration < this.slowQueryThreshold) {
      return;
    }

    const slowQuery: SlowQuery = {
      id: `sq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      query,
      duration,
      timestamp: Date.now(),
      database,
      ...options
    };

    this.slowQueries.push(slowQuery);

    // 限制数量
    if (this.slowQueries.length > 1000) {
      this.slowQueries = this.slowQueries.slice(-1000);
    }

    console.log(`[Tracing] Slow query detected: ${duration}ms`);
  }

  /**
   * 获取慢查询
   */
  getSlowQueries(limit: number = 100): SlowQuery[] {
    return this.slowQueries.slice(-limit);
  }

  /**
   * 查询慢查询
   */
  querySlowQueries(options: {
    startTime?: number;
    endTime?: number;
    database?: string;
    minDuration?: number;
    limit?: number;
  } = {}): SlowQuery[] {
    let results = [...this.slowQueries];

    if (options.startTime !== undefined) {
      results = results.filter(q => q.timestamp >= options.startTime!);
    }
    if (options.endTime !== undefined) {
      results = results.filter(q => q.timestamp <= options.endTime!);
    }
    if (options.database) {
      results = results.filter(q => q.database === options.database);
    }
    if (options.minDuration !== undefined) {
      results = results.filter(q => q.duration >= options.minDuration!);
    }

    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * 分析性能瓶颈
   */
  analyzeBottlenecks(traceId: string): {
    slowestSpan: Span | null;
    criticalPath: Span[];
    totalDuration: number;
  } {
    const trace = this.traces.get(traceId);
    if (!trace || trace.spans.length === 0) {
      return {
        slowestSpan: null,
        criticalPath: [],
        totalDuration: 0
      };
    }

    // 找到最慢的Span
    const slowestSpan = trace.spans.reduce((prev, current) =>
      current.duration > prev.duration ? current : prev
    );

    // 构建关键路径（简化实现）
    const criticalPath = this.buildCriticalPath(trace.spans);

    return {
      slowestSpan,
      criticalPath,
      totalDuration: trace.duration
    };
  }

  /**
   * 构建关键路径
   */
  private buildCriticalPath(spans: Span[]): Span[] {
    // 简化实现：按持续时间排序返回top spans
    return [...spans]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
  }

  /**
   * 获取服务依赖
   */
  getServiceDependencies(traceId: string): Map<string, string[]> {
    const trace = this.traces.get(traceId);
    if (!trace) {
      return new Map();
    }

    const dependencies = new Map<string, string[]>();

    trace.spans.forEach(span => {
      const service = span.tags?.service || 'unknown';

      if (span.parentSpanId) {
        const parentSpan = trace.spans.find(s => s.spanId === span.parentSpanId);
        if (parentSpan) {
          const parentService = parentSpan.tags?.service || 'unknown';
          if (!dependencies.has(parentService)) {
            dependencies.set(parentService, []);
          }
          if (!dependencies.get(parentService)!.includes(service)) {
            dependencies.get(parentService)!.push(service);
          }
        }
      }
    });

    return dependencies;
  }

  /**
   * 计算统计信息
   */
  getStatistics(startTime: number, endTime: number): {
    totalTraces: number;
    totalSpans: number;
    avgDuration: number;
    errorRate: number;
    throughput: number;
    p50Duration: number;
    p95Duration: number;
    p99Duration: number;
  } {
    const traces = this.queryTraces({ startTime, endTime });

    if (traces.length === 0) {
      return {
        totalTraces: 0,
        totalSpans: 0,
        avgDuration: 0,
        errorRate: 0,
        throughput: 0,
        p50Duration: 0,
        p95Duration: 0,
        p99Duration: 0
      };
    }

    const totalSpans = traces.reduce((sum, t) => sum + t.spans.length, 0);
    const totalDuration = traces.reduce((sum, t) => sum + t.duration, 0);
    const avgDuration = totalDuration / traces.length;
    const errorsCount = traces.filter(t => t.errorCount > 0).length;
    const errorRate = (errorsCount / traces.length) * 100;
    const timeRangeSeconds = (endTime - startTime) / 1000;
    const throughput = traces.length / timeRangeSeconds;

    // 计算百分位数
    const sortedDurations = traces
      .map(t => t.duration)
      .sort((a, b) => a - b);

    const p50Index = Math.floor(sortedDurations.length * 0.5);
    const p95Index = Math.floor(sortedDurations.length * 0.95);
    const p99Index = Math.floor(sortedDurations.length * 0.99);

    return {
      totalTraces: traces.length,
      totalSpans,
      avgDuration,
      errorRate,
      throughput,
      p50Duration: sortedDurations[p50Index] || 0,
      p95Duration: sortedDurations[p95Index] || 0,
      p99Duration: sortedDurations[p99Index] || 0
    };
  }

  /**
   * 生成TraceId
   */
  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  /**
   * 生成SpanId
   */
  private generateSpanId(): string {
    return `span_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  /**
   * 设置采样率
   */
  setSamplingRate(rate: number): void {
    this.samplingRate = Math.max(0, Math.min(1, rate));
  }

  /**
   * 设置慢查询阈值
   */
  setSlowQueryThreshold(threshold: number): void {
    this.slowQueryThreshold = threshold;
  }

  /**
   * 订阅Trace完成事件
   */
  subscribe(listener: (trace: Trace) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 通知监听器
   */
  private notifyListeners(trace: Trace): void {
    this.listeners.forEach(listener => {
      try {
        listener(trace);
      } catch (err) {
        console.error('[Tracing] Error notifying listener:', err);
      }
    });
  }

  /**
   * 清除旧数据
   */
  clearOldData(beforeTimestamp: number): void {
    for (const [traceId, trace] of this.traces) {
      if (trace.startTime < beforeTimestamp) {
        this.traces.delete(traceId);
      }
    }

    this.slowQueries = this.slowQueries.filter(
      q => q.timestamp >= beforeTimestamp
    );
  }

  /**
   * 重置
   */
  reset(): void {
    this.traces.clear();
    this.activeSpans.clear();
    this.slowQueries = [];
  }

  /**
   * 导出数据
   */
  export(): any {
    return {
      traces: Array.from(this.traces.values()),
      slowQueries: this.slowQueries
    };
  }
}

// 导出单例
export const tracingService = new TracingService();
export default tracingService;
