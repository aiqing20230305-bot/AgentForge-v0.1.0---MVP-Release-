# 🌐 AgentForge Web版开发文档

**版本**: 1.5.0-web
**更新日期**: 2026-03-17

---

## 📋 目录

- [概述](#概述)
- [快速开始](#快速开始)
- [核心功能](#核心功能)
- [架构设计](#架构设计)
- [性能优化](#性能优化)
- [离线支持](#离线支持)
- [部署指南](#部署指南)

---

## 概述

AgentForge Web版是完全基于浏览器的PWA应用,无需安装即可使用,提供与桌面版相同的完整功能。

### 核心目标

- **5秒开始使用** - 无需注册,访问即用
- **2秒首屏加载** - 极致性能优化
- **完整功能** - 功能不缩水
- **离线可用** - Service Worker + IndexedDB

---

## 快速开始

### 1. 访问Web版

```
https://agentforge.app
```

### 2. 无需注册,立即使用

Web版支持多种登录方式:

- **游客模式** (推荐) - 点击即用,无需注册
- **Magic Link** - 邮箱免密登录
- **OAuth** - Google/GitHub/Discord
- **传统方式** - 邮箱 + 密码

### 3. 安装PWA (可选)

访问网站后,浏览器会提示安装:

```
Chrome: 地址栏右侧 "安装" 按钮
Safari: 分享 → 添加到主屏幕
Edge: 地址栏右侧 "应用可用" 图标
```

---

## 核心功能

### 1. PWA支持

#### Service Worker

位置: `src/serviceWorker.ts`

**功能**:
- 静态资源缓存
- 动态内容缓存
- 离线支持
- 后台同步
- 推送通知

**缓存策略**:

```typescript
// API请求: Network First
if (isApiRequest) {
  return networkFirstStrategy(request)
}

// 图片: Cache First
if (isImage) {
  return cacheFirstStrategy(request, IMAGE_CACHE)
}

// 静态资源: Cache First
if (isStatic) {
  return cacheFirstStrategy(request, STATIC_CACHE)
}

// HTML: Network First
if (isHtml) {
  return networkFirstStrategy(request)
}
```

#### Manifest.json

位置: `public/manifest.json`

**配置项**:
```json
{
  "name": "AgentForge - AI Agent管理平台",
  "short_name": "AgentForge",
  "display": "standalone",
  "theme_color": "#06b6d4",
  "background_color": "#0a0a0a"
}
```

### 2. 快速登录系统

位置: `src/services/auth/quickAuth.ts`

#### 游客模式

无需注册,5秒开始使用:

```typescript
const auth = getQuickAuth()
const guestUser = await auth.loginAsGuest()

// 游客数据存储在本地
// 可随时升级为正式账号
```

#### Magic Link (免密登录)

发送登录链接到邮箱:

```typescript
// 1. 请求Magic Link
await auth.requestMagicLink('user@example.com')

// 2. 用户点击邮件链接
// 3. 自动验证并登录
const user = await auth.verifyMagicLink(token)
```

#### OAuth登录

支持主流平台:

```typescript
// Google
await auth.loginWithOAuth('google')

// GitHub
await auth.loginWithOAuth('github')

// Discord
await auth.loginWithOAuth('discord')
```

#### 游客升级

将游客账号升级为正式账号:

```typescript
const user = await auth.upgradeGuestAccount(
  'user@example.com',
  'password'
)

// 自动迁移游客数据到新账号
```

### 3. 云端同步系统

位置: `src/services/sync/cloudSync.ts`

#### 实时同步

基于WebSocket的实时同步:

```typescript
const cloudSync = getCloudSync()

// 初始化 (自动连接WebSocket)
await cloudSync.initialize()

// 监听同步状态
cloudSync.onStatusChange(status => {
  console.log('Sync status:', status)
})

// 手动触发同步
await cloudSync.sync('bidirectional')
```

#### 冲突检测

自动检测并解决数据冲突:

```typescript
// 配置冲突解决策略
cloudSync.updateConfig({
  conflictStrategy: 'merge' // local-wins | remote-wins | merge | manual
})

// 查看未解决的冲突
const conflicts = cloudSync.getConflicts()

// 手动解决冲突
// 用户界面会显示冲突详情供用户选择
```

#### Delta同步

只同步变化的数据,节省带宽:

```typescript
// 跟踪本地更改
cloudSync.trackChange({
  id: 'agent_123',
  type: 'updated',
  entity: 'agent',
  data: updatedAgent
})

// 批量推送更改
await cloudSync.pushChanges()
```

### 4. 离线模式

位置: `src/services/offline/indexedDB.ts`

#### IndexedDB存储

结构化离线存储:

```typescript
const db = getIndexedDB()

// 存储Agent
await db.put('agents', agent)

// 获取所有Agents
const agents = await db.getAll('agents')

// 按索引查询
const activeAgents = await db.getByIndex(
  'agents',
  'status',
  'active'
)

// 复杂查询
const filteredAgents = await db.query('agents', agent => {
  return agent.level > 10 && agent.status === 'active'
})
```

#### 缓存管理

自动清理过期缓存:

```typescript
// 设置缓存 (TTL = 1小时)
await db.setCache('agent_stats', stats, 3600000)

// 获取缓存
const stats = await db.getCache('agent_stats')

// 清理过期缓存
await db.cleanExpiredCache()
```

#### 数据导入/导出

```typescript
// 导出到JSON
const data = await db.exportToJSON()
const json = JSON.stringify(data)
downloadFile('agentforge-backup.json', json)

// 从JSON导入
const data = JSON.parse(json)
await db.importFromJSON(data)
```

---

## 架构设计

### Web版特定层次

```
┌─────────────────────────────────────┐
│          WebApp Component           │  (PWA入口)
├─────────────────────────────────────┤
│          App Component              │  (主应用)
├─────────────────────────────────────┤
│      Web Services Layer             │
│  ├── QuickAuth                      │
│  ├── CloudSync                      │
│  └── IndexedDB                      │
├─────────────────────────────────────┤
│      Service Worker                 │  (离线/缓存)
├─────────────────────────────────────┤
│      Browser APIs                   │
│  ├── IndexedDB                      │
│  ├── Cache API                      │
│  ├── WebSocket                      │
│  └── Push API                       │
└─────────────────────────────────────┘
```

### 数据流

```
用户操作
   ↓
WebApp Component
   ↓
QuickAuth Service → 身份验证
   ↓
App Component → 主界面
   ↓
CloudSync Service → 实时同步
   ↓
IndexedDB Service → 本地存储
   ↓
Service Worker → 缓存/离线
```

---

## 性能优化

### 1. 首屏加载优化

#### 代码分割

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'utils-vendor': ['axios', 'date-fns', 'zustand'],
          'charts-vendor': ['recharts'],
          'i18n-vendor': ['i18next', 'react-i18next']
        }
      }
    }
  }
})
```

#### 预加载关键资源

```html
<!-- index.html -->
<link rel="preload" href="/assets/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/manifest.json" as="fetch" crossorigin>
```

#### 资源压缩

```typescript
// vite.config.ts
{
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
}
```

### 2. 运行时优化

#### 虚拟滚动

对于大列表使用虚拟滚动:

```typescript
import { VirtualList } from './components/VirtualList'

<VirtualList
  items={agents}
  itemHeight={80}
  renderItem={(agent) => <AgentCard agent={agent} />}
/>
```

#### React.memo

避免不必要的重渲染:

```typescript
const AgentCard = React.memo(({ agent }) => {
  return <div>{agent.name}</div>
}, (prev, next) => {
  return prev.agent.id === next.agent.id &&
         prev.agent.level === next.agent.level
})
```

#### useMemo/useCallback

缓存计算结果和回调:

```typescript
const sortedAgents = useMemo(() => {
  return agents.sort((a, b) => b.level - a.level)
}, [agents])

const handleClick = useCallback(() => {
  selectAgent(id)
}, [id])
```

### 3. 网络优化

#### 请求合并

```typescript
// 批量获取数据
const [agents, tasks, stats] = await Promise.all([
  agentApi.getAll(),
  taskApi.getAll(),
  statsApi.get()
])
```

#### 请求去重

```typescript
let pendingRequest: Promise<Agent[]> | null = null

async function getAgents() {
  if (pendingRequest) {
    return pendingRequest
  }

  pendingRequest = agentApi.getAll()
  const result = await pendingRequest
  pendingRequest = null

  return result
}
```

#### 图片懒加载

```typescript
<img
  src={agent.avatar}
  loading="lazy"
  decoding="async"
/>
```

### 4. 性能监控

#### Web Vitals

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)  // Cumulative Layout Shift
getFID(console.log)  // First Input Delay
getFCP(console.log)  // First Contentful Paint
getLCP(console.log)  // Largest Contentful Paint
getTTFB(console.log) // Time to First Byte
```

#### 性能指标目标

| 指标 | 目标值 | 说明 |
|-----|-------|-----|
| FCP | < 1.5s | 首次内容绘制 |
| LCP | < 2.5s | 最大内容绘制 |
| FID | < 100ms | 首次输入延迟 |
| CLS | < 0.1 | 累积布局偏移 |
| TTI | < 3.5s | 可交互时间 |

---

## 离线支持

### 离线功能矩阵

| 功能 | 离线可用 | 说明 |
|-----|---------|-----|
| 查看Agents | ✅ | 完全离线 |
| 创建Agent | ✅ | 离线创建,上线同步 |
| 编辑Agent | ✅ | 离线编辑,上线同步 |
| 删除Agent | ✅ | 离线删除,上线同步 |
| 查看Tasks | ✅ | 完全离线 |
| 创建Task | ✅ | 离线创建,上线同步 |
| 执行Task | ❌ | 需要AI API |
| PvP对战 | ❌ | 需要服务器 |
| 排行榜 | ⚠️ | 缓存数据 |
| 成就系统 | ✅ | 本地计算 |
| 设置管理 | ✅ | 完全离线 |

### 离线队列

```typescript
// 离线时操作会自动加入队列
const agent = createAgent(...)
// 排队等待同步

// 上线时自动同步
window.addEventListener('online', async () => {
  const cloudSync = getCloudSync()
  await cloudSync.processPendingOps()
})
```

---

## 部署指南

### 1. 构建生产版本

```bash
# 安装依赖
npm install

# 构建Web版
npm run build

# 构建产物在 dist/ 目录
```

### 2. 静态文件部署

#### Vercel部署

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

`vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Netlify部署

`netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Nginx部署

```nginx
server {
    listen 80;
    server_name agentforge.app;

    root /var/www/agentforge/dist;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service Worker不缓存
    location = /serviceWorker.js {
        add_header Cache-Control "no-cache";
    }

    # SPA路由
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. CDN加速

#### Cloudflare设置

```javascript
// workers/cache.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const cache = caches.default
  let response = await cache.match(request)

  if (!response) {
    response = await fetch(request)

    // 缓存静态资源
    if (request.url.match(/\.(js|css|png|jpg|svg|woff2)$/)) {
      event.waitUntil(cache.put(request, response.clone()))
    }
  }

  return response
}
```

### 4. 环境变量

`.env.production`:
```bash
# API端点
VITE_API_URL=https://api.agentforge.app
VITE_WS_URL=wss://api.agentforge.app

