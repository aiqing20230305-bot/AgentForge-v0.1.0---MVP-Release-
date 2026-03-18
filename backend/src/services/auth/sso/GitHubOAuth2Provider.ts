/**
 * GitHub OAuth2 Provider - GitHub OAuth2身份验证提供商
 *
 * 实现GitHub OAuth2认证流程
 */

import { OAuth2Provider, OAuth2Config, OAuth2UserInfo } from './OAuth2Provider';

export interface GitHubOAuth2Config extends Omit<OAuth2Config, 'authorizationUrl' | 'tokenUrl' | 'userInfoUrl'> {
  authorizationUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
}

export class GitHubOAuth2Provider extends OAuth2Provider {
  constructor(config: GitHubOAuth2Config) {
    super({
      ...config,
      authorizationUrl: config.authorizationUrl || 'https://github.com/login/oauth/authorize',
      tokenUrl: config.tokenUrl || 'https://github.com/login/oauth/access_token',
      userInfoUrl: config.userInfoUrl || 'https://api.github.com/user',
      scope: config.scope || ['read:user', 'user:email'],
    });
  }

  /**
   * 获取GitHub授权URL（支持额外参数）
   */
  getAuthorizationUrl(state?: string, options?: {
    allowSignup?: boolean;
    login?: string;
  }): string {
    const baseUrl = super.getAuthorizationUrl(state);
    const url = new URL(baseUrl);

    if (options?.allowSignup !== undefined) {
      url.searchParams.set('allow_signup', options.allowSignup.toString());
    }
    if (options?.login) {
      url.searchParams.set('login', options.login);
    }

    return url.toString();
  }

  /**
   * GitHub特定：交换授权码时需要特殊的Accept头
   */
  async exchangeCodeForToken(code: string) {
    try {
      const response = await this.httpClient.post(
        this.config.tokenUrl,
        {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
          redirect_uri: this.config.redirectUri,
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('GitHub token exchange failed:', error);
      throw new Error('Failed to exchange GitHub authorization code');
    }
  }

  /**
   * 解析GitHub用户信息
   */
  protected parseUserInfo(data: any): OAuth2UserInfo {
    return {
      id: data.id.toString(),
      email: data.email,
      name: data.name || data.login,
      avatar: data.avatar_url,
      verified: true, // GitHub doesn't provide email_verified field
    };
  }

  /**
   * 获取GitHub用户的主要邮箱（如果user对象中email为null）
   */
  async getUserEmails(accessToken: string): Promise<Array<{
    email: string;
    primary: boolean;
    verified: boolean;
    visibility: string | null;
  }>> {
    try {
      const response = await this.httpClient.get('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch GitHub user emails:', error);
      return [];
    }
  }

  /**
   * 获取GitHub用户信息（增强版，自动获取邮箱）
   */
  async getUserInfo(accessToken: string): Promise<OAuth2UserInfo> {
    const userInfo = await super.getUserInfo(accessToken);

    // 如果邮箱为空，尝试从emails API获取
    if (!userInfo.email) {
      const emails = await this.getUserEmails(accessToken);
      const primaryEmail = emails.find(e => e.primary && e.verified);
      if (primaryEmail) {
        userInfo.email = primaryEmail.email;
        userInfo.verified = primaryEmail.verified;
      }
    }

    return userInfo;
  }

  /**
   * 获取GitHub用户的仓库列表
   */
  async getUserRepositories(accessToken: string, options?: {
    visibility?: 'all' | 'public' | 'private';
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    per_page?: number;
  }): Promise<any[]> {
    try {
      const response = await this.httpClient.get('https://api.github.com/user/repos', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
        params: {
          visibility: options?.visibility || 'all',
          sort: options?.sort || 'updated',
          per_page: options?.per_page || 30,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch GitHub repositories:', error);
      return [];
    }
  }

  /**
   * 获取GitHub用户的组织列表
   */
  async getUserOrganizations(accessToken: string): Promise<any[]> {
    try {
      const response = await this.httpClient.get('https://api.github.com/user/orgs', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch GitHub organizations:', error);
      return [];
    }
  }

  /**
   * 撤销GitHub访问令牌
   */
  async revokeToken(token: string): Promise<void> {
    try {
      await this.httpClient.delete(
        `https://api.github.com/applications/${this.config.clientId}/grant`,
        {
          auth: {
            username: this.config.clientId,
            password: this.config.clientSecret,
          },
          headers: {
            Accept: 'application/vnd.github.v3+json',
          },
          data: {
            access_token: token,
          },
        }
      );
      console.log('GitHub token revoked successfully');
    } catch (error) {
      console.error('Failed to revoke GitHub token:', error);
      throw error;
    }
  }
}

// 注册GitHub提供商到工厂
import { OAuth2ProviderFactory } from './OAuth2Provider';
OAuth2ProviderFactory.register('github', GitHubOAuth2Provider);
