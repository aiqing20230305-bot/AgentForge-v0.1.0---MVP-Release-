**# OAuth社交登录配置指南

**AgentForge v2.5.0 Phase 1.2 - OAuth Social Login**

---

## 📋 概述

AgentForge支持通过GitHub和Google账号进行快速登录。本指南将帮助您配置OAuth社交登录功能。

### 支持的提供商

- ✅ **GitHub** - 开发者友好
- ✅ **Google** - 用户覆盖广

---

## 🚀 快速开始

### 1. GitHub OAuth配置

#### 步骤1: 创建GitHub OAuth App

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写应用信息:
   - **Application name**: AgentForge
   - **Homepage URL**: `http://localhost:5173` (开发环境)
   - **Authorization callback URL**: `http://localhost:5000/api/auth/oauth/github/callback`
4. 点击 "Register application"
5. 复制 **Client ID** 和 **Client Secret**

#### 步骤2: 配置环境变量

在后端项目根目录创建或编辑 `.env` 文件:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# 启用OAuth
OAUTH_ENABLED=true

# 基础URL
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

---

### 2. Google OAuth配置

#### 步骤1: 创建Google OAuth凭据

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API:
   - 导航到 "APIs & Services" > "Library"
   - 搜索 "Google+ API"
   - 点击 "Enable"
4. 创建OAuth 2.0凭据:
   - 导航到 "APIs & Services" > "Credentials"
   - 点击 "Create Credentials" > "OAuth client ID"
   - 选择 "Web application"
   - 填写信息:
     - **Name**: AgentForge
     - **Authorized JavaScript origins**: `http://localhost:5173`
     - **Authorized redirect URIs**: `http://localhost:5000/api/auth/oauth/google/callback`
5. 点击 "Create"
6. 复制 **Client ID** 和 **Client secret**

#### 步骤2: 配置环境变量

在 `.env` 文件中添加:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## 🔧 生产环境配置

### GitHub生产配置

1. 创建新的GitHub OAuth App用于生产
2. 设置正确的URLs:
   - **Homepage URL**: `https://your-domain.com`
   - **Callback URL**: `https://your-domain.com/api/auth/oauth/github/callback`
3. 更新生产环境变量:

```env
GITHUB_CLIENT_ID=prod_github_client_id
GITHUB_CLIENT_SECRET=prod_github_client_secret
BASE_URL=https://your-domain.com
FRONTEND_URL=https://your-domain.com
```

### Google生产配置

1. 在Google Cloud Console中:
   - 更新 "Authorized JavaScript origins": `https://your-domain.com`
   - 更新 "Authorized redirect URIs": `https://your-domain.com/api/auth/oauth/google/callback`
2. 更新生产环境变量:

```env
GOOGLE_CLIENT_ID=prod_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=prod_google_client_secret
```

---

## 🎨 前端集成

### 使用社交登录按钮

```tsx
import { SocialLoginButtons } from '@/components/SocialLoginButtons';

function LoginPage() {
  return (
    <div>
      <h1>登录</h1>

      {/* 传统登录表单 */}
      <form>
        {/* ... */}
      </form>

      {/* 社交登录按钮 */}
      <SocialLoginButtons
        redirectUrl="/dashboard"
        showDivider={true}
        size="medium"
        variant="outline"
      />
    </div>
  );
}
```

### OAuth回调处理

在路由配置中添加回调页面:

```tsx
import { OAuthCallback } from '@/pages/OAuthCallback';

// React Router
<Route path="/auth/callback" element={<OAuthCallback />} />
```

### 账号管理组件

```tsx
import { LinkedAccountsManager } from '@/components/LinkedAccountsManager';

function SettingsPage() {
  return (
    <div>
      <h1>账号设置</h1>
      <LinkedAccountsManager />
    </div>
  );
}
```

---

## 📖 API使用

### 发起OAuth授权

**GitHub:**
```http
GET /api/auth/oauth/github
```

**Google:**
```http
GET /api/auth/oauth/google
```

可选查询参数:
- `redirect` - 登录成功后的前端重定向URL

### OAuth回调

这些端点由OAuth提供商自动调用，不需要手动请求。

**GitHub回调:**
```http
GET /api/auth/oauth/github/callback?code={code}&state={state}
```

**Google回调:**
```http
GET /api/auth/oauth/google/callback?code={code}&state={state}
```

### 绑定OAuth账号

需要认证。

```http
POST /api/auth/oauth/link/:provider
Content-Type: application/json
Authorization: Bearer {token}

{
  "code": "oauth_authorization_code",
  "state": "oauth_state"
}
```

### 解除OAuth账号绑定

需要认证。

```http
DELETE /api/auth/oauth/unlink/:provider
Authorization: Bearer {token}
```

