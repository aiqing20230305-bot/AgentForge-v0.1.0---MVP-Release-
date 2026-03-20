/**
 * Token Refresh Service
 * v2.5.0 Phase 1.3 - Token Auto-Refresh
 *
 * 处理JWT Token的生成、验证和刷新
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface TokenPayload {
  userId: string;
  email: string;
  name?: string;
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface RefreshTokenRecord {
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  lastUsedAt: Date;
  revoked: boolean;
  deviceInfo?: string;
}

/**
 * Token刷新服务类
 */
export class TokenRefreshService {
  // Refresh Token存储（实际应用中使用数据库）
  private refreshTokens: Map<string, RefreshTokenRecord> = new Map();

  // JWT密钥
  private accessTokenSecret: string;
  private refreshTokenSecret: string;

  // Token过期时间
  private accessTokenExpiry: string;
  private refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'access-secret-key';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key';
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';

    // 定期清理过期的refresh token
    setInterval(() => this.cleanupExpiredTokens(), 60 * 60 * 1000); // 每小时
  }

  /**
   * 生成Token对
   */
  generateTokenPair(
    userId: string,
    email: string,
    name?: string,
    deviceInfo?: string
  ): TokenPair {
    // 生成Access Token
    const accessToken = this.generateAccessToken(userId, email, name);

    // 生成Refresh Token
    const refreshToken = this.generateRefreshToken(userId, deviceInfo);

    // 计算过期时间（秒）
    const expiresIn = this.parseExpiry(this.accessTokenExpiry);
    const refreshExpiresIn = this.parseExpiry(this.refreshTokenExpiry);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      refreshExpiresIn,
    };
  }

  /**
   * 生成Access Token
   */
  private generateAccessToken(userId: string, email: string, name?: string): string {
    const payload: TokenPayload = {
      userId,
      email,
      name,
      type: 'access',
    };

    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
    });
  }

  /**
   * 生成Refresh Token
   */
  private generateRefreshToken(userId: string, deviceInfo?: string): string {
    // 生成随机token
    const tokenValue = crypto.randomBytes(32).toString('hex');

    // 创建JWT
    const payload: TokenPayload = {
      userId,
      email: '', // Refresh token不需要email
      type: 'refresh',
    };

    const token = jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry,
      jwtid: tokenValue,
    });

    // 存储refresh token记录
    const expiresIn = this.parseExpiry(this.refreshTokenExpiry);
    const record: RefreshTokenRecord = {
      token,
      userId,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      createdAt: new Date(),
      lastUsedAt: new Date(),
      revoked: false,
      deviceInfo,
    };

    this.refreshTokens.set(token, record);

    return token;
  }

  /**
   * 验证Access Token
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const payload = jwt.verify(token, this.accessTokenSecret) as TokenPayload;

      if (payload.type !== 'access') {
        return null;
      }

      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * 验证Refresh Token
   */
  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      // 验证JWT签名
      const payload = jwt.verify(token, this.refreshTokenSecret) as TokenPayload;

      if (payload.type !== 'refresh') {
        return null;
      }

      // 检查是否存在于存储中
      const record = this.refreshTokens.get(token);
      if (!record) {
        return null;
      }

      // 检查是否被撤销
      if (record.revoked) {
        return null;
      }

      // 检查是否过期
      if (record.expiresAt < new Date()) {
        this.refreshTokens.delete(token);
        return null;
      }

      // 更新最后使用时间
      record.lastUsedAt = new Date();

      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * 刷新Token
   */
  refreshTokenPair(
    refreshToken: string,
    deviceInfo?: string
  ): TokenPair | null {
    // 验证refresh token
    const payload = this.verifyRefreshToken(refreshToken);
    if (!payload) {
      return null;
    }

    // 撤销旧的refresh token
    this.revokeRefreshToken(refreshToken);

    // 获取用户信息（实际应用中从数据库获取）
    const userId = payload.userId;
    const email = ''; // 需要从数据库获取

    // 生成新的token对
    return this.generateTokenPair(userId, email, undefined, deviceInfo);
  }

  /**
   * 撤销Refresh Token
   */
  revokeRefreshToken(token: string): boolean {
    const record = this.refreshTokens.get(token);
    if (!record) {
      return false;
    }

    record.revoked = true;
    return true;
  }

  /**
   * 撤销用户的所有Refresh Token
   */
  revokeAllUserTokens(userId: string): number {
    let count = 0;

    for (const [token, record] of this.refreshTokens.entries()) {
      if (record.userId === userId && !record.revoked) {
        record.revoked = true;
        count++;
      }
    }

    return count;
  }

  /**
   * 获取用户的所有有效Refresh Token
   */
  getUserRefreshTokens(userId: string): RefreshTokenRecord[] {
    const tokens: RefreshTokenRecord[] = [];

    for (const record of this.refreshTokens.values()) {
      if (
        record.userId === userId &&
        !record.revoked &&
        record.expiresAt > new Date()
      ) {
        tokens.push(record);
      }
    }

    return tokens;
  }

  /**
   * 检查Token是否即将过期
   */
  isTokenExpiringSoon(token: string, thresholdMinutes: number = 5): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return true;
      }

      const expiresAt = decoded.exp * 1000; // 转换为毫秒
      const now = Date.now();
      const threshold = thresholdMinutes * 60 * 1000;

      return expiresAt - now < threshold;
    } catch (error) {
      return true;
    }
  }

  /**
   * 解析过期时间字符串为秒数
   */
  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 900; // 默认15分钟
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };

    return value * (multipliers[unit] || 60);
  }

  /**
   * 清理过期的Refresh Token
   */
  private cleanupExpiredTokens(): void {
    const now = new Date();
    let count = 0;

    for (const [token, record] of this.refreshTokens.entries()) {
      if (record.expiresAt < now || record.revoked) {
        this.refreshTokens.delete(token);
        count++;
      }
    }

    if (count > 0) {
      console.log(`[TokenRefreshService] Cleaned up ${count} expired/revoked tokens`);
    }
  }

  /**
   * 获取Token统计信息
   */
  getStatistics(): {
    totalTokens: number;
    activeTokens: number;
    revokedTokens: number;
    expiredTokens: number;
  } {
    const now = new Date();
    let activeTokens = 0;
    let revokedTokens = 0;
    let expiredTokens = 0;

    for (const record of this.refreshTokens.values()) {
      if (record.revoked) {
        revokedTokens++;
      } else if (record.expiresAt < now) {
        expiredTokens++;
      } else {
        activeTokens++;
      }
    }

    return {
      totalTokens: this.refreshTokens.size,
      activeTokens,
      revokedTokens,
      expiredTokens,
    };
  }

  /**
   * 清空所有Token（仅用于测试）
   */
  clearAll(): void {
    this.refreshTokens.clear();
  }
}

// 导出单例
export const tokenRefreshService = new TokenRefreshService();

export default tokenRefreshService;
