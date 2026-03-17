# 快捷键系统文档

## 概述

AgentForge 的快捷键系统提供了强大而灵活的键盘快捷键管理功能，支持跨平台（Mac/Windows/Linux），包含冲突检测、自定义配置等高级特性。

## 特性

- ✨ 简单易用的 React Hook API
- 🎯 跨平台支持（自动识别 Mac/Windows/Linux）
- 🔍 快捷键冲突检测
- 🎛️ 可启用/禁用的快捷键
- 🌍 全局快捷键（在输入框中也生效）
- 📦 批量注册快捷键
- 💡 内置快捷键帮助面板
- 🎨 美观的快捷键显示格式

## 快速开始

### 基础用法

```tsx
import { useHotkey } from '../hooks/useHotkeys'

function MyComponent() {
  // 注册一个快捷键
  useHotkey(
    {
      key: 'k',
      meta: true, // Mac: Cmd, Windows/Linux: Win
      description: '打开搜索',
    },
    () => {
      console.log('Cmd+K / Win+K 被按下')
    }
  )

  return <div>按 Cmd/Win+K 打开搜索</div>
}
```

### 批量注册快捷键

```tsx
import { useHotkeys } from '../hooks/useHotkeys'

function MyComponent() {
  useHotkeys([
    {
      key: '1',
      meta: true,
      description: '切换到标签1',
      handler: () => switchTab(0),
    },
    {
      key: '2',
      meta: true,
      description: '切换到标签2',
      handler: () => switchTab(1),
    },
    {
      key: '3',
      meta: true,
      description: '切换到标签3',
      handler: () => switchTab(2),
    },
  ])

  return <div>按 Cmd/Win+1-3 切换标签</div>
}
```

## API 参考

### `useHotkey(config, handler, deps?)`

注册单个快捷键。

**参数:**

- `config: HotkeyConfig` - 快捷键配置
  - `key: string` - 键名（如 'k', 'Enter', 'Escape'）
  - `ctrl?: boolean` - 是否需要 Ctrl 键
  - `shift?: boolean` - 是否需要 Shift 键
  - `alt?: boolean` - 是否需要 Alt 键
  - `meta?: boolean` - 是否需要 Meta 键（Mac: Command, Windows: Win）
  - `description?: string` - 描述文本
  - `enabled?: boolean` - 是否启用（默认 true）
  - `preventDefault?: boolean` - 是否阻止默认行为（默认 true）
  - `global?: boolean` - 是否为全局快捷键（在输入框中也生效）
- `handler: (event: KeyboardEvent) => void` - 处理函数
- `deps?: React.DependencyList` - 依赖数组

**示例:**

```tsx
// 基础快捷键
useHotkey({ key: 'k', meta: true }, () => {
  console.log('Cmd+K')
})

// 带修饰键的快捷键
useHotkey({ key: 's', meta: true, shift: true }, () => {
  console.log('Cmd+Shift+S')
})

// 可禁用的快捷键
useHotkey({ key: 'e', meta: true, enabled: isEnabled }, () => {
  console.log('Cmd+E')
})

// 全局快捷键（在输入框中也生效）
useHotkey({ key: 'Escape', global: true }, () => {
  closeModal()
})
```

### `useHotkeys(hotkeys, deps?)`

批量注册快捷键。

**参数:**

- `hotkeys: Array<HotkeyConfig & { handler: HotkeyHandler }>` - 快捷键配置数组
- `deps?: React.DependencyList` - 依赖数组

**示例:**

```tsx
useHotkeys([
  { key: '1', meta: true, handler: () => switchTab(0) },
  { key: '2', meta: true, handler: () => switchTab(1) },
  { key: '3', meta: true, handler: () => switchTab(2) },
])
```

### `useGetAllHotkeys()`

获取所有已注册的快捷键。

**返回:**

- `() => Array<{ keyId: string; config: HotkeyConfig }>` - 获取所有快捷键的函数

**示例:**

```tsx
const getAllHotkeys = useGetAllHotkeys()
const allHotkeys = getAllHotkeys()

console.log('已注册的快捷键:', allHotkeys)
```

### `useCheckHotkeyConflict()`

检查快捷键冲突。

**返回:**

- `(config: HotkeyConfig) => boolean` - 检查冲突的函数

**示例:**

```tsx
const checkConflict = useCheckHotkeyConflict()
const hasConflict = checkConflict({ key: 'k', meta: true })

console.log('是否有冲突:', hasConflict)
```

### `formatHotkey(config)`

