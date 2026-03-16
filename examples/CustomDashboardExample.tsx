/**
 * CustomDashboard Usage Example
 * 展示如何在应用中集成和使用CustomDashboard组件
 */

import React, { useState, useEffect } from 'react'
import { CustomDashboard } from '../src/components/CustomDashboard'
import type { OpenClawAgent } from '../src/utils/openclawLoader'
import type { Task } from '../src/types/task'

/**
 * Example 1: Basic Usage
 * 基础用法 - 直接使用Dashboard
 */
export function BasicDashboardExample() {
  const [agents, setAgents] = useState<OpenClawAgent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  // 模拟加载数据
  useEffect(() => {
    // 加载Agents
    const mockAgents: OpenClawAgent[] = [
      {
        id: 'agent-1',
        name: '莉娜杰',
        level: 5,
        exp: 250,
        maxExp: 500,
        role: '全栈开发',
        skills: ['TypeScript', 'React', 'Node.js'],
        personality: '认真负责',
        status: 'online',
        color: '#3b82f6',
        coreEvolution: {
          vitality: 85,
          heartRate: 60,
          lastHeartbeat: new Date().toISOString(),
          evolutionPoints: 100,
          evolutionLevel: 5,
          totalEvolutions: 10,
          healthStatus: 'healthy',
          autoEvolutionEnabled: true
        }
      }
    ]

    // 加载Tasks
    const mockTasks: Task[] = [
      {
        id: 'task-1',
        title: '实现Dashboard组件',
        description: '创建可拖拽的Dashboard布局编辑器',
        status: 'completed',
        priority: 'high',
        agentId: 'agent-1',
        agentName: '莉娜杰',
        createdAt: new Date().toISOString()
      }
    ]

    setAgents(mockAgents)
    setTasks(mockTasks)
  }, [])

  return (
    <div className="h-screen">
      <CustomDashboard
        agents={agents}
        tasks={tasks}
        onWidgetAction={(action, widgetId) => {
          console.log(`Widget action: ${action}, ID: ${widgetId}`)
        }}
      />
    </div>
  )
}

/**
 * Example 2: With Data Fetching
 * 从API获取数据
 */
export function DashboardWithAPIExample() {
  const [agents, setAgents] = useState<OpenClawAgent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // 从API获取数据
        const [agentsRes, tasksRes] = await Promise.all([
          fetch('/api/agents'),
          fetch('/api/tasks')
        ])

        const agentsData = await agentsRes.json()
        const tasksData = await tasksRes.json()

        setAgents(agentsData)
        setTasks(tasksData)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  return (
    <div className="h-screen">
      <CustomDashboard
        agents={agents}
        tasks={tasks}
        onWidgetAction={(action, widgetId) => {
          console.log(`Widget action: ${action}, ID: ${widgetId}`)
        }}
      />
    </div>
  )
}

/**
 * Example 3: With Real-time Updates
 * 实时数据更新
 */
export function DashboardWithRealtimeExample() {
  const [agents, setAgents] = useState<OpenClawAgent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    // 初始化WebSocket连接
    const ws = new WebSocket('ws://localhost:3001')

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'agent-update') {
        setAgents(prev => {
          const index = prev.findIndex(a => a.id === data.agent.id)
          if (index >= 0) {
            const newAgents = [...prev]
            newAgents[index] = data.agent
            return newAgents
          }
          return [...prev, data.agent]
        })
      }

      if (data.type === 'task-update') {
        setTasks(prev => {
          const index = prev.findIndex(t => t.id === data.task.id)
          if (index >= 0) {
            const newTasks = [...prev]
            newTasks[index] = data.task
            return newTasks
          }
          return [...prev, data.task]
        })
      }
    }

    return () => {
      ws.close()
    }
  }, [])

  return (
    <div className="h-screen">
      <CustomDashboard
        agents={agents}
        tasks={tasks}
        onWidgetAction={(action, widgetId) => {
          console.log(`Widget action: ${action}, ID: ${widgetId}`)
        }}
      />
    </div>
  )
}

/**
 * Example 4: With Custom Widget Actions
 * 自定义Widget操作
 */
