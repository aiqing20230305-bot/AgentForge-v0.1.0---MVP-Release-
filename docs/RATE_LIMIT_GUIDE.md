# API速率限制指南

v2.5.0 Phase 3.2 - API Rate Limiting

## 概述

AgentForge的API速率限制系统提供完整的保护机制，防止API滥用和DDoS攻击。

## 功能特性

### 1. 多层限流策略

| 层级 | 说明 | 默认限制 |
|-----|------|---------|
| **全局** | 所有请求 | 100次/15分钟 |
| **IP** | 按IP地址 | 50次/小时 |
| **用户** | 按用户ID | 200次/小时 |
| **端点** | 特定API | 自定义 |

### 2. 端点特定限制

```typescript
'/api/auth/login': 5次/15分钟      // 登录
'/api/auth/register': 3次/小时     // 注册
'/api/analytics/*': 30次/分钟      // 分析
'/api/upload': 10次/小时           // 上传
```

### 3. 白名单/黑名单

- **白名单**: 完全豁免速率限制
- **黑名单**: 完全拒绝访问（403）

### 4. 存储选项

- **内存存储**: 单机部署（默认）
- **Redis存储**: 分布式部署（生产环境推荐）

---

## 快速开始

### 1. 基础使用

```typescript
import express from 'express';
import {
  blacklistCheck,
  globalRateLimiter,
  ipRateLimiter,
} from './middleware/rateLimiter';

const app = express();

// 应用速率限制
app.use(blacklistCheck);                    // 黑名单检查
app.use(await globalRateLimiter());         // 全局限制
app.use(await ipRateLimiter());             // IP限制
```

### 2. 端点特定限制

```typescript
import { endpointRateLimiter } from './middleware/rateLimiter';

// 登录端点：严格限制
app.use(
  '/api/auth/login',
  await endpointRateLimiter('/api/auth/login')
);
```

### 3. 自定义限制

```typescript
import { customRateLimiter } from './middleware/rateLimiter';

// 自定义：10次/分钟
app.use(
  '/api/custom',
  await customRateLimiter(60 * 1000, 10, 'Too many requests')
);
```

---

## 配置说明

### 环境变量

```.env
# 速率限制配置
RATE_LIMIT_ENABLED=true
RATE_LIMIT_STORE=memory

# Redis配置（可选）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 配置文件

**backend/src/config/rateLimitConfig.ts**:

```typescript
export const defaultRateLimitConfig = {
  // 全局限制
  global: {
    windowMs: 15 * 60 * 1000,  // 15分钟
    max: 100,                   // 100次请求
  },

  // IP限制
  byIP: {
    windowMs: 60 * 60 * 1000,  // 1小时
    max: 50,                    // 50次请求
  },

  // 用户限制
  byUser: {
    windowMs: 60 * 60 * 1000,  // 1小时
    max: 200,                   // 200次请求
  },

  // 白名单
  whitelist: ['127.0.0.1', 'localhost'],

  // 黑名单
  blacklist: [],
};
```

---

## API参考

### 管理API

所有管理API都在 `/api/rate-limit` 前缀下。

#### 1. 获取摘要

```http
GET /api/rate-limit/summary
```

响应:
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "store": "memory",
    "globalLimit": {
      "windowMs": 900000,
      "max": 100
    },
    "endpointCount": 8,
    "whitelistCount": 2,
    "blacklistCount": 0
  }
}
```

#### 2. 获取配置

```http
GET /api/rate-limit/config
```

#### 3. 更新配置

```http
PUT /api/rate-limit/config

{
  "global": {
    "windowMs": 900000,
    "max": 50
  }
}
```

#### 4. 白名单管理

```http
# 获取白名单
GET /api/rate-limit/whitelist

# 添加IP
POST /api/rate-limit/whitelist
{
  "ip": "192.168.1.100"
}

# 移除IP
DELETE /api/rate-limit/whitelist/192.168.1.100
```

#### 5. 黑名单管理

```http
# 获取黑名单
GET /api/rate-limit/blacklist

# 添加IP
POST /api/rate-limit/blacklist
{
  "ip": "10.0.0.50"
}

# 移除IP
DELETE /api/rate-limit/blacklist/10.0.0.50
```

#### 6. 查看状态

```http
GET /api/rate-limit/status/:identifier
```

响应:
```json
{
  "success": true,
  "data": {
    "identifier": "ip:192.168.1.1",
    "remaining": 45,
    "limit": 50,
    "reset": "2026-03-20T15:00:00Z"
  }
}
```

#### 7. 清除限制

```http
DELETE /api/rate-limit/clear/:identifier
```

#### 8. 获取统计

```http
GET /api/rate-limit/statistics
```

响应:
```json
{
  "success": true,
  "data": {
    "totalRequests": 1234,
    "uniqueIdentifiers": 56,
    "topEndpoints": [
      { "endpoint": "/api/agents", "count": 456 },
      { "endpoint": "/api/tasks", "count": 234 }
    ],
    "topIdentifiers": [
      { "identifier": "ip:192.168.1.1", "count": 123 }
    ]
  }
}
```

#### 9. 启用/禁用

```http
# 启用
POST /api/rate-limit/enable

# 禁用
POST /api/rate-limit/disable
```

---

## 响应Headers

