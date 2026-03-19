# 🏆 成就墙集成指南

> 如何将 `AchievementWall` 组件集成到 AgentForge 主应用

---

## 📦 快速集成

### 1. 导入组件

在需要展示成就墙的页面中导入：

```typescript
import { AchievementWall } from './components/AchievementWall'
```

### 2. 使用组件

```tsx
// 在你的页面组件中
function AgentDetailPage() {
  const { selectedAgent } = useDataSourceStore()

  return (
    <div className="page-container">
      {/* 其他内容 */}

      {/* 成就墙 */}
      <AchievementWall agent={selectedAgent} />
    </div>
  )
}
```

### 3. 完整示例（带Tab切换）

```tsx
import { useState } from 'react'
import { AchievementWall } from './components/AchievementWall'
import { AchievementPanel } from './components/AchievementPanel'

function AchievementPage() {
  const { selectedAgent } = useDataSourceStore()
  const [view, setView] = useState<'list' | 'wall'>('wall')

  return (
    <div className="h-screen flex flex-col">
      {/* 视图切换按钮 */}
      <div className="p-4 border-b border-white/10 bg-gray-900">
        <div className="flex gap-2">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg transition-all ${
              view === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            📋 列表视图
          </button>
          <button
            onClick={() => setView('wall')}
            className={`px-4 py-2 rounded-lg transition-all ${
              view === 'wall'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            🏆 成就墙
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {view === 'list' ? (
          <AchievementPanel agent={selectedAgent} />
        ) : (
          <AchievementWall agent={selectedAgent} />
        )}
      </div>
    </div>
  )
}
```

---

## 🔧 集成到现有导航

### 方式1: 添加到 MainNavigationTabs

在 `MainNavigationTabs.tsx` 中添加新Tab：

```typescript
const tabs = [
  // ... 现有tabs
  {
    id: 'achievement-wall',
    label: '成就墙',
    icon: Trophy,
    component: <AchievementWall agent={selectedAgent} />
  }
]
```

### 方式2: 作为成就面板的子视图

修改现有的成就Tab，添加视图切换：

```typescript
// 在成就Tab中
{
  id: 'achievements',
  label: '成就',
  icon: Trophy,
  component: <AchievementTabWithViews agent={selectedAgent} />
}

// AchievementTabWithViews 组件实现视图切换
```

### 方式3: 作为独立模态框

```tsx
import { useState } from 'react'
import { Trophy } from 'lucide-react'
import { AchievementWall } from './components/AchievementWall'

function TopNavigation() {
  const [showWall, setShowWall] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowWall(true)}
        className="nav-button"
      >
        <Trophy className="w-5 h-5" />
        成就墙
      </button>

      {showWall && (
        <div className="fixed inset-0 z-50">
          <AchievementWall agent={selectedAgent} />
          <button
            onClick={() => setShowWall(false)}
            className="absolute top-4 right-4 ..."
          >
            关闭
          </button>
        </div>
      )}
    </>
  )
}
```

---

## 📋 数据准备

### 确保Agent数据结构完整

`AchievementWall` 需要以下数据：

```typescript
interface AgentData {
  id: string
  displayName: string
  level: number
  achievements?: {
    unlocked: string[]        // 已解锁的成就ID数组
    progress: Record<string, number>  // 成就进度
  }
}
```

### 示例数据

```typescript
const agent: AgentData = {
  id: 'agent-1',
  displayName: 'GPT-4 助手',
  level: 25,
  achievements: {
    unlocked: [
      'first_task',
      'task_beginner',
      'first_battle',
      'level_10'
    ],
    progress: {
      'task_master': 45,      // 已完成45/100
      'perfect_streak': 15,   // 已连续15/20
      'pvp_warrior': 3        // 已赢得3/10
    }
  }
}
```

---

## 🎨 样式自定义

### 修改配色

在 `AchievementWall.tsx` 中找到 `getRarityConfig` 函数：

```typescript
const getRarityConfig = (rarity: AchievementRarity) => {
  const configs = {
    common: {
      gradient: 'from-gray-600 via-gray-500 to-gray-600',  // 修改这里
      // ...
    },
    // ...
  }
}
```

### 修改布局

网格列数可以在组件中调整：

```tsx
{/* 当前是4列 */}
<div className="grid grid-cols-4 gap-4">

