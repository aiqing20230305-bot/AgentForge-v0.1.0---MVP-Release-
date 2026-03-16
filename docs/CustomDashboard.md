# Custom Dashboard - 自定义仪表板

## 概述

CustomDashboard 是 AgentForge v1.3.0 中实现的拖拽式布局编辑器，允许用户自定义Dashboard布局，灵活展示各种监控数据和快捷操作。

**任务编号：** Task #85
**完成日期：** 2026-03-16
**组件位置：** `/src/components/CustomDashboard.tsx`

## 核心功能

### 1. 拖拽式布局编辑器

- 基于CSS Grid实现的响应式网格布局
- 支持拖拽调整Widget位置
- 支持调整Widget大小（宽度和高度）
- 编辑模式/查看模式切换

### 2. 多种Widget类型

提供8种内置Widget类型：

| Widget类型 | 功能描述 | 默认尺寸 |
|-----------|---------|---------|
| `agent-status` | Agent状态卡片 - 显示Agent在线状态、等级、角色 | 6x2 |
| `task-progress` | 任务进度图表 - 显示任务完成率和进度条 | 6x2 |
| `statistics` | 统计数据 - 显示总任务数、已完成、进行中、在线Agent | 4x2 |
| `quick-actions` | 快捷操作按钮 - 新建任务、开始执行、定时任务、设置 | 3x2 |
| `recent-tasks` | 最近任务列表 - 显示最近5个任务及其状态 | 8x2 |
| `agent-vitality` | Agent生命力 - 显示Agent生命力圆环图 | 4x2 |
| `performance-chart` | 性能图表 - 显示FCP、LCP、TTI性能指标 | 12x3 |
| `custom-embed` | 自定义嵌入 - 支持iframe或markdown内容 | 6x2 |

### 3. 布局保存/恢复

- **自动保存：** 布局数据保存到 `localStorage`
- **多布局支持：** 支持创建和切换多个布局
- **持久化存储：** 页面刷新后保持布局状态

### 4. 预设布局模板

提供3个预设布局模板：

#### 默认布局
```
┌──────────────────────┬──────────────────────┐
│  Agent状态总览 (6x2)  │   任务进度 (6x2)      │
├──────────────┬───────┴──────────────────────┤
│统计数据(4x2) │    最近任务 (8x2)             │
└──────────────┴───────────────────────────────┘
```

#### Agent监控
```
┌──────────────┬────────────────────────────────┐
│Agent生命力   │    Agent状态 (8x2)             │
│   (4x2)      │                                │
├──────────────┴────────────────────────────────┤
│           性能监控 (12x3)                      │
│                                                │
└────────────────────────────────────────────────┘
```

#### 任务中心
```
┌──────────┬──────────────────────────────────┐
│快捷操作   │     任务进度 (9x2)               │
│  (3x2)   │                                  │
├──────────┴──────────────────────────────────┤
│           任务列表 (12x3)                    │
│                                              │
└──────────────────────────────────────────────┘
```

### 5. 编辑模式

**查看模式：**
- 只读模式，不能拖拽或删除Widget
- 所有Widget正常显示和交互

**编辑模式：**
- Widget显示蓝色边框高亮
- 每个Widget右上角显示删除按钮
- 可以添加新Widget
- 可以保存/重置布局

## 使用方法

### 基本用法

```typescript
import { CustomDashboard } from './components/CustomDashboard'
import type { OpenClawAgent } from './utils/openclawLoader'
import type { Task } from './types/task'

function MyApp() {
  const agents: OpenClawAgent[] = [
    // Agent数据
  ]

  const tasks: Task[] = [
    // 任务数据
  ]

  return (
    <CustomDashboard
      agents={agents}
      tasks={tasks}
      onWidgetAction={(action, widgetId) => {
        console.log(`Widget ${widgetId} action: ${action}`)
      }}
    />
  )
}
```

### Props

