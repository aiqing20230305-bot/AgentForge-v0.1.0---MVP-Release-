/**
 * Global Heartbeat Monitor Component
 * 全局心跳监控面板 - 同时监控所有Agent的健康状态
 */

import React, { useState, useEffect } from 'react'
import type { OpenClawAgent } from '../utils/openclawLoader'
import type { HeartbeatData } from '../types/evolution'
import { getHeartbeatService } from '../services/evolution/heartbeatService'
import { VitalityGauge } from './VitalityGauge'

interface GlobalHeartbeatMonitorProps {
  agents: OpenClawAgent[]
  onAgentClick?: (agentId: string) => void
}

/**
 * 筛选类型
 */
type FilterType = 'all' | 'healthy' | 'warning' | 'critical' | 'offline'

/**
 * 排序类型
 */
type SortType = 'vitality' | 'name' | 'heartRate'

/**
 * 统计卡片组件
 */
const StatCard: React.FC<{
  title: string
  value: number
  icon: string
  color: string
}> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500/20 border-blue-400/50 text-blue-400',
    green: 'bg-green-500/20 border-green-400/50 text-green-400',
    amber: 'bg-amber-500/20 border-amber-400/50 text-amber-400',
    red: 'bg-red-500/20 border-red-400/50 text-red-400'
  }

  return (
    <div
      className={`rounded-lg p-4 border backdrop-blur-xl ${
        colorClasses[color as keyof typeof colorClasses]
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs opacity-80 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <span className="text-3xl opacity-80">{icon}</span>
      </div>
    </div>
  )
}

/**
 * 状态徽章组件
 */
const StatusBadge: React.FC<{
  status: HeartbeatData['status']
}> = ({ status }) => {
  const statusConfig = {
    healthy: { label: '健康', color: 'bg-green-500/20 text-green-400 border-green-400/50' },
    warning: { label: '警告', color: 'bg-amber-500/20 text-amber-400 border-amber-400/50' },
    critical: { label: '危急', color: 'bg-red-500/20 text-red-400 border-red-400/50' },
    offline: { label: '离线', color: 'bg-gray-500/20 text-gray-400 border-gray-400/50' }
  }

  const config = statusConfig[status]

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium border ${config.color}`}
    >
      {config.label}
    </span>
  )
}

/**
 * 指标项组件
 */
const MetricItem: React.FC<{
  label: string
  value: string | number
}> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-400">{label}</span>
    <span className="font-medium text-white">{value}</span>
  </div>
)

/**
 * Agent健康卡片组件
 */
const AgentHealthCard: React.FC<{
  agent: OpenClawAgent
  heartbeat: HeartbeatData | null
  onClick: () => void
}> = ({ agent, heartbeat, onClick }) => {
  const vitality = heartbeat?.vitality || 0
  const status = heartbeat?.status || 'offline'

  return (
    <div
      onClick={onClick}
      className="bg-white/5 border border-white/20 rounded-lg p-4 cursor-pointer hover:bg-white/10 hover:border-white/30 transition-all hover:scale-[1.02]"
    >
      {/* Agent 名称和状态 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium truncate flex-1 mr-2">{agent.name}</h3>
        <StatusBadge status={status} />
      </div>

      {/* 生命力迷你仪表盘 */}
      <div className="mb-3 flex justify-center">
        <VitalityGauge vitality={vitality} size="sm" showLabel={false} />
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <MetricItem
          label="心率"
          value={heartbeat ? `${heartbeat.heartRate} bpm` : '-'}
        />
        <MetricItem
          label="队列"
          value={heartbeat?.metrics.taskQueueLength || 0}
        />
        <MetricItem
          label="成功率"
          value={heartbeat ? `${heartbeat.metrics.successRate.toFixed(0)}%` : '-'}
        />
        <MetricItem
          label="进化等级"
          value={agent.coreEvolution?.evolutionLevel || 0}
        />
      </div>

      {/* 警告提示 */}
      {heartbeat && heartbeat.warnings.length > 0 && (
        <div className="mt-3 text-xs text-amber-400 bg-amber-500/10 rounded px-2 py-1">
          ⚠️ {heartbeat.warnings.length} 个警告
        </div>
      )}
    </div>
  )
}

/**
 * 全局心跳监控主组件
 */
export const GlobalHeartbeatMonitor: React.FC<GlobalHeartbeatMonitorProps> = ({
  agents,
  onAgentClick
}) => {
  const [filter, setFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortType>('vitality')
  const [, forceUpdate] = useState(0)

  // 每30秒自动刷新
  useEffect(() => {
    const timer = setInterval(() => {
      forceUpdate(prev => prev + 1)
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  // 获取所有Agent的最新心跳
  const agentHeartbeats = agents.map(agent => ({
    agent,
    heartbeat: getHeartbeatService().getLatestHeartbeat(agent.id)
  }))

  // 筛选
  const filteredAgents = agentHeartbeats.filter(({ heartbeat }) => {
    if (filter === 'all') return true
    return heartbeat?.status === filter
  })

  // 排序
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    if (sortBy === 'vitality') {
      return (b.heartbeat?.vitality || 0) - (a.heartbeat?.vitality || 0)
    }
    if (sortBy === 'heartRate') {
      return (b.heartbeat?.heartRate || 0) - (a.heartbeat?.heartRate || 0)
    }
    return a.agent.name.localeCompare(b.agent.name)
  })

  // 统计数据
  const stats = {
    total: agents.length,
    healthy: agentHeartbeats.filter(a => a.heartbeat?.status === 'healthy').length,
    warning: agentHeartbeats.filter(a => a.heartbeat?.status === 'warning').length,
    critical: agentHeartbeats.filter(a => a.heartbeat?.status === 'critical').length
  }

  return (
    <div className="space-y-4">
      {/* 头部控制栏 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold">全局心跳监控</h2>

        {/* 控制器 */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 筛选按钮 */}
          <div className="flex items-center gap-1">
            {(['all', 'healthy', 'warning', 'critical', 'offline'] as FilterType[]).map(
              type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    filter === type
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {type === 'all'
                    ? '全部'
                    : type === 'healthy'
                      ? '健康'
                      : type === 'warning'
                        ? '警告'
                        : type === 'critical'
                          ? '危急'
                          : '离线'}
                </button>
              )
            )}
          </div>

          {/* 排序下拉 */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortType)}
            className="px-3 py-1 bg-white/10 rounded text-xs border border-white/20 hover:bg-white/20 transition-colors"
          >
            <option value="vitality">按生命力</option>
            <option value="name">按名称</option>
            <option value="heartRate">按心率</option>
          </select>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="总Agent数" value={stats.total} icon="🤖" color="blue" />
        <StatCard title="健康" value={stats.healthy} icon="✅" color="green" />
        <StatCard title="警告" value={stats.warning} icon="⚠️" color="amber" />
        <StatCard title="危急" value={stats.critical} icon="🚨" color="red" />
      </div>

      {/* Agent 网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAgents.map(({ agent, heartbeat }) => (
          <AgentHealthCard
            key={agent.id}
            agent={agent}
            heartbeat={heartbeat}
            onClick={() => onAgentClick?.(agent.id)}
          />
        ))}
      </div>

      {sortedAgents.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          没有找到符合条件的Agent
        </div>
      )}
    </div>
  )
}
