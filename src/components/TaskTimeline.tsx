/**
 * 任务时间轴组件
 * 显示任务的生命周期
 */

import React from 'react'
import type { Task } from '../types/task'

interface TaskTimelineProps {
  task: Task
}

interface TimelineEvent {
  label: string
  timestamp: string
  status: 'completed' | 'current' | 'pending'
  icon: string
}

export const TaskTimeline: React.FC<TaskTimelineProps> = ({ task }) => {
  const events: TimelineEvent[] = []

  // 创建
  events.push({
    label: '任务创建',
    timestamp: task.createdAt,
    status: 'completed',
    icon: '📝'
  })

  // 开始
  if (task.startedAt) {
    events.push({
      label: '开始执行',
      timestamp: task.startedAt,
      status: 'completed',
      icon: '▶️'
    })
  } else if (task.status === 'pending') {
    events.push({
      label: '等待执行',
      timestamp: '',
      status: 'pending',
      icon: '⏳'
    })
  }

  // 完成/失败
  if (task.completedAt) {
    events.push({
      label: task.status === 'completed' ? '执行完成' : '执行失败',
      timestamp: task.completedAt,
      status: 'completed',
      icon: task.status === 'completed' ? '✅' : '❌'
    })
  } else if (task.status === 'in_progress') {
    events.push({
      label: '执行中...',
      timestamp: '',
      status: 'current',
      icon: '🔄'
    })
  }

  return (
    <div className="relative">
      {events.map((event, index) => (
        <div key={index} className="flex items-start gap-4 pb-6 last:pb-0">
          {/* 图标和连接线 */}
          <div className="relative flex flex-col items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-lg z-10
                ${event.status === 'completed' ? 'bg-green-600' : ''}
                ${event.status === 'current' ? 'bg-blue-600 animate-pulse' : ''}
                ${event.status === 'pending' ? 'bg-gray-700' : ''}
              `}
            >
              {event.icon}
            </div>

            {/* 连接线 */}
            {index < events.length - 1 && (
              <div
                className={`
                  w-0.5 flex-1 absolute top-8 h-full
                  ${event.status === 'completed' ? 'bg-gradient-to-b from-green-600 to-gray-700' : 'bg-gray-700'}
                `}
              />
            )}
          </div>

          {/* 内容 */}
          <div className="flex-1 pt-1">
            <div
              className={`
                font-medium mb-1
                ${event.status === 'completed' ? 'text-white' : ''}
                ${event.status === 'current' ? 'text-blue-400' : ''}
                ${event.status === 'pending' ? 'text-gray-500' : ''}
              `}
            >
              {event.label}
            </div>
            {event.timestamp && (
              <div className="text-xs text-gray-500">
                {formatTimestamp(event.timestamp)}
              </div>
            )}

            {/* 额外信息 */}
            {event.status === 'current' && task.executionProgress !== undefined && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>进度</span>
                  <span>{task.executionProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-400 h-full transition-all duration-300"
                    style={{ width: `${task.executionProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
