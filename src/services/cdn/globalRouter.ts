/**
 * Global Router - 全球智能路由系统
 * 负责地理位置检测、最近节点路由和负载均衡
 */

export interface GeolocationData {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp: string;
}

export interface RouteTarget {
  id: string;
  url: string;
  location: string;
  priority: number;
  weight: number;
  healthScore: number;
}

export interface RoutingDecision {
  selectedTarget: RouteTarget;
  alternativeTargets: RouteTarget[];
  latency: number;
  reason: string;
}

class GlobalRouter {
  private geolocation: GeolocationData | null = null;
  private routeTargets: RouteTarget[] = [];
  private routingCache: Map<string, RoutingDecision> = new Map();

  constructor() {
    this.initializeRouteTargets();
  }

  /**
   * 初始化路由目标
   */
  private initializeRouteTargets(): void {
    this.routeTargets = [
      {
        id: 'us-east',
        url: 'https://us-east.agentforge.app',
        location: 'us-east-1',
        priority: 1,
        weight: 100,
        healthScore: 100
      },
      {
        id: 'us-west',
        url: 'https://us-west.agentforge.app',
        location: 'us-west-1',
        priority: 1,
        weight: 100,
        healthScore: 100
      },
      {
        id: 'eu-west',
        url: 'https://eu-west.agentforge.app',
        location: 'eu-west-1',
        priority: 1,
        weight: 100,
        healthScore: 100
      },
      {
        id: 'ap-southeast',
        url: 'https://ap-southeast.agentforge.app',
        location: 'ap-southeast-1',
        priority: 1,
        weight: 100,
        healthScore: 100
      },
      {
        id: 'ap-northeast',
        url: 'https://ap-northeast.agentforge.app',
        location: 'ap-northeast-1',
        priority: 1,
        weight: 100,
        healthScore: 100
      },
      {
        id: 'ap-east',
        url: 'https://ap-east.agentforge.app',
        location: 'ap-east-1',
        priority: 1,
        weight: 100,
        healthScore: 100
      },
      {
        id: 'cn-north',
        url: 'https://cn-north.agentforge.app',
        location: 'cn-north-1',
        priority: 1,
        weight: 100,
        healthScore: 100
      }
    ];
  }

  /**
   * 检测用户地理位置
   */
  async detectGeolocation(): Promise<GeolocationData> {
    if (this.geolocation) {
      return this.geolocation;
    }

    try {
      // 尝试使用 Cloudflare 的地理位置信息
      const cfHeaders = this.getCloudflareHeaders();
      if (cfHeaders) {
        this.geolocation = cfHeaders;
        return cfHeaders;
      }

      // 备用：使用浏览器地理位置 API
      const browserGeo = await this.getBrowserGeolocation();
      if (browserGeo) {
        this.geolocation = browserGeo;
        return browserGeo;
      }

      // 降级：使用 IP 地理位置服务
      const ipGeo = await this.getIPGeolocation();
      this.geolocation = ipGeo;
      return ipGeo;
    } catch (error) {
      console.error('[GlobalRouter] Failed to detect geolocation:', error);
      // 返回默认位置
      return this.getDefaultGeolocation();
    }
  }

  /**
   * 获取 Cloudflare 请求头中的地理位置信息
   */
  private getCloudflareHeaders(): GeolocationData | null {
    // 在实际部署中，这些信息会由 Cloudflare Workers 注入
    const cfCountry = (document.querySelector('meta[name="cf-country"]') as HTMLMetaElement)?.content;
    const cfRegion = (document.querySelector('meta[name="cf-region"]') as HTMLMetaElement)?.content;
    const cfCity = (document.querySelector('meta[name="cf-city"]') as HTMLMetaElement)?.content;

    if (cfCountry) {
      return {
        country: this.getCountryName(cfCountry),
        countryCode: cfCountry,
        region: cfRegion || '',
        city: cfCity || '',
        latitude: 0,
        longitude: 0,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isp: 'Unknown'
      };
    }

    return null;
  }

