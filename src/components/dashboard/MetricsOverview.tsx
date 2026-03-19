/**
 * Metrics Overview - 指标概览
 * v2.4.0 Phase 1.1
 */
import React from 'react'
import { motion } from 'framer-motion'

interface MetricCardProps {
  icon: string
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  change,
  trend = 'neutral'
}) => {
  const trendColor = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  }[trend]

  const trendIcon = {
    up: '↗',
    down: '↘',
    neutral: '→'
  }[trend]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-cyan-500/50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-3xl mb-2">{icon}</div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>

        {change !== undefined && (
          <div className={`text-sm ${trendColor} flex items-center gap-1`}>
            <span>{trendIcon}</span>
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export const MetricsOverview: React.FC = () => {
  // TODO: 从API获取实际数据
  const metrics = [
    {
      icon: '🤖',
      label: 'Agent总数',
      value: 42,
      change: 12.5,
      trend: 'up' as const
    },
    {
      icon: '✅',
      label: '任务完成',
      value: 156,
      change: 8.3,
      trend: 'up' as const
    },
    {
      icon: '👥',
      label: '活跃用户',
      value: 23,
      change: -2.1,
      trend: 'down' as const
    },
    {
      icon: '⚡',
      label: '平均响应时间',
      value: '245ms',
      change: 5.6,
      trend: 'down' as const // 响应时间下降是好事
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  )
}

export default MetricsOverview
