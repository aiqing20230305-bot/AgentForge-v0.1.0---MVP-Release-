/**
 * 能耗仪表盘组件
 * 显示 Token 使用情况和预算管理
 */

import React from 'react'
import { useEnergyStore } from '../store/useEnergyStore'
import { useTaskStore } from '../stores/taskStore'
import { Zap, TrendingUp, DollarSign, AlertTriangle, Activity } from 'lucide-react'

export const EnergyDashboard: React.FC = () => {
  const { budget, usage, records, alertThreshold } = useEnergyStore()
  const { tasks } = useTaskStore()

  // 计算消耗百分比
  const dailyPercent = (usage.today / budget.daily) * 100
  const weeklyPercent = (usage.week / budget.weekly) * 100
  const monthlyPercent = (usage.month / budget.monthly) * 100

  // 计算实时消耗速率（tokens/hour）
  const calculateRate = (): number => {
    const now = Date.now()
    const oneHourAgo = now - 3600000
    const recentRecords = records.filter(r => new Date(r.timestamp).getTime() > oneHourAgo)
    return recentRecords.reduce((sum, r) => sum + r.tokensUsed, 0)
  }

  const tokensPerHour = calculateRate()

  // 计算总成本（假设 GPT-4 定价：$0.03/1K input, $0.06/1K output）
  const calculateCost = (tokens: number): number => {
    // 简化计算：平均成本 $0.045/1K tokens
    return (tokens / 1000) * 0.045
  }

  // 获取 Top 5 消耗任务
  const getTopConsumingTasks = () => {
    const tasksWithTokens = tasks
      .filter(t => t.tokenMetrics?.actualTokens)
      .sort((a, b) => (b.tokenMetrics?.actualTokens || 0) - (a.tokenMetrics?.actualTokens || 0))
      .slice(0, 5)
    return tasksWithTokens
  }

  const topTasks = getTopConsumingTasks()

  // 判断是否需要告警
  const isWarning = (percent: number) => percent >= alertThreshold && percent < 100
  const isDanger = (percent: number) => percent >= 100

  const showAlert = isDanger(dailyPercent) || isDanger(weeklyPercent) || isDanger(monthlyPercent)

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a] overflow-y-auto">
      {/* 告警横幅 */}
      {showAlert && (
        <div className="bg-red-900/20 border-l-4 border-red-500 p-4 m-4 rounded">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-300 font-bold mb-1">⚠️ 预算超限告警</h3>
              <p className="text-red-200 text-sm">
                您的 Token 消耗已超出预算！请检查任务配置或增加预算额度。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 头部 */}
      <div className="p-6 border-b border-white/20">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          能耗监控中心
        </h2>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* 圆形进度环 */}
        <div className="grid grid-cols-3 gap-4">
          <CircularProgress
            label="今日"
            current={usage.today}
            limit={budget.daily}
            percent={dailyPercent}
            color={getProgressColor(dailyPercent, alertThreshold)}
          />
          <CircularProgress
            label="本周"
            current={usage.week}
            limit={budget.weekly}
            percent={weeklyPercent}
            color={getProgressColor(weeklyPercent, alertThreshold)}
          />
          <CircularProgress
            label="本月"
            current={usage.month}
            limit={budget.monthly}
            percent={monthlyPercent}
            color={getProgressColor(monthlyPercent, alertThreshold)}
          />
        </div>

        {/* 实时指标 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 消耗速率 */}
          <div className="bg-white/5 border border-white/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white/80">实时速率</h3>
            </div>
            <div className="text-2xl font-bold text-blue-300">
              {tokensPerHour.toLocaleString()}
            </div>
            <div className="text-xs text-white/60 mt-1">tokens/小时</div>
          </div>

          {/* 总成本 */}
          <div className="bg-white/5 border border-white/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <h3 className="text-sm font-bold text-white/80">本月成本</h3>
            </div>
            <div className="text-2xl font-bold text-green-300">
              ${calculateCost(usage.month).toFixed(2)}
            </div>
            <div className="text-xs text-white/60 mt-1">USD</div>
          </div>
        </div>

        {/* Top 5 消耗任务 */}
        <div className="bg-white/5 border border-white/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white">Top 5 能耗任务</h3>
          </div>

          {topTasks.length === 0 ? (
            <p className="text-white/50 text-sm text-center py-4">暂无数据</p>
          ) : (
            <div className="space-y-2">
              {topTasks.map((task, index) => {
                const tokens = task.tokenMetrics?.actualTokens || 0
                const cost = calculateCost(tokens)
                const maxTokens = topTasks[0]?.tokenMetrics?.actualTokens || 1
                const barWidth = (tokens / maxTokens) * 100

                return (
                  <div key={task.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-white/60 font-bold">#{index + 1}</span>
                        <span className="text-white truncate">{task.title}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-white/70 text-xs">
                          {tokens.toLocaleString()} tokens
                        </span>
                        <span className="text-green-400 text-xs font-bold">
                          ${cost.toFixed(3)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-600 to-orange-400 h-full transition-all duration-300"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 预算信息 */}
        <div className="bg-white/5 border border-white/20 rounded-lg p-4">
          <h3 className="text-sm font-bold text-white mb-3">预算配置</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">日预算：</span>
              <span className="text-white">{budget.daily.toLocaleString()} tokens</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">周预算：</span>
              <span className="text-white">{budget.weekly.toLocaleString()} tokens</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">月预算：</span>
              <span className="text-white">{budget.monthly.toLocaleString()} tokens</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/20">
              <span className="text-white/60">告警阈值：</span>
              <span className="text-yellow-400 font-bold">{alertThreshold}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 圆形进度条组件
 */
interface CircularProgressProps {
  label: string
  current: number
  limit: number
  percent: number
  color: string
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  label,
  current,
  limit,
  percent,
  color
}) => {
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(percent, 100) / 100) * circumference

  return (
    <div className="bg-white/5 border border-white/20 rounded-lg p-4 flex flex-col items-center">
      <h3 className="text-sm font-bold text-white/80 mb-3">{label}</h3>

      {/* SVG 圆环 */}
      <div className="relative w-32 h-32">
        <svg className="transform -rotate-90 w-full h-full">
          {/* 背景圆环 */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-700"
          />
          {/* 进度圆环 */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>

        {/* 中心文字 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-white">
            {Math.min(percent, 100).toFixed(0)}%
          </div>
          <div className="text-xs text-white/60 mt-1">
            {formatTokens(current)} / {formatTokens(limit)}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 根据百分比返回颜色
 */
function getProgressColor(percent: number, threshold: number): string {
  if (percent >= 100) return '#EF4444' // 红色
  if (percent >= threshold) return '#F59E0B' // 橙色
  if (percent >= 50) return '#FBBF24' // 黄色
  return '#10B981' // 绿色
}

/**
 * 格式化 Token 数量
 */
function formatTokens(tokens: number): string {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`
  return tokens.toString()
}
