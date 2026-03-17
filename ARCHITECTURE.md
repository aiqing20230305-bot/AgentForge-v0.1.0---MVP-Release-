# 🏗️ AgentForge 架构文档

**版本**: 1.3.0
**更新日期**: 2026-03-17

---

## 📋 目录

- [系统架构](#系统架构)
- [技术栈](#技术栈)
- [目录结构](#目录结构)
- [核心模块](#核心模块)
- [状态管理](#状态管理)
- [数据流](#数据流)
- [性能优化](#性能优化)

---

## 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────┐
│                   用户界面层 (UI Layer)                 │
│  React Components + Tailwind CSS + Framer Motion   │
└─────────────────────────────────────────────────────┘
                        ↓↑
┌─────────────────────────────────────────────────────┐
│                  状态管理层 (State Layer)              │
│         Zustand Stores (15+ specialized)           │
└─────────────────────────────────────────────────────┘
                        ↓↑
┌─────────────────────────────────────────────────────┐
│                  服务层 (Service Layer)               │
│   Managers + APIs + WebSocket + Evolution Engine   │
└─────────────────────────────────────────────────────┘
                        ↓↑
┌─────────────────────────────────────────────────────┐
│                  数据层 (Data Layer)                  │
│       localStorage + IndexedDB + Cloud Sync        │
└─────────────────────────────────────────────────────┘
```

### 设计原则

1. **本地优先** - 核心功能离线可用
2. **按需连接** - 外部服务需用户授权
3. **模块化** - 高内聚低耦合
4. **类型安全** - 100% TypeScript 覆盖

---

## 技术栈

### 前端框架

```json
{
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "typescript": "5.7.0",
  "vite": "6.2.0"
}
```

### UI 库

```json
{
  "tailwindcss": "3.4.0",
  "framer-motion": "12.36.0",
  "lucide-react": "0.563.0",
  "recharts": "3.8.0"
}
```

### 状态管理

```json
{
  "zustand": "4.4.7",
  "react-i18next": "15.1.4",
  "i18next": "24.3.0"
}
```

### 工具库

```json
{
  "hotkeys-js": "3.13.7",
  "react-dnd": "16.0.1",
  "qrcode": "1.5.4",
  "html2canvas": "1.4.1"
}
```

---

## 目录结构

```
src/
├── components/          # UI 组件 (90+)
│   ├── AgentDisplayPanel.tsx
│   ├── TaskManagementPanel.tsx
│   ├── NotificationCenter.tsx
│   ├── HotkeySettings.tsx
│   └── ...
│
├── store/              # Zustand Store (15+)
│   ├── useDataSourceStore.ts
│   ├── useNotificationStore.ts
│   ├── useThemeStore.ts
│   └── ...
│
├── services/           # 业务逻辑服务 (12+)
│   ├── notificationManager.ts
│   ├── hotkeyManager.ts
│   ├── onboardingManager.ts
│   ├── evolution/
│   │   ├── heartbeatService.ts
│   │   └── evolutionEngine.ts
│   └── sync/
│       └── syncService.ts
│
├── hooks/              # 自定义 Hooks (23+)
│   ├── useTranslation.ts
│   ├── useHotkeys.ts
│   ├── useTimeZone.ts
│   └── ...
│
├── utils/              # 工具函数 (18+)
│   ├── localization.ts
│   ├── featureGate.ts
│   └── ...
│
├── config/             # 配置文件
│   ├── hotkeyPresets.ts
│   ├── onboardingSteps.ts
│   └── ...
│
├── i18n/               # 国际化
│   ├── config.ts
│   └── locales/
│       ├── zh-CN/
│       ├── en-US/
│       ├── ja-JP/
│       └── ko-KR/
│
├── types/              # TypeScript 类型定义 (8+)
│   ├── agent.ts
│   ├── task.ts
│   └── ...
│
└── App.tsx             # 应用入口
```

---

## 核心模块

### 1. Agent 管理模块

**职责**: Agent 生命周期管理、状态监控、进化系统

```typescript
// src/store/useDataSourceStore.ts
interface DataSourceStore {
  agents: Agent[]
  selectedAgent: Agent | null
  setSelectedAgent: (id: string) => void
  // ... 更多方法
}
```

**核心组件**:
- `AgentDisplayPanel.tsx` - Agent 展示面板
- `VitalityDashboard.tsx` - 生命力仪表盘
- `EvolutionTimeline.tsx` - 进化时间线

**关键服务**:
- `heartbeatService.ts` - 心跳监控 (30s 间隔)
- `evolutionEngine.ts` - 进化引擎 (20 规则)

---

### 2. 任务管理模块

**职责**: 任务创建、分配、执行、追踪

```typescript
// src/stores/taskStore.ts
interface TaskStore {
  tasks: Task[]
  createTask: (task: Omit<Task, 'id'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
}
```

**核心组件**:
- `TaskManagementPanel.tsx` - 任务管理面板
- `TaskDetailDrawer.tsx` - 任务详情抽屉

---

### 3. 通知系统模块

**职责**: 消息通知、历史记录、优先级管理

```typescript
// src/services/notificationManager.ts
class NotificationManager {
  add(notification: Notification): void
  remove(id: string): void
  markAsRead(id: string): void
  clearAll(): void
}
```

**核心组件**:
- `NotificationCenter.tsx` - 通知中心侧边栏
- `Toast.tsx` - Toast 弹窗通知
- `NotificationBell.tsx` - 通知铃铛按钮

---

### 4. 快捷键系统模块

**职责**: 全局快捷键注册、自定义绑定、冲突检测

```typescript
// src/services/hotkeyManager.ts
class HotkeyManager {
  register(id: string, definition: HotkeyDefinition): void
  customize(id: string, newKey: string): boolean
  hasConflict(key: string): boolean
}
```

**核心组件**:
- `HotkeySettings.tsx` - 快捷键配置界面
- `HotkeyTooltip.tsx` - 快捷键提示组件

---

### 5. 国际化模块

**职责**: 多语言支持、自动检测、本地化格式

```typescript
// src/i18n/config.ts
i18n.init({
  resources,
  fallbackLng: 'zh-CN',
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag']
  }
})
```

**核心组件**:
- `LanguageSwitcher.tsx` - 语言切换器
- `useTranslation.ts` - 翻译 Hook

---

### 6. 新手引导模块

**职责**: 用户引导、进度追踪、聚光灯效果

```typescript
// src/services/onboardingManager.ts
class OnboardingManager {
  setSteps(steps: OnboardingStep[]): void
  next(): void
  skip(): void
  complete(): void
}
```

**核心组件**:
- `OnboardingTour.tsx` - 引导遮罩组件
- `TourStepCard.tsx` - 引导步骤卡片

---

## 状态管理

### Zustand Store 架构

AgentForge 使用 15+ 个专用 Store，每个 Store 负责独立的业务领域：

```typescript
// Store 列表
const stores = {
  useDataSourceStore,      // Agent 和数据源
  useTaskStore,            // 任务管理
  useNotificationStore,    // 通知系统
  useThemeStore,           // 主题管理
  useBattleStore,          // 战斗系统
  useEnergyStore,          // 能量管理
  // ... 更多 Store
}
```

### Store 设计模式

```typescript
// 典型的 Store 结构
export const useXxxStore = create<XxxStore>()(
  persist(
    (set, get) => ({
      // 状态
      data: [],

      // 同步方法
      setData: (data) => set({ data }),

      // 异步方法
      loadData: async () => {
        const data = await fetchData()
        set({ data })
      },

      // 计算属性
      getTotal: () => get().data.length
    }),
    {
      name: 'xxx-storage', // localStorage key
      partialize: (state) => ({ data: state.data }) // 持久化字段
    }
  )
)
```

---

## 数据流

### 1. 单向数据流

```
用户操作 → 组件事件 → Store Action → State 更新 → 组件重渲染
```

### 2. 服务层数据流

```
Service → Manager → Store → Component
   ↓
External API (可选，需授权)
```

### 3. 数据持久化

```
Store State
   ↓
Zustand Persist Middleware
   ↓
localStorage / IndexedDB
   ↓
(可选) Cloud Sync
```

---

## 性能优化

### 1. React 优化

```typescript
// React.memo 避免不必要渲染
const AgentCard = React.memo(({ agent }) => {
  return <div>{agent.name}</div>
})

// useMemo 缓存计算结果
const total = useMemo(() => {
  return agents.reduce((sum, a) => sum + a.level, 0)
}, [agents])

// useCallback 稳定回调引用
const handleClick = useCallback(() => {
  selectAgent(id)
}, [id])
```

### 2. 虚拟滚动

```typescript
// 对于大列表使用虚拟滚动
<VirtualList
  items={agents}
  itemHeight={80}
  renderItem={(agent) => <AgentCard agent={agent} />}
/>
```

### 3. 代码分割

```typescript
// 路由级别的懒加载
const SettingsModal = lazy(() => import('./components/SettingsModal'))

// 组件级别的动态导入
const loadHeavyComponent = () => import('./components/HeavyComponent')
```

### 4. 防抖节流

```typescript
// 搜索防抖
const debouncedSearch = useMemo(
  () => debounce((query) => search(query), 300),
  []
)

// 滚动节流
const throttledScroll = useMemo(
  () => throttle(() => handleScroll(), 100),
  []
)
```

---

## 安全设计

### 1. 权限隔离

```typescript
// 所有外部连接需要权限检查
async function connectDataSource(config: DataSourceConfig) {
  // 1. 检查用户授权
  if (!hasPermission('connect:external')) {
    throw new Error('未授权')
  }

  // 2. 验证配置
  validateConfig(config)

  // 3. 建立连接
  await establishConnection(config)
}
```

### 2. 数据加密

```typescript
// 敏感数据加密存储
function saveApiKey(key: string) {
  const encrypted = encrypt(key, getEncryptionKey())
  localStorage.setItem('api_key', encrypted)
}
```

### 3. CSP 策略

```html
<!-- Content Security Policy -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               connect-src 'self' https://api.example.com;">
```

---

## 测试策略

### 1. 单元测试 (Vitest)

```typescript
// src/utils/__tests__/localization.test.ts
describe('formatDateTime', () => {
  it('formats date correctly', () => {
    const result = formatDateTime(date, 'zh-CN')
    expect(result).toBe('2026年3月17日')
  })
})
```

### 2. E2E 测试 (Playwright)

```typescript
// tests/agent-management.spec.ts
test('should create new agent', async ({ page }) => {
  await page.goto('/')
  await page.click('[data-testid="create-agent"]')
  await page.fill('input[name="name"]', 'Test Agent')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Test Agent')).toBeVisible()
})
```

### 3. 集成测试

```typescript
// tests/integration/task-flow.spec.ts
test('complete task flow', async () => {
  // 1. 创建任务
  const task = await createTask(...)

  // 2. 分配给 Agent
  await assignTask(task.id, agent.id)

  // 3. 执行任务
  await executeTask(task.id)

  // 4. 验证结果
  expect(task.status).toBe('completed')
})
```

---

## 部署架构

### 开发环境

```
Vite Dev Server (Port 5173)
   ↓
Hot Module Replacement (HMR)
   ↓
React Components
```

### 生产环境

```
Vite Build
   ↓
Static Files (dist/)
   ↓
CDN / Nginx
   ↓
User Browser
```

### 可选: Electron 桌面应用

```
Electron Main Process
   ↓
WebView (Chromium)
   ↓
React App
```

---

## 扩展性

### 插件系统（规划中）

```typescript
// Plugin API
interface Plugin {
  name: string
  version: string
  init: (app: App) => void
  destroy: () => void
}

// 注册插件
app.use(myPlugin)
```

### 主题扩展

```typescript
// Custom Theme
const myTheme: Theme = {
  id: 'my-theme',
  name: 'My Theme',
  colors: {
    primary: '#007bff',
    // ... 更多颜色
  }
}

themeManager.register(myTheme)
```

---

## 性能指标

| 指标 | 目标值 | 当前值 |
|-----|-------|-------|
| FCP (First Contentful Paint) | < 1.5s | 1.2s |
| LCP (Largest Contentful Paint) | < 2.5s | 2.1s |
| TTI (Time to Interactive) | < 3.5s | 3.0s |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.05 |
| 首屏加载时间 | < 3s | 2.5s |
| 60fps 渲染 | 1000+ items | ✅ |

---

## 浏览器支持

| 浏览器 | 最低版本 |
|-------|---------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

---

## 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解详细的版本更新记录。

---

**维护者**: AgentForge Team
**最后更新**: 2026-03-17
**文档版本**: 1.0.0
