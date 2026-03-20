/**
 * Token Manager
 * v2.5.0 Phase 1.3 - Token Auto-Refresh
 *
 * 前端Token管理工具
 */

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
}

/**
 * Token管理类
 */
export class TokenManager {
  private static instance: TokenManager;

  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';
  private expiresAtKey = 'token_expires_at';

  // Token刷新状态
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  // Token更新监听器
  private listeners: Array<(accessToken: string | null) => void> = [];

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * 保存Token
   */
  saveTokens(tokenData: TokenData): void {
    const expiresAt = Date.now() + tokenData.expiresIn * 1000;

    localStorage.setItem(this.accessTokenKey, tokenData.accessToken);
    localStorage.setItem(this.refreshTokenKey, tokenData.refreshToken);
    localStorage.setItem(this.expiresAtKey, expiresAt.toString());

    // 通知监听器
    this.notifyListeners(tokenData.accessToken);
  }

  /**
   * 获取Access Token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  /**
   * 获取Refresh Token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * 获取Token过期时间
   */
  getExpiresAt(): number | null {
    const expiresAt = localStorage.getItem(this.expiresAtKey);
    return expiresAt ? parseInt(expiresAt) : null;
  }

  /**
   * 检查Token是否过期
   */
  isTokenExpired(): boolean {
    const expiresAt = this.getExpiresAt();
    if (!expiresAt) {
      return true;
    }

    return Date.now() >= expiresAt;
  }

  /**
   * 检查Token是否即将过期
   */
  isTokenExpiringSoon(thresholdMinutes: number = 5): boolean {
    const expiresAt = this.getExpiresAt();
    if (!expiresAt) {
      return true;
    }

    const threshold = thresholdMinutes * 60 * 1000;
    return expiresAt - Date.now() < threshold;
  }

  /**
   * 刷新Token
   */
  async refreshToken(): Promise<string> {
    // 如果正在刷新，返回现有的Promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    // 创建新的刷新Promise
    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh();

    try {
      const accessToken = await this.refreshPromise;
      return accessToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * 执行Token刷新
   */
  private async performRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/token/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Token refresh failed');
      }

      // 保存新Token
      this.saveTokens({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        expiresIn: data.data.expiresIn,
        expiresAt: Date.now() + data.data.expiresIn * 1000,
      });

      return data.data.accessToken;
    } catch (error) {
      // 刷新失败，清除Token
      this.clearTokens();
      throw error;
    }
  }

  /**
   * 清除所有Token
   */
  clearTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.expiresAtKey);

    // 通知监听器
    this.notifyListeners(null);
  }

  /**
   * 添加Token更新监听器
   */
  addListener(listener: (accessToken: string | null) => void): () => void {
    this.listeners.push(listener);

    // 返回移除监听器的函数
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(accessToken: string | null): void {
    this.listeners.forEach((listener) => {
      try {
        listener(accessToken);
      } catch (error) {
        console.error('Token listener error:', error);
      }
    });
  }

  /**
   * 获取Token剩余时间（秒）
   */
  getTimeToExpiry(): number {
    const expiresAt = this.getExpiresAt();
    if (!expiresAt) {
      return 0;
    }

    const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    return remaining;
  }

  /**
   * 检查是否已登录
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !this.isTokenExpired();
  }
}

// 导出单例实例
export const tokenManager = TokenManager.getInstance();

export default tokenManager;
