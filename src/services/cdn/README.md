# CDN and Global Acceleration System

全球内容分发网络（CDN）和加速系统，为 AgentForge 提供快速、可靠的全球访问能力。

## Features

### 1. CDN Integration (cdnManager.ts)
- Cloudflare CDN 集成
- 智能缓存策略配置
- 多种资源类型缓存规则
- 实时统计数据收集
- 缓存清除和管理

### 2. Global Routing (globalRouter.ts)
- 地理位置自动检测
- 最近节点智能路由
- 多区域负载均衡
- 延迟测量和优化
- 备用节点支持

### 3. Image Optimization (imageOptimizer.ts)
- WebP/AVIF 格式自动转换
- 智能图片压缩
- 响应式图片源集生成
- 懒加载支持
- Cloudflare Image Resizing API

### 4. Resource Loading (resourceLoader.ts)
- 关键资源预加载
- DNS 预解析
- 域名预连接
- 字体、图片、脚本预加载
- 优先级管理

## Quick Start

### 初始化 CDN 服务

```typescript
import { initializeCDNService } from '@/services/cdn';

// 在应用启动时初始化
initializeCDNService({
  enabled: true,
  cdnBaseUrl: 'https://cdn.agentforge.app',
  cloudflareZoneId: 'your-zone-id',
  cloudflareApiToken: 'your-api-token',
  domains: ['agentforge.app', 'www.agentforge.app']
});
```

### 使用图片优化

```typescript
import { getOptimizedUrl } from '@/services/cdn';

// 基础用法
const optimizedUrl = getOptimizedUrl('/images/hero.jpg', {
  width: 800,
  quality: 85,
  format: 'auto' // 自动选择 AVIF 或 WebP
});

// 在 React 组件中使用
<img
  src={getOptimizedUrl(imageUrl, { width: 400, format: 'auto' })}
  srcSet={imageOptimizer.generateSrcSet(imageUrl, [400, 800, 1200])}
  loading="lazy"
  alt="Description"
/>
```

### 预加载关键资源

```typescript
import { preloadCriticalResources } from '@/services/cdn';

preloadCriticalResources({
  images: ['/images/logo.png', '/images/hero.jpg'],
  scripts: ['/assets/critical.js'],
  styles: ['/assets/critical.css'],
  fonts: ['/fonts/inter-var.woff2']
});
```

### 获取 CDN 统计

```typescript
import { getCDNStats } from '@/services/cdn';

const stats = getCDNStats();
console.log('Hit Rate:', stats.latest.hitRate);
console.log('Edge Nodes:', stats.edgeNodes);
```

### 使用全球路由

```typescript
import { selectBestNode, getUserGeolocation } from '@/services/cdn';

// 获取用户位置
const geo = await getUserGeolocation();
console.log('User location:', geo.city, geo.country);

// 选择最佳节点
const routing = await selectBestNode('/api/data');
console.log('Selected node:', routing.selectedTarget.location);
console.log('Latency:', routing.latency, 'ms');
```

### 清除缓存

```typescript
import { purgeCDNCache } from '@/services/cdn';

// 清除所有缓存
await purgeCDNCache();

// 清除特定文件
await purgeCDNCache([
  '/assets/app.js',
  '/assets/style.css'
]);
```

## Architecture

```
src/services/cdn/
├── cdnManager.ts         # CDN 核心管理器
├── globalRouter.ts       # 全球智能路由
├── imageOptimizer.ts     # 图片优化处理
├── resourceLoader.ts     # 资源预加载
├── index.ts             # 统一导出
└── README.md            # 文档
```

## Cache Strategies

系统预定义了以下缓存策略：

| 资源类型 | TTL | 浏览器缓存 | 边缘缓存 | 级别 |
|---------|-----|-----------|----------|------|
| 静态资源 (/assets/**) | 1年 | 1年 | 30天 | aggressive |
| JS/CSS | 1天 | 1小时 | 1天 | aggressive |
| 图片 | 7天 | 7天 | 7天 | aggressive |
| API | 1分钟 | 0 | 1分钟 | basic |
| HTML | 0 | 0 | 5分钟 | simplified |

## Global Edge Nodes

支持的全球节点：

- **us-east-1**: New York, USA
- **us-west-1**: San Francisco, USA
- **eu-west-1**: London, UK
- **ap-southeast-1**: Singapore
- **ap-northeast-1**: Tokyo, Japan
- **ap-east-1**: Hong Kong
- **cn-north-1**: Beijing, China

## Performance Metrics

### 目标指标
- 静态资源全球加速 < 100ms
- CDN 命中率 > 95%
- 支持 5+ 全球节点
- 实时监控仪表盘

### Vite Build Optimization

配置了以下优化：
- 代码分割 (Code Splitting)
- 树摇优化 (Tree Shaking)
- Brotli 压缩
- 资源内联限制 4KB
- Source Map 禁用（生产环境）
- Console 移除（生产环境）

## Dashboard Component

使用 CDN 监控面板：

```typescript
import { CDNDashboard } from '@/components/admin/CDNDashboard';

function AdminPage() {
  return (
    <div>
      <CDNDashboard />
    </div>
  );
}
```

面板功能：
- 实时缓存命中率
- 带宽使用统计
- 全球节点健康状态
- 延迟监控
- 快速操作（清除缓存、刷新统计）

## Best Practices

### 1. 图片优化
- 使用 `format: 'auto'` 自动选择最佳格式
- 为不同设备尺寸生成 srcSet
- 对非关键图片启用懒加载
- 预加载首屏关键图片

### 2. 资源加载
- 预连接到外部域名（CDN、API）
- 预加载关键字体和样式
- 使用代码分割减少初始加载
- 延迟加载非关键功能

### 3. 缓存策略
- 静态资源使用版本化 URL
- API 响应设置合理的缓存时间
- 定期清理过期缓存
- 监控缓存命中率

### 4. 全球部署
- 根据用户位置选择最近节点
- 配置备用节点保证可用性
- 监控节点健康状态
- 及时处理降级节点

## API Reference

详细 API 文档请参考各文件的 TypeScript 类型定义和注释。

## Troubleshooting

### CDN 未生效
1. 检查 `enabled` 配置是否为 `true`
2. 验证 Cloudflare Zone ID 和 API Token
3. 确认域名已添加到 Cloudflare

### 图片未优化
1. 检查 CDN Base URL 配置
2. 验证图片路径是否正确
3. 确认浏览器支持目标格式

### 路由选择不准确
1. 检查地理位置检测是否成功
2. 验证节点延迟测量
3. 清除路由缓存重新选择

## License

MIT
