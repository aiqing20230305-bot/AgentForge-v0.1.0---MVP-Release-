# Agent Card 使用指南

## 快速开始

### 1. 导入组件
```tsx
import AgentCard from '@/components/AgentCard'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
```

### 2. 基本使用
```tsx
<AgentCard
  agent={agent}
  onEquip={(agent) => console.log('Equip:', agent)}
  onViewDetails={(agent) => console.log('View:', agent)}
  index={0}
/>
```

### 3. 完整示例
```tsx
function AgentList() {
  const [agents, setAgents] = useState<OpenClawAgent[]>([])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, index) => (
          <AgentCard
            key={agent.name}
            agent={agent}
            onEquip={handleEquip}
            onViewDetails={handleViewDetails}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            index={index}
          />
        ))}
      </div>
    </DndProvider>
  )
}
```

## Props 说明

### AgentCardProps

| Prop | 类型 | 必需 | 说明 |
|------|------|------|------|
| `agent` | `OpenClawAgent` | ✅ | Agent数据对象 |
| `onSelect` | `(agent) => void` | ❌ | 点击卡片时的回调 |
| `onEquip` | `(agent) => void` | ❌ | 装备按钮回调 |
| `onDelete` | `(agent) => void` | ❌ | 删除操作回调 |
| `onDuplicate` | `(agent) => void` | ❌ | 复制操作回调 |
| `onViewDetails` | `(agent) => void` | ❌ | 查看详情回调 |
| `isDragging` | `boolean` | ❌ | 是否正在拖拽 |
| `dragHandleProps` | `any` | ❌ | react-dnd拖拽句柄props |
| `index` | `number` | ❌ | 卡片索引（用于动画延迟） |
| `className` | `string` | ❌ | 自定义CSS类名 |

### OpenClawAgent 类型

```typescript
interface OpenClawAgent {
  id: string
  name: string
  role: string
  level: number
  exp: number
  maxExp: number
  color: string
  status: 'working' | 'online' | 'idle' | 'offline'
  skills: string[]
  description?: string
  personality?: string
  // ... 其他字段
}
```

## 交互功能

### 1. 鼠标交互

#### 悬停 (Hover)
- 卡片放大至102%
- 阴影增强
- 光晕效果出现
- 光泽扫过动画

#### 点击 (Click)
- 涟漪动画从点击位置扩散
- 卡片缩小至98%
- 触发 `onSelect` 回调

#### 右键 (Right Click)
- 打开上下文菜单
- 显示快捷操作选项
- 点击外部关闭

### 2. 上下文菜单

右键点击卡片会显示包含以下选项的菜单：

| 选项 | 图标 | 操作 |
|------|------|------|
| 装备 Agent | ▶️ | 触发 `onEquip` |
| 查看详情 | 👁️ | 触发 `onViewDetails` |
| 复制配置 | 📋 | 触发 `onDuplicate` |
| 配置 | ⚙️ | 打开配置界面 |
| 移除 | 🗑️ | 触发 `onDelete` |

### 3. 拖拽功能

提供拖拽句柄，支持卡片重新排序：

```tsx
<AgentCard
  agent={agent}
  dragHandleProps={dragHandleProps}
  isDragging={snapshot.isDragging}
/>
```

## 状态指示器

### 状态类型

| 状态 | 颜色 | 图标 | 含义 |
|------|------|------|------|
| `working` | 绿色 | 🟢 | Agent正在工作 |
| `online` | 绿色 | 🟢 | Agent在线待命 |
| `idle` | 琥珀色 | 🟡 | Agent空闲中 |
| `offline` | 红色 | 🔴 | Agent离线 |

### 动画效果

状态指示器包含两个动画层：
1. **脉冲动画**: 缩放 + 透明度变化（2s循环）
2. **扩散环**: 从中心向外扩散的环形（2s循环）

## 响应式布局

### 网格配置

```tsx
// 移动端: 单列
<div className="grid grid-cols-1 gap-3">

// 平板: 双列
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">

// 桌面: 三列
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
```

### 断点说明

```css
/* 移动端 */
@media (max-width: 640px) {
  /* 单列，紧凑间距 */
}

/* 平板 */
@media (min-width: 641px) and (max-width: 1024px) {
  /* 双列，标准间距 */
}

/* 桌面 */
@media (min-width: 1025px) {
  /* 三列，完整功能 */
}
```

