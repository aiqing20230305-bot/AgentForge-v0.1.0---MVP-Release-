/**
 * BI Chart - 统一图表组件入口
 * 支持15+种图表类型
 */

import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import { BiKPICard } from './BiKPICard';
import { BiGauge } from './BiGauge';
import { BiHeatmap } from './BiHeatmap';

interface BiChartProps {
  type: string;
  data: any;
  config?: any;
}

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

export const BiChart: React.FC<BiChartProps> = ({ type, data, config = {} }) => {
  // KPI卡片
  if (type === 'kpi') {
    return <BiKPICard data={data} config={config} />;
  }

  // 仪表盘
  if (type === 'gauge') {
    return <BiGauge data={data} config={config} />;
  }

  // 热力图
  if (type === 'heatmap') {
    return <BiHeatmap data={data} config={config} />;
  }

  // 标准图表
  return (
    <ResponsiveContainer width="100%" height="100%">
      {renderChart(type, data, config)}
    </ResponsiveContainer>
  );
};

function renderChart(type: string, data: any, config: any) {
  switch (type) {
    case 'line':
      return (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={config.xField || 'date'} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey={config.yField || 'value'}
            stroke={COLORS[0]}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          {config.showTrend && (
            <Line
              type="monotone"
              dataKey="trend"
              stroke={COLORS[1]}
              strokeDasharray="5 5"
              dot={false}
            />
          )}
          {config.movingAverage && (
            <Line
              type="monotone"
              dataKey="ma"
              stroke={COLORS[2]}
              strokeWidth={1}
              dot={false}
            />
          )}
        </LineChart>
      );

    case 'area':
      return (
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={config.xField || 'date'} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey={config.yField || 'value'}
            stroke={COLORS[0]}
            fill={COLORS[0]}
            fillOpacity={0.3}
          />
        </AreaChart>
      );

    case 'bar':
    case 'column':
      return (
        <BarChart data={data} layout={type === 'bar' ? 'vertical' : 'horizontal'}>
          <CartesianGrid strokeDasharray="3 3" />
          {type === 'bar' ? (
            <>
              <XAxis type="number" />
              <YAxis dataKey={config.categoryField || 'category'} type="category" />
            </>
          ) : (
            <>
              <XAxis dataKey={config.categoryField || 'category'} />
              <YAxis />
            </>
          )}
          <Tooltip />
          <Legend />
          <Bar dataKey={config.valueField || 'value'} fill={COLORS[0]}>
            {data.map((_: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      );

    case 'pie':
    case 'donut':
      return (
        <PieChart>
          <Pie
            data={data}
            dataKey={config.valueField || 'value'}
            nameKey={config.nameField || 'name'}
            cx="50%"
            cy="50%"
            innerRadius={type === 'donut' ? '40%' : 0}
            outerRadius="70%"
            label={config.showLabels !== false}
          >
            {data.map((_: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          {config.showLegend !== false && <Legend />}
          <Tooltip />
        </PieChart>
      );

    case 'scatter':
      return (
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={config.xField || 'x'} name={config.xLabel || 'X'} />
          <YAxis dataKey={config.yField || 'y'} name={config.yLabel || 'Y'} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter
            name={config.seriesName || 'Series'}
            data={data}
            fill={COLORS[0]}
          />
        </ScatterChart>
      );

    case 'radar':
      return (
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey={config.categoryField || 'category'} />
          <PolarRadiusAxis />
          <Radar
            name={config.seriesName || 'Series'}
            dataKey={config.valueField || 'value'}
            stroke={COLORS[0]}
            fill={COLORS[0]}
            fillOpacity={0.3}
          />
          <Legend />
          <Tooltip />
        </RadarChart>
      );

    default:
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <p>Chart type not supported: {type}</p>
            <p className="text-sm mt-2">Available types: line, area, bar, pie, scatter, radar</p>
          </div>
        </div>
      );
  }
}
