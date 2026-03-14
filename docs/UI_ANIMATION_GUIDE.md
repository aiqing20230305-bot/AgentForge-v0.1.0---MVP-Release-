# AgentForge UI Animation System Guide

## 概述

AgentForge 采用统一的动画系统，基于 Framer Motion，提供一致、流畅的用户体验。

## 核心文件

### 1. `src/utils/animations.ts`

统一动画配置文件，包含：

- **持续时间常量** (`DURATION`)
- **缓动函数** (`EASING`)
- **过渡配置** (`transitions`)
- **20+ 动画变体** (Variants)

## 动画变体 (Variants)

### 基础动画

| 变体名称 | 描述 | 使用场景 |
|---------|------|---------|
| `fadeVariants` | 淡入淡出 | 通用元素显示/隐藏 |
| `slideRightVariants` | 从右滑入 | 侧边栏、抽屉 |
| `slideLeftVariants` | 从左滑入 | 侧边栏、抽屉 |
| `slideUpVariants` | 从下滑入 | 底部弹窗 |
| `slideDownVariants` | 从上滑入 | 顶部通知 |
| `scaleVariants` | 缩放 | 模态框、弹窗 |
| `bounceVariants` | 弹跳 | 成功提示 |

### 高级动画

| 变体名称 | 描述 | 使用场景 |
|---------|------|---------|
| `modalVariants` | 模态框专用 | Modal, Dialog |
| `toastVariants` | Toast 通知 | 右上角通知 |
| `pulseVariants` | 脉冲 | 高亮提示 |
| `shakeVariants` | 摇晃 | 错误提示 |
| `spinVariants` | 旋转 | 加载图标 |

### 交互动画

| 变体名称 | 描述 | 使用场景 |
|---------|------|---------|
| `cardHoverVariants` | 卡片悬停 | 卡片组件 |
| `buttonTapVariants` | 按钮点击 | 按钮组件 |

### 列表动画

| 变体名称 | 描述 | 使用场景 |
|---------|------|---------|
| `listItemVariants` | 列表项动画 | 列表渲染 |
| `staggerContainerVariants` | 交错容器 | 列表容器 |

## UI 组件库

### Loading & Skeleton

位置：`src/components/ui/`

#### Skeleton 组件

```tsx
import { Skeleton, SkeletonCard, SkeletonText } from '@/components/ui'

// 基础骨架屏
<Skeleton width={200} height={20} />

// 文本骨架屏（3行）
<SkeletonText lines={3} />

// 卡片骨架屏
<SkeletonCard />
```

#### Loading 组件

```tsx
import { LoadingSpinner, LoadingDots, LoadingProgress } from '@/components/ui'

// 旋转加载
<LoadingSpinner size={32} text="加载中..." />

// 点点点
<LoadingDots size={8} color="bg-cyan-500" />

// 进度条
<LoadingProgress progress={75} showPercentage />
```

### PageTransition

```tsx
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui'

// 页面切换
<PageTransition pageKey={route}>
  <YourPage />
</PageTransition>

// 简单淡入
<FadeIn delay={0.2}>
  <YourComponent />
</FadeIn>

// 交错列表
<StaggerContainer>
  {items.map(item => (
    <StaggerItem key={item.id}>
      <ItemCard />
    </StaggerItem>
  ))}
</StaggerContainer>
```

### AnimatedCard

```tsx
import { AnimatedCard, AnimatedButton, AnimatedBadge } from '@/components/ui'

// 交互式卡片
<AnimatedCard
  onClick={handleClick}
  hoverEffect
  selected={isSelected}
>
  <CardContent />
</AnimatedCard>

// 动画按钮
<AnimatedButton
  variant="primary"
  size="md"
  onClick={handleSubmit}
  loading={isLoading}
>
  提交
</AnimatedButton>

// 状态徽章
<AnimatedBadge variant="success" pulse>
  在线
</AnimatedBadge>
```

## 使用最佳实践

### 1. 优先使用统一变体

❌ **不推荐：**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
```

✅ **推荐：**
```tsx
import { fadeVariants } from '@/utils/animations'

<motion.div
  variants={fadeVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
>
```

### 2. 使用标准化过渡

❌ **不推荐：**
```tsx
transition={{ duration: 0.3, ease: 'easeInOut' }}
```

✅ **推荐：**
```tsx
import { transitions } from '@/utils/animations'

transition={transitions.normal}
```

### 3. 复用 UI 组件

❌ **不推荐：**
```tsx
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="rounded-xl p-4 bg-gray-800 cursor-pointer"
>
```

✅ **推荐：**
```tsx
import { AnimatedCard } from '@/components/ui'

<AnimatedCard className="p-4 bg-gray-800">
```

## 性能优化技巧

### 1. 避免动画阻塞

```tsx
// 使用 AnimatePresence 的 mode="wait" 避免布局抖动
<AnimatePresence mode="wait">
  {isVisible && <Component />}
</AnimatePresence>
```

### 2. 大量列表使用 layoutId

```tsx
{items.map(item => (
  <motion.div key={item.id} layoutId={item.id}>
    {/* ... */}
  </motion.div>
))}
```

### 3. 禁用不必要的动画

```tsx
// 低端设备可以禁用动画
const shouldAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches

<motion.div
  animate={shouldAnimate ? "visible" : false}
>
```

## 动画时长指南

| 场景 | 推荐时长 | Transition |
|-----|---------|-----------|
| 微交互（hover, tap） | 0.1-0.2s | `transitions.instant` / `transitions.fast` |
| 元素显示/隐藏 | 0.2-0.3s | `transitions.fast` / `transitions.normal` |
| 页面切换 | 0.3-0.5s | `transitions.normal` / `transitions.slow` |
| 特效动画 | 0.5-1s | `transitions.slow` / 自定义 |

## 常见问题

### Q: 如何添加自定义动画变体？

**A:** 在 `animations.ts` 中添加：

```typescript
export const myCustomVariants: Variants = {
  hidden: { /* initial */ },
  visible: { /* animate */ },
  exit: { /* exit */ }
}
```

### Q: 如何处理条件动画？

**A:** 使用三元表达式或动态 variants：

```tsx
<motion.div
  variants={isSpecial ? specialVariants : normalVariants}
  initial="hidden"
  animate="visible"
>
```

### Q: 如何禁用特定组件的动画？

**A:** 传递 `animate={false}`：

```tsx
<motion.div animate={false}>
  {/* 不会有动画 */}
</motion.div>
```

## 贡献指南

添加新动画组件时：

1. 使用 `animations.ts` 中的标准配置
2. 提供 TypeScript 类型定义
3. 添加使用示例和文档
4. 确保通过 `npm run typecheck`

## 相关资源

- [Framer Motion 官方文档](https://www.framer.com/motion/)
- [AgentForge 设计规范](./DESIGN.md)
- [性能优化指南](./PERFORMANCE.md)

---

**最后更新：** 2026-03-14
**版本：** v0.3.2
