# 🔐 Webhook安全验证

**版本**: v2.5.0
**最后更新**: 2026-03-20

AgentForge实现了完整的Webhook签名验证机制，确保接收的Webhook请求来自可信的第三方服务。

---

## 📋 目录

1. [概述](#概述)
2. [支持的服务](#支持的服务)
3. [配置](#配置)
4. [使用方法](#使用方法)
5. [测试](#测试)
6. [安全最佳实践](#安全最佳实践)

---

## 🎯 概述

Webhook签名验证使用HMAC-SHA256算法，通过共享密钥（Secret）验证请求签名，防止：

- ✅ 伪造的Webhook请求
- ✅ 中间人攻击（MITM）
- ✅ 重放攻击
- ✅ 未授权访问

---

## 🔌 支持的服务

### 1. Jira

**签名Header**: `x-jira-signature` 或 `x-hub-signature`
**算法**: HMAC-SHA256
**格式**: `sha256=<signature>`

### 2. GitHub

**签名Header**: `x-hub-signature-256`
**算法**: HMAC-SHA256
**格式**: `sha256=<signature>`

### 3. 自定义服务

支持通过工厂函数创建自定义验证器。

---

## ⚙️ 配置

### 1. 环境变量

在`backend/.env`文件中配置Webhook密钥：

```bash
# Jira Webhook Secret
JIRA_WEBHOOK_SECRET=your_secret_here_change_in_production

# GitHub Webhook Secret
GITHUB_WEBHOOK_SECRET=another_secret_here_change_in_production
```

**安全提示**:
- ✅ 使用强随机密钥（至少32字符）
- ✅ 不要提交到Git（已在.gitignore中）
- ✅ 生产环境使用不同的密钥
- ✅ 定期轮换密钥

### 2. 生成安全密钥

```bash
# 使用Node.js生成随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 或使用OpenSSL
openssl rand -hex 32
```

---

## 📖 使用方法

### 方法1: 使用预定义中间件

#### Jira Webhook

```typescript
import { Router } from 'express';
import { verifyJiraWebhook } from '../middleware/webhookAuth';

const router = Router();

// 应用Jira验证中间件
router.post('/webhooks/jira', verifyJiraWebhook, async (req, res) => {
  const { webhookEvent, issue } = req.body;

  // 签名已验证，安全处理Webhook
  console.log('Jira event:', webhookEvent);
  console.log('Issue:', issue.key);

  res.json({ success: true, received: true });
});

export default router;
```

#### GitHub Webhook

```typescript
import { Router } from 'express';
import { verifyGitHubWebhook } from '../middleware/webhookAuth';

const router = Router();

router.post('/webhooks/github', verifyGitHubWebhook, async (req, res) => {
  const { action, repository } = req.body;

  console.log('GitHub action:', action);
  console.log('Repository:', repository.full_name);

  res.json({ success: true });
});

export default router;
```

---

### 方法2: 使用自定义验证器

```typescript
import { Router } from 'express';
import { createWebhookVerifier } from '../middleware/webhookAuth';

const router = Router();

// 创建自定义验证器
const verifySlackWebhook = createWebhookVerifier(
  'SLACK_WEBHOOK_SECRET',    // 环境变量名
  'X-Slack-Signature',       // 签名Header名称
  'sha256'                   // 签名算法
);

router.post('/webhooks/slack', verifySlackWebhook, async (req, res) => {
  // 处理Slack Webhook
  res.json({ success: true });
});

export default router;
```

---

### 方法3: 在Service中使用

```typescript
import { jiraService } from '../integrations/jira/jiraService';

export const handleJiraWebhook = (req: Request, res: Response) => {
  const signature = req.headers['x-jira-signature'] as string;
  const payload = JSON.stringify(req.body);

  // 使用Service的验证方法
  const isValid = jiraService.verifyWebhook(payload, signature);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 处理Webhook
  res.json({ success: true });
};
```

---

## 🧪 测试

### 单元测试

```bash
# 运行Webhook认证测试
cd backend
npm test -- webhookAuth.test.ts
```

### 手动测试

#### 1. 生成测试签名

```typescript
// test-webhook-signature.ts
import crypto from 'crypto';

const secret = 'your_test_secret';
const payload = JSON.stringify({ test: 'data' });

const hmac = crypto.createHmac('sha256', secret);
const signature = 'sha256=' + hmac.update(payload).digest('hex');

console.log('Signature:', signature);
```

#### 2. 使用curl测试

```bash
# 生成签名
PAYLOAD='{"webhookEvent":"jira:issue_created","issue":{"key":"TEST-1"}}'
SECRET='your_test_secret'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')

# 发送请求
curl -X POST http://localhost:5000/api/webhooks/jira \
  -H "Content-Type: application/json" \
  -H "x-jira-signature: sha256=$SIGNATURE" \
  -d "$PAYLOAD"
```

---

## 🔒 安全最佳实践

### 1. 密钥管理

#### ✅ 推荐做法
```bash
# 使用强随机密钥
JIRA_WEBHOOK_SECRET=$(openssl rand -hex 32)

# 使用环境变量或密钥管理服务
# AWS Secrets Manager
# Azure Key Vault
# HashiCorp Vault
```

#### ❌ 避免做法
```bash
# 不要使用弱密钥
JIRA_WEBHOOK_SECRET=123456

# 不要硬编码在代码中
const secret = 'my-secret';  // ❌

# 不要提交到Git
# 不要在日志中打印密钥
```

---

### 2. HTTPS强制

**生产环境必须使用HTTPS**，否则签名验证无意义：

```typescript
// 强制HTTPS中间件
app.use((req, res, next) => {
  if (!req.secure && process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'HTTPS required'
    });
  }
  next();
});
```

---

### 3. 防重放攻击

添加时间戳验证：

```typescript
export const verifyWebhookTimestamp = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const timestamp = req.headers['x-timestamp'];

  if (!timestamp) {
    return res.status(401).json({ error: 'Missing timestamp' });
  }

  const requestTime = parseInt(timestamp as string);
  const currentTime = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  // 拒绝超过5分钟的请求
  if (Math.abs(currentTime - requestTime) > fiveMinutes) {
    return res.status(401).json({ error: 'Request expired' });
  }

  next();
};

// 使用
router.post('/webhooks/jira',
  verifyWebhookTimestamp,
  verifyJiraWebhook,
  handleJiraWebhook
);
```

---

### 4. 速率限制

防止暴力破解：

```typescript
import rateLimit from 'express-rate-limit';

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 10, // 限制10次请求
  message: 'Too many webhook requests'
});

router.post('/webhooks/jira',
  webhookLimiter,
  verifyJiraWebhook,
  handleJiraWebhook
);
```

---

### 5. IP白名单（可选）

限制只接受来自特定IP的请求：

```typescript
const JIRA_IPS = [
  '104.192.136.0/21',
  '185.166.140.0/22',
  // Jira Cloud IP ranges
];

export const verifyJiraIP = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const clientIP = req.ip;

  // 检查IP是否在白名单中
  if (!isIPInRange(clientIP, JIRA_IPS)) {
    return res.status(403).json({ error: 'IP not allowed' });
  }

  next();
};
```

---

## 🐛 故障排查

### 问题1: 签名验证总是失败

**原因**:
- 密钥不匹配
- Payload格式不一致
- 编码问题

**解决**:
```typescript
// 调试：打印期望的签名
console.log('Expected:', expectedSignature);
console.log('Provided:', providedSignature);
console.log('Payload:', payload);
```

---

### 问题2: 环境变量未加载

**解决**:
```bash
# 检查.env文件
cat backend/.env | grep WEBHOOK

# 检查环境变量
node -e "console.log(process.env.JIRA_WEBHOOK_SECRET)"
```

---

### 问题3: 时序攻击防护失败

**解决**:
使用`crypto.timingSafeEqual()`进行常量时间比较：

```typescript
// ✅ 正确
crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))

// ❌ 错误
a === b  // 会泄露时间信息
```

---

## 📊 性能影响

Webhook签名验证对性能的影响极小：

| 操作 | 平均耗时 |
|------|----------|
| HMAC-SHA256计算 | ~0.5ms |
| 时间安全比较 | ~0.1ms |
| **总计** | **~0.6ms** |

对于Webhook请求（通常几秒响应时间），这个开销可忽略不计。

---

## 📚 相关文档

- [Jira Webhook文档](https://developer.atlassian.com/server/jira/platform/webhooks/)
- [GitHub Webhook文档](https://docs.github.com/en/webhooks)
- [HMAC-SHA256规范](https://tools.ietf.org/html/rfc2104)
- [OWASP Webhook Security](https://cheatsheetseries.owasp.org/cheatsheets/Webhook_Security_Cheat_Sheet.html)

---

## ✅ 检查清单

部署前确保：

- [ ] 配置强随机密钥
- [ ] 启用HTTPS
- [ ] 添加时间戳验证（可选）
- [ ] 配置速率限制
- [ ] 运行单元测试
- [ ] 测试实际Webhook
- [ ] 配置监控和告警
- [ ] 定期轮换密钥

---

**维护者**: AgentForge Security Team
**版本**: v2.5.0
**最后更新**: 2026-03-20
