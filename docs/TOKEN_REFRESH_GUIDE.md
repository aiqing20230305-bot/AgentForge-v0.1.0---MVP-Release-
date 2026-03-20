# Token自动刷新指南

**AgentForge v2.5.0 Phase 1.3 - Token Auto-Refresh**

---

## 📋 概述

AgentForge的Token自动刷新系统提供无感的认证体验，自动处理Token过期和刷新，用户无需重新登录。

### 核心特性

- ✅ **自动刷新** - Token即将过期时自动刷新
- ✅ **无感体验** - 用户无需关心Token管理
- ✅ **并发处理** - 正确处理多个并发请求
- ✅ **设备管理** - 跟踪和管理多设备登录
- ✅ **安全撤销** - 支持撤销单个或全部Token

---

## 🚀 快速开始

### 1. 后端配置

#### 环境变量

```env
# JWT密钥
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Token过期时间
JWT_ACCESS_EXPIRY=15m    # Access Token: 15分钟
JWT_REFRESH_EXPIRY=7d     # Refresh Token: 7天
```

#### 集成到Express

```typescript
import express from 'express';
import tokenRoutes from './routes/tokenRoutes';

const app = express();

// 挂载Token路由
app.use('/api/auth/token', tokenRoutes);
```

### 2. 前端配置

#### 使用Axios拦截器

```typescript
import { apiClient } from '@/utils/axiosInterceptor';

// 使用配置好的axios实例
const response = await apiClient.get('/api/users/me');
```

#### 使用Token管理Hook

```tsx
import { useTokenRefresh } from '@/hooks/useTokenRefresh';

function App() {
  const { isAuthenticated, isRefreshing, timeToExpiry, logout } = useTokenRefresh({
    checkInterval: 60000,      // 1分钟检查一次
    expiryThreshold: 5,        // 5分钟阈值
    onTokenExpired: () => {
      // Token过期处理
      window.location.href = '/login';
    },
  });

  return (
    <div>
      {isAuthenticated ? (
        <>
          <Dashboard />
          {isRefreshing && <div>正在刷新...</div>}
        </>
      ) : (
        <Login />
      )}
    </div>
  );
}
```

---

## 📖 工作原理

### Token生命周期

```
登录成功
    ↓
生成Token对 (Access Token + Refresh Token)
    ↓
使用Access Token访问API
    ↓
Access Token即将过期（5分钟内）
    ↓
自动使用Refresh Token刷新
    ↓
获得新的Token对
    ↓
继续使用新Access Token
    ↓
Refresh Token过期（7天后）
    ↓
需要重新登录
```

### 自动刷新触发时机

Token自动刷新在以下情况触发：

1. **定时检查** - 前端定期检查Token是否即将过期（默认1分钟）
2. **请求拦截** - 发起API请求前检查Token状态
3. **401响应** - 收到401错误时尝试刷新并重试

---

## 🔧 API参考

### 后端API

#### 1. 刷新Token

```http
POST /api/auth/token/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

响应:
```json
{
  "success": true,
  "data": {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token",
    "expiresIn": 900
  }
}
```

#### 2. 验证Token

```http
POST /api/auth/token/verify
Content-Type: application/json

{
  "accessToken": "your-access-token"
}
```

#### 3. 检查Token过期

```http
POST /api/auth/token/check-expiry
Content-Type: application/json

{
  "accessToken": "your-access-token",
  "thresholdMinutes": 5
}
```

#### 4. 撤销Token

```http
POST /api/auth/token/revoke
Authorization: Bearer {access-token}
Content-Type: application/json

{
  "refreshToken": "token-to-revoke"
}
```

#### 5. 撤销所有Token（登出所有设备）

```http
POST /api/auth/token/revoke-all
Authorization: Bearer {access-token}
```

#### 6. 获取活跃会话

```http
GET /api/auth/token/sessions
Authorization: Bearer {access-token}
```

响应:
```json
{
  "success": true,
  "data": [
    {
      "deviceInfo": "Chrome on Windows",
      "createdAt": "2026-03-20T10:00:00Z",
      "lastUsedAt": "2026-03-21T15:30:00Z",
      "expiresAt": "2026-03-27T10:00:00Z"
    }
  ]
}
```

---

## 💻 前端使用

### Token管理器

```typescript
import { tokenManager } from '@/utils/tokenManager';

