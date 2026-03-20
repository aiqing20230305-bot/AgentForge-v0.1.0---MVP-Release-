/**
 * OAuth Configuration
 * v2.5.0 Phase 1.2 - OAuth Social Login
 *
 * GitHub和Google OAuth配置
 */

export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string[];
}

export interface OAuthConfig {
  github: OAuthProviderConfig;
  google: OAuthProviderConfig;
  enabled: boolean;
}

/**
 * 获取OAuth配置
 */
export function getOAuthConfig(): OAuthConfig {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

  return {
    enabled: process.env.OAUTH_ENABLED === 'true',

    // GitHub OAuth配置
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      redirectUri: `${baseUrl}/api/auth/oauth/github/callback`,
      authorizationUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      userInfoUrl: 'https://api.github.com/user',
      scope: ['read:user', 'user:email'],
    },

    // Google OAuth配置
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: `${baseUrl}/api/auth/oauth/google/callback`,
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    },
  };
}

/**
 * 验证OAuth配置
 */
export function validateOAuthConfig(provider: 'github' | 'google'): boolean {
  const config = getOAuthConfig();

  if (!config.enabled) {
    return false;
  }

  const providerConfig = config[provider];

  if (!providerConfig.clientId || !providerConfig.clientSecret) {
    console.warn(
      `[OAuth] ${provider} OAuth is not configured. Please set ${provider.toUpperCase()}_CLIENT_ID and ${provider.toUpperCase()}_CLIENT_SECRET environment variables.`
    );
    return false;
  }

  return true;
}

/**
 * OAuth状态管理（防止CSRF攻击）
 */
const stateStore = new Map<string, { timestamp: number; redirectUrl?: string }>();

/**
 * 生成并存储OAuth状态
 */
export function generateOAuthState(redirectUrl?: string): string {
  const state = Math.random().toString(36).substring(2, 15);
  stateStore.set(state, {
    timestamp: Date.now(),
    redirectUrl,
  });

  // 5分钟后自动清理
  setTimeout(() => {
    stateStore.delete(state);
  }, 5 * 60 * 1000);

  return state;
}

/**
 * 验证OAuth状态
 */
export function validateOAuthState(state: string): {
  valid: boolean;
  redirectUrl?: string;
} {
  const stored = stateStore.get(state);

  if (!stored) {
    return { valid: false };
  }

  // 检查是否过期（5分钟）
  if (Date.now() - stored.timestamp > 5 * 60 * 1000) {
    stateStore.delete(state);
    return { valid: false };
  }

  // 验证后删除
  stateStore.delete(state);

  return {
    valid: true,
    redirectUrl: stored.redirectUrl,
  };
}

/**
 * OAuth错误类型
 */
export enum OAuthErrorType {
  INVALID_STATE = 'invalid_state',
  ACCESS_DENIED = 'access_denied',
  INVALID_CODE = 'invalid_code',
  TOKEN_EXCHANGE_FAILED = 'token_exchange_failed',
  USER_INFO_FAILED = 'user_info_failed',
  ACCOUNT_LINKING_FAILED = 'account_linking_failed',
  PROVIDER_NOT_CONFIGURED = 'provider_not_configured',
}

/**
 * OAuth错误
 */
export class OAuthError extends Error {
  constructor(
    public type: OAuthErrorType,
    message: string,
    public provider?: string
  ) {
    super(message);
    this.name = 'OAuthError';
  }
}

export default {
  getOAuthConfig,
  validateOAuthConfig,
  generateOAuthState,
  validateOAuthState,
  OAuthError,
  OAuthErrorType,
};
