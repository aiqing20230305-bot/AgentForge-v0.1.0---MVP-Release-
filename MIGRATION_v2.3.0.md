# 🔄 AgentForge v2.3.0 Migration Guide

**从 v2.2.x 升级到 v2.3.0 的完整指南**

---

## 📋 目录

1. [升级前准备](#升级前准备)
2. [升级步骤](#升级步骤)
3. [环境变量配置](#环境变量配置)
4. [数据库迁移](#数据库迁移)
5. [功能迁移指南](#功能迁移指南)
6. [API变更](#api变更)
7. [常见问题排查](#常见问题排查)
8. [回滚步骤](#回滚步骤)
9. [性能优化建议](#性能优化建议)

---

## 升级前准备

### 1. 兼容性检查

**v2.3.0 要求：**
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB >= 5.0（如使用数据库）
- Redis >= 6.0（如使用缓存）

**检查命令：**
```bash
node --version  # 应该 >= 18.0.0
npm --version   # 应该 >= 9.0.0
```

### 2. 备份数据

**重要：升级前请务必备份数据！**

```bash
# 备份数据库（如使用MongoDB）
mongodump --uri="mongodb://localhost:27017/agentforge" --out=./backup/v2.2.x-$(date +%Y%m%d)

# 备份配置文件
cp .env .env.backup.v2.2.x
cp -r config config.backup.v2.2.x

# 备份用户数据（如使用本地存储）
tar -czf user_data_backup_v2.2.x.tar.gz ./data
```

### 3. 检查当前版本

```bash
# 查看当前版本
cat package.json | grep version

# 查看git状态
git status

# 确保没有未提交的更改
git diff
```

---

## 升级步骤

### Step 1: 拉取最新代码

```bash
# 切换到main分支
git checkout main

# 拉取v2.3.0标签
git fetch --tags

# 切换到v2.3.0
git checkout v2.3.0
```

### Step 2: 安装依赖

```bash
# 清理旧依赖
rm -rf node_modules package-lock.json

# 安装新依赖
npm install

# 如果使用后端
cd backend
rm -rf node_modules package-lock.json
npm install
cd ..
```

### Step 3: 环境变量配置（可选）

```bash
# 复制新的环境变量模板
cp .env.example .env.new

# 比较差异
diff .env.backup.v2.2.x .env.new

# 手动合并配置（保留旧配置，添加新配置）
```

### Step 4: 运行数据库迁移（如需要）

```bash
# 检查是否有数据库迁移
npm run db:migrate:check

# 执行迁移
npm run db:migrate

# 验证迁移成功
npm run db:migrate:verify
```

### Step 5: 启动应用

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

### Step 6: 验证升级

访问以下页面验证新功能：

- ✅ 主页: `http://localhost:5173`
- ✅ 游戏化: `http://localhost:5173/gamification`
- ✅ 通知中心: `http://localhost:5173/notifications`
- ✅ RTL测试: `http://localhost:5173/rtl-test`
- ✅ 报表: `http://localhost:5173/reports`

---

## 环境变量配置

### 新增环境变量（可选）

v2.3.0 新增以下可选环境变量：

```env
# ========================================
# OAuth2 SSO配置（可选）
# ========================================

# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback/google

# GitHub OAuth2
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:5173/auth/callback/github

# ========================================
# 通知系统配置（可选）
# ========================================

# Email通知
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@agentforge.dev

# Push通知（Web Push）
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@agentforge.dev

# ========================================
# 报表系统配置（可选）
# ========================================

# 报表缓存TTL（秒）
REPORT_CACHE_TTL=3600

# 报表导出路径
REPORT_EXPORT_PATH=./exports/reports

# ========================================
# 游戏化系统配置（可选）
# ========================================

# 成就系统
ACHIEVEMENT_CACHE_TTL=7200
ACHIEVEMENT_UNLOCK_WEBHOOK=https://your-webhook-url.com/achievements

# 排行榜刷新间隔（秒）
LEADERBOARD_REFRESH_INTERVAL=300

# ========================================
# 国际化配置（可选）
# ========================================

# 默认语言
DEFAULT_LOCALE=en-US

# 支持的语言列表
SUPPORTED_LOCALES=en-US,zh-CN,ar-SA

# RTL语言列表
RTL_LOCALES=ar-SA
```

### 配置获取指南

#### Google OAuth2 配置

1. 访问 [Google Cloud Console](https://console.cloud.google.com)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 凭据
5. 配置授权重定向URI: `http://localhost:5173/auth/callback/google`
6. 复制 Client ID 和 Client Secret

#### GitHub OAuth2 配置

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 创建新的 OAuth App
3. 配置 Authorization callback URL: `http://localhost:5173/auth/callback/github`
4. 复制 Client ID 和 Client Secret

#### SMTP Email 配置

**Gmail 示例：**
1. 启用2FA
2. 生成应用专用密码
3. 使用应用密码作为 SMTP_PASS

**其他邮箱提供商：**
- SendGrid: `smtp.sendgrid.net:587`
- Mailgun: `smtp.mailgun.org:587`
- AWS SES: `email-smtp.region.amazonaws.com:587`

---

## 数据库迁移

### 自动迁移（推荐）

v2.3.0 提供自动迁移脚本：

```bash
# 检查迁移状态
npm run db:migrate:status

# 执行迁移（会自动备份）
npm run db:migrate

# 查看迁移日志
cat logs/migration-v2.3.0.log
```

### 手动迁移（高级）

如果自动迁移失败，可以手动执行：

```javascript
// 连接到MongoDB
use agentforge

// 1. 添加游戏化系统字段
db.users.updateMany(
  {},
  {
    $set: {
      'gamification.level': 1,
      'gamification.xp': 0,
      'gamification.achievements': [],
      'gamification.currency': {
        coins: 100,
        gems: 0,
        tickets: 0
      }
    }
  }
)

// 2. 添加通知偏好字段
db.users.updateMany(
  {},
  {
    $set: {
      'notificationPreferences.channels': {
        email: { enabled: true, frequency: 'instant' },
        push: { enabled: true, sound: true, vibrate: true },
        inApp: { enabled: true, toast: true, badge: true }
      },
      'notificationPreferences.types': {
        system: { email: true, push: true, inApp: true },
        agent: { email: true, push: true, inApp: true },
        task: { email: true, push: false, inApp: true },
        achievement: { email: false, push: true, inApp: true },
        social: { email: false, push: true, inApp: true },
        team: { email: true, push: true, inApp: true }
      }
    }
  }
)

// 3. 添加语言偏好
db.users.updateMany(
  {},
  {
    $set: {
      'preferences.locale': 'en-US',
      'preferences.direction': 'ltr'
    }
  }
)

// 4. 创建新索引
db.achievements.createIndex({ userId: 1, achievementId: 1 }, { unique: true })
db.notifications.createIndex({ userId: 1, createdAt: -1 })
db.reports.createIndex({ templateId: 1, createdAt: -1 })

// 验证迁移
db.users.findOne()
```

### 迁移验证

```bash
# 运行验证脚本
npm run db:verify

# 检查数据完整性
npm run db:check
```

---

## 功能迁移指南

### 1. 游戏化系统 v2.0 🎮

#### 现有用户自动升级

v2.3.0 会自动为现有用户初始化游戏化数据：

- **初始等级**: Level 1
- **初始XP**: 0
- **初始货币**: 100 金币
- **成就**: 根据历史行为自动解锁相关成就

#### 采用游戏化功能

```typescript
// 在您的组件中使用游戏化Store
import { useGamificationStore } from '@/store/useGamificationStore'

function MyComponent() {
  const {
    level,
    xp,
    currency,
    achievements,
    unlockAchievement,
    addCurrency
  } = useGamificationStore()

  // 解锁成就
  const handleCompleteTask = async () => {
    await completeTask()
    unlockAchievement('first_task')
  }

  // 添加货币
  const handleReward = () => {
    addCurrency('coins', 50)
  }

  return (
    <div>
      <CurrencyDisplay />
      <div>Level {level} - {xp} XP</div>
    </div>
  )
}
```

#### 迁移旧的进度系统

如果您有自定义的进度/奖励系统：

```typescript
// 旧系统
const oldProgress = {
  points: 1000,
  badges: ['early_adopter', 'power_user']
}

// 映射到新系统
import { useGamificationStore } from '@/store/useGamificationStore'

const migrateProgress = async () => {
  const { addXP, unlockAchievement } = useGamificationStore.getState()

  // 转换积分为XP（1:1比例）
  await addXP(oldProgress.points)

  // 转换徽章为成就
  for (const badge of oldProgress.badges) {
    const achievementId = badgeToAchievementMap[badge]
    await unlockAchievement(achievementId)
  }
}
```

### 2. 通知管理系统 🔔

#### 迁移现有通知

v2.3.0 的通知系统向后兼容，旧通知会自动转换：

```typescript
// 旧格式通知（v2.2.x）
{
  message: "Task completed",
  timestamp: new Date()
}

// 自动转换为新格式（v2.3.0）
{
  id: "auto-generated-id",
  type: "task",
  priority: "medium",
  title: "Task completed",
  message: "Task completed",
  timestamp: new Date(),
  read: false
}
```

#### 配置通知偏好

```typescript
// 使用新的通知设置组件
import { NotificationSettings } from '@/components/Notifications/NotificationSettings'

function SettingsPage() {
  return (
    <div>
      <h2>Notification Preferences</h2>
      <NotificationSettings />
    </div>
  )
}
```

#### 发送通知（开发者）

```typescript
// 旧方式（仍然支持）
await sendNotification({
  userId: 'user123',
  message: 'Hello'
})

// 新方式（推荐）
await sendNotification({
  userId: 'user123',
  type: 'system',
  priority: 'high',
  title: 'Important Update',
  message: 'Hello',
  action: {
    label: 'View Details',
    url: '/details'
  }
})
```

### 3. RTL支持 + 国际化 🌍

#### 切换到RTL布局

```typescript
// 使用语言切换器
import { useTranslation } from 'react-i18next'

function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const switchToArabic = () => {
    i18n.changeLanguage('ar-SA') // 自动切换到RTL
  }

  return (
    <button onClick={switchToArabic}>
      العربية
    </button>
  )
}
```

#### 适配自定义组件

如果您有自定义组件，需要支持RTL：

```typescript
// 使用RTL工具Hook
import { useRTL } from '@/hooks/useRTL'

function CustomComponent() {
  const { isRTL, dir } = useRTL()

  return (
    <div dir={dir} className={isRTL ? 'rtl-mode' : 'ltr-mode'}>
      {/* 使用逻辑属性 */}
      <div style={{
        marginInlineStart: '20px',  // 替代 marginLeft
        paddingInlineEnd: '10px'     // 替代 paddingRight
      }}>
        Content
      </div>
    </div>
  )
}
```

### 4. SSO认证 🔐

#### 集成OAuth2登录

在登录页面添加SSO按钮：

```typescript
import { SSOLoginButtons } from '@/components/Auth/SSOLoginButtons'

function LoginPage() {
  return (
    <div>
      <h1>Login</h1>

      {/* 传统登录表单 */}
      <LoginForm />

      {/* SSO登录按钮 */}
      <SSOLoginButtons
        providers={['google', 'github']}
        onSuccess={(user) => {
          console.log('SSO login success', user)
          navigate('/dashboard')
        }}
        onError={(error) => {
          console.error('SSO login failed', error)
        }}
      />
    </div>
  )
}
```

#### 处理OAuth回调

路由配置已自动处理，无需额外配置：

```typescript
// 已内置的回调路由
// /auth/callback/google
// /auth/callback/github
```

#### 获取SSO用户信息

```typescript
import { useAuth } from '@/hooks/useAuth'

function Profile() {
  const { user, isAuthenticated, ssoProvider } = useAuth()

  if (isAuthenticated && ssoProvider) {
    return (
      <div>
        <p>Logged in via {ssoProvider}</p>
        <p>Email: {user.email}</p>
        {user.ssoProfile?.avatar && (
          <img src={user.ssoProfile.avatar} alt="Avatar" />
        )}
      </div>
    )
  }
}
```

### 5. 报表系统 📊

#### 使用预定义报表模板

```typescript
import { ReportBuilder } from '@/components/Reports/ReportBuilder'
import { ReportViewer } from '@/components/Reports/ReportViewer'

function ReportsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [reportData, setReportData] = useState(null)

  const handleGenerateReport = async (template, filters) => {
    const data = await generateReport(template.id, filters)
    setReportData(data)
  }

  return (
    <div>
      {!reportData ? (
        <ReportBuilder
          onSelectTemplate={setSelectedTemplate}
          onGenerateReport={handleGenerateReport}
        />
      ) : (
        <ReportViewer
          template={selectedTemplate}
          data={reportData}
          onBack={() => setReportData(null)}
        />
      )}
    </div>
  )
}
```

#### 自定义报表模板

```typescript
// 创建自定义报表模板
import { registerReportTemplate } from '@/services/reports/reportTemplates'

registerReportTemplate({
  id: 'custom_sales_report',
  name: 'Custom Sales Report',
  description: 'My custom sales analysis',
  category: 'analytics',
  icon: '💰',
  chartType: 'bar',
  query: {
    collection: 'sales',
    aggregations: [
      { field: 'total', function: 'sum' },
      { field: 'commission', function: 'avg' }
    ],
    filters: {
      status: 'completed',
      date: { $gte: '2026-01-01' }
    }
  }
})
```

---

## API变更

### 向后兼容

**好消息：v2.3.0 完全向后兼容 v2.2.x！**

所有旧的API端点仍然可用，您无需修改现有代码。

### 新增API端点

#### 游戏化API

```typescript
// 获取用户游戏化数据
GET /api/gamification/user/:userId
Response: { level, xp, currency, achievements, stats }

// 解锁成就
POST /api/gamification/achievements/unlock
Body: { userId, achievementId }

// 添加货币
POST /api/gamification/currency/add
Body: { userId, currencyType, amount }

// 获取排行榜
GET /api/gamification/leaderboard?type=global&metric=xp&period=weekly
```

#### 通知API

```typescript
// 获取通知列表（增强）
GET /api/notifications?filters={"type":"system","priority":"high"}&limit=50

// 批量操作
POST /api/notifications/batch
Body: { action: 'markRead', notificationIds: [...] }

// 更新通知偏好
PUT /api/notifications/preferences
Body: { channels: {...}, types: {...}, dnd: {...} }
```

#### 报表API

```typescript
// 生成报表
POST /api/reports/generate
Body: { templateId, filters, dateRange }

// 导出报表
POST /api/reports/export
Body: { reportId, format: 'csv' | 'json' | 'pdf' | 'excel' }

// 获取报表历史
GET /api/reports/history?userId=xxx&limit=20
```

#### SSO API

```typescript
// OAuth授权URL
GET /api/auth/oauth/:provider/authorize

// OAuth回调处理
GET /api/auth/oauth/:provider/callback?code=xxx&state=xxx

// 刷新Token
POST /api/auth/oauth/refresh
Body: { refreshToken }

// 撤销Token
POST /api/auth/oauth/revoke
Body: { accessToken }
```

### API变更详情

**无破坏性变更** ✅

所有API变更都是**增量添加**，不影响现有功能。

---

## 常见问题排查

### 问题1: 依赖安装失败

**症状：**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**解决方案：**
```bash
# 清理npm缓存
npm cache clean --force

# 删除node_modules和lock文件
rm -rf node_modules package-lock.json

# 使用 --legacy-peer-deps
npm install --legacy-peer-deps

# 或使用 --force
npm install --force
```

### 问题2: 游戏化数据未显示

**症状：** 升级后游戏化组件显示空白或错误

**解决方案：**
```bash
# 运行数据库迁移
npm run db:migrate

# 手动初始化用户游戏化数据
npm run scripts:init-gamification

# 清理浏览器缓存和localStorage
```

### 问题3: RTL布局错乱

**症状：** 切换到Arabic后布局显示异常

**解决方案：**
```typescript
// 1. 确保HTML根元素有dir属性
document.documentElement.dir = 'rtl'

// 2. 清理CSS缓存
// 硬刷新页面: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

// 3. 检查自定义CSS是否使用了逻辑属性
// ❌ 错误: margin-left: 20px;
// ✅ 正确: margin-inline-start: 20px;
```

### 问题4: SSO登录失败

**症状：** 点击Google/GitHub登录无响应或报错

**解决方案：**
```bash
# 1. 检查环境变量配置
echo $GOOGLE_CLIENT_ID
echo $GITHUB_CLIENT_ID

# 2. 验证回调URL配置
# Google: http://localhost:5173/auth/callback/google
# GitHub: http://localhost:5173/auth/callback/github

# 3. 检查OAuth应用状态（是否启用）

# 4. 查看浏览器控制台错误
# 打开DevTools -> Console
```

### 问题5: 报表生成超时

**症状：** 生成报表时长时间加载或超时

**解决方案：**
```bash
# 1. 检查数据量
db.agents.count()  # 如果 > 10000，可能需要优化

# 2. 增加超时时间
# .env
REPORT_GENERATION_TIMEOUT=60000  # 60秒

# 3. 使用日期范围过滤减少数据量

# 4. 检查数据库索引
db.agents.getIndexes()
```

### 问题6: 性能下降

**症状：** 升级后页面加载变慢

**解决方案：**
```bash
# 1. 启用生产模式构建
npm run build
NODE_ENV=production npm start

# 2. 检查是否启用了虚拟化列表
# 成就墙和通知列表应该自动使用虚拟化

# 3. 清理浏览器缓存

# 4. 检查网络请求
# DevTools -> Network -> 查找慢请求

# 5. 优化数据库查询
# 添加索引，限制查询结果数量
```

### 问题7: 通知不工作

**症状：** 通知不显示或推送失败

**解决方案：**
```bash
# 1. 检查通知权限
# 浏览器 -> 设置 -> 网站权限 -> 通知

# 2. 检查Service Worker注册
# DevTools -> Application -> Service Workers

# 3. 验证VAPID密钥配置
echo $VAPID_PUBLIC_KEY

# 4. 测试WebSocket连接
# DevTools -> Network -> WS -> 查看连接状态

# 5. 检查通知偏好设置
# 确保对应类型和渠道已启用
```

---

## 回滚步骤

如果升级遇到严重问题，可以回滚到v2.2.x：

### Step 1: 回滚代码

```bash
# 切换回v2.2.x标签
git checkout v2.2.x

# 或回滚到特定commit
git checkout <v2.2.x-commit-hash>
```

### Step 2: 恢复依赖

```bash
# 重新安装v2.2.x依赖
rm -rf node_modules package-lock.json
npm install
```

### Step 3: 恢复数据库（如需要）

```bash
# 恢复MongoDB备份
mongorestore --uri="mongodb://localhost:27017/agentforge" ./backup/v2.2.x-<date>/agentforge

# 或使用自动备份
npm run db:restore -- --version=v2.2.x
```

### Step 4: 恢复配置

```bash
# 恢复环境变量
cp .env.backup.v2.2.x .env

# 恢复其他配置文件
cp -r config.backup.v2.2.x/* config/
```

### Step 5: 启动应用

```bash
npm run dev
# 或
npm run build && npm start
```

### Step 6: 验证回滚

- ✅ 检查版本号
- ✅ 测试核心功能
- ✅ 验证数据完整性

---

## 性能优化建议

### 1. 启用虚拟化列表

v2.3.0 默认为大列表启用虚拟化，但可以调整：

```typescript
import { VirtualizedAchievementWall } from '@/components/Gamification/AchievementWallV2'

<VirtualizedAchievementWall
  itemHeight={120}        // 调整项目高度
  overscanCount={3}       // 预渲染数量
  estimatedItemSize={120} // 估算大小
/>
```

### 2. 配置报表缓存

```env
# .env
REPORT_CACHE_TTL=3600  # 1小时缓存
REPORT_CACHE_ENABLED=true
```

### 3. 优化数据库查询

```javascript
// 创建必要的索引
db.achievements.createIndex({ userId: 1, unlockedAt: -1 })
db.notifications.createIndex({ userId: 1, read: 1, createdAt: -1 })
db.reports.createIndex({ templateId: 1, userId: 1, createdAt: -1 })
db.agents.createIndex({ userId: 1, status: 1, updatedAt: -1 })
```

### 4. 启用CDN（生产环境）

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'charts': ['recharts'],
          'i18n': ['react-i18next', 'i18next'],
        }
      }
    }
  }
})
```

### 5. 配置Service Worker缓存策略

```typescript
// src/serviceWorker.ts
const CACHE_STRATEGY = {
  images: 'CacheFirst',      // 图片优先缓存
  api: 'NetworkFirst',       // API优先网络
  static: 'StaleWhileRevalidate' // 静态资源后台更新
}
```

---

## 升级后检查清单

完成升级后，请逐项检查：

### 基础功能 ✅
- [ ] 应用正常启动
- [ ] 用户可以登录
- [ ] 数据正确显示
- [ ] 无控制台错误

### 新功能测试 ✅
- [ ] 游戏化系统显示正常
  - [ ] Currency显示
  - [ ] 成就墙加载
  - [ ] 排行榜工作
  - [ ] 每日挑战显示
- [ ] 通知系统工作
  - [ ] 通知中心显示
  - [ ] 通知偏好设置
  - [ ] 实时通知接收
- [ ] RTL支持
  - [ ] 语言切换功能
  - [ ] Arabic布局正确
  - [ ] 文本对齐正确
- [ ] SSO登录
  - [ ] Google登录正常
  - [ ] GitHub登录正常
  - [ ] 回调处理正确
- [ ] 报表系统
  - [ ] 报表模板显示
  - [ ] 报表生成成功
  - [ ] 导出功能工作

### 性能检查 ✅
- [ ] 首屏加载 < 2秒
- [ ] 大列表滚动流畅
- [ ] 没有内存泄漏
- [ ] CPU使用率正常

### 数据完整性 ✅
- [ ] 旧数据全部迁移
- [ ] 用户关系保持
- [ ] 没有数据丢失
- [ ] 数据库索引创建

---

## 获取帮助

### 官方资源

- 📖 **文档**: https://docs.agentforge.dev
- 💬 **Discord**: https://discord.gg/agentforge
- 🐛 **Issue追踪**: https://github.com/xxx/agentforge/issues
- 📧 **Email支持**: support@agentforge.dev

### 社区支持

- **Discord #v2-3-0-migration频道** - 专门的升级支持
- **GitHub Discussions** - 社区问答
- **Stack Overflow** - 标签 `agentforge`

### 紧急支持

如果遇到阻塞性问题：

1. 先尝试回滚到v2.2.x
2. 在GitHub创建Issue（标签：`bug`, `v2.3.0`）
3. 加入Discord寻求实时帮助
4. 发送Email到support（付费用户）

---

## 总结

v2.3.0 升级步骤总结：

1. ✅ **备份数据**（数据库 + 配置 + 代码）
2. ✅ **拉取代码**（git checkout v2.3.0）
3. ✅ **安装依赖**（npm install）
4. ✅ **配置环境**（可选的OAuth/SMTP等）
5. ✅ **运行迁移**（npm run db:migrate）
6. ✅ **启动应用**（npm run dev）
7. ✅ **验证功能**（检查清单）

**升级时间估计：**
- 小型部署（<1000用户）：15-30分钟
- 中型部署（1K-10K用户）：30-60分钟
- 大型部署（>10K用户）：1-2小时

**风险评估：** 🟢 低风险
- 无破坏性变更
- 完全向后兼容
- 自动数据迁移
- 可快速回滚

**我们建议：**
- 先在测试环境升级
- 确认无误后再升级生产
- 升级前务必备份数据
- 逐步启用新功能

---

**祝升级顺利！享受v2.3.0的强大新功能！** 🚀

**版本**: v1.0
**更新日期**: 2026-03-18
**适用范围**: v2.2.x → v2.3.0
