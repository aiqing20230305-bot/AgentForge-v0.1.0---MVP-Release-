/**
 * 日志聚合器
 * 负责日志收集、存储、搜索和分析
 */

import {
  LogEntry,
  LogLevel,
  LogQuery
} from './types';

interface LogBuffer {
  entries: LogEntry[];
  maxSize: number;
  flushInterval: number;
}

class LogAggregator {
  private logs: LogEntry[] = [];
  private maxLogs: number = 10000;
  private buffer: LogBuffer;
  private sources: Set<string> = new Set();
  private listeners: Set<(entry: LogEntry) => void> = new Set();
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    this.buffer = {
      entries: [],
      maxSize: 100,
      flushInterval: 5000 // 5秒
    };

    this.startBufferFlush();
    this.captureConsoleLogs();
  }

  /**
   * 记录日志
   */
  log(
    level: LogLevel,
    message: string,
    source: string,
    options: {
      tags?: Record<string, string>;
      metadata?: Record<string, any>;
      traceId?: string;
      spanId?: string;
      stackTrace?: string;
    } = {}
  ): void {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      message,
      source,
      ...options
    };

    // 添加到缓冲区
    this.buffer.entries.push(entry);
    this.sources.add(source);

    // 如果缓冲区满了，立即刷新
    if (this.buffer.entries.length >= this.buffer.maxSize) {
      this.flush();
    }

    // 通知监听器
    this.notifyListeners(entry);
  }

  /**
   * 便捷方法
   */
  trace(message: string, source: string, options?: any): void {
    this.log(LogLevel.TRACE, message, source, options);
  }

  debug(message: string, source: string, options?: any): void {
    this.log(LogLevel.DEBUG, message, source, options);
  }

  info(message: string, source: string, options?: any): void {
    this.log(LogLevel.INFO, message, source, options);
  }

  warn(message: string, source: string, options?: any): void {
    this.log(LogLevel.WARN, message, source, options);
  }

  error(message: string, source: string, options?: any): void {
    this.log(LogLevel.ERROR, message, source, options);
  }

  fatal(message: string, source: string, options?: any): void {
    this.log(LogLevel.FATAL, message, source, options);
  }

  /**
   * 刷新缓冲区
   */
  private flush(): void {
    if (this.buffer.entries.length === 0) {
      return;
    }

    // 将缓冲区的日志添加到主存储
    this.logs.push(...this.buffer.entries);

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // 清空缓冲区
    this.buffer.entries = [];
  }

  /**
   * 启动定期刷新
   */
  private startBufferFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.buffer.flushInterval);
  }

  /**
   * 停止定期刷新
   */
  stopBufferFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  /**
   * 查询日志
   */
  query(query: LogQuery): LogEntry[] {
    let results = [...this.logs];

    // 时间过滤
    results = results.filter(
      log =>
        log.timestamp >= query.startTime && log.timestamp <= query.endTime
    );

    // 级别过滤
    if (query.levels && query.levels.length > 0) {
      results = results.filter(log => query.levels!.includes(log.level));
    }

    // 来源过滤
    if (query.sources && query.sources.length > 0) {
      results = results.filter(log => query.sources!.includes(log.source));
    }

    // 标签过滤
    if (query.tags) {
      results = results.filter(log => {
        if (!log.tags) return false;
        return Object.entries(query.tags!).every(
          ([key, value]) => log.tags![key] === value
        );
      });
    }

    // 全文搜索
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      results = results.filter(
        log =>
          log.message.toLowerCase().includes(searchLower) ||
          JSON.stringify(log.metadata || {}).toLowerCase().includes(searchLower)
      );
    }

    // 分页
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    results = results.slice(offset, offset + limit);

    return results;
  }

  /**
   * 按级别统计
   */
  countByLevel(startTime: number, endTime: number): Record<LogLevel, number> {
    const counts: Record<LogLevel, number> = {
      [LogLevel.TRACE]: 0,
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.ERROR]: 0,
      [LogLevel.FATAL]: 0
    };

    this.logs
      .filter(log => log.timestamp >= startTime && log.timestamp <= endTime)
      .forEach(log => {
        counts[log.level]++;
      });

    return counts;
  }

  /**
   * 按来源统计
   */
  countBySource(startTime: number, endTime: number): Record<string, number> {
    const counts: Record<string, number> = {};

    this.logs
      .filter(log => log.timestamp >= startTime && log.timestamp <= endTime)
      .forEach(log => {
        counts[log.source] = (counts[log.source] || 0) + 1;
      });

    return counts;
  }

  /**
   * 获取错误率
   */
  getErrorRate(startTime: number, endTime: number): number {
    const logs = this.logs.filter(
      log => log.timestamp >= startTime && log.timestamp <= endTime
    );

    if (logs.length === 0) return 0;

    const errors = logs.filter(
      log => log.level === LogLevel.ERROR || log.level === LogLevel.FATAL
    ).length;

    return (errors / logs.length) * 100;
  }

  /**
   * 获取所有来源
   */
  getSources(): string[] {
    return Array.from(this.sources);
  }

  /**
   * 获取最新日志
   */
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * 按TraceId获取日志
   */
  getLogsByTraceId(traceId: string): LogEntry[] {
    return this.logs.filter(log => log.traceId === traceId);
  }

  /**
   * 搜索日志
   */
  search(searchText: string, options: {
    caseSensitive?: boolean;
    regex?: boolean;
    limit?: number;
  } = {}): LogEntry[] {
    const limit = options.limit || 100;
    let results: LogEntry[] = [];

    if (options.regex) {
      try {
        const pattern = new RegExp(
          searchText,
          options.caseSensitive ? '' : 'i'
        );
        results = this.logs.filter(
          log =>
            pattern.test(log.message) ||
            pattern.test(JSON.stringify(log.metadata || {}))
        );
      } catch (err) {
        console.error('[LogAggregator] Invalid regex pattern:', err);
        return [];
      }
    } else {
      const search = options.caseSensitive
        ? searchText
        : searchText.toLowerCase();
      results = this.logs.filter(log => {
        const message = options.caseSensitive
          ? log.message
          : log.message.toLowerCase();
        const metadata = JSON.stringify(log.metadata || {});
        const metadataSearch = options.caseSensitive
          ? metadata
          : metadata.toLowerCase();
        return message.includes(search) || metadataSearch.includes(search);
      });
    }

    return results.slice(-limit);
  }

  /**
   * 分析日志模式
   */
  analyzePatterns(startTime: number, endTime: number): {
    topErrors: { message: string; count: number }[];
    topSources: { source: string; count: number }[];
    errorTrends: { timestamp: number; count: number }[];
  } {
    const logs = this.logs.filter(
      log => log.timestamp >= startTime && log.timestamp <= endTime
    );

    // Top错误
    const errorCounts: Record<string, number> = {};
    logs
      .filter(log => log.level === LogLevel.ERROR || log.level === LogLevel.FATAL)
      .forEach(log => {
        const key = log.message.substring(0, 100); // 限制长度
        errorCounts[key] = (errorCounts[key] || 0) + 1;
      });

    const topErrors = Object.entries(errorCounts)
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top来源
    const sourceCounts: Record<string, number> = {};
    logs.forEach(log => {
      sourceCounts[log.source] = (sourceCounts[log.source] || 0) + 1;
    });

    const topSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 错误趋势（按小时）
    const errorTrends: { timestamp: number; count: number }[] = [];
    const hourMs = 60 * 60 * 1000;
    const startHour = Math.floor(startTime / hourMs) * hourMs;
    const endHour = Math.floor(endTime / hourMs) * hourMs;

    for (let hour = startHour; hour <= endHour; hour += hourMs) {
      const count = logs.filter(
        log =>
          log.timestamp >= hour &&
          log.timestamp < hour + hourMs &&
          (log.level === LogLevel.ERROR || log.level === LogLevel.FATAL)
      ).length;

      errorTrends.push({ timestamp: hour, count });
    }

    return { topErrors, topSources, errorTrends };
  }

  /**
   * 导出日志
   */
  export(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    } else {
      // CSV格式
      const headers = ['timestamp', 'level', 'source', 'message', 'traceId'];
      const rows = this.logs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.level,
        log.source,
        log.message.replace(/"/g, '""'), // 转义引号
        log.traceId || ''
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return csv;
    }
  }

  /**
   * 订阅日志
   */
  subscribe(listener: (entry: LogEntry) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 通知监听器
   */
  private notifyListeners(entry: LogEntry): void {
    this.listeners.forEach(listener => {
      try {
        listener(entry);
      } catch (err) {
        console.error('[LogAggregator] Error notifying listener:', err);
      }
    });
  }

  /**
   * 捕获控制台日志
   */
  private captureConsoleLogs(): void {
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
      info: console.info
    };

    console.log = (...args) => {
      this.info(args.join(' '), 'console');
      originalConsole.log.apply(console, args);
    };

    console.warn = (...args) => {
      this.warn(args.join(' '), 'console');
      originalConsole.warn.apply(console, args);
    };

    console.error = (...args) => {
      this.error(args.join(' '), 'console', {
        stackTrace: new Error().stack
      });
      originalConsole.error.apply(console, args);
    };

    console.debug = (...args) => {
      this.debug(args.join(' '), 'console');
      originalConsole.debug.apply(console, args);
    };

    console.info = (...args) => {
      this.info(args.join(' '), 'console');
      originalConsole.info.apply(console, args);
    };
  }

  /**
   * 清除旧日志
   */
  clearOldLogs(beforeTimestamp: number): void {
    this.logs = this.logs.filter(log => log.timestamp >= beforeTimestamp);
  }

  /**
   * 清除所有日志
   */
  clear(): void {
    this.logs = [];
    this.buffer.entries = [];
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    bySource: Record<string, number>;
    oldestTimestamp?: number;
    newestTimestamp?: number;
  } {
    const stats = {
      total: this.logs.length,
      byLevel: this.countByLevel(0, Date.now()),
      bySource: this.countBySource(0, Date.now()),
      oldestTimestamp: this.logs.length > 0 ? this.logs[0].timestamp : undefined,
      newestTimestamp:
        this.logs.length > 0 ? this.logs[this.logs.length - 1].timestamp : undefined
    };

    return stats;
  }

  /**
   * 设置最大日志数
   */
  setMaxLogs(max: number): void {
    this.maxLogs = max;
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * 获取日志大小
   */
  getSize(): number {
    return this.logs.length + this.buffer.entries.length;
  }
}

// 导出单例
export const logAggregator = new LogAggregator();
export default logAggregator;
