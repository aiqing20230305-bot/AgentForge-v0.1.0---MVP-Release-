/**
 * BarChart Wrapper - 按需导入
 */
import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface BarChartWrapperProps {
  data: any[]
  config?: {
    xKey?: string
    yKey?: string
    color?: string
  }
  className?: string
}

export default function BarChartWrapper({
  data,
  config = {},
  className = ''
}: BarChartWrapperProps) {
  const { xKey = 'name', yKey = 'value', color = '#3b82f6' } = config

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey={xKey} stroke="rgba(255,255,255,0.5)" />
          <YAxis stroke="rgba(255,255,255,0.5)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 10, 10, 0.9)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Bar dataKey={yKey} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