速率限制信息会在响应头中返回：

```http
RateLimit-Limit: 100
RateLimit-Remaining: 85
RateLimit-Reset: 1648654800
```

---

## 超限响应

当请求超过限制时，返回HTTP 429：

```json
{
  "success": false,
  "error": "Too Many Requests",
  "message": "Too many requests, please try again later.",
  "retryAfter": 900
}
```

---

## 使用场景

### 场景1: 保护登录端点

```typescript
// 登录端点：15分钟内最多5次尝试
app.use(
  '/api/auth/login',
  await endpointRateLimiter('/api/auth/login')
);
```

防止暴力破解攻击。

### 场景2: 限制文件上传

```typescript
// 上传端点：1小时最多10次
app.use(
  '/api/upload',
  await endpointRateLimiter('/api/upload')
);
```

防止资源滥用。

### 场景3: API滥用防护

```typescript
// Analytics端点：1分钟30次
app.use(
  '/api/analytics',
  await endpointRateLimiter('/api/analytics/*')
);
```

防止数据抓取。

### 场景4: 白名单内部服务

```typescript
// 添加内部服务器到白名单
rateLimitService.addToWhitelist('10.0.0.5');
rateLimitService.addToWhitelist('10.0.0.6');
```

内部服务不受限制。

### 场景5: 封禁恶意IP

```typescript
// 检测到恶意行为，加入黑名单
rateLimitService.addToBlacklist('123.45.67.89');
```

完全阻止访问。

---

## 最佳实践

### 1. 渐进式限制

从宽松开始，逐步收紧：

```typescript
// Week 1: 宽松（观察）
max: 200

// Week 2: 中等（调整）
max: 100

// Week 3: 严格（稳定）
max: 50
```

### 2. 分层防护

```typescript
app.use(blacklistCheck);          // 第1层：黑名单
app.use(await globalRateLimiter()); // 第2层：全局
app.use(await ipRateLimiter());     // 第3层：IP
// 第4层：端点特定限制
```

### 3. 监控和调整

```typescript
// 定期检查统计
const stats = rateLimitService.getStatistics();
console.log('Top endpoints:', stats.topEndpoints);

// 根据流量调整限制
if (stats.totalRequests > 10000) {
  rateLimitService.updateConfig({
    global: { windowMs: 900000, max: 150 }
  });
}
```

### 4. 生产环境使用Redis

```typescript
// .env
RATE_LIMIT_STORE=redis
REDIS_HOST=redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=secret
```

支持分布式部署，多实例共享限制。

### 5. 日志和告警

```typescript
// 记录超限事件
app.use((req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode === 429) {
      console.warn('Rate limit exceeded:', {
        ip: req.ip,
        path: req.path,
        user: req.user?.id,
      });

      // 发送告警
      alertService.send('Rate Limit Alert', {
        ip: req.ip,
        path: req.path,
      });
    }
  });
  next();
});
```

---

## 故障排除

### 问题1: 限制过于严格

**症状**: 正常用户被频繁限制

**解决**:
```typescript
// 放宽限制
rateLimitService.updateConfig({
  global: { max: 200 },  // 增加限额
  byIP: { max: 100 }
});
```

### 问题2: Redis连接失败

**症状**: 应用启动失败，Redis错误

**解决**:
```typescript
// 回退到内存存储
rateLimitService.switchStore('memory');
```

### 问题3: 内部服务被限制

**症状**: 内部API调用失败

**解决**:
```typescript
// 添加到白名单
rateLimitService.addToWhitelist('10.0.0.5');
```

### 问题4: 无法清除限制

**症状**: clearLimit()返回false

**原因**: 内存存储不支持清除

**解决**:
```typescript
// 切换到Redis存储
rateLimitService.switchStore('redis');
```

---

## 性能影响

### 内存存储

- **优点**: 快速，无额外依赖
- **缺点**: 单机限制，重启清空
- **适用**: 开发环境，小规模部署

### Redis存储

- **优点**: 分布式，持久化
- **缺点**: 需要Redis服务
- **适用**: 生产环境，多实例部署

### 性能数据

```
内存存储: ~0.1ms/request
Redis存储: ~1-2ms/request
```

影响几乎可以忽略。

---

## 安全建议

### 1. 不要依赖单一防护

速率限制只是防护的一层，还需要：
- 输入验证
- SQL注入防护
- XSS防护
- CSRF Token

### 2. 定期审查配置

```typescript
// 每周检查黑名单
const blacklist = rateLimitService.getBlacklist();
console.log('Blacklisted IPs:', blacklist);
```

### 3. 监控异常流量

```typescript
// 检测异常
const stats = rateLimitService.getStatistics();
if (stats.totalRequests > NORMAL_THRESHOLD) {
  alertService.send('Abnormal traffic detected');
}
```

### 4. 及时封禁

```typescript
// 自动封禁（示例）
if (failedLoginCount > 10) {
  rateLimitService.addToBlacklist(ip);
}
```

---

## 相关文档

- [Webhook安全](WEBHOOK_SECURITY.md)
- [认证系统](AUTH_SYSTEM.md)
- [API参考](API_REFERENCE_v2.5.0.md)

---

**最后更新**: 2026-03-20
**版本**: v2.5.0 Phase 3.2
**维护者**: AgentForge Team
