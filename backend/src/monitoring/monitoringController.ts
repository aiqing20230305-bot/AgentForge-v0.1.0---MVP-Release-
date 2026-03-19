/**
 * 监控控制器
 * 提供监控数据的REST API接口
 */

import { Request, Response } from 'express';
import { MonitoringService } from './monitoringService';

const monitoringService = new MonitoringService();

export class MonitoringController {
  /**
   * 获取系统指标
   */
  async getSystemMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await monitoringService.getSystemMetrics();
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 获取应用指标
   */
  async getApplicationMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await monitoringService.getApplicationMetrics();
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 获取业务指标
   */
  async getBusinessMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await monitoringService.getBusinessMetrics();
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 获取健康状态
   */
  async getHealthStatus(req: Request, res: Response): Promise<void> {
    try {
      const health = await monitoringService.getHealthStatus();
      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 获取告警规则
   */
  async getAlertRules(req: Request, res: Response): Promise<void> {
    try {
      const rules = await monitoringService.getAlertRules();
      res.json({
        success: true,
        data: rules
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 创建告警规则
   */
  async createAlertRule(req: Request, res: Response): Promise<void> {
    try {
      const rule = await monitoringService.createAlertRule(req.body);
      res.json({
        success: true,
        data: rule
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 更新告警规则
   */
  async updateAlertRule(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const rule = await monitoringService.updateAlertRule(id, req.body);
      res.json({
        success: true,
        data: rule
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 删除告警规则
   */
  async deleteAlertRule(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await monitoringService.deleteAlertRule(id);
      res.json({
        success: true
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 获取告警事件
   */
  async getAlertEvents(req: Request, res: Response): Promise<void> {
    try {
      const { level, status, limit } = req.query;
      const events = await monitoringService.getAlertEvents({
        level: level as any,
        status: status as any,
        limit: limit ? parseInt(limit as string) : undefined
      });
      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 确认告警
   */
  async acknowledgeAlert(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { acknowledgedBy } = req.body;
      await monitoringService.acknowledgeAlert(id, acknowledgedBy);
      res.json({
        success: true
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 解决告警
   */
  async resolveAlert(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { resolvedBy } = req.body;
      await monitoringService.resolveAlert(id, resolvedBy);
      res.json({
        success: true
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 查询日志
   */
  async queryLogs(req: Request, res: Response): Promise<void> {
    try {
      const logs = await monitoringService.queryLogs(req.body);
      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 获取追踪列表
   */
  async getTraces(req: Request, res: Response): Promise<void> {
    try {
      const { startTime, endTime, limit } = req.query;
      const traces = await monitoringService.getTraces({
        startTime: startTime ? parseInt(startTime as string) : undefined,
        endTime: endTime ? parseInt(endTime as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      });
      res.json({
        success: true,
        data: traces
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 获取追踪详情
   */
  async getTraceDetail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const trace = await monitoringService.getTraceDetail(id);
      res.json({
        success: true,
        data: trace
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 获取慢查询
   */
  async getSlowQueries(req: Request, res: Response): Promise<void> {
    try {
      const { limit } = req.query;
      const queries = await monitoringService.getSlowQueries(
        limit ? parseInt(limit as string) : 100
      );
      res.json({
        success: true,
        data: queries
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 生成监控报告
   */
  async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const { name, startTime, endTime } = req.body;
      const report = await monitoringService.generateReport(
        name,
        startTime,
        endTime
      );
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 获取监控统计
   */
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { startTime, endTime } = req.query;
      const stats = await monitoringService.getStatistics(
        parseInt(startTime as string),
        parseInt(endTime as string)
      );
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new MonitoringController();
