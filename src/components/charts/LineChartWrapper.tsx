/**
 * LineChart Wrapper - 按需导入Recharts
 * 只导入需要的组件，减少bundle大小
 */
import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface LineChartWrapperProps {
  data: any[]
  config?: {
    xKey?: string
    yKey?: string
    color?: string
    showGrid?: boolean
    showLegend?: boolean
  }
  className?: string
}

export default function LineChartWrapper({
  data,
  config = {},
  className = ''
}: LineChartWrapperProps) {
  const {
    xKey = 'name',
    yKey = 'value',
    color = '#06b6d4',
    showGrid = true,
    showLegend = true
  } = config

  return (
    <div className={`line-chart-wrapper ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          )}
          <XAxis
            dataKey={xKey}
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 10, 10, 0.9)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          {showLegend && <Legend />}
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