  /**
   * 使用浏览器地理位置 API
   */
  private async getBrowserGeolocation(): Promise<GeolocationData | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            country: 'Unknown',
            countryCode: 'XX',
            region: '',
            city: '',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            isp: 'Unknown'
          });
        },
        () => resolve(null),
        { timeout: 5000 }
      );
    });
  }

  /**
   * 使用 IP 地理位置服务
   */
  private async getIPGeolocation(): Promise<GeolocationData> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();

      return {
        country: data.country_name || 'Unknown',
        countryCode: data.country_code || 'XX',
        region: data.region || '',
        city: data.city || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        isp: data.org || 'Unknown'
      };
    } catch (error) {
      return this.getDefaultGeolocation();
    }
  }

  /**
   * 获取默认地理位置
   */
  private getDefaultGeolocation(): GeolocationData {
    return {
      country: 'Unknown',
      countryCode: 'XX',
      region: '',
      city: '',
      latitude: 0,
      longitude: 0,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isp: 'Unknown'
    };
  }

  /**
   * 根据国家代码获取国家名称
   */
  private getCountryName(code: string): string {
    const countries: Record<string, string> = {
      US: 'United States',
      GB: 'United Kingdom',
      CN: 'China',
      JP: 'Japan',
      SG: 'Singapore',
      HK: 'Hong Kong',
      DE: 'Germany',
      FR: 'France'
      // 可以添加更多国家
    };

    return countries[code] || code;
  }

  /**
   * 选择最佳路由
   */
  async selectBestRoute(resource: string): Promise<RoutingDecision> {
    // 检查缓存
    const cached = this.routingCache.get(resource);
    if (cached) {
      return cached;
    }

    // 获取地理位置
    const geo = await this.detectGeolocation();

    // 计算到每个节点的距离和延迟
    const rankedTargets = this.routeTargets
      .map(target => ({
        target,
        distance: this.calculateDistance(
          geo.latitude,
          geo.longitude,
          this.getNodeLocation(target.location)
        ),
        latency: 0
      }))
      .sort((a, b) => a.distance - b.distance);

    // 测试延迟
    await Promise.all(
      rankedTargets.map(async (item) => {
        item.latency = await this.measureLatency(item.target.url);
      })
    );

    // 根据延迟和健康分数重新排序
    rankedTargets.sort((a, b) => {
      const scoreA = a.latency * (100 / a.target.healthScore);
      const scoreB = b.latency * (100 / b.target.healthScore);
      return scoreA - scoreB;
    });

    const decision: RoutingDecision = {
      selectedTarget: rankedTargets[0].target,
      alternativeTargets: rankedTargets.slice(1, 3).map(r => r.target),
      latency: rankedTargets[0].latency,
      reason: `Nearest node with ${rankedTargets[0].latency.toFixed(0)}ms latency`
    };

    // 缓存决策（5分钟）
    this.routingCache.set(resource, decision);
    setTimeout(() => {
      this.routingCache.delete(resource);
    }, 300000);

    return decision;
  }

  /**
   * 获取节点的地理位置
   */
  private getNodeLocation(location: string): { lat: number; lng: number } {
    const locations: Record<string, { lat: number; lng: number }> = {
      'us-east-1': { lat: 40.7128, lng: -74.0060 },
      'us-west-1': { lat: 37.7749, lng: -122.4194 },
      'eu-west-1': { lat: 51.5074, lng: -0.1278 },
      'ap-southeast-1': { lat: 1.3521, lng: 103.8198 },
      'ap-northeast-1': { lat: 35.6762, lng: 139.6503 },
      'ap-east-1': { lat: 22.3193, lng: 114.1694 },
      'cn-north-1': { lat: 39.9042, lng: 116.4074 }
    };

    return locations[location] || { lat: 0, lng: 0 };
  }

  /**
   * 计算两点之间的距离（km）
   */
  private calculateDistance(lat1: number, lng1: number, target: { lat: number; lng: number }): number {
    const R = 6371; // 地球半径（km）
    const dLat = this.toRad(target.lat - lat1);
    const dLng = this.toRad(target.lng - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(target.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * 转换为弧度
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 测量延迟
   */
  private async measureLatency(url: string): Promise<number> {
    const start = performance.now();

    try {
      // 使用 HEAD 请求测试延迟
      await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });

      const latency = performance.now() - start;
      return latency;
    } catch (error) {
      // 如果请求失败，返回模拟延迟
      return 50 + Math.random() * 100;
    }
  }

  /**
   * 获取当前地理位置
   */
  getGeolocation(): GeolocationData | null {
    return this.geolocation;
  }

  /**
   * 清除路由缓存
   */
  clearCache(): void {
    this.routingCache.clear();
  }
}

// 单例实例
export const globalRouter = new GlobalRouter();
