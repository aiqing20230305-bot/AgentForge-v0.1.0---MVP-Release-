/**
 * AreaChart Wrapper - 按需导入
 */
import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface AreaChartWrapperProps {
  data: any[]
  config?: {
    xKey?: string
    yKey?: string
    color?: string
  }
  className?: string
}

export default function AreaChartWrapper({
  data,
  config = {},
  className = ''
}: AreaChartWrapperProps) {
  const { xKey = 'name', yKey = 'value', color = '#10b981' } = config

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey={xKey} stroke="rgba(255,255,255,0.5)" />
          <YAxis stroke="rgba(255,255,255,0.5)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 10, 10, 0.9)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px'
            }}
          />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            fill={`${color}40`}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
