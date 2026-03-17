/**
 * BI Data Service - 数据获取和管理服务
 */

import { BiEngine } from './biEngine';

export interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'file' | 'database' | 'realtime';
  config: any;
  status: 'active' | 'inactive' | 'error';
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  layout: any;
  widgets: Widget[];
  filters: any;
  refresh: number; // 刷新间隔（秒）
}

export interface Widget {
  id: string;
  type: string;
  title: string;
  dataSource: string;
  query: any;
  config: any;
  position: { x: number; y: number };
  size: { w: number; h: number };
}

class BiDataService {
  private engine: BiEngine;
  private dataSources: Map<string, DataSource> = new Map();
  private dashboards: Map<string, Dashboard> = new Map();
  private dataCache: Map<string, any> = new Map();
  private realtimeConnections: Map<string, WebSocket> = new Map();

  constructor() {
    this.engine = new BiEngine();
    this.initializeDefaultDataSources();
  }

  /**
   * 初始化默认数据源
   */
  private initializeDefaultDataSources() {
    const defaultSources: DataSource[] = [
      {
        id: 'agents',
        name: 'Agent Data',
        type: 'api',
        config: { endpoint: '/api/agents' },
        status: 'active'
      },
      {
        id: 'tasks',
        name: 'Task Data',
        type: 'api',
        config: { endpoint: '/api/tasks' },
        status: 'active'
      },
      {
        id: 'performance',
        name: 'Performance Metrics',
        type: 'api',
        config: { endpoint: '/api/metrics' },
        status: 'active'
      }
    ];

    defaultSources.forEach(source => {
      this.dataSources.set(source.id, source);
    });
  }

  /**
   * 获取数据源
   */
  async getDataSource(id: string): Promise<DataSource | undefined> {
    return this.dataSources.get(id);
  }

  /**
   * 获取所有数据源
   */
  async getAllDataSources(): Promise<DataSource[]> {
    return Array.from(this.dataSources.values());
  }

  /**
   * 添加数据源
   */
  async addDataSource(source: DataSource): Promise<void> {
    this.dataSources.set(source.id, source);
  }

  /**
   * 从数据源获取数据
   */
  async fetchData(dataSourceId: string, query?: any): Promise<any[]> {
    const cacheKey = `${dataSourceId}_${JSON.stringify(query)}`;

    // 检查缓存
    if (this.dataCache.has(cacheKey)) {
      return this.dataCache.get(cacheKey);
    }

    const source = this.dataSources.get(dataSourceId);

    if (!source) {
      throw new Error(`Data source ${dataSourceId} not found`);
    }

    let data: any[] = [];

    switch (source.type) {
      case 'api':
        data = await this.fetchFromApi(source, query);
        break;
      case 'file':
        data = await this.fetchFromFile(source);
        break;
      case 'realtime':
        data = await this.fetchFromRealtime(source);
        break;
      default:
        data = this.generateMockData();
    }

    // 应用查询
    if (query) {
      data = this.engine.query(data, query);
    }

    // 缓存数据（5分钟）
    this.dataCache.set(cacheKey, data);
    setTimeout(() => this.dataCache.delete(cacheKey), 5 * 60 * 1000);

    return data;
  }

  /**
   * 从API获取数据
   */
  private async fetchFromApi(source: DataSource, query?: any): Promise<any[]> {
    try {
      const url = new URL(source.config.endpoint, window.location.origin);

      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      const response = await fetch(url.toString(), {
        headers: source.config.headers || {}
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Failed to fetch from API:', error);
      return this.generateMockData(); // 返回模拟数据
    }
  }

  /**
   * 从文件获取数据
   */
  private async fetchFromFile(source: DataSource): Promise<any[]> {
    // 实现文件数据读取
    return [];
  }

  /**
   * 从实时源获取数据
   */
  private async fetchFromRealtime(source: DataSource): Promise<any[]> {
    // 实现实时数据流
    return [];
  }

  /**
   * 生成模拟数据
   */
  private generateMockData(): any[] {
    const data = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (let i = 30; i >= 0; i--) {
      data.push({
        date: new Date(now - i * dayMs).toISOString().split('T')[0],
        value: Math.floor(Math.random() * 100) + 50,
        category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        region: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)]
      });
    }

    return data;
  }

