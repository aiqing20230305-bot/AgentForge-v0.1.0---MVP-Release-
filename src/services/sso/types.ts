/**
 * SSO Types and Interfaces
 * Enterprise-grade Single Sign-On type definitions
 */

export enum SSOProtocol {
  SAML2 = 'saml2',
  OAUTH2 = 'oauth2',
  OIDC = 'oidc',
  LDAP = 'ldap',
}

export enum SSOProvider {
  OKTA = 'okta',
  AUTH0 = 'auth0',
  AZURE_AD = 'azure_ad',
  GOOGLE_WORKSPACE = 'google_workspace',
  CUSTOM = 'custom',
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  GUEST = 'guest',
}

export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  LOGGED_OUT = 'logged_out',
  INVALID = 'invalid',
}

export interface SSOConfig {
  id: string;
  provider: SSOProvider;
  protocol: SSOProtocol;
  enabled: boolean;
  name: string;
  description?: string;

  // Protocol-specific configuration
  saml2Config?: SAML2Config;
  oauth2Config?: OAuth2Config;
  oidcConfig?: OIDCConfig;
  ldapConfig?: LDAPConfig;

  // User mapping
  userMapping: UserMapping;
  roleMapping: RoleMapping;

  // Advanced settings
  autoProvision: boolean;
  justInTimeProvisioning: boolean;
  sessionTimeout: number; // in seconds
  allowedDomains?: string[];

  createdAt: Date;
  updatedAt: Date;
}

export interface SAML2Config {
  entityId: string;
  ssoUrl: string;
  sloUrl?: string;
  certificate: string;
  signRequests: boolean;
  encryptAssertions: boolean;
  nameIdFormat?: string;
  attributeMapping?: Record<string, string>;
}

export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string[];
  redirectUri: string;
  pkceEnabled: boolean;
}

export interface OIDCConfig {
  clientId: string;
  clientSecret: string;
  discoveryUrl: string;
  redirectUri: string;
  scope: string[];
  responseType: string;
  responseMode?: string;
}

export interface LDAPConfig {
  host: string;
  port: number;
  baseDN: string;
  bindDN: string;
  bindPassword: string;
  searchFilter: string;
  tlsEnabled: boolean;
  tlsOptions?: {
    rejectUnauthorized: boolean;
    ca?: string;
  };
  userAttributes: string[];
  groupAttributes?: string[];
}

export interface UserMapping {
  emailAttribute: string;
  firstNameAttribute: string;
  lastNameAttribute: string;
  usernameAttribute: string;
  displayNameAttribute?: string;
  photoAttribute?: string;
  customAttributes?: Record<string, string>;
}

export interface RoleMapping {
  defaultRole: UserRole;
  attributeName: string;
  rules: RoleMappingRule[];
}

export interface RoleMappingRule {
  id: string;
  condition: string; // expression like "groups.includes('admin')"
  role: UserRole;
  priority: number;
}

export interface SSOUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  photo?: string;
  role: UserRole;

  // SSO metadata
  ssoProvider: SSOProvider;
  ssoUserId: string;

  // Custom attributes from IdP
  customAttributes: Record<string, any>;

  // Account status
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface SSOSession {
  id: string;
  userId: string;
  sessionToken: string;
  refreshToken?: string;

  // Session metadata
  provider: SSOProvider;
  protocol: SSOProtocol;
  status: SessionStatus;

  // Timestamps
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;

  // Client info
  userAgent?: string;
  ipAddress?: string;
  deviceId?: string;
}

export interface SSOAuditLog {
  id: string;
  timestamp: Date;

  // Event information
  event: SSOAuditEvent;
  status: 'success' | 'failure' | 'error';

  // Actor information
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;

  // Context
  provider?: SSOProvider;
  protocol?: SSOProtocol;
  sessionId?: string;

  // Details
  message: string;
  metadata?: Record<string, any>;
  error?: string;
}

export enum SSOAuditEvent {
  // Authentication events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  SESSION_EXPIRED = 'session_expired',

  // User management events
  USER_PROVISIONED = 'user_provisioned',
  USER_UPDATED = 'user_updated',
  USER_DEACTIVATED = 'user_deactivated',
  ROLE_CHANGED = 'role_changed',

  // Configuration events
  SSO_CONFIG_CREATED = 'sso_config_created',
  SSO_CONFIG_UPDATED = 'sso_config_updated',
  SSO_CONFIG_DELETED = 'sso_config_deleted',
  SSO_CONFIG_ENABLED = 'sso_config_enabled',
  SSO_CONFIG_DISABLED = 'sso_config_disabled',

  // Security events
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  INVALID_TOKEN = 'invalid_token',
  TOKEN_REFRESH = 'token_refresh',
  PASSWORD_RESET = 'password_reset',
}

export interface SSOSyncResult {
  success: boolean;
  usersProcessed: number;
  usersCreated: number;
  usersUpdated: number;
  usersDeactivated: number;
  errors: Array<{
    userId?: string;
    email?: string;
    error: string;
  }>;
  duration: number; // in ms
  timestamp: Date;
}

export interface SSOConnectionTestResult {
  success: boolean;
  provider: SSOProvider;
  protocol: SSOProtocol;
  latency?: number; // in ms
  userInfo?: Partial<SSOUser>;
  error?: string;
  details?: Record<string, any>;
}

export interface SSOAuthRequest {
  provider: SSOProvider;
  protocol: SSOProtocol;
  callbackUrl?: string;
  state?: string;
  metadata?: Record<string, any>;
}

export interface SSOAuthResponse {
  success: boolean;
  user?: SSOUser;
  session?: SSOSession;
  error?: string;
  redirectUrl?: string;
}

export interface SSOLogoutRequest {
  sessionId: string;
  logoutUrl?: string;
  globalLogout?: boolean; // Logout from IdP as well
}

export interface SSOMetrics {
  totalUsers: number;
  activeUsers: number;
  activeSessions: number;

  // Provider breakdown
  usersByProvider: Record<SSOProvider, number>;
  sessionsByProvider: Record<SSOProvider, number>;

  // Authentication metrics
  loginSuccessRate: number;
  averageLoginTime: number; // in ms

  // Recent activity
  loginsLast24h: number;
  failedLoginsLast24h: number;

  // Session metrics
  averageSessionDuration: number; // in seconds
  expiredSessionsLast24h: number;
}
