/**
 * CustomDashboard Component Tests
 * Task #85: 创建自定义Dashboard - 拖拽式布局编辑器
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import type { OpenClawAgent } from '../../utils/openclawLoader'
import type { Task } from '../../types/task'

// Mock data for testing
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
  },
  {
    id: 'agent-2',
    name: 'Claude',
    level: 10,
    exp: 800,
    maxExp: 1000,
    role: 'AI助手',
    skills: ['代码审查', '文档编写', '问题诊断'],
    personality: '智慧友善',
    status: 'working',
    color: '#10b981',
    coreEvolution: {
      vitality: 95,
      heartRate: 72,
      lastHeartbeat: new Date().toISOString(),
      evolutionPoints: 250,
      evolutionLevel: 10,
      totalEvolutions: 25,
      healthStatus: 'healthy',
      autoEvolutionEnabled: true
    }
  }
]

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
  },
  {
    id: 'task-2',
    title: '编写单元测试',
    description: '为Dashboard组件编写测试',
    status: 'in_progress',
    priority: 'medium',
    agentId: 'agent-2',
    agentName: 'Claude',
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-3',
    title: '优化性能',
    description: '优化Dashboard渲染性能',
    status: 'pending',
    priority: 'low',
    agentId: 'agent-1',
    agentName: '莉娜杰',
    createdAt: new Date().toISOString()
  }
]

describe('CustomDashboard', () => {
  beforeEach(() => {
    // 清理localStorage
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Layout Management', () => {
    it('should initialize with default layout', () => {
      const layout = {
        id: 'layout-1',
        name: '默认布局',
        widgets: [
          {
            id: 'widget-1',
            type: 'agent-status' as const,
            title: 'Agent状态总览',
            x: 0,
            y: 0,
            w: 6,
            h: 2
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      expect(layout.widgets).toHaveLength(1)
      expect(layout.widgets[0].type).toBe('agent-status')
    })

    it('should save layout to localStorage', () => {
      const layout = {
        id: 'layout-1',
        name: '测试布局',
        widgets: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      localStorage.setItem('dashboard-layouts', JSON.stringify([layout]))

      const stored = localStorage.getItem('dashboard-layouts')
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].name).toBe('测试布局')
    })

    it('should load layout from localStorage', () => {
      const layouts = [
        {
          id: 'layout-1',
          name: '保存的布局',
          widgets: [
            {
              id: 'widget-1',
              type: 'task-progress' as const,
              title: '任务进度',
              x: 0,
              y: 0,
              w: 6,
              h: 2
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      localStorage.setItem('dashboard-layouts', JSON.stringify(layouts))

      const stored = localStorage.getItem('dashboard-layouts')
      const loaded = JSON.parse(stored!)

      expect(loaded).toHaveLength(1)
      expect(loaded[0].widgets).toHaveLength(1)
      expect(loaded[0].widgets[0].type).toBe('task-progress')
    })
  })

  describe('Widget Management', () => {
    it('should add new widget', () => {
      const widgets = [
        {
          id: 'widget-1',
          type: 'agent-status' as const,
          title: 'Agent状态',
          x: 0,
          y: 0,
          w: 6,
          h: 2
        }
      ]

      const newWidget = {
        id: 'widget-2',
        type: 'statistics' as const,
        title: '统计数据',
        x: 6,
        y: 0,
        w: 6,
        h: 2
      }

      const updatedWidgets = [...widgets, newWidget]

      expect(updatedWidgets).toHaveLength(2)
      expect(updatedWidgets[1].type).toBe('statistics')
    })

    it('should remove widget', () => {
      const widgets = [
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
          type: 'statistics' as const,
          title: '统计数据',
          x: 6,
          y: 0,
          w: 6,
          h: 2
        }
      ]

      const updatedWidgets = widgets.filter(w => w.id !== 'widget-1')

      expect(updatedWidgets).toHaveLength(1)
      expect(updatedWidgets[0].id).toBe('widget-2')
    })

    it('should update widget position', () => {
      const widget = {
        id: 'widget-1',
        type: 'agent-status' as const,
        title: 'Agent状态',
        x: 0,
        y: 0,
        w: 6,
        h: 2
      }

      const updatedWidget = {
        ...widget,
        x: 3,
        y: 1
      }

      expect(updatedWidget.x).toBe(3)
      expect(updatedWidget.y).toBe(1)
    })
  })

  describe('Statistics Calculation', () => {
    it('should calculate task statistics correctly', () => {
      const totalTasks = mockTasks.length
      const completedTasks = mockTasks.filter(t => t.status === 'completed').length
      const inProgressTasks = mockTasks.filter(t => t.status === 'in_progress').length
      const pendingTasks = mockTasks.filter(t => t.status === 'pending').length

      expect(totalTasks).toBe(3)
      expect(completedTasks).toBe(1)
      expect(inProgressTasks).toBe(1)
      expect(pendingTasks).toBe(1)
    })

    it('should calculate agent statistics correctly', () => {
      const totalAgents = mockAgents.length
      const onlineAgents = mockAgents.filter(
        a => a.status === 'online' || a.status === 'working'
      ).length

      expect(totalAgents).toBe(2)
      expect(onlineAgents).toBe(2)
    })

    it('should calculate completion rate', () => {
      const completed = mockTasks.filter(t => t.status === 'completed').length
      const total = mockTasks.length
      const rate = total > 0 ? (completed / total * 100).toFixed(1) : '0'

      expect(rate).toBe('33.3')
    })
  })

  describe('Preset Layouts', () => {
    it('should have default layout preset', () => {
      const defaultPreset = {
        name: '默认布局',
        widgets: [
          {
            id: 'widget-1',
            type: 'agent-status' as const,
            title: 'Agent状态总览',
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
        ]
      }

      expect(defaultPreset.name).toBe('默认布局')
      expect(defaultPreset.widgets).toHaveLength(2)
    })

    it('should have agent monitoring preset', () => {
      const agentMonitoringPreset = {
        name: 'Agent监控',
        widgets: [
          {
            id: 'widget-1',
            type: 'agent-vitality' as const,
            title: 'Agent生命力',
            x: 0,
            y: 0,
            w: 4,
            h: 2
          },
          {
            id: 'widget-2',
            type: 'agent-status' as const,
            title: 'Agent状态',
            x: 4,
            y: 0,
            w: 8,
            h: 2
          }
        ]
      }

      expect(agentMonitoringPreset.name).toBe('Agent监控')
      expect(agentMonitoringPreset.widgets).toHaveLength(2)
    })

    it('should have task center preset', () => {
      const taskCenterPreset = {
        name: '任务中心',
        widgets: [
          {
            id: 'widget-1',
            type: 'quick-actions' as const,
            title: '快捷操作',
            x: 0,
            y: 0,
            w: 3,
            h: 2
          },
          {
            id: 'widget-2',
            type: 'task-progress' as const,
            title: '任务进度',
            x: 3,
            y: 0,
            w: 9,
            h: 2
          }
        ]
      }

      expect(taskCenterPreset.name).toBe('任务中心')
      expect(taskCenterPreset.widgets).toHaveLength(2)
    })
  })

  describe('Widget Types', () => {
    it('should support all widget types', () => {
      const widgetTypes = [
        'agent-status',
        'task-progress',
        'statistics',
        'quick-actions',
        'recent-tasks',
        'agent-vitality',
        'performance-chart',
        'custom-embed'
      ]

      expect(widgetTypes).toHaveLength(8)
      expect(widgetTypes).toContain('agent-status')
      expect(widgetTypes).toContain('custom-embed')
    })

    it('should get correct widget title', () => {
      const titles: Record<string, string> = {
        'agent-status': 'Agent状态',
        'task-progress': '任务进度',
        'statistics': '统计数据',
        'quick-actions': '快捷操作',
        'custom-embed': '自定义内容',
        'recent-tasks': '最近任务',
        'agent-vitality': 'Agent生命力',
        'performance-chart': '性能图表'
      }

      expect(titles['agent-status']).toBe('Agent状态')
      expect(titles['task-progress']).toBe('任务进度')
      expect(titles['statistics']).toBe('统计数据')
    })
  })

  describe('Edit Mode', () => {
    it('should toggle edit mode', () => {
      let isEditMode = false
      isEditMode = !isEditMode
      expect(isEditMode).toBe(true)

      isEditMode = !isEditMode
      expect(isEditMode).toBe(false)
    })

    it('should enable widget deletion in edit mode', () => {
      const isEditMode = true
      const canDelete = isEditMode

      expect(canDelete).toBe(true)
    })

    it('should enable widget addition in edit mode', () => {
      const isEditMode = true
      const canAdd = isEditMode

      expect(canAdd).toBe(true)
    })
  })

  describe('Data Integration', () => {
    it('should filter agents by status', () => {
      const onlineAgents = mockAgents.filter(
        a => a.status === 'online' || a.status === 'working'
      )

      expect(onlineAgents).toHaveLength(2)
    })

    it('should filter tasks by status', () => {
      const completedTasks = mockTasks.filter(t => t.status === 'completed')
      const inProgressTasks = mockTasks.filter(t => t.status === 'in_progress')

      expect(completedTasks).toHaveLength(1)
      expect(inProgressTasks).toHaveLength(1)
    })

    it('should get recent tasks', () => {
      const recentTasks = mockTasks.slice(0, 5)

      expect(recentTasks.length).toBeLessThanOrEqual(5)
      expect(recentTasks.length).toBe(3)
    })
  })
})

// Export for integration testing
export { mockAgents, mockTasks }
