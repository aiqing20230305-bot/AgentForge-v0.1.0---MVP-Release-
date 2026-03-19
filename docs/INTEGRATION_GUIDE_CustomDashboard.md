# CustomDashboard 集成指南

快速将CustomDashboard集成到AgentForge主应用的完整指南。

## 前提条件

确保以下依赖已安装：
```json
{
  "react": "^18.3.1",
  "framer-motion": "^12.36.0",
  "lucide-react": "^0.563.0"
}
```

## 步骤1：导入组件

在需要使用Dashboard的文件中导入：

```typescript
import { CustomDashboard } from '../components/CustomDashboard'
import type { OpenClawAgent } from '../utils/openclawLoader'
import type { Task } from '../types/task'
```

## 步骤2：添加到MainNavigationTabs

编辑 `/src/components/MainNavigationTabs.tsx`：

```typescript
import {
  Home,
  Users,
  Zap,
  Settings,
  LayoutDashboard  // 添加Dashboard图标
} from 'lucide-react'
import { CustomDashboard } from './CustomDashboard'

// 在组件内部获取数据
function MainNavigationTabs() {
  // 假设你有这些hooks或store
  const agents = useOpenClawStore(state => state.agents)
  const tasks = useTaskStore ? useTaskStore(state => state.tasks) : []

  const tabs = [
    // ... 其他tabs
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      component: (
        <CustomDashboard
          agents={agents}
          tasks={tasks}
          onWidgetAction={(action, widgetId) => {
            console.log('Widget action:', action, widgetId)
            // 处理Widget操作
            if (action === 'start-task') {
              // 启动任务逻辑
            }
          }}
        />
      )
    }
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Tab按钮 */}
      <div className="flex border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 ${
              activeTab === tab.id
                ? 'border-b-2 border-cyan-500'
                : ''
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab内容 */}
      <div className="flex-1 overflow-hidden">
        {tabs.find(t => t.id === activeTab)?.component}
      </div>
    </div>
  )
}
```

## 步骤3：处理数据源

### 选项A：使用现有Store

如果项目中已有Agent和Task的store：

```typescript
// 从OpenClaw store获取agents
import { useOpenClawStore } from '../store/useOpenClawStore'

const agents = useOpenClawStore(state => state.agents)

// 从Task store获取tasks（如果有的话）
// 如果没有Task store，可以创建一个mock数据或从其他来源获取
const tasks: Task[] = []
```

### 选项B：创建Task Store

如果还没有Task Store，可以快速创建一个：

```typescript
// /src/store/useTaskStore.ts
import { create } from 'zustand'
import type { Task } from '../types/task'

interface TaskStore {
  tasks: Task[]
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  removeTask: (id: string) => void
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],

  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, task]
  })),

  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t =>
      t.id === id ? { ...t, ...updates } : t
    )
  })),

  removeTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  }))
}))
```

### 选项C：从API获取

```typescript
import { useState, useEffect } from 'react'

function DashboardContainer() {
  const [agents, setAgents] = useState<OpenClawAgent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [agentsRes, tasksRes] = await Promise.all([
          fetch('/api/agents'),
          fetch('/api/tasks')
        ])

        setAgents(await agentsRes.json())
        setTasks(await tasksRes.json())
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>

  return <CustomDashboard agents={agents} tasks={tasks} />
}
```

## 步骤4：配置路由（可选）

如果使用React Router：

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CustomDashboard } from './components/CustomDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/dashboard"
          element={
            <CustomDashboard
              agents={agents}
              tasks={tasks}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
```

## 步骤5：样式调整（可选）

如果需要调整Dashboard的高度或样式：

```typescript
// 方式1：使用className
<div className="h-screen">
  <CustomDashboard agents={agents} tasks={tasks} />
</div>

// 方式2：使用style
<div style={{ height: 'calc(100vh - 64px)' }}>
  <CustomDashboard agents={agents} tasks={tasks} />
</div>

// 方式3：完全填充父容器
<div className="absolute inset-0">
  <CustomDashboard agents={agents} tasks={tasks} />
</div>
```

## 步骤6：测试集成

### 基础测试

1. 打开应用，导航到Dashboard
2. 验证Dashboard正确渲染
3. 检查Widget显示是否正常
4. 测试编辑模式切换

### 编辑功能测试

1. 点击"编辑布局"进入编辑模式
2. 点击"添加Widget"添加新组件
3. 删除一个Widget
4. 点击"保存"保存布局
5. 刷新页面，验证布局保持

### 数据更新测试

1. 修改Agent或Task数据
2. 验证Dashboard自动更新
3. 测试实时数据刷新

## 常见问题

### Q1: 数据不显示

**问题：** Dashboard显示"暂无Agent"或"暂无任务"

**解决方案：**
```typescript
// 检查数据是否正确传递
console.log('Agents:', agents)
console.log('Tasks:', tasks)

// 确保数据格式正确
const agents: OpenClawAgent[] = [
  {
    id: 'agent-1',
    name: '测试Agent',
    level: 1,
    exp: 0,
    maxExp: 100,
    role: '测试',
    skills: [],
    personality: '友好',
    status: 'online',
    color: '#3b82f6'
  }
]
```

### Q2: 布局不保存

**问题：** 刷新页面后布局丢失

**解决方案：**
```typescript
// 检查localStorage是否可用
if (typeof localStorage !== 'undefined') {
  console.log('localStorage is available')
} else {
  console.error('localStorage is not available')
}

// 检查是否有权限
try {
  localStorage.setItem('test', 'test')
  localStorage.removeItem('test')
  console.log('localStorage permission OK')
} catch (e) {
  console.error('localStorage permission denied:', e)
}
```

### Q3: 样式错误

**问题：** Dashboard样式显示不正确

**解决方案：**
```typescript
// 确保Tailwind CSS已配置
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  // ...
}

