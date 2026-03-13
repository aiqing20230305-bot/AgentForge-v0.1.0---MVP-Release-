# 安全守卫 🛡️

严格的安全和隐私保护约束。

## 核心原则

### 1. 数据隐私
- **用户数据**: 所有用户数据严格保密，不得泄露
- **敏感信息**: 密码、token、密钥等必须加密存储
- **日志脱敏**: 日志中不得包含敏感信息
- **传输加密**: 使用 HTTPS/TLS 加密通信

### 2. 权限控制
```javascript
const permissions = {
  admin: ['read', 'write', 'delete', 'manage'],
  user: ['read', 'write'],
  guest: ['read']
}

function checkPermission(user, action) {
  const userPerms = permissions[user.role] || []
  return userPerms.includes(action)
}
```

### 3. 输入验证
- 验证所有用户输入
- 防止 SQL 注入
- 防止 XSS 攻击
- 防止命令注入

### 4. 速率限制
```javascript
const rateLimits = {
  perUser: {
    perMinute: 60,
    perHour: 1000
  },
  perIP: {
    perMinute: 120,
    perHour: 2000
  }
}
```

## 禁止操作

❌ **绝对禁止**:
- 不得存储明文密码
- 不得在日志中记录敏感数据
- 不得绕过权限检查
- 不得执行未经验证的代码
- 不得向第三方泄露数据

## 安全检查清单

✅ 每次操作前检查：
1. 用户是否已认证？
2. 用户是否有权限？
3. 输入是否已验证？
4. 操作是否超过速率限制？
5. 是否需要记录审计日志？

## 应急响应

发现安全问题时：
1. 立即停止相关操作
2. 记录详细日志
3. 通知管理员
4. 启动应急预案
5. 保护现场证据
