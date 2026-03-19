/**
 * Analytics Dashboard - 主仪表盘容器
 * v2.4.0 Phase 1.1
 */
import React, { useState, useEffect } from 'react'
import { MetricsOverview } from './MetricsOverview'
import { TrendChart } from './charts/TrendChart'
import { AgentPerformanceChart } from './charts/AgentPerformanceChart'
import { TaskCompletionChart } from './charts/TaskCompletionChart'
import { UserActivityHeatmap } from './charts/UserActivityHeatmap'
import { DashboardCard } from './DashboardCard'

export interface AnalyticsDashboardProps {
  teamId?: string
  userId?: string
  timeRange?: 'day' | 'week' | 'month' | 'year'
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  teamId,
  userId,
  timeRange = 'week'
}) => {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // 刷新数据
  const handleRefresh = async () => {
    setRefreshing(true)
    // TODO: 调用API刷新数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  useEffect(() => {
    // 初始加载
    const loadData = async () => {
      setLoading(true)
      // TODO: 调用API加载数据
      await new Promise(resolve => setTimeout(resolve, 500))
      setLoading(false)
    }

    loadData()
  }, [teamId, userId, timeRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">加载数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-6 bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            📊 分析仪表盘
          </h1>
          <p className="text-gray-400">
            实时监控Agent性能和用户活动
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* 时间范围选择器 */}
          <select
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
            defaultValue={timeRange}
          >
            <option value="day">今天</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="year">今年</option>
          </select>

          {/* 刷新按钮 */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-cyan-500/20 border border-cyan-500/50 rounded-lg px-4 py-2 text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
          >
            {refreshing ? '刷新中...' : '🔄 刷新'}
          </button>
        </div>
      </div>

      {/* 指标概览 */}
      <MetricsOverview />

      {/* 图表网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* 趋势图表 */}
        <DashboardCard
          title="📈 整体趋势"
          description="Agent和任务的变化趋势"
        >
          <TrendChart />
        </DashboardCard>

        {/* Agent性能图 */}
        <DashboardCard
          title="🤖 Agent性能"
          description="各Agent的性能表现"
        >
          <AgentPerformanceChart />
        </DashboardCard>

        {/* 任务完成图 */}
        <DashboardCard
          title="✅ 任务完成率"
          description="任务完成情况统计"
        >
          <TaskCompletionChart />
        </DashboardCard>

        {/* 用户活动热力图 */}
        <DashboardCard
          title="🔥 用户活动"
          description="用户活跃度热力图"
          className="lg:col-span-2"
        >
          <UserActivityHeatmap />
        </DashboardCard>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