// 确保导入了CSS
import '../index.css'
```

### Q4: TypeScript错误

**问题：** 类型检查失败

**解决方案：**
```typescript
// 确保类型定义正确导入
import type { OpenClawAgent } from '../utils/openclawLoader'
import type { Task } from '../types/task'

// 如果Agent类型不匹配，可能需要调整
interface CustomAgent extends OpenClawAgent {
  // 添加自定义字段
}
```

## 高级配置

### 自定义Widget操作

```typescript
<CustomDashboard
  agents={agents}
  tasks={tasks}
  onWidgetAction={(action, widgetId) => {
    switch (action) {
      case 'start-task':
        handleStartTask(widgetId)
        break
      case 'view-agent':
        handleViewAgent(widgetId)
        break
      case 'refresh-data':
        handleRefreshData()
        break
      default:
        console.log('Unknown action:', action)
    }
  }}
/>
```

### 实时数据更新

```typescript
import { useEffect } from 'react'

function DashboardContainer() {
  const [agents, setAgents] = useState<OpenClawAgent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    // WebSocket连接
    const ws = new WebSocket('ws://localhost:3001')

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'agent-update') {
        setAgents(prev => {
          // 更新Agent数据
          return prev.map(a =>
            a.id === data.agent.id ? data.agent : a
          )
        })
      }

      if (data.type === 'task-update') {
        setTasks(prev => {
          // 更新Task数据
          return prev.map(t =>
            t.id === data.task.id ? data.task : t
          )
        })
      }
    }

    return () => ws.close()
  }, [])

  return <CustomDashboard agents={agents} tasks={tasks} />
}
```

### 布局导出/导入

```typescript
function DashboardWithIO() {
  // 导出布局
  const exportLayout = () => {
    const layouts = localStorage.getItem('dashboard-layouts')
    if (layouts) {
      const blob = new Blob([layouts], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `dashboard-${Date.now()}.json`
      link.click()
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
        window.location.reload() // 刷新页面应用新布局
      } catch (error) {
        console.error('Failed to import layout:', error)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div>
      <button onClick={exportLayout}>导出布局</button>
      <input
        type="file"
        accept=".json"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) importLayout(file)
        }}
      />
      <CustomDashboard agents={agents} tasks={tasks} />
    </div>
  )
}
```

## 性能优化建议

### 1. 使用React.memo优化子组件

```typescript
import { memo } from 'react'

const MemoizedDashboard = memo(CustomDashboard)

// 使用时
<MemoizedDashboard agents={agents} tasks={tasks} />
```

### 2. 懒加载Dashboard

```typescript
import { lazy, Suspense } from 'react'

const CustomDashboard = lazy(() =>
  import('./components/CustomDashboard').then(m => ({
    default: m.CustomDashboard
  }))
)

function App() {
  return (
    <Suspense fallback={<div>Loading Dashboard...</div>}>
      <CustomDashboard agents={agents} tasks={tasks} />
    </Suspense>
  )
}
```

### 3. 虚拟化大量Widget

如果有超过20个Widget，考虑使用react-window：

```typescript
import { FixedSizeList } from 'react-window'

// 在CustomDashboard内部实现虚拟化
<FixedSizeList
  height={800}
  itemCount={widgets.length}
  itemSize={140}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <WidgetCard widget={widgets[index]} />
    </div>
  )}
</FixedSizeList>
```

## 下一步

1. ✅ 完成基础集成
2. 📊 监控性能指标
3. 🎨 根据品牌调整样式
4. 🧪 编写E2E测试
5. 📝 更新用户文档

## 支持

如有问题，请查看：
- [完整文档](./CustomDashboard.md)
- [示例代码](../examples/CustomDashboardExample.tsx)
- [测试用例](../src/components/__tests__/CustomDashboard.test.tsx)
- [完成报告](../TASK_85_COMPLETION_REPORT.md)

---

**最后更新：** 2026-03-16
**版本：** v1.3.0