格式化快捷键显示。

**参数:**

- `config: HotkeyConfig` - 快捷键配置

**返回:**

- `string` - 格式化的快捷键字符串

**示例:**

```tsx
import { formatHotkey } from '../hooks/useHotkeys'

const formatted = formatHotkey({ key: 'k', meta: true, shift: true })
// Mac: "⌘⇧K"
// Windows: "Win+Shift+K"
```

### `getPlatformModifierKey()`

获取平台特定的修饰键。

**返回:**

- `'Cmd' | 'Ctrl'` - 修饰键名称

**示例:**

```tsx
import { getPlatformModifierKey } from '../hooks/useHotkeys'

const modifierKey = getPlatformModifierKey()
// Mac: "Cmd"
// Windows/Linux: "Ctrl"
```

## 内置全局快捷键

AgentForge 提供了以下内置全局快捷键：

### 全局操作

- `Cmd/Ctrl+K` - 全局搜索
- `Cmd/Ctrl+N` - 新建任务
- `Cmd/Ctrl+P` - 暂停/继续执行
- `Cmd/Ctrl+/` - 显示快捷键帮助
- `Cmd/Ctrl+,` - 打开设置
- `Esc` - 关闭弹窗

### 导航

- `Cmd/Ctrl+1-9` - 切换标签页（1-9）
- `Cmd/Ctrl+[` - 上一个标签
- `Cmd/Ctrl+]` - 下一个标签
- `Cmd/Ctrl+B` - 切换侧边栏

### 编辑

- `Cmd/Ctrl+S` - 保存
- `Cmd/Ctrl+Z` - 撤销
- `Cmd/Ctrl+Shift+Z` - 重做
- `Cmd/Ctrl+C` - 复制
- `Cmd/Ctrl+V` - 粘贴

### 任务管理

- `Cmd/Ctrl+Enter` - 执行任务
- `Cmd/Ctrl+D` - 删除任务
- `Cmd/Ctrl+E` - 编辑任务
- `Cmd/Ctrl+R` - 刷新任务列表

### 视图

- `Cmd/Ctrl+=` - 放大
- `Cmd/Ctrl+-` - 缩小
- `Cmd/Ctrl+0` - 重置缩放
- `Cmd/Ctrl+Shift+F` - 全屏

## 快捷键帮助面板

按 `Cmd/Ctrl+/` 可以打开快捷键帮助面板，查看所有可用的快捷键。

### 使用方式

快捷键帮助面板会自动集成到应用中，只需在 App.tsx 中引入：

```tsx
import { HotkeyHelp } from './components/HotkeyHelp'

function App() {
  return (
    <div>
      {/* 其他组件 */}
      <HotkeyHelp />
    </div>
  )
}
```

## 自定义快捷键

### 创建全局快捷键提供者

```tsx
// GlobalHotkeyProvider.tsx
import { useHotkeys } from '../hooks/useHotkeys'

export function GlobalHotkeyProvider() {
  useHotkeys([
    {
      key: 'k',
      meta: true,
      description: '全局搜索',
      handler: () => {
        window.dispatchEvent(new CustomEvent('hotkey:openSearch'))
      },
    },
    {
      key: 'n',
      meta: true,
      description: '新建任务',
      handler: () => {
        window.dispatchEvent(new CustomEvent('hotkey:newTask'))
      },
    },
  ])

  return null // 逻辑组件，不渲染
}
```

### 监听自定义事件

```tsx
// MyComponent.tsx
import { useEffect } from 'react'

function MyComponent() {
  useEffect(() => {
    const handleOpenSearch = () => {
      console.log('打开搜索')
    }

    window.addEventListener('hotkey:openSearch', handleOpenSearch)

    return () => {
      window.removeEventListener('hotkey:openSearch', handleOpenSearch)
    }
  }, [])

  return <div>我的组件</div>
}
```

## 高级用法

### 条件启用/禁用

```tsx
const [isModalOpen, setIsModalOpen] = useState(false)

// 只在模态框打开时启用 ESC 键
useHotkey(
  {
    key: 'Escape',
    enabled: isModalOpen,
    global: true,
  },
  () => {
    setIsModalOpen(false)
  }
)
```

### 组合多个修饰键

```tsx
// Cmd+Shift+Alt+K
useHotkey(
  {
    key: 'k',
    meta: true,
    shift: true,
    alt: true,
  },
  () => {
    console.log('复杂的快捷键组合')
  }
)
```

### 跨平台兼容