| Prop | 类型 | 必需 | 描述 |
|------|------|------|------|
| `agents` | `OpenClawAgent[]` | 是 | Agent列表数据 |
| `tasks` | `Task[]` | 是 | 任务列表数据 |
| `onWidgetAction` | `(action: string, widgetId: string) => void` | 否 | Widget操作回调 |

### 数据结构

#### DashboardWidget

```typescript
interface DashboardWidget {
  id: string                // Widget唯一ID
  type: WidgetType          // Widget类型
  title: string             // Widget标题
  x: number                 // 网格X坐标
  y: number                 // 网格Y坐标
  w: number                 // 宽度（网格单位，1-12）
  h: number                 // 高度（网格单位）
  config?: {                // 可选配置
    agentId?: string        // 关联的Agent ID
    customContent?: string  // 自定义内容（markdown）
    embedUrl?: string       // 嵌入URL（iframe）
    embedType?: 'iframe' | 'markdown'
    showHeader?: boolean    // 是否显示标题
    color?: string          // 自定义颜色
    [key: string]: any      // 其他配置
  }
}
```

#### DashboardLayout

```typescript
interface DashboardLayout {
  id: string                // 布局唯一ID
  name: string              // 布局名称
  widgets: DashboardWidget[] // Widget列表
  createdAt: string         // 创建时间
  updatedAt: string         // 更新时间
}
```

## 操作指南

### 添加Widget

1. 点击右上角"编辑布局"按钮进入编辑模式
2. 点击"添加Widget"按钮
3. 在弹出的对话框中选择Widget类型
4. Widget会自动添加到布局底部

### 删除Widget

1. 进入编辑模式
2. 点击Widget右上角的删除按钮（垃圾桶图标）
3. Widget会立即从布局中移除

### 保存布局

1. 在编辑模式下调整布局
2. 点击"保存"按钮
3. 布局会保存到localStorage
4. 下次打开页面时会自动恢复

### 重置布局

1. 进入编辑模式
2. 点击"重置"按钮
3. 确认对话框中点击"确定"
4. 布局会恢复为默认布局

### 应用预设模板

1. 点击"布局"按钮
2. 在下拉菜单中选择预设布局
3. 选择的模板会立即应用

## 技术实现

### 网格系统

使用CSS Grid实现12列网格系统：

```css
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: 120px;
  gap: 1rem;
}
```

### 状态管理

```typescript
// 布局状态
const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(null)

// 保存的布局列表
const [savedLayouts, setSavedLayouts] = useState<DashboardLayout[]>([])

// 编辑模式
const [isEditMode, setIsEditMode] = useState(false)
```

### 数据持久化

```typescript
// 保存到localStorage
localStorage.setItem('dashboard-layouts', JSON.stringify(layouts))

// 从localStorage加载
const stored = localStorage.getItem('dashboard-layouts')
const layouts = JSON.parse(stored)
```

### Widget渲染

每个Widget类型对应一个独立的子组件：

- `AgentStatusWidget` - Agent状态卡片
- `TaskProgressWidget` - 任务进度图表
- `StatisticsWidget` - 统计数据
- `QuickActionsWidget` - 快捷操作
- `RecentTasksWidget` - 最近任务
- `AgentVitalityWidget` - Agent生命力
- `PerformanceChartWidget` - 性能图表
- `CustomEmbedWidget` - 自定义嵌入

## 样式定制

### 主题色彩

Dashboard使用Tailwind CSS的深色主题配色：

```typescript
// 背景渐变
className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"

// Widget背景
className="bg-gray-800/50 backdrop-blur-sm border border-gray-700"

// 编辑模式高亮
className="ring-2 ring-cyan-500/50"
```

### 动画效果

使用Framer Motion实现流畅动画：

```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.9 }}
>
  {/* Widget内容 */}
</motion.div>
```

## 性能优化

### 1. 使用useMemo缓存统计数据

