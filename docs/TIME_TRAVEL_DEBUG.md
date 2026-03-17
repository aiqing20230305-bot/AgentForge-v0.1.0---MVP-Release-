# 时间旅行调试 - 使用文档

## 概述

时间旅行调试功能允许你记录应用的所有状态变化，并在时间轴上自由穿梭，查看和恢复任意时刻的状态。

## 主要特性

- **状态历史记录** - 自动记录所有状态变更
- **时间轴导航** - 通过滑块或按钮在历史中导航
- **状态快照** - 查看和比较不同时间点的状态
- **Redux DevTools 集成** - 无缝集成到 Redux DevTools
- **导出/导入** - 保存和加载调试会话
- **性能优化** - 自动限制历史记录数量（默认1000条）

## 快速开始

### 1. 基础使用

```typescript
import { createStateHistory } from './services/stateHistory'
import { TimeTravelDebugger } from './components/debug'

// 创建状态历史实例
const history = createStateHistory({
  maxSnapshots: 1000,
  enableDevTools: true
})

// 记录状态变化
history.recordSnapshot(state, { type: 'UPDATE', payload: data })

// 在 React 组件中使用
function App() {
  return (
    <>
      <YourApp />
      <TimeTravelDebugger
        stateHistory={history}
        onStateRestore={(state) => {
          // 恢复状态到应用
          applyState(state)
        }}
      />
    </>
  )
}
```

### 2. 与 Zustand 集成

使用中间件自动集成到 Zustand store：

```typescript
import { create } from 'zustand'
import { createStoreWithHistory } from './services/stateHistoryMiddleware'

// 创建带历史功能的 store
const { storeCreator, history } = createStoreWithHistory(
  (set, get) => ({
    count: 0,
    increment: () => set(state => ({ count: state.count + 1 })),
    decrement: () => set(state => ({ count: state.count - 1 })),
  }),
  {
    maxSnapshots: 100,
    enableDevTools: true
  }
)

const useStore = create(storeCreator)

// 在组件中使用
function App() {
  const { count, increment, decrement } = useStore()

  return (
    <>
      <div>
        <button onClick={decrement}>-</button>
        <span>{count}</span>
        <button onClick={increment}>+</button>
      </div>

      <TimeTravelDebugger
        stateHistory={history}
        onStateRestore={state => useStore.setState(state)}
      />
    </>
  )
}
```

### 3. 手动使用 StateHistory

```typescript
import { StateHistory } from './services/stateHistory'

const history = new StateHistory({
  maxSnapshots: 1000,
  enableDevTools: true
})

// 记录状态
history.recordSnapshot({ count: 0 }, { type: 'INIT' })
history.recordSnapshot({ count: 1 }, { type: 'INCREMENT' })
history.recordSnapshot({ count: 2 }, { type: 'INCREMENT' })

// 导航
history.stepBackward() // 回到 count: 1
history.stepForward()  // 前进到 count: 2
history.jumpToIndex(0) // 跳到第一个快照
history.jumpToLatest() // 跳到最新快照

// 获取当前快照
const snapshot = history.getCurrentSnapshot()
console.log(snapshot.state) // { count: 2 }

// 比较两个快照
const diff = history.compareSnapshots(0, 2)
console.log(diff)
// {
//   added: {},
//   modified: { count: { old: 0, new: 2 } },
//   removed: {}
// }

// 导出/导入
const exported = history.exportAll()
history.importSnapshot(exported)

// 清空历史
history.clear()

// 暂停/恢复记录
history.togglePause()
```

## API 文档

### StateHistory

#### 构造函数选项

```typescript
interface StateHistoryOptions {
  maxSnapshots?: number      // 最大快照数，默认 1000
  enableDevTools?: boolean    // 是否启用 Redux DevTools，默认 false
}
```

#### 主要方法

```typescript
class StateHistory<T> {
  // 记录快照
  recordSnapshot(state: T, action?: { type: string; payload?: any }): void

  // 导航
  jumpToIndex(index: number): StateSnapshot<T> | null
  jumpToTimestamp(timestamp: number): StateSnapshot<T> | null
  stepBackward(): StateSnapshot<T> | null
  stepForward(): StateSnapshot<T> | null
  jumpToFirst(): StateSnapshot<T> | null
  jumpToLatest(): StateSnapshot<T> | null

  // 查询
  getCurrentSnapshot(): StateSnapshot<T> | null
  getAllSnapshots(): StateSnapshot<T>[]
  getTimelineState(): TimelineState
  compareSnapshots(indexA: number, indexB: number): StateDiff | null

  // 控制
  togglePause(): void
  clear(): void

  // 导出/导入
  exportSnapshot(index?: number): string
  exportAll(): string
  importSnapshot(data: string): void

  // 订阅
  subscribe(listener: (state: TimelineState) => void): () => void

  // 销毁
  destroy(): void
}
```

