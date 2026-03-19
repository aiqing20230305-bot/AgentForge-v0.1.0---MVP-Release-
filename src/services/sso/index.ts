/**
 * SSO Service - Main Entry Point
 * Enterprise Single Sign-On Integration
 */

export * from './types';
export * from './saml2Provider';
export * from './oauth2Provider';
export * from './oidcProvider';
export * from './ldapProvider';
export * from './ssoManager';
export * from './sessionManager';
export * from './auditLogger';

// Export singleton instance
import { SSOManager } from './ssoManager';

export const ssoManager = new SSOManager();

// Export convenience functions
export const {
  addConfig: addSSOConfig,
  getConfig: getSSOConfig,
  getAllConfigs: getAllSSOConfigs,
  getEnabledConfigs: getEnabledSSOConfigs,
  updateConfig: updateSSOConfig,
  deleteConfig: deleteSSOConfig,
  enableConfig: enableSSOConfig,
  disableConfig: disableSSOConfig,
  initiateAuth: initiateSSOAuth,
  processCallback: processSSOCallback,
  logout: ssoLogout,
  testConnection: testSSOConnection,
  syncUsers: syncSSOUsers,
  getMetrics: getSSOMetrics,
  getAuditLogs: getSSOAuditLogs,
} = ssoManager;
