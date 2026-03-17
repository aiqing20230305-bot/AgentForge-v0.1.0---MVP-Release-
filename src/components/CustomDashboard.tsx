/**
 * Custom Dashboard - 可拖拽布局编辑器
 * Task #85: 创建自定义Dashboard
 *
 * 功能：
 * 1. 集成react-grid-layout实现拖拽布局
 * 2. 多种Widget类型（Agent状态、任务进度、统计数据等）
 * 3. 布局保存/恢复
 * 4. 预设布局模板
 * 5. 编辑模式开关
 */

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layout as LayoutIcon,
  Edit3,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Settings,
  Activity,
  BarChart3,
  Users,
  Clock,
  Zap,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  FileText,
  X
} from 'lucide-react'
import type { OpenClawAgent } from '../utils/openclawLoader'
import type { Task } from '../types/task'

// Widget类型定义
export type WidgetType =
  | 'agent-status'      // Agent状态卡片
  | 'task-progress'     // 任务进度图表
  | 'statistics'        // 统计数据
  | 'quick-actions'     // 快捷操作按钮
  | 'custom-embed'      // 自定义嵌入
  | 'recent-tasks'      // 最近任务列表
  | 'agent-vitality'    // Agent生命力
  | 'performance-chart' // 性能图表

export interface DashboardWidget {
  id: string
  type: WidgetType
  title: string
  x: number
  y: number
  w: number
  h: number
  config?: {
    agentId?: string
    customContent?: string
    embedUrl?: string
    embedType?: 'iframe' | 'markdown'
    showHeader?: boolean
    color?: string
    [key: string]: any
  }
}

export interface DashboardLayout {
  id: string
  name: string
  widgets: DashboardWidget[]
  createdAt: string
  updatedAt: string
}

interface CustomDashboardProps {
  agents: OpenClawAgent[]
  tasks: Task[]
  onWidgetAction?: (action: string, widgetId: string) => void
}

// 预设布局模板
const PRESET_LAYOUTS: Omit<DashboardLayout, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '默认布局',
    widgets: [
      {
        id: 'widget-1',
        type: 'agent-status',
        title: 'Agent状态总览',
        x: 0,
        y: 0,
        w: 6,
        h: 2
      },
      {
        id: 'widget-2',
        type: 'task-progress',
        title: '任务进度',
        x: 6,
        y: 0,
        w: 6,
        h: 2
      },
      {
        id: 'widget-3',
        type: 'statistics',
        title: '统计数据',
        x: 0,
        y: 2,
        w: 4,
        h: 2
      },
      {
        id: 'widget-4',
        type: 'recent-tasks',
        title: '最近任务',
        x: 4,
        y: 2,
        w: 8,
        h: 2
      }
    ]
  },
  {
    name: 'Agent监控',
    widgets: [
      {
        id: 'widget-1',
        type: 'agent-vitality',
        title: 'Agent生命力',
        x: 0,
        y: 0,
        w: 4,
        h: 2
      },
      {
        id: 'widget-2',
        type: 'agent-status',
        title: 'Agent状态',
        x: 4,
        y: 0,
        w: 8,
        h: 2
      },
      {
        id: 'widget-3',
        type: 'performance-chart',
        title: '性能监控',
        x: 0,
        y: 2,
        w: 12,
        h: 3
      }
    ]
  },
  {
    name: '任务中心',
    widgets: [
      {
        id: 'widget-1',
        type: 'quick-actions',
        title: '快捷操作',
        x: 0,
        y: 0,
        w: 3,
        h: 2
      },
      {
        id: 'widget-2',
        type: 'task-progress',
        title: '任务进度',
        x: 3,
        y: 0,
        w: 9,
        h: 2
      },
      {
        id: 'widget-3',
        type: 'recent-tasks',
        title: '任务列表',
        x: 0,
        y: 2,
        w: 12,
        h: 3
      }
    ]
  }
]

