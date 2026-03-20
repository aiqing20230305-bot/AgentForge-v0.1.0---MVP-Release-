/**
 * Account Linking Service
 * v2.5.0 Phase 1.2 - OAuth Social Login
 *
 * 处理OAuth账号与本地账号的绑定
 */

import { OAuthUser } from './oauthService';
import { OAuthError, OAuthErrorType } from '../config/oauthConfig';

export interface OAuthAccount {
  id: string;
  userId: string;
  provider: 'github' | 'google';
  providerId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  accessToken: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 账号链接服务类
 */
export class AccountLinkingService {
  // 模拟数据库（实际应用中应使用真实数据库）
  private users: Map<string, User> = new Map();
  private oauthAccounts: Map<string, OAuthAccount> = new Map();
  private emailToUserId: Map<string, string> = new Map();
  private providerToOAuthAccountId: Map<string, string> = new Map();

  /**
   * 通过OAuth登录或注册
   */
  async loginOrRegisterWithOAuth(oauthUser: OAuthUser): Promise<{
    user: User;
    oauthAccount: OAuthAccount;
    isNewUser: boolean;
  }> {
    // 检查是否已经绑定了OAuth账号
    const existingOAuthAccount = await this.findOAuthAccount(
      oauthUser.provider,
      oauthUser.providerId
    );

    if (existingOAuthAccount) {
      // 更新access token
      existingOAuthAccount.accessToken = oauthUser.accessToken;
      if (oauthUser.refreshToken) {
        existingOAuthAccount.refreshToken = oauthUser.refreshToken;
      }
      existingOAuthAccount.updatedAt = new Date();

      const user = await this.findUserById(existingOAuthAccount.userId);
      if (!user) {
        throw new OAuthError(
          OAuthErrorType.ACCOUNT_LINKING_FAILED,
          'User not found for OAuth account',
          oauthUser.provider
        );
      }

      return {
        user,
        oauthAccount: existingOAuthAccount,
        isNewUser: false,
      };
    }

    // 检查是否存在相同邮箱的用户
    let user = await this.findUserByEmail(oauthUser.email);
    let isNewUser = false;

    if (!user) {
      // 创建新用户
      user = await this.createUser({
        email: oauthUser.email,
        name: oauthUser.name,
        avatarUrl: oauthUser.avatarUrl,
      });
      isNewUser = true;
    }

    // 创建OAuth账号链接
    const oauthAccount = await this.createOAuthAccount({
      userId: user.id,
      provider: oauthUser.provider,
      providerId: oauthUser.providerId,
      email: oauthUser.email,
      name: oauthUser.name,
      avatarUrl: oauthUser.avatarUrl,
      accessToken: oauthUser.accessToken,
      refreshToken: oauthUser.refreshToken,
    });

    return {
      user,
      oauthAccount,
      isNewUser,
    };
  }

  /**
   * 绑定OAuth账号到现有用户
   */
  async linkOAuthAccount(
    userId: string,
    oauthUser: OAuthUser
  ): Promise<OAuthAccount> {
    // 检查用户是否存在
    const user = await this.findUserById(userId);
    if (!user) {
      throw new OAuthError(
        OAuthErrorType.ACCOUNT_LINKING_FAILED,
        'User not found',
        oauthUser.provider
      );
    }

    // 检查是否已经绑定
    const existingOAuthAccount = await this.findOAuthAccount(
      oauthUser.provider,
      oauthUser.providerId
    );

    if (existingOAuthAccount) {
      if (existingOAuthAccount.userId !== userId) {
        throw new OAuthError(
          OAuthErrorType.ACCOUNT_LINKING_FAILED,
          'OAuth account is already linked to another user',
          oauthUser.provider
        );
      }

      // 更新token
      existingOAuthAccount.accessToken = oauthUser.accessToken;
      if (oauthUser.refreshToken) {
        existingOAuthAccount.refreshToken = oauthUser.refreshToken;
      }
      existingOAuthAccount.updatedAt = new Date();

      return existingOAuthAccount;
    }

    // 创建新的OAuth账号链接
    return await this.createOAuthAccount({
      userId,
      provider: oauthUser.provider,
      providerId: oauthUser.providerId,
      email: oauthUser.email,
      name: oauthUser.name,
      avatarUrl: oauthUser.avatarUrl,
      accessToken: oauthUser.accessToken,
      refreshToken: oauthUser.refreshToken,
    });
  }

