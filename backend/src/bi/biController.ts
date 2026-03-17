import { Request, Response } from 'express';
import { BiService } from './biService';
import { BiQueryService } from './biQueryService';
import { BiExportService } from './biExportService';

/**
 * BI Controller - 处理所有BI相关的HTTP请求
 */
export class BiController {
  private biService: BiService;
  private queryService: BiQueryService;
  private exportService: BiExportService;

  constructor() {
    this.biService = new BiService();
    this.queryService = new BiQueryService();
    this.exportService = new BiExportService();
  }

  /**
   * 获取仪表盘数据
   */
  getDashboard = async (req: Request, res: Response) => {
    try {
      const { dashboardId } = req.params;
      const { startDate, endDate, filters } = req.query;

      const dashboard = await this.biService.getDashboard(dashboardId, {
        startDate: startDate as string,
        endDate: endDate as string,
        filters: filters ? JSON.parse(filters as string) : {}
      });

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 创建自定义仪表盘
   */
  createDashboard = async (req: Request, res: Response) => {
    try {
      const { name, description, layout, widgets } = req.body;
      const userId = req.user?.id;

      const dashboard = await this.biService.createDashboard({
        name,
        description,
        layout,
        widgets,
        userId
      });

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 更新仪表盘
   */
  updateDashboard = async (req: Request, res: Response) => {
    try {
      const { dashboardId } = req.params;
      const updates = req.body;

      const dashboard = await this.biService.updateDashboard(dashboardId, updates);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 删除仪表盘
   */
  deleteDashboard = async (req: Request, res: Response) => {
    try {
      const { dashboardId } = req.params;

      await this.biService.deleteDashboard(dashboardId);

      res.json({
        success: true,
        message: 'Dashboard deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 执行多维数据查询
   */
  executeQuery = async (req: Request, res: Response) => {
    try {
      const { dimensions, metrics, filters, timeRange, groupBy, orderBy, limit } = req.body;

      const result = await this.queryService.executeQuery({
        dimensions,
        metrics,
        filters,
        timeRange,
        groupBy,
        orderBy,
        limit
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 数据切片（Slice）
   */
  sliceData = async (req: Request, res: Response) => {
    try {
      const { dimension, value, metrics } = req.body;

      const result = await this.queryService.slice(dimension, value, metrics);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 数据切块（Dice）
   */
  diceData = async (req: Request, res: Response) => {
    try {
      const { dimensions, values, metrics } = req.body;

      const result = await this.queryService.dice(dimensions, values, metrics);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 上钻（Roll-up）
   */
  rollUp = async (req: Request, res: Response) => {
    try {
      const { dimension, aggregation, metrics } = req.body;

      const result = await this.queryService.rollUp(dimension, aggregation, metrics);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 下钻（Drill-down）
   */
  drillDown = async (req: Request, res: Response) => {
    try {
      const { dimension, value, childDimension, metrics } = req.body;

      const result = await this.queryService.drillDown(dimension, value, childDimension, metrics);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 获取实时数据流
   */
  getRealtimeData = async (req: Request, res: Response) => {
    try {
      const { metrics, interval } = req.query;

      const stream = await this.biService.getRealtimeStream(
        (metrics as string).split(','),
        parseInt(interval as string) || 5000
      );

      res.json({
        success: true,
        data: stream
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 时间序列预测
   */
  forecast = async (req: Request, res: Response) => {
    try {
      const { metric, periods, method } = req.body;

      const forecast = await this.biService.forecast(metric, periods, method);

      res.json({
        success: true,
        data: forecast
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 趋势分析
   */
  analyzeTrend = async (req: Request, res: Response) => {
    try {
      const { metric, timeRange } = req.body;

      const trend = await this.biService.analyzeTrend(metric, timeRange);

      res.json({
        success: true,
        data: trend
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 生成报表
   */
  generateReport = async (req: Request, res: Response) => {
    try {
      const { dashboardId, format, schedule } = req.body;

      const report = await this.exportService.generateReport({
        dashboardId,
        format,
        schedule
      });

      res.json({
        success: true,
        data: report
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 导出数据
   */
  exportData = async (req: Request, res: Response) => {
    try {
      const { format, data, options } = req.body;

      const file = await this.exportService.export(format, data, options);

      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
      res.send(file.buffer);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 创建定时报表
   */
  scheduleReport = async (req: Request, res: Response) => {
    try {
      const { dashboardId, schedule, recipients, format } = req.body;

      const scheduledReport = await this.exportService.scheduleReport({
        dashboardId,
        schedule,
        recipients,
        format
      });

      res.json({
        success: true,
        data: scheduledReport
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 获取可用的图表类型
   */
  getChartTypes = async (req: Request, res: Response) => {
    try {
      const chartTypes = this.biService.getAvailableChartTypes();

      res.json({
        success: true,
        data: chartTypes
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 获取仪表盘模板
   */
  getTemplates = async (req: Request, res: Response) => {
    try {
      const templates = await this.biService.getTemplates();

      res.json({
        success: true,
        data: templates
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 应用仪表盘模板
   */
  applyTemplate = async (req: Request, res: Response) => {
    try {
      const { templateId, customizations } = req.body;
      const userId = req.user?.id;

      const dashboard = await this.biService.applyTemplate(templateId, customizations, userId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 获取Widget配置
   */
  getWidgetConfig = async (req: Request, res: Response) => {
    try {
      const { widgetType } = req.params;

      const config = this.biService.getWidgetConfig(widgetType);

      res.json({
        success: true,
        data: config
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 获取数据源列表
   */
  getDataSources = async (req: Request, res: Response) => {
    try {
      const dataSources = await this.biService.getDataSources();

      res.json({
        success: true,
        data: dataSources
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 测试数据连接
   */
  testConnection = async (req: Request, res: Response) => {
    try {
      const { dataSourceId } = req.body;

      const result = await this.biService.testDataConnection(dataSourceId);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
}

export default new BiController();
