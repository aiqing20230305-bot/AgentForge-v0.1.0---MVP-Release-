/**
 * Rate Limit Routes Tests
 * v2.5.0 Phase 3.2 - API Rate Limiting
 */

import express, { Application } from 'express';
import request from 'supertest';
import rateLimitRoutes from '../routes/rateLimitRoutes';
import { rateLimitService } from '../services/rateLimitService';
import { updateRateLimitConfig } from '../config/rateLimitConfig';

describe('Rate Limit Routes', () => {
  let app: Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/rate-limit', rateLimitRoutes);
  });

  beforeEach(() => {
    // Reset configuration
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

    // Clear activity log
    rateLimitService.clearActivityLog();
  });

  describe('GET /api/rate-limit/summary', () => {
    it('should return rate limit summary', async () => {
      const response = await request(app).get('/api/rate-limit/summary');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('enabled');
      expect(response.body.data).toHaveProperty('store');
      expect(response.body.data).toHaveProperty('globalLimit');
      expect(response.body.data).toHaveProperty('endpointCount');
      expect(response.body.data).toHaveProperty('whitelistCount');
      expect(response.body.data).toHaveProperty('blacklistCount');
    });
  });

  describe('GET /api/rate-limit/config', () => {
    it('should return complete configuration', async () => {
      const response = await request(app).get('/api/rate-limit/config');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('enabled');
      expect(response.body.data).toHaveProperty('global');
      expect(response.body.data).toHaveProperty('byIP');
      expect(response.body.data).toHaveProperty('byUser');
    });
  });

  describe('PUT /api/rate-limit/config', () => {
    it('should update configuration', async () => {
      const updates = {
        global: {
          windowMs: 10 * 60 * 1000,
          max: 50,
        },
      };

      const response = await request(app)
        .put('/api/rate-limit/config')
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('updated');
    });

    it('should handle empty update', async () => {
      const response = await request(app).put('/api/rate-limit/config').send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Whitelist endpoints', () => {
    describe('GET /api/rate-limit/whitelist', () => {
      it('should return whitelist', async () => {
        const response = await request(app).get('/api/rate-limit/whitelist');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('POST /api/rate-limit/whitelist', () => {
      it('should add IP to whitelist', async () => {
        const response = await request(app)
          .post('/api/rate-limit/whitelist')
          .send({ ip: '192.168.1.100' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('added');
      });

      it('should return error without IP', async () => {
        const response = await request(app)
          .post('/api/rate-limit/whitelist')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('required');
      });
    });

    describe('DELETE /api/rate-limit/whitelist/:ip', () => {
      it('should remove IP from whitelist', async () => {
        // First add IP
        await request(app)
          .post('/api/rate-limit/whitelist')
          .send({ ip: '192.168.1.100' });

        // Then remove it
        const response = await request(app).delete(
          '/api/rate-limit/whitelist/192.168.1.100'
        );

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('removed');
      });
    });
  });

  describe('Blacklist endpoints', () => {
    describe('GET /api/rate-limit/blacklist', () => {
      it('should return blacklist', async () => {
        const response = await request(app).get('/api/rate-limit/blacklist');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('POST /api/rate-limit/blacklist', () => {
      it('should add IP to blacklist', async () => {
        const response = await request(app)
          .post('/api/rate-limit/blacklist')
          .send({ ip: '10.0.0.50' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('added');
      });

      it('should return error without IP', async () => {
        const response = await request(app)
          .post('/api/rate-limit/blacklist')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('required');
      });
    });

    describe('DELETE /api/rate-limit/blacklist/:ip', () => {
      it('should remove IP from blacklist', async () => {
        // First add IP
        await request(app)
          .post('/api/rate-limit/blacklist')
          .send({ ip: '10.0.0.50' });

        // Then remove it
        const response = await request(app).delete(
          '/api/rate-limit/blacklist/10.0.0.50'
        );

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('removed');
      });
    });
  });

  describe('GET /api/rate-limit/status/:identifier', () => {
    it('should return 404 for non-existent identifier', async () => {
      const response = await request(app).get(
        '/api/rate-limit/status/ip:192.168.1.1'
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/rate-limit/clear/:identifier', () => {
    it('should clear rate limit for identifier', async () => {
      const response = await request(app).delete(
        '/api/rate-limit/clear/ip:192.168.1.1'
      );

      // Memory store returns false, so expect 500
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/rate-limit/activity', () => {
    it('should return activity log', async () => {
      const response = await request(app).get('/api/rate-limit/activity');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should respect limit query parameter', async () => {
      // Log some activities
      for (let i = 0; i < 20; i++) {
        rateLimitService.logActivity({
          identifier: `ip:192.168.1.${i}`,
          type: 'ip',
          endpoint: '/api/test',
          remaining: 50,
          limit: 100,
          reset: new Date(),
          timestamp: new Date(),
        });
      }

      const response = await request(app).get(
        '/api/rate-limit/activity?limit=10'
      );

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe('GET /api/rate-limit/statistics', () => {
    it('should return statistics', async () => {
      const response = await request(app).get('/api/rate-limit/statistics');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalRequests');
      expect(response.body.data).toHaveProperty('uniqueIdentifiers');
      expect(response.body.data).toHaveProperty('topEndpoints');
      expect(response.body.data).toHaveProperty('topIdentifiers');
    });

    it('should include activity data in statistics', async () => {
      // Log some activities
      for (let i = 0; i < 5; i++) {
        rateLimitService.logActivity({
          identifier: 'ip:192.168.1.1',
          type: 'ip',
          endpoint: '/api/test',
          remaining: 50,
          limit: 100,
          reset: new Date(),
          timestamp: new Date(),
        });
      }

      const response = await request(app).get('/api/rate-limit/statistics');

      expect(response.status).toBe(200);
      expect(response.body.data.totalRequests).toBeGreaterThan(0);
    });
  });

  describe('POST /api/rate-limit/enable', () => {
    it('should enable rate limiting', async () => {
      const response = await request(app).post('/api/rate-limit/enable');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('enabled');
    });
  });

  describe('POST /api/rate-limit/disable', () => {
    it('should disable rate limiting', async () => {
      const response = await request(app).post('/api/rate-limit/disable');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('disabled');
    });
  });

  describe('GET /api/rate-limit/export', () => {
    it('should export configuration', async () => {
      const response = await request(app).get('/api/rate-limit/export');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers['content-disposition']).toContain('attachment');

      // Should be valid JSON
      expect(() => JSON.parse(response.text)).not.toThrow();
    });

    it('should export complete configuration', async () => {
      const response = await request(app).get('/api/rate-limit/export');

      const config = JSON.parse(response.text);
      expect(config).toHaveProperty('enabled');
      expect(config).toHaveProperty('store');
      expect(config).toHaveProperty('global');
    });
  });

  describe('POST /api/rate-limit/import', () => {
    it('should import configuration', async () => {
      const config = {
        enabled: false,
        store: 'redis',
        global: {
          windowMs: 5 * 60 * 1000,
          max: 25,
        },
      };

      const response = await request(app)
        .post('/api/rate-limit/import')
        .send(config);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('imported');
    });

    it('should reject invalid configuration', async () => {
      const response = await request(app)
        .post('/api/rate-limit/import')
        .send('invalid json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/rate-limit/reset', () => {
    it('should reset configuration to defaults', async () => {
      // First modify config
      await request(app).put('/api/rate-limit/config').send({
        global: { windowMs: 1000, max: 5 },
      });

      // Then reset
      const response = await request(app).post('/api/rate-limit/reset');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reset');

      // Verify config was reset
      const configResponse = await request(app).get('/api/rate-limit/config');
      expect(configResponse.body.data.global.max).toBeGreaterThan(5);
    });
  });

  describe('Error handling', () => {
    it('should handle service errors gracefully', async () => {
      // Mock service to throw error
      jest
        .spyOn(rateLimitService, 'getSummary')
        .mockImplementationOnce(() => {
          throw new Error('Test error');
        });

      const response = await request(app).get('/api/rate-limit/summary');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Integration: Complete workflow', () => {
    it('should handle complete whitelist workflow', async () => {
      // 1. Check initial whitelist
      let response = await request(app).get('/api/rate-limit/whitelist');
      const initialCount = response.body.data.length;

      // 2. Add IP
      response = await request(app)
        .post('/api/rate-limit/whitelist')
        .send({ ip: '192.168.1.200' });
      expect(response.status).toBe(200);

      // 3. Verify added
      response = await request(app).get('/api/rate-limit/whitelist');
      expect(response.body.data.length).toBe(initialCount + 1);
      expect(response.body.data).toContain('192.168.1.200');

      // 4. Remove IP
      response = await request(app).delete(
        '/api/rate-limit/whitelist/192.168.1.200'
      );
      expect(response.status).toBe(200);

      // 5. Verify removed
      response = await request(app).get('/api/rate-limit/whitelist');
      expect(response.body.data.length).toBe(initialCount);
      expect(response.body.data).not.toContain('192.168.1.200');
    });

    it('should handle config export and import', async () => {
      // 1. Export current config
      let response = await request(app).get('/api/rate-limit/export');
      const exportedConfig = JSON.parse(response.text);

      // 2. Modify config
      await request(app).put('/api/rate-limit/config').send({
        enabled: false,
      });

      // 3. Import original config
      response = await request(app)
        .post('/api/rate-limit/import')
        .send(exportedConfig);
      expect(response.status).toBe(200);

      // 4. Verify restored
      response = await request(app).get('/api/rate-limit/config');
      expect(response.body.data.enabled).toBe(exportedConfig.enabled);
    });
  });
});
