# 📱 移动端优化指南

> Task #75: Mobile Experience Optimization - 完整实现

## 🚀 快速开始

### 1. 查看演示
在应用中点击右侧导航栏的 **"移动"** 标签，查看完整的移动端功能演示。

### 2. 使用移动端组件

```tsx
import {
  MobileBottomTabBar,
  SwipeableItem,
  MobileOptimizedLayout,
  TouchOptimizedButton
} from '@/components/mobile'
```

### 3. 使用触摸手势

```tsx
import { useTouchGestures } from '@/hooks'

const ref = useRef<HTMLDivElement>(null)

useTouchGestures(ref, {
  onSwipe: (direction) => console.log('Swiped:', direction.direction),
  onLongPress: (pos) => console.log('Long press at:', pos),
  onDoubleTap: (pos) => console.log('Double tap at:', pos)
})
```

---

## 📦 组件清单

### 导航组件
- **MobileBottomTabBar** - iOS 风格底部导航栏
- **FloatingActionButton** - 浮动操作按钮

### 交互组件
- **SwipeableItem** - 滑动删除列表项
- **TouchOptimizedButton** - 触摸优化按钮
- **TouchOptimizedIconButton** - 触摸优化图标按钮
- **TouchOptimizedChip** - 触摸优化标签
- **TouchOptimizedToggle** - 触摸优化开关

### 布局组件
- **MobileOptimizedLayout** - 移动端布局容器
- **MobileCard** - 移动端卡片
- **MobileSection** - 移动端分区
- **MobileListItem** - 移动端列表项

---

## 🎯 Hooks 列表

### 触摸手势
- **useSwipe** - 滑动手势
- **useLongPress** - 长按手势
- **useDoubleTap** - 双击手势
- **usePinchZoom** - 捏合缩放
- **usePan** - 拖拽手势
- **useTouchGestures** - 组合手势 (推荐)

### 响应式
- **useMediaQuery** - 媒体查询
- **useBreakpoint** - 断点检测
- **useScreenSize** - 屏幕尺寸
- **useResponsiveValue** - 响应式值

---

## 💡 使用示例

### 底部导航

```tsx
import { MobileBottomTabBar } from '@/components/mobile'
import { Home, Activity, Settings } from 'lucide-react'

const tabs = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'tasks', label: '任务', icon: Activity, badge: 5 },
  { id: 'settings', label: '设置', icon: Settings }
]

function App() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <MobileBottomTabBar
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  )
}
```

### 滑动删除

```tsx
import { SwipeableItem, SWIPE_ACTIONS } from '@/components/mobile'

function TaskList({ tasks, onDelete, onArchive }) {
  return (
    <>
      {tasks.map(task => (
        <SwipeableItem
          key={task.id}
          rightActions={[
            {
              ...SWIPE_ACTIONS.delete,
              onClick: () => onDelete(task.id)
            }
          ]}
          leftActions={[
            {
              ...SWIPE_ACTIONS.archive,
              onClick: () => onArchive(task.id)
            }
          ]}
        >
          <MobileListItem
            title={task.title}
            subtitle={task.description}
            badge={task.status}
          />
        </SwipeableItem>
      ))}
    </>
  )
}
```

### 触摸手势

```tsx
import { useTouchGestures } from '@/hooks'

function ImageViewer({ src }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useTouchGestures(ref, {
    onDoubleTap: () => {
      setScale(scale === 1 ? 2 : 1)
    },
    onPinch: (state) => {
      setScale(state.scale)
    },
    onSwipe: (direction) => {
      if (direction.direction === 'down') {
        // Close image
      }
    }
  })

  return (
    <div ref={ref} style={{ transform: `scale(${scale})` }}>
      <img src={src} alt="Image" />
    </div>
  )
}
```

### 移动端布局

```tsx
import { MobileOptimizedLayout, MobileCard, MobileSection } from '@/components/mobile'

function Dashboard() {
  return (
    <MobileOptimizedLayout
      showBottomNav
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onRefresh={async () => {
        await fetchData()
      }}
      header={<TopBar />}
    >
      <MobileSection title="统计数据" subtitle="实时更新">
        <MobileCard
          title="任务进度"
          icon={<Activity className="w-6 h-6 text-cyan-400" />}
        >
          <ProgressBar value={75} />
        </MobileCard>
      </MobileSection>
    </MobileOptimizedLayout>
  )
}
```

