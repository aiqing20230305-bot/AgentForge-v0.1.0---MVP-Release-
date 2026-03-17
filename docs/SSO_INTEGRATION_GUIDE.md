# Enterprise SSO Integration Guide

Complete guide for integrating Single Sign-On (SSO) with AgentForge.

## Table of Contents

- [Overview](#overview)
- [Supported Protocols](#supported-protocols)
- [Supported Providers](#supported-providers)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Protocol Guides](#protocol-guides)
- [User Management](#user-management)
- [Security](#security)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Overview

AgentForge's SSO system provides enterprise-grade authentication with support for multiple protocols and identity providers. Features include:

- **Multiple Protocol Support**: SAML 2.0, OAuth 2.0, OpenID Connect, LDAP
- **Popular Providers**: Okta, Auth0, Azure AD, Google Workspace
- **Auto-Provisioning**: Automatic user creation and updates
- **Role Mapping**: Flexible role assignment from IdP attributes
- **Session Management**: Centralized session control and monitoring
- **Audit Logging**: Comprehensive security audit trails

## Supported Protocols

### SAML 2.0
- Industry-standard enterprise SSO protocol
- Support for signed requests and encrypted assertions
- Single Logout (SLO) capability

### OAuth 2.0
- Modern authorization framework
- PKCE support for enhanced security
- Token refresh capabilities

### OpenID Connect (OIDC)
- Identity layer on top of OAuth 2.0
- Automatic discovery endpoint support
- ID token validation

### LDAP
- Direct integration with LDAP/Active Directory
- User synchronization
- Group-based role mapping

## Supported Providers

### Okta
```typescript
const oktaConfig: SSOConfig = {
  id: 'okta-sso',
  provider: SSOProvider.OKTA,
  protocol: SSOProtocol.SAML2,
  enabled: true,
  name: 'Okta SSO',
  saml2Config: {
    entityId: 'https://your-app.com',
    ssoUrl: 'https://your-org.okta.com/app/xxx/sso/saml',
    certificate: '-----BEGIN CERTIFICATE-----\n...',
    signRequests: true,
    encryptAssertions: false,
  },
  // ... additional config
};
```

### Auth0
```typescript
const auth0Config: SSOConfig = {
  id: 'auth0-sso',
  provider: SSOProvider.AUTH0,
  protocol: SSOProtocol.OIDC,
  enabled: true,
  name: 'Auth0 SSO',
  oidcConfig: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    discoveryUrl: 'https://your-tenant.auth0.com/.well-known/openid-configuration',
    redirectUri: 'https://your-app.com/auth/callback',
    scope: ['openid', 'profile', 'email'],
  },
  // ... additional config
};
```

### Azure AD
```typescript
const azureConfig: SSOConfig = {
  id: 'azure-ad-sso',
  provider: SSOProvider.AZURE_AD,
  protocol: SSOProtocol.OIDC,
  enabled: true,
  name: 'Azure AD SSO',
  oidcConfig: {
    clientId: 'your-application-id',
    clientSecret: 'your-client-secret',
    discoveryUrl: 'https://login.microsoftonline.com/your-tenant-id/v2.0/.well-known/openid-configuration',
    redirectUri: 'https://your-app.com/auth/callback',
    scope: ['openid', 'profile', 'email'],
  },
  // ... additional config
};
```

### Google Workspace
```typescript
const googleConfig: SSOConfig = {
  id: 'google-sso',
  provider: SSOProvider.GOOGLE_WORKSPACE,
  protocol: SSOProtocol.OAUTH2,
  enabled: true,
  name: 'Google Workspace SSO',
  oauth2Config: {
    clientId: 'your-client-id.apps.googleusercontent.com',
    clientSecret: 'your-client-secret',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v1/userinfo',
    scope: ['openid', 'email', 'profile'],
    redirectUri: 'https://your-app.com/auth/callback',
    pkceEnabled: true,
  },
  // ... additional config
};
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure SSO Provider

```typescript
import { ssoManager, SSOConfig, SSOProvider, SSOProtocol } from './services/sso';

const config: SSOConfig = {
  id: 'my-sso',
  provider: SSOProvider.OKTA,
  protocol: SSOProtocol.SAML2,
  enabled: true,
  name: 'My Organization SSO',

  // Protocol-specific config
  saml2Config: {
    entityId: 'https://your-app.com',
    ssoUrl: 'https://idp.example.com/sso',
    certificate: 'YOUR_IDP_CERTIFICATE',
    signRequests: true,
    encryptAssertions: false,
  },

  // User attribute mapping
  userMapping: {
    emailAttribute: 'email',
    firstNameAttribute: 'firstName',
    lastNameAttribute: 'lastName',
    usernameAttribute: 'username',
  },

  // Role mapping
  roleMapping: {
    defaultRole: UserRole.USER,
    attributeName: 'groups',
    rules: [
      {
        id: 'admin-rule',
        condition: "groups.includes('Administrators')",
        role: UserRole.ADMIN,
        priority: 10,
      },
    ],
  },

  // Provisioning settings
  autoProvision: true,
  justInTimeProvisioning: true,
  sessionTimeout: 3600,

  createdAt: new Date(),
  updatedAt: new Date(),
};

await ssoManager.addConfig(config);
```

### 3. Initiate Authentication

```typescript
import { initiateSSOAuth, SSOProvider, SSOProtocol } from './services/sso';

const result = await initiateSSOAuth({
  provider: SSOProvider.OKTA,
  protocol: SSOProtocol.SAML2,
  callbackUrl: window.location.origin + '/auth/callback',
});

if (result.success && result.redirectUrl) {
  window.location.href = result.redirectUrl;
}
```

### 4. Handle Callback

```typescript
import { processSSOCallback, SSOProvider } from './services/sso';

// Extract callback data from URL
const params = new URLSearchParams(window.location.search);
const code = params.get('code');
const samlResponse = params.get('SAMLResponse');

const result = await processSSOCallback(
  SSOProvider.OKTA,
  { code, SAMLResponse: samlResponse }
);

if (result.success && result.user) {
  // User authenticated successfully
  console.log('Welcome', result.user.displayName);
}
```

## Configuration

### User Mapping

Map IdP attributes to user fields:

```typescript
userMapping: {
  emailAttribute: 'mail',
  firstNameAttribute: 'givenName',
  lastNameAttribute: 'sn',
  usernameAttribute: 'uid',
  displayNameAttribute: 'displayName',
  photoAttribute: 'photo',
  customAttributes: {
    department: 'department',
    employeeId: 'employeeNumber',
  },
}
```

### Role Mapping

Assign roles based on IdP attributes:

```typescript
roleMapping: {
  defaultRole: UserRole.USER,
  attributeName: 'groups',
  rules: [
    {
      id: 'super-admin',
      condition: "groups.includes('Domain Admins')",
      role: UserRole.SUPER_ADMIN,
      priority: 100,
    },
    {
      id: 'admin',
      condition: "groups.includes('Administrators')",
      role: UserRole.ADMIN,
      priority: 90,
    },
    {
      id: 'manager',
      condition: "attributes.title?.includes('Manager')",
      role: UserRole.MANAGER,
      priority: 50,
    },
  ],
}
```

### Session Configuration

```typescript
sessionTimeout: 3600,  // 1 hour in seconds
allowedDomains: ['example.com', 'subsidiary.com'],
autoProvision: true,
justInTimeProvisioning: true,
```

## Protocol Guides

### SAML 2.0 Configuration

```typescript
saml2Config: {
  entityId: 'https://your-app.com',
  ssoUrl: 'https://idp.example.com/sso/saml',
  sloUrl: 'https://idp.example.com/slo/saml',  // Optional
  certificate: '-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----',
  signRequests: true,
  encryptAssertions: false,
  nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  attributeMapping: {
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'email',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname': 'firstName',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname': 'lastName',
  },
}
```

### OAuth 2.0 Configuration

```typescript
oauth2Config: {
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  authorizationUrl: 'https://idp.example.com/oauth/authorize',
  tokenUrl: 'https://idp.example.com/oauth/token',
  userInfoUrl: 'https://idp.example.com/oauth/userinfo',
  scope: ['openid', 'profile', 'email'],
  redirectUri: 'https://your-app.com/auth/callback',
  pkceEnabled: true,
}
```

### OIDC Configuration

```typescript
oidcConfig: {
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  discoveryUrl: 'https://idp.example.com/.well-known/openid-configuration',
  redirectUri: 'https://your-app.com/auth/callback',
  scope: ['openid', 'profile', 'email'],
  responseType: 'code',
  responseMode: 'query',
}
```

### LDAP Configuration

```typescript
ldapConfig: {
  host: 'ldap.example.com',
  port: 636,
  baseDN: 'dc=example,dc=com',
  bindDN: 'cn=service,dc=example,dc=com',
  bindPassword: 'service-password',
  searchFilter: '(&(objectClass=user)(sAMAccountName={{username}}))',
  tlsEnabled: true,
  tlsOptions: {
    rejectUnauthorized: true,
  },
  userAttributes: ['mail', 'givenName', 'sn', 'displayName', 'memberOf'],
  groupAttributes: ['memberOf'],
}
```

## User Management

### Auto-Provisioning

When enabled, users are automatically created on first login:

```typescript
autoProvision: true,
justInTimeProvisioning: true,
```

### Manual User Sync (LDAP)

```typescript
import { syncSSOUsers } from './services/sso';

const result = await syncSSOUsers('ldap-config-id');

console.log(`Processed: ${result.usersProcessed}`);
console.log(`Created: ${result.usersCreated}`);
console.log(`Updated: ${result.usersUpdated}`);
console.log(`Errors: ${result.errors.length}`);
```

## Security

### Session Management

```typescript
import { sessionManager } from './services/sso';

// Validate session
const session = await sessionManager.getSession(sessionId);

// Refresh session
await sessionManager.refreshSession(sessionId, 3600);

// End session
await sessionManager.endSession(sessionId);

// End all user sessions
await sessionManager.endUserSessions(userId);
```

### Audit Logging

All SSO events are automatically logged:

```typescript
import { getSSOAuditLogs, SSOAuditEvent } from './services/sso';

// Get recent logs
const logs = await getSSOAuditLogs({
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
  event: SSOAuditEvent.LOGIN_FAILURE,
});

// Export logs
const auditLogger = new AuditLogger();
const csv = await auditLogger.exportLogsCSV();
```

## Monitoring

### Metrics Dashboard

```typescript
import { getSSOMetrics } from './services/sso';

const metrics = await getSSOMetrics();

console.log('Active Users:', metrics.activeUsers);
console.log('Active Sessions:', metrics.activeSessions);
console.log('Login Success Rate:', metrics.loginSuccessRate);
console.log('Failed Logins (24h):', metrics.failedLoginsLast24h);
```

### Using the Admin Panel

```tsx
import { SSOConfigPanel } from './components/admin/SSOConfigPanel';

function AdminPage() {
  return (
    <div>
      <h1>SSO Administration</h1>
      <SSOConfigPanel />
    </div>
  );
}
```

## Troubleshooting

### Test Connection

```typescript
import { testSSOConnection } from './services/sso';

const result = await testSSOConnection('config-id');

if (result.success) {
  console.log('Connection successful!');
  console.log('Latency:', result.latency, 'ms');
} else {
  console.error('Connection failed:', result.error);
}
```

### Common Issues

#### SAML Certificate Issues
- Ensure certificate is in PEM format
- Remove any line breaks except within the certificate
- Verify certificate is not expired

#### OAuth/OIDC Redirect URI Mismatch
- Verify redirect URI matches exactly in IdP configuration
- Check for http vs https
- Ensure trailing slashes match

#### LDAP Connection Failures
- Verify firewall allows connection to LDAP port
- Check bind DN and password are correct
- Test with LDAP client first (ldapsearch)

#### Session Expiration
- Adjust sessionTimeout in configuration
- Implement token refresh for OAuth/OIDC
- Enable "Remember Me" functionality

### Debug Mode

Enable detailed logging:

```typescript
// In development
localStorage.setItem('sso_debug', 'true');

// Logs will appear in console with detailed information
```

## API Reference

See individual protocol provider documentation:

- [SAML2Provider](../src/services/sso/saml2Provider.ts)
- [OAuth2Provider](../src/services/sso/oauth2Provider.ts)
- [OIDCProvider](../src/services/sso/oidcProvider.ts)
- [LDAPProvider](../src/services/sso/ldapProvider.ts)
- [SSOManager](../src/services/sso/ssoManager.ts)

## Support

For issues and questions:
- Check [Troubleshooting](#troubleshooting) section
- Review audit logs for error details
- Test connection using the admin panel
- Contact your IdP administrator for provider-specific issues

## License

MIT License - see LICENSE file for details
