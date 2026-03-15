/**
 * Performance Report Generator Component
 * 性能分析报告生成器 - 生成详细的性能分析报告并支持导出
 */

import React, { useState } from 'react'
import { subDays } from 'date-fns'
import type { OpenClawAgent } from '../utils/openclawLoader'
import { getHeartbeatService } from '../services/evolution/heartbeatService'
import { getEvolutionEngine } from '../services/evolution/evolutionEngine'
import { useTaskStore } from '../stores/taskStore'

interface PerformanceReport {
  agentId: string
  agentName: string
  generatedAt: string
  timeRange: {
    start: string
    end: string
  }
  vitalityAnalysis: {
    average: number
    max: number
    min: number
    trend: 'improving' | 'stable' | 'declining'
    fluctuation: number
  }
  taskStatistics: {
    total: number
    completed: number
    failed: number
    pending: number
    successRate: number
    avgDuration: number
    avgTokenUsage: number
  }
  evolutionStatistics: {
    totalEvolutions: number
    evolutionPointsEarned: number
    evolutionPointsSpent: number
    unlockedRules: string[]
  }
  healthStatusDistribution: {
    healthy: number
    warning: number
    critical: number
    offline: number
  }
  recommendations: string[]
}

type TimeRange = '7d' | '30d' | 'all'

/**
 * 报告区块组件
 */
const ReportSection: React.FC<{
  title: string
  data: any
}> = ({ title, data }) => {
  return (
    <div className="bg-white/5 border border-white/20 rounded-lg p-4">
      <h4 className="text-sm font-bold mb-3 text-purple-400">{title}</h4>
      <div className="space-y-2 text-sm">
        {typeof data === 'object' && !Array.isArray(data) ? (
          Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-400 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="font-medium">
                {typeof value === 'number'
                  ? value.toFixed(2)
                  : String(value)}
              </span>
            </div>
          ))
        ) : Array.isArray(data) ? (
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            {data.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-300">{String(data)}</p>
        )}
      </div>
    </div>
  )
}

/**
 * 转换报告为CSV格式
 */
function convertReportToCSV(report: PerformanceReport): string {
  const lines: string[] = []

  lines.push('Performance Report')
  lines.push(`Agent,${report.agentName}`)
  lines.push(`Generated At,${report.generatedAt}`)
  lines.push(`Time Range,${report.timeRange.start} to ${report.timeRange.end}`)
  lines.push('')

  lines.push('Vitality Analysis')
  Object.entries(report.vitalityAnalysis).forEach(([key, value]) => {
    lines.push(`${key},${value}`)
  })
  lines.push('')

  lines.push('Task Statistics')
  Object.entries(report.taskStatistics).forEach(([key, value]) => {
    lines.push(`${key},${value}`)
  })
  lines.push('')

  lines.push('Evolution Statistics')
  Object.entries(report.evolutionStatistics).forEach(([key, value]) => {
    lines.push(`${key},${Array.isArray(value) ? value.join(';') : value}`)
  })
  lines.push('')

  lines.push('Health Status Distribution')
  Object.entries(report.healthStatusDistribution).forEach(([key, value]) => {
    lines.push(`${key},${value}`)
  })
  lines.push('')

  lines.push('Recommendations')
  report.recommendations.forEach(rec => {
    lines.push(`,"${rec}"`)
  })

  return lines.join('\n')
}

/**
 * 性能报告生成器主组件
 */
