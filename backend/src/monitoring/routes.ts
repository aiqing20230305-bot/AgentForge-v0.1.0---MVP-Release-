/**
 * 监控路由
 * 定义监控相关的API路由
 */

import { Router } from 'express';
import monitoringController from './monitoringController';

const router = Router();

// 系统指标
router.get('/metrics/system', (req, res) =>
  monitoringController.getSystemMetrics(req, res)
);

// 应用指标
router.get('/metrics/application', (req, res) =>
  monitoringController.getApplicationMetrics(req, res)
);

// 业务指标
router.get('/metrics/business', (req, res) =>
  monitoringController.getBusinessMetrics(req, res)
);

// 健康状态
router.get('/health', (req, res) =>
  monitoringController.getHealthStatus(req, res)
);

// 告警规则
router.get('/alerts/rules', (req, res) =>
  monitoringController.getAlertRules(req, res)
);

router.post('/alerts/rules', (req, res) =>
  monitoringController.createAlertRule(req, res)
);

router.put('/alerts/rules/:id', (req, res) =>
  monitoringController.updateAlertRule(req, res)
);

router.delete('/alerts/rules/:id', (req, res) =>
  monitoringController.deleteAlertRule(req, res)
);

// 告警事件
router.get('/alerts/events', (req, res) =>
  monitoringController.getAlertEvents(req, res)
);

router.post('/alerts/events/:id/acknowledge', (req, res) =>
  monitoringController.acknowledgeAlert(req, res)
);

router.post('/alerts/events/:id/resolve', (req, res) =>
  monitoringController.resolveAlert(req, res)
);

// 日志
router.post('/logs/query', (req, res) =>
  monitoringController.queryLogs(req, res)
);

// 追踪
router.get('/traces', (req, res) =>
  monitoringController.getTraces(req, res)
);

router.get('/traces/:id', (req, res) =>
  monitoringController.getTraceDetail(req, res)
);

router.get('/traces/slow-queries', (req, res) =>
  monitoringController.getSlowQueries(req, res)
);

// 报告
router.post('/reports', (req, res) =>
  monitoringController.generateReport(req, res)
);

// 统计
router.get('/statistics', (req, res) =>
  monitoringController.getStatistics(req, res)
);

export default router;