### 响应式设计

```tsx
import { useBreakpoint, useScreenSize } from '@/hooks'

function ResponsiveComponent() {
  const isMobile = useBreakpoint('mobile')
  const screenSize = useScreenSize()

  if (isMobile) {
    return <MobileLayout />
  }

  return <DesktopLayout />
}
```

---

## 🎨 设计规范

### 触摸目标尺寸
- **最小尺寸**: 48x48px (WCAG AA)
- **推荐尺寸**: 56x56px
- **按钮间距**: 8px

### 响应式断点
```
xs:  < 480px   (手机竖屏)
sm:  480-640px (手机横屏)
md:  640-768px (平板竖屏)
lg:  768-1024px (平板横屏)
xl:  1024-1280px (小桌面)
2xl: > 1280px  (大桌面)
```

### 手势阈值
- **滑动距离**: 50px
- **长按时间**: 500ms
- **双击延迟**: 300ms
- **捏合阈值**: 10px

### 动画时长
- **快速**: 150ms (点击反馈)
- **标准**: 300ms (过渡动画)
- **慢速**: 500ms (复杂动画)

---

## ⚡ 性能优化

### 1. 使用 Passive Listeners
```tsx
element.addEventListener('touchstart', handler, { passive: true })
```

### 2. 禁用点击蓝框
```tsx
style={{ WebkitTapHighlightColor: 'transparent' }}
```

### 3. GPU 加速
```tsx
// ✅ 好
style={{ transform: 'translateY(10px)' }}

// ❌ 差
style={{ top: '10px' }}
```

### 4. 防止滚动冲突
```tsx
style={{ touchAction: 'pan-y' }} // 只允许垂直滚动
```

---

## 🧪 测试指南

### 推荐测试设备
- iPhone SE (375x667)
- iPhone 14 (390x844)
- iPhone 14 Pro Max (430x932)
- iPad Mini (768x1024)
- iPad Pro (1024x1366)

### 测试清单
- [ ] 所有按钮至少 48x48px
- [ ] 滑动手势流畅
- [ ] 双击/长按响应正常
- [ ] 底部导航不遮挡内容
- [ ] Safe Area 适配正常 (iOS)
- [ ] 滚动性能 60fps
- [ ] 无点击蓝框闪烁

### 快速测试
打开 `scripts/test-mobile.html` 在手机浏览器中测试基本功能。

---

## 📚 相关文档

- [完整技术文档](../TASK-75-MOBILE-OPTIMIZATION.md)
- [完成报告](../../TASK-75-COMPLETION-REPORT.md)
- [代码示例](../../src/components/MobileOptimizationShowcase.tsx)

---

## 🤝 贡献指南

### 添加新手势
1. 在 `useTouchGestures.ts` 中实现手势逻辑
2. 添加 TypeScript 类型定义
3. 更新文档和示例
4. 添加测试用例

### 添加新组件
1. 在 `src/components/mobile/` 创建新组件
2. 确保触摸目标至少 48x48px
3. 添加 TypeScript 类型
4. 更新 `index.ts` 导出
5. 添加使用示例

---

## 🐛 常见问题

### Q: 滑动手势与滚动冲突?
A: 使用 `touchAction: 'pan-y'` 只允许垂直滚动。

### Q: 长按被误触发?
A: 增加长按延迟时间: `longPressDelay: 800`

### Q: 底部导航被键盘遮挡?
A: 使用 `env(safe-area-inset-bottom)` 自动适配。

### Q: 点击有蓝色闪烁?
A: 添加 `WebkitTapHighlightColor: 'transparent'`

### Q: 动画不流畅?
A: 使用 `transform` 代替 `position`，启用 GPU 加速。

---

## 📞 支持

如有问题或建议:
1. 查看演示页面 (应用中的 "移动" 标签)
2. 阅读技术文档
3. 提交 Issue

---

**最后更新**: 2026-03-16
**版本**: v1.0.0
**状态**: ✅ 稳定