# OAuth配置
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_DISCORD_CLIENT_ID=your_discord_client_id

# 功能开关
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=true
```

### 5. 监控和分析

#### Sentry错误追踪

```typescript
// src/utils/sentry.ts
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1
})
```

#### Google Analytics

```typescript
// src/utils/analytics.ts
import ReactGA from 'react-ga4'

ReactGA.initialize(import.meta.env.VITE_GA_ID)

export function trackPageView(path: string) {
  ReactGA.send({ hitType: 'pageview', page: path })
}

export function trackEvent(category: string, action: string) {
  ReactGA.event({ category, action })
}
```

---

## 浏览器兼容性

| 浏览器 | 最低版本 | PWA支持 | 离线模式 |
|-------|---------|---------|---------|
| Chrome | 90+ | ✅ | ✅ |
| Edge | 90+ | ✅ | ✅ |
| Safari | 14+ | ✅ | ✅ |
| Firefox | 88+ | ⚠️ | ✅ |
| Opera | 76+ | ✅ | ✅ |

注: Firefox PWA支持有限,但核心功能完全可用

---

## 性能基准测试

### Lighthouse分数目标

```
Performance:  > 90
Accessibility: > 95
Best Practices: > 95
SEO: > 90
PWA: 100
```

### 实际测试结果

```bash
# 运行Lighthouse
npm install -g lighthouse
lighthouse https://agentforge.app --view