export const PerformanceReportGenerator: React.FC<{
  agent: OpenClawAgent
}> = ({ agent }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [report, setReport] = useState<PerformanceReport | null>(null)
  const [generating, setGenerating] = useState(false)

  /**
   * 生成报告
   */
  const generateReport = () => {
    setGenerating(true)

    setTimeout(() => {
      const heartbeatHistory = getHeartbeatService().getHeartbeatHistory(agent.id)
      const evolutionHistory = getEvolutionEngine().getEvolutionHistory(agent.id)
      const tasks = useTaskStore.getState().tasks.filter(t => t.agentId === agent.id)

      // 计算时间范围
      const now = new Date()
      const cutoffDate =
        timeRange === '7d'
          ? subDays(now, 7)
          : timeRange === '30d'
            ? subDays(now, 30)
            : new Date(0)

      // 筛选数据
      const filteredHeartbeats =
        heartbeatHistory?.records.filter(h => new Date(h.timestamp) >= cutoffDate) || []

      // 生命力分析
      const vitalityValues = filteredHeartbeats.map(h => h.vitality)
      const vitalityAnalysis: PerformanceReport['vitalityAnalysis'] = {
        average: vitalityValues.length > 0
          ? vitalityValues.reduce((a, b) => a + b, 0) / vitalityValues.length
          : 0,
        max: vitalityValues.length > 0 ? Math.max(...vitalityValues) : 0,
        min: vitalityValues.length > 0 ? Math.min(...vitalityValues) : 0,
        trend: 'stable',
        fluctuation: 0
      }

      // 计算趋势
      if (vitalityValues.length >= 2) {
        const firstHalf = vitalityValues.slice(0, Math.floor(vitalityValues.length / 2))
        const secondHalf = vitalityValues.slice(Math.floor(vitalityValues.length / 2))
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

        if (secondAvg > firstAvg + 5) {
          vitalityAnalysis.trend = 'improving'
        } else if (secondAvg < firstAvg - 5) {
          vitalityAnalysis.trend = 'declining'
        }

        vitalityAnalysis.fluctuation = Math.abs(secondAvg - firstAvg)
      }

      // 任务统计
      const completedTasks = tasks.filter(t => t.status === 'completed')
      const taskStatistics = {
        total: tasks.length,
        completed: completedTasks.length,
        failed: tasks.filter(t => t.status === 'failed').length,
        pending: tasks.filter(t => t.status === 'pending').length,
        successRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
        avgDuration: 0,
        avgTokenUsage: 0
      }

      // 进化统计
      const totalPointsEarned = agent.coreEvolution?.evolutionPoints || 0
      const totalPointsSpent = evolutionHistory.reduce(
        (sum, e) => sum + e.pointsCost,
        0
      )
      const evolutionStatistics = {
        totalEvolutions: evolutionHistory.length,
        evolutionPointsEarned: totalPointsEarned + totalPointsSpent,
        evolutionPointsSpent: totalPointsSpent,
        unlockedRules: agent.coreEvolution?.unlockedRules || []
      }

      // 健康状态分布
      const healthStatusDistribution = {
        healthy: filteredHeartbeats.filter(h => h.status === 'healthy').length,
        warning: filteredHeartbeats.filter(h => h.status === 'warning').length,
        critical: filteredHeartbeats.filter(h => h.status === 'critical').length,
        offline: filteredHeartbeats.filter(h => h.status === 'offline').length
      }

      // 生成建议
      const recommendations: string[] = []
      if (vitalityAnalysis.trend === 'declining') {
        recommendations.push('⚠️ 生命力呈下降趋势，建议减少任务负荷或优化工作流程')
      }
      if (taskStatistics.successRate < 70) {
        recommendations.push('📉 任务成功率偏低，建议检查技能配置或调整任务难度')
      }
      if (healthStatusDistribution.critical > healthStatusDistribution.healthy) {
        recommendations.push('🚨 危急状态频繁出现，需要立即关注Agent健康')
      }
      if (evolutionStatistics.totalEvolutions === 0) {
        recommendations.push('🌱 尚未进化，继续完成任务以获得进化点')
      }
      if (recommendations.length === 0) {
        recommendations.push('✅ 一切运行良好，继续保持！')
      }

      const generatedReport: PerformanceReport = {
        agentId: agent.id,
        agentName: agent.name,
        generatedAt: new Date().toISOString(),
        timeRange: {
          start: cutoffDate.toISOString(),
          end: now.toISOString()
        },
        vitalityAnalysis,
        taskStatistics,
        evolutionStatistics,
        healthStatusDistribution,
        recommendations
      }

      setReport(generatedReport)
      setGenerating(false)
    }, 500)
  }

  /**
   * 导出为JSON
   */
  const exportAsJSON = () => {
    if (!report) return
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-report-${agent.name}-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * 导出为CSV
   */
  const exportAsCSV = () => {
    if (!report) return
    const csv = convertReportToCSV(report)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-report-${agent.name}-${new Date().toISOString()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* 控制栏 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-bold">性能分析报告</h3>

        <div className="flex items-center gap-2">
          {/* 时间范围选择 */}
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as TimeRange)}
            className="px-3 py-2 bg-white/10 rounded border border-white/20 hover:bg-white/20 transition-colors"
          >
            <option value="7d">最近7天</option>
            <option value="30d">最近30天</option>
            <option value="all">全部时间</option>
          </select>

          <button
            onClick={generateReport}
            disabled={generating}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? '生成中...' : '📊 生成报告'}
          </button>
        </div>
      </div>

      {/* 报告内容 */}
      {report ? (
        <div className="space-y-4">
          <ReportSection title="生命力分析" data={report.vitalityAnalysis} />
          <ReportSection title="任务统计" data={report.taskStatistics} />
          <ReportSection title="进化统计" data={report.evolutionStatistics} />
          <ReportSection
            title="健康状态分布"
            data={report.healthStatusDistribution}
          />
          <ReportSection title="优化建议" data={report.recommendations} />

          {/* 导出按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportAsJSON}
              className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 transition-colors"
            >
              📥 导出 JSON
            </button>
            <button
              onClick={exportAsCSV}
              className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 transition-colors"
            >
              📥 导出 CSV
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 py-12 bg-white/5 border border-white/20 rounded-lg">
          <p className="text-xl mb-2">📊</p>
          <p>点击"生成报告"按钮开始分析</p>
          <p className="text-sm mt-2">将基于选定时间范围生成详细的性能报告</p>
        </div>
      )}
    </div>
  )
}
