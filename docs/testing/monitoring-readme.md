# 监控系统文档

## 概述

全方位性能监控和智能告警系统，提供实时系统监控、告警管理、日志聚合和分布式追踪功能。

## 功能特性

### 1. 指标收集（20+ 指标）

#### 系统指标
- **CPU**: 使用率、核心数、负载平均值
- **内存**: 总量、已用、空闲、使用率
- **磁盘**: 容量、使用率、读写速度
- **网络**: 流量、包数、错误率
- **进程**: PID、运行时间、线程数

#### 应用指标
- **请求**: 总数、成功率、失败率、QPS
- **响应**: 平均时间、P50/P95/P99
- **错误**: 总数、错误率、错误类型分布
- **缓存**: 命中率、大小
- **数据库**: 连接数、活跃查询、慢查询

#### 业务指标
- **用户**: 活跃用户、在线用户、流失率
- **任务**: 完成数、失败率、平均执行时间
- **Agent**: 总数、活跃数、响应时间
- **收入**: 总收入、日收入、ARPU

### 2. 实时仪表盘

- **健康总览**: 系统整体健康状态和评分
- **指标卡片**: 关键指标的实时展示
- **时序图表**: 使用 Recharts 绘制的动态图表
- **热力图**: 性能热点分析（可扩展）

### 3. 智能告警

#### 告警类型
- **阈值告警**: 基于固定阈值触发
- **趋势告警**: 基于变化趋势触发
- **异常检测**: 基于统计分析自动检测异常

#### 告警级别
- INFO: 信息通知
- WARNING: 警告
- ERROR: 错误
- CRITICAL: 严重

#### 通知渠道
- Desktop: 桌面通知
- Email: 邮件通知
- Slack: Slack 集成
- Webhook: 自定义 Webhook
- SMS: 短信通知（可配置）

### 4. 日志聚合

- **集中收集**: 自动捕获控制台日志
- **实时搜索**: 全文搜索和过滤
- **多级别**: TRACE/DEBUG/INFO/WARN/ERROR/FATAL
- **元数据**: 支持标签、追踪 ID、堆栈跟踪
- **导出**: CSV/JSON 格式导出

### 5. 分布式追踪

- **Trace 追踪**: 完整的请求调用链
- **Span 管理**: 细粒度操作追踪
- **性能分析**: 瓶颈识别和关键路径分析
- **慢查询**: 数据库慢查询监控
- **服务依赖**: 服务间依赖关系图

## 架构设计

```
src/services/monitoring/
├── types.ts                 # 类型定义
├── metricsCollector.ts      # 指标收集器
├── alertManager.ts          # 告警管理器
├── logAggregator.ts         # 日志聚合器
├── tracing.ts               # 分布式追踪
├── healthCheck.ts           # 健康检查
└── index.ts                 # 主入口

src/components/monitoring/
├── MonitoringDashboard.tsx  # 主仪表盘
├── HealthWidget.tsx         # 健康状态组件
├── MetricsChart.tsx         # 指标图表
├── MetricsGrid.tsx          # 指标网格
├── AlertsPanel.tsx          # 告警面板
├── LogViewer.tsx            # 日志查看器
├── TracingView.tsx          # 追踪视图
└── index.ts                 # 组件导出

backend/src/monitoring/
├── monitoringController.ts  # REST API 控制器
├── monitoringService.ts     # 业务逻辑服务
└── routes.ts                # 路由定义
```

## 快速开始

### 1. 初始化监控系统

```typescript
import { monitoringManager } from '@/services/monitoring';

// 初始化
await monitoringManager.initialize({
  enabled: true,
  collectInterval: 5000,  // 5秒采集一次
  retentionDays: 7,       // 保留7天数据
  alerts: {
    enabled: true,
    checkInterval: 10000  // 10秒检查一次
  }
});

// 启动监控
monitoringManager.start();
```

### 2. 使用仪表盘组件

```tsx
import { MonitoringDashboard } from '@/components/monitoring';

function App() {
  return (
    <MonitoringDashboard
      autoRefresh={true}
      refreshInterval={5000}
    />
  );
}
```

### 3. 自定义指标收集

```typescript
import { metricsCollector, MetricType, MetricCategory } from '@/services/monitoring';

// 注册自定义指标
metricsCollector.registerMetric(
  'custom.metric.name',
  MetricType.GAUGE,
  MetricCategory.CUSTOM,
  {
    unit: 'ms',
    description: 'Custom metric description'
  }
);

// 记录指标值
metricsCollector.record('custom.metric.name', 42);

// 增加计数器
metricsCollector.increment('custom.counter', 1);
```

### 4. 创建告警规则

```typescript
import { alertManager, AlertLevel, NotificationChannel } from '@/services/monitoring';

// 创建告警规则
alertManager.createRule(
  'High Custom Metric',
  'custom.metric.name',
  {
    type: 'threshold',
    operator: '>',
    threshold: 100,
    duration: 60  // 持续60秒
  },
  AlertLevel.WARNING,
  [NotificationChannel.DESKTOP, NotificationChannel.EMAIL]
);
```

### 5. 记录日志

```typescript
import { logAggregator } from '@/services/monitoring';

// 记录不同级别的日志
logAggregator.info('Application started', 'app', {
  tags: { version: '1.0.0' }
});

logAggregator.error('Failed to process request', 'api', {
  tags: { endpoint: '/api/users' },
  metadata: { error: 'Connection timeout' },
  stackTrace: new Error().stack
});
```

### 6. 分布式追踪

