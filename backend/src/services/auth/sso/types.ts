/**
 * SSO系统 - 类型定义
 */

export type SSOProvider = 'saml' | 'oauth' | 'oidc' | 'google' | 'azure' | 'ad';

export interface SSOConfig {
  provider: SSOProvider;
  clientId: string;
  clientSecret: string;
  issuer: string;
  callbackUrl: string;
  logoutUrl?: string;
  metadataUrl?: string;
  certificates?: string[];
  enabled: boolean;
}

export interface SSOUser {
  id: string;
  email: string;
  name: string;
  provider: SSOProvider;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface SAMLConfig extends SSOConfig {
  entityId: string;
  privateKey: string;
  certificate: string;
  assertEndpoint: string;
  ssoLoginUrl: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
}