export const CustomDashboard: React.FC<CustomDashboardProps> = ({
  agents = [],
  tasks = [],
  onWidgetAction
}) => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(null)
  const [savedLayouts, setSavedLayouts] = useState<DashboardLayout[]>([])
  const [showAddWidget, setShowAddWidget] = useState(false)
  const [showLayoutMenu, setShowLayoutMenu] = useState(false)

  // 加载保存的布局
  useEffect(() => {
    const stored = localStorage.getItem('dashboard-layouts')
    if (stored) {
      try {
        const layouts = JSON.parse(stored)
        setSavedLayouts(layouts)
        if (layouts.length > 0) {
          setCurrentLayout(layouts[0])
        }
      } catch (e) {
        console.error('[CustomDashboard] Failed to load layouts:', e)
      }
    }

    // 如果没有保存的布局，使用默认布局
    if (!stored) {
      const defaultLayout: DashboardLayout = {
        id: `layout-${Date.now()}`,
        ...PRESET_LAYOUTS[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setCurrentLayout(defaultLayout)
      setSavedLayouts([defaultLayout])
    }
  }, [])

  // 保存布局到localStorage
  const saveLayout = () => {
    if (!currentLayout) return

    const updatedLayout = {
      ...currentLayout,
      updatedAt: new Date().toISOString()
    }

    const layoutIndex = savedLayouts.findIndex(l => l.id === updatedLayout.id)
    let newLayouts: DashboardLayout[]

    if (layoutIndex >= 0) {
      newLayouts = [...savedLayouts]
      newLayouts[layoutIndex] = updatedLayout
    } else {
      newLayouts = [...savedLayouts, updatedLayout]
    }

    setSavedLayouts(newLayouts)
    setCurrentLayout(updatedLayout)
    localStorage.setItem('dashboard-layouts', JSON.stringify(newLayouts))
  }

  // 重置布局
  const resetLayout = () => {
    if (!confirm('确定要重置布局吗？')) return
    const defaultLayout: DashboardLayout = {
      id: `layout-${Date.now()}`,
      ...PRESET_LAYOUTS[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setCurrentLayout(defaultLayout)
  }

  // 应用预设布局
  const applyPreset = (preset: typeof PRESET_LAYOUTS[0]) => {
    const newLayout: DashboardLayout = {
      id: `layout-${Date.now()}`,
      ...preset,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setCurrentLayout(newLayout)
    setShowLayoutMenu(false)
  }

  // 添加Widget
  const addWidget = (type: WidgetType) => {
    if (!currentLayout) return

    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type,
      title: getWidgetTitle(type),
      x: 0,
      y: currentLayout.widgets.length * 2,
      w: 6,
      h: 2
    }

    setCurrentLayout({
      ...currentLayout,
      widgets: [...currentLayout.widgets, newWidget]
    })
    setShowAddWidget(false)
  }

  // 删除Widget
  const removeWidget = (widgetId: string) => {
    if (!currentLayout) return
    setCurrentLayout({
      ...currentLayout,
      widgets: currentLayout.widgets.filter(w => w.id !== widgetId)
    })
  }

  // 更新Widget位置
  const updateWidgetPosition = (widgetId: string, x: number, y: number) => {
    if (!currentLayout) return
    setCurrentLayout({
      ...currentLayout,
      widgets: currentLayout.widgets.map(w =>
        w.id === widgetId ? { ...w, x, y } : w
      )
    })
  }

  // 获取Widget标题
  const getWidgetTitle = (type: WidgetType): string => {
    const titles: Record<WidgetType, string> = {
      'agent-status': 'Agent状态',
      'task-progress': '任务进度',
      'statistics': '统计数据',
      'quick-actions': '快捷操作',
      'custom-embed': '自定义内容',
      'recent-tasks': '最近任务',
      'agent-vitality': 'Agent生命力',
      'performance-chart': '性能图表'
    }
    return titles[type]
  }

  // 计算统计数据
  const statistics = useMemo(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'completed').length
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
    const onlineAgents = agents.filter(a => a.status === 'online' || a.status === 'working').length

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      onlineAgents,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : '0'
    }
  }, [tasks, agents])

  if (!currentLayout) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-400">
        <div className="text-center">
          <LayoutIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <LayoutIcon className="w-7 h-7 text-cyan-400" />
              <span>自定义Dashboard</span>
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {currentLayout.name} •
              {isEditMode ? ' 编辑模式' : ' 查看模式'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isEditMode && (
              <>
                <button
                  onClick={() => setShowAddWidget(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加Widget
                </button>
                <button
                  onClick={saveLayout}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
                <button
                  onClick={resetLayout}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  重置
                </button>
              </>
            )}
            <button
              onClick={() => setShowLayoutMenu(!showLayoutMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              <Settings className="w-4 h-4" />
              布局
            </button>
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isEditMode
                  ? 'bg-orange-600 hover:bg-orange-500'
                  : 'bg-cyan-600 hover:bg-cyan-500'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              {isEditMode ? '完成编辑' : '编辑布局'}
            </button>
          </div>
        </div>
      </div>

      {/* Layout Menu */}
      <AnimatePresence>
        {showLayoutMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-gray-700 bg-gray-800/50 overflow-hidden"
          >
            <div className="p-4">
              <h3 className="text-sm font-bold text-gray-300 mb-3">预设布局</h3>
              <div className="grid grid-cols-3 gap-3">
                {PRESET_LAYOUTS.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => applyPreset(preset)}
                    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
                  >
                    <div className="font-medium text-white">{preset.name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {preset.widgets.length} 个组件
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-12 gap-4 auto-rows-[120px]">
          {currentLayout.widgets.map((widget) => (
            <div
              key={widget.id}
              className="relative"
              style={{
                gridColumn: `span ${widget.w}`,
                gridRow: `span ${widget.h}`
              }}
            >
              <WidgetCard
                widget={widget}
                isEditMode={isEditMode}
                agents={agents}
                tasks={tasks}
                statistics={statistics}
                onRemove={() => removeWidget(widget.id)}
                onMove={(dx, dy) => updateWidgetPosition(widget.id, widget.x + dx, widget.y + dy)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Add Widget Modal */}
      <AnimatePresence>
        {showAddWidget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddWidget(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">添加Widget</h3>
                <button
                  onClick={() => setShowAddWidget(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {([
                  { type: 'agent-status', icon: Users, color: 'blue' },
                  { type: 'task-progress', icon: BarChart3, color: 'green' },
                  { type: 'statistics', icon: TrendingUp, color: 'purple' },
                  { type: 'quick-actions', icon: Zap, color: 'yellow' },
                  { type: 'recent-tasks', icon: FileText, color: 'cyan' },
                  { type: 'agent-vitality', icon: Activity, color: 'pink' },
                  { type: 'performance-chart', icon: BarChart3, color: 'orange' },
                  { type: 'custom-embed', icon: Settings, color: 'gray' }
                ] as const).map(({ type, icon: Icon, color }) => (
                  <button
                    key={type}
                    onClick={() => addWidget(type)}
                    className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors group"
                  >
                    <Icon className={`w-6 h-6 text-${color}-400 mb-2`} />
                    <div className="font-medium text-white">{getWidgetTitle(type)}</div>
                    <div className="text-xs text-gray-400 mt-1">点击添加到Dashboard</div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Widget Card Component
interface WidgetCardProps {
  widget: DashboardWidget
  isEditMode: boolean
  agents: OpenClawAgent[]
  tasks: Task[]
  statistics: any
  onRemove: () => void
  onMove: (dx: number, dy: number) => void
}

const WidgetCard: React.FC<WidgetCardProps> = ({
  widget,
  isEditMode,
  agents,
  tasks,
  statistics,
  onRemove
}) => {
  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'agent-status':
        return <AgentStatusWidget agents={agents} />
      case 'task-progress':
        return <TaskProgressWidget tasks={tasks} />
      case 'statistics':
        return <StatisticsWidget statistics={statistics} />
      case 'quick-actions':
        return <QuickActionsWidget />
      case 'recent-tasks':
        return <RecentTasksWidget tasks={tasks.slice(0, 5)} />
      case 'agent-vitality':
        return <AgentVitalityWidget agents={agents} />
      case 'performance-chart':
        return <PerformanceChartWidget />
      case 'custom-embed':
        return <CustomEmbedWidget config={widget.config} />
      default:
        return <div className="text-gray-400">未知组件类型</div>
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`h-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden ${
        isEditMode ? 'ring-2 ring-cyan-500/50' : ''
      }`}
    >
      {/* Widget Header */}
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between bg-gray-800/80">
        <h3 className="text-sm font-bold text-white">{widget.title}</h3>
        {isEditMode && (
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Widget Content */}
      <div className="p-4 h-[calc(100%-56px)] overflow-auto">
        {renderWidgetContent()}
      </div>
    </motion.div>
  )
}

// Widget Components
const AgentStatusWidget: React.FC<{ agents: OpenClawAgent[] }> = ({ agents }) => {
  return (
    <div className="space-y-2">
      {agents.slice(0, 3).map((agent) => (
        <div key={agent.id} className="flex items-center gap-3 p-2 bg-gray-700/50 rounded-lg">
          <div
            className={`w-2 h-2 rounded-full ${
              agent.status === 'online' || agent.status === 'working'
                ? 'bg-green-400'
                : 'bg-gray-500'
            }`}
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white truncate">{agent.name}</div>
            <div className="text-xs text-gray-400">{agent.role}</div>
          </div>
          <div className="text-sm text-gray-400">Lv.{agent.level}</div>
        </div>
      ))}
      {agents.length === 0 && (
        <div className="text-center text-gray-500 py-8">暂无Agent</div>
      )}
    </div>
  )
}

const TaskProgressWidget: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const completed = tasks.filter(t => t.status === 'completed').length
  const total = tasks.length
  const progress = total > 0 ? (completed / total) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-4xl font-bold text-white">{completed}/{total}</div>
        <div className="text-sm text-gray-400 mt-1">已完成任务</div>
      </div>
      <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-green-500 to-cyan-500"
        />
      </div>
      <div className="text-center text-2xl font-bold text-cyan-400">
        {progress.toFixed(1)}%
      </div>
    </div>
  )
}

const StatisticsWidget: React.FC<{ statistics: any }> = ({ statistics }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="text-2xl font-bold text-blue-400">{statistics.totalTasks}</div>
        <div className="text-xs text-gray-400 mt-1">总任务数</div>
      </div>
      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
        <div className="text-2xl font-bold text-green-400">{statistics.completedTasks}</div>
        <div className="text-xs text-gray-400 mt-1">已完成</div>
      </div>
      <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
        <div className="text-2xl font-bold text-orange-400">{statistics.inProgressTasks}</div>
        <div className="text-xs text-gray-400 mt-1">进行中</div>
      </div>
      <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
        <div className="text-2xl font-bold text-cyan-400">{statistics.onlineAgents}</div>
        <div className="text-xs text-gray-400 mt-1">在线Agent</div>
      </div>
    </div>
  )
}

const QuickActionsWidget: React.FC = () => {
  const actions = [
    { icon: Plus, label: '新建任务', color: 'green' },
    { icon: PlayCircle, label: '开始执行', color: 'blue' },
    { icon: Clock, label: '定时任务', color: 'purple' },
    { icon: Settings, label: '设置', color: 'gray' }
  ]

  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((action, index) => (
        <button
          key={index}
          className={`p-3 bg-${action.color}-500/10 hover:bg-${action.color}-500/20 border border-${action.color}-500/30 rounded-lg transition-colors`}
        >
          <action.icon className={`w-6 h-6 text-${action.color}-400 mx-auto mb-1`} />
          <div className="text-xs text-white">{action.label}</div>
        </button>
      ))}
    </div>
  )
}

const RecentTasksWidget: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg">
          {task.status === 'completed' ? (
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
          ) : task.status === 'in_progress' ? (
            <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white truncate">{task.title}</div>
            <div className="text-xs text-gray-400">{task.agentName}</div>
          </div>
        </div>
      ))}
      {tasks.length === 0 && (
        <div className="text-center text-gray-500 py-8">暂无任务</div>
      )}
    </div>
  )
}

const AgentVitalityWidget: React.FC<{ agents: OpenClawAgent[] }> = ({ agents }) => {
  const agent = agents[0]
  const vitality = agent?.coreEvolution?.vitality || 0

  return (
    <div className="text-center">
      <div className="relative w-24 h-24 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-700"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - vitality / 100)}`}
            className="text-pink-400"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-2xl font-bold text-white">{vitality}</div>
        </div>
      </div>
      <div className="text-sm text-gray-400">生命力</div>
    </div>
  )
}

const PerformanceChartWidget: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-white">97.5%</div>
          <div className="text-xs text-gray-400">性能提升</div>
        </div>
        <TrendingUp className="w-8 h-8 text-green-400" />
      </div>
      <div className="space-y-2">
        {['FCP', 'LCP', 'TTI'].map((metric, index) => (
          <div key={metric}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">{metric}</span>
              <span className="text-green-400">+{90 + index * 2}%</span>
            </div>
            <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-cyan-500"
                style={{ width: `${90 + index * 2}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const CustomEmbedWidget: React.FC<{ config?: DashboardWidget['config'] }> = ({ config }) => {
  if (config?.embedType === 'iframe' && config?.embedUrl) {
    return (
      <iframe
        src={config.embedUrl}
        className="w-full h-full border-0 rounded-lg"
        title="Custom Embed"
      />
    )
  }

  if (config?.embedType === 'markdown' && config?.customContent) {
    return (
      <div className="prose prose-invert prose-sm max-w-none">
        <pre className="text-xs text-gray-300 whitespace-pre-wrap">
          {config.customContent}
        </pre>
      </div>
    )
  }

  return (
    <div className="text-center text-gray-500 py-8">
      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
      <p className="text-sm">请配置自定义内容</p>
    </div>
  )
}
