/**
 * Heartbeat Chart Component
 * 心跳波形图 - 显示实时心跳数据
 */

import React from 'react'
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { HeartbeatData } from '../types/evolution'

interface HeartbeatChartProps {
  data: HeartbeatData[]
  height?: number
  showGrid?: boolean
}

/**
 * 自定义 Tooltip
 */
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-2">
        {formatDistanceToNow(new Date(data.timestamp), {
          addSuffix: true,
          locale: zhCN
        })}
      </p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-white">生命力: {data.vitality}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-500" />
          <span className="text-sm text-white">心率: {data.heartRate} bpm</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              data.status === 'healthy'
                ? 'bg-green-500'
                : data.status === 'warning'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-white">
            状态:{' '}
            {data.status === 'healthy'
              ? '健康'
              : data.status === 'warning'
                ? '警告'
                : '危急'}
          </span>
        </div>
      </div>
    </div>
  )
}

export const HeartbeatChart: React.FC<HeartbeatChartProps> = ({
  data,
  height = 200,
  showGrid = true
}) => {
  // 只显示最近20个数据点
  const displayData = data.slice(-20).map((item, index) => ({
    ...item,
    index,
    time: new Date(item.timestamp).getTime()
  }))

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-medium text-white flex items-center gap-2">
          <span className="text-red-500 animate-pulse">❤️</span>
          心跳波形
        </h4>
        <div className="text-xs text-gray-400">
          最近 {displayData.length} 次心跳
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={displayData}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          )}
          <XAxis
            dataKey="index"
            stroke="rgba(255,255,255,0.4)"
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
            tickFormatter={(value) => `${value + 1}`}
          />
          <YAxis
            stroke="rgba(255,255,255,0.4)"
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* 生命力区域 */}
          <defs>
            <linearGradient id="vitalityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="vitality"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#vitalityGradient)"
            animationDuration={1000}
          />

          {/* 心率线 */}
          <Line
            type="monotone"
            dataKey="heartRate"
            stroke="#ec4899"
            strokeWidth={2}
            dot={{ fill: '#ec4899', r: 3 }}
            activeDot={{ r: 5 }}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* 图例 */}
      <div className="mt-3 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs text-gray-400">生命力</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-500" />
          <span className="text-xs text-gray-400">心率 (bpm)</span>
        </div>
      </div>
    </div>
  )
}
