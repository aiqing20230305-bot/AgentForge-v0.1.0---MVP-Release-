/**
 * useTokenRefresh Hook
 * v2.5.0 Phase 1.3 - Token Auto-Refresh
 *
 * React Hook for automatic token refresh
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { tokenManager } from '../utils/tokenManager';

export interface UseTokenRefreshOptions {
  /**
   * 检查Token的时间间隔（毫秒）
   * @default 60000 (1分钟)
   */
  checkInterval?: number;

  /**
   * Token即将过期的阈值（分钟）
   * @default 5
   */
  expiryThreshold?: number;

  /**
   * 是否在挂载时立即检查
   * @default true
   */
  checkOnMount?: boolean;

  /**
   * 是否启用自动刷新
   * @default true
   */
  enabled?: boolean;

  /**
   * Token刷新成功回调
   */
  onRefreshSuccess?: (accessToken: string) => void;

  /**
   * Token刷新失败回调
   */
  onRefreshError?: (error: Error) => void;

  /**
   * Token过期回调（无法刷新时）
   */
  onTokenExpired?: () => void;
}

export interface UseTokenRefreshReturn {
  /**
   * 是否已认证
   */
  isAuthenticated: boolean;

  /**
   * 是否正在刷新Token
   */
  isRefreshing: boolean;

  /**
   * Token剩余时间（秒）
   */
  timeToExpiry: number;

  /**
   * 手动刷新Token
   */
  refreshToken: () => Promise<void>;

  /**
   * 登出（清除Token）
   */
  logout: () => void;
}

/**
 * Token自动刷新Hook
 */
export function useTokenRefresh(
  options: UseTokenRefreshOptions = {}
): UseTokenRefreshReturn {
  const {
    checkInterval = 60000, // 1分钟
    expiryThreshold = 5, // 5分钟
    checkOnMount = true,
    enabled = true,
    onRefreshSuccess,
    onRefreshError,
    onTokenExpired,
  } = options;

  const [isAuthenticated, setIsAuthenticated] = useState(
    tokenManager.isAuthenticated()
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeToExpiry, setTimeToExpiry] = useState(tokenManager.getTimeToExpiry());

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 检查并刷新Token
   */
  const checkAndRefresh = useCallback(async () => {
    if (!enabled) return;

    // 更新剩余时间
    const remaining = tokenManager.getTimeToExpiry();
    setTimeToExpiry(remaining);

    // 检查是否已认证
    const authenticated = tokenManager.isAuthenticated();
    setIsAuthenticated(authenticated);

    if (!authenticated) {
      onTokenExpired?.();
      return;
    }

    // 检查是否需要刷新
    if (tokenManager.isTokenExpiringSoon(expiryThreshold)) {
      try {
        setIsRefreshing(true);
        const newAccessToken = await tokenManager.refreshToken();
        setIsAuthenticated(true);
        onRefreshSuccess?.(newAccessToken);
      } catch (error) {
        console.error('Token refresh failed:', error);
        setIsAuthenticated(false);
        onRefreshError?.(error as Error);
        onTokenExpired?.();
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [enabled, expiryThreshold, onRefreshSuccess, onRefreshError, onTokenExpired]);

  /**
   * 手动刷新Token
   */
  const refreshToken = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const newAccessToken = await tokenManager.refreshToken();
      setIsAuthenticated(true);
      setTimeToExpiry(tokenManager.getTimeToExpiry());
      onRefreshSuccess?.(newAccessToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
      setIsAuthenticated(false);
      onRefreshError?.(error as Error);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefreshSuccess, onRefreshError]);

  /**
   * 登出
   */
  const logout = useCallback(() => {
    tokenManager.clearTokens();
    setIsAuthenticated(false);
    setTimeToExpiry(0);
  }, []);

  /**
   * 设置定时检查
   */
  useEffect(() => {
    if (!enabled) return;

    // 初始检查
    if (checkOnMount) {
      checkAndRefresh();
    }

    // 定时检查
    intervalRef.current = setInterval(() => {
      checkAndRefresh();
    }, checkInterval);

    // 监听Token更新
    const unsubscribe = tokenManager.addListener((accessToken) => {
      setIsAuthenticated(!!accessToken);
      setTimeToExpiry(tokenManager.getTimeToExpiry());
    });

    // 清理
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      unsubscribe();
    };
  }, [enabled, checkInterval, checkOnMount, checkAndRefresh]);

  return {
    isAuthenticated,
    isRefreshing,
    timeToExpiry,
    refreshToken,
    logout,
  };
}

export default useTokenRefresh;