export function DashboardWithCustomActionsExample() {
  const [agents, setAgents] = useState<OpenClawAgent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  const handleWidgetAction = (action: string, widgetId: string) => {
    switch (action) {
      case 'start-task':
        console.log('Starting task from widget:', widgetId)
        // 启动任务逻辑
        break

      case 'view-agent':
        console.log('Viewing agent from widget:', widgetId)
        // 查看Agent详情
        break

      case 'refresh-data':
        console.log('Refreshing data for widget:', widgetId)
        // 刷新数据
        break

      default:
        console.log('Unknown action:', action)
    }
  }

  return (
    <div className="h-screen">
      <CustomDashboard
        agents={agents}
        tasks={tasks}
        onWidgetAction={handleWidgetAction}
      />
    </div>
  )
}

/**
 * Example 5: Programmatic Layout Control
 * 编程式控制布局
 */
export function DashboardWithProgrammaticControlExample() {
  const [agents, setAgents] = useState<OpenClawAgent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  // 保存自定义布局
  const saveCustomLayout = () => {
    const layout = {
      id: `layout-${Date.now()}`,
      name: '我的自定义布局',
      widgets: [
        {
          id: 'widget-1',
          type: 'agent-status' as const,
          title: 'Agent状态',
          x: 0,
          y: 0,
          w: 6,
          h: 2
        },
        {
          id: 'widget-2',
          type: 'task-progress' as const,
          title: '任务进度',
          x: 6,
          y: 0,
          w: 6,
          h: 2
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const layouts = JSON.parse(localStorage.getItem('dashboard-layouts') || '[]')
    layouts.push(layout)
    localStorage.setItem('dashboard-layouts', JSON.stringify(layouts))

    console.log('Layout saved:', layout)
  }

  // 加载指定布局
  const loadLayout = (layoutId: string) => {
    const layouts = JSON.parse(localStorage.getItem('dashboard-layouts') || '[]')
    const layout = layouts.find((l: any) => l.id === layoutId)

    if (layout) {
      console.log('Loading layout:', layout)
      // 应用布局逻辑
    }
  }

  // 导出布局为JSON
  const exportLayout = () => {
    const layouts = localStorage.getItem('dashboard-layouts')
    if (layouts) {
      const blob = new Blob([layouts], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `dashboard-layout-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  // 导入布局
  const importLayout = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const layouts = JSON.parse(e.target?.result as string)
        localStorage.setItem('dashboard-layouts', JSON.stringify(layouts))
        console.log('Layouts imported successfully')
      } catch (error) {
        console.error('Failed to import layouts:', error)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="h-screen flex flex-col">
      {/* 控制面板 */}
      <div className="p-4 bg-gray-900 border-b border-gray-700 flex gap-2">
        <button
          onClick={saveCustomLayout}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white"
        >
          保存布局
        </button>
        <button
          onClick={exportLayout}
          className="px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm text-white"
        >
          导出布局
        </button>
        <label className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm text-white cursor-pointer">
          导入布局
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) importLayout(file)
            }}
          />
        </label>
      </div>

      {/* Dashboard */}
      <div className="flex-1">
        <CustomDashboard
          agents={agents}
          tasks={tasks}
          onWidgetAction={(action, widgetId) => {
            console.log(`Widget action: ${action}, ID: ${widgetId}`)
          }}
        />
      </div>
    </div>
  )
}

/**
 * Example 6: Integration with Main App
 * 集成到主应用
 */
export function DashboardIntegrationExample() {
  // 从Zustand store获取数据
  // const agents = useAgentStore(state => state.agents)
  // const tasks = useTaskStore(state => state.tasks)

  // 或者从Context获取
  // const { agents, tasks } = useAppContext()

  // 示例数据
  const agents: OpenClawAgent[] = []
  const tasks: Task[] = []

  return (
    <div className="h-screen">
      <CustomDashboard
        agents={agents}
        tasks={tasks}
        onWidgetAction={(action, widgetId) => {
          console.log(`Widget action: ${action}, ID: ${widgetId}`)
        }}
      />
    </div>
  )
}

/**
 * How to add to MainNavigationTabs:
 *
 * In src/components/MainNavigationTabs.tsx:
 *
 * import { CustomDashboard } from './CustomDashboard'
 *
 * const tabs = [
 *   // ... existing tabs
 *   {
 *     id: 'dashboard',
 *     name: 'Dashboard',
 *     icon: LayoutIcon,
 *     component: (
 *       <CustomDashboard
 *         agents={agents}
 *         tasks={tasks}
 *         onWidgetAction={(action, widgetId) => {
 *           console.log('Widget action:', action, widgetId)
 *         }}
 *       />
 *     )
 *   }
 * ]
 */

export default BasicDashboardExample
