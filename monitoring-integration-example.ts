/**
 * 监控系统集成示例
 * 演示如何在实际应用中集成和使用监控系统
 */

import {
  monitoringManager,
  metricsCollector,
  alertManager,
  logAggregator,
  tracingService,
  healthCheckService,
  MetricType,
  MetricCategory,
  AlertLevel,
  NotificationChannel,
  LogLevel
} from './src/services/monitoring';

/**
 * 示例 1: 初始化和启动监控系统
 */
async function example1_InitializeMonitoring() {
  console.log('=== Example 1: Initialize Monitoring ===\n');

  // 初始化监控系统
  await monitoringManager.initialize({
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
      level: LogLevel.INFO,
      maxSize: 100 * 1024 * 1024
    },
    tracing: {
      enabled: true,
      samplingRate: 1.0
    }
  });

  // 启动监控
  monitoringManager.start();

  // 获取状态
  const status = monitoringManager.getStatus();
  console.log('Monitoring Status:', status);
  console.log('\n');
}

/**
 * 示例 2: 自定义指标收集
 */
function example2_CustomMetrics() {
  console.log('=== Example 2: Custom Metrics ===\n');

  // 注册自定义指标
  metricsCollector.registerMetric(
    'app.custom.active_connections',
    MetricType.GAUGE,
    MetricCategory.APPLICATION,
    {
      unit: 'connections',
      description: 'Number of active connections'
    }
  );

  // 模拟记录指标数据
  setInterval(() => {
    const connections = Math.floor(Math.random() * 100);
    metricsCollector.record('app.custom.active_connections', connections);
    console.log(`Active connections: ${connections}`);
  }, 2000);

  // 订阅指标更新
  metricsCollector.subscribe((metrics) => {
    const metric = metrics.find(m => m.name === 'app.custom.active_connections');
    if (metric) {
      console.log(`Metric updated: ${metric.name} = ${metric.value}`);
    }
  });

  console.log('Custom metric registered and collecting...\n');
}

/**
 * 示例 3: 创建和管理告警规则
 */
function example3_AlertRules() {
  console.log('=== Example 3: Alert Rules ===\n');

  // 创建高 CPU 使用率告警
  const cpuRule = alertManager.createRule(
    'High CPU Usage Alert',
    'system.cpu.usage',
    {
      type: 'threshold',
      operator: '>',
      threshold: 80,
      duration: 60
    },
    AlertLevel.WARNING,
    [NotificationChannel.DESKTOP],
    {
      description: 'Alerts when CPU usage exceeds 80% for more than 1 minute',
      cooldown: 300,
      tags: { category: 'system', priority: 'high' }
    }
  );

  console.log('Created CPU alert rule:', cpuRule);

  // 创建错误率告警
  const errorRule = alertManager.createRule(
    'High Error Rate Alert',
    'app.errors.rate',
    {
      type: 'threshold',
      operator: '>',
      threshold: 5,
      duration: 30
    },
    AlertLevel.ERROR,
    [NotificationChannel.DESKTOP, NotificationChannel.EMAIL],
    {
      description: 'Alerts when error rate exceeds 5%',
      cooldown: 180
    }
  );

  console.log('Created error rate alert rule:', errorRule);

  // 订阅告警事件
  alertManager.subscribe((event) => {
    console.log('\n🚨 Alert Triggered:', {
      rule: event.ruleName,
      level: event.level,
      message: event.message,
      time: new Date(event.triggeredAt).toISOString()
    });
  });

  console.log('\nAlert rules configured and monitoring...\n');
}

/**
 * 示例 4: 日志记录和查询
 */