{/* 改为3列 */}
<div className="grid grid-cols-3 gap-4">

{/* 响应式布局 */}
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
```

### 隐藏排行榜

如果不需要侧边栏排行榜：

```tsx
{/* 找到这段代码并注释或删除 */}
<motion.div className="absolute right-0 ...">
  {/* 排行榜内容 */}
</motion.div>
```

---

## 🔌 可选功能

### 禁用分享功能

在 `AchievementWall.tsx` 中注释分享按钮：

```tsx
{/* 注释这段代码 */}
{/* {unlocked && (
  <motion.button onClick={(e) => handleShare(achievement, e)} ...>
    <Share2 ... />
  </motion.button>
)} */}
```

### 禁用音效

如果不需要音效：

```tsx
// 注释所有 audioSystem.play() 调用
// audioSystem.play('click')
// audioSystem.play('achievement')
```

### 简化动画

如果需要更流畅的性能：

```tsx
// 减少入场动画延迟
transition={{ delay: index * 0.01 }}  // 从0.02改为0.01

// 或完全移除动画
initial={{ opacity: 1, scale: 1, y: 0 }}  // 直接显示
```

---

## 📱 响应式适配

### 移动端优化建议

```tsx
{/* 根据屏幕大小调整布局 */}
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">

{/* 移动端隐藏排行榜 */}
<div className="hidden lg:block absolute right-0 ...">
  {/* 排行榜 */}
</div>

{/* 移动端更小的卡片 */}
<motion.div className="p-3 lg:p-5 ...">
```

---

## 🧪 测试检查清单

集成后请检查：

- [ ] 成就数据正确显示
- [ ] 已解锁和未解锁状态正确
- [ ] 隐藏成就遮罩正常
- [ ] 点击徽章打开详情
- [ ] 分享功能正常工作
- [ ] 排行榜数据正确
- [ ] 筛选和排序功能正常
- [ ] 动画流畅无卡顿
- [ ] 音效播放正常
- [ ] 响应式布局正常

---

## 🐛 常见问题

### Q: 排行榜没有数据

A: 确保 `useLeaderboardStore` 中有数据：

```typescript
// 手动添加测试数据
const { updateAgentScore } = useLeaderboardStore()
updateAgentScore(
  agent.id,
  agent.displayName,
  'achievement_points',
  1500,
  agent.sourceId,
  agent.sourceName
)
```

### Q: 成就图标不显示

A: 检查 `achievements.ts` 中的图标是否是有效的emoji：

```typescript
icon: '🏆',  // 确保使用真实的emoji
```

### Q: 3D效果不工作

A: 某些老旧浏览器不支持3D变换，可以添加降级样式：

```css
@supports not (transform-style: preserve-3d) {
  .achievement-card {
    /* 2D降级样式 */
  }
}
```

### Q: 分享功能报错

A: 确保已安装 `html2canvas` 依赖：

```bash
npm install html2canvas
```

---

## 📚 相关文档

- [成就系统数据结构](./src/data/achievements.ts)
- [分享卡片组件](./src/components/AchievementShareCard.tsx)
- [排行榜Store](./src/store/useLeaderboardStore.ts)
- [完成报告](./TASK80_ACHIEVEMENT_BADGE_SYSTEM_COMPLETE.md)

---

## 🎯 最佳实践

1. **性能优化**
   - 使用 React.memo 包裹组件
   - 大列表考虑虚拟滚动
   - 动画使用 transform 而非 position

2. **用户体验**
   - 首次使用时显示引导
   - 接近解锁时显示提示
   - 提供快捷键支持

3. **数据同步**
   - 定期同步成就进度
   - 解锁后立即更新排行榜
   - 缓存排行榜数据减少请求

4. **可访问性**
   - 添加键盘导航
   - 支持屏幕阅读器
   - 提供高对比度模式

---

**Happy Integrating! 🎉**

如有问题，请查看完整文档或提交Issue。
