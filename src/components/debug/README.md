# 时间旅行调试器

## 快速开始

### 1. 基础使用

```tsx
import { createStateHistory } from '../../services/stateHistory'
import { TimeTravelDebugger } from './TimeTravelDebugger'

// 创建历史实例
const history = createStateHistory({
  maxSnapshots: 1000,
  enableDevTools: true
})

// 记录状态
history.recordSnapshot(state, { type: 'ACTION_NAME' })

// 在应用中使用
<TimeTravelDebugger
  stateHistory={history}
  onStateRestore={(state) => applyState(state)}
/>
```

### 2. 与 Zustand 集成

```tsx
import { create } from 'zustand'
import { createStoreWithHistory } from '../../services/stateHistoryMiddleware'
import { TimeTravelDebugger } from './TimeTravelDebugger'

const { storeCreator, history } = createStoreWithHistory(
  (set) => ({
    count: 0,
    increment: () => set(state => ({ count: state.count + 1 })),
  }),
  { enableDevTools: true }
)

const useStore = create(storeCreator)

function App() {
  const { count, increment } = useStore()

  return (
    <>
      <button onClick={increment}>{count}</button>
      <TimeTravelDebugger
        stateHistory={history}
        onStateRestore={state => useStore.setState(state)}
      />
    </>
  )
}
```

### 3. 查看演示

```bash
# 运行项目
npm run dev

# 导入演示组件
import { TimeTravelDebuggerDemo } from './components/debug'
```

## 功能特性

- ✅ 自动记录所有状态变化
- ✅ 时间轴滑块导航
- ✅ 前进/后退/跳转控制
- ✅ 状态快照查看
- ✅ 双快照对比模式
- ✅ 导出/导入调试会话
- ✅ Redux DevTools 集成
- ✅ 暂停/恢复记录
- ✅ 性能优化（自动限制快照数）

## 文档

详细文档请查看：[docs/TIME_TRAVEL_DEBUG.md](../../../docs/TIME_TRAVEL_DEBUG.md)

## 测试

```bash
npm test -- stateHistory.test.ts
```
