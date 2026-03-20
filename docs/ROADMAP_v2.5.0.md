# 🗺️ AgentForge v2.5.0 路线图

**规划日期**: 2026-03-20
**目标发布**: 2026-04-01
**主题**: **认证增强 & 离线同步**

---

## 🎯 版本定位

v2.5.0聚焦于完善用户体验的两大核心：

1. **完整的认证系统** - 后端API集成完成
2. **离线优先架构** - 支持离线工作，自动同步

---

## 📋 功能规划

### Phase 1: 认证系统完善 (40%)

#### 1.1 后端认证API (P0)

**目标**: 完成所有认证相关的后端集成

**任务清单**:
- [ ] 实现用户注册API (`POST /auth/register`)
- [ ] 实现用户登录API (`POST /auth/login`)
- [ ] 实现OAuth回调处理 (`GET /auth/callback`)
- [ ] 实现Token刷新API (`POST /auth/refresh`)
- [ ] 实现访客数据迁移API (`POST /auth/migrate-guest`)

**技术栈**:
- Backend: Express + JWT
- Database: MongoDB User集合
- Security: bcrypt密码加密，JWT签名验证

**API设计**:
```typescript
POST /api/auth/register
{
  email: string
  password: string
  name?: string
}
Response: { token, refreshToken, user }

POST /api/auth/login
{
  email: string
  password: string
}
Response: { token, refreshToken, user }

POST /api/auth/refresh
{
  refreshToken: string
}
Response: { token, refreshToken }

GET /api/auth/callback?code=xxx&provider=github
Response: { token, refreshToken, user }

POST /api/auth/migrate-guest
{
  guestId: string
  newUserId: string
}
Response: { success: boolean, migratedCount: number }
```

**预期完成**: 2026-03-23

---

#### 1.2 OAuth社交登录 (P1)

**支持的OAuth提供商**:
- [ ] GitHub OAuth
- [ ] Google OAuth
- [ ] 微信OAuth (可选)

**功能**:
- 授权流程处理
- 用户信息获取
- Token存储和管理
- 账号绑定

**预期完成**: 2026-03-25

---

#### 1.3 Token管理优化 (P1)

**功能**:
- [ ] 自动Token刷新
- [ ] Token过期检测
- [ ] 无缝重新认证
- [ ] 安全的Token存储（HttpOnly Cookie）

**实现**:
```typescript
// src/services/auth/tokenManager.ts
export class TokenManager {
  private refreshTimer?: NodeJS.Timeout

  startAutoRefresh() {
    // 在Token过期前5分钟刷新
    const expiresIn = this.getTokenExpiry() - Date.now() - 5 * 60 * 1000
    this.refreshTimer = setTimeout(() => this.refreshToken(), expiresIn)
  }

  async refreshToken() {
    const refreshToken = this.getRefreshToken()
    const { token, refreshToken: newRefreshToken } =
      await api.post('/auth/refresh', { refreshToken })

    this.setTokens(token, newRefreshToken)
    this.startAutoRefresh()
  }
}
```

**预期完成**: 2026-03-26

---

### Phase 2: 离线同步系统 (40%)

#### 2.1 离线数据存储 (P0)

**目标**: 完善IndexedDB离线存储

**功能**:
- [ ] Agent数据离线缓存
- [ ] Task数据离线缓存
- [ ] Analytics数据离线缓存
- [ ] 离线创建/编辑支持

**实现**:
```typescript
// src/services/offline/offlineStore.ts
export class OfflineStore {
  private db: IDBDatabase

  async saveOffline(collection: string, data: any) {
    const tx = this.db.transaction([collection], 'readwrite')
    const store = tx.objectStore(collection)

    await store.put({
      ...data,
      _offline: true,
      _timestamp: Date.now()
    })
  }

  async getOfflineItems(collection: string) {
    const tx = this.db.transaction([collection], 'readonly')
    const store = tx.objectStore(collection)
    const items = await store.getAll()

    return items.filter(item => item._offline)
  }
}
```

**预期完成**: 2026-03-27

---

#### 2.2 同步冲突解决 (P1)

