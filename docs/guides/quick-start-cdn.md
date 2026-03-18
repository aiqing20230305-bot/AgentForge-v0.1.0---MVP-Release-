# CDN System Quick Start Guide

快速开始使用 AgentForge CDN 和全球加速系统

## 5 分钟快速集成

### Step 1: 初始化 CDN 服务

在应用入口文件（如 `src/main.tsx` 或 `src/App.tsx`）中添加：

```typescript
import { initializeCDNService } from '@/services/cdn';

// 应用启动时调用
initializeCDNService({
  enabled: true,
  cdnBaseUrl: 'https://cdn.agentforge.app'
});
```

### Step 2: 优化图片

在组件中使用优化后的图片 URL：

```typescript
import { getOptimizedUrl } from '@/services/cdn';

function MyComponent() {
  const imageUrl = getOptimizedUrl('/images/hero.jpg', {
    width: 800,
    quality: 85,
    format: 'auto' // 自动选择最佳格式
  });

  return (
    <img
      src={imageUrl}
      alt="Hero"
      loading="lazy"
    />
  );
}
```

### Step 3: 添加监控面板

在管理页面中添加 CDN 监控：

```typescript
import { CDNDashboard } from '@/components/admin/CDNDashboard';

function AdminPage() {
  return (
    <div>
      <h1>System Management</h1>
      <CDNDashboard />
    </div>
  );
}
```

## 常用功能

### 图片优化

```typescript
import { getOptimizedUrl } from '@/services/cdn';

// 缩略图
const thumb = getOptimizedUrl(url, { width: 200, quality: 70 });

// 响应式图片
const srcSet = [400, 800, 1200]
  .map(w => `${getOptimizedUrl(url, { width: w })} ${w}w`)
  .join(', ');
```

### 预加载资源

```typescript
import { preloadCriticalResources } from '@/services/cdn';

preloadCriticalResources({
  images: ['/logo.png', '/hero.jpg'],
  fonts: ['/fonts/main.woff2']
});
```

### 获取统计数据

```typescript
import { getCDNStats } from '@/services/cdn';

const stats = getCDNStats();
console.log('Hit Rate:', stats.latest.hitRate);
console.log('Nodes:', stats.edgeNodes);
```

### 清除缓存

```typescript
import { purgeCDNCache } from '@/services/cdn';

// 清除所有
await purgeCDNCache();

// 清除特定文件
await purgeCDNCache(['/assets/app.js']);
```

## 环境配置

### 开发环境

`.env.development`:
```bash
VITE_CDN_ENABLED=true
VITE_CDN_BASE_URL=http://localhost:5173
```

### 生产环境

`.env.production`:
```bash
VITE_CDN_ENABLED=true
VITE_CDN_BASE_URL=https://cdn.agentforge.app
VITE_CLOUDFLARE_ZONE_ID=your-zone-id
VITE_CLOUDFLARE_API_TOKEN=your-api-token
```

## 最佳实践

### 1. 图片使用

✅ 推荐：
```typescript
// 使用 format: 'auto' 自动选择最佳格式
const url = getOptimizedUrl(image, { format: 'auto' });
```

❌ 避免：
```typescript
// 不要硬编码格式
const url = getOptimizedUrl(image, { format: 'jpeg' });
```

### 2. 懒加载

✅ 推荐：
```tsx
<img src={optimizedUrl} loading="lazy" />
```

### 3. 响应式图片

✅ 推荐：
```tsx
<img
  src={getOptimizedUrl(url, { width: 800 })}
  srcSet={generateSrcSet(url, [400, 800, 1200])}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### 4. 预加载关键资源

✅ 推荐：
```typescript
// 应用启动时预加载首屏资源
preloadCriticalResources({
  images: ['/logo.png'],
  fonts: ['/fonts/main.woff2']
});
```

## 性能检查

### 检查缓存命中率

```typescript
const stats = getCDNStats();
if (stats.latest.hitRate < 0.95) {
  console.warn('Cache hit rate is low');
}
```

### 检查节点状态

```typescript
const stats = getCDNStats();
stats.edgeNodes.forEach(node => {
  if (node.status !== 'online') {
    console.warn(`Node ${node.location} is ${node.status}`);
  }
});
```

## 故障排除

### 问题 1: 图片未优化

**原因**: CDN 未启用或配置错误

**解决**:
```typescript
// 检查配置
initializeCDNService({
  enabled: true, // 确保启用
  cdnBaseUrl: 'https://cdn.agentforge.app' // 确保 URL 正确
});
```

### 问题 2: 缓存命中率低

**原因**: 缓存策略不合理

**解决**:
```typescript
import { cdnManager } from '@/services/cdn';

// 添加自定义缓存策略
cdnManager.addCacheStrategy('/api/data/*', {
  ttl: 300, // 5分钟
  browserTTL: 60,
  edgeTTL: 300,
  cacheLevel: 'basic'
});
```

### 问题 3: 节点延迟高

**原因**: 未选择最近节点

**解决**:
```typescript
import { selectBestNode } from '@/services/cdn';

// 手动选择最佳节点
const routing = await selectBestNode('/api/endpoint');
console.log('Best node:', routing.selectedTarget.location);
```

## 更多资源

- 📖 完整文档: `src/services/cdn/README.md`
- 💡 使用示例: `src/services/cdn/example.ts`
- 📊 实现报告: `TASK-310-COMPLETED.md`
- 📋 系统总结: `CDN-SYSTEM-SUMMARY.md`

## 技术支持

遇到问题？检查以下资源：

1. TypeScript 类型定义（完整 API 文档）
2. 代码内联注释
3. 示例文件
4. README 文档

## 下一步

- [ ] 配置 Cloudflare 账户
- [ ] 设置环境变量
- [ ] 集成到应用中
- [ ] 部署到生产环境
- [ ] 监控性能指标

---

**快速参考**: 所有 API 都从 `@/services/cdn` 导出

```typescript
import {
  initializeCDNService,
  getOptimizedUrl,
  preloadCriticalResources,
  purgeCDNCache,
  getCDNStats,
  getUserGeolocation,
  selectBestNode
} from '@/services/cdn';
```

🎉 开始使用 CDN 加速你的应用！
