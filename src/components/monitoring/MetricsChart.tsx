/**
 * 指标图表组件
 * 使用 recharts 展示时间序列指标
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { metricsCollector, DataPoint } from '../../services/monitoring';

interface MetricsChartProps {
  metricName: string;
  title: string;
  color?: string;
  height?: number;
  timeRange?: number; // 时间范围（毫秒）
}

export const MetricsChart: React.FC<MetricsChartProps> = ({
  metricName,
  title,
  color = '#3b82f6',
  height = 300,
  timeRange = 5 * 60 * 1000 // 默认5分钟
}) => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [currentValue, setCurrentValue] = useState<number>(0);

  useEffect(() => {
    const updateData = () => {
      const endTime = Date.now();
      const startTime = endTime - timeRange;
      const dataPoints = metricsCollector.queryDataPoints(
        metricName,
        startTime,
        endTime
      );

      setData(dataPoints);
      if (dataPoints.length > 0) {
        setCurrentValue(dataPoints[dataPoints.length - 1].value);
      }
    };

    updateData();
    const unsubscribe = metricsCollector.subscribe(metrics => {
      const metric = metrics.find(m => m.name === metricName);
      if (metric) {
        updateData();
      }
    });

    const interval = setInterval(updateData, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [metricName, timeRange]);

  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatYAxis = (value: number) => {
    return value.toFixed(1);
  };

  const chartData = data.map(dp => ({
    timestamp: dp.timestamp,
    value: dp.value
  }));

  return (
    <div className="metrics-chart">
      <div className="chart-header">
        <h3>{title}</h3>
        <div className="current-value" style={{ color }}>
          {currentValue.toFixed(2)}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            stroke="#64748b"
            style={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={formatYAxis}
            stroke="#64748b"
            style={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#e2e8f0'
            }}
            labelFormatter={(label) => new Date(label).toLocaleString()}
            formatter={(value: number) => [value.toFixed(2), title]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <style>{`
        .metrics-chart {
          background: #0f172a;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #334155;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .chart-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #e2e8f0;
        }

        .current-value {
          font-size: 24px;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default MetricsChart;
