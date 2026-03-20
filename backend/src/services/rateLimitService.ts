/**
 * Rate Limit Management Service
 * v2.5.0 Phase 3.2 - API Rate Limiting
 *
 * 速率限制管理服务
 */

import {
  getCurrentConfig,
  updateRateLimitConfig,
  RateLimitConfig,
} from '../config/rateLimitConfig';
import { getRateLimitStats, clearRateLimit } from '../middleware/rateLimiter';

export interface RateLimitSummary {
  enabled: boolean;
  store: 'memory' | 'redis';
  globalLimit: {
    windowMs: number;
    max: number;
  };
  ipLimit: {
    windowMs: number;
    max: number;
  };
  userLimit: {
    windowMs: number;
    max: number;
  };
  endpointCount: number;
  whitelistCount: number;
  blacklistCount: number;
}

export interface RateLimitActivity {
  identifier: string;
  type: 'ip' | 'user';
  endpoint: string;
  remaining: number;
  limit: number;
  reset: Date;
  timestamp: Date;
}

/**
 * Rate Limit管理服务类
 */
export class RateLimitService {
  private activityLog: RateLimitActivity[] = [];
  private maxLogSize = 1000;

  /**
   * 获取配置摘要
   */
  getSummary(): RateLimitSummary {
    const config = getCurrentConfig();

    return {
      enabled: config.enabled,
      store: config.store,
      globalLimit: {
        windowMs: config.global.windowMs,
        max: config.global.max,
      },
      ipLimit: {
        windowMs: config.byIP.windowMs,
        max: config.byIP.max,
      },
      userLimit: {
        windowMs: config.byUser.windowMs,
        max: config.byUser.max,
      },
      endpointCount: Object.keys(config.byEndpoint).length,
      whitelistCount: config.whitelist.length,
      blacklistCount: config.blacklist.length,
    };
  }

  /**
   * 获取完整配置
   */
  getConfig(): RateLimitConfig {
    return getCurrentConfig();
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<RateLimitConfig>): void {
    updateRateLimitConfig(updates);
    console.log('[RateLimitService] Configuration updated');
  }

  /**
   * 添加IP到白名单
   */
  addToWhitelist(ip: string): void {
    const config = getCurrentConfig();

    if (!config.whitelist.includes(ip)) {
      config.whitelist.push(ip);
      updateRateLimitConfig({ whitelist: config.whitelist });
      console.log(`[RateLimitService] Added ${ip} to whitelist`);
    }
  }

  /**
   * 从白名单移除IP
   */
  removeFromWhitelist(ip: string): void {
    const config = getCurrentConfig();
    const index = config.whitelist.indexOf(ip);

    if (index > -1) {
      config.whitelist.splice(index, 1);
      updateRateLimitConfig({ whitelist: config.whitelist });
      console.log(`[RateLimitService] Removed ${ip} from whitelist`);
    }
  }

  /**
   * 添加IP到黑名单
   */
  addToBlacklist(ip: string): void {
    const config = getCurrentConfig();

    if (!config.blacklist.includes(ip)) {
      config.blacklist.push(ip);
      updateRateLimitConfig({ blacklist: config.blacklist });
      console.log(`[RateLimitService] Added ${ip} to blacklist`);
    }
  }

  /**
   * 从黑名单移除IP
   */
  removeFromBlacklist(ip: string): void {
    const config = getCurrentConfig();
    const index = config.blacklist.indexOf(ip);

    if (index > -1) {
      config.blacklist.splice(index, 1);
      updateRateLimitConfig({ blacklist: config.blacklist });
      console.log(`[RateLimitService] Removed ${ip} from blacklist`);
    }
  }

  /**
   * 获取白名单
   */
  getWhitelist(): string[] {
    return getCurrentConfig().whitelist;
  }

  /**
   * 获取黑名单
   */
  getBlacklist(): string[] {
    return getCurrentConfig().blacklist;
  }

  /**
   * 检查IP是否在白名单
   */
  isWhitelisted(ip: string): boolean {
    return getCurrentConfig().whitelist.includes(ip);
  }

