import { useState, useEffect } from 'react'
import { X, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { TaskInfo } from '../services/openclawApi'
import { useDataSourceStore } from '../store/useDataSourceStore'
import { AdapterManager } from '../adapters/AdapterManager'

interface AgentTaskHistoryProps {
  agentId: string
  agentName: string
  sourceId: string
  onClose: () => void
}

export default function AgentTaskHistory({
  agentId,
  agentName,
  sourceId,
  onClose
}: AgentTaskHistoryProps) {
  const [tasks, setTasks] = useState<TaskInfo[]>([])
  const [loading, setLoading] = useState(true)
  const { sources } = useDataSourceStore()
  const adapterManager = AdapterManager.getInstance()

  const loadTasks = async () => {
    setLoading(true)
    try {
      // 如果没有提供sourceId，尝试从所有数据源获取任务
      if (!sourceId) {
        console.warn('No sourceId provided, skipping task load')
        setLoading(false)
        return
      }

      const source = sources.find(s => s.id === sourceId)
      if (!source) {
        console.error('数据源不存在:', sourceId)
        // console.log('可用的数据源:', sources)
        setLoading(false)
        return
      }

      const adapter = adapterManager.getAdapter(source.type)
      if (!adapter) {
        console.error('未找到适配器，类型:', source.type)
        setLoading(false)
        return
      }

      // console.log('正在加载任务，agent:', agentId, 'source:', sourceId)

      // 从OpenClaw API获取任务列表
      const client = (adapter as any).createClient?.(source)
      if (client && client.getTasks) {
        // console.log('调用 getTasks API...')
        const taskList = await client.getTasks(agentId)
        // console.log('获取到任务:', taskList)
        setTasks(taskList || [])
      } else {
        console.error('无法创建API客户端或getTasks方法不存在')
      }
    } catch (error) {
      console.error('加载任务失败:', error)
      alert(`加载任务失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [agentId, sourceId])

  const getStatusIcon = (status: TaskInfo['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-400 animate-spin" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
    }
  }

  const getStatusColor = (status: TaskInfo['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500/50 bg-green-500/10'
      case 'failed':
        return 'border-red-500/50 bg-red-500/10'
      case 'in_progress':
        return 'border-blue-500/50 bg-blue-500/10'
      default:
        return 'border-yellow-500/50 bg-yellow-500/10'
    }
  }

  const getPriorityColor = (priority: TaskInfo['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-400'
      case 'medium':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">{agentName} - 任务记录</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadTasks}
              disabled={loading}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无任务记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-[1.01] ${getStatusColor(task.status)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      {getStatusIcon(task.status)}
                      <h3 className="text-white font-medium">{task.title}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority === 'high'
                          ? '高优先级'
                          : task.priority === 'medium'
                            ? '中优先级'
                            : '低优先级'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(task.updatedAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                  {task.description && (
                    <p className="text-sm text-slate-300 mb-2 ml-6">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 ml-6 text-xs text-slate-500">
                    <span>创建: {new Date(task.createdAt).toLocaleString('zh-CN')}</span>
                    <span>
                      状态:{' '}
                      {task.status === 'completed'
                        ? '已完成'
                        : task.status === 'failed'
                          ? '失败'
                          : task.status === 'in_progress'
                            ? '进行中'
                            : '待处理'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
