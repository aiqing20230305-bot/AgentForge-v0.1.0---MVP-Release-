/**
 * SSO Manager
 * Central management for SSO configurations and authentication flows
 */

import {
  SSOConfig,
  SSOProvider,
  SSOProtocol,
  SSOAuthRequest,
  SSOAuthResponse,
  SSOLogoutRequest,
  SSOConnectionTestResult,
  SSOSyncResult,
  SSOMetrics,
  SSOUser,
  SSOSession,
  SSOAuditLog,
  SSOAuditEvent,
} from './types';
import { SAML2Provider } from './saml2Provider';
import { OAuth2Provider } from './oauth2Provider';
import { OIDCProvider } from './oidcProvider';
import { LDAPProvider } from './ldapProvider';
import { SessionManager } from './sessionManager';
import { AuditLogger } from './auditLogger';

export class SSOManager {
  private configs: Map<string, SSOConfig> = new Map();
  private sessionManager: SessionManager;
  private auditLogger: AuditLogger;

  constructor() {
    this.sessionManager = new SessionManager();
    this.auditLogger = new AuditLogger();
  }

  /**
   * Add or update SSO configuration
   */
  async addConfig(config: SSOConfig): Promise<void> {
    // Validate configuration
    this.validateConfig(config);

    this.configs.set(config.id, config);

    await this.auditLogger.log({
      event: SSOAuditEvent.SSO_CONFIG_CREATED,
      status: 'success',
      provider: config.provider,
      protocol: config.protocol,
      message: `SSO configuration created: ${config.name}`,
      metadata: { configId: config.id },
    });
  }

  /**
   * Get SSO configuration by ID
   */
  getConfig(configId: string): SSOConfig | undefined {
    return this.configs.get(configId);
  }

  /**
   * Get all SSO configurations
   */
  getAllConfigs(): SSOConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Get enabled SSO configurations
   */
  getEnabledConfigs(): SSOConfig[] {
    return Array.from(this.configs.values()).filter((config) => config.enabled);
  }

  /**
   * Update SSO configuration
   */
  async updateConfig(configId: string, updates: Partial<SSOConfig>): Promise<void> {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error('SSO configuration not found');
    }

    const updatedConfig = {
      ...config,
      ...updates,
      updatedAt: new Date(),
    };

    this.validateConfig(updatedConfig);
    this.configs.set(configId, updatedConfig);