  /**
   * 创建仪表盘
   */
  async createDashboard(dashboard: Omit<Dashboard, 'id'>): Promise<Dashboard> {
    const id = `dashboard_${Date.now()}`;
    const newDashboard = { ...dashboard, id };
    this.dashboards.set(id, newDashboard);
    return newDashboard;
  }

  /**
   * 获取仪表盘
   */
  async getDashboard(id: string): Promise<Dashboard | undefined> {
    return this.dashboards.get(id);
  }

  /**
   * 获取所有仪表盘
   */
  async getAllDashboards(): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values());
  }

  /**
   * 更新仪表盘
   */
  async updateDashboard(id: string, updates: Partial<Dashboard>): Promise<Dashboard> {
    const dashboard = this.dashboards.get(id);

    if (!dashboard) {
      throw new Error(`Dashboard ${id} not found`);
    }

    const updated = { ...dashboard, ...updates };
    this.dashboards.set(id, updated);
    return updated;
  }

  /**
   * 删除仪表盘
   */
  async deleteDashboard(id: string): Promise<void> {
    this.dashboards.delete(id);
  }

  /**
   * 获取Widget数据
   */
  async getWidgetData(widget: Widget): Promise<any> {
    const data = await this.fetchData(widget.dataSource, widget.query);

    // 根据Widget类型处理数据
    return this.processDataForWidget(data, widget);
  }

  /**
   * 为Widget处理数据
   */
  private processDataForWidget(data: any[], widget: Widget): any {
    switch (widget.type) {
      case 'kpi':
        return this.processKPIData(data, widget.config);
      case 'line':
      case 'area':
        return this.processTimeSeriesData(data, widget.config);
      case 'bar':
      case 'column':
        return this.processCategoryData(data, widget.config);
      case 'pie':
      case 'donut':
        return this.processDistributionData(data, widget.config);
      case 'scatter':
        return this.processScatterData(data, widget.config);
      case 'heatmap':
        return this.processHeatmapData(data, widget.config);
      case 'table':
        return data;
      default:
        return data;
    }
  }

  /**
   * 处理KPI数据
   */
  private processKPIData(data: any[], config: any): any {
    const valueField = config.valueField || 'value';
    const current = this.engine.aggregate(
      data.map(d => d[valueField]),
      config.aggregation || 'sum'
    );

    // 计算变化
    const previous = config.previous || current * 0.9;
    const change = current - previous;
    const changePercent = (change / previous) * 100;

    return {
      value: current,
      previous,
      change,
      changePercent,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      format: config.format || 'number'
    };
  }

  /**
   * 处理时间序列数据
   */
  private processTimeSeriesData(data: any[], config: any): any {
    const dateField = config.dateField || 'date';
    const valueField = config.valueField || 'value';

    // 按日期排序
    const sorted = [...data].sort((a, b) =>
      new Date(a[dateField]).getTime() - new Date(b[dateField]).getTime()
    );

    // 计算移动平均（如果配置）
    let processed = sorted;
    if (config.movingAverage) {
      processed = this.engine.movingAverage(processed, valueField, config.movingAverage);
    }

    // 计算趋势线（如果配置）
    if (config.trendline) {
      processed = this.addTrendline(processed, dateField, valueField);
    }

    return processed.map(d => ({
      date: d[dateField],
      value: d[valueField],
      ...(config.movingAverage && { ma: d[`${valueField}_ma${config.movingAverage}`] }),
      ...(config.trendline && { trend: d[`${valueField}_trend`] })
    }));
  }

  /**
   * 添加趋势线
   */
  private addTrendline(data: any[], dateField: string, valueField: string): any[] {
    const values = data.map(d => d[valueField]);
    const n = values.length;

    // 线性回归
    const sumX = (n * (n + 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + (x + 1) * y, 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map((d, i) => ({
      ...d,
      [`${valueField}_trend`]: slope * (i + 1) + intercept
    }));
  }

  /**
   * 处理分类数据
   */
  private processCategoryData(data: any[], config: any): any {
    const categoryField = config.categoryField || 'category';
    const valueField = config.valueField || 'value';

    // 分组聚合
    const grouped = this.engine.query(data, {
      dimensions: [categoryField],
      metrics: [valueField],
      groupBy: [categoryField],
      orderBy: config.orderBy || { field: valueField, direction: 'desc' }
    });

    return grouped;
  }

  /**
   * 处理分布数据
   */
  private processDistributionData(data: any[], config: any): any {
    const categoryField = config.categoryField || 'category';
    const valueField = config.valueField || 'value';

    // 分组聚合
    const grouped = this.engine.query(data, {
      dimensions: [categoryField],
      metrics: [valueField],
      groupBy: [categoryField]
    });

    // 计算百分比
    const total = this.engine.aggregate(
      grouped.map(d => d[valueField]),
      'sum'
    );

    return grouped.map(d => ({
      name: d[categoryField],
      value: d[valueField],
      percentage: (d[valueField] / total) * 100
    }));
  }

  /**
   * 处理散点图数据
   */
  private processScatterData(data: any[], config: any): any {
    const xField = config.xField || 'x';
    const yField = config.yField || 'y';
    const sizeField = config.sizeField;

    return data.map(d => ({
      x: d[xField],
      y: d[yField],
      ...(sizeField && { size: d[sizeField] })
    }));
  }

  /**
   * 处理热力图数据
   */
  private processHeatmapData(data: any[], config: any): any {
    const xField = config.xField || 'x';
    const yField = config.yField || 'y';
    const valueField = config.valueField || 'value';

    return data.map(d => ({
      x: d[xField],
      y: d[yField],
      value: d[valueField]
    }));
  }

  /**
   * 连接实时数据流
   */
  connectRealtimeStream(
    streamId: string,
    endpoint: string,
    onData: (data: any) => void
  ): void {
    if (this.realtimeConnections.has(streamId)) {
      console.warn(`Stream ${streamId} already connected`);
      return;
    }

    const ws = new WebSocket(endpoint);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onData(data);
      } catch (error) {
        console.error('Failed to parse realtime data:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log(`Stream ${streamId} closed`);
      this.realtimeConnections.delete(streamId);
    };

    this.realtimeConnections.set(streamId, ws);
  }

  /**
   * 断开实时数据流
   */
  disconnectRealtimeStream(streamId: string): void {
    const ws = this.realtimeConnections.get(streamId);

    if (ws) {
      ws.close();
      this.realtimeConnections.delete(streamId);
    }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.dataCache.clear();
    this.engine.clearCache();
  }

  /**
   * 导出数据
   */
  async exportData(format: 'csv' | 'json' | 'excel', data: any[]): Promise<Blob> {
    switch (format) {
      case 'csv':
        return this.exportCSV(data);
      case 'json':
        return this.exportJSON(data);
      case 'excel':
        return this.exportExcel(data);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * 导出CSV
   */
  private exportCSV(data: any[]): Blob {
    if (data.length === 0) {
      return new Blob([''], { type: 'text/csv' });
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row =>
        headers.map(h => {
          const value = row[h];
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(',')
      )
    ].join('\n');

    return new Blob([csv], { type: 'text/csv' });
  }

  /**
   * 导出JSON
   */
  private exportJSON(data: any[]): Blob {
    const json = JSON.stringify(data, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  /**
   * 导出Excel
   */
  private exportExcel(data: any[]): Blob {
    // 实际实现需要使用Excel库
    return new Blob([], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
}

export default new BiDataService();