// 保存Token
tokenManager.saveTokens({
  accessToken: 'token',
  refreshToken: 'refresh',
  expiresIn: 900,
  expiresAt: Date.now() + 900000,
});

// 获取Token
const accessToken = tokenManager.getAccessToken();
const refreshToken = tokenManager.getRefreshToken();

// 检查状态
const isAuthenticated = tokenManager.isAuthenticated();
const isExpiring = tokenManager.isTokenExpiringSoon(5);

// 手动刷新
await tokenManager.refreshToken();

// 清除Token（登出）
tokenManager.clearTokens();

// 监听Token更新
const unsubscribe = tokenManager.addListener((accessToken) => {
  console.log('Token updated:', accessToken);
});
```

### Axios拦截器

```typescript
import { createAxiosInstance } from '@/utils/axiosInterceptor';

// 创建实例
const api = createAxiosInstance('http://localhost:5000');

// 自动处理Token
const response = await api.get('/api/users/me');
// 请求头自动包含: Authorization: Bearer {token}
// Token过期自动刷新并重试
```

### React Hook

```tsx
import { useTokenRefresh } from '@/hooks/useTokenRefresh';

function MyComponent() {
  const {
    isAuthenticated,
    isRefreshing,
    timeToExpiry,
    refreshToken,
    logout,
  } = useTokenRefresh({
    checkInterval: 60000,
    expiryThreshold: 5,
    onRefreshSuccess: (token) => {
      console.log('Token refreshed');
    },
    onRefreshError: (error) => {
      console.error('Refresh failed:', error);
    },
    onTokenExpired: () => {
      // 跳转到登录页
    },
  });

  return (
    <div>
      <p>认证状态: {isAuthenticated ? '已登录' : '未登录'}</p>
      <p>Token剩余: {timeToExpiry}秒</p>
      <button onClick={refreshToken}>手动刷新</button>
      <button onClick={logout}>登出</button>
    </div>
  );
}
```

### Token状态指示器

```tsx
import { TokenStatusIndicator } from '@/components/TokenStatusIndicator';

function App() {
  return (
    <div>
      {/* 显示Token状态 */}
      <TokenStatusIndicator
        showDetails={true}
        position="top-right"
        autoHide={true}
      />

      {/* 应用内容 */}
      <Main />
    </div>
  );
}
```

---

## 🔒 安全最佳实践

### 1. Token存储

**推荐方式（按优先级）:**

1. **HttpOnly Cookie** - 最安全，无法被JavaScript访问
   ```typescript
   // 后端设置
   res.cookie('refreshToken', token, {
     httpOnly: true,
     secure: true,
     sameSite: 'strict',
     maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
   });
   ```

2. **localStorage** - 方便但有XSS风险
   ```typescript
   // 前端使用
   localStorage.setItem('access_token', token);
   ```

3. **Memory Only** - 最安全但标签页关闭即失效
   ```typescript
   let accessToken: string | null = null;
   ```

### 2. Token轮换

每次刷新时生成新的Refresh Token，旧Token立即撤销：

```typescript
// 系统自动处理
refreshTokenPair(oldRefreshToken) {
  // 1. 验证旧token
  // 2. 生成新token对
  // 3. 撤销旧token
  // 4. 返回新token对
}
```

### 3. Token撤销

支持单个和批量撤销：

```typescript
// 单个设备登出
await tokenManager.revokeRefreshToken(refreshToken);

