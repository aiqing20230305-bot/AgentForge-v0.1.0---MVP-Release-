/**
 * OAuth Service
 * v2.5.0 Phase 1.2 - OAuth Social Login
 *
 * 处理GitHub和Google OAuth授权流程
 */

import axios from 'axios';
import {
  getOAuthConfig,
  validateOAuthConfig,
  generateOAuthState,
  validateOAuthState,
  OAuthError,
  OAuthErrorType,
  OAuthProviderConfig,
} from '../config/oauthConfig';

export interface OAuthUser {
  provider: 'github' | 'google';
  providerId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  accessToken: string;
  refreshToken?: string;
}

export interface OAuthAuthorizationUrl {
  url: string;
  state: string;
}

/**
 * OAuth服务类
 */
export class OAuthService {
  /**
   * 获取OAuth授权URL
   */
  getAuthorizationUrl(
    provider: 'github' | 'google',
    redirectUrl?: string
  ): OAuthAuthorizationUrl {
    if (!validateOAuthConfig(provider)) {
      throw new OAuthError(
        OAuthErrorType.PROVIDER_NOT_CONFIGURED,
        `${provider} OAuth is not configured`,
        provider
      );
    }

    const config = getOAuthConfig();
    const providerConfig = config[provider];

    const state = generateOAuthState(redirectUrl);

    const params = new URLSearchParams({
      client_id: providerConfig.clientId,
      redirect_uri: providerConfig.redirectUri,
      scope: providerConfig.scope.join(' '),
      state,
      response_type: 'code',
    });

    // Google特定参数
    if (provider === 'google') {
      params.append('access_type', 'offline');
      params.append('prompt', 'consent');
    }

    const url = `${providerConfig.authorizationUrl}?${params.toString()}`;

    return { url, state };
  }

  /**
   * 处理OAuth回调
   */
  async handleCallback(
    provider: 'github' | 'google',
    code: string,
    state: string
  ): Promise<OAuthUser> {
    // 验证state
    const stateValidation = validateOAuthState(state);
    if (!stateValidation.valid) {
      throw new OAuthError(
        OAuthErrorType.INVALID_STATE,
        'Invalid OAuth state',
        provider
      );
    }

    // 验证配置
    if (!validateOAuthConfig(provider)) {
      throw new OAuthError(
        OAuthErrorType.PROVIDER_NOT_CONFIGURED,
        `${provider} OAuth is not configured`,
        provider
      );
    }

    // 交换access token
    const tokens = await this.exchangeCodeForToken(provider, code);

    // 获取用户信息
    const userInfo = await this.getUserInfo(provider, tokens.accessToken);

    return {
      provider,
      providerId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      avatarUrl: userInfo.avatarUrl,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * 交换授权码为access token
   */
  private async exchangeCodeForToken(
    provider: 'github' | 'google',
    code: string
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    const config = getOAuthConfig();
    const providerConfig = config[provider];

    try {
      const response = await axios.post(
        providerConfig.tokenUrl,
        {
          client_id: providerConfig.clientId,
          client_secret: providerConfig.clientSecret,
          code,
          redirect_uri: providerConfig.redirectUri,
          grant_type: 'authorization_code',
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      };
    } catch (error: any) {
      console.error(`[OAuth] Token exchange failed for ${provider}:`, error.response?.data || error.message);
      throw new OAuthError(
        OAuthErrorType.TOKEN_EXCHANGE_FAILED,
        'Failed to exchange code for token',
        provider
      );
    }
  }

  /**
   * 获取用户信息
   */
  private async getUserInfo(
    provider: 'github' | 'google',
    accessToken: string
  ): Promise<{
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }> {
    const config = getOAuthConfig();
    const providerConfig = config[provider];

    try {
      const response = await axios.get(providerConfig.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      const data = response.data;

      if (provider === 'github') {
        return this.parseGitHubUser(data, accessToken);
      } else {
        return this.parseGoogleUser(data);
      }
    } catch (error: any) {
      console.error(`[OAuth] Failed to get user info for ${provider}:`, error.response?.data || error.message);
      throw new OAuthError(
        OAuthErrorType.USER_INFO_FAILED,
        'Failed to get user information',
        provider
      );
    }
  }

  /**
   * 解析GitHub用户信息
   */
  private async parseGitHubUser(
    data: any,
    accessToken: string
  ): Promise<{
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }> {
    let email = data.email;

    // 如果email为空，从emails API获取
    if (!email) {
      try {
        const emailsResponse = await axios.get('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        });

        const primaryEmail = emailsResponse.data.find((e: any) => e.primary);
        email = primaryEmail?.email || emailsResponse.data[0]?.email;
      } catch (error) {
        console.error('[OAuth] Failed to fetch GitHub user emails:', error);
      }
    }

    if (!email) {
      throw new OAuthError(
        OAuthErrorType.USER_INFO_FAILED,
        'Unable to get email from GitHub',
        'github'
      );
    }

    return {
      id: data.id.toString(),
      email,
      name: data.name || data.login,
      avatarUrl: data.avatar_url,
    };
  }

  /**
   * 解析Google用户信息
   */
  private parseGoogleUser(data: any): {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  } {
    if (!data.email) {
      throw new OAuthError(
        OAuthErrorType.USER_INFO_FAILED,
        'Unable to get email from Google',
        'google'
      );
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      avatarUrl: data.picture,
    };
  }

  /**
   * 刷新access token（仅Google支持）
   */
  async refreshAccessToken(
    provider: 'google',
    refreshToken: string
  ): Promise<string> {
    if (!validateOAuthConfig(provider)) {
      throw new OAuthError(
        OAuthErrorType.PROVIDER_NOT_CONFIGURED,
        `${provider} OAuth is not configured`,
        provider
      );
    }

    const config = getOAuthConfig();
    const providerConfig = config[provider];

    try {
      const response = await axios.post(
        providerConfig.tokenUrl,
        {
          client_id: providerConfig.clientId,
          client_secret: providerConfig.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.access_token;
    } catch (error: any) {
      console.error(`[OAuth] Token refresh failed for ${provider}:`, error.response?.data || error.message);
      throw new OAuthError(
        OAuthErrorType.TOKEN_EXCHANGE_FAILED,
        'Failed to refresh access token',
        provider
      );
    }
  }
}

// 导出单例
export const oauthService = new OAuthService();

export default oauthService;