## 样式自定义

### 1. 主题色

Agent卡片自动使用agent对象的 `color` 属性：

```tsx
const agent = {
  color: '#ff6b6b', // 主题色
  // ...
}
```

此颜色用于：
- 边框
- 涟漪效果
- 经验条
- 级别徽章

### 2. 自定义类名

```tsx
<AgentCard
  agent={agent}
  className="shadow-2xl border-4"
/>
```

### 3. CSS变量

可以通过CSS变量覆盖默认值：

```css
.agent-card {
  --card-hover-scale: 1.05; /* 悬停缩放比例 */
  --card-tap-scale: 0.95;   /* 点击缩放比例 */
  --ripple-duration: 800ms; /* 涟漪持续时间 */
}
```

## 性能优化

### 1. React.memo

组件已使用 `React.memo` 包装，只在props变化时重新渲染：

```tsx
const AgentCard = memo(({ agent, onEquip, ... }) => {
  // ...
})
```

### 2. useCallback

所有事件处理器都使用 `useCallback` 缓存：

```tsx
const handleContextMenu = useCallback((e: React.MouseEvent) => {
  // ...
}, [])
```

### 3. CSS动画

使用硬件加速的 `transform` 和 `opacity`：

```css
transform: translateY(-4px);  /* ✓ 硬件加速 */
top: -4px;                    /* ✗ 重排 */
```

## 无障碍支持

### 1. 减少动画

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
  }
}
```

### 2. 高对比度

```css
@media (prefers-contrast: high) {
  .agent-card {
    border-width: 3px;
  }
}
```

### 3. 键盘导航

建议添加键盘支持：

```tsx
<AgentCard
  agent={agent}
  tabIndex={0}
  onKeyPress={(e) => {
    if (e.key === 'Enter') {
      onSelect(agent)
    }
  }}
/>
```

## 常见问题

### Q: 如何禁用某个动画？

A: 通过props覆盖样式：

```tsx
<AgentCard
  agent={agent}
  className="[&:hover]:scale-100" // 禁用悬停缩放
/>
```

### Q: 如何修改右键菜单选项？

A: 目前菜单选项是硬编码的，需要修改组件源码。未来版本会支持自定义菜单项。

### Q: 拖拽功能如何完整实现？

A: 需要集成react-dnd的Draggable/Droppable：

```tsx
import { useDrag, useDrop } from 'react-dnd'

const [{ isDragging }, drag, preview] = useDrag({
  type: 'AGENT_CARD',
  item: { agent, index },
  collect: (monitor) => ({
    isDragging: monitor.isDragging()
  })
})
```

### Q: 如何自定义涟漪颜色？

A: 涟漪自动使用agent的主题色。如需修改，可以通过CSS覆盖：

```css
.agent-card .ripple {
  background: rgba(0, 255, 255, 0.4) !important;
}
```

## 最佳实践

### 1. 列表渲染

使用稳定的key：

```tsx
{agents.map((agent) => (
  <AgentCard
    key={agent.id} // ✓ 使用唯一ID
    // key={agent.name} // ✗ 名称可能重复
    agent={agent}
  />
))}
```

### 2. 加载状态

显示骨架屏：

```tsx
{loading ? (
  <AgentCardSkeleton />
) : (
  agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)
)}
```

### 3. 错误处理

包裹在错误边界中：

```tsx
<ErrorBoundary fallback={<AgentCardError />}>
  <AgentCard agent={agent} />
</ErrorBoundary>
```

### 4. 性能监控

使用React DevTools Profiler监控渲染性能：

```tsx
<Profiler id="AgentCardList" onRender={onRenderCallback}>
  {agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
</Profiler>
```

## 相关资源

- [完整文档](../AGENT_CARD_ENHANCEMENT.md)
- [完成报告](./TASK_73_COMPLETION_REPORT.md)
- [组件源码](../src/components/AgentCard.tsx)
- [样式文件](../src/styles/agent-card.css)

## 版本历史

### v1.0.0 (2026-03-16)
- ✨ 初始版本发布
- 🎨 Hover/点击/右键菜单
- 📱 响应式设计
- ♿ 无障碍支持
- ⚡ 性能优化

---

**维护者**: Claude Opus 4.6
**最后更新**: 2026-03-16
**许可**: MIT
