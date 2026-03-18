/**
 * 报表系统 - 类型定义
 */

export type ReportType = 'agent' | 'task' | 'team' | 'analytics' | 'custom';

export type DataSourceType = 'agents' | 'tasks' | 'teams' | 'analytics' | 'users';

export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'table';

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export interface Report {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  config: ReportConfig;
  schedule?: Schedule;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ReportConfig {
  dataSource: DataSource;
  filters: Filter[];
  groupBy: string[];
  sortBy: SortConfig[];
  charts: ChartConfig[];
  columns: ColumnConfig[];
}

export interface DataSource {
  type: DataSourceType;
  query?: string;
  params?: Record<string, any>;
}

export interface Filter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'in' | 'between';
  value: any;
}

export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

export interface ChartConfig {
  type: ChartType;
  metric: string;
  title?: string;
  xAxis?: string;
  yAxis?: string;
}

export interface ColumnConfig {
  field: string;
  title: string;
  width?: number;
  format?: string;
}

export interface Schedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  timezone?: string;
  recipients?: string[];
}

export interface ReportData {
  report: Report;
  data: any[];
  generatedAt: Date;
  stats: {
    totalRecords: number;
    duration: number;
  };
}
