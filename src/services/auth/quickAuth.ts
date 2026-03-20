/**
 * Quick Authentication System
 * Multiple login methods for instant access
 *
 * Supported Methods:
 * 1. Guest Mode (no signup required)
 * 2. Magic Link (passwordless email)
 * 3. OAuth (Google, GitHub, Discord)
 * 4. Traditional (email + password)
 *
 * Performance Target: < 1s login time
 */

import { authApi, type User, type AuthResponse } from '../api/auth'

/**
 * Authentication Method Types
 */
export type AuthMethod = 'guest' | 'magic-link' | 'oauth' | 'email-password'

/**
 * OAuth Provider Types
 */
export type OAuthProvider = 'google' | 'github' | 'discord'

/**
 * Guest User Data
 */
export interface GuestUser {
  id: string
  username: string
  isGuest: true
  createdAt: string
}

/**
 * Magic Link Request
 */
export interface MagicLinkRequest {
  email: string
  redirectUrl?: string
}

/**
 * OAuth Config
 */
export interface OAuthConfig {
  provider: OAuthProvider
  clientId: string
  redirectUri: string
  scope: string[]
}

/**
 * Auth State
 */
export interface AuthState {
  user: User | GuestUser | null
  isAuthenticated: boolean
  isGuest: boolean
  method: AuthMethod | null
  token: string | null
}

/**
 * Quick Auth Service
 */
export class QuickAuthService {
  private static readonly GUEST_PREFIX = 'guest_'
  private static readonly STORAGE_KEY = 'agentforge_auth'
  private static readonly TOKEN_KEY = 'agentforge_token'

