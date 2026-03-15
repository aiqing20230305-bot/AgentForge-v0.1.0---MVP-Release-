/**
 * Vitality Trend Chart Component
 * 生命力趋势图 - 显示7天/30天趋势对比
 */

import React, { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { format, subDays, startOfDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { HeartbeatData } from '../types/evolution'

interface VitalityTrendChartProps {
  data: HeartbeatData[]
  height?: number
}

type TimeRange = '7d' | '30d'

/**
 * 聚合数据按天分组
 */
function aggregateDataByDay(
  data: HeartbeatData[],
  days: number
): Array<{
  date: string
  avgVitality: number
  avgHeartRate: number
  minVitality: number
  maxVitality: number
  count: number
}> {
  const startDate = startOfDay(subDays(new Date(), days - 1))
  const grouped = new Map<
    string,
    {
      vitalities: number[]
      heartRates: number[]
    }
  >()

  // 初始化所有日期
  for (let i = 0; i < days; i++) {
    const date = format(subDays(new Date(), days - 1 - i), 'yyyy-MM-dd')
    grouped.set(date, { vitalities: [], heartRates: [] })
  }

  // 分组数据
  data.forEach(item => {
    const itemDate = new Date(item.timestamp)
    if (itemDate >= startDate) {
      const dateKey = format(itemDate, 'yyyy-MM-dd')
      const group = grouped.get(dateKey)
      if (group) {
        group.vitalities.push(item.vitality)
        group.heartRates.push(item.heartRate)
      }
    }
  })

  // 计算平均值
  return Array.from(grouped.entries()).map(([date, group]) => {
    const avgVitality =
      group.vitalities.length > 0
        ? group.vitalities.reduce((a, b) => a + b, 0) / group.vitalities.length
        : 0

    const avgHeartRate =
      group.heartRates.length > 0
        ? group.heartRates.reduce((a, b) => a + b, 0) / group.heartRates.length
        : 0

    const minVitality =
      group.vitalities.length > 0 ? Math.min(...group.vitalities) : 0
    const maxVitality =
      group.vitalities.length > 0 ? Math.max(...group.vitalities) : 0

    return {
      date,
      avgVitality: Math.round(avgVitality),
      avgHeartRate: Math.round(avgHeartRate),
      minVitality,
      maxVitality,
      count: group.vitalities.length
    }
  })
}

/**
 * 自定义 Tooltip
 */
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-2">
        {format(new Date(label), 'yyyy年MM月dd日', { locale: zhCN })}
      </p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-gray-400">平均生命力:</span>
          <span className="text-sm text-green-400 font-medium">
            {data.avgVitality}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-gray-400">范围:</span>
          <span className="text-xs text-gray-300">
            {data.minVitality} - {data.maxVitality}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-gray-400">平均心率:</span>
          <span className="text-sm text-pink-400 font-medium">
            {data.avgHeartRate} bpm
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-gray-400">记录数:</span>
          <span className="text-xs text-gray-300">{data.count}</span>
        </div>
      </div>
    </div>
  )
}

export const VitalityTrendChart: React.FC<VitalityTrendChartProps> = ({
  data,
  height = 250
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')

  const chartData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : 30
    return aggregateDataByDay(data, days)
  }, [data, timeRange])

  // 计算趋势
  const trend = useMemo(() => {
    if (chartData.length < 2) return 'stable'
    const firstVitality = chartData[0].avgVitality
    const lastVitality = chartData[chartData.length - 1].avgVitality
    const diff = lastVitality - firstVitality

    if (diff > 5) return 'improving'
    if (diff < -5) return 'declining'
    return 'stable'
  }, [chartData])

  const trendInfo = {
    improving: { icon: '📈', text: '上升趋势', color: 'text-green-400' },
    declining: { icon: '📉', text: '下降趋势', color: 'text-red-400' },
    stable: { icon: '➡️', text: '保持稳定', color: 'text-blue-400' }
  }

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-medium text-white flex items-center gap-2">
          <span>📊</span>
          生命力趋势
        </h4>

        <div className="flex items-center gap-2">
          {/* 趋势指示器 */}
          <div
            className={`text-xs flex items-center gap-1 ${trendInfo[trend].color}`}
          >
            <span>{trendInfo[trend].icon}</span>
            <span>{trendInfo[trend].text}</span>
          </div>

          {/* 时间范围切换 */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                timeRange === '7d'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              7天
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                timeRange === '30d'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              30天
            </button>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.4)"
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
            tickFormatter={value => format(new Date(value), 'MM/dd')}
          />
          <YAxis
            stroke="rgba(255,255,255,0.4)"
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="circle"
            formatter={value => (
              <span className="text-gray-400">{value}</span>
            )}
          />

          {/* 平均生命力线 */}
          <Line
            type="monotone"
            dataKey="avgVitality"
            name="平均生命力"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 3 }}
            activeDot={{ r: 5 }}
            animationDuration={1000}
          />

          {/* 平均心率线 */}
          <Line
            type="monotone"
            dataKey="avgHeartRate"
            name="平均心率"
            stroke="#ec4899"
            strokeWidth={2}
            dot={{ fill: '#ec4899', r: 3 }}
            activeDot={{ r: 5 }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* 统计信息 */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">平均值</div>
          <div className="text-lg font-bold text-green-400">
            {Math.round(
              chartData.reduce((sum, d) => sum + d.avgVitality, 0) /
                (chartData.length || 1)
            )}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">最高值</div>
          <div className="text-lg font-bold text-blue-400">
            {Math.max(...chartData.map(d => d.maxVitality))}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">最低值</div>
          <div className="text-lg font-bold text-amber-400">
            {Math.min(...chartData.map(d => d.minVitality))}
          </div>
        </div>
      </div>
    </div>
  )
}
