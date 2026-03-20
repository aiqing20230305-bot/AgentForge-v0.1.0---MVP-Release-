/**
 * Axios Interceptor with Auto Token Refresh
 * v2.5.0 Phase 1.3 - Token Auto-Refresh
 *
 * Axios拦截器，自动处理Token刷新
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenManager } from './tokenManager';

/**
 * 创建配置了自动Token刷新的Axios实例
 */
export function createAxiosInstance(baseURL?: string): AxiosInstance {
  const instance = axios.create({
    baseURL: baseURL || import.meta.env.VITE_API_URL || 'http://localhost:5000',
    timeout: 30000,
  });

  // 请求拦截器：添加Token
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // 跳过Token刷新端点
      if (config.url?.includes('/api/auth/token/refresh')) {
        return config;
      }

      // 检查Token是否即将过期
      if (tokenManager.isTokenExpiringSoon(5)) {
        try {
          await tokenManager.refreshToken();
        } catch (error) {
          console.error('Failed to refresh token:', error);
          // 刷新失败，继续使用旧Token
        }
      }

      // 添加Access Token到请求头
      const accessToken = tokenManager.getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 响应拦截器：处理401错误
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // 如果是401错误且未重试过
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // 尝试刷新Token
          const newAccessToken = await tokenManager.refreshToken();

          // 更新请求头
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // 重试原请求
          return instance(originalRequest);
        } catch (refreshError) {
          // 刷新失败，清除Token并跳转到登录页
          tokenManager.clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
}

// 默认实例
export const apiClient = createAxiosInstance();

export default apiClient;
