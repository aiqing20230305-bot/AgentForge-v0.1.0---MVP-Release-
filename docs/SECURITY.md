# 🔒 AgentForge Security Policy

## 安全配置指南

### 1. 环境变量配置

**永远不要在代码中硬编码敏感信息！**

#### 前端环境变量 (`.env`)

```bash
# 仅包含非敏感配置
VITE_API_URL=http://localhost:3001/api/v1
VITE_APP_ENV=development
VITE_ENABLE_CLOUD_SYNC=true
VITE_ENABLE_REALTIME=true
VITE_ENABLE_ANALYTICS=false
VITE_DEBUG=false

# OpenClaw Token（如需要）
VITE_OPENCLAW_TOKEN=your_token_here
```

#### 后端环境变量 (`backend/.env`)

```bash
# Environment
NODE_ENV=production

# Server
PORT=3001

# MongoDB - 使用环境变量，不要硬编码
MONGODB_URI=mongodb://localhost:27017/agentforge

# JWT - 使用强随机密钥
JWT_SECRET=<生成的强随机密钥>
JWT_REFRESH_SECRET=<生成的强随机密钥>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:5173

# OAuth (如需要)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

### 2. 生成安全的JWT密钥

```bash
# 使用Node.js生成强随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 或使用OpenSSL
openssl rand -base64 32
```

**⚠️ 重要：生成后的密钥应该：**
- 至少32字节（256位）
- 完全随机
- 每个环境使用不同的密钥
- 定期轮换（建议每3-6个月）

### 3. 文件权限配置

```bash
# 设置.env文件权限（仅所有者可读写）
chmod 600 .env
chmod 600 backend/.env

# 设置脚本执行权限
chmod 755 scripts/*.sh
```

### 4. Git安全配置

```bash
# 确保敏感文件已在.gitignore中
# 检查是否有敏感文件被追踪
git ls-files | grep -E "\.env$|secret|key|token" | grep -v example

# 如果发现敏感文件已被追踪，立即移除
git rm --cached <sensitive-file>
git commit -m "security: Remove sensitive file from Git"
```

### 5. 数据库安全

**MongoDB安全配置：**

```javascript
// 启用认证
use admin
db.createUser({
  user: "agentforge_admin",
  pwd: "<strong_password>",
  roles: [ { role: "readWrite", db: "agentforge" } ]
})

// 连接字符串使用认证
mongodb://username:password@localhost:27017/agentforge?authSource=admin
```

**备份策略：**
- 定期备份数据库
- 备份文件加密存储
- 备份文件不要提交到Git

### 6. API安全最佳实践

#### 6.1 速率限制

```typescript
// backend/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制100个请求
  message: 'Too many requests from this IP'
})
```

#### 6.2 CORS配置

```typescript
// 仅允许特定域名
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
}
```

#### 6.3 输入验证

```typescript
// 使用Joi或Zod验证所有输入
import Joi from 'joi'

const agentSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  avatar: Joi.string().max(10),
  skills: Joi.array().items(Joi.string())
})
```

### 7. 前端安全

#### 7.1 XSS防护

```typescript
// 使用DOMPurify清理用户输入
import DOMPurify from 'dompurify'

const cleanHTML = DOMPurify.sanitize(userInput)
```

#### 7.2 敏感数据处理

```typescript
// 不要在localStorage存储敏感信息
// ❌ 不好
localStorage.setItem('token', jwtToken)

// ✅ 好 - 使用HttpOnly Cookie
// 或使用sessionStorage（会话结束后清除）
sessionStorage.setItem('sessionId', sessionId)
```

### 8. 部署安全

#### 8.1 生产环境检查清单

- [ ] 所有.env文件已配置正确的生产值
- [ ] JWT密钥已更换为生产环境专用密钥
- [ ] 数据库连接使用强密码
- [ ] CORS配置仅允许生产域名
- [ ] 启用HTTPS（SSL/TLS）
- [ ] 禁用调试模式
- [ ] 日志不包含敏感信息
- [ ] 错误消息不泄露内部信息
- [ ] 已配置防火墙规则
- [ ] 定期更新依赖包

#### 8.2 Docker部署安全

```dockerfile
# 使用非root用户运行
USER node

# 不要在镜像中包含.env文件
# 使用Docker secrets或环境变量注入
```

### 9. 监控和审计

#### 9.1 日志记录

```typescript
// 记录敏感操作，但不记录敏感数据
logger.info('User login', { userId, timestamp })
// ❌ 不要记录密码、token等
```

#### 9.2 安全事件监控

- 登录失败次数
- API异常请求
- 权限越权尝试
- 数据库异常查询

### 10. 依赖安全

```bash
# 定期检查依赖漏洞
npm audit

# 自动修复已知漏洞
npm audit fix

# 使用Snyk或Dependabot自动监控
```

---

## 报告安全漏洞

如果您发现安全漏洞，请**不要**公开披露。

**安全报告方式：**
- 📧 发送邮件到：security@agentforge.dev
- 🔒 使用GPG加密（公钥见下方）
- ⏱️ 我们将在48小时内响应

**请包含：**
- 漏洞描述
- 复现步骤
- 影响范围
- 可能的修复建议

---

## 安全更新

我们会定期发布安全更新，订阅方式：
- GitHub Security Advisories
- Release Notes (标记为Security)
- 安全邮件列表（即将推出）

---

## 致谢

感谢所有报告安全问题的研究人员。我们承诺：
- 快速响应和修复
- 在修复后公开感谢（如您同意）
- 提供漏洞奖励计划（规划中）

---

**最后更新**: 2026-03-18
**版本**: v1.0