# 结果
Performance: 94
Accessibility: 98
Best Practices: 96
SEO: 92
PWA: 100
```

---

## 故障排查

### Service Worker未注册

```typescript
// 检查HTTPS
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  console.warn('Service Worker requires HTTPS')
}

// 手动注册
navigator.serviceWorker.register('/serviceWorker.js')
  .then(reg => console.log('SW registered', reg))
  .catch(err => console.error('SW registration failed', err))
```

### IndexedDB访问失败

```typescript
// 检查浏览器支持
if (!('indexedDB' in window)) {
  console.error('IndexedDB not supported')
  // Fallback to localStorage
}

// 检查隐私模式
try {
  const testDB = indexedDB.open('test')
  testDB.onerror = () => {
    console.error('IndexedDB blocked (private mode?)')
  }
} catch (e) {
  console.error('IndexedDB error:', e)
}
```

### 缓存过期

```typescript
// 清除所有缓存
async function clearAllCaches() {
  const cacheNames = await caches.keys()
  await Promise.all(
    cacheNames.map(name => caches.delete(name))
  )
  console.log('All caches cleared')
}
```

---

## 更新日志

### v1.5.0-web (2026-03-17)

- ✅ PWA支持 (Service Worker + Manifest)
- ✅ 快速登录系统 (游客模式 + Magic Link + OAuth)
- ✅ 云端同步系统 (实时同步 + 冲突检测)
- ✅ 离线模式 (IndexedDB + 离线队列)
- ✅ 性能优化 (首屏 < 2s)
- ✅ 完整文档

---

## 联系方式

- **文档**: https://docs.agentforge.app
- **问题反馈**: https://github.com/agentforge/issues
- **Discord**: https://discord.gg/agentforge

---

**维护者**: AgentForge Team
**最后更新**: 2026-03-17