  /**
   * 检查IP是否在黑名单
   */
  isBlacklisted(ip: string): boolean {
    return getCurrentConfig().blacklist.includes(ip);
  }

  /**
   * 获取速率限制状态
   */
  async getStatus(identifier: string): Promise<{
    identifier: string;
    remaining: number;
    limit: number;
    reset: Date;
  } | null> {
    const stats = await getRateLimitStats(identifier);

    if (!stats) {
      return null;
    }

    return {
      identifier,
      ...stats,
    };
  }

  /**
   * 清除速率限制
   */
  async clearLimit(identifier: string): Promise<boolean> {
    const success = await clearRateLimit(identifier);

    if (success) {
      console.log(`[RateLimitService] Cleared limit for ${identifier}`);
    }

    return success;
  }

  /**
   * 记录活动
   */
  logActivity(activity: RateLimitActivity): void {
    this.activityLog.unshift(activity);

    // 限制日志大小
    if (this.activityLog.length > this.maxLogSize) {
      this.activityLog = this.activityLog.slice(0, this.maxLogSize);
    }
  }

  /**
   * 获取活动日志
   */
  getActivityLog(limit: number = 100): RateLimitActivity[] {
    return this.activityLog.slice(0, limit);
  }

  /**
   * 获取统计信息
   */
  getStatistics(): {
    totalRequests: number;
    uniqueIdentifiers: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
    topIdentifiers: Array<{ identifier: string; count: number }>;
  } {
    const endpointCounts = new Map<string, number>();
    const identifierCounts = new Map<string, number>();

    for (const activity of this.activityLog) {
      // 统计端点
      const currentCount = endpointCounts.get(activity.endpoint) || 0;
      endpointCounts.set(activity.endpoint, currentCount + 1);

      // 统计标识符
      const currentIdCount = identifierCounts.get(activity.identifier) || 0;
      identifierCounts.set(activity.identifier, currentIdCount + 1);
    }

    // 排序并获取Top 10
    const topEndpoints = Array.from(endpointCounts.entries())
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topIdentifiers = Array.from(identifierCounts.entries())
      .map(([identifier, count]) => ({ identifier, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalRequests: this.activityLog.length,
      uniqueIdentifiers: identifierCounts.size,
      topEndpoints,
      topIdentifiers,
    };
  }

  /**
   * 清除活动日志
   */
  clearActivityLog(): void {
    this.activityLog = [];
    console.log('[RateLimitService] Activity log cleared');
  }

  /**
   * 启用速率限制
   */
  enable(): void {
    updateRateLimitConfig({ enabled: true });
    console.log('[RateLimitService] Rate limiting enabled');
  }

  /**
   * 禁用速率限制
   */
  disable(): void {
    updateRateLimitConfig({ enabled: false });
    console.log('[RateLimitService] Rate limiting disabled');
  }

  /**
   * 切换存储类型
   */
  switchStore(store: 'memory' | 'redis'): void {
    updateRateLimitConfig({ store });
    console.log(`[RateLimitService] Switched to ${store} store`);
  }

  /**
   * 导出配置
   */
  exportConfig(): string {
    return JSON.stringify(getCurrentConfig(), null, 2);
  }

  /**
   * 导入配置
   */
  importConfig(configJson: string): void {
    try {
      const config = JSON.parse(configJson) as RateLimitConfig;
      updateRateLimitConfig(config);
      console.log('[RateLimitService] Configuration imported');
    } catch (error) {
      console.error('[RateLimitService] Failed to import configuration:', error);
      throw new Error('Invalid configuration JSON');
    }
  }

  /**
   * 重置为默认配置
   */
  resetToDefaults(): void {
    const { getRateLimitConfig } = require('../config/rateLimitConfig');
    const defaultConfig = getRateLimitConfig();
    updateRateLimitConfig(defaultConfig);
    console.log('[RateLimitService] Reset to default configuration');
  }
}

// 导出单例
export const rateLimitService = new RateLimitService();

export default rateLimitService;
