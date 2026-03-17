/**
 * CDN Manager - 全球内容分发网络管理器
 * 负责 Cloudflare CDN 集成、静态资源加速和智能缓存策略
 */

export interface CDNConfig {
  provider: 'cloudflare' | 'aws' | 'azure';
  zoneId: string;
  apiToken: string;
  domains: string[];
  enabled: boolean;
}

export interface CacheStrategy {
  path: string;
  ttl: number; // 缓存时间（秒）
  browserTTL: number;
  edgeTTL: number;
  cacheLevel: 'bypass' | 'basic' | 'simplified' | 'aggressive';
}

export interface CDNStats {
  hitRate: number;
  bandwidth: number;
  requests: number;
  cachedBytes: number;
  timestamp: number;
}

export interface EdgeNode {
  id: string;
  location: string;
  country: string;
  latitude: number;
  longitude: number;
  status: 'online' | 'offline' | 'degraded';
  latency: number;
  requests: number;
}

class CDNManager {
  private config: CDNConfig | null = null;
  private cacheStrategies: Map<string, CacheStrategy> = new Map();
  private edgeNodes: EdgeNode[] = [];
  private stats: CDNStats[] = [];
  private statsUpdateInterval: number | null = null;

  constructor() {
    this.initializeDefaultStrategies();
    this.initializeEdgeNodes();
  }

  /**
   * 初始化 CDN 配置
   */
  initialize(config: CDNConfig): void {
    this.config = config;

    if (config.enabled) {
      this.startStatsCollection();
      console.log('[CDN] Initialized with provider:', config.provider);
    }
  }

  /**
   * 初始化默认缓存策略
   */
  private initializeDefaultStrategies(): void {
    // 静态资源 - 长期缓存
    this.cacheStrategies.set('/assets/**', {
      path: '/assets/**',
      ttl: 31536000, // 1年
      browserTTL: 31536000,
      edgeTTL: 2592000, // 30天
      cacheLevel: 'aggressive'
    });

    // JavaScript/CSS - 中期缓存
    this.cacheStrategies.set('**/*.{js,css}', {
      path: '**/*.{js,css}',
      ttl: 86400, // 1天
      browserTTL: 3600,
      edgeTTL: 86400,
      cacheLevel: 'aggressive'
    });

    // 图片资源 - 长期缓存
    this.cacheStrategies.set('**/*.{jpg,jpeg,png,gif,webp,avif,svg}', {
      path: '**/*.{jpg,jpeg,png,gif,webp,avif,svg}',
      ttl: 604800, // 7天
      browserTTL: 604800,
      edgeTTL: 604800,
      cacheLevel: 'aggressive'
    });

    // API 响应 - 短期缓存
    this.cacheStrategies.set('/api/**', {
      path: '/api/**',
      ttl: 60,
      browserTTL: 0,
      edgeTTL: 60,
      cacheLevel: 'basic'
    });

    // HTML - 不缓存（动态内容）
    this.cacheStrategies.set('**/*.html', {
      path: '**/*.html',
      ttl: 0,
      browserTTL: 0,
      edgeTTL: 300, // 5分钟边缘缓存
      cacheLevel: 'simplified'
    });
  }

  /**
   * 初始化全球边缘节点
   */
  private initializeEdgeNodes(): void {
    this.edgeNodes = [
      {
        id: 'us-east-1',
        location: 'New York',
        country: 'US',
        latitude: 40.7128,
        longitude: -74.0060,
        status: 'online',
        latency: 20,
        requests: 0
      },
      {
        id: 'us-west-1',
        location: 'San Francisco',
        country: 'US',
        latitude: 37.7749,
        longitude: -122.4194,
        status: 'online',
        latency: 25,
        requests: 0
      },
      {
        id: 'eu-west-1',
        location: 'London',
        country: 'UK',
        latitude: 51.5074,
        longitude: -0.1278,
        status: 'online',
        latency: 30,
        requests: 0
      },
      {
        id: 'ap-southeast-1',
        location: 'Singapore',
        country: 'SG',
        latitude: 1.3521,
        longitude: 103.8198,
        status: 'online',
        latency: 45,
        requests: 0
      },
      {
        id: 'ap-northeast-1',
        location: 'Tokyo',
        country: 'JP',
        latitude: 35.6762,
        longitude: 139.6503,
        status: 'online',
        latency: 40,
        requests: 0
      },
      {
        id: 'ap-east-1',
        location: 'Hong Kong',
        country: 'HK',
        latitude: 22.3193,
        longitude: 114.1694,
        status: 'online',
        latency: 50,
        requests: 0
      },
      {
        id: 'cn-north-1',
        location: 'Beijing',
        country: 'CN',
        latitude: 39.9042,
        longitude: 116.4074,
        status: 'online',
        latency: 35,
        requests: 0
      }
    ];
  }