**策略**:
1. **最后写入获胜** (Last Write Wins)
2. **版本向量** (Vector Clocks)
3. **手动解决** (Manual Resolution)

**实现**:
```typescript
interface SyncConflict {
  id: string
  localVersion: any
  remoteVersion: any
  conflictType: 'update' | 'delete'
  timestamp: Date
}

async function resolveConflict(conflict: SyncConflict): Promise<any> {
  // 策略1: 最后写入获胜
  if (conflict.localVersion._timestamp > conflict.remoteVersion._timestamp) {
    return conflict.localVersion
  }

  // 策略2: 提示用户选择
  const choice = await showConflictDialog(conflict)
  return choice === 'local' ? conflict.localVersion : conflict.remoteVersion
}
```

**预期完成**: 2026-03-29

---

#### 2.3 后台同步API (P0)

**目标**: 实现完整的同步API

**API端点**:
```typescript
// 获取服务器最新数据
GET /api/sync/pull?since=timestamp
Response: {
  agents: Agent[],
  tasks: Task[],
  lastSync: Date
}

// 推送本地更改
POST /api/sync/push
{
  agents: { created: [], updated: [], deleted: [] },
  tasks: { created: [], updated: [], deleted: [] }
}
Response: {
  success: boolean,
  conflicts: SyncConflict[]
}

// 获取同步状态
GET /api/sync/status
Response: {
  lastSync: Date,
  pendingChanges: number,
  conflicts: number
}
```

**预期完成**: 2026-03-28

---

### Phase 3: 安全增强 (10%)

#### 3.1 Webhook签名验证 (P0 - 高优先级)

**位置**: `backend/src/integrations/jira/jiraService.ts:218`

**功能**:
- [ ] HMAC-SHA256签名生成
- [ ] 签名验证中间件
- [ ] 时间戳防重放攻击

**实现**:
```typescript
import crypto from 'crypto'

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  )
}

// Middleware
export const webhookAuth = (req, res, next) => {
  const signature = req.headers['x-jira-signature']
  const payload = JSON.stringify(req.body)
  const secret = process.env.JIRA_WEBHOOK_SECRET

  if (!verifyWebhookSignature(payload, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  next()
}
```

**预期完成**: 2026-03-21 (立即)

---

#### 3.2 API速率限制 (P1)

**功能**:
- [ ] 基于IP的速率限制
- [ ] 基于用户的速率限制
- [ ] 429响应和Retry-After头

**实现**:
```typescript
import rateLimit from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制100次请求
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP'
})

// 使用
app.use('/api/', apiLimiter)
```

**预期完成**: 2026-03-30

---

### Phase 4: Analytics组件完善 (10%)

#### 4.1 自定义报表拖拽 (P1)

**位置**: `src/components/Analytics/CustomReports.tsx:25`

**功能**:
- [ ] React DnD集成
- [ ] 拖拽排序
- [ ] 布局保存

**技术栈**: react-beautiful-dnd

**预期完成**: 2026-03-31

---

#### 4.2 深度分析模块 (P2)

**位置**: `src/components/Analytics/DeepAnalysis.tsx:20`

**功能**:
- [ ] 多维度分析
- [ ] 数据钻取
- [ ] 导出报告

**预期完成**: v2.6.0延后

---

#### 4.3 实时Dashboard增强 (P2)

**位置**: `src/components/Analytics/RealtimeDashboard.tsx:41`

**功能**:
- [ ] ECharts实时图表
- [ ] WebSocket数据推送
- [ ] 性能优化

**预期完成**: v2.6.0延后

---

## 📊 完成度目标

| Phase | 功能 | 权重 | 目标完成度 |
|-------|------|------|-----------|
| Phase 1 | 认证系统完善 | 40% | 100% |
| Phase 2 | 离线同步系统 | 40% | 100% |
| Phase 3 | 安全增强 | 10% | 100% |
| Phase 4 | Analytics完善 | 10% | 50% |
| **总计** | | **100%** | **95%** |

---

## 🗓️ 时间线