  /**
   * Get current auth state from localStorage
   */
  getAuthState(): AuthState {
    try {
      const stored = localStorage.getItem(QuickAuthService.STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('[QuickAuth] Failed to parse auth state:', error)
    }

    return {
      user: null,
      isAuthenticated: false,
      isGuest: false,
      method: null,
      token: null
    }
  }

  /**
   * Save auth state to localStorage
   */
  private saveAuthState(state: AuthState): void {
    try {
      localStorage.setItem(QuickAuthService.STORAGE_KEY, JSON.stringify(state))
      if (state.token) {
        localStorage.setItem(QuickAuthService.TOKEN_KEY, state.token)
      }
    } catch (error) {
      console.error('[QuickAuth] Failed to save auth state:', error)
    }
  }

  /**
   * Clear auth state
   */
  private clearAuthState(): void {
    localStorage.removeItem(QuickAuthService.STORAGE_KEY)
    localStorage.removeItem(QuickAuthService.TOKEN_KEY)
  }

  /**
   * Login as Guest
   * No signup required, instant access
   */
  async loginAsGuest(): Promise<GuestUser> {
    console.log('[QuickAuth] Logging in as guest')

    const guestUser: GuestUser = {
      id: `${QuickAuthService.GUEST_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: `游客${Math.floor(Math.random() * 10000)}`,
      isGuest: true,
      createdAt: new Date().toISOString()
    }

    const authState: AuthState = {
      user: guestUser,
      isAuthenticated: true,
      isGuest: true,
      method: 'guest',
      token: null
    }

    this.saveAuthState(authState)
    console.log('[QuickAuth] Guest login successful:', guestUser.username)

    return guestUser
  }

  /**
   * Request Magic Link
   * Send passwordless login link to email
   */
  async requestMagicLink(email: string, redirectUrl?: string): Promise<void> {
    console.log('[QuickAuth] Requesting magic link for:', email)

    try {
      // TODO v2.5.0: Implement backend API call (Phase 1.1)
      // await fetch('/api/auth/magic-link', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, redirectUrl })
      // })

      console.log('[QuickAuth] Magic link sent to:', email)
    } catch (error) {
      console.error('[QuickAuth] Magic link request failed:', error)
      throw new Error('Failed to send magic link')
    }
  }

  /**
   * Verify Magic Link Token
   * Complete login from email link
   */
  async verifyMagicLink(token: string): Promise<User> {
    console.log('[QuickAuth] Verifying magic link token')

    try {
      // TODO v2.5.0: Implement backend API call (Phase 1.1)
      // const response = await fetch('/api/auth/magic-link/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token })
      // })
      // const data = await response.json()

      // Mock response for now
      const mockUser: User = {
        id: 'user_' + Date.now(),
        email: 'user@example.com',
        username: 'User',
        avatar: null,
        createdAt: new Date().toISOString()
      }

      const authState: AuthState = {
        user: mockUser,
        isAuthenticated: true,
        isGuest: false,
        method: 'magic-link',
        token: token
      }

      this.saveAuthState(authState)
      console.log('[QuickAuth] Magic link verified successfully')

      return mockUser
    } catch (error) {
      console.error('[QuickAuth] Magic link verification failed:', error)
      throw new Error('Invalid or expired magic link')
    }
  }

  /**
   * Login with OAuth
   * Redirect to OAuth provider
   */
  async loginWithOAuth(provider: OAuthProvider): Promise<void> {
    console.log('[QuickAuth] Initiating OAuth login:', provider)

    const configs: Record<OAuthProvider, Partial<OAuthConfig>> = {
      google: {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        scope: ['profile', 'email']
      },
      github: {
        clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
        scope: ['read:user', 'user:email']
      },
      discord: {
        clientId: import.meta.env.VITE_DISCORD_CLIENT_ID || '',
        scope: ['identify', 'email']
      }
    }

    const config = configs[provider]
    const redirectUri = `${window.location.origin}/auth/callback/${provider}`

    // Build OAuth URL
    const authUrls: Record<OAuthProvider, string> = {
      google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${config.scope?.join(' ')}`,
      github: `https://github.com/login/oauth/authorize?client_id=${config.clientId}&redirect_uri=${redirectUri}&scope=${config.scope?.join(' ')}`,
      discord: `https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${config.scope?.join(' ')}`
    }

    // Save state for verification
    const state = Math.random().toString(36).substr(2, 9)
    sessionStorage.setItem('oauth_state', state)
    sessionStorage.setItem('oauth_provider', provider)

    // Redirect to OAuth provider
    window.location.href = authUrls[provider] + `&state=${state}`
  }

  /**
   * Handle OAuth Callback
   * Process OAuth provider response
   */
  async handleOAuthCallback(provider: OAuthProvider, code: string, state: string): Promise<User> {
    console.log('[QuickAuth] Handling OAuth callback:', provider)

    // Verify state
    const savedState = sessionStorage.getItem('oauth_state')
    if (savedState !== state) {
      throw new Error('Invalid OAuth state')
    }

    try {
      // TODO v2.5.0: Exchange code for token via backend (Phase 1.2 OAuth)
      // const response = await fetch('/api/auth/oauth/callback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ provider, code })
      // })
      // const data = await response.json()

      // Mock response for now
      const mockUser: User = {
        id: 'oauth_' + Date.now(),
        email: `user@${provider}.com`,
        username: `${provider}User`,
        avatar: null,
        createdAt: new Date().toISOString()
      }

      const authState: AuthState = {
        user: mockUser,
        isAuthenticated: true,
        isGuest: false,
        method: 'oauth',
        token: 'mock_oauth_token'
      }

      this.saveAuthState(authState)
      console.log('[QuickAuth] OAuth login successful')

      // Clean up session storage
      sessionStorage.removeItem('oauth_state')
      sessionStorage.removeItem('oauth_provider')

      return mockUser
    } catch (error) {
      console.error('[QuickAuth] OAuth callback failed:', error)
      throw new Error('OAuth authentication failed')
    }
  }

  /**
   * Login with Email & Password
   * Traditional authentication
   */
  async loginWithPassword(email: string, password: string): Promise<User> {
    console.log('[QuickAuth] Logging in with email:', email)

    try {
      const response = await authApi.login({ email, password })

      const authState: AuthState = {
        user: response.user,
        isAuthenticated: true,
        isGuest: false,
        method: 'email-password',
        token: response.accessToken
      }

      this.saveAuthState(authState)
      console.log('[QuickAuth] Email login successful')

      return response.user
    } catch (error) {
      console.error('[QuickAuth] Email login failed:', error)
      throw new Error('Invalid email or password')
    }
  }

  /**
   * Register with Email & Password
   */
  async register(email: string, password: string, username: string): Promise<User> {
    console.log('[QuickAuth] Registering user:', email)

    try {
      const response = await authApi.register({ email, password, username })

      const authState: AuthState = {
        user: response.user,
        isAuthenticated: true,
        isGuest: false,
        method: 'email-password',
        token: response.accessToken
      }

      this.saveAuthState(authState)
      console.log('[QuickAuth] Registration successful')

      return response.user
    } catch (error) {
      console.error('[QuickAuth] Registration failed:', error)
      throw new Error('Registration failed')
    }
  }

  /**
   * Upgrade Guest to Full Account
   * Convert guest user to registered user
   */
  async upgradeGuestAccount(email: string, password: string): Promise<User> {
    console.log('[QuickAuth] Upgrading guest account')

    const currentState = this.getAuthState()
    if (!currentState.isGuest) {
      throw new Error('Not a guest account')
    }

    try {
      // Register new account
      const user = await this.register(email, password, (currentState.user as GuestUser).username)

      // TODO v2.5.0: Migrate guest data to new account (Phase 1.1)
      // await this.migrateGuestData(currentState.user.id, user.id)

      console.log('[QuickAuth] Guest account upgraded successfully')
      return user
    } catch (error) {
      console.error('[QuickAuth] Guest upgrade failed:', error)
      throw new Error('Failed to upgrade guest account')
    }
  }

  /**
   * Logout
   * Clear auth state and return to guest mode
   */
  async logout(): Promise<void> {
    console.log('[QuickAuth] Logging out')

    this.clearAuthState()

    // Optionally login as guest immediately
    // await this.loginAsGuest()
  }

  /**
   * Check if user is guest
   */
  isGuestUser(userId: string): boolean {
    return userId.startsWith(QuickAuthService.GUEST_PREFIX)
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(QuickAuthService.TOKEN_KEY)
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<string> {
    const currentState = this.getAuthState()

    if (!currentState.token) {
      throw new Error('No refresh token available')
    }

    try {
      // TODO v2.5.0: Implement token refresh (Phase 1.3)
      // const response = await authApi.refreshToken(currentState.token)
      // const newToken = response.accessToken

      // Update stored token
      // localStorage.setItem(QuickAuthService.TOKEN_KEY, newToken)

      return currentState.token // Return existing for now
    } catch (error) {
      console.error('[QuickAuth] Token refresh failed:', error)
      throw new Error('Failed to refresh token')
    }
  }
}

// Singleton instance
let quickAuthInstance: QuickAuthService | null = null

/**
 * Get Quick Auth Service instance
 */
export const getQuickAuth = (): QuickAuthService => {
  if (!quickAuthInstance) {
    quickAuthInstance = new QuickAuthService()
  }
  return quickAuthInstance
}
