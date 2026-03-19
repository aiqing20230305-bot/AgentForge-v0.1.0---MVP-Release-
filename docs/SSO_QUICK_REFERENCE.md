# SSO Quick Reference

## File Structure

```
src/services/sso/
├── types.ts              (414 lines)  - Type definitions
├── saml2Provider.ts      (523 lines)  - SAML 2.0 implementation
├── oauth2Provider.ts     (353 lines)  - OAuth 2.0 implementation
├── oidcProvider.ts       (383 lines)  - OIDC implementation
├── ldapProvider.ts       (383 lines)  - LDAP implementation
├── ssoManager.ts         (665 lines)  - Central SSO manager
├── sessionManager.ts     (357 lines)  - Session lifecycle management
├── auditLogger.ts        (351 lines)  - Security audit logging
└── index.ts              (27 lines)   - Module exports

src/components/admin/
└── SSOConfigPanel.tsx    (546 lines)  - Admin UI

backend/src/auth/
├── ssoController.ts      (250 lines)  - API endpoints
├── ssoService.ts         (99 lines)   - Business logic
├── ssoRoutes.ts          (39 lines)   - Route definitions
└── index.ts              (9 lines)    - Module exports

docs/
├── SSO_INTEGRATION_GUIDE.md         - Complete integration guide
├── TASK_301_COMPLETION_REPORT.md    - Implementation report
└── SSO_QUICK_REFERENCE.md           - This file
```

## Quick Start

### 1. Import SSO Service
```typescript
import {
  ssoManager,
  SSOProvider,
  SSOProtocol,
  UserRole
} from './services/sso';
```

### 2. Add Configuration
```typescript
await ssoManager.addConfig({
  id: 'my-sso',
  provider: SSOProvider.OKTA,
  protocol: SSOProtocol.SAML2,
  enabled: true,
  name: 'Company SSO',
  saml2Config: { /* ... */ },
  userMapping: { /* ... */ },
  roleMapping: { /* ... */ },
  autoProvision: true,
  sessionTimeout: 3600,
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

### 3. Authenticate
```typescript
// Initiate
const { redirectUrl } = await ssoManager.initiateAuth({
  provider: SSOProvider.OKTA,
  protocol: SSOProtocol.SAML2,
});
window.location.href = redirectUrl;

// Handle callback
const result = await ssoManager.processCallback(
  SSOProvider.OKTA,
  callbackData
);
```

### 4. Use Admin UI
```tsx
import { SSOConfigPanel } from './components/admin/SSOConfigPanel';

<SSOConfigPanel />
```

## Supported Protocols

| Protocol | Provider Class | Key Features |
|----------|---------------|--------------|
| SAML 2.0 | SAML2Provider | Signed requests, encrypted assertions, SLO |
| OAuth 2.0 | OAuth2Provider | PKCE, token refresh, revocation |
| OIDC | OIDCProvider | Discovery, ID token validation |
| LDAP | LDAPProvider | User sync, group mapping, TLS |

## Supported Providers

- Okta (SAML/OIDC)
- Auth0 (OIDC)
- Azure AD (OIDC/SAML)
- Google Workspace (OAuth 2.0)
- Custom (All protocols)

## API Endpoints

```
POST   /auth/sso/initiate              - Start SSO flow
POST   /auth/sso/callback/:provider    - Handle callback
GET    /auth/sso/callback/:provider    - Handle callback (GET)
POST   /auth/sso/logout                - Logout user
GET    /auth/sso/validate              - Validate session

GET    /admin/sso/configs              - List configs
POST   /admin/sso/configs              - Create config
PUT    /admin/sso/configs/:id          - Update config
DELETE /admin/sso/configs/:id          - Delete config

POST   /admin/sso/configs/:id/test     - Test connection
POST   /admin/sso/configs/:id/sync     - Sync users (LDAP)

GET    /admin/sso/metrics              - Get metrics
GET    /admin/sso/audit-logs           - Get audit logs
```

## Key Classes

### SSOManager
- `addConfig()` - Add SSO configuration
- `initiateAuth()` - Start authentication
- `processCallback()` - Handle IdP callback
- `logout()` - End session
- `testConnection()` - Test configuration
- `getMetrics()` - Get statistics

### SessionManager
- `createSession()` - Create new session
- `getSession()` - Get session by ID
- `refreshSession()` - Extend session
- `endSession()` - Terminate session
- `validateToken()` - Validate session token

### AuditLogger
- `log()` - Log audit event
- `getLogs()` - Query logs
- `exportLogs()` - Export as JSON
- `exportLogsCSV()` - Export as CSV

## Events

```typescript
enum SSOAuditEvent {
  LOGIN_SUCCESS
  LOGIN_FAILURE
  LOGOUT
  SESSION_EXPIRED
  USER_PROVISIONED
  USER_UPDATED
  USER_DEACTIVATED
  ROLE_CHANGED
  SSO_CONFIG_CREATED
  SSO_CONFIG_UPDATED
  SSO_CONFIG_DELETED
  UNAUTHORIZED_ACCESS
  INVALID_TOKEN
  TOKEN_REFRESH
  PASSWORD_RESET
}
```

## Common Patterns

### Role Mapping
```typescript
roleMapping: {
  defaultRole: UserRole.USER,
  attributeName: 'groups',
  rules: [
    {
      id: 'admin-rule',
      condition: "groups.includes('Administrators')",
      role: UserRole.ADMIN,
      priority: 100,
    },
  ],
}
```

### User Mapping
```typescript
userMapping: {
  emailAttribute: 'mail',
  firstNameAttribute: 'givenName',
  lastNameAttribute: 'sn',
  usernameAttribute: 'uid',
  displayNameAttribute: 'displayName',
}
```

### Session Timeout
```typescript
sessionTimeout: 3600,  // 1 hour in seconds
```

## Troubleshooting

```typescript
// Test connection
const result = await ssoManager.testConnection('config-id');
console.log(result.success, result.error, result.latency);

// Check audit logs
const logs = await ssoManager.getAuditLogs({
  event: SSOAuditEvent.LOGIN_FAILURE,
  startDate: new Date(Date.now() - 24*60*60*1000),
});

// Get metrics
const metrics = await ssoManager.getMetrics();
console.log('Success rate:', metrics.loginSuccessRate);
```

## Code Statistics

- **Total Lines**: 4,755
- **Frontend Services**: 3,242 lines
- **UI Component**: 546 lines
- **Backend API**: 443 lines
- **Documentation**: 524 lines

## Security Features

✅ Multi-protocol support
✅ Certificate validation
✅ Token encryption (PKCE)
✅ Session timeout
✅ Audit logging
✅ Role-based access
✅ TLS/SSL support

## Next Steps

1. Review [SSO_INTEGRATION_GUIDE.md](./SSO_INTEGRATION_GUIDE.md)
2. Configure your IdP
3. Add SSO configuration
4. Test connection
5. Enable and authenticate

## Support

- Integration Guide: `docs/SSO_INTEGRATION_GUIDE.md`
- Completion Report: `docs/TASK_301_COMPLETION_REPORT.md`
- API Reference: Source code comments
