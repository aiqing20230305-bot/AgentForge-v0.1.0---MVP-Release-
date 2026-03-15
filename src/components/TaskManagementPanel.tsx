import { useState } from 'react'
import { useTaskStore } from '../stores/taskStore'
import {
  Plus,
  Clock,
  Play,
  Pause
} from 'lucide-react'
import type { Task, TaskPriority } from '../types/task'
import AgentChatPanel from './AgentChatPanel'
import { useInstantFeedback } from '../hooks/useInstantFeedback'
import { audioSystem } from '../services/audioSystem'
import { TaskDetailDrawer } from './TaskDetailDrawer'
import { TaskSearchBar } from './TaskSearchBar'
// import { VirtualizedTaskList } from './VirtualizedTaskList' // Temporarily disabled for v1.1.0 screenshots
import { TaskListItem } from './TaskListItem'

export default function TaskManagementPanel() {
  const {
    selectedAgentId,
    filterStatus,
    filterTimeRange,
    setFilterStatus,
    setFilterTimeRange,
    getFilteredTasks,
    getTaskStats,
    setSearchTerm
  } = useTaskStore()
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [chatTask, setChatTask] = useState<Task | null>(null)
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [autoExecutionEnabled, setAutoExecutionEnabled] = useState(true)
  const feedback = useInstantFeedback()

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

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* 头部 - macOS 风格 */}
      <div className="p-4 border-b border-white/20 bg-white/5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white uppercase tracking-wide flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>任务管理 ({tasks.length})</span>
          </h2>
          <div className="flex items-center gap-2">
            {/* 自动执行开关 */}
            <button
              onClick={e => {
                feedback.onClick(e)
                audioSystem.play('click')
                setAutoExecutionEnabled(!autoExecutionEnabled)
              }}
              className={`px-3 py-1.5 text-xs font-medium border rounded-xl backdrop-blur-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1 feedback-button-scale ${
                autoExecutionEnabled
                  ? 'text-green-300 bg-green-900/30 border-green-500/50 hover:bg-green-900/40'
                  : 'text-gray-400 bg-gray-900/30 border-gray-600/50 hover:bg-gray-900/40'
              }`}
            >
              {autoExecutionEnabled ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              自动执行
            </button>
            <button
              onClick={e => {
                feedback.onClick(e)
                audioSystem.play('click')
                setShowNewTaskModal(true)
              }}
              className="px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 rounded-xl backdrop-blur-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1 feedback-button-scale feedback-button-glow"
            >
              <Plus className="w-3 h-3" />
              新增任务
            </button>
          </div>
        </div>

        {/* 统计卡片 - macOS 彩色渐变 */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div
            onClick={() => {}}
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
            onClick={() => {}}
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
            onClick={() => {}}
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
            onClick={() => {}}
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

        {/* 搜索栏 */}
        <div className="mb-3">
          <TaskSearchBar
            onSearch={setSearchTerm}
            placeholder="搜索任务标题、描述、标签或Agent..."
            showHistory={true}
          />
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
          <div className="overflow-y-auto space-y-3 pr-2">
            {tasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                isSelected={false}
                onSelect={() => {}}
                onChat={() => setChatTask(task)}
                onViewDetail={() => setDetailTaskId(task.id)}
                unreadCount={0}
              />
            ))}
          </div>
        )}
      </div>

      {/* 新增任务模态框 */}
      {showNewTaskModal && <NewTaskModal onClose={() => setShowNewTaskModal(false)} />}

      {/* Agent 对话面板 */}
      {chatTask && <AgentChatPanel task={chatTask} onClose={() => setChatTask(null)} />}

      {/* 任务详情抽屉 */}
      <TaskDetailDrawer taskId={detailTaskId} onClose={() => setDetailTaskId(null)} />
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
