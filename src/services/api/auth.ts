/**
 * Authentication API
 * User registration, login, and profile management
 */

import { apiRequest } from './client'

/**
 * User data structure
 */
export interface User {
  id: string
  email: string
  username: string
  avatar: string | null
  createdAt: string
}

/**
 * Authentication response with tokens
 */
export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

/**
 * Registration credentials
 */
export interface RegisterCredentials {
  email: string
  password: string
  username: string
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Authentication API methods
 */
export const authApi = {
  /**
   * Register new user
   * POST /auth/register
   */
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    return apiRequest.post<AuthResponse>('/auth/register', credentials)
  },

  /**
   * Login user
   * POST /auth/login
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiRequest.post<AuthResponse>('/auth/login', credentials)
  },

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    return apiRequest.post('/auth/refresh', { refreshToken })
  },

  /**
   * Get current user profile
   * GET /auth/me
   */
  getMe: async (): Promise<{ user: User }> => {
    return apiRequest.get('/auth/me')
  }
}
