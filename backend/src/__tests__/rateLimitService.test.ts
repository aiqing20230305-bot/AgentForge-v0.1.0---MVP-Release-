/**
 * Rate Limit Service Tests
 * v2.5.0 Phase 3.2 - API Rate Limiting
 */

import { RateLimitService, rateLimitService } from '../services/rateLimitService';
import { updateRateLimitConfig, getCurrentConfig } from '../config/rateLimitConfig';

describe('RateLimitService', () => {
  let service: RateLimitService;

  beforeEach(() => {
    service = new RateLimitService();

    // 重置配置
    updateRateLimitConfig({
      enabled: true,
      store: 'memory',
      whitelist: ['127.0.0.1'],
      blacklist: [],
      global: {
        windowMs: 15 * 60 * 1000,
        max: 100,
      },
      byIP: {
        windowMs: 60 * 60 * 1000,
        max: 50,
      },
      byUser: {
        windowMs: 60 * 60 * 1000,
        max: 200,
      },
      byEndpoint: {},
    });
  });

  describe('getSummary', () => {
    it('should return rate limit summary', () => {
      const summary = service.getSummary();

      expect(summary).toHaveProperty('enabled', true);
      expect(summary).toHaveProperty('store', 'memory');
      expect(summary.globalLimit).toEqual({
        windowMs: 15 * 60 * 1000,
        max: 100,
      });
      expect(summary.ipLimit).toEqual({
        windowMs: 60 * 60 * 1000,
        max: 50,
      });
      expect(summary.userLimit).toEqual({
        windowMs: 60 * 60 * 1000,
        max: 200,
      });
      expect(summary.whitelistCount).toBe(1);
      expect(summary.blacklistCount).toBe(0);
    });

    it('should reflect configuration changes', () => {
      updateRateLimitConfig({
        whitelist: ['127.0.0.1', '192.168.1.1'],
        blacklist: ['10.0.0.1'],
      });

      const summary = service.getSummary();

      expect(summary.whitelistCount).toBe(2);
      expect(summary.blacklistCount).toBe(1);
    });
  });

  describe('getConfig', () => {
    it('should return complete configuration', () => {
      const config = service.getConfig();

      expect(config).toHaveProperty('enabled');
      expect(config).toHaveProperty('store');
      expect(config).toHaveProperty('global');
      expect(config).toHaveProperty('byIP');
      expect(config).toHaveProperty('byUser');
      expect(config).toHaveProperty('byEndpoint');
      expect(config).toHaveProperty('whitelist');
      expect(config).toHaveProperty('blacklist');
    });
  });

  describe('updateConfig', () => {
    it('should update configuration', () => {
      service.updateConfig({
        global: {
          windowMs: 10 * 60 * 1000,
          max: 50,
        },
      });

      const config = getCurrentConfig();
      expect(config.global.windowMs).toBe(10 * 60 * 1000);
      expect(config.global.max).toBe(50);
    });

    it('should update multiple fields', () => {
      service.updateConfig({
        enabled: false,
        store: 'redis',
      });

      const config = getCurrentConfig();
      expect(config.enabled).toBe(false);
      expect(config.store).toBe('redis');
    });
  });

  describe('Whitelist management', () => {
    it('should add IP to whitelist', () => {
      service.addToWhitelist('192.168.1.100');

      const whitelist = service.getWhitelist();
      expect(whitelist).toContain('192.168.1.100');
    });

    it('should not add duplicate IP to whitelist', () => {
      service.addToWhitelist('192.168.1.100');
      service.addToWhitelist('192.168.1.100');

      const whitelist = service.getWhitelist();
      const count = whitelist.filter((ip) => ip === '192.168.1.100').length;
      expect(count).toBe(1);
    });

    it('should remove IP from whitelist', () => {
      service.addToWhitelist('192.168.1.100');
      service.removeFromWhitelist('192.168.1.100');

      const whitelist = service.getWhitelist();
      expect(whitelist).not.toContain('192.168.1.100');
    });

    it('should handle removing non-existent IP', () => {
      const beforeCount = service.getWhitelist().length;
      service.removeFromWhitelist('10.0.0.99');
      const afterCount = service.getWhitelist().length;

      expect(afterCount).toBe(beforeCount);
    });

    it('should check if IP is whitelisted', () => {
      service.addToWhitelist('192.168.1.100');

      expect(service.isWhitelisted('192.168.1.100')).toBe(true);
      expect(service.isWhitelisted('10.0.0.1')).toBe(false);
    });
  });

  describe('Blacklist management', () => {
    it('should add IP to blacklist', () => {
      service.addToBlacklist('10.0.0.50');

      const blacklist = service.getBlacklist();
      expect(blacklist).toContain('10.0.0.50');
    });

    it('should not add duplicate IP to blacklist', () => {
      service.addToBlacklist('10.0.0.50');
      service.addToBlacklist('10.0.0.50');

      const blacklist = service.getBlacklist();
      const count = blacklist.filter((ip) => ip === '10.0.0.50').length;
      expect(count).toBe(1);
    });

    it('should remove IP from blacklist', () => {
      service.addToBlacklist('10.0.0.50');
      service.removeFromBlacklist('10.0.0.50');

      const blacklist = service.getBlacklist();
      expect(blacklist).not.toContain('10.0.0.50');
    });

    it('should check if IP is blacklisted', () => {
      service.addToBlacklist('10.0.0.50');

      expect(service.isBlacklisted('10.0.0.50')).toBe(true);
      expect(service.isBlacklisted('192.168.1.1')).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('should return null for memory store', async () => {
      const status = await service.getStatus('ip:192.168.1.1');
      expect(status).toBeNull();
    });

    it('should handle various identifier formats', async () => {
      const ipStatus = await service.getStatus('ip:192.168.1.1');
      const userStatus = await service.getStatus('user:123');

      expect(ipStatus).toBeNull();
      expect(userStatus).toBeNull();
    });
  });

  describe('clearLimit', () => {
    it('should return false for memory store', async () => {
      const result = await service.clearLimit('ip:192.168.1.1');
      expect(result).toBe(false);
    });
  });

  describe('Activity logging', () => {
    it('should log activity', () => {
      const activity = {
        identifier: 'ip:192.168.1.1',
        type: 'ip' as const,
        endpoint: '/api/test',
        remaining: 45,
        limit: 50,
        reset: new Date(),
        timestamp: new Date(),
      };

      service.logActivity(activity);

      const log = service.getActivityLog(10);
      expect(log).toHaveLength(1);
      expect(log[0]).toMatchObject({
        identifier: 'ip:192.168.1.1',
        endpoint: '/api/test',
      });
    });

    it('should limit log size', () => {
      // Log more than maxLogSize (1000) activities
      for (let i = 0; i < 1100; i++) {
        service.logActivity({
          identifier: `ip:192.168.1.${i % 255}`,
          type: 'ip',
          endpoint: '/api/test',
          remaining: 50,
          limit: 100,
          reset: new Date(),
          timestamp: new Date(),
        });
      }

      const log = service.getActivityLog(2000);
      expect(log.length).toBeLessThanOrEqual(1000);
    });

    it('should return limited log entries', () => {
      // Log 50 activities
      for (let i = 0; i < 50; i++) {
        service.logActivity({
          identifier: `ip:192.168.1.${i}`,
          type: 'ip',
          endpoint: '/api/test',
          remaining: 50,
          limit: 100,
          reset: new Date(),
          timestamp: new Date(),
        });
      }

      const log = service.getActivityLog(10);
      expect(log).toHaveLength(10);
    });

    it('should clear activity log', () => {
      service.logActivity({
        identifier: 'ip:192.168.1.1',
        type: 'ip',
        endpoint: '/api/test',
        remaining: 50,
        limit: 100,
        reset: new Date(),
        timestamp: new Date(),
      });

      service.clearActivityLog();

      const log = service.getActivityLog();
      expect(log).toHaveLength(0);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      // Log sample activities
      for (let i = 0; i < 10; i++) {
        service.logActivity({
          identifier: 'ip:192.168.1.1',
          type: 'ip',
          endpoint: '/api/agents',
          remaining: 50,
          limit: 100,
          reset: new Date(),
          timestamp: new Date(),
        });
      }

      for (let i = 0; i < 5; i++) {
        service.logActivity({
          identifier: 'ip:192.168.1.2',
          type: 'ip',
          endpoint: '/api/tasks',
          remaining: 50,
          limit: 100,
          reset: new Date(),
          timestamp: new Date(),
        });
      }

      for (let i = 0; i < 3; i++) {
        service.logActivity({
          identifier: 'user:user123',
          type: 'user',
          endpoint: '/api/agents',
          remaining: 150,
          limit: 200,
          reset: new Date(),
          timestamp: new Date(),
        });
      }
    });

    it('should return statistics', () => {
      const stats = service.getStatistics();

      expect(stats.totalRequests).toBe(18);
      expect(stats.uniqueIdentifiers).toBe(3);
    });

    it('should return top endpoints', () => {
      const stats = service.getStatistics();

      expect(stats.topEndpoints).toBeDefined();
      expect(stats.topEndpoints.length).toBeGreaterThan(0);
      expect(stats.topEndpoints[0]).toHaveProperty('endpoint');
      expect(stats.topEndpoints[0]).toHaveProperty('count');

      // Most frequent endpoint should be /api/agents (13 requests)
      expect(stats.topEndpoints[0].endpoint).toBe('/api/agents');
      expect(stats.topEndpoints[0].count).toBe(13);
    });

    it('should return top identifiers', () => {
      const stats = service.getStatistics();

      expect(stats.topIdentifiers).toBeDefined();
      expect(stats.topIdentifiers.length).toBeGreaterThan(0);
      expect(stats.topIdentifiers[0]).toHaveProperty('identifier');
      expect(stats.topIdentifiers[0]).toHaveProperty('count');

      // Most frequent identifier should be ip:192.168.1.1 (10 requests)
      expect(stats.topIdentifiers[0].identifier).toBe('ip:192.168.1.1');
      expect(stats.topIdentifiers[0].count).toBe(10);
    });

    it('should limit top results to 10', () => {
      // Log activities from 20 different endpoints
      for (let i = 0; i < 20; i++) {
        service.logActivity({
          identifier: 'ip:192.168.1.1',
          type: 'ip',
          endpoint: `/api/endpoint${i}`,
          remaining: 50,
          limit: 100,
          reset: new Date(),
          timestamp: new Date(),
        });
      }

      const stats = service.getStatistics();

      expect(stats.topEndpoints.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Enable/Disable', () => {
    it('should enable rate limiting', () => {
      updateRateLimitConfig({ enabled: false });

      service.enable();

      const config = getCurrentConfig();
      expect(config.enabled).toBe(true);
    });

    it('should disable rate limiting', () => {
      updateRateLimitConfig({ enabled: true });

      service.disable();

      const config = getCurrentConfig();
      expect(config.enabled).toBe(false);
    });
  });

  describe('Store switching', () => {
    it('should switch to memory store', () => {
      service.switchStore('memory');

      const config = getCurrentConfig();
      expect(config.store).toBe('memory');
    });

    it('should switch to redis store', () => {
      service.switchStore('redis');

      const config = getCurrentConfig();
      expect(config.store).toBe('redis');
    });
  });

  describe('Export/Import', () => {
    it('should export configuration as JSON', () => {
      const exported = service.exportConfig();

      expect(typeof exported).toBe('string');
      expect(() => JSON.parse(exported)).not.toThrow();

      const parsed = JSON.parse(exported);
      expect(parsed).toHaveProperty('enabled');
      expect(parsed).toHaveProperty('store');
    });

    it('should import configuration from JSON', () => {
      const configJson = JSON.stringify({
        enabled: false,
        store: 'redis',
        global: {
          windowMs: 5 * 60 * 1000,
          max: 25,
        },
      });

      service.importConfig(configJson);

      const config = getCurrentConfig();
      expect(config.enabled).toBe(false);
      expect(config.store).toBe('redis');
      expect(config.global.max).toBe(25);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => {
        service.importConfig('invalid json');
      }).toThrow('Invalid configuration JSON');
    });
  });

  describe('Reset to defaults', () => {
    it('should reset configuration to defaults', () => {
      // Modify config
      service.updateConfig({
        enabled: false,
        global: { windowMs: 1000, max: 5 },
      });

      // Reset
      service.resetToDefaults();

      const config = getCurrentConfig();
      expect(config.enabled).toBe(true);
      expect(config.global.max).toBeGreaterThan(5);
    });
  });

  describe('Singleton instance', () => {
    it('should export singleton instance', () => {
      expect(rateLimitService).toBeInstanceOf(RateLimitService);
    });

    it('should maintain state across imports', () => {
      rateLimitService.addToWhitelist('test-ip-singleton');

      const whitelist = rateLimitService.getWhitelist();
      expect(whitelist).toContain('test-ip-singleton');

      // Clean up
      rateLimitService.removeFromWhitelist('test-ip-singleton');
    });
  });
});
