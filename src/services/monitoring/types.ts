/**
 * 监控系统类型定义
 * 定义所有监控相关的数据结构和接口
 */

// 指标类型
export enum MetricType {
  COUNTER = 'counter',       // 计数器（只增不减）
  GAUGE = 'gauge',          // 仪表盘（可增可减）
  HISTOGRAM = 'histogram',  // 直方图（分布统计）
  SUMMARY = 'summary'       // 摘要（百分位数）
}

// 指标分类
export enum MetricCategory {
  SYSTEM = 'system',       // 系统指标
  APPLICATION = 'application', // 应用指标
  BUSINESS = 'business',   // 业务指标
  CUSTOM = 'custom'        // 自定义指标
}

// 告警级别
export enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// 告警状态
export enum AlertStatus {
  PENDING = 'pending',     // 待处理
  ACKNOWLEDGED = 'acknowledged', // 已确认
  RESOLVED = 'resolved',   // 已解决
  SILENCED = 'silenced'    // 已静默
}

// 通知渠道
export enum NotificationChannel {
  EMAIL = 'email',
  SLACK = 'slack',
  WEBHOOK = 'webhook',
  SMS = 'sms',
  DESKTOP = 'desktop'
}

// 基础指标接口
export interface Metric {
  id: string;
  name: string;
  type: MetricType;
  category: MetricCategory;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
  unit?: string;
  description?: string;
}

// 时间序列数据点
export interface DataPoint {
  timestamp: number;
  value: number;
  tags?: Record<string, string>;
}

// 时间序列指标
export interface TimeSeriesMetric extends Metric {
  dataPoints: DataPoint[];
  aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count';
  interval?: number; // 采样间隔（毫秒）
}

// 系统指标
export interface SystemMetrics {
  cpu: {
    usage: number;           // CPU使用率 (0-100)
    cores: number;           // CPU核心数
    loadAverage: number[];   // 负载平均值 [1min, 5min, 15min]
  };
  memory: {
    total: number;           // 总内存 (bytes)
    used: number;            // 已使用 (bytes)
    free: number;            // 空闲 (bytes)
    usage: number;           // 使用率 (0-100)
  };
  disk: {
    total: number;           // 总磁盘空间 (bytes)
    used: number;            // 已使用 (bytes)
    free: number;            // 空闲 (bytes)
    usage: number;           // 使用率 (0-100)
    readSpeed: number;       // 读取速度 (bytes/s)
    writeSpeed: number;      // 写入速度 (bytes/s)
  };
  network: {
    bytesIn: number;         // 入站流量 (bytes)
    bytesOut: number;        // 出站流量 (bytes)
    packetsIn: number;       // 入站包数
    packetsOut: number;      // 出站包数
    errorRate: number;       // 错误率 (0-100)
  };
  process: {
    pid: number;
    uptime: number;          // 运行时间 (seconds)
    threads: number;         // 线程数
    handles: number;         // 句柄数
  };
}

// 应用指标
export interface ApplicationMetrics {
  requests: {
    total: number;           // 总请求数
    success: number;         // 成功请求数
    failed: number;          // 失败请求数
    rate: number;            // 请求速率 (req/s)
  };
  response: {
    avgTime: number;         // 平均响应时间 (ms)
    p50: number;             // 50分位响应时间
    p95: number;             // 95分位响应时间
    p99: number;             // 99分位响应时间
    maxTime: number;         // 最大响应时间
  };
  errors: {
    total: number;           // 总错误数
    rate: number;            // 错误率 (0-100)
    byType: Record<string, number>; // 按类型分组
  };
  cache: {
    hits: number;            // 缓存命中数
    misses: number;          // 缓存未命中数
    hitRate: number;         // 命中率 (0-100)
    size: number;            // 缓存大小 (bytes)
  };
  database: {
    connections: number;     // 当前连接数
    activeQueries: number;   // 活跃查询数
    slowQueries: number;     // 慢查询数
    avgQueryTime: number;    // 平均查询时间 (ms)
  };
}

// 业务指标
export interface BusinessMetrics {
  users: {
    active: number;          // 活跃用户数
    online: number;          // 在线用户数
    registered: number;      // 注册用户数
    churnRate: number;       // 流失率 (0-100)
  };
  tasks: {
    total: number;           // 总任务数
    completed: number;       // 完成任务数
    failed: number;          // 失败任务数
    pending: number;         // 待处理任务数
    avgDuration: number;     // 平均执行时间 (ms)
  };
  agents: {
    total: number;           // 总Agent数
    active: number;          // 活跃Agent数
    idle: number;            // 空闲Agent数
    avgResponseTime: number; // 平均响应时间 (ms)
  };
  revenue: {
    total: number;           // 总收入
    daily: number;           // 日收入
    monthly: number;         // 月收入
    arpu: number;            // 人均收入
  };
}

