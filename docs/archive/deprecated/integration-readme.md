# 🔗 Jira & GitHub 集成系统

一个功能完整的项目管理集成系统，支持 Jira 和 GitHub 的双向同步、自动化工作流和实时更新。

## ✨ 核心特性

### Jira 集成
- 🔄 **双向同步**: 本地任务 ↔ Jira Issue 实时同步
- 🎯 **状态映射**: 灵活的状态转换和自动映射
- 🪝 **Webhook 支持**: 实时接收 Jira 更新事件
- 🔍 **强大搜索**: JQL 查询和高级过滤
- 🏷️ **自定义字段**: 支持所有 Jira 自定义字段

### GitHub 集成
- 📝 **Issue 管理**: 自动创建和同步 GitHub Issues
- 🌿 **分支管理**: 自动创建功能分支并关联任务
- 🔀 **PR 工作流**: PR 合并自动完成任务
- 🪝 **Webhook 支持**: 实时接收 GitHub 事件
- 🏷️ **标签映射**: 自动映射和管理标签

### 管理界面
- ⚙️ **可视化配置**: 友好的配置界面
- 📊 **实时监控**: 连接状态和同步统计
- 📜 **历史记录**: 完整的同步历史和错误日志
- 🧪 **连接测试**: 一键测试 API 连接

## 🚀 快速开始

### 1. 安装依赖

```bash
# 前端
npm install

# 后端
cd backend && npm install
```

### 2. 配置环境变量

创建 `backend/.env` 文件:

```env
# Jira 配置
JIRA_HOST=your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-jira-api-token

# GitHub 配置
GITHUB_TOKEN=ghp_your_github_token
GITHUB_OWNER=your-username
GITHUB_REPO=your-repo
GITHUB_WEBHOOK_SECRET=your-webhook-secret

# Webhook 基础 URL
WEBHOOK_BASE_URL=https://your-domain.com
```

### 3. 获取 API 凭证

