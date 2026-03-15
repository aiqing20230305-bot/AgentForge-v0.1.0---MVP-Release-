/**
 * Health Recommendations Component
 * 健康建议系统 - 基于Agent状态生成优化建议
 */

import React from 'react'
import type { HeartbeatData } from '../types/evolution'
import type { OpenClawAgent } from '../utils/openclawLoader'

interface HealthRecommendationsProps {
  agent: OpenClawAgent
  latestHeartbeat: HeartbeatData | null
  historyData: HeartbeatData[]
}

interface Recommendation {
  id: string
  type: 'critical' | 'warning' | 'suggestion' | 'positive'
  icon: string
  title: string
  description: string
  action?: string
}

/**
 * 生成健康建议
 */
function generateRecommendations(
  agent: OpenClawAgent,
  latestHeartbeat: HeartbeatData | null,
  historyData: HeartbeatData[]
): Recommendation[] {
  const recommendations: Recommendation[] = []

  if (!latestHeartbeat) {
    return [
      {
        id: 'no-data',
        type: 'warning',
        icon: '⚠️',
        title: '暂无心跳数据',
        description: 'Agent尚未开始记录心跳数据，请等待第一次心跳检测。',
        action: '等待30秒后自动检测'
      }
    ]
  }

  const vitality = latestHeartbeat.vitality
  const metrics = latestHeartbeat.metrics

  // 1. 生命力危急
  if (vitality < 40) {
    recommendations.push({
      id: 'vitality-critical',
      type: 'critical',
      icon: '🚨',
      title: '生命力危急！',
      description: `当前生命力仅为 ${vitality}，Agent急需休息和优化。建议立即检查任务负载和Token使用情况。`,
      action: '优先处理高优任务，暂停低优任务'
    })
  }

  // 2. 生命力警告
  else if (vitality < 70) {
    recommendations.push({
      id: 'vitality-warning',
      type: 'warning',
      icon: '⚠️',
      title: '生命力偏低',
      description: `当前生命力为 ${vitality}，建议适当减轻任务负担，优化工作流程。`,
      action: '调整任务优先级，避免过载'
    })
  }

  // 3. 生命力优秀
  else if (vitality >= 90) {
    recommendations.push({
      id: 'vitality-excellent',
      type: 'positive',
      icon: '🌟',
      title: '状态极佳！',
      description: `当前生命力高达 ${vitality}，Agent处于最佳工作状态。继续保持！`,
      action: '可以接受更具挑战性的任务'
    })
  }

  // 4. Token 使用率过高
  const agentWithEnergy = agent as any
  if (agentWithEnergy.energyStats && agentWithEnergy.energyBudget) {
    const tokenUsage =
      (agentWithEnergy.energyStats.tokensUsedToday / agentWithEnergy.energyBudget.dailyLimit) * 100

    if (tokenUsage > 90) {
      recommendations.push({
        id: 'token-critical',
        type: 'critical',
        icon: '⚡',
        title: 'Token预算即将耗尽',
        description: `今日已使用 ${tokenUsage.toFixed(1)}% 的Token预算，请立即优化Token使用或调整预算。`,
        action: '启用Token优化策略，减少重复调用'
      })
    } else if (tokenUsage > 70) {
      recommendations.push({
        id: 'token-warning',
        type: 'warning',
        icon: '💎',
        title: 'Token使用率较高',
        description: `今日已使用 ${tokenUsage.toFixed(1)}% 的Token预算，建议注意控制。`,
        action: '优化Prompt，减少不必要的API调用'
      })
    }
  }

  // 5. 任务队列过长
  if (metrics.taskQueueLength > 20) {
    recommendations.push({
      id: 'queue-overload',
      type: 'warning',
      icon: '📋',
      title: '任务队列过长',
      description: `当前队列中有 ${metrics.taskQueueLength} 个待处理任务，建议分配给其他Agent或提高自动执行频率。`,
      action: '启用任务分流，增加并发处理'
    })
  } else if (metrics.taskQueueLength > 10) {
    recommendations.push({
      id: 'queue-busy',
      type: 'suggestion',
      icon: '📝',
      title: '任务较多',
      description: `队列中有 ${metrics.taskQueueLength} 个任务，建议优先处理高优先级任务。`,
      action: '按优先级排序任务队列'
    })
  }

  // 6. 成功率偏低
  if (metrics.successRate < 70 && metrics.successRate > 0) {
    recommendations.push({
      id: 'success-rate-low',
      type: 'warning',
      icon: '❌',
      title: '成功率偏低',
      description: `最近任务成功率仅为 ${metrics.successRate.toFixed(1)}%，建议检查任务难度配置和技能匹配度。`,
      action: '降低任务难度或提升Agent技能'
    })
  }

  // 7. 闲置时间过长
  if (metrics.idleTime > 86400) {
    const idleDays = Math.floor(metrics.idleTime / 86400)
    recommendations.push({
      id: 'idle-too-long',
      type: 'suggestion',
      icon: '💤',
      title: 'Agent闲置时间过长',
      description: `Agent已闲置 ${idleDays} 天，建议分配新任务以保持活跃。`,
      action: '分配适合的新任务'
    })
  }

  // 8. 平均任务耗时过长
  if (metrics.avgTaskDuration > 3600) {
    const avgHours = (metrics.avgTaskDuration / 3600).toFixed(1)
    recommendations.push({
      id: 'task-duration-long',
      type: 'suggestion',
      icon: '⏱️',
      title: '任务耗时较长',
      description: `平均任务耗时 ${avgHours} 小时，建议拆分大任务或优化执行流程。`,
      action: '拆分复杂任务，优化执行策略'
    })
  }

  // 9. 生命力趋势分析
  if (historyData.length >= 5) {
    const recent5 = historyData.slice(-5)
    const trend =
      recent5[recent5.length - 1].vitality - recent5[0].vitality

    if (trend < -10) {
      recommendations.push({
        id: 'vitality-declining',
        type: 'warning',
        icon: '📉',
        title: '生命力持续下降',
        description: '最近生命力呈下降趋势，请尽快采取优化措施。',
        action: '全面检查Agent配置和任务分配'
      })
    } else if (trend > 10) {
      recommendations.push({
        id: 'vitality-improving',
        type: 'positive',
        icon: '📈',
        title: '生命力稳步提升',
        description: '最近优化措施生效，生命力持续上升。继续保持！',
        action: '维持当前优化策略'
      })
    }
  }

  // 10. 无问题 - 表扬
  if (recommendations.filter(r => r.type !== 'positive').length === 0) {
    recommendations.push({
      id: 'all-good',
      type: 'positive',
      icon: '✨',
      title: '一切正常',
      description: 'Agent运行状态良好，所有指标都在正常范围内。',
      action: '继续保持优秀表现'
    })
  }

  return recommendations
}

