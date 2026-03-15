/**
 * useAuth Hook
 * Authentication state management and operations
 */

import { useState, useEffect, useCallback } from 'react'
import { authApi, TokenManager, User, LoginCredentials, RegisterCredentials, handleApiError } from '../services/api'
import { getSocketClient } from '../services/socket/socketClient'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface UseAuthReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  clearError: () => void
}

/**
 * Authentication hook
 * Manages user authentication state and operations
 */
export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  })

  /**
   * Load user from token on mount
   */
  useEffect(() => {
    const loadUser = async () => {
      if (!TokenManager.hasValidToken()) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return
      }

      try {
        const { user } = await authApi.getMe()
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
      } catch (error) {
        console.error('Failed to load user:', error)
        TokenManager.clearTokens()
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
      }
    }

    loadUser()
  }, [])

  /**
   * Login user
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { user, accessToken, refreshToken } = await authApi.login(credentials)
      TokenManager.setTokens(accessToken, refreshToken)

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })

      // Auto-connect WebSocket after successful login
      try {
        const socket = getSocketClient()
        socket.connect(accessToken)
        console.log('✅ WebSocket auto-connected after login')
      } catch (socketError) {
        console.error('❌ WebSocket connection failed:', socketError)
        // Don't block login flow if socket fails
      }
    } catch (error) {
      const message = handleApiError(error)
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: message
      })
      throw error
    }
  }, [])

  /**
   * Register new user
   */
  const register = useCallback(async (credentials: RegisterCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { user, accessToken, refreshToken } = await authApi.register(credentials)
      TokenManager.setTokens(accessToken, refreshToken)

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
    } catch (error) {
      const message = handleApiError(error)
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: message
      })
      throw error
    }
  }, [])

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    // Disconnect WebSocket before logout
    getSocketClient().disconnect()
    console.log('✅ WebSocket disconnected on logout')

    TokenManager.clearTokens()
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })
  }, [])

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    if (!TokenManager.hasValidToken()) {
      return
    }

    try {
      const { user } = await authApi.getMe()
      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true
      }))
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }, [])

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    login,
    register,
    logout,
    refreshUser,
    clearError
  }
}