```typescript
import { tracingService } from '@/services/monitoring';

// 开始追踪
const traceId = tracingService.startTrace('user-request');

// 创建 Span
const spanId = tracingService.startSpan('database-query', traceId);

// 执行操作...

// 结束 Span
tracingService.finishSpan(spanId, {
  status: 'ok',
  tags: { database: 'postgres', table: 'users' }
});

// 结束追踪
tracingService.finishTrace(traceId);
```

## API 参考

### REST API 端点

#### 指标
- `GET /api/monitoring/metrics/system` - 获取系统指标
- `GET /api/monitoring/metrics/application` - 获取应用指标
- `GET /api/monitoring/metrics/business` - 获取业务指标

#### 健康检查
- `GET /api/monitoring/health` - 获取健康状态

#### 告警
- `GET /api/monitoring/alerts/rules` - 获取告警规则
- `POST /api/monitoring/alerts/rules` - 创建告警规则
- `PUT /api/monitoring/alerts/rules/:id` - 更新告警规则
- `DELETE /api/monitoring/alerts/rules/:id` - 删除告警规则
- `GET /api/monitoring/alerts/events` - 获取告警事件
- `POST /api/monitoring/alerts/events/:id/acknowledge` - 确认告警
- `POST /api/monitoring/alerts/events/:id/resolve` - 解决告警

#### 日志
- `POST /api/monitoring/logs/query` - 查询日志

#### 追踪
- `GET /api/monitoring/traces` - 获取追踪列表
- `GET /api/monitoring/traces/:id` - 获取追踪详情
- `GET /api/monitoring/traces/slow-queries` - 获取慢查询

#### 报告
- `POST /api/monitoring/reports` - 生成监控报告
- `GET /api/monitoring/statistics` - 获取统计信息

## 配置

### 监控配置

```typescript
interface MonitoringConfig {
  enabled: boolean;
  collectInterval: number;      // 采集间隔（毫秒）
  retentionDays: number;         // 数据保留天数
  sampling: {
    enabled: boolean;
    rate: number;                // 采样率（0-1）
  };
  alerts: {
    enabled: boolean;
    checkInterval: number;       // 检查间隔（毫秒）
  };
  logging: {
    enabled: boolean;
    level: LogLevel;
    maxSize: number;             // 最大日志大小
  };
  tracing: {
    enabled: boolean;
    samplingRate: number;        // 追踪采样率（0-1）
  };
}
```

### 告警规则配置

参见 `alert-rules-examples.json` 文件，包含：
- 15+ 预定义告警规则
- 通知渠道配置
- 升级策略
- 维护窗口
- 告警分组

## 性能优化

### 采样
- 指标采样：减少高频指标的存储开销
- 追踪采样：控制追踪数据的收集比例

### 数据保留
- 自动清理过期数据
- 可配置的保留策略
- 按优先级保留重要数据

### 缓冲机制
- 日志缓冲：批量写入减少 I/O
- 指标缓冲：定期刷新减少计算

## 最佳实践

### 1. 指标命名
使用层级化命名：`category.subcategory.metric_name`
```
system.cpu.usage
app.requests.rate
business.users.active
```

### 2. 告警阈值
- 基于历史数据设置合理阈值
- 使用趋势告警检测异常变化
- 设置适当的冷却时间避免告警风暴

### 3. 日志记录
- 使用结构化日志
- 添加上下文标签
- 关联追踪 ID

### 4. 追踪使用
- 为关键操作创建 Span
- 记录重要的标签和日志
- 注意追踪开销

## 故障排查

### 监控系统未启动
```typescript
// 检查状态
const status = monitoringManager.getStatus();
console.log('Is running:', status.isRunning);

// 手动启动
monitoringManager.start();
```

### 指标未更新
```typescript
// 检查收集器状态
const metrics = metricsCollector.getAllMetrics();
console.log('Total metrics:', metrics.length);

// 手动触发收集
await metricsCollector.collectSystemMetrics();
```

### 告警未触发
```typescript
// 检查规则配置
const rules = alertManager.getActiveRules();
console.log('Active rules:', rules.length);

// 检查告警历史
const events = alertManager.getAllEvents();
console.log('Alert events:', events.length);
```

## 扩展开发

### 自定义指标收集器

```typescript
metricsCollector.registerCollector('custom.metric', async () => {
  // 实现自定义收集逻辑
  const value = await fetchCustomMetric();
  return value;
});
```

### 自定义通知渠道

```typescript
alertManager.registerNotificationHandler(
  'custom-channel' as any,
  async (event) => {
    // 实现自定义通知逻辑
    await sendNotification(event);
  }
);
```

### 自定义健康检查

```typescript
healthCheckService.registerCheck({
  name: 'custom-check',
  check: async () => {
    // 实现自定义检查逻辑
    const healthy = await checkCustomService();
    return {
      name: 'custom-check',
      status: healthy ? 'pass' : 'fail',
      message: 'Custom service status',
      timestamp: Date.now()
    };
  },
  weight: 1,
  critical: false
});
```

## 代码统计

### 前端服务层 (~2,600行)
- types.ts: ~400行
- metricsCollector.ts: ~600行
- alertManager.ts: ~650行
- logAggregator.ts: ~500行
- tracing.ts: ~400行
- healthCheck.ts: ~350行
- index.ts: ~200行

### 前端组件层 (~2,400行)
- MonitoringDashboard.tsx: ~400行
- HealthWidget.tsx: ~300行
- MetricsChart.tsx: ~200行
- MetricsGrid.tsx: ~350行
- AlertsPanel.tsx: ~550行
- LogViewer.tsx: ~400行
- TracingView.tsx: ~450行

### 后端 API 层 (~1,450行)
- monitoringController.ts: ~400行
- monitoringService.ts: ~900行
- routes.ts: ~150行

**总计: ~6,450行代码**

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 支持

如有问题，请联系开发团队或查看项目文档。
