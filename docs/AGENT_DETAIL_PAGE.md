# Agent Detail Page - 完整信息面板

## 概述

Agent Detail Page 是一个完整的 Agent 详情信息面板，提供了 Agent 的全方位展示和管理功能。

## 文件位置

- 组件: `/src/components/AgentDetailPage.tsx`
- 辅助工具: `/src/utils/agentDetailHelper.ts`

## 功能特性

### 1. 基本信息展示
- Agent 头像（支持编辑）
- Agent 名称（支持编辑）
- 等级和经验值进度条
- 角色、状态、数据源信息
- 技能列表及等级

### 2. 统计数据
- **完成率**: 任务完成百分比
- **平均用时**: 任务平均完成时间
- **失败次数**: 总失败任务数

### 3. 任务历史
- 显示最近 20 个任务
- 支持任务状态筛选（待处理、进行中、已完成、失败）
- 显示任务优先级
- 任务标签展示
- 任务结果查看

### 4. 成就展示
- 成就完成度统计
- 最近解锁成就展示
- 进度条可视化

### 5. PVP战绩
- PVP 功能占位符（功能开发中）

### 6. 编辑功能
- **修改名称**: 点击名称旁边的编辑按钮
- **修改头像**: 点击头像可选择新头像
  - 支持预设图片
  - 支持 Emoji 表情
  - 支持自定义上传

## 使用方法

### 在代码中使用

#### 方法1: 通过 MainNavigationTabs 集成

组件已经集成到 `MainNavigationTabs` 中，可以通过以下方式打开：

```typescript
// 在 MainNavigationTabs 中
handleShowAgentDetail(agentId)
```

#### 方法2: 直接使用组件

```typescript
import AgentDetailPage from './components/AgentDetailPage'

<AgentDetailPage
  agentId="agent-id-here"
  onClose={() => {/* 关闭处理 */}}
/>
```

### 在浏览器控制台中使用

打开浏览器开发者工具控制台，可以使用以下命令：

```javascript
// 查看所有 Agent 列表
window.listAgents()

// 打开指定 Agent 的详情页
window.showAgentDetail('atlas')  // 使用 Agent ID
```

## 集成到现有系统

### 路由集成

组件已集成到 `MainNavigationTabs`，通过以下方式访问：

1. 添加 `agent-detail` 到 TabType
2. 使用 `handleShowAgentDetail(agentId)` 打开详情页
3. 使用 `handleCloseAgentDetail()` 关闭详情页

### 事件系统集成

可以通过自定义事件触发详情页显示：

```javascript
const event = new CustomEvent('show-agent-detail', {
  detail: { agentId: 'your-agent-id' }
})
window.dispatchEvent(event)
```

在 MainNavigationTabs 中监听此事件：

```typescript
useEffect(() => {
  const handleShowDetail = (e: Event) => {
    const event = e as CustomEvent
    const { agentId } = event.detail
    handleShowAgentDetail(agentId)
  }

  window.addEventListener('show-agent-detail', handleShowDetail)
  return () => window.removeEventListener('show-agent-detail', handleShowDetail)
}, [])
```

## 响应式设计

组件采用响应式设计，支持：
- 移动端适配
- 平板适配
- 桌面端适配

使用 Tailwind CSS 的响应式类实现：
- `grid-cols-1` / `md:grid-cols-3` - 统计卡片网格
- `grid-cols-2` / `md:grid-cols-4` - 成就展示网格
- 灵活的 flex 布局

## 数据来源

### Agent 数据
- 来源: `useDataSourceStore` 的 `agentsCache`
- 类型: `AgentData`

### 任务数据
- 来源: `useTaskStore` 的 `tasks`
- 类型: `Task[]`

### 成就数据
- 来源: `ACHIEVEMENTS` 常量 + Agent.achievements
- 类型: `Achievement[]`

### 头像数据
- 来源: `usePortraitStore` 的 `portraits`
- 类型: `Portrait[]`

## 动画效果

使用 Framer Motion 实现流畅动画：
- 页面加载动画（stagger effect）
- 任务列表滚动动画
- 头像选择器弹窗动画
- 进度条填充动画

## 扩展性

组件设计具有良好的扩展性，可以轻松添加：
- 新的统计指标
- 自定义数据可视化
- 更多编辑功能
- 社交功能集成
- 导出/分享功能

## 性能优化

- 使用 `useMemo` 缓存计算结果
- 按需加载数据
- 虚拟滚动（可选，针对大量任务历史）
- 懒加载图片

## 注意事项

1. **Agent ID 必须存在**: 如果 Agent ID 不存在，会显示错误提示
2. **数据源依赖**: 确保 `useDataSourceStore` 已正确初始化
3. **任务数据关联**: 任务的 `agentId` 必须与 Agent 的 `id` 匹配（小写）
4. **头像编辑权限**: 确保用户有权限修改 Agent 信息

## 未来计划

- [ ] PVP 战绩系统集成
- [ ] 技能树可视化
- [ ] 任务时间线图表
- [ ] Agent 对比功能
- [ ] 导出 Agent 报告
- [ ] 社交分享功能
- [ ] 自定义主题
- [ ] 更多统计图表

## 相关文件

- `/src/components/AgentDetailPage.tsx` - 主组件
- `/src/components/MainNavigationTabs.tsx` - 导航集成
- `/src/utils/agentDetailHelper.ts` - 辅助工具
- `/src/store/useDataSourceStore.ts` - Agent 数据
- `/src/stores/taskStore.ts` - 任务数据
- `/src/store/usePortraitStore.ts` - 头像数据
- `/src/data/achievements.ts` - 成就定义

## 更新日志

### v1.0.0 (2026-03-16)
- ✅ 创建 AgentDetailPage 组件
- ✅ 集成到 MainNavigationTabs
- ✅ 基本信息展示
- ✅ 统计数据展示
- ✅ 任务历史展示
- ✅ 成就展示
- ✅ 编辑功能（名称、头像）
- ✅ 响应式设计
- ✅ 辅助工具函数