// 所有设备登出
await tokenManager.revokeAllUserTokens(userId);
```

### 4. 设备跟踪

记录每个Token的设备信息：

```typescript
const tokenPair = tokenRefreshService.generateTokenPair(
  userId,
  email,
  name,
  req.headers['user-agent'] // 设备信息
);
```

### 5. HTTPS强制

生产环境必须使用HTTPS：

```typescript
if (process.env.NODE_ENV === 'production' && !req.secure) {
  return res.redirect(`https://${req.headers.host}${req.url}`);
}
```

---

## 🐛 故障排除

### 问题1: Token刷新失败

**症状**: 401错误，无法自动刷新

**原因**:
- Refresh Token已过期
- Refresh Token已被撤销
- 网络错误

**解决**:
```typescript
useTokenRefresh({
  onRefreshError: (error) => {
    console.error('Refresh failed:', error);
    // 清除Token
    tokenManager.clearTokens();
    // 跳转登录
    window.location.href = '/login';
  },
});
```

### 问题2: 并发请求重复刷新

**症状**: 多个请求同时触发刷新

**解决**: 系统已自动处理，使用Promise缓存

```typescript
// TokenManager内部实现
if (this.isRefreshing && this.refreshPromise) {
  return this.refreshPromise; // 返回现有Promise
}
```

### 问题3: Token过期时间不准确

**症状**: Token还没过期就被刷新

**原因**: 服务器和客户端时间不同步

**解决**:
```typescript
// 使用相对时间而非绝对时间
const expiresAt = Date.now() + expiresIn * 1000;
```

### 问题4: 刷新Token丢失

**症状**: 刷新后Refresh Token为空

**原因**: Refresh Token未正确保存

**解决**:
```typescript
tokenManager.saveTokens({
  accessToken: data.accessToken,
  refreshToken: data.refreshToken, // 确保保存
  expiresIn: data.expiresIn,
  expiresAt: Date.now() + data.expiresIn * 1000,
});
```

---

## 📊 监控和调试

### Token统计

```typescript
// 获取Token统计信息
const stats = tokenRefreshService.getStatistics();

console.log(stats);
// {
//   totalTokens: 100,
//   activeTokens: 85,
//   revokedTokens: 10,
//   expiredTokens: 5
// }
```

### 用户会话管理

```typescript
// 查看用户的所有活跃会话
const sessions = tokenRefreshService.getUserRefreshTokens(userId);

sessions.forEach(session => {
  console.log(`Device: ${session.deviceInfo}`);
  console.log(`Created: ${session.createdAt}`);
  console.log(`Last used: ${session.lastUsedAt}`);
});
```

### 开发模式调试

```typescript
// 开启Token刷新日志
useTokenRefresh({
  onRefreshSuccess: (token) => {
    console.log('[Token] Refreshed successfully');
  },
  onRefreshError: (error) => {
    console.error('[Token] Refresh failed:', error);
  },
});
```

---

## 🎯 使用场景

### 场景1: 单页应用 (SPA)

```tsx
function App() {
  useTokenRefresh({
    checkInterval: 60000,
    expiryThreshold: 5,
    onTokenExpired: () => {
      window.location.href = '/login';
    },
  });

  return <Router />;
}
```

### 场景2: 多标签页同步

```typescript
// 监听localStorage变化
window.addEventListener('storage', (e) => {
  if (e.key === 'access_token') {
    // Token在其他标签页更新
    window.location.reload();
  }
});
```

### 场景3: 长时间操作

```typescript
async function longRunningTask() {
  // 确保Token有效
  if (tokenManager.isTokenExpiringSoon(10)) {
    await tokenManager.refreshToken();
  }

  // 执行长时间操作
  await processData();
}
```

### 场景4: WebSocket连接

```typescript
const ws = new WebSocket(
  `ws://localhost:5000?token=${tokenManager.getAccessToken()}`
);

// Token刷新时重新连接
tokenManager.addListener((newToken) => {
  if (newToken) {
    ws.close();
    // 使用新token重连
  }
});
```

---

## 🔗 相关文档

- [OAuth社交登录](OAUTH_SETUP_GUIDE.md)
- [API速率限制](RATE_LIMIT_GUIDE.md)
- [Webhook安全](WEBHOOK_SECURITY.md)

---

**最后更新**: 2026-03-21
**版本**: v2.5.0 Phase 1.3
**维护者**: AgentForge Team