  /**
   * 获取资源的缓存策略
   */
  getCacheStrategy(path: string): CacheStrategy | null {
    for (const [pattern, strategy] of this.cacheStrategies) {
      if (this.matchPattern(path, pattern)) {
        return strategy;
      }
    }
    return null;
  }

  /**
   * 匹配路径模式
   */
  private matchPattern(path: string, pattern: string): boolean {
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\{([^}]+)\}/g, '($1)')
      .replace(/,/g, '|');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  /**
   * 添加自定义缓存策略
   */
  addCacheStrategy(pattern: string, strategy: Omit<CacheStrategy, 'path'>): void {
    this.cacheStrategies.set(pattern, {
      path: pattern,
      ...strategy
    });
  }

  /**
   * 清除 CDN 缓存
   */
  async purgeCache(paths?: string[]): Promise<void> {
    if (!this.config || !this.config.enabled) {
      throw new Error('CDN not initialized');
    }

    console.log('[CDN] Purging cache for paths:', paths || 'all');

    try {
      // 模拟 Cloudflare API 调用
      await this.callCloudflareAPI('purge_cache', {
        files: paths || ['*']
      });

      console.log('[CDN] Cache purged successfully');
    } catch (error) {
      console.error('[CDN] Failed to purge cache:', error);
      throw error;
    }
  }

  /**
   * 开始收集统计数据
   */
  private startStatsCollection(): void {
    if (this.statsUpdateInterval) {
      clearInterval(this.statsUpdateInterval);
    }

    this.statsUpdateInterval = window.setInterval(() => {
      this.updateStats();
    }, 60000); // 每分钟更新

    // 立即更新一次
    this.updateStats();
  }

  /**
   * 更新统计数据
   */
  private updateStats(): void {
    const now = Date.now();

    // 模拟实时统计数据
    const stats: CDNStats = {
      hitRate: 0.95 + Math.random() * 0.04, // 95-99%
      bandwidth: Math.floor(Math.random() * 100000000), // 随机带宽
      requests: Math.floor(Math.random() * 10000),
      cachedBytes: Math.floor(Math.random() * 50000000),
      timestamp: now
    };

    this.stats.push(stats);

    // 只保留最近24小时的数据
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    this.stats = this.stats.filter(s => s.timestamp > oneDayAgo);

    // 更新节点请求数
    this.edgeNodes.forEach(node => {
      node.requests += Math.floor(Math.random() * 1000);
      // 随机更新延迟
      node.latency = Math.max(10, node.latency + (Math.random() - 0.5) * 10);
    });
  }

  /**
   * 获取统计数据
   */
  getStats(): CDNStats[] {
    return [...this.stats];
  }

  /**
   * 获取最新统计数据
   */
  getLatestStats(): CDNStats | null {
    return this.stats.length > 0 ? this.stats[this.stats.length - 1] : null;
  }

  /**
   * 获取边缘节点列表
   */
  getEdgeNodes(): EdgeNode[] {
    return [...this.edgeNodes];
  }

  /**
   * 调用 Cloudflare API
   */
  private async callCloudflareAPI(endpoint: string, data: any): Promise<any> {
    if (!this.config) {
      throw new Error('CDN not configured');
    }

    // 模拟 API 调用
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data });
      }, 500);
    });
  }

  /**
   * 预热缓存
   */
  async warmCache(urls: string[]): Promise<void> {
    console.log('[CDN] Warming cache for URLs:', urls);

    const promises = urls.map(async (url) => {
      try {
        await fetch(url, { method: 'HEAD' });
      } catch (error) {
        console.warn('[CDN] Failed to warm cache for:', url, error);
      }
    });

    await Promise.all(promises);
    console.log('[CDN] Cache warming complete');
  }

  /**
   * 清理资源
   */
  destroy(): void {
    if (this.statsUpdateInterval) {
      clearInterval(this.statsUpdateInterval);
      this.statsUpdateInterval = null;
    }
  }
}

// 单例实例
export const cdnManager = new CDNManager();