### 获取已绑定账号列表

需要认证。

```http
GET /api/auth/oauth/linked
Authorization: Bearer {token}
```

响应:
```json
{
  "success": true,
  "data": [
    {
      "provider": "github",
      "email": "user@example.com",
      "name": "GitHub User",
      "linkedAt": "2026-03-21T10:00:00Z"
    },
    {
      "provider": "google",
      "email": "user@gmail.com",
      "name": "Google User",
      "linkedAt": "2026-03-21T11:00:00Z"
    }
  ]
}
```

---

## 🔒 安全最佳实践

### 1. 状态验证 (CSRF防护)

系统自动生成并验证`state`参数，防止CSRF攻击:
- 每次授权请求生成唯一state
- State有效期5分钟
- 回调时验证state

### 2. 环境变量安全

**不要**将Client Secret提交到版本控制:
```gitignore
.env
.env.local
.env.production
```

**生产环境**使用环境变量管理工具:
- Vercel/Netlify: 环境变量面板
- Docker: Docker Secrets
- Kubernetes: Secrets

### 3. HTTPS强制

生产环境必须使用HTTPS:
```typescript
if (process.env.NODE_ENV === 'production' && !req.secure) {
  return res.redirect(`https://${req.headers.host}${req.url}`);
}
```

### 4. Token存储

前端Token存储建议:
- ✅ **HttpOnly Cookie** - 最安全
- ⚠️ **localStorage** - 方便但有XSS风险
- ❌ **sessionStorage** - 标签页关闭即失效

---

## 🐛 故障排除

### 问题1: "redirect_uri_mismatch"

**原因**: Callback URL不匹配

**解决**:
1. 检查OAuth App配置中的Callback URL
2. 确保与`.env`中的`BASE_URL`匹配
3. 确保URL包含协议 (http:// 或 https://)

### 问题2: "invalid_client"

**原因**: Client ID或Secret错误

**解决**:
1. 重新复制Client ID和Secret
2. 检查`.env`文件中是否有多余空格
3. 确认环境变量已正确加载

### 问题3: "access_denied"

**原因**: 用户拒绝授权

**解决**:
- 这是正常行为
- 前端会收到error参数
- 引导用户重试或使用其他登录方式

### 问题4: 无法获取用户email

**GitHub解决方案**:
- 检查scope包含`user:email`
- 用户的GitHub邮箱必须验证
- 系统会自动尝试从emails API获取

**Google解决方案**:
- 检查scope包含`userinfo.email`
- 确保Google+ API已启用

### 问题5: Token过期

**解决**:
- Google支持refresh token (自动处理)
- GitHub需要重新授权
- 实现Token自动刷新机制 (Phase 1.3)

---

## 📊 测试OAuth流程

### 开发环境测试

1. 启动后端:
```bash
cd backend
npm run dev
```

2. 启动前端:
```bash
npm run dev
```

3. 访问 `http://localhost:5173/login`
4. 点击社交登录按钮
5. 完成OAuth授权
6. 应该重定向回前端并自动登录

### 测试账号绑定

1. 使用GitHub登录
2. 访问账号设置页面
3. 点击"绑定Google账号"
4. 完成Google授权
5. 验证两个账号都显示在列表中

---

## 🔗 相关链接

### GitHub
- [OAuth文档](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Scopes说明](https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps)

### Google
- [OAuth 2.0文档](https://developers.google.com/identity/protocols/oauth2)
- [Scopes说明](https://developers.google.com/identity/protocols/oauth2/scopes)

### 其他资源
- [OAuth 2.0 RFC](https://datatracker.ietf.org/doc/html/rfc6749)
- [OWASP OAuth Security](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html)

---

## 📝 配置清单

使用此清单确保配置完整:

### GitHub OAuth
- [ ] 创建GitHub OAuth App
- [ ] 复制Client ID和Secret
- [ ] 设置正确的Callback URL
- [ ] 配置环境变量
- [ ] 测试授权流程

### Google OAuth
- [ ] 创建Google Cloud项目
- [ ] 启用Google+ API
- [ ] 创建OAuth 2.0凭据
- [ ] 复制Client ID和Secret
- [ ] 设置Authorized redirect URIs
- [ ] 配置环境变量
- [ ] 测试授权流程

### 前端集成
- [ ] 添加社交登录按钮
- [ ] 配置OAuth回调路由
- [ ] 添加账号管理页面
- [ ] 测试完整登录流程

### 生产部署
- [ ] 更新生产环境OAuth Apps
- [ ] 配置生产环境变量
- [ ] 启用HTTPS
- [ ] 测试生产环境流程

---

**最后更新**: 2026-03-21
**版本**: v2.5.0 Phase 1.2
**维护者**: AgentForge Team
