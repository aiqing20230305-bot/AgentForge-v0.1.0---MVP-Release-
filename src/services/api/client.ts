/**
 * API Client Configuration
 * Axios HTTP client with JWT authentication and error handling
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'
const TOKEN_KEY = 'agentforge_access_token'
const REFRESH_TOKEN_KEY = 'agentforge_refresh_token'

/**
 * Token Manager
 * Handles JWT token storage and retrieval
 */
export class TokenManager {
  static getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }

  static clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  static hasValidToken(): boolean {
    return !!this.getAccessToken()
  }
}

/**
 * API Error Response
 */
export interface ApiError {
  success: false
  message: string
  statusCode?: number
  stack?: string
}

/**
 * API Success Response
 */
export interface ApiResponse<T = any> {
  success: true
  message?: string
  data: T
  count?: number
}

/**
 * Create configured Axios instance
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // Request interceptor - Add JWT token to headers
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = TokenManager.getAccessToken()
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error: AxiosError) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor - Handle errors and token refresh
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

      // Handle 401 Unauthorized - Token expired
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          // Try to refresh token
          const refreshToken = TokenManager.getRefreshToken()
          if (!refreshToken) {
            throw new Error('No refresh token available')
          }

          const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken }
          )

          const { accessToken, refreshToken: newRefreshToken } = response.data.data
          TokenManager.setTokens(accessToken, newRefreshToken)

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
          }
          return instance(originalRequest)
        } catch (refreshError) {
          // Refresh failed - clear tokens and redirect to login
          TokenManager.clearTokens()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }

      // Handle other errors
      const apiError: ApiError = {
        success: false,
        message: error.response?.data?.message || error.message || 'An error occurred',
        statusCode: error.response?.status
      }

      return Promise.reject(apiError)
    }
  )

  return instance
}

/**
 * API Client singleton instance
 */
export const apiClient = createAxiosInstance()

/**
 * Typed API request wrapper
 */
export const apiRequest = {
  /**
   * GET request
   */
  get: async <T = any>(url: string, params?: Record<string, any>): Promise<T> => {
    const response = await apiClient.get<ApiResponse<T>>(url, { params })
    return response.data.data
  },

  /**
   * POST request
   */
  post: async <T = any>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.post<ApiResponse<T>>(url, data)
    return response.data.data
  },

  /**
   * PUT request
   */
  put: async <T = any>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.put<ApiResponse<T>>(url, data)
    return response.data.data
  },

  /**
   * PATCH request
   */
  patch: async <T = any>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.patch<ApiResponse<T>>(url, data)
    return response.data.data
  },

  /**
   * DELETE request
   */
  delete: async <T = any>(url: string): Promise<T> => {
    const response = await apiClient.delete<ApiResponse<T>>(url)
    return response.data.data
  }
}

/**
 * API Error Handler
 * Convert API errors to user-friendly messages
 */
export const handleApiError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const apiError = error as ApiError
    return apiError.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred'
}

/**
 * Check if error is API error
 */
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'success' in error &&
    (error as ApiError).success === false
  )
}

/**
 * Retry failed request
 */
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }

  throw lastError
}