#### Jira API Token
1. 访问 [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. 点击 "Create API token"
3. 输入标签名称并创建
4. 复制生成的 Token

#### GitHub Personal Access Token
1. 访问 [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 选择权限:
   - `repo` (完整仓库访问)
   - `workflow` (GitHub Actions)
   - `write:discussion` (讨论)
4. 生成并复制 Token

### 4. 启动应用

```bash
# 启动前端开发服务器
npm run dev

# 启动后端服务器
cd backend && npm run dev
```

### 5. 打开管理界面

访问应用并打开集成管理面板:

```typescript
import { IntegrationPanel } from '@/components/admin';

function SettingsPage() {
  return <IntegrationPanel />;
}
```

## 📖 使用指南

### 基础配置

#### 配置 Jira
1. 打开集成管理面板
2. 进入 "Jira 配置" 标签
3. 填写连接信息:
   - Jira Host: `your-domain.atlassian.net`
   - Email: 你的 Jira 邮箱
   - API Token: 生成的 API Token
   - 项目 Key: 例如 `PROJ`
4. 点击 "测试连接"
5. 配置同步设置
6. 点击 "保存配置"

#### 配置 GitHub
1. 进入 "GitHub 配置" 标签
2. 填写连接信息:
   - Token: 生成的 Personal Access Token
   - Owner: 用户名或组织名
   - Repo: 仓库名称
3. 点击 "测试连接"
4. 配置同步设置
5. 点击 "保存配置"

### 代码集成

#### 初始化
```typescript
import { initializeIntegrations } from '@/services/integrations';

// 在应用启动时调用
initializeIntegrations();
```

#### 创建 Jira Issue
```typescript
import { jiraClient } from '@/services/integrations/jira';

const issue = await jiraClient.createIssue({
  projectKey: 'PROJ',
  summary: '实现新功能',
  description: '详细描述...',
  issueType: 'Task',
  priority: 'High',
  labels: ['backend', 'api']
});
```

#### 创建 GitHub Issue 和 PR
```typescript
import { githubClient } from '@/services/integrations/github';

// 创建 Issue
const issue = await githubClient.createIssue({
  title: '修复 Bug',
  body: '问题描述...',
  labels: ['bug']
});

// 创建分支
await githubClient.createBranch('feature/new-feature');

// 创建 PR
const pr = await githubClient.createPullRequest({
  title: '实现新功能',
  head: 'feature/new-feature',
  base: 'main'
});
```

#### 同步操作
```typescript
import { jiraSyncService, githubSyncService } from '@/services/integrations';

// 手动同步
await jiraSyncService.manualSync();
await githubSyncService.manualSync();

// 关联任务
jiraSyncService.linkTaskToIssue('task-123', 'PROJ-456');
githubSyncService.linkTaskToGitHub('task-123', { issueNumber: 789 });
```

### Webhook 设置

#### Jira Webhook
1. 进入 Jira 设置 → System → WebHooks
2. 创建新 Webhook:
   - URL: `https://your-domain.com/webhooks/jira`
   - Events: Issue created, updated, deleted, Comment created
3. 保存

#### GitHub Webhook
1. 进入仓库 Settings → Webhooks
2. 添加 Webhook:
   - Payload URL: `https://your-domain.com/webhooks/github`
   - Content type: `application/json`
   - Secret: 设置密钥
   - Events: Issues, Pull requests, Comments, Reviews
3. 保存

## 📚 API 文档

### Jira 客户端

```typescript
// 创建 Issue
await jiraClient.createIssue(payload);

// 获取 Issue
await jiraClient.getIssue('PROJ-123');

// 更新 Issue
await jiraClient.updateIssue('PROJ-123', fields);

// 搜索 Issues
await jiraClient.searchIssues({ jql: 'project = PROJ' });

// 转换状态
await jiraClient.transitionIssue('PROJ-123', transitionId);

// 添加评论
await jiraClient.addComment('PROJ-123', 'Comment text');
```

### GitHub 客户端

```typescript
// 创建 Issue
await githubClient.createIssue(payload);

// 获取 Issue
await githubClient.getIssue(123);

// 更新 Issue
await githubClient.updateIssue(123, payload);

// 创建 PR
await githubClient.createPullRequest(payload);

// 合并 PR
await githubClient.mergePullRequest(123);

// 创建分支
await githubClient.createBranch('feature/x');
```

## 🎯 工作流示例

### 完整的任务生命周期

```typescript
// 1. 创建本地任务
const task = { id: 'task-123', title: '实现新功能' };

// 2. 自动创建 Jira Issue
const issue = await jiraSyncService.createIssue(task);
// 结果: PROJ-456

// 3. 自动创建 GitHub Issue 和分支
const githubIssue = await githubSyncService.createIssue(task);
// 结果: Issue #789, Branch: feature/789-implement-new-feature

// 4. 开发完成，创建 PR
const pr = await githubSyncService.createPullRequest(
  'task-123',
  '实现新功能',
  '详细描述...'
);

// 5. PR 合并后，自动关闭任务
// Webhook 自动触发，无需手动操作
```

## 🔧 配置选项

### 同步配置

```typescript
{
  enabled: true,              // 启用自动同步
  syncInterval: 5,            // 同步间隔（分钟）
  autoCreateIssues: true,     // 自动创建 Issues
  autoUpdateIssues: true,     // 自动更新 Issues
  autoCreateBranches: true,   // 自动创建分支（GitHub）
  autoCloseTasks: true,       // PR 合并后关闭任务（GitHub）
  branchPrefix: 'feature/',   // 分支前缀（GitHub）
}
```

### 状态映射

```typescript
jiraStatusMapper.setMapping('todo', 'To Do');
jiraStatusMapper.setMapping('in-progress', 'In Progress');
jiraStatusMapper.setMapping('done', 'Done');
```

## 📊 监控和统计

### 获取统计信息

```typescript
// Jira 统计
const jiraStats = jiraSyncService.getSyncStats();
console.log('映射数量:', jiraStats.totalMappings);
console.log('上次同步:', jiraStats.lastSyncAt);

// GitHub 统计
const githubStats = githubSyncService.getSyncStats();
console.log('Issue 数量:', githubStats.withIssues);
console.log('PR 数量:', githubStats.withPRs);
console.log('分支数量:', githubStats.withBranches);
```

### 查看同步历史

在管理界面的 "同步历史" 标签中查看:
- 同步时间
- 创建/更新数量
- 错误详情
- 成功率统计

## 🐛 故障排查

### 连接失败
1. 检查 API Token 是否正确
2. 验证网络连接
3. 查看控制台错误日志

### 同步失败
1. 检查映射配置
2. 查看同步历史中的错误
3. 手动触发同步测试

### Webhook 不工作
1. 验证 Webhook URL 可访问
2. 检查签名配置
3. 查看 Webhook 错误日志

## 📦 项目结构

```
src/services/integrations/
├── jira/
│   ├── jiraClient.ts           # Jira API 客户端
│   ├── jiraSyncService.ts      # 同步服务
│   ├── jiraStatusMapper.ts     # 状态映射
│   ├── jiraWebhookHandler.ts   # Webhook 处理
│   └── index.ts
├── github/
│   ├── githubClient.ts         # GitHub API 客户端
│   ├── githubSyncService.ts    # 同步服务
│   ├── githubWebhookHandler.ts # Webhook 处理
│   └── index.ts
└── index.ts

src/components/admin/
├── IntegrationPanel.tsx        # 主面板
├── JiraConfigPanel.tsx         # Jira 配置
├── GitHubConfigPanel.tsx       # GitHub 配置
├── StatusMappingPanel.tsx      # 状态映射
├── SyncHistoryPanel.tsx        # 同步历史
└── index.ts

backend/src/integrations/
├── jira/
│   └── jiraService.ts          # Jira 后端服务
├── github/
│   └── githubService.ts        # GitHub 后端服务
└── index.ts
```

## 📈 性能优化

- ✅ 请求缓存和去重
- ✅ 批量操作支持
- ✅ 异步队列处理
- ✅ 本地数据持久化
- ✅ 增量同步

## 🔒 安全性

- ✅ API Token 加密存储
- ✅ Webhook 签名验证
- ✅ HTTPS 传输
- ✅ 权限最小化
- ✅ 定期 Token 轮换

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 支持

- 📖 [完整文档](./INTEGRATION_GUIDE.md)
- 📝 [实施报告](./TASK_303_REPORT.md)
- 💬 [GitHub Issues](https://github.com/your-repo/issues)

---

**开发者**: Claude (Anthropic)
**版本**: 1.0.0
**最后更新**: 2026-03-17