```tsx
// 在 Mac 上使用 Cmd，在 Windows/Linux 上使用 Ctrl
useHotkey(
  {
    key: 's',
    meta: true, // 自动适配平台
  },
  () => {
    handleSave()
  }
)

// 同时支持两种修饰键
useHotkey(
  {
    key: 's',
    ctrl: true,
    meta: true, // Ctrl+S 或 Cmd+S 都会触发
  },
  () => {
    handleSave()
  }
)
```

### 防止默认行为

```tsx
// 阻止浏览器默认的 Cmd+R 刷新行为
useHotkey(
  {
    key: 'r',
    meta: true,
    preventDefault: true,
  },
  (event) => {
    event.preventDefault()
    handleRefresh()
  }
)
```

## 最佳实践

### 1. 使用描述文本

为所有快捷键添加描述，方便在帮助面板中显示：

```tsx
useHotkey(
  {
    key: 'k',
    meta: true,
    description: '打开全局搜索', // 好的描述
  },
  handleSearch
)
```

### 2. 避免快捷键冲突

使用冲突检测来避免重复注册：

```tsx
const checkConflict = useCheckHotkeyConflict()

if (checkConflict({ key: 'k', meta: true })) {
  console.warn('快捷键 Cmd+K 已被注册')
}
```

### 3. 合理使用全局快捷键

只在必要时使用全局快捷键（如 ESC 关闭模态框）：

```tsx
// ESC 应该是全局的，在输入框中也能关闭模态框
useHotkey({ key: 'Escape', global: true }, closeModal)

// 但大多数快捷键不应该在输入框中生效
useHotkey({ key: 'k', meta: true, global: false }, handleSearch)
```

### 4. 清理和管理

使用依赖数组来确保快捷键正确更新：

```tsx
useHotkey(
  { key: 'e', meta: true },
  () => {
    console.log('Counter:', counter)
  },
  [counter] // 当 counter 变化时重新注册
)
```

### 5. 组织快捷键

将相关的快捷键分组管理：

```tsx
// 导航相关的快捷键
useHotkeys([
  { key: '1', meta: true, handler: () => switchTab(0) },
  { key: '2', meta: true, handler: () => switchTab(1) },
  { key: '[', meta: true, handler: () => previousTab() },
  { key: ']', meta: true, handler: () => nextTab() },
])
```

## 故障排查

### 快捷键不生效

1. 检查是否在输入框中：非全局快捷键在输入框中不生效
2. 检查 `enabled` 属性：确保快捷键已启用
3. 检查浏览器兼容性：某些快捷键可能被浏览器占用

### 快捷键冲突

使用 `useCheckHotkeyConflict` 检测冲突：

```tsx
const checkConflict = useCheckHotkeyConflict()
const hasConflict = checkConflict({ key: 'k', meta: true })
console.log('是否有冲突:', hasConflict)
```

### 快捷键在模态框中不生效

确保使用 `global: true` 或在模态框外部注册快捷键。

## 性能优化

### 避免重复注册

```tsx
// ❌ 不好：每次渲染都会重新注册
useHotkey({ key: 'k', meta: true }, () => {
  console.log('Cmd+K')
})

// ✅ 好：使用依赖数组
useHotkey(
  { key: 'k', meta: true },
  () => {
    console.log('Cmd+K')
  },
  []
)
```

### 批量注册优于单个注册

```tsx
// ❌ 不好：多个 useHotkey 调用
useHotkey({ key: '1', meta: true }, () => switchTab(0))
useHotkey({ key: '2', meta: true }, () => switchTab(1))
useHotkey({ key: '3', meta: true }, () => switchTab(2))

// ✅ 好：使用 useHotkeys 批量注册
useHotkeys([
  { key: '1', meta: true, handler: () => switchTab(0) },
  { key: '2', meta: true, handler: () => switchTab(1) },
  { key: '3', meta: true, handler: () => switchTab(2) },
])
```

## 示例项目

查看 `src/components/HotkeyDemo.tsx` 了解完整的使用示例。

## 相关资源

- [useEventListener Hook](./HOOKS.md#useeventlistener)
- [快捷键帮助组件](../src/components/HotkeyHelp.tsx)
- [全局快捷键提供者](../src/components/GlobalHotkeyProvider.tsx)

## 更新日志

### v1.0.0 (2026-03-16)

- ✨ 初始版本发布
- 🎯 跨平台支持
- 🔍 冲突检测
- 💡 快捷键帮助面板
- 📦 批量注册 API

## 许可证

MIT License