function example4_Logging() {
  console.log('=== Example 4: Logging ===\n');

  // 记录不同级别的日志
  logAggregator.info('Application started successfully', 'app', {
    tags: { version: '1.0.0', environment: 'production' }
  });

  logAggregator.warn('High memory usage detected', 'system', {
    tags: { component: 'memory-monitor' },
    metadata: { usage: 85.5, threshold: 80 }
  });

  logAggregator.error('Failed to connect to database', 'database', {
    tags: { database: 'postgres', host: 'localhost' },
    metadata: { error: 'Connection timeout', retries: 3 },
    stackTrace: new Error().stack
  });

  // 查询日志
  setTimeout(() => {
    const recentLogs = logAggregator.getRecentLogs(10);
    console.log('\nRecent Logs:');
    recentLogs.forEach(log => {
      console.log(`[${log.level.toUpperCase()}] ${log.source}: ${log.message}`);
    });

    // 搜索特定日志
    const errorLogs = logAggregator.search('error', { limit: 5 });
    console.log('\nError Logs:', errorLogs.length);

    // 统计信息
    const stats = logAggregator.getStats();
    console.log('\nLog Statistics:', stats);
  }, 1000);

  console.log('Logging examples executed...\n');
}

/**
 * 示例 5: 分布式追踪
 */
async function example5_DistributedTracing() {
  console.log('=== Example 5: Distributed Tracing ===\n');

  // 模拟一个完整的请求追踪
  async function handleUserRequest() {
    // 开始追踪
    const traceId = tracingService.startTrace('user-request');
    console.log(`Started trace: ${traceId}`);

    try {
      // Span 1: 验证用户
      const authSpanId = tracingService.startSpan('authenticate-user', traceId);
      await simulateAsyncOperation(50);
      tracingService.setSpanTag(authSpanId, 'userId', '12345');
      tracingService.finishSpan(authSpanId, { status: 'ok' });

      // Span 2: 查询数据库
      const dbSpanId = tracingService.startSpan('database-query', traceId, authSpanId);
      await simulateAsyncOperation(150);
      tracingService.setSpanTag(dbSpanId, 'database', 'postgres');
      tracingService.setSpanTag(dbSpanId, 'query', 'SELECT * FROM users');

      // 记录慢查询
      tracingService.recordSlowQuery(
        'SELECT * FROM users WHERE id = $1',
        1200,
        'postgres',
        { table: 'users', traceId }
      );

      tracingService.finishSpan(dbSpanId, { status: 'ok' });

      // Span 3: 处理业务逻辑
      const businessSpanId = tracingService.startSpan('business-logic', traceId, authSpanId);
      await simulateAsyncOperation(80);
      tracingService.finishSpan(businessSpanId, { status: 'ok' });

      // Span 4: 渲染响应
      const renderSpanId = tracingService.startSpan('render-response', traceId);
      await simulateAsyncOperation(30);
      tracingService.finishSpan(renderSpanId, { status: 'ok' });

    } catch (error) {
      console.error('Request failed:', error);
    } finally {
      // 结束追踪
      tracingService.finishTrace(traceId);
    }
  }

  // 执行多个请求
  await Promise.all([
    handleUserRequest(),
    handleUserRequest(),
    handleUserRequest()
  ]);

  // 查询追踪信息
  setTimeout(() => {
    const traces = tracingService.getAllTraces();
    console.log(`\nTotal traces: ${traces.length}`);

    const slowTraces = tracingService.getSlowTraces(200, 5);
    console.log(`Slow traces (>200ms): ${slowTraces.length}`);

    if (slowTraces.length > 0) {
      const trace = slowTraces[0];
      console.log('\nSlowest trace:', {
        traceId: trace.traceId,
        duration: trace.duration,
        spans: trace.spans.length,
        errors: trace.errorCount
      });

      // 分析瓶颈
      const bottlenecks = tracingService.analyzeBottlenecks(trace.traceId);
      console.log('Bottleneck analysis:', {
        slowestSpan: bottlenecks.slowestSpan?.operationName,
        slowestDuration: bottlenecks.slowestSpan?.duration
      });
    }

    // 慢查询
    const slowQueries = tracingService.getSlowQueries(10);
    console.log(`\nSlow queries: ${slowQueries.length}`);
  }, 500);

  console.log('\nTracing examples executed...\n');
}

/**
 * 示例 6: 健康检查
 */
