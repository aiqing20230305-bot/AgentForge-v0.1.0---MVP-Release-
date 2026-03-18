/**
 * OAuth2 Provider - Generic OAuth2 Authentication Provider
 *
 * 通用OAuth2提供商实现
 */

import axios, { AxiosInstance } from 'axios';
import { createHash, randomBytes } from 'crypto';

export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string[];
}

export interface OAuth2TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface OAuth2UserInfo {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  verified?: boolean;
}

export class OAuth2Provider {
  protected config: OAuth2Config;
  protected httpClient: AxiosInstance;

  constructor(config: OAuth2Config) {
    this.config = config;
    this.httpClient = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  /**
   * 生成授权URL
   */
  getAuthorizationUrl(state?: string): string {
    const actualState = state || this.generateState();
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scope.join(' '),
      state: actualState,
    });

    return `${this.config.authorizationUrl}?${params.toString()}`;
  }

  /**
   * 使用授权码交换访问令牌
   */
  async exchangeCodeForToken(code: string): Promise<OAuth2TokenResponse> {
    try {
      const response = await this.httpClient.post<OAuth2TokenResponse>(
        this.config.tokenUrl,
        {
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.config.redirectUri,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Token exchange failed:', error);
      throw new Error('Failed to exchange authorization code for token');
    }
  }

  /**
   * 刷新访问令牌
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuth2TokenResponse> {
    try {
      const response = await this.httpClient.post<OAuth2TokenResponse>(
        this.config.tokenUrl,
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(accessToken: string): Promise<OAuth2UserInfo> {
    try {
      const response = await this.httpClient.get(this.config.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return this.parseUserInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      throw new Error('Failed to fetch user information');
    }
  }

  /**
   * 解析用户信息 - 子类应重写此方法以适配不同提供商的响应格式
   */
  protected parseUserInfo(data: any): OAuth2UserInfo {
    return {
      id: data.id || data.sub,
      email: data.email,
      name: data.name || data.display_name || data.email,
      avatar: data.picture || data.avatar_url || data.image,
      verified: data.email_verified || data.verified || false,
    };
  }

  /**
   * 生成随机state参数
   */
  protected generateState(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * 生成PKCE code verifier和challenge
   */
  protected generatePKCE(): { verifier: string; challenge: string } {
    const verifier = randomBytes(32).toString('base64url');
    const challenge = createHash('sha256').update(verifier).digest('base64url');
    return { verifier, challenge };
  }

  /**
   * 验证令牌是否过期
   */
  isTokenExpired(expiresAt: number): boolean {
    return Date.now() >= expiresAt * 1000;
  }

  /**
   * 撤销访问令牌
   */
  async revokeToken(token: string, tokenTypeHint: 'access_token' | 'refresh_token' = 'access_token'): Promise<void> {
    // 某些OAuth2提供商支持令牌撤销
    // 子类可以根据提供商的API实现此方法
    console.log('Token revocation not implemented for this provider');
  }
}

/**
 * OAuth2 Provider Factory - 创建不同的OAuth2提供商实例
 */
export class OAuth2ProviderFactory {
  private static providers: Map<string, typeof OAuth2Provider> = new Map();

  static register(name: string, providerClass: typeof OAuth2Provider): void {
    this.providers.set(name, providerClass);
  }

  static create(name: string, config: OAuth2Config): OAuth2Provider {
    const ProviderClass = this.providers.get(name);
    if (!ProviderClass) {
      return new OAuth2Provider(config);
    }
    return new ProviderClass(config);
  }

  static getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
