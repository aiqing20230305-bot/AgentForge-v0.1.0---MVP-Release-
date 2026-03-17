# 🚀 AgentForge Web版 - 开发速查表

快速参考Web版核心API和配置

---

## 📦 核心服务

### 1. 快速认证 (QuickAuth)

```typescript
import { getQuickAuth } from '@/services/auth/quickAuth'

const auth = getQuickAuth()

// 游客登录 (5秒开始)
const guest = await auth.loginAsGuest()

// Magic Link (免密)
await auth.requestMagicLink('user@example.com')
const user = await auth.verifyMagicLink(token)

// OAuth
await auth.loginWithOAuth('google') // or 'github' | 'discord'

// 传统登录
const user = await auth.loginWithPassword(email, password)

// 注册
const user = await auth.register(email, password, username)

// 游客升级
const user = await auth.upgradeGuestAccount(email, password)

// 登出
await auth.logout()

// 获取状态
const state = auth.getAuthState()
const token = auth.getAccessToken()
```

### 2. 云端同步 (CloudSync)

```typescript
import { getCloudSync } from '@/services/sync/cloudSync'

const sync = getCloudSync()

// 初始化
await sync.initialize()

// 同步
await sync.sync('bidirectional') // or 'push' | 'pull'

// 配置
sync.updateConfig({
  enabled: true,
  autoSync: true,
  syncInterval: 30000, // 30秒
  conflictStrategy: 'merge', // or 'local-wins' | 'remote-wins' | 'manual'
  realtimeEnabled: true
})

// 监听状态
sync.onStatusChange(status => {
  console.log('Sync status:', status)
})

// 跟踪变更
sync.trackChange({
  id: 'agent_123',
  type: 'updated',
  entity: 'agent',
  data: agent
})

// 获取统计
const stats = sync.getStats()
const conflicts = sync.getConflicts()
```

### 3. IndexedDB存储

```typescript
import { getIndexedDB, STORES } from '@/services/offline/indexedDB'

const db = getIndexedDB()

// 初始化 (自动)
await db.initialize()

// 增删改查
await db.put(STORES.AGENTS, agent)
await db.add(STORES.TASKS, task)
const agent = await db.get(STORES.AGENTS, agentId)
const agents = await db.getAll(STORES.AGENTS)
await db.delete(STORES.AGENTS, agentId)
await db.clear(STORES.AGENTS)

// 索引查询
const active = await db.getByIndex(STORES.AGENTS, 'status', 'active')

// 复杂查询
const filtered = await db.query(STORES.AGENTS, agent => {
  return agent.level > 10 && agent.status === 'active'
})

// 批量操作
await db.batch(STORES.AGENTS, [
  { type: 'put', item: agent1 },
  { type: 'put', item: agent2 },
  { type: 'delete', key: 'agent_3' }
])

// 缓存
await db.setCache('key', data, 3600000) // 1小时
const data = await db.getCache('key')
await db.cleanExpiredCache()

// 导入导出
const data = await db.exportToJSON()
await db.importFromJSON(data)

// 统计
const count = await db.count(STORES.AGENTS)
const { usage, quota } = await db.getSize()
```

### 4. 性能监控

```typescript
import { getPerformanceMonitor, performanceUtils } from '@/utils/webPerformance'

// 监控器
const monitor = getPerformanceMonitor()
monitor.start()
const metrics = monitor.getMetrics()
const grade = monitor.getGrade() // 'A' | 'B' | 'C' | 'D' | 'F'
const resources = monitor.getResourceTimings()

// 工具函数
performanceUtils.preloadResources(['/fonts/main.woff2'])
performanceUtils.prefetchResources(['/images/avatar.png'])
await performanceUtils.loadScript('/analytics.js')
performanceUtils.lazyLoadImages()

// 测量
const result = performanceUtils.measure('myFunction', () => {
  // 同步代码
  return result
})

const result = await performanceUtils.measureAsync('myAsyncFunction', async () => {
  // 异步代码
  return result
})

// 空闲回调
performanceUtils.requestIdleCallback(() => {
  // 低优先级任务
})

// 内存
const memory = performanceUtils.getMemoryUsage()
// { used: 50, total: 100, limit: 2048 } (MB)

// 网络
const connection = performanceUtils.getConnectionInfo()
const isSlow = performanceUtils.isSlowConnection()
```

---

## ⚙️ Service Worker

### 注册

