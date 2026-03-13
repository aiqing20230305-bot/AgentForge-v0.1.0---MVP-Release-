import { useState } from 'react'
import { useTaskStore } from '../stores/taskStore'
import { useChatStore } from '../store/useChatStore'
import {
  Plus,
  Filter,
  Clock,
  CheckCircle2,
  Circle,
  XCircle,
  AlertCircle,
  MessageSquare
} from 'lucide-react'
import type { Task, TaskStatus, TaskPriority } from '../types/task'
import AgentChatPanel from './AgentChatPanel'
import { useRipple } from '../hooks/useRipple'

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

export default function TaskManagementPanel() {
  const {
    selectedAgentId,
    filterStatus,
    filterTimeRange,
    setFilterStatus,
    setFilterTimeRange,
    getFilteredTasks,
    getTaskStats,
    selectedTask,
    setSelectedTask,
    updateTask
  } = useTaskStore()

  const { getUnreadCount } = useChatStore()
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [chatTask, setChatTask] = useState<Task | null>(null)
  const { createRipple } = useRipple()

  const tasks = getFilteredTasks()
  const stats = getTaskStats(selectedAgentId || undefined)

  // 调试信息
  console.log('[TaskPanel] Selected agent:', selectedAgentId)
  console.log('[TaskPanel] Total tasks in store:', useTaskStore.getState().tasks.length)
  console.log('[TaskPanel] Filtered tasks:', tasks.length)
  console.log(
    '[TaskPanel] First 3 task agentIds:',
    tasks.slice(0, 3).map(t => t.agentId)
  )
  console.log('[TaskPanel] Stats:', stats)

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    const updates: any = { status: newStatus }

    if (newStatus === 'in_progress' && !tasks.find(t => t.id === taskId)?.startedAt) {
      updates.startedAt = new Date().toISOString()
    }

    if (newStatus === 'completed' || newStatus === 'failed') {
      updates.completedAt = new Date().toISOString()
    }

    updateTask(taskId, updates)
  }

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* 头部 - macOS 风格 */}
      <div className="p-4 border-b border-white/20 bg-white/5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white uppercase tracking-wide flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>任务管理 ({tasks.length})</span>
          </h2>
          <button
            onClick={e => {
              createRipple(e)
              setShowNewTaskModal(true)
            }}
            className="px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 rounded-xl backdrop-blur-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            新增任务
          </button>
        </div>

        {/* 统计卡片 - macOS 彩色渐变 */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div
            onClick={createRipple}
            className="bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-xl p-2 text-center cursor-pointer transition-all hover:scale-105 active:scale-95"
            style={{
              background:
                'linear-gradient(135deg, rgba(20, 184, 166, 0.25), rgba(13, 148, 136, 0.15))'
            }}
          >
            <div className="text-xs text-white/70">总计</div>
            <div className="text-lg font-bold text-white">{stats.total}</div>
          </div>
          <div
            onClick={createRipple}
            className="bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-xl p-2 text-center cursor-pointer transition-all hover:scale-105 active:scale-95"
            style={{
              background:
                'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(8, 145, 178, 0.15))'
            }}
          >
            <div className="text-xs text-white/70">进行中</div>
            <div className="text-lg font-bold text-white">{stats.in_progress}</div>
          </div>
          <div
            onClick={createRipple}
            className="bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-xl p-2 text-center cursor-pointer transition-all hover:scale-105 active:scale-95"
            style={{
              background:
                'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.15))'
            }}
          >
            <div className="text-xs text-white/70">已完成</div>
            <div className="text-lg font-bold text-white">{stats.completed}</div>
          </div>
          <div
            onClick={createRipple}
            className="bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-xl p-2 text-center cursor-pointer transition-all hover:scale-105 active:scale-95"
            style={{
              background:
                'linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(2, 132, 199, 0.15))'
            }}
          >
            <div className="text-xs text-white/70">待处理</div>
            <div className="text-lg font-bold text-white">{stats.pending}</div>
          </div>
        </div>

        {/* 过滤器 */}
        <div className="flex gap-2">
          {/* 状态过滤 */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="flex-1 px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#3a3a3a] text-amber-100 rounded"
          >
            <option value="all">全部状态</option>
            <option value="pending">待处理</option>
            <option value="in_progress">进行中</option>
            <option value="completed">已完成</option>
            <option value="failed">失败</option>
          </select>

          {/* 时间过滤 */}
          <select
            value={filterTimeRange}
            onChange={e => setFilterTimeRange(e.target.value as any)}
            className="flex-1 px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#3a3a3a] text-amber-100 rounded"
          >
            <option value="all">全部时间</option>
            <option value="today">今天</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
          </select>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 scrollbar-hide">
        {tasks.length === 0 ? (
          <div className="text-center text-white py-12">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-40" />
            {selectedAgentId ? (
              <>
                <p className="text-white text-lg font-medium">该 Agent 暂无任务</p>
                <p className="text-sm mt-2 text-white/60">Agent: {selectedAgentId.toUpperCase()}</p>
                <button
                  onClick={() => setShowNewTaskModal(true)}
                  className="mt-4 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-sm font-medium transition-colors"
                >
                  + 创建任务
                </button>
              </>
            ) : (
              <>
                <p className="text-white text-lg font-medium">请先选择 Agent</p>
                <p className="text-sm mt-2 text-white/60">在左上方点击 Agent 头像查看对应任务</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => {
              const StatusIcon = STATUS_CONFIG[task.status].icon
              const isSelected = selectedTask?.id === task.id

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(isSelected ? null : task)}
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
                        <div className="text-base font-bold text-white mb-1.5">{task.title}</div>
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
                          setChatTask(task)
                        }}
                        className="relative p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 transition-all hover:scale-110 group"
                        title="与 Agent 对话"
                      >
                        <MessageSquare className="w-4 h-4 text-blue-300 group-hover:animate-pulse" />
                        {getUnreadCount(task.id) > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                            {getUnreadCount(task.id)}
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

                    {/* 状态选择器 */}
                    <select
                      value={task.status}
                      onChange={e => {
                        e.stopPropagation()
                        handleStatusChange(task.id, e.target.value as TaskStatus)
                      }}
                      onClick={e => e.stopPropagation()}
                      className="px-3 py-1.5 text-sm bg-white/5 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <option value="pending">待处理</option>
                      <option value="in_progress">进行中</option>
                      <option value="completed">已完成</option>
                      <option value="failed">失败</option>
                    </select>
                  </div>

                  {/* 展开的详情 */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      {/* 标签 */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {task.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/90 border border-white/20 font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 时间信息 */}
                      <div className="text-sm text-white/70 space-y-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-white/50">创建:</span>
                          <span className="font-medium">
                            {new Date(task.createdAt).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        {task.startedAt && (
                          <div className="flex items-center gap-2">
                            <span className="text-white/50">开始:</span>
                            <span className="font-medium">
                              {new Date(task.startedAt).toLocaleString('zh-CN')}
                            </span>
                          </div>
                        )}
                        {task.completedAt && (
                          <div className="flex items-center gap-2">
                            <span className="text-white/50">完成:</span>
                            <span className="font-medium">
                              {new Date(task.completedAt).toLocaleString('zh-CN')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 任务结果 */}
                      {task.result && (
                        <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-3">
                          <div className="text-sm font-bold text-green-300 mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            执行结果
                          </div>
                          <div className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
                            {task.result}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 新增任务模态框 */}
      {showNewTaskModal && <NewTaskModal onClose={() => setShowNewTaskModal(false)} />}

      {/* Agent 对话面板 */}
      {chatTask && <AgentChatPanel task={chatTask} onClose={() => setChatTask(null)} />}
    </div>
  )
}

// 新增任务模态框组件
function NewTaskModal({ onClose }: { onClose: () => void }) {
  const { addTask, selectedAgentId } = useTaskStore()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    agentId: selectedAgentId || 'atlas',
    agentName: 'ATLAS'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    addTask({
      ...formData,
      status: 'pending'
    })

    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a1a] border-2 border-amber-500 rounded-lg p-6 w-[500px] max-w-[90vw]"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-amber-100 mb-4">新增任务</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 任务标题 */}
          <div>
            <label className="block text-xs text-amber-100/80 mb-1">任务标题 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3 py-2 text-sm bg-[#0a0a0a] border border-[#3a3a3a] text-amber-100 rounded"
              placeholder="输入任务标题"
            />
          </div>

          {/* 任务描述 */}
          <div>
            <label className="block text-xs text-amber-100/80 mb-1">任务描述 *</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              className="w-full px-3 py-2 text-sm bg-[#0a0a0a] border border-[#3a3a3a] text-amber-100 rounded resize-none"
              placeholder="详细描述任务内容和要求"
            />
          </div>

          {/* 优先级 */}
          <div>
            <label className="block text-xs text-amber-100/80 mb-1">优先级</label>
            <select
              value={formData.priority}
              onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
              className="w-full px-3 py-2 text-sm bg-[#0a0a0a] border border-[#3a3a3a] text-amber-100 rounded"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="urgent">紧急</option>
            </select>
          </div>

          {/* 分配给 Agent */}
          <div>
            <label className="block text-xs text-amber-100/80 mb-1">分配给</label>
            <select
              value={formData.agentId}
              onChange={e => {
                const agentId = e.target.value
                const agentNames: Record<string, string> = {
                  atlas: 'ATLAS',
                  clip: 'CLIP',
                  oracle: 'ORACLE',
                  sentinel: 'SENTINEL'
                }
                setFormData({ ...formData, agentId, agentName: agentNames[agentId] })
              }}
              className="w-full px-3 py-2 text-sm bg-[#0a0a0a] border border-[#3a3a3a] text-amber-100 rounded"
            >
              <option value="atlas">ATLAS - Team Leader</option>
              <option value="clip">CLIP - Full Stack Dev</option>
              <option value="oracle">ORACLE - Knowledge Keeper</option>
              <option value="sentinel">SENTINEL - Security Chief</option>
            </select>
          </div>

          {/* 按钮 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-[#4a4a4a] text-amber-100 rounded transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm bg-amber-700/80 hover:bg-amber-600 border border-amber-500 text-amber-100 font-bold rounded transition-colors"
            >
              创建任务
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