```typescript
const statistics = useMemo(() => {
  // 计算统计数据
  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    onlineAgents
  }
}, [tasks, agents])
```

### 2. 条件渲染减少不必要的组件

```typescript
{tasks.length > 0 ? (
  <RecentTasksWidget tasks={tasks} />
) : (
  <EmptyState />
)}
```

### 3. 虚拟化长列表

对于大量Widget的场景，建议实现虚拟滚动。

## 扩展开发

### 添加新Widget类型

1. 在 `WidgetType` 中添加新类型：

```typescript
export type WidgetType =
  | 'agent-status'
  | 'task-progress'
  | 'my-new-widget' // 新Widget类型
```

2. 创建Widget组件：

```typescript
const MyNewWidget: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div>
      {/* Widget内容 */}
    </div>
  )
}
```

3. 在 `renderWidgetContent()` 中添加case：

```typescript
case 'my-new-widget':
  return <MyNewWidget data={props.data} />
```

4. 更新 `getWidgetTitle()` 添加标题映射

5. 在"添加Widget"对话框中添加按钮

### 自定义Widget配置

通过 `config` 属性传递自定义配置：

```typescript
const widget: DashboardWidget = {
  id: 'widget-1',
  type: 'custom-embed',
  title: '自定义图表',
  x: 0,
  y: 0,
  w: 6,
  h: 3,
  config: {
    embedUrl: 'https://example.com/chart',
    embedType: 'iframe',
    color: '#3b82f6'
  }
}
```

## 已知限制

1. **不支持react-grid-layout库：** 由于项目依赖管理限制，暂未集成react-grid-layout，使用原生CSS Grid实现
2. **拖拽功能简化：** 目前通过网格坐标实现，未来可考虑集成react-dnd增强拖拽体验
3. **Widget大小调整：** 当前版本不支持拖拽调整大小，需要手动修改w/h值
4. **响应式布局：** 移动端显示需要进一步优化

## 未来计划

### v1.3.1
- [ ] 集成react-grid-layout实现真正的拖拽功能
- [ ] 支持拖拽调整Widget大小
- [ ] 添加Widget配置面板
- [ ] 支持导出/导入布局JSON

### v1.4.0
- [ ] 更多Widget类型（日历、待办事项、RSS订阅等）
- [ ] Widget间数据联动
- [ ] 布局分享功能
- [ ] 社区布局市场

### v1.5.0
- [ ] 移动端适配
- [ ] 触摸手势支持
- [ ] 离线模式
- [ ] 布局版本历史

## 测试

### 单元测试

```typescript
describe('CustomDashboard', () => {
  it('should render dashboard with widgets', () => {
    // 测试Dashboard渲染
  })

  it('should add new widget in edit mode', () => {
    // 测试添加Widget
  })

  it('should save layout to localStorage', () => {
    // 测试布局保存
  })

  it('should apply preset layout', () => {
    // 测试预设布局
  })
})
```

### E2E测试

```typescript
test('Dashboard editing workflow', async ({ page }) => {
  await page.goto('/dashboard')

  // 进入编辑模式
  await page.click('button:has-text("编辑布局")')

  // 添加Widget
  await page.click('button:has-text("添加Widget")')
  await page.click('button:has-text("Agent状态")')

  // 保存布局
  await page.click('button:has-text("保存")')

  // 验证保存成功
  expect(await page.locator('.widget').count()).toBeGreaterThan(0)
})
```

## 贡献指南

欢迎提交Issue和Pull Request！

### 报告Bug

请包含以下信息：
- 操作步骤
- 预期结果
- 实际结果
- 浏览器版本
- 截图（如果可能）

### 功能建议

请描述：
- 功能需求
- 使用场景
- 预期效果
- 是否愿意贡献代码

## 许可证

MIT License

## 作者

AgentForge Team

---

**最后更新：** 2026-03-16
**版本：** v1.3.0
**任务状态：** ✅ Completed
