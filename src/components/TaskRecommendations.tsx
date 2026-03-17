/**
 * 任务推荐组件
 * 显示智能推荐的任务和Agent匹配
 */

import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useDataSourceStore } from '../store/useDataSourceStore'
import { recommendationEngine, TaskRecommendation } from '../services/ai/recommendationEngine'
import { taskAnalyzer } from '../services/ai/taskAnalyzer'
import { useTranslation } from '../hooks/useTranslation'

interface TaskRecommendationsProps {
  agentId?: string // 为特定Agent推荐
  taskId?: string // 为特定Task推荐
  limit?: number
}

export function TaskRecommendations({
  agentId,
  taskId,
  limit = 5
}: TaskRecommendationsProps) {
  const { t } = useTranslation()
  const { agents, tasks } = useDataSourceStore()
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecommendations()
  }, [agentId, taskId, agents, tasks])

  const loadRecommendations = () => {
    setLoading(true)

    try {
      if (agentId) {
        // 为Agent推荐任务
        const agent = agents.find(a => a.id === agentId)
        if (!agent) return

        const availableTasks = tasks.filter(
          t => t.status === 'pending' || t.status === 'todo'
        )

        const recs = recommendationEngine.recommendTasksForAgent(
          agent,
          availableTasks,
          agents,
          limit
        )
        setRecommendations(recs)
      } else if (taskId) {
        // 为任务推荐Agent
        const task = tasks.find(t => t.id === taskId)
        if (!task) return

        const availableAgents = agents.filter(
          a => a.status === 'idle' || a.status === 'available'
        )

        const recs = recommendationEngine.recommendAgentsForTask(
          task,
          availableAgents,
          limit
        )
        setRecommendations(recs)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleApplyRecommendation = (rec: TaskRecommendation) => {
    // 应用推荐：分配任务给Agent
    const { updateTask } = useDataSourceStore.getState()
    updateTask(rec.task.id, { agentId: rec.agent.id, status: 'in_progress' })

    // 从推荐列表中移除
    setRecommendations(prev => prev.filter(r => r.task.id !== rec.task.id))
  }

  const handleDismissRecommendation = (rec: TaskRecommendation) => {
    setRecommendations(prev => prev.filter(r => r.task.id !== rec.task.id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-purple" />
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center p-8 text-text-muted">
        <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">{t('common.noRecommendations')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-accent-purple" />
        <h3 className="text-lg font-semibold text-text-primary">
          {agentId ? '推荐任务' : '推荐Agent'}
        </h3>
        <span className="text-xs text-text-muted">
          基于AI分析
        </span>
      </div>

      {/* 推荐卡片列表 */}
      {recommendations.map((rec) => (
        <RecommendationCard
          key={`${rec.task.id}-${rec.agent.id}`}
          recommendation={rec}
          onApply={() => handleApplyRecommendation(rec)}
          onDismiss={() => handleDismissRecommendation(rec)}
        />
      ))}
    </div>
  )
}

/**
 * 推荐卡片组件
 */
function RecommendationCard({
  recommendation,
  onApply,
  onDismiss
}: {
  recommendation: TaskRecommendation
  onApply: () => void
  onDismiss: () => void
}) {
  const { task, agent, score, confidence, reasons, metrics } = recommendation

  return (
    <div className="bg-bg-secondary border border-border-dark rounded-lg p-4 hover:shadow-md transition-all duration-200">
      {/* 顶部：评分和置信度 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-text-primary mb-1">
            {task.title}
          </h4>
          <p className="text-xs text-text-secondary">
            {agent.name} • {agent.avatar}
          </p>
        </div>

        {/* 匹配度评分 */}
        <div className="flex flex-col items-end gap-1">
          <div className={`
            px-3 py-1 rounded-full text-xs font-bold
            ${score >= 80 ? 'bg-green-500/20 text-green-400' :
              score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-gray-500/20 text-gray-400'}
          `}>
            {score}分
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-text-muted" />
            <span className="text-xs text-text-muted">
              {Math.round(confidence * 100)}% 置信度
            </span>
          </div>
        </div>
      </div>

      {/* 推荐原因 */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-2">
          {reasons.map((reason, i) => (
            <span
              key={i}
              className="text-xs px-2 py-1 bg-accent-purple/10 text-accent-purple rounded"
            >
              {reason}
            </span>
          ))}
        </div>
      </div>

      {/* 详细指标 */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <MetricBadge
          label="技能匹配"
          value={metrics.skillMatch}
          icon="🎯"
        />
        <MetricBadge
          label="负载平衡"
          value={metrics.workloadBalance}
          icon="⚖️"
        />
        <MetricBadge
          label="历史表现"
          value={metrics.historicalPerformance}
          icon="📈"
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button
          onClick={onApply}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
        >
          <CheckCircle className="w-4 h-4" />
          应用推荐
        </button>
        <button
          onClick={onDismiss}
          className="px-3 py-2 bg-bg-tertiary hover:bg-bg-hover text-text-secondary rounded-lg transition-colors duration-200"
          title="忽略"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/**
 * 指标徽章组件
 */
function MetricBadge({
  label,
  value,
  icon
}: {
  label: string
  value: number
  icon: string
}) {
  const percentage = Math.round(value)
  const color = percentage >= 80 ? 'text-green-400' :
                percentage >= 60 ? 'text-yellow-400' :
                'text-gray-400'

  return (
    <div className="bg-bg-tertiary rounded-lg p-2 text-center">
      <div className="text-lg mb-1">{icon}</div>
      <div className={`text-xs font-bold ${color}`}>
        {percentage}%
      </div>
      <div className="text-xs text-text-muted mt-0.5">
        {label}
      </div>
    </div>
  )
}

export default TaskRecommendations
