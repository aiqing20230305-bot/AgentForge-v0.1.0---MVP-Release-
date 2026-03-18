/**
 * Google OAuth2 Provider - Google OAuth2身份验证提供商
 *
 * 实现Google OAuth2.0认证流程
 */

import { OAuth2Provider, OAuth2Config, OAuth2UserInfo } from './OAuth2Provider';

export interface GoogleOAuth2Config extends Omit<OAuth2Config, 'authorizationUrl' | 'tokenUrl' | 'userInfoUrl'> {
  authorizationUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
}

export class GoogleOAuth2Provider extends OAuth2Provider {
  constructor(config: GoogleOAuth2Config) {
    super({
      ...config,
      authorizationUrl: config.authorizationUrl || 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: config.tokenUrl || 'https://oauth2.googleapis.com/token',
      userInfoUrl: config.userInfoUrl || 'https://www.googleapis.com/oauth2/v2/userinfo',
      scope: config.scope || [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'openid',
      ],
    });
  }

  /**
   * 获取Google授权URL（支持额外参数）
   */
  getAuthorizationUrl(state?: string, options?: {
    accessType?: 'online' | 'offline';
    prompt?: 'none' | 'consent' | 'select_account';
    loginHint?: string;
    hostedDomain?: string;
  }): string {
    const baseUrl = super.getAuthorizationUrl(state);
    const url = new URL(baseUrl);

    if (options?.accessType) {
      url.searchParams.set('access_type', options.accessType);
    }
    if (options?.prompt) {
      url.searchParams.set('prompt', options.prompt);
    }
    if (options?.loginHint) {
      url.searchParams.set('login_hint', options.loginHint);
    }
    if (options?.hostedDomain) {
      url.searchParams.set('hd', options.hostedDomain);
    }

    return url.toString();
  }

  /**
   * 解析Google用户信息
   */
  protected parseUserInfo(data: any): OAuth2UserInfo {
    return {
      id: data.id,
      email: data.email,
      name: data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim(),
      avatar: data.picture,
      verified: data.verified_email,
    };
  }

  /**
   * 获取Google用户日历权限（示例扩展）
   */
  async getCalendarEvents(accessToken: string): Promise<any[]> {
    try {
      const response = await this.httpClient.get(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            maxResults: 10,
            orderBy: 'startTime',
            singleEvents: true,
            timeMin: new Date().toISOString(),
          },
        }
      );
      return response.data.items || [];
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      return [];
    }
  }

  /**
   * 撤销Google访问令牌
   */
  async revokeToken(token: string): Promise<void> {
    try {
      await this.httpClient.post(
        'https://oauth2.googleapis.com/revoke',
        `token=${token}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      console.log('Google token revoked successfully');
    } catch (error) {
      console.error('Failed to revoke Google token:', error);
      throw error;
    }
  }
}

// 注册Google提供商到工厂
import { OAuth2ProviderFactory } from './OAuth2Provider';
OAuth2ProviderFactory.register('google', GoogleOAuth2Provider);
