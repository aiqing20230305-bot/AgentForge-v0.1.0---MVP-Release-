/**
 * CDN Service Usage Examples
 * 使用示例和最佳实践
 */

import {
  initializeCDNService,
  getOptimizedUrl,
  preloadCriticalResources,
  purgeCDNCache,
  getCDNStats,
  getUserGeolocation,
  selectBestNode
} from './index';

/**
 * 示例 1: 应用启动时初始化 CDN 服务
 */
export function initializeApp() {
  // 初始化 CDN 服务
  initializeCDNService({
    enabled: true,
    cdnBaseUrl: 'https://cdn.agentforge.app',
    cloudflareZoneId: process.env.CLOUDFLARE_ZONE_ID || '',
    cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN || '',
    domains: ['agentforge.app', 'www.agentforge.app']
  });

  // 预加载关键资源
  preloadCriticalResources({
    images: [
      '/images/logo.png',
      '/images/hero.jpg'
    ],
    fonts: [
      '/fonts/inter-var.woff2'
    ],
    scripts: [
      // CDN 会自动处理
    ],
    styles: [
      // CDN 会自动处理
    ]
  });

  console.log('CDN Service initialized');
}

/**
 * 示例 2: 在 React 组件中使用图片优化
 */
export function ImageExample() {
  const imageUrl = '/images/agent-portrait.jpg';

  // 基础优化
  const optimizedUrl = getOptimizedUrl(imageUrl, {
    width: 400,
    quality: 85,
    format: 'auto' // 自动选择 AVIF 或 WebP
  });

  // 响应式图片
  const srcSet = [400, 800, 1200]
    .map(width => {
      const url = getOptimizedUrl(imageUrl, { width, format: 'auto' });
      return `${url} ${width}w`;
    })
    .join(', ');

  // JSX 示例（注释掉以避免语法错误）
  /*
  return (
    <img
      src={optimizedUrl}
      srcSet={srcSet}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      loading="lazy"
      alt="Agent Portrait"
      className="rounded-lg shadow-lg"
    />
  );
  */
}

/**
 * 示例 3: 监控 CDN 性能
 */
export async function monitorCDNPerformance() {
  // 获取统计数据
  const stats = getCDNStats();

  console.log('Latest Stats:', stats.latest);
  console.log('Hit Rate:', `${(stats.latest.hitRate * 100).toFixed(2)}%`);
  console.log('Total Requests:', stats.latest.requests);
  console.log('Bandwidth Used:', formatBytes(stats.latest.bandwidth));

  // 检查边缘节点状态
  stats.edgeNodes.forEach(node => {
    console.log(`Node ${node.location}:`, {
      status: node.status,
      latency: `${node.latency.toFixed(0)}ms`,
      requests: node.requests
    });
  });

  // 获取用户地理位置
  const geo = await getUserGeolocation();
  console.log('User Location:', `${geo.city}, ${geo.country}`);

  // 选择最佳节点
  const routing = await selectBestNode('/api/data');
  console.log('Selected Node:', routing.selectedTarget.location);
  console.log('Latency:', `${routing.latency.toFixed(0)}ms`);
}

/**
 * 示例 4: 缓存管理
 */
export async function manageCDNCache() {
  // 场景1: 部署新版本后清除所有缓存
  await purgeCDNCache();
  console.log('All cache purged');

  // 场景2: 清除特定文件缓存
  await purgeCDNCache([
    '/assets/app-v2.js',
    '/assets/style-v2.css',
    '/images/updated-hero.jpg'
  ]);
  console.log('Specific files purged');
}

/**
 * 示例 5: 动态加载资源
 */
export async function loadResourcesDynamically() {
  const { resourceLoader } = await import('./resourceLoader');

  // 动态加载脚本
  await resourceLoader.loadScript('https://cdn.example.com/analytics.js', {
    async: true
  });

  // 动态加载样式表
  await resourceLoader.loadStylesheet('https://cdn.example.com/theme.css');

  console.log('Resources loaded dynamically');
}

/**
 * 示例 6: 为不同场景优化图片
 */
export function imageOptimizationScenarios() {
  const baseUrl = '/images/product.jpg';

  // 缩略图 - 小尺寸、低质量
  const thumbnailUrl = getOptimizedUrl(baseUrl, {
    width: 200,
    height: 200,
    quality: 70,
    format: 'webp',
    fit: 'cover'
  });

  // 列表图 - 中等尺寸
  const listUrl = getOptimizedUrl(baseUrl, {
    width: 400,
    quality: 80,
    format: 'auto',
    fit: 'contain'
  });

  // 详情页 - 高质量
  const detailUrl = getOptimizedUrl(baseUrl, {
    width: 1200,
    quality: 90,
    format: 'auto'
  });

  // 背景图 - 模糊效果
  const blurUrl = getOptimizedUrl(baseUrl, {
    width: 800,
    quality: 60,
    blur: 20,
    format: 'webp'
  });

  return { thumbnailUrl, listUrl, detailUrl, blurUrl };
}

/**
 * 示例 7: 智能预连接
 */
export function setupPreconnections() {
  const { resourceLoader } = require('./resourceLoader');

  // 预连接到外部服务
  resourceLoader.preconnect('https://api.anthropic.com', true);
  resourceLoader.preconnect('https://cdn.agentforge.app', true);

  // DNS 预解析
  resourceLoader.dnsPrefetch('https://analytics.google.com');
  resourceLoader.dnsPrefetch('https://fonts.googleapis.com');

  console.log('Preconnections established');
}

/**
 * 工具函数: 格式化字节大小
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 示例 8: 在组件挂载时优化资源
 */
export function useOptimizedImage(imageUrl: string) {
  // React Hook 示例（实际使用时需要在 React 组件中）
  const optimizedUrl = getOptimizedUrl(imageUrl, {
    width: 800,
    format: 'auto',
    quality: 85
  });

  return optimizedUrl;
}

/**
 * 示例 9: 批量预加载图片
 */
export function preloadGalleryImages(imageUrls: string[]) {
  const { imageOptimizer } = require('./imageOptimizer');

  // 预加载优化后的图片
  const optimizedUrls = imageUrls.map(url =>
    getOptimizedUrl(url, { width: 400, format: 'auto' })
  );

  imageOptimizer.preloadImages(optimizedUrls);
  console.log(`Preloaded ${imageUrls.length} gallery images`);
}

/**
 * 示例 10: 性能监控和告警
 */
export function setupPerformanceMonitoring() {
  // 定期检查性能指标
  setInterval(() => {
    const stats = getCDNStats();

    // 检查缓存命中率
    if (stats.latest.hitRate < 0.90) {
      console.warn('⚠️ Low cache hit rate:', `${(stats.latest.hitRate * 100).toFixed(1)}%`);
    }

    // 检查节点健康状态
    stats.edgeNodes.forEach(node => {
      if (node.status !== 'online') {
        console.warn(`⚠️ Node ${node.location} is ${node.status}`);
      }

      if (node.latency > 200) {
        console.warn(`⚠️ High latency at ${node.location}: ${node.latency.toFixed(0)}ms`);
      }
    });
  }, 60000); // 每分钟检查一次
}

// 导出所有示例
export const examples = {
  initializeApp,
  ImageExample,
  monitorCDNPerformance,
  manageCDNCache,
  loadResourcesDynamically,
  imageOptimizationScenarios,
  setupPreconnections,
  useOptimizedImage,
  preloadGalleryImages,
  setupPerformanceMonitoring
};
