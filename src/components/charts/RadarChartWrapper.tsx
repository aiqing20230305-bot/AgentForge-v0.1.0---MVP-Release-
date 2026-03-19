/**
 * RadarChart Wrapper - 按需导入
 */
import React from 'react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface RadarChartWrapperProps {
  data: any[]
  config?: {
    nameKey?: string
    valueKey?: string
    color?: string
  }
  className?: string
}

export default function RadarChartWrapper({
  data,
  config = {},
  className = ''
}: RadarChartWrapperProps) {
  const {
    nameKey = 'subject',
    valueKey = 'value',
    color = '#8b5cf6'
  } = config

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.2)" />
          <PolarAngleAxis
            dataKey={nameKey}
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
          />
          <PolarRadiusAxis stroke="rgba(255,255,255,0.3)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 10, 10, 0.9)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px'
            }}
          />
          <Radar
            dataKey={valueKey}
            stroke={color}
            fill={color}
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
