# AgentForge Hooks Quick Reference Card

**快速查找常用 Hook - v0.3.4**

---

## 🔥 最常用的 20 个 Hook

### 性能优化
```typescript
// 搜索输入优化
const debouncedValue = useDebounce(searchTerm, 500)

// 滚动事件优化
const throttledValue = useThrottle(scrollY, 200)
const handleScroll = useRAFThrottle(onScroll)
```

### 响应式
```typescript
// 断点检测
const isMobile = useBreakpoint('mobile')

// 屏幕尺寸
const [width, height] = useWindowDimensions()

// 响应式值
const columns = useResponsiveValue({ xs: 1, md: 3, lg: 4 }, 1)
```

### UI 交互
```typescript
// 点击外部关闭
const ref = useClickOutside(() => setIsOpen(false))

// 悬停状态
const [ref, isHovered] = useHoverState()

// 键盘快捷键
useKeyPress('Escape', () => close())
```

### 懒加载 & 滚动
```typescript
// 图片懒加载
const [ref, shouldLoad] = useLazyLoad()

// 无限滚动
const loadMoreRef = useInfiniteScroll(loadMore)

// 滚动方向
const direction = useScrollDirection() // 'up' | 'down' | 'none'
```

### 状态管理
```typescript
// 布尔切换
const [isOpen, toggle, open, close] = useToggle()

// 上一次的值
const prevValue = usePrevious(value)

// 本地存储
const [data, setData, remove] = useLocalStorage('key', defaultValue)
```

### 定时器
```typescript
// 倒计时
const [seconds, start, pause, reset, isRunning] = useCountdown(60)

// 延迟执行
useTimeout(() => action(), 3000)

// 轮询
useInterval(() => fetchData(), 5000)
```

### 剪贴板
```typescript
// 复制文本
const [copy, copied] = useCopy()
// <button onClick={() => copy('text')}>...</button>
```

### 动画
```typescript
// 数字递增动画
const animatedValue = useAnimatedCounter(1000, { duration: 800 })
```

---

## 📋 分类索引

### 🎨 动画 (3)
- `useAnimatedCounter` - 数字递增动画
- `useControllableCounter` - 可控制数字动画
- `easingFunctions` - 缓动函数

### 💾 存储 (2)
- `useLocalStorage` - 本地存储
- `useLocalStorageWithExpiry` - 带过期时间

### ⚡ 性能 (8)
- `useDebounce` - 防抖值
- `useDebouncedCallback` - 防抖回调
- `useThrottle` - 节流值
- `useThrottledCallback` - 节流回调
- `useRAFThrottle` - RAF 节流
- ...

### 📱 响应式 (6)
- `useMediaQuery` - 媒体查询
- `useBreakpoint` - 断点检测
- `useScreenSize` - 屏幕尺寸
- `useResponsiveValue` - 响应式值
- ...

### 👁️ 可见性 (6)
- `useIntersectionObserver` - 交叉观察器
- `useLazyLoad` - 懒加载
- `useInfiniteScroll` - 无限滚动
- `useViewportAnimation` - 视口动画
- ...

### 🖱️ 交互 (6)
- `useClickOutside` - 点击外部
- `useHover` / `useHoverState` - 悬停
- `useKeyPress` - 按键
- `useLongPress` - 长按
- `useDoubleClick` - 双击
- ...

### 📊 状态 (11)
- `usePrevious` - 上一次值
- `useToggle` - 切换
- `useMultiToggle` - 多状态切换
- `useCompare` - 值比较
- ...

### 🪟 窗口 (8)
- `useWindowSize` - 窗口尺寸
- `useWindowScroll` - 滚动位置
- `useScrollDirection` - 滚动方向
- `useViewport` - 视口信息
- ...

### ⏱️ 定时器 (9)
- `useTimeout` / `useInterval` - 定时器
- `useCountdown` - 倒计时
- `useStopwatch` - 计时器
- `useRAFLoop` - RAF 循环
- ...

### 📋 剪贴板 (7)
- `useCopy` - 复制
- `useCopyToClipboard` - 完整复制
- `usePasteFromClipboard` - 粘贴
- ...

---

## 🎯 常见场景速查

| 场景 | 推荐 Hook |
|------|----------|
| 搜索输入 | `useDebounce` |
| 滚动优化 | `useThrottle`, `useRAFThrottle` |
| 响应式布局 | `useBreakpoint`, `useResponsiveValue` |
| 图片懒加载 | `useLazyLoad` |
| 列表懒加载 | `useInfiniteScroll` |
| 关闭模态框 | `useClickOutside` |
| 悬停效果 | `useHoverState` |
| 键盘快捷键 | `useKeyPress` |
| 数值动画 | `useAnimatedCounter` |
| 布尔切换 | `useToggle` |
| 历史追踪 | `usePrevious`, `useHistory` |
| 本地缓存 | `useLocalStorage` |
| 复制文本 | `useCopy` |
| 倒计时 | `useCountdown` |
| 计时器 | `useStopwatch` |
| 轮询 | `useInterval` |

---

## 💡 组合使用示例

### 响应式搜索
```typescript
const isMobile = useBreakpoint('mobile')
const [search, setSearch] = useState('')
const debouncedSearch = useDebounce(search, 500)

useEffect(() => {
  if (debouncedSearch) {
    searchAPI(debouncedSearch, { limit: isMobile ? 5 : 20 })
  }
}, [debouncedSearch, isMobile])
```

### 懒加载 + 动画
```typescript
const [ref, isVisible] = useLazyLoad()
const [animateRef, shouldAnimate] = useViewportAnimation()

<motion.img
  ref={(el) => {
    ref.current = el
    animateRef.current = el
  }}
  src={isVisible ? realSrc : placeholder}
  animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
/>
```

### 模态框完整示例
```typescript
const [isOpen, toggle, open, close] = useToggle()
const ref = useClickOutside(close)
useKeyPress('Escape', close)

<button onClick={open}>打开</button>
{isOpen && (
  <div ref={ref}>
    <Modal onClose={close} />
  </div>
)}
```

---

## 📚 完整文档

详细文档请查看：
- **使用指南:** [HOOKS_LIBRARY_GUIDE.md](./HOOKS_LIBRARY_GUIDE.md)
- **开发报告:** [v0.3.4_HOOKS_DEVELOPMENT_REPORT.md](./v0.3.4_HOOKS_DEVELOPMENT_REPORT.md)
- **版本说明:** [CHANGELOG_v0.3.4.md](../CHANGELOG_v0.3.4.md)

---

**AgentForge v0.3.4 - Hook Revolution 🪝**
