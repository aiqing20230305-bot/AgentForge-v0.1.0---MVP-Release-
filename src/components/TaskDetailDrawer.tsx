/**
 * 任务详情抽屉组件
 * 从右侧滑入的详情面板
 */

import React, { useState } from 'react'
import { useTaskStore } from '../stores/taskStore'
import { TaskTimeline } from './TaskTimeline'
import { TaskExecutionLog } from './TaskExecutionLog'
import { downloadTask } from '../utils/taskExporter'
import { useTaskAutoExecution } from '../hooks/useTaskAutoExecution'

interface TaskDetailDrawerProps {
  taskId: string | null
  onClose: () => void
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({ taskId, onClose }) => {
  const { tasks } = useTaskStore()
  const { executeTask, cancelExecution } = useTaskAutoExecution()
  const [activeTab, setActiveTab] = useState<'info' | 'timeline' | 'logs'>('info')

  const task = tasks.find(t => t.id === taskId)

  if (!task) return null

  const handleRetry = async () => {
    await executeTask(task.id)
  }

  const handleCancel = () => {
    cancelExecution(task.id)
  }

  const handleExport = (format: 'json' | 'markdown') => {
    downloadTask(task, format)
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-green-400 bg-green-900/30',
      medium: 'text-yellow-400 bg-yellow-900/30',
      high: 'text-orange-400 bg-orange-900/30',
      urgent: 'text-red-400 bg-red-900/30'
    }
    return colors[priority] || colors.medium
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'text-gray-400 bg-gray-900/30',
      in_progress: 'text-blue-400 bg-blue-900/30',
      completed: 'text-green-400 bg-green-900/30',
      failed: 'text-red-400 bg-red-900/30'
    }
    return colors[status] || colors.pending
  }

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* 抽屉 */}
      <div className="fixed top-0 right-0 h-full w-[600px] bg-gray-900 shadow-xl z-50 flex flex-col animate-slide-in-right">
        {/* 头部 */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex-1 pr-4">{task.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center flex-shrink-0"
            >
              ×
            </button>
          </div>

          <div className="flex gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            {task.tags?.map(tag => (
              <span key={tag} className="px-2 py-1 rounded text-xs bg-gray-800 text-gray-300">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 标签页 */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'info'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📋 详细信息
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'timeline'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📅 时间轴
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'logs'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📝 执行日志
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* 描述 */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-2">任务描述</h3>
                <p className="text-white whitespace-pre-wrap">{task.description}</p>
              </div>

              {/* Agent信息 */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-2">执行Agent</h3>
                <p className="text-white">{task.agentName}</p>
              </div>

              {/* 时间信息 */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-2">时间信息</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">创建时间：</span>
                    <span className="text-white">{new Date(task.createdAt).toLocaleString()}</span>
                  </div>
                  {task.startedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">开始时间：</span>
                      <span className="text-white">{new Date(task.startedAt).toLocaleString()}</span>
                    </div>
                  )}
                  {task.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">完成时间：</span>
                      <span className="text-white">{new Date(task.completedAt).toLocaleString()}</span>
                    </div>
                  )}
                  {task.actualDuration && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">实际耗时：</span>
                      <span className="text-white">{task.actualDuration.toFixed(1)} 秒</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Token使用 */}
              {task.tokenMetrics && (
                <div>
                  <h3 className="text-sm font-bold text-gray-400 mb-2">Token使用情况</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">实际Token：</span>
                      <span className="text-white">{task.tokenMetrics.actualTokens.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">输入Token：</span>
                      <span className="text-white">{task.tokenMetrics.inputTokens.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">输出Token：</span>
                      <span className="text-white">{task.tokenMetrics.outputTokens.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">成本：</span>
                      <span className="text-white">${task.tokenMetrics.costUSD.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 执行结果 */}
              {task.result && (
                <div>
                  <h3 className="text-sm font-bold text-gray-400 mb-2">执行结果</h3>
                  <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                    <p className="text-green-300 text-sm">{task.result}</p>
                  </div>
                </div>
              )}

              {/* 错误信息 */}
              {task.errorMessage && (
                <div>
                  <h3 className="text-sm font-bold text-gray-400 mb-2">错误信息</h3>
                  <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                    <p className="text-red-300 text-sm">{task.errorMessage}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && <TaskTimeline task={task} />}

          {activeTab === 'logs' && (
            <TaskExecutionLog logs={task.executionLog || []} maxHeight="500px" />
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <div className="flex gap-2">
            {task.status === 'failed' && (
              <button
                onClick={handleRetry}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
              >
                🔄 重试
              </button>
            )}
            {task.status === 'in_progress' && (
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors font-medium"
              >
                ❌ 取消执行
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleExport('markdown')}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
            >
              📄 导出 Markdown
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
            >
              📦 导出 JSON
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
