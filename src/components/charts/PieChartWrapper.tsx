/**
 * PieChart Wrapper - 按需导入
 */
import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']

interface PieChartWrapperProps {
  data: any[]
  config?: {
    nameKey?: string
    valueKey?: string
    colors?: string[]
  }
  className?: string
}

export default function PieChartWrapper({
  data,
  config = {},
  className = ''
}: PieChartWrapperProps) {
  const {
    nameKey = 'name',
    valueKey = 'value',
    colors = COLORS
  } = config

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 10, 10, 0.9)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '8px'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