    await this.auditLogger.log({
      event: SSOAuditEvent.SSO_CONFIG_UPDATED,
      status: 'success',
      provider: config.provider,
      protocol: config.protocol,
      message: `SSO configuration updated: ${config.name}`,
      metadata: { configId, updates: Object.keys(updates) },
    });
  }

  /**
   * Delete SSO configuration
   */
  async deleteConfig(configId: string): Promise<void> {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error('SSO configuration not found');
    }

    this.configs.delete(configId);

    await this.auditLogger.log({
      event: SSOAuditEvent.SSO_CONFIG_DELETED,
      status: 'success',
      provider: config.provider,
      protocol: config.protocol,
      message: `SSO configuration deleted: ${config.name}`,
      metadata: { configId },
    });
  }

  /**
   * Enable SSO configuration
   */
  async enableConfig(configId: string): Promise<void> {
    await this.updateConfig(configId, { enabled: true });

    const config = this.configs.get(configId);
    if (config) {
      await this.auditLogger.log({
        event: SSOAuditEvent.SSO_CONFIG_ENABLED,
        status: 'success',
        provider: config.provider,
        protocol: config.protocol,
        message: `SSO configuration enabled: ${config.name}`,
        metadata: { configId },
      });
    }
  }

  /**
   * Disable SSO configuration
   */
  async disableConfig(configId: string): Promise<void> {
    await this.updateConfig(configId, { enabled: false });

    const config = this.configs.get(configId);
    if (config) {
      await this.auditLogger.log({
        event: SSOAuditEvent.SSO_CONFIG_DISABLED,
        status: 'success',
        provider: config.provider,
        protocol: config.protocol,
        message: `SSO configuration disabled: ${config.name}`,
        metadata: { configId },
      });
    }
  }

  /**
   * Initiate SSO authentication
   */
  async initiateAuth(request: SSOAuthRequest): Promise<SSOAuthResponse> {
    const config = this.findConfigByProvider(request.provider);
    if (!config) {
      return {
        success: false,
        error: 'SSO provider not configured',
      };
    }

    if (!config.enabled) {
      return {
        success: false,
        error: 'SSO provider is disabled',
      };
    }

    try {
      let redirectUrl: string;

      switch (config.protocol) {
        case SSOProtocol.SAML2:
          const samlProvider = new SAML2Provider(config);
          redirectUrl = await samlProvider.generateAuthRequest(
            request.callbackUrl || window.location.origin
          );
          break;

        case SSOProtocol.OAUTH2:
          const oauth2Provider = new OAuth2Provider(config);
          redirectUrl = await oauth2Provider.generateAuthUrl(request.state || this.generateState());
          break;

        case SSOProtocol.OIDC:
          const oidcProvider = new OIDCProvider(config);
          redirectUrl = await oidcProvider.generateAuthUrl(
            request.state || this.generateState(),
            this.generateNonce()
          );
          break;

        case SSOProtocol.LDAP:
          return {
            success: false,
            error: 'LDAP requires username and password',
          };

        default:
          return {
            success: false,
            error: 'Unsupported SSO protocol',
          };
      }

      return {
        success: true,
        redirectUrl,
      };
    } catch (error) {
      await this.auditLogger.log({
        event: SSOAuditEvent.LOGIN_FAILURE,
        status: 'error',
        provider: request.provider,
        protocol: request.protocol,
        message: 'SSO authentication initiation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication initiation failed',
      };
    }
  }

  /**
   * Process SSO callback
   */
  async processCallback(
    provider: SSOProvider,
    data: Record<string, any>
  ): Promise<SSOAuthResponse> {
    const config = this.findConfigByProvider(provider);
    if (!config) {
      return {
        success: false,
        error: 'SSO provider not configured',
      };
    }

    try {
      let response: SSOAuthResponse;

      switch (config.protocol) {
        case SSOProtocol.SAML2:
          const samlProvider = new SAML2Provider(config);
          response = await samlProvider.processAuthResponse(data.SAMLResponse);
          break;

        case SSOProtocol.OAUTH2:
          const oauth2Provider = new OAuth2Provider(config);
          response = await oauth2Provider.processCallback(data.code);
          break;

        case SSOProtocol.OIDC:
          const oidcProvider = new OIDCProvider(config);
          response = await oidcProvider.processCallback(data.code, data.nonce);
          break;

        default:
          return {
            success: false,
            error: 'Unsupported SSO protocol',
          };
      }

      if (response.success && response.user && response.session) {
        // Store session
        await this.sessionManager.createSession(response.session);

        // Apply role mapping
        response.user = await this.applyRoleMapping(response.user, config);

        // Auto-provision user if enabled
        if (config.autoProvision) {
          await this.provisionUser(response.user);
        }

        await this.auditLogger.log({
          event: SSOAuditEvent.LOGIN_SUCCESS,
          status: 'success',
          userId: response.user.id,
          email: response.user.email,
          provider: config.provider,
          protocol: config.protocol,
          sessionId: response.session.id,
          message: 'User logged in successfully',
        });
      } else {
        await this.auditLogger.log({
          event: SSOAuditEvent.LOGIN_FAILURE,
          status: 'failure',
          provider: config.provider,
          protocol: config.protocol,
          message: 'SSO authentication failed',
          error: response.error,
        });
      }

      return response;
    } catch (error) {
      await this.auditLogger.log({
        event: SSOAuditEvent.LOGIN_FAILURE,
        status: 'error',
        provider: config.provider,
        protocol: config.protocol,
        message: 'SSO callback processing failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Callback processing failed',
      };
    }
  }

  /**
   * Logout user
   */
  async logout(request: SSOLogoutRequest): Promise<boolean> {
    const session = await this.sessionManager.getSession(request.sessionId);
    if (!session) {
      return false;
    }

    const config = this.findConfigByProvider(session.provider);

    try {
      // End session locally
      await this.sessionManager.endSession(request.sessionId);

      // Global logout if requested
      if (request.globalLogout && config) {
        await this.performGlobalLogout(session, config, request.logoutUrl);
      }

      await this.auditLogger.log({
        event: SSOAuditEvent.LOGOUT,
        status: 'success',
        userId: session.userId,
        provider: session.provider,
        protocol: session.protocol,
        sessionId: session.id,
        message: 'User logged out successfully',
      });

      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  }

  /**
   * Test SSO connection
   */
  async testConnection(configId: string): Promise<SSOConnectionTestResult> {
    const config = this.configs.get(configId);
    if (!config) {
      return {
        success: false,
        provider: SSOProvider.CUSTOM,
        protocol: SSOProtocol.SAML2,
        error: 'SSO configuration not found',
      };
    }

    try {
      let result: SSOConnectionTestResult;

      switch (config.protocol) {
        case SSOProtocol.SAML2:
          const samlProvider = new SAML2Provider(config);
          result = await samlProvider.testConnection();
          break;

        case SSOProtocol.OAUTH2:
          const oauth2Provider = new OAuth2Provider(config);
          result = await oauth2Provider.testConnection();
          break;

        case SSOProtocol.OIDC:
          const oidcProvider = new OIDCProvider(config);
          result = await oidcProvider.testConnection();
          break;

        case SSOProtocol.LDAP:
          const ldapProvider = new LDAPProvider(config);
          result = await ldapProvider.testConnection();
          break;

        default:
          result = {
            success: false,
            provider: config.provider,
            protocol: config.protocol,
            error: 'Unsupported protocol',
          };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        provider: config.provider,
        protocol: config.protocol,
        error: error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  }

  /**
   * Sync users from SSO provider
   */
  async syncUsers(configId: string): Promise<SSOSyncResult> {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error('SSO configuration not found');
    }

    if (config.protocol !== SSOProtocol.LDAP) {
      throw new Error('User sync is only supported for LDAP');
    }

    const ldapProvider = new LDAPProvider(config);
    return await ldapProvider.syncUsers();
  }

  /**
   * Get SSO metrics
   */
  async getMetrics(): Promise<SSOMetrics> {
    return await this.sessionManager.getMetrics();
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(filters?: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    event?: SSOAuditEvent;
  }): Promise<SSOAuditLog[]> {
    return await this.auditLogger.getLogs(filters);
  }

  /**
   * Validate SSO configuration
   */
  private validateConfig(config: SSOConfig): void {
    if (!config.id || !config.provider || !config.protocol) {
      throw new Error('Invalid SSO configuration: missing required fields');
    }

    switch (config.protocol) {
      case SSOProtocol.SAML2:
        if (!config.saml2Config) {
          throw new Error('SAML2 configuration is required');
        }
        break;

      case SSOProtocol.OAUTH2:
        if (!config.oauth2Config) {
          throw new Error('OAuth2 configuration is required');
        }
        break;

      case SSOProtocol.OIDC:
        if (!config.oidcConfig) {
          throw new Error('OIDC configuration is required');
        }
        break;

      case SSOProtocol.LDAP:
        if (!config.ldapConfig) {
          throw new Error('LDAP configuration is required');
        }
        break;
    }
  }

  /**
   * Find configuration by provider
   */
  private findConfigByProvider(provider: SSOProvider): SSOConfig | undefined {
    return Array.from(this.configs.values()).find((config) => config.provider === provider);
  }

  /**
   * Apply role mapping to user
   */
  private async applyRoleMapping(user: SSOUser, config: SSOConfig): Promise<SSOUser> {
    const roleMapping = config.roleMapping;

    // Sort rules by priority
    const sortedRules = [...roleMapping.rules].sort((a, b) => b.priority - a.priority);

    // Evaluate rules
    for (const rule of sortedRules) {
      try {
        // Simple evaluation of condition
        // In production, use a proper expression evaluator
        const attributes = user.customAttributes;
        const result = eval(rule.condition.replace(/attributes\./g, 'attributes.'));

        if (result) {
          user.role = rule.role;
          break;
        }
      } catch (error) {
        console.error('Role mapping evaluation error:', error);
      }
    }

    return user;
  }

  /**
   * Provision user in the system
   */
  private async provisionUser(user: SSOUser): Promise<void> {
    // This would call backend API to create/update user
    console.log('Provisioning user:', user);

    await this.auditLogger.log({
      event: SSOAuditEvent.USER_PROVISIONED,
      status: 'success',
      userId: user.id,
      email: user.email,
      message: 'User provisioned successfully',
    });
  }

  /**
   * Perform global logout at IdP
   */
  private async performGlobalLogout(
    session: SSOSession,
    config: SSOConfig,
    logoutUrl?: string
  ): Promise<void> {
    switch (config.protocol) {
      case SSOProtocol.SAML2:
        // SAML Single Logout
        if (config.saml2Config?.sloUrl) {
          const samlProvider = new SAML2Provider(config);
          const sloUrl = await samlProvider.generateLogoutRequest('sessionIndex', 'nameId');
          if (logoutUrl) {
            window.location.href = sloUrl;
          }
        }
        break;

      case SSOProtocol.OIDC:
        // OIDC End Session
        const oidcProvider = new OIDCProvider(config);
        const endSessionUrl = await oidcProvider.endSession(
          session.sessionToken,
          logoutUrl
        );
        if (logoutUrl) {
          window.location.href = endSessionUrl;
        }
        break;

      case SSOProtocol.OAUTH2:
        // OAuth2 Token Revocation
        const oauth2Provider = new OAuth2Provider(config);
        await oauth2Provider.revokeToken(session.sessionToken);
        break;
    }
  }

  /**
   * Generate random state for OAuth/OIDC
   */
  private generateState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate random nonce for OIDC
   */
  private generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
}
