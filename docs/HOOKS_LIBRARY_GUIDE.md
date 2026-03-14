# AgentForge Custom Hooks Library Guide

**版本：** v0.3.3+
**更新日期：** 2026-03-14
**文件数量：** 13 个 Hook 文件
**Hook 数量：** 80+ 个函数

---

## 📚 目录

1. [概述](#概述)
2. [动画 Hooks](#动画-hooks)
3. [存储 Hooks](#存储-hooks)
4. [性能优化 Hooks](#性能优化-hooks)
5. [UI/UX Hooks](#uiux-hooks)
6. [状态管理 Hooks](#状态管理-hooks)
7. [窗口和视口 Hooks](#窗口和视口-hooks)
8. [事件监听 Hooks](#事件监听-hooks)
9. [定时器 Hooks](#定时器-hooks)
10. [剪贴板 Hooks](#剪贴板-hooks)
11. [快速查找表](#快速查找表)

---

## 概述

AgentForge 自定义 Hook 库提供了一套完整的、类型安全的 React Hooks，用于简化常见的开发任务。所有 Hook 都经过 TypeScript 编译验证，支持 SSR，并遵循 React Hooks 最佳实践。

### 安装和导入

```typescript
// 从统一入口导入
import { useDebounce, useToggle, useCopyToClipboard } from '@/hooks'

// 或从具体文件导入
import { useDebounce } from '@/hooks/useDebounce'
```

---

## 动画 Hooks

### useAnimatedCounter

数字递增动画，适用于经验值、金币等数值的平滑过渡。

```typescript
import { useAnimatedCounter } from '@/hooks'

function ExpBar({ exp }: { exp: number }) {
  const animatedExp = useAnimatedCounter(exp, {
    duration: 800,
    easing: (t) => t * (2 - t) // easeOutQuad
  })

  return <div>经验值: {animatedExp}</div>
}
```

**选项：**
- `duration`: 动画持续时间（毫秒）
- `easing`: 缓动函数
- `decimals`: 小数位数
- `autoStart`: 是否自动开始动画

### useControllableCounter

带暂停/恢复功能的数字动画。

```typescript
const { count, pause, resume, reset, isPaused } = useControllableCounter(1000, {
  duration: 1000
})

return (
  <>
    <div>{count}</div>
    <button onClick={isPaused ? resume : pause}>
      {isPaused ? '继续' : '暂停'}
    </button>
  </>
)
```

---

## 存储 Hooks

### useLocalStorage

类型安全的 localStorage Hook，支持 SSR 和跨标签页同步。

```typescript
const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'dark')

// 设置值
setTheme('light')

// 函数式更新
setTheme((prev) => prev === 'dark' ? 'light' : 'dark')

// 删除值
removeTheme()
```

**特性：**
- ✅ 自动 JSON 序列化/反序列化
- ✅ SSR 安全
- ✅ 跨标签页同步
- ✅ 错误处理

### useLocalStorageWithExpiry

带过期时间的 localStorage。

```typescript
const [token, setToken, removeToken, isExpired] = useLocalStorageWithExpiry(
  'auth_token',
  null,
  24 * 60 * 60 * 1000 // 24小时
)

if (isExpired) {
  // Token 已过期，重新登录
}
```

---

## 性能优化 Hooks

### useDebounce

防抖值，延迟更新值，适用于搜索输入。

```typescript
const [searchTerm, setSearchTerm] = useState('')
const debouncedSearchTerm = useDebounce(searchTerm, 500)

useEffect(() => {
  // 只在用户停止输入 500ms 后执行
  searchAPI(debouncedSearchTerm)
}, [debouncedSearchTerm])
```

### useDebouncedCallback

防抖回调函数。

```typescript
const debouncedSave = useDebouncedCallback(() => {
  saveToServer(data)
}, 1000)

<input onChange={() => debouncedSave()} />
```

### useThrottle

节流值，限制更新频率，适用于滚动事件。

```typescript
const [scrollY, setScrollY] = useState(0)
const throttledScrollY = useThrottle(scrollY, 200)

useEffect(() => {
  // 每 200ms 最多更新一次
  updateNavbar(throttledScrollY)
}, [throttledScrollY])
```

### useRAFThrottle

使用 requestAnimationFrame 的节流，保证 60fps。

```typescript
const handleScroll = useRAFThrottle(() => {
  // 每帧最多执行一次
  updateParallax(window.scrollY)
})

<div onScroll={handleScroll}>...</div>
```

---

## UI/UX Hooks

### useMediaQuery

监听 CSS 媒体查询。

```typescript
const isMobile = useMediaQuery('(max-width: 768px)')
const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

return isMobile ? <MobileLayout /> : <DesktopLayout />
```

### useBreakpoint

使用预定义断点。

```typescript
import { useBreakpoint, BREAKPOINTS } from '@/hooks'

const isMobile = useBreakpoint('mobile')
const isDarkMode = useBreakpoint('darkMode')
const isTouch = useBreakpoint('touch')
```

**预定义断点：**
- `xs`, `sm`, `md`, `lg`, `xl`, `2xl`
- `mobile`, `tablet`, `desktop`
- `portrait`, `landscape`
- `darkMode`, `lightMode`
- `reducedMotion`, `highContrast`
- `touch`, `mouse`

### useScreenSize

获取当前屏幕尺寸类别。

```typescript
const screenSize = useScreenSize()
// 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

if (screenSize === 'xs') {
  return <TinyLayout />
}
```

### useResponsiveValue

根据断点返回不同的值。

```typescript
const columns = useResponsiveValue({
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4
}, 1)

<Grid columns={columns}>...</Grid>
```

### useIntersectionObserver

交叉观察器，用于懒加载、无限滚动等。

```typescript
const [ref, isVisible, entry] = useIntersectionObserver({
  threshold: 0.5,
  triggerOnce: true
})

<div ref={ref}>
  {isVisible && <HeavyComponent />}
</div>
```

### useLazyLoad

懒加载Hook。

```typescript
const [ref, shouldLoad] = useLazyLoad({ rootMargin: '200px' })

<img
  ref={ref}
  src={shouldLoad ? realImageUrl : placeholderUrl}
/>
```

### useInfiniteScroll

无限滚动Hook。

```typescript
const loadMoreRef = useInfiniteScroll(async () => {
  await fetchMoreData()
}, { rootMargin: '100px' })

return (
  <>
    {items.map(item => <Item key={item.id} {...item} />)}
    <div ref={loadMoreRef}>加载中...</div>
  </>
)
```

### useViewportAnimation

视口动画触发。

```typescript
const [ref, shouldAnimate, progress] = useViewportAnimation({
  threshold: 0.3
})

<motion.div
  ref={ref}
  initial={{ opacity: 0, y: 50 }}
  animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
>
  Content
</motion.div>
```

### useClickOutside

点击外部区域Hook，用于关闭模态框、下拉菜单。

```typescript
const [isOpen, setIsOpen] = useState(false)
const ref = useClickOutside(() => setIsOpen(false))

<div ref={ref}>
  {isOpen && <DropdownMenu />}
</div>
```

### useClickOutsideWithEscape

支持 Escape 键的点击外部Hook。

```typescript
const ref = useClickOutsideWithEscape(
  () => setIsOpen(false),
  () => console.log('Escape pressed')
)
```

### useMultipleClickOutside

监听多个元素的外部点击。

```typescript
const [triggerRef, menuRef] = useMultipleClickOutside(() => setIsOpen(false))

<>
  <button ref={triggerRef}>打开</button>
  <div ref={menuRef}>下拉菜单</div>
</>
```

---

## 状态管理 Hooks

### usePrevious

获取上一次渲染的值。

```typescript
const [count, setCount] = useState(0)
const prevCount = usePrevious(count)

useEffect(() => {
  console.log(`Count changed from ${prevCount} to ${count}`)
}, [count, prevCount])
```

### useCompare

比较当前值和上一次的值。

```typescript
const [user, setUser] = useState({ id: 1, name: 'Alice' })
const [prevUser, userChanged] = useCompare(user, (a, b) => a?.id === b?.id)

if (userChanged) {
  console.log('User changed!')
}
```

### useValueDirection

获取数值变化的方向。

```typescript
const direction = useValueDirection(score)
// 'increase' | 'decrease' | 'unchanged'

if (direction === 'increase') {
  showAnimation('up')
}
```

### useToggle

布尔值切换Hook。

```typescript
const [isOpen, toggle, open, close, setIsOpen] = useToggle()

<button onClick={toggle}>切换</button>
<button onClick={open}>打开</button>
<button onClick={close}>关闭</button>
```

### useAutoResetToggle

自动重置的Toggle Hook。

```typescript
// 点击后 2 秒自动关闭
const [isVisible, show] = useAutoResetToggle(false, 2000)

<button onClick={show}>显示通知</button>
{isVisible && <Notification />}
```

### useMultiToggle

多状态循环切换。

```typescript
const [theme, nextTheme, prevTheme, reset] = useMultiToggle([
  'light',
  'dark',
  'auto'
])

<button onClick={nextTheme}>
  当前主题: {theme}
</button>
```

---

## 窗口和视口 Hooks

### useWindowSize

获取窗口尺寸。

```typescript
const windowSize = useWindowSize()

return (
  <div>
    窗口大小: {windowSize.width} x {windowSize.height}
  </div>
)
```

### useWindowDimensions

简化版窗口尺寸Hook。

```typescript
const [width, height] = useWindowDimensions()
```

### useWindowScroll

获取窗口滚动位置。

```typescript
const scroll = useWindowScroll()

return (
  <div>
    已滚动: {scroll.y}px
  </div>
)
```

### useScrollDirection

滚动方向检测。

```typescript
const scrollDirection = useScrollDirection()
// 'up' | 'down' | 'none'

// 根据滚动方向隐藏/显示导航栏
<Navbar visible={scrollDirection !== 'down'} />
```

### useViewport

完整视口信息（尺寸 + 滚动）。

```typescript
const viewport = useViewport()

console.log(viewport.width, viewport.height, viewport.scrollY)
console.log(viewport.isAtTop, viewport.isAtBottom)
console.log(viewport.scrollDirection)
```

---

## 事件监听 Hooks

### useEventListener

通用事件监听Hook。

```typescript
useEventListener('resize', handleResize)
useEventListener('scroll', handleScroll, containerRef)
useEventListener('keydown', handleKeyDown, document)
```

### useKeyPress

键盘事件监听。

```typescript
useKeyPress('Escape', () => setIsOpen(false))
useKeyPress('/', () => focusSearch(), { ctrl: true })
useKeyPress('s', () => save(), { ctrl: true, shift: true })
```

### useHover

鼠标悬停监听。

```typescript
const ref = useHover(
  () => setIsHovered(true),
  () => setIsHovered(false)
)

<div ref={ref}>悬停我</div>
```

### useHoverState

简化版悬停Hook（返回状态）。

```typescript
const [ref, isHovered] = useHoverState()

<div ref={ref} style={{ background: isHovered ? 'blue' : 'gray' }}>
  悬停我
</div>
```

### useFocus

焦点监听Hook。

```typescript
const [ref, isFocused] = useFocus()

<input ref={ref} className={isFocused ? 'focused' : ''} />
```

### useLongPress

长按监听Hook。

```typescript
const ref = useLongPress(() => {
  console.log('长按触发!')
}, 1000)

<button ref={ref}>长按我</button>
```

### useDoubleClick

双击监听Hook。

```typescript
const ref = useDoubleClick(() => {
  console.log('双击触发!')
})

<div ref={ref}>双击我</div>
```

---

## 定时器 Hooks

### useTimeout

setTimeout Hook。

```typescript
useTimeout(() => {
  console.log('3秒后执行')
}, 3000)

// 传入 null 可暂停
const delay = isActive ? 3000 : null
useTimeout(callback, delay)
```

### useControllableTimeout

可控制的 Timeout Hook。

```typescript
const [start, cancel, reset] = useControllableTimeout(() => {
  console.log('超时!')
}, 5000)

<button onClick={start}>开始</button>
<button onClick={cancel}>取消</button>
<button onClick={reset}>重置</button>
```

### useInterval

setInterval Hook。

```typescript
useInterval(() => {
  console.log('每秒执行')
}, 1000)
```

### useControllableInterval

可控制的 Interval Hook。

```typescript
const [start, stop, toggle, isRunning] = useControllableInterval(() => {
  console.log('Tick')
}, 1000)

<button onClick={toggle}>
  {isRunning ? '暂停' : '开始'}
</button>
```

### useCountdown

倒计时Hook。

```typescript
const [seconds, start, pause, reset, isRunning] = useCountdown(60, () => {
  alert('时间到!')
})

<div>
  {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
</div>
<button onClick={isRunning ? pause : start}>
  {isRunning ? '暂停' : '开始'}
</button>
```

### useStopwatch

计时器Hook（正向计数）。

```typescript
const [seconds, start, pause, reset, isRunning] = useStopwatch()

<div>已用时: {seconds}秒</div>
<button onClick={isRunning ? pause : start}>
  {isRunning ? '暂停' : '开始'}
</button>
```

### useRAFLoop

requestAnimationFrame 循环Hook。

```typescript
const [isAnimating, setIsAnimating] = useState(true)

useRAFLoop((deltaTime) => {
  // 每帧更新动画
  updateAnimation(deltaTime)
}, isAnimating)
```

---

## 剪贴板 Hooks

### useCopyToClipboard

复制到剪贴板Hook（完整版）。

```typescript
const [copy, { value, error, copied }] = useCopyToClipboard()

<button onClick={() => copy('Hello World')}>
  {copied ? '已复制!' : '复制'}
</button>

{error && <div>复制失败: {error.message}</div>}
```

### useCopy

简化版复制Hook。

```typescript
const [copy, copied] = useCopy()

<button onClick={() => copy('要复制的文本')}>
  {copied ? '✓ 已复制' : '复制'}
</button>
```

### useCopyWithCallback

带回调的复制Hook。

```typescript
const [copy, copied] = useCopyWithCallback(
  () => toast.success('复制成功!'),
  () => toast.error('复制失败')
)
```

### usePasteFromClipboard

从剪贴板粘贴Hook。

```typescript
const [paste, pastedText, error] = usePasteFromClipboard()

<button onClick={paste}>粘贴</button>
{pastedText && <div>粘贴内容: {pastedText}</div>}
```

---

## 快速查找表

### 按用途查找

| 用途 | Hook |
|------|------|
| 搜索输入优化 | `useDebounce`, `useDebouncedCallback` |
| 滚动优化 | `useThrottle`, `useRAFThrottle` |
| 响应式布局 | `useMediaQuery`, `useBreakpoint`, `useResponsiveValue` |
| 懒加载图片 | `useLazyLoad` |
| 无限滚动 | `useInfiniteScroll` |
| 关闭模态框/菜单 | `useClickOutside`, `useClickOutsideWithEscape` |
| 数值动画 | `useAnimatedCounter` |
| 本地存储 | `useLocalStorage`, `useLocalStorageWithExpiry` |
| 窗口尺寸 | `useWindowSize`, `useWindowDimensions` |
| 滚动位置 | `useWindowScroll`, `useScrollDirection` |
| 按键监听 | `useKeyPress` |
| 鼠标悬停 | `useHover`, `useHoverState` |
| 复制文本 | `useCopy`, `useCopyToClipboard` |
| 倒计时 | `useCountdown` |
| 计时器 | `useStopwatch` |
| 布尔切换 | `useToggle` |
| 获取上次值 | `usePrevious`, `useCompare` |

### 按场景查找

**数据加载场景：**
- 搜索: `useDebounce` + `useEffect`
- 懒加载: `useLazyLoad`
- 无限滚动: `useInfiniteScroll`
- 轮询: `useInterval`

**用户交互场景：**
- 点击外部关闭: `useClickOutside`
- 长按操作: `useLongPress`
- 双击操作: `useDoubleClick`
- 键盘快捷键: `useKeyPress`

**动画场景：**
- 数字递增: `useAnimatedCounter`
- 滚动视差: `useRAFThrottle`
- 进入视口触发: `useViewportAnimation`

**性能优化场景：**
- 高频事件: `useThrottle`, `useRAFThrottle`
- 搜索输入: `useDebounce`
- 条件渲染: `useMediaQuery`, `useIntersectionObserver`

---

## 最佳实践

### 1. 选择合适的 Hook

```typescript
// ❌ 错误：对高频滚动事件使用 debounce
const debouncedScroll = useDebounce(scrollY, 100)

// ✅ 正确：使用 throttle 或 RAF
const throttledScroll = useThrottle(scrollY, 100)
const rafScroll = useRAFThrottle(handleScroll)
```

### 2. 组合使用 Hooks

```typescript
// 响应式 + 懒加载
const isMobile = useBreakpoint('mobile')
const [ref, shouldLoad] = useLazyLoad()

<img
  ref={ref}
  src={shouldLoad ? (isMobile ? mobileImg : desktopImg) : placeholder}
/>
```

### 3. 性能优化

```typescript
// 使用 useMemo 缓存复杂计算
const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5 })
const shouldRender = useMemo(() => {
  return isVisible && complexCondition()
}, [isVisible, complexCondition])

// 使用 useCallback 避免重复创建函数
const handleCopy = useCallback(() => {
  copy(text)
}, [text, copy])
```

### 4. 类型安全

```typescript
// 使用泛型指定元素类型
const [ref, isHovered] = useHoverState<HTMLButtonElement>()
const [copyRef, copied] = useCopy<HTMLDivElement>()

// 类型推导
const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'dark')
```

---

## 常见问题

### Q: Hook 是否支持 SSR？

A: 是的，所有 Hook 都包含 SSR 兼容代码：

```typescript
if (typeof window === 'undefined') {
  return defaultValue
}
```

### Q: 如何处理浏览器兼容性？

A: Hooks 会自动降级：

```typescript
// IntersectionObserver 不支持时
if (typeof IntersectionObserver === 'undefined') {
  console.warn('IntersectionObserver is not supported')
  return
}

// 剪贴板 API 降级到 execCommand
if (!navigator?.clipboard) {
  document.execCommand('copy')
}
```

### Q: Hook 性能开销如何？

A: 所有 Hook 都经过优化：
- 使用 `useRef` 避免不必要的重渲染
- 使用 `useCallback` 和 `useMemo` 缓存
- 支持节流/防抖减少计算

---

## 版本历史

### v0.3.3+ (2026-03-14)

**新增 80+ Hooks：**
- ✅ 动画 Hooks (3个)
- ✅ 存储 Hooks (2个)
- ✅ 性能优化 Hooks (8个)
- ✅ UI/UX Hooks (20+个)
- ✅ 状态管理 Hooks (12个)
- ✅ 窗口和视口 Hooks (10个)
- ✅ 事件监听 Hooks (9个)
- ✅ 定时器 Hooks (9个)
- ✅ 剪贴板 Hooks (7个)

**质量保证：**
- ✅ 100% TypeScript 类型覆盖
- ✅ 0 编译错误
- ✅ SSR 安全
- ✅ 完整文档和示例

---

## 资源链接

- **源代码：** `/src/hooks/`
- **类型定义：** 包含在各 Hook 文件中
- **示例代码：** 本文档
- **相关文档：**
  - [UI Animation Guide](./UI_ANIMATION_GUIDE.md)
  - [Performance Guide](./v0.3.2_UI_OPTIMIZATION_REPORT.md)

---

## 反馈和贡献

如果你发现 bug 或有改进建议，请提交 Issue 或 Pull Request。

**开发团队：** AgentForge Dev Team
**文档维护：** Claude Opus 4.6
**最后更新：** 2026-03-14

---

🚀 **AgentForge - Building The Future of Agent Management**