async function example6_HealthCheck() {
  console.log('=== Example 6: Health Check ===\n');

  // 执行健康检查
  const health = await healthCheckService.performHealthCheck();
  console.log('Health Status:', {
    status: health.status,
    score: health.score,
    lastUpdate: new Date(health.lastUpdate).toISOString()
  });

  console.log('\nHealth Checks:');
  health.checks.forEach(check => {
    console.log(`  ${check.name}: ${check.status} - ${check.message}`);
  });

  // 获取建议
  const recommendations = healthCheckService.getRecommendations();
  if (recommendations.length > 0) {
    console.log('\nRecommendations:');
    recommendations.forEach(rec => console.log(`  - ${rec}`));
  }

  // 订阅健康状态更新
  healthCheckService.subscribe((status) => {
    console.log('\n📊 Health status updated:', {
      status: status.status,
      score: status.score
    });
  });

  console.log('\nHealth check completed...\n');
}

/**
 * 示例 7: 生成监控报告
 */
async function example7_GenerateReport() {
  console.log('=== Example 7: Generate Report ===\n');

  const endTime = Date.now();
  const startTime = endTime - (60 * 60 * 1000); // 过去1小时

  const report = await monitoringManager.generateReport(
    'Hourly Performance Report',
    startTime,
    endTime
  );

  console.log('Report generated:', {
    name: report.name,
    totalMetrics: report.summary.totalMetrics,
    alerts: report.summary.alerts,
    incidents: report.summary.incidents,
    avgHealthScore: report.summary.avgHealthScore,
    generatedAt: new Date(report.generatedAt).toISOString()
  });

  if (report.recommendations.length > 0) {
    console.log('\nRecommendations:');
    report.recommendations.forEach(rec => console.log(`  - ${rec}`));
  }

  console.log('\nReport generation completed...\n');
}

/**
 * 示例 8: 监控数据导出和导入
 */
function example8_DataExportImport() {
  console.log('=== Example 8: Data Export/Import ===\n');

  // 导出所有监控数据
  const exportData = monitoringManager.exportData();
  console.log('Exported data:', {
    metricsCount: Object.keys(exportData.metrics).length,
    alertRules: exportData.alerts?.rules?.length || 0,
    alertEvents: exportData.alerts?.events?.length || 0,
    traces: exportData.traces?.traces?.length || 0
  });

  // 保存到文件（实际应用中）
  // fs.writeFileSync('monitoring-data.json', JSON.stringify(exportData, null, 2));

  // 导入数据（模拟）
  // const importData = JSON.parse(fs.readFileSync('monitoring-data.json', 'utf8'));
  // monitoringManager.importData(importData);

  console.log('Data export/import demonstrated...\n');
}

/**
 * 辅助函数：模拟异步操作
 */
function simulateAsyncOperation(duration: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, duration));
}

/**
 * 主函数：运行所有示例
 */
async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Monitoring System Integration Demo   ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    // 运行示例
    await example1_InitializeMonitoring();
    await new Promise(resolve => setTimeout(resolve, 1000));

    example2_CustomMetrics();
    await new Promise(resolve => setTimeout(resolve, 2000));

    example3_AlertRules();
    await new Promise(resolve => setTimeout(resolve, 2000));

    example4_Logging();
    await new Promise(resolve => setTimeout(resolve, 2000));

    await example5_DistributedTracing();
    await new Promise(resolve => setTimeout(resolve, 2000));

    await example6_HealthCheck();
    await new Promise(resolve => setTimeout(resolve, 2000));

    await example7_GenerateReport();
    await new Promise(resolve => setTimeout(resolve, 1000));

    example8_DataExportImport();

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  All Examples Completed Successfully!  ║');
    console.log('╚════════════════════════════════════════╝\n');

    // 显示最终状态
    const finalStatus = monitoringManager.getStatus();
    console.log('Final Monitoring Status:', finalStatus);

  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// 运行示例（如果直接执行此文件）
if (require.main === module) {
  main().catch(console.error);
}

// 导出示例函数供其他模块使用
export {
  example1_InitializeMonitoring,
  example2_CustomMetrics,
  example3_AlertRules,
  example4_Logging,
  example5_DistributedTracing,
  example6_HealthCheck,
  example7_GenerateReport,
  example8_DataExportImport
};