```typescript
// 自动注册 (在WebApp.tsx中)
if ('serviceWorker' in navigator) {
  const registration = await navigator.serviceWorker.register('/serviceWorker.js')
}
```

### 通信

```typescript
// 发送消息给SW
navigator.serviceWorker.controller?.postMessage({
  type: 'CACHE_URLS',
  urls: ['/image1.png', '/image2.png']
})

// 接收SW消息
navigator.serviceWorker.addEventListener('message', event => {
  console.log('SW message:', event.data)
})
```

### 更新

```typescript
// 跳过等待
navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' })
window.location.reload()
```

---

## 🎨 React组件模式

### WebApp包装

```typescript
// src/components/WebApp.tsx
export function WebApp() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // 初始化Web服务
    initializeWebApp()
  }, [])

  if (!isReady) {
    return <LoadingScreen />
  }

  return <App />
}
```

### 条件渲染

```typescript
// 检测环境
const isElectron = typeof window !== 'undefined' && (window as any).electron
const isWeb = !isElectron

// 条件加载
const Component = isWeb ? WebOnlyComponent : DesktopComponent
```

### 懒加载

```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'))

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

---

## 📝 配置文件

### manifest.json

```json
{
  "name": "AgentForge",
  "short_name": "AgentForge",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#06b6d4",
  "background_color": "#0a0a0a",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### vite.config.ts

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  }
})
```

### .env.production

```bash
VITE_API_URL=https://api.agentforge.app
VITE_WS_URL=wss://api.agentforge.app
VITE_GOOGLE_CLIENT_ID=xxx
VITE_GITHUB_CLIENT_ID=xxx
VITE_DISCORD_CLIENT_ID=xxx
```

---

## 🚀 构建和部署

### 本地开发

```bash
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm run preview          # 预览构建产物
```

### 优化构建

```bash
./scripts/build-web.sh   # 使用优化脚本
```

### 部署

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod

# 自定义
rsync -avz dist/ user@server:/var/www/agentforge/
```

---

## 🔍 调试技巧

### Chrome DevTools

```javascript
// Application → Service Workers → 查看SW状态
// Application → Storage → IndexedDB → 查看数据
// Network → Disable cache → 测试缓存
// Lighthouse → 性能测试
```

### Console命令

```javascript
// 查看缓存
caches.keys().then(console.log)

// 清除所有缓存
caches.keys().then(keys =>
  Promise.all(keys.map(k => caches.delete(k)))
)

// 查看IndexedDB
indexedDB.databases().then(console.log)

// 性能
performance.getEntriesByType('navigation')
performance.getEntriesByType('resource')
```

### Service Worker调试

```javascript
// 强制更新SW
registration.update()

// 跳过等待
registration.waiting?.postMessage({ type: 'SKIP_WAITING' })

// 注销SW
registration.unregister()
```

---

## 📊 性能检查清单

### 首屏加载

- [ ] FCP < 1.5s
- [ ] LCP < 2.5s
- [ ] TTI < 3.5s
- [ ] Total < 3s

### 交互性能

- [ ] FID < 100ms
- [ ] 60fps动画
- [ ] 无卡顿滚动

### 资源优化

- [ ] 启用代码分割
- [ ] 启用Tree Shaking
- [ ] 图片懒加载
- [ ] 字体预加载

### 缓存策略

- [ ] Service Worker注册
- [ ] 静态资源缓存
- [ ] API响应缓存
- [ ] 离线支持

---

## 🐛 常见问题

### Service Worker未注册

```typescript
// 检查HTTPS
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  console.warn('Service Worker requires HTTPS')
}
```

### IndexedDB被阻止

```typescript
// 检查隐私模式
try {
  const testDB = indexedDB.open('test')
  testDB.onerror = () => console.error('IndexedDB blocked')
} catch (e) {
  console.error('IndexedDB not available')
}
```

### PWA不提示安装

```typescript
// 检查manifest
fetch('/manifest.json').then(r => r.json()).then(console.log)

// 检查图标
document.querySelectorAll('link[rel="manifest"]')
```

---

## 📚 相关文档

- [完整文档](./WEB_VERSION_README.md)
- [快速入门](./QUICK_START_WEB.md)
- [开发总结](./WEB_VERSION_SUMMARY.md)
- [架构文档](./ARCHITECTURE.md)

---

**最后更新**: 2026-03-17
**版本**: 1.5.0-web