```
2026-03-20  项目启动，规划完成
├─ 03-21   Phase 3.1: Webhook签名验证
├─ 03-22
├─ 03-23   Phase 1.1: 认证API完成
├─ 03-24
├─ 03-25   Phase 1.2: OAuth集成
├─ 03-26   Phase 1.3: Token管理
├─ 03-27   Phase 2.1: 离线存储
├─ 03-28   Phase 2.3: 同步API
├─ 03-29   Phase 2.2: 冲突解决
├─ 03-30   Phase 3.2: 速率限制
├─ 03-31   Phase 4.1: 自定义报表
└─ 04-01   v2.5.0发布 🎉
```

---

## 🎯 成功指标

### 功能完成度
- ✅ 认证系统100%后端集成
- ✅ 离线模式正常工作
- ✅ 同步无数据丢失
- ✅ Webhook安全验证

### 性能指标
- 认证API响应 < 200ms
- 同步API响应 < 500ms
- 离线模式启动 < 1s
- 冲突解决 < 100ms

### 质量指标
- 单元测试覆盖率 > 80%
- 集成测试通过率 100%
- 无关键安全漏洞
- 文档完整度 100%

---

## 🚀 技术栈

### 新增依赖

**Backend**:
```json
{
  "express-rate-limit": "^6.7.0",
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^5.1.1"
}
```

**Frontend**:
```json
{
  "react-beautiful-dnd": "^13.1.1",
  "idb": "^7.1.1"
}
```

---

## 📚 文档计划

### 新增文档
- [ ] AUTH_API_REFERENCE.md - 认证API文档
- [ ] OFFLINE_SYNC_GUIDE.md - 离线同步使用指南
- [ ] SECURITY_BEST_PRACTICES.md - 安全最佳实践

### 更新文档
- [ ] API_REFERENCE - 添加认证和同步端点
- [ ] DEPLOYMENT_GUIDE - 添加OAuth配置说明
- [ ] README - 更新功能列表

---

## ⚠️ 风险评估

### 高风险项
1. **OAuth集成复杂度** - 多个提供商，不同的授权流程
   - 缓解：先完成GitHub，再扩展其他

2. **同步冲突处理** - 复杂的业务逻辑
   - 缓解：采用简单的LWW策略，后续迭代

3. **离线数据一致性** - IndexedDB可靠性
   - 缓解：充分测试，添加数据校验

### 中风险项
1. **性能影响** - 同步可能占用带宽
   - 缓解：增量同步，压缩数据

2. **Token安全** - XSS/CSRF攻击风险
   - 缓解：HttpOnly Cookie，CSRF Token

---

## 🔄 延后到v2.6.0的功能

以下功能优先级较低，延后到下一版本：

1. **Analytics深度分析** - 复杂度高，v2.4.0已覆盖基础
2. **实时Dashboard增强** - 当前已有5秒刷新，可延后
3. **Electron自动更新** - 非核心功能
4. **微信OAuth** - 国际化优先GitHub/Google

---

## 📝 开发规范

### 分支策略
```
main (生产)
  └─ feat/v2.5.0 (开发主分支)
       ├─ feat/v2.5.0-auth (认证系统)
       ├─ feat/v2.5.0-sync (离线同步)
       └─ feat/v2.5.0-security (安全增强)
```

### Commit规范
```
feat(auth): 实现用户注册API
fix(sync): 修复冲突解决逻辑
docs(api): 更新认证API文档
test(auth): 添加JWT验证测试
```

---

## 🎉 发布计划

### v2.5.0-alpha (2026-03-23)
- Phase 1认证系统完成
- 内部测试

### v2.5.0-beta (2026-03-28)
- Phase 2离线同步完成
- 公开测试

### v2.5.0-rc (2026-03-31)
- 所有功能完成
- 最终测试

### v2.5.0 (2026-04-01)
- 正式发布 🚀

---

## 💬 反馈渠道

- **GitHub Issues**: 功能建议和Bug报告
- **Discord**: 实时讨论和技术支持
- **Email**: support@agentforge.io

---

**规划者**: AgentForge Team
**版本**: v2.5.0 Roadmap v1.0
**最后更新**: 2026-03-20
