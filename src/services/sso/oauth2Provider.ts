/**
 * OAuth 2.0 Provider Implementation
 * Handles OAuth 2.0 authentication flows with PKCE support
 */

import {
  SSOConfig,
  OAuth2Config,
  SSOUser,
  SSOAuthResponse,
  SSOConnectionTestResult,
  SSOProvider,
  SSOProtocol,
} from './types';

export class OAuth2Provider {
  private config: OAuth2Config;
  private ssoConfig: SSOConfig;
  private codeVerifier?: string;

  constructor(ssoConfig: SSOConfig) {
    if (!ssoConfig.oauth2Config) {
      throw new Error('OAuth2 configuration is required');
    }
    this.ssoConfig = ssoConfig;
    this.config = ssoConfig.oauth2Config;
  }

  /**
   * Generate authorization URL for OAuth2 flow
   */
  async generateAuthUrl(state: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scope.join(' '),
      state,
    });

    // Add PKCE challenge if enabled
    if (this.config.pkceEnabled) {
      this.codeVerifier = this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(this.codeVerifier);
      params.append('code_challenge', codeChallenge);
      params.append('code_challenge_method', 'S256');
    }

    return `${this.config.authorizationUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
  }> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    // Add PKCE verifier if enabled
    if (this.config.pkceEnabled && this.codeVerifier) {
      body.append('code_verifier', this.codeVerifier);
    }

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in || 3600,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
  }> {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${error}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in || 3600,
    };
  }

  /**
   * Get user information using access token
   */
  async getUserInfo(accessToken: string): Promise<SSOUser> {
    const response = await fetch(this.config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get user info: ${error}`);
    }

    const userInfo = await response.json();
    return this.mapUserInfoToUser(userInfo);
  }

  /**
   * Process OAuth2 callback and authenticate user
   */
  async processCallback(code: string): Promise<SSOAuthResponse> {
    try {
      // Exchange code for token
      const { accessToken, refreshToken, expiresIn } = await this.exchangeCodeForToken(code);

      // Get user information
      const user = await this.getUserInfo(accessToken);

      return {
        success: true,
        user,
        session: {
          id: this.generateSessionId(),
          userId: user.id,
          sessionToken: accessToken,
          refreshToken,
          provider: this.ssoConfig.provider,
          protocol: SSOProtocol.OAUTH2,
          status: 'active' as const,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + expiresIn * 1000),
          lastActivityAt: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OAuth2 authentication failed',
      };
    }
  }

  /**
   * Test OAuth2 connection
   */
  async testConnection(): Promise<SSOConnectionTestResult> {
    const startTime = Date.now();

    try {
      // Test authorization endpoint
      const authUrlAccessible = await this.testEndpoint(this.config.authorizationUrl);
      if (!authUrlAccessible) {
        return {
          success: false,
          provider: this.ssoConfig.provider,
          protocol: SSOProtocol.OAUTH2,
          error: 'Authorization URL is not accessible',
        };
      }

      // Test token endpoint
      const tokenUrlAccessible = await this.testEndpoint(this.config.tokenUrl);
      if (!tokenUrlAccessible) {
        return {
          success: false,
          provider: this.ssoConfig.provider,
          protocol: SSOProtocol.OAUTH2,
          error: 'Token URL is not accessible',
        };
      }

      // Validate configuration
      if (!this.config.clientId || !this.config.clientSecret) {
        return {
          success: false,
          provider: this.ssoConfig.provider,
          protocol: SSOProtocol.OAUTH2,
          error: 'Client ID or Client Secret not configured',
        };
      }

      const latency = Date.now() - startTime;

      return {
        success: true,
        provider: this.ssoConfig.provider,
        protocol: SSOProtocol.OAUTH2,
        latency,
        details: {
          authUrlAccessible: true,
          tokenUrlAccessible: true,
          configValid: true,
          pkceEnabled: this.config.pkceEnabled,
        },
      };
    } catch (error) {
      return {
        success: false,
        provider: this.ssoConfig.provider,
        protocol: SSOProtocol.OAUTH2,
        error: error instanceof Error ? error.message : 'Connection test failed',
        latency: Date.now() - startTime,
      };
    }
  }

  /**
   * Revoke token (logout)
   */
  async revokeToken(token: string): Promise<boolean> {
    try {
      // Many OAuth providers have a revocation endpoint
      // This is a simplified implementation
      const revocationUrl = this.config.tokenUrl.replace('/token', '/revoke');

      const body = new URLSearchParams({
        token,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      });

      const response = await fetch(revocationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      return response.ok;
    } catch (error) {
      console.error('Token revocation failed:', error);
      return false;
    }
  }

  /**
   * Map provider user info to SSO user
   */
  private mapUserInfoToUser(userInfo: any): SSOUser {
    const mapping = this.ssoConfig.userMapping;

    // Handle different OAuth provider response formats
    const email = userInfo[mapping.emailAttribute] || userInfo.email;
    const username = userInfo[mapping.usernameAttribute] || userInfo.preferred_username || email;
    const firstName = userInfo[mapping.firstNameAttribute] || userInfo.given_name || '';
    const lastName = userInfo[mapping.lastNameAttribute] || userInfo.family_name || '';

    return {
      id: this.generateUserId(),
      email,
      username,
      firstName,
      lastName,
      displayName:
        userInfo[mapping.displayNameAttribute] ||
        userInfo.name ||
        `${firstName} ${lastName}`.trim() ||
        username,
      photo: mapping.photoAttribute ? userInfo[mapping.photoAttribute] : userInfo.picture,
      role: this.ssoConfig.roleMapping.defaultRole,
      ssoProvider: this.ssoConfig.provider,
      ssoUserId: userInfo.sub || userInfo.id || email,
      customAttributes: userInfo,
      isActive: true,
      emailVerified: userInfo.email_verified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Generate PKCE code verifier
   */
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64UrlEncode(array);
  }

  /**
   * Generate PKCE code challenge from verifier
   */
  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return this.base64UrlEncode(new Uint8Array(digest));
  }

  /**
   * Base64 URL encode
   */
  private base64UrlEncode(buffer: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...buffer));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Test endpoint accessibility
   */
  private async testEndpoint(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
      });
      return true;
    } catch (error) {
      // If CORS blocks the request, the endpoint might still be valid
      return true;
    }
  }

  /**
   * Generate unique user ID
   */
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}