### TimeTravelDebugger 组件

#### Props

```typescript
interface TimeTravelDebuggerProps<T> {
  // 状态历史实例
  stateHistory: StateHistory<T>

  // 自定义状态渲染（可选）
  renderState?: (state: T) => React.ReactNode

  // 状态恢复回调（可选）
  onStateRestore?: (state: T) => void
}
```

#### 特性

- **时间轴滑块** - 可视化的时间轴导航
- **快照列表** - 显示所有历史快照
- **状态详情** - 查看选中快照的详细状态
- **对比模式** - 比较两个快照的差异
- **导出/导入** - 保存和加载调试会话
- **暂停/继续** - 控制状态记录

## 最佳实践

### 1. 性能优化

```typescript
// 限制快照数量
const history = createStateHistory({
  maxSnapshots: 100 // 根据应用复杂度调整
})

// 在性能敏感的场景中暂停记录
history.togglePause() // 暂停
// ... 执行密集操作
history.togglePause() // 恢复
```

### 2. 生产环境

```typescript
// 仅在开发环境启用
const history = createStateHistory({
  enableDevTools: process.env.NODE_ENV === 'development'
})

// 或条件渲染调试器
function App() {
  return (
    <>
      <YourApp />
      {process.env.NODE_ENV === 'development' && (
        <TimeTravelDebugger stateHistory={history} />
      )}
    </>
  )
}
```

### 3. 自定义状态渲染

```typescript
<TimeTravelDebugger
  stateHistory={history}
  renderState={(state) => (
    <div>
      <h4>用户信息</h4>
      <p>ID: {state.user.id}</p>
      <p>名称: {state.user.name}</p>
      <h4>任务列表</h4>
      <ul>
        {state.tasks.map(task => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  )}
/>
```

### 4. 状态恢复

```typescript
<TimeTravelDebugger
  stateHistory={history}
  onStateRestore={(state) => {
    // 方式1: 直接更新 store
    useStore.setState(state)

    // 方式2: 触发特定的 action
    dispatch({ type: 'RESTORE_STATE', payload: state })

    // 方式3: 逐个更新
    Object.keys(state).forEach(key => {
      updateField(key, state[key])
    })
  }}
/>
```

## 与 Redux DevTools 集成

时间旅行调试器内置了 Redux DevTools 协议支持：

1. 安装 Redux DevTools 浏览器扩展
2. 启用 DevTools 集成：

```typescript
const history = createStateHistory({
  enableDevTools: true
})
```

3. 打开 Redux DevTools 面板
4. 所有状态变化都会自动同步到 DevTools
5. 可以使用 DevTools 的所有功能：
   - 时间旅行
   - 状态检查
   - 操作日志
   - 状态导出/导入

## 故障排除

### 快照过多导致性能问题

```typescript
// 减少最大快照数
const history = createStateHistory({
  maxSnapshots: 50
})

// 或定期清理历史
setInterval(() => {
  history.clear()
}, 60000) // 每分钟清理一次
```

### 状态克隆失败

某些复杂对象（如函数、Symbol、循环引用）无法被 JSON 序列化。确保你的状态是可序列化的：

```typescript
// 不好 - 包含函数
const state = {
  count: 0,
  increment: () => {} // ❌ 函数无法序列化
}

// 好 - 纯数据
const state = {
  count: 0,
  settings: {
    autoSave: true
  }
}
```

### Redux DevTools 未连接

1. 确保已安装 Redux DevTools 浏览器扩展
2. 检查 `enableDevTools` 选项是否为 `true`
3. 检查浏览器控制台是否有错误信息

## 示例

查看 `src/components/debug/TimeTravelDebuggerDemo.tsx` 获取完整的使用示例。

运行演示：

```bash
npm run dev
```

然后访问演示页面，尝试使用时间旅行调试功能。

## 技术细节

- **状态存储** - 使用深度克隆确保快照独立性
- **差异计算** - 自动计算相邻快照的差异
- **内存管理** - 自动限制快照数量，防止内存溢出
- **事件系统** - 基于订阅模式的状态通知
- **DevTools 协议** - 完整实现 Redux DevTools 协议

## 常见问题

**Q: 时间旅行会影响应用性能吗？**

A: 在合理的快照数量下（< 1000），性能影响微乎其微。对于性能敏感的场景，可以暂时暂停记录。

**Q: 可以在生产环境使用吗？**

A: 不推荐。时间旅行调试主要用于开发和调试。在生产环境中应该禁用或仅在特定条件下启用。

**Q: 如何与现有的 store 集成？**

A: 使用 `stateHistoryMiddleware` 中间件可以无缝集成到 Zustand store。对于其他状态管理库，需要手动调用 `recordSnapshot`。

**Q: 导出的快照文件很大怎么办？**

A: 可以减少 `maxSnapshots` 限制，或者只导出特定的快照而不是全部历史。

## 许可

MIT
