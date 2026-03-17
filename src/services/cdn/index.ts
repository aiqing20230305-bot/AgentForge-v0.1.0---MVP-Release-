/**
 * CDN Service - 统一导出和初始化
 */

export { cdnManager } from './cdnManager';
export type { CDNConfig, CacheStrategy, CDNStats, EdgeNode } from './cdnManager';

export { globalRouter } from './globalRouter';
export type { GeolocationData, RouteTarget, RoutingDecision } from './globalRouter';

export { imageOptimizer } from './imageOptimizer';
export type { ImageOptimizationOptions, OptimizedImage } from './imageOptimizer';

export { resourceLoader } from './resourceLoader';
export type { ResourcePriority, PreloadOptions } from './resourceLoader';

/**
 * 初始化 CDN 服务
 */
export function initializeCDNService(config: {
  enabled?: boolean;
  cdnBaseUrl?: string;
  cloudflareZoneId?: string;
  cloudflareApiToken?: string;
  domains?: string[];
}): void {
  const {
    enabled = true,
    cdnBaseUrl = '',
    cloudflareZoneId = '',
    cloudflareApiToken = '',
    domains = []
  } = config;

  // 初始化 CDN 管理器
  const { cdnManager } = require('./cdnManager');
  cdnManager.initialize({
    provider: 'cloudflare',
    zoneId: cloudflareZoneId,
    apiToken: cloudflareApiToken,
    domains,
    enabled
  });

  // 设置图片优化器 CDN URL
  const { imageOptimizer } = require('./imageOptimizer');
  imageOptimizer.setCDNBaseUrl(cdnBaseUrl);

  // 预连接到关键资源
  const { resourceLoader } = require('./resourceLoader');
  resourceLoader.initCriticalResources({
    cdnOrigins: cdnBaseUrl ? [cdnBaseUrl] : [],
    apiOrigins: ['https://api.anthropic.com'],
    criticalFonts: [
      // 添加关键字体
    ],
    criticalImages: [
      // 添加关键图片
    ],
    criticalScripts: [
      // 添加关键脚本
    ],
    criticalStyles: [
      // 添加关键样式
    ]
  });

  // 检测地理位置并选择最佳路由
  const { globalRouter } = require('./globalRouter');
  globalRouter.detectGeolocation().then((geo) => {
    console.log('[CDN] User location detected:', geo.city, geo.country);
  });

  // 设置图片懒加载
  if (typeof window !== 'undefined') {
    imageOptimizer.setupLazyLoading();
  }

  console.log('[CDN] Service initialized successfully');
}

/**
 * 获取优化后的资源 URL
 */
export function getOptimizedUrl(
  url: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
  }
): string {
  const { imageOptimizer } = require('./imageOptimizer');
  return imageOptimizer.optimizeImageUrl(url, options);
}

/**
 * 预加载关键资源
 */
export function preloadCriticalResources(resources: {
  images?: string[];
  scripts?: string[];
  styles?: string[];
  fonts?: string[];
}): void {
  const { resourceLoader } = require('./resourceLoader');

  if (resources.images) {
    resourceLoader.preloadImages(resources.images.map(href => ({ href })));
  }

  if (resources.scripts) {
    resourceLoader.preloadJS(resources.scripts);
  }

  if (resources.styles) {
    resourceLoader.preloadCSS(resources.styles);
  }

  if (resources.fonts) {
    resourceLoader.preloadFonts(resources.fonts.map(href => ({ href, type: 'font/woff2' })));
  }
}

/**
 * 清除 CDN 缓存
 */
export async function purgeCDNCache(paths?: string[]): Promise<void> {
  const { cdnManager } = require('./cdnManager');
  await cdnManager.purgeCache(paths);
}

/**
 * 获取 CDN 统计数据
 */
export function getCDNStats() {
  const { cdnManager } = require('./cdnManager');
  return {
    latest: cdnManager.getLatestStats(),
    history: cdnManager.getStats(),
    edgeNodes: cdnManager.getEdgeNodes()
  };
}

/**
 * 获取用户地理位置
 */
export async function getUserGeolocation() {
  const { globalRouter } = require('./globalRouter');
  return await globalRouter.detectGeolocation();
}

/**
 * 选择最佳路由节点
 */
export async function selectBestNode(resource: string) {
  const { globalRouter } = require('./globalRouter');
  return await globalRouter.selectBestRoute(resource);
}
