/**
 * Report Viewer Component - 报表查看器
 *
 * 渲染报表数据和图表
 */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ReportTemplate } from '@/services/reports/reportTemplates';
import type { ReportResult } from '@/services/reports/types';

interface ReportViewerProps {
  template: ReportTemplate;
  data: ReportResult;
  onExport?: (format: 'csv' | 'json' | 'pdf' | 'excel') => void;
  onRefresh?: () => void;
}

export function ReportViewer({ template, data, onExport, onRefresh }: ReportViewerProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [isLoading, setIsLoading] = useState(false);

  const chartColors = [
    '#3b82f6', // blue-500
    '#10b981', // green-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // purple-500
    '#ec4899', // pink-500
    '#14b8a6', // teal-500
    '#f97316', // orange-500
  ];

  // 准备图表数据
  const chartData = useMemo(() => {
    if (!data.data || data.data.length === 0) return [];
    return data.data;
  }, [data.data]);

  const handleExport = async (format: 'csv' | 'json' | 'pdf' | 'excel') => {
    setIsLoading(true);
    try {
      await onExport?.(format);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* 头部 */}
      <div className="border-b dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{template.icon}</span>
            <div>
              <h2 className="text-2xl font-bold">{template.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {template.description}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                  {template.category}
                </span>
                <span className="text-xs text-gray-500">
                  {data.totalRecords} records | Generated at {new Date(data.generatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Refresh"
            >
              <motion.span
                className="text-xl inline-block"
                animate={isLoading ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: 'linear' }}
              >
                🔄
              </motion.span>
            </button>
            <ExportMenu onExport={handleExport} isLoading={isLoading} />
          </div>
        </div>
      </div>

      {/* 视图切换 */}
      <div className="flex items-center justify-between px-6 py-3 border-b dark:border-gray-700">
        <div className="flex gap-2">
          <ViewToggleButton
            active={viewMode === 'chart'}
            onClick={() => setViewMode('chart')}
            icon="📊"
            label="Chart"
          />
          <ViewToggleButton
            active={viewMode === 'table'}
            onClick={() => setViewMode('table')}
            icon="📋"
            label="Table"
          />
        </div>
        <div className="text-sm text-gray-500">
          Showing {Math.min(data.query.limit || 100, data.totalRecords)} of {data.totalRecords} records
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-6">
        {viewMode === 'chart' && template.chartType !== 'table' && (
          <ChartRenderer
            type={template.chartType!}
            data={chartData}
            colors={chartColors}
          />
        )}
        {(viewMode === 'table' || template.chartType === 'table') && (
          <TableRenderer data={chartData} columns={template.query.fields} />
        )}

        {/* 聚合统计 */}
        {data.aggregations && Object.keys(data.aggregations).length > 0 && (
          <div className="mt-6 pt-6 border-t dark:border-gray-700">
            <h3 className="font-bold mb-3">📊 Aggregations</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.aggregations).map(([key, value]) => (
                <AggregationCard key={key} label={key} value={value} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 图表渲染器
function ChartRenderer({
  type,
  data,
  colors,
}: {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  data: any[];
  colors: string[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <div className="text-center">
          <p className="text-4xl mb-2">📊</p>
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const dataKeys = Object.keys(data[0]).filter((key) => typeof data[0][key] === 'number');
  const categoryKey = Object.keys(data[0]).find((key) => typeof data[0][key] === 'string') || 'name';

  return (
    <ResponsiveContainer width="100%" height={400}>
      {type === 'line' && (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={categoryKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      )}

      {type === 'bar' && (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={categoryKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar key={key} dataKey={key} fill={colors[index % colors.length]} />
          ))}
        </BarChart>
      )}

      {type === 'pie' && (
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry[categoryKey]}: ${entry[dataKeys[0]]}`}
            outerRadius={150}
            fill="#8884d8"
            dataKey={dataKeys[0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      )}

      {type === 'area' && (
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={categoryKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {dataKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      )}

      {type === 'scatter' && (
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={dataKeys[0]} name={dataKeys[0]} />
          <YAxis dataKey={dataKeys[1]} name={dataKeys[1]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Data" data={data} fill={colors[0]} />
        </ScatterChart>
      )}
    </ResponsiveContainer>
  );
}

// 表格渲染器
function TableRenderer({ data, columns }: { data: any[]; columns: string[] }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-2">📋</p>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700">
            {columns.map((column) => (
              <th
                key={column}
                className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border-b dark:border-gray-600"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <motion.tr
              key={index}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              {columns.map((column) => (
                <td
                  key={column}
                  className="px-4 py-3 text-sm border-b dark:border-gray-700"
                >
                  {formatCellValue(row[column])}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 聚合卡片
function AggregationCard({ label, value }: { label: string; value: any }) {
  return (
    <motion.div
      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
      whileHover={{ scale: 1.02 }}
    >
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold">{formatCellValue(value)}</p>
    </motion.div>
  );
}

// 视图切换按钮
function ViewToggleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-all ${
        active
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );
}

// 导出菜单
function ExportMenu({
  onExport,
  isLoading,
}: {
  onExport: (format: 'csv' | 'json' | 'pdf' | 'excel') => void;
  isLoading: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
      >
        📥 Export
      </button>

      {showMenu && (
        <motion.div
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ExportMenuItem
            icon="📄"
            label="Export as CSV"
            onClick={() => {
              onExport('csv');
              setShowMenu(false);
            }}
          />
          <ExportMenuItem
            icon="📋"
            label="Export as JSON"
            onClick={() => {
              onExport('json');
              setShowMenu(false);
            }}
          />
          <ExportMenuItem
            icon="📑"
            label="Export as PDF"
            onClick={() => {
              onExport('pdf');
              setShowMenu(false);
            }}
          />
          <ExportMenuItem
            icon="📊"
            label="Export as Excel"
            onClick={() => {
              onExport('excel');
              setShowMenu(false);
            }}
          />
        </motion.div>
      )}
    </div>
  );
}

// 导出菜单项
function ExportMenuItem({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );
}

// 格式化单元格值
function formatCellValue(value: any): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  if (value instanceof Date) {
    return value.toLocaleString();
  }
  if (typeof value === 'boolean') {
    return value ? '✓' : '✗';
  }
  return String(value);
}
