/**
 * TaskListItem - Optimized task card component
 * Memoized for virtual scrolling performance
 */

import React, { memo } from 'react'
import {
  CheckCircle2,
  Circle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Play,
  Eye,
  StopCircle,
  Cloud
} from 'lucide-react'
import type { Task } from '../types/task'
import { useInstantFeedback } from '../hooks/useInstantFeedback'
import { audioSystem } from '../services/audioSystem'

const STATUS_CONFIG = {
  pending: { label: '待处理', icon: Circle, color: '#9CA3AF' },
  in_progress: { label: '进行中', icon: AlertCircle, color: '#3B82F6' },
  completed: { label: '已完成', icon: CheckCircle2, color: '#10B981' },
  failed: { label: '失败', icon: XCircle, color: '#EF4444' }
}

const PRIORITY_CONFIG = {
  low: { label: '低', color: '#9CA3AF' },
  medium: { label: '中', color: '#F59E0B' },
  high: { label: '高', color: '#EF4444' },
  urgent: { label: '紧急', color: '#DC2626' }
}

interface TaskListItemProps {
  task: Task
  isSelected: boolean
  onSelect: () => void
  onChat: () => void
  onViewDetail: () => void
  onExecute?: () => void
  onCancel?: () => void
  unreadCount: number
  style?: React.CSSProperties
}

export const TaskListItem = memo<TaskListItemProps>(({
  task,
  isSelected,
  onSelect,
  onChat,
  onViewDetail,
  onExecute,
  onCancel,
  unreadCount,
  style
}) => {
  const feedback = useInstantFeedback()
  const StatusIcon = STATUS_CONFIG[task.status].icon

  return (
    <div style={style}>
      <div
        onClick={onSelect}
        className={`bg-white/10 backdrop-blur-sm border-2 rounded-xl p-4 cursor-pointer transition-all hover:bg-white/15 hover:scale-[1.02] ${
          isSelected
            ? 'border-cyan-400 shadow-lg shadow-cyan-500/20'
            : 'border-white/20 hover:border-white/30'
        }`}
      >
        {/* 任务头部 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div
              className={`p-2 rounded-lg ${
                task.status === 'completed'
                  ? 'bg-green-500/20'
                  : task.status === 'in_progress'
                    ? 'bg-blue-500/20'
                    : task.status === 'failed'
                      ? 'bg-red-500/20'
                      : 'bg-gray-500/20'
              }`}
            >
              <StatusIcon
                className="w-5 h-5"
                style={{ color: STATUS_CONFIG[task.status].color }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-base font-bold text-white mb-1.5">
                <span>{task.title}</span>
                {task.cloudId && (
                  <div title="已同步到云端">
                    <Cloud className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  </div>
                )}
              </div>
              <div className="text-sm text-white/70 line-clamp-2 leading-relaxed">
                {task.description}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {/* 对话按钮 */}
            <button
              onClick={e => {
                e.stopPropagation()
                onChat()
              }}
              className="relative p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 transition-all hover:scale-110 group"
              title="与 Agent 对话"
            >
              <MessageSquare className="w-4 h-4 text-blue-300 group-hover:animate-pulse" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* 优先级标签 */}
            <span
              className="text-xs px-3 py-1 rounded-full font-bold border"
              style={{
                backgroundColor: PRIORITY_CONFIG[task.priority].color + '30',
                borderColor: PRIORITY_CONFIG[task.priority].color + '80',
                color: PRIORITY_CONFIG[task.priority].color
              }}
            >
              {PRIORITY_CONFIG[task.priority].label}
            </span>
          </div>
        </div>

        {/* 执行进度条 */}
        {task.status === 'in_progress' && task.executionProgress !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-white/60 mb-1">
              <span>执行进度</span>
              <span>{task.executionProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-blue-400 h-full transition-all duration-300"
                style={{ width: `${task.executionProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 任务信息 */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3 text-white/60">
            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
              👤 <span className="font-medium text-white/80">{task.agentName}</span>
            </span>
            <span className="bg-white/5 px-2 py-1 rounded">
              {new Date(task.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            {/* 查看详情按钮 */}
            <button
              onClick={e => {
                e.stopPropagation()
                feedback.onClick(e)
                audioSystem.play('click')
                onViewDetail()
              }}
              className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 transition-all hover:scale-110"
              title="查看详情"
            >
              <Eye className="w-4 h-4 text-purple-300" />
            </button>

            {/* 执行/取消按钮 */}
            {task.autoExecution && (
              <>
                {task.status === 'in_progress' ? (
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onCancel?.()
                    }}
                    className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 transition-all hover:scale-110"
                    title="取消执行"
                  >
                    <StopCircle className="w-4 h-4 text-red-300" />
                  </button>
                ) : task.status === 'pending' && onExecute ? (
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onExecute()
                    }}
                    className="p-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 transition-all hover:scale-110"
                    title="开始执行"
                  >
                    <Play className="w-4 h-4 text-green-300" />
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

TaskListItem.displayName = 'TaskListItem'
