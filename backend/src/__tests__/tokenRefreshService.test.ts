/**
 * Token Refresh Service Tests
 * v2.5.0 Phase 1.3 - Token Auto-Refresh
 */

import jwt from 'jsonwebtoken';
import { TokenRefreshService, TokenPayload } from '../services/tokenRefreshService';

describe('TokenRefreshService', () => {
  let service: TokenRefreshService;

  beforeEach(() => {
    service = new TokenRefreshService();
    service.clearAll();

    // Mock环境变量
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRY = '15m';
    process.env.JWT_REFRESH_EXPIRY = '7d';
  });

  describe('generateTokenPair', () => {
    it('should generate valid token pair', () => {
      const tokenPair = service.generateTokenPair(
        'user123',
        'test@example.com',
        'Test User'
      );

      expect(tokenPair.accessToken).toBeTruthy();
      expect(tokenPair.refreshToken).toBeTruthy();
      expect(tokenPair.expiresIn).toBeGreaterThan(0);
      expect(tokenPair.refreshExpiresIn).toBeGreaterThan(0);
    });

    it('should generate different tokens each time', () => {
      const pair1 = service.generateTokenPair('user123', 'test@example.com');
      const pair2 = service.generateTokenPair('user123', 'test@example.com');

      expect(pair1.accessToken).not.toBe(pair2.accessToken);
      expect(pair1.refreshToken).not.toBe(pair2.refreshToken);
    });

    it('should include device info in refresh token record', () => {
      const deviceInfo = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      const tokenPair = service.generateTokenPair(
        'user123',
        'test@example.com',
        'Test User',
        deviceInfo
      );

      const tokens = service.getUserRefreshTokens('user123');
      expect(tokens).toHaveLength(1);
      expect(tokens[0].deviceInfo).toBe(deviceInfo);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const tokenPair = service.generateTokenPair(
        'user123',
        'test@example.com',
        'Test User'
      );

      const payload = service.verifyAccessToken(tokenPair.accessToken);

      expect(payload).toBeTruthy();
      expect(payload?.userId).toBe('user123');
      expect(payload?.email).toBe('test@example.com');
      expect(payload?.name).toBe('Test User');
      expect(payload?.type).toBe('access');
    });

    it('should reject invalid access token', () => {
      const payload = service.verifyAccessToken('invalid-token');
      expect(payload).toBeNull();
    });

    it('should reject refresh token as access token', () => {
      const tokenPair = service.generateTokenPair('user123', 'test@example.com');
      const payload = service.verifyAccessToken(tokenPair.refreshToken);
      expect(payload).toBeNull();
    });

    it('should reject expired access token', () => {
      // 创建已过期的token
      const expiredToken = jwt.sign(
        { userId: 'user123', email: 'test@example.com', type: 'access' },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: '0s' }
      );

      // 等待确保过期
      setTimeout(() => {
        const payload = service.verifyAccessToken(expiredToken);
        expect(payload).toBeNull();
      }, 100);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const tokenPair = service.generateTokenPair('user123', 'test@example.com');
      const payload = service.verifyRefreshToken(tokenPair.refreshToken);

      expect(payload).toBeTruthy();
      expect(payload?.userId).toBe('user123');
      expect(payload?.type).toBe('refresh');
    });

    it('should reject invalid refresh token', () => {
      const payload = service.verifyRefreshToken('invalid-token');
      expect(payload).toBeNull();
    });

    it('should reject access token as refresh token', () => {
      const tokenPair = service.generateTokenPair('user123', 'test@example.com');
      const payload = service.verifyRefreshToken(tokenPair.accessToken);
      expect(payload).toBeNull();
    });

    it('should reject revoked refresh token', () => {
      const tokenPair = service.generateTokenPair('user123', 'test@example.com');

      // 撤销token
      service.revokeRefreshToken(tokenPair.refreshToken);

      // 验证失败
      const payload = service.verifyRefreshToken(tokenPair.refreshToken);
      expect(payload).toBeNull();
    });
  });

  describe('refreshTokenPair', () => {
    it('should refresh token pair successfully', () => {
      const originalPair = service.generateTokenPair('user123', 'test@example.com');

      const newPair = service.refreshTokenPair(originalPair.refreshToken);

      expect(newPair).toBeTruthy();
      expect(newPair?.accessToken).toBeTruthy();
      expect(newPair?.refreshToken).toBeTruthy();
      expect(newPair?.accessToken).not.toBe(originalPair.accessToken);
      expect(newPair?.refreshToken).not.toBe(originalPair.refreshToken);
    });

    it('should revoke old refresh token after refresh', () => {
      const originalPair = service.generateTokenPair('user123', 'test@example.com');

      service.refreshTokenPair(originalPair.refreshToken);

      // 旧token应该被撤销
      const payload = service.verifyRefreshToken(originalPair.refreshToken);
      expect(payload).toBeNull();
    });

    it('should return null for invalid refresh token', () => {
      const newPair = service.refreshTokenPair('invalid-token');
      expect(newPair).toBeNull();
    });

    it('should return null for revoked refresh token', () => {
      const tokenPair = service.generateTokenPair('user123', 'test@example.com');
      service.revokeRefreshToken(tokenPair.refreshToken);

      const newPair = service.refreshTokenPair(tokenPair.refreshToken);
      expect(newPair).toBeNull();
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke refresh token successfully', () => {
      const tokenPair = service.generateTokenPair('user123', 'test@example.com');

      const success = service.revokeRefreshToken(tokenPair.refreshToken);

      expect(success).toBe(true);

      // 验证已被撤销
      const payload = service.verifyRefreshToken(tokenPair.refreshToken);
      expect(payload).toBeNull();
    });

    it('should return false for non-existent token', () => {
      const success = service.revokeRefreshToken('non-existent-token');
      expect(success).toBe(false);
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should revoke all user tokens', () => {
      // 生成多个token
      service.generateTokenPair('user123', 'test@example.com');
      service.generateTokenPair('user123', 'test@example.com');
      service.generateTokenPair('user123', 'test@example.com');

      const count = service.revokeAllUserTokens('user123');

      expect(count).toBe(3);

      // 验证所有token都被撤销
      const tokens = service.getUserRefreshTokens('user123');
      expect(tokens).toHaveLength(0);
    });

    it('should not revoke other users tokens', () => {
      service.generateTokenPair('user123', 'test1@example.com');
      service.generateTokenPair('user456', 'test2@example.com');

      service.revokeAllUserTokens('user123');

      const user456Tokens = service.getUserRefreshTokens('user456');
      expect(user456Tokens).toHaveLength(1);
    });

    it('should return 0 for user with no tokens', () => {
      const count = service.revokeAllUserTokens('non-existent-user');
      expect(count).toBe(0);
    });
  });

  describe('getUserRefreshTokens', () => {
    it('should return all user refresh tokens', () => {
      service.generateTokenPair('user123', 'test@example.com');
      service.generateTokenPair('user123', 'test@example.com');

      const tokens = service.getUserRefreshTokens('user123');

      expect(tokens).toHaveLength(2);
      expect(tokens.every((t) => t.userId === 'user123')).toBe(true);
    });

    it('should not return revoked tokens', () => {
      const pair1 = service.generateTokenPair('user123', 'test@example.com');
      service.generateTokenPair('user123', 'test@example.com');

      service.revokeRefreshToken(pair1.refreshToken);

      const tokens = service.getUserRefreshTokens('user123');
      expect(tokens).toHaveLength(1);
    });

    it('should return empty array for user with no tokens', () => {
      const tokens = service.getUserRefreshTokens('non-existent-user');
      expect(tokens).toEqual([]);
    });
  });

  describe('isTokenExpiringSoon', () => {
    it('should detect expiring token', () => {
      // 创建15秒后过期的token
      const shortLivedToken = jwt.sign(
        { userId: 'user123', type: 'access' },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: '15s' }
      );

      const expiringSoon = service.isTokenExpiringSoon(shortLivedToken, 1);
      expect(expiringSoon).toBe(true);
    });

    it('should not detect long-lived token', () => {
      const tokenPair = service.generateTokenPair('user123', 'test@example.com');
      const expiringSoon = service.isTokenExpiringSoon(tokenPair.accessToken, 5);
      expect(expiringSoon).toBe(false);
    });

    it('should return true for invalid token', () => {
      const expiringSoon = service.isTokenExpiringSoon('invalid-token');
      expect(expiringSoon).toBe(true);
    });
  });

  describe('getStatistics', () => {
    it('should return correct statistics', () => {
      // 生成一些token
      service.generateTokenPair('user1', 'test1@example.com');
      service.generateTokenPair('user2', 'test2@example.com');
      const pair3 = service.generateTokenPair('user3', 'test3@example.com');

      // 撤销一个
      service.revokeRefreshToken(pair3.refreshToken);

      const stats = service.getStatistics();

      expect(stats.totalTokens).toBe(3);
      expect(stats.activeTokens).toBe(2);
      expect(stats.revokedTokens).toBe(1);
    });

    it('should return zero statistics when empty', () => {
      const stats = service.getStatistics();

      expect(stats.totalTokens).toBe(0);
      expect(stats.activeTokens).toBe(0);
      expect(stats.revokedTokens).toBe(0);
    });
  });

  describe('Concurrent refresh', () => {
    it('should handle multiple refresh attempts', async () => {
      const tokenPair = service.generateTokenPair('user123', 'test@example.com');

      // 模拟并发刷新
      const refreshes = [
        service.refreshTokenPair(tokenPair.refreshToken),
        service.refreshTokenPair(tokenPair.refreshToken),
        service.refreshTokenPair(tokenPair.refreshToken),
      ];

      const results = await Promise.all(refreshes);

      // 只有第一个应该成功
      const successCount = results.filter((r) => r !== null).length;
      expect(successCount).toBe(1);
    });
  });
});