// 健康状态
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  score: number;             // 健康分数 (0-100)
  checks: HealthCheck[];
  lastUpdate: number;
}

// 健康检查项
export interface HealthCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message?: string;
  timestamp: number;
  duration?: number;         // 检查耗时 (ms)
}

// 告警规则
export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  metric: string;            // 监控指标
  condition: AlertCondition;
  level: AlertLevel;
  channels: NotificationChannel[];
  cooldown?: number;         // 冷却时间 (seconds)
  tags?: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

// 告警条件
export interface AlertCondition {
  type: 'threshold' | 'trend' | 'anomaly';
  operator?: '>' | '<' | '>=' | '<=' | '==' | '!=';
  threshold?: number;
  duration?: number;         // 持续时间 (seconds)
  percentage?: number;       // 变化百分比
  baseline?: number;         // 基线值
}

// 告警事件
export interface AlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  level: AlertLevel;
  status: AlertStatus;
  message: string;
  metric: Metric;
  triggeredAt: number;
  acknowledgedAt?: number;
  acknowledgedBy?: string;
  resolvedAt?: number;
  resolvedBy?: string;
  notifications: AlertNotification[];
}

// 告警通知
export interface AlertNotification {
  id: string;
  channel: NotificationChannel;
  sentAt: number;
  status: 'sent' | 'failed' | 'pending';
  error?: string;
}

// 日志级别
export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

// 日志条目
export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  source: string;            // 日志来源
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
  traceId?: string;          // 分布式追踪ID
  spanId?: string;           // Span ID
  stackTrace?: string;       // 错误堆栈
}

// 日志查询
export interface LogQuery {
  startTime: number;
  endTime: number;
  levels?: LogLevel[];
  sources?: string[];
  search?: string;           // 全文搜索
  tags?: Record<string, string>;
  limit?: number;
  offset?: number;
}

// 分布式追踪Span
export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  duration: number;          // 持续时间 (ms)
  tags?: Record<string, string>;
  logs?: SpanLog[];
  status: 'ok' | 'error';
  errorMessage?: string;
}

// Span日志
export interface SpanLog {
  timestamp: number;
  fields: Record<string, any>;
}

// 追踪记录
export interface Trace {
  traceId: string;
  spans: Span[];
  startTime: number;
  duration: number;          // 总持续时间 (ms)
  services: string[];        // 涉及的服务
  errorCount: number;
}

// 慢查询记录
export interface SlowQuery {
  id: string;
  query: string;
  duration: number;          // 执行时间 (ms)
  timestamp: number;
  database: string;
  table?: string;
  plan?: any;                // 查询计划
  traceId?: string;
}

// 监控配置
export interface MonitoringConfig {
  enabled: boolean;
  collectInterval: number;   // 采集间隔 (ms)
  retentionDays: number;     // 数据保留天数
  sampling: {
    enabled: boolean;
    rate: number;            // 采样率 (0-1)
  };
  alerts: {
    enabled: boolean;
    checkInterval: number;   // 检查间隔 (ms)
  };
  logging: {
    enabled: boolean;
    level: LogLevel;
    maxSize: number;         // 最大日志大小 (bytes)
  };
  tracing: {
    enabled: boolean;
    samplingRate: number;    // 追踪采样率 (0-1)
  };
}

// 监控仪表盘配置
export interface DashboardConfig {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  refreshInterval?: number;  // 刷新间隔 (ms)
}

// 仪表盘组件
export interface DashboardWidget {
  id: string;
  type: 'chart' | 'gauge' | 'stat' | 'table' | 'heatmap';
  title: string;
  metrics: string[];         // 显示的指标
  config: any;               // 组件特定配置
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// 仪表盘布局
export interface DashboardLayout {
  columns: number;
  rows: number;
  gap: number;
}

// 性能快照
export interface PerformanceSnapshot {
  id: string;
  timestamp: number;
  system: SystemMetrics;
  application: ApplicationMetrics;
  business: BusinessMetrics;
  health: HealthStatus;
}

// 监控报告
export interface MonitoringReport {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  summary: {
    totalMetrics: number;
    alerts: number;
    incidents: number;
    avgHealthScore: number;
  };
  metrics: Metric[];
  alerts: AlertEvent[];
  recommendations: string[];
  generatedAt: number;
}

// 异常检测结果
export interface AnomalyDetection {
  metricId: string;
  timestamp: number;
  value: number;
  expectedValue: number;
  deviation: number;         // 偏差值
  severity: 'low' | 'medium' | 'high';
  confidence: number;        // 置信度 (0-1)
}

// 容量预测
export interface CapacityForecast {
  metric: string;
  current: number;
  predicted: number[];       // 未来预测值
  timestamps: number[];      // 对应时间点
  confidence: number;        // 预测置信度 (0-1)
  exhaustionDate?: number;   // 预计耗尽日期
}