/**
 * 获取建议类型颜色
 */
function getTypeColor(type: Recommendation['type']): {
  bg: string
  border: string
  text: string
} {
  switch (type) {
    case 'critical':
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/50',
        text: 'text-red-400'
      }
    case 'warning':
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/50',
        text: 'text-amber-400'
      }
    case 'suggestion':
      return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/50',
        text: 'text-blue-400'
      }
    case 'positive':
      return {
        bg: 'bg-green-500/10',
        border: 'border-green-500/50',
        text: 'text-green-400'
      }
  }
}

export const HealthRecommendations: React.FC<HealthRecommendationsProps> = ({
  agent,
  latestHeartbeat,
  historyData
}) => {
  const recommendations = generateRecommendations(
    agent,
    latestHeartbeat,
    historyData
  )

  // 按严重程度排序
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priority = { critical: 0, warning: 1, suggestion: 2, positive: 3 }
    return priority[a.type] - priority[b.type]
  })

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-medium text-white flex items-center gap-2">
          <span>💡</span>
          健康建议
        </h4>
        <div className="text-xs text-gray-400">
          {sortedRecommendations.length} 条建议
        </div>
      </div>

      <div className="space-y-2">
        {sortedRecommendations.map(recommendation => {
          const colors = getTypeColor(recommendation.type)

          return (
            <div
              key={recommendation.id}
              className={`${colors.bg} border ${colors.border} rounded-lg p-3 backdrop-blur-sm transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">
                  {recommendation.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <h5 className={`text-sm font-medium ${colors.text} mb-1`}>
                    {recommendation.title}
                  </h5>
                  <p className="text-xs text-gray-300 mb-2">
                    {recommendation.description}
                  </p>
                  {recommendation.action && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">💡 建议：</span>
                      <span className="text-xs text-gray-400">
                        {recommendation.action}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