  /**
   * 解除OAuth账号绑定
   */
  async unlinkOAuthAccount(
    userId: string,
    provider: 'github' | 'google'
  ): Promise<boolean> {
    // 查找用户的所有OAuth账号
    const userOAuthAccounts = await this.findOAuthAccountsByUserId(userId);

    // 检查是否至少有2个账号（1个OAuth + 1个密码或另一个OAuth）
    if (userOAuthAccounts.length <= 1) {
      throw new OAuthError(
        OAuthErrorType.ACCOUNT_LINKING_FAILED,
        'Cannot unlink the last authentication method',
        provider
      );
    }

    const oauthAccount = userOAuthAccounts.find((acc) => acc.provider === provider);
    if (!oauthAccount) {
      return false;
    }

    // 删除OAuth账号
    this.oauthAccounts.delete(oauthAccount.id);
    this.providerToOAuthAccountId.delete(
      `${oauthAccount.provider}:${oauthAccount.providerId}`
    );

    return true;
  }

  /**
   * 获取用户的所有OAuth账号
   */
  async getLinkedOAuthAccounts(userId: string): Promise<
    Array<{
      provider: 'github' | 'google';
      email: string;
      name: string;
      linkedAt: Date;
    }>
  > {
    const accounts = await this.findOAuthAccountsByUserId(userId);

    return accounts.map((acc) => ({
      provider: acc.provider,
      email: acc.email,
      name: acc.name,
      linkedAt: acc.createdAt,
    }));
  }

  // ==========================================
  // 私有辅助方法（数据库操作）
  // ==========================================

  private async findUserById(userId: string): Promise<User | null> {
    return this.users.get(userId) || null;
  }

  private async findUserByEmail(email: string): Promise<User | null> {
    const userId = this.emailToUserId.get(email);
    if (!userId) return null;
    return this.users.get(userId) || null;
  }

  private async createUser(data: {
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<User> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: User = {
      id,
      email: data.email,
      name: data.name,
      avatarUrl: data.avatarUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(id, user);
    this.emailToUserId.set(data.email, id);

    return user;
  }

  private async findOAuthAccount(
    provider: 'github' | 'google',
    providerId: string
  ): Promise<OAuthAccount | null> {
    const key = `${provider}:${providerId}`;
    const accountId = this.providerToOAuthAccountId.get(key);
    if (!accountId) return null;
    return this.oauthAccounts.get(accountId) || null;
  }

  private async createOAuthAccount(data: {
    userId: string;
    provider: 'github' | 'google';
    providerId: string;
    email: string;
    name: string;
    avatarUrl?: string;
    accessToken: string;
    refreshToken?: string;
  }): Promise<OAuthAccount> {
    const id = `oauth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const account: OAuthAccount = {
      id,
      userId: data.userId,
      provider: data.provider,
      providerId: data.providerId,
      email: data.email,
      name: data.name,
      avatarUrl: data.avatarUrl,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.oauthAccounts.set(id, account);
    this.providerToOAuthAccountId.set(`${data.provider}:${data.providerId}`, id);

    return account;
  }

  private async findOAuthAccountsByUserId(
    userId: string
  ): Promise<OAuthAccount[]> {
    const accounts: OAuthAccount[] = [];

    for (const account of this.oauthAccounts.values()) {
      if (account.userId === userId) {
        accounts.push(account);
      }
    }

    return accounts;
  }

  /**
   * 清空所有数据（仅用于测试）
   */
  clearAll(): void {
    this.users.clear();
    this.oauthAccounts.clear();
    this.emailToUserId.clear();
    this.providerToOAuthAccountId.clear();
  }
}

// 导出单例
export const accountLinkingService = new AccountLinkingService();

export default accountLinkingService;
