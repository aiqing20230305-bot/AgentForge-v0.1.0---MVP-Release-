/**
 * OpenID Connect (OIDC) Provider Implementation
 * Handles OIDC authentication flows with discovery support
 */

import {
  SSOConfig,
  OIDCConfig,
  SSOUser,
  SSOAuthResponse,
  SSOConnectionTestResult,
  SSOProvider,
  SSOProtocol,
} from './types';

interface OIDCDiscoveryDocument {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  end_session_endpoint?: string;
  scopes_supported: string[];
  response_types_supported: string[];
}

export class OIDCProvider {
  private config: OIDCConfig;
  private ssoConfig: SSOConfig;
  private discoveryDoc?: OIDCDiscoveryDocument;

  constructor(ssoConfig: SSOConfig) {
    if (!ssoConfig.oidcConfig) {
      throw new Error('OIDC configuration is required');
    }
    this.ssoConfig = ssoConfig;
    this.config = ssoConfig.oidcConfig;
  }

  /**
   * Fetch OIDC discovery document
   */
  async fetchDiscoveryDocument(): Promise<OIDCDiscoveryDocument> {
    if (this.discoveryDoc) {
      return this.discoveryDoc;
    }

    try {
      const response = await fetch(this.config.discoveryUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch discovery document');
      }

      this.discoveryDoc = await response.json();
      return this.discoveryDoc;
    } catch (error) {
      throw new Error(
        `OIDC discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate authorization URL
   */
  async generateAuthUrl(state: string, nonce: string): Promise<string> {
    const discovery = await this.fetchDiscoveryDocument();

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: this.config.responseType,
      scope: this.config.scope.join(' '),
      state,
      nonce,
    });

    if (this.config.responseMode) {
      params.append('response_mode', this.config.responseMode);
    }

    return `${discovery.authorization_endpoint}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<{
    idToken: string;
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
  }> {
    const discovery = await this.fetchDiscoveryDocument();

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const response = await fetch(discovery.token_endpoint, {
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
      idToken: data.id_token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in || 3600,
    };
  }

  /**
   * Verify and decode ID token
   */
  async verifyIdToken(idToken: string, nonce: string): Promise<any> {
    try {
      // Split JWT into parts
      const parts = idToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      // Decode payload
      const payload = JSON.parse(atob(parts[1]));

      // Verify nonce
      if (payload.nonce !== nonce) {
        throw new Error('Invalid nonce');
      }

      // Verify expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new Error('Token expired');
      }

      // Verify not before
      if (payload.nbf && payload.nbf > now) {
        throw new Error('Token not yet valid');
      }

      // In production, should verify signature using JWKS
      // For now, return payload
      return payload;
    } catch (error) {
      throw new Error(
        `ID token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get user info from userinfo endpoint
   */
  async getUserInfo(accessToken: string): Promise<any> {
    const discovery = await this.fetchDiscoveryDocument();

    const response = await fetch(discovery.userinfo_endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get user info: ${error}`);
    }

    return await response.json();
  }

  /**
   * Process OIDC callback
   */
  async processCallback(code: string, nonce: string): Promise<SSOAuthResponse> {
    try {
      // Exchange code for tokens
      const { idToken, accessToken, refreshToken, expiresIn } =
        await this.exchangeCodeForTokens(code);

      // Verify ID token
      const idTokenPayload = await this.verifyIdToken(idToken, nonce);

      // Get additional user info from userinfo endpoint
      const userInfo = await this.getUserInfo(accessToken);

      // Merge claims from ID token and userinfo
      const claims = { ...idTokenPayload, ...userInfo };

      // Map to SSO user
      const user = this.mapClaimsToUser(claims);

      return {
        success: true,
        user,
        session: {
          id: this.generateSessionId(),
          userId: user.id,
          sessionToken: accessToken,
          refreshToken,
          provider: this.ssoConfig.provider,
          protocol: SSOProtocol.OIDC,
          status: 'active' as const,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + expiresIn * 1000),
          lastActivityAt: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OIDC authentication failed',
      };
    }
  }

  /**
   * Refresh tokens
   */
  async refreshTokens(refreshToken: string): Promise<{
    idToken: string;
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
  }> {
    const discovery = await this.fetchDiscoveryDocument();

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const response = await fetch(discovery.token_endpoint, {
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
      idToken: data.id_token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in || 3600,
    };
  }

  /**
   * End session (logout)
   */
  async endSession(idToken: string, postLogoutRedirectUri?: string): Promise<string> {
    const discovery = await this.fetchDiscoveryDocument();

    if (!discovery.end_session_endpoint) {
      throw new Error('End session endpoint not supported by provider');
    }

    const params = new URLSearchParams({
      id_token_hint: idToken,
    });

    if (postLogoutRedirectUri) {
      params.append('post_logout_redirect_uri', postLogoutRedirectUri);
    }

    return `${discovery.end_session_endpoint}?${params.toString()}`;
  }

  /**
   * Test OIDC connection
   */
  async testConnection(): Promise<SSOConnectionTestResult> {
    const startTime = Date.now();

    try {
      // Fetch discovery document
      const discovery = await this.fetchDiscoveryDocument();

      // Validate required endpoints
      if (!discovery.authorization_endpoint || !discovery.token_endpoint) {
        return {
          success: false,
          provider: this.ssoConfig.provider,
          protocol: SSOProtocol.OIDC,
          error: 'Missing required endpoints in discovery document',
        };
      }

      // Validate configuration
      if (!this.config.clientId || !this.config.clientSecret) {
        return {
          success: false,
          provider: this.ssoConfig.provider,
          protocol: SSOProtocol.OIDC,
          error: 'Client ID or Client Secret not configured',
        };
      }

      const latency = Date.now() - startTime;

      return {
        success: true,
        provider: this.ssoConfig.provider,
        protocol: SSOProtocol.OIDC,
        latency,
        details: {
          issuer: discovery.issuer,
          authEndpoint: discovery.authorization_endpoint,
          tokenEndpoint: discovery.token_endpoint,
          userinfoEndpoint: discovery.userinfo_endpoint,
          supportedScopes: discovery.scopes_supported,
          supportedResponseTypes: discovery.response_types_supported,
        },
      };
    } catch (error) {
      return {
        success: false,
        provider: this.ssoConfig.provider,
        protocol: SSOProtocol.OIDC,
        error: error instanceof Error ? error.message : 'Connection test failed',
        latency: Date.now() - startTime,
      };
    }
  }

  /**
   * Map OIDC claims to SSO user
   */
  private mapClaimsToUser(claims: any): SSOUser {
    const mapping = this.ssoConfig.userMapping;

    const email = claims[mapping.emailAttribute] || claims.email;
    const username = claims[mapping.usernameAttribute] || claims.preferred_username || email;
    const firstName = claims[mapping.firstNameAttribute] || claims.given_name || '';
    const lastName = claims[mapping.lastNameAttribute] || claims.family_name || '';

    return {
      id: this.generateUserId(),
      email,
      username,
      firstName,
      lastName,
      displayName:
        claims[mapping.displayNameAttribute] ||
        claims.name ||
        `${firstName} ${lastName}`.trim() ||
        username,
      photo: mapping.photoAttribute ? claims[mapping.photoAttribute] : claims.picture,
      role: this.ssoConfig.roleMapping.defaultRole,
      ssoProvider: this.ssoConfig.provider,
      ssoUserId: claims.sub || email,
      customAttributes: claims,
      isActive: true,
      emailVerified: claims.email_verified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
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
