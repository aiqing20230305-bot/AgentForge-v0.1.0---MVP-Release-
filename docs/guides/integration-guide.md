# Jira & GitHub 集成完整指南

## 概述

本系统提供了完整的 Jira 和 GitHub 集成功能，支持双向同步、自动化工作流、Webhook 处理和冲突检测。

## 功能特性

### Jira 集成
- ✅ Issue 双向同步（本地任务 ↔ Jira Issue）
- ✅ 状态自动映射和转换
- ✅ Webhook 实时更新
- ✅ 自定义字段支持
- ✅ 批量操作和搜索

### GitHub 集成
- ✅ Issue/PR 双向同步
- ✅ 自动创建分支
- ✅ PR 合并后自动关闭任务
- ✅ Branch 关联管理
- ✅ Webhook 事件处理

## 快速开始

### 1. 前端集成

#### 初始化集成
```typescript
import { initializeIntegrations } from '@/services/integrations';

// 在应用启动时初始化
initializeIntegrations();
```

#### 配置 Jira
```typescript
import { jiraClient, jiraSyncService } from '@/services/integrations/jira';

// 配置连接
jiraClient.initialize({
  host: 'your-domain.atlassian.net',
  email: 'your-email@example.com',
  apiToken: 'your-api-token',
  projectKey: 'PROJ'
});

// 配置同步
jiraSyncService.initialize({
  enabled: true,
  syncInterval: 5, // 分钟
  autoCreateIssues: true,
  autoUpdateIssues: true,
  projectKey: 'PROJ',
  issueTypeMapping: {
    task: 'Task',
    bug: 'Bug',
    feature: 'Story'
  }
});
```

#### 配置 GitHub
```typescript
import { githubClient, githubSyncService } from '@/services/integrations/github';

// 配置连接
githubClient.initialize({
  token: 'ghp_your_token',
  owner: 'your-username',
  repo: 'your-repo'
});

// 配置同步
githubSyncService.initialize({
  enabled: true,
  syncInterval: 5,
  autoCreateIssues: true,
  autoCreateBranches: true,
  autoCloseTasks: true,
  branchPrefix: 'feature/',
  labelMapping: {
    bug: 'bug',
    feature: 'enhancement'
  }
});
```

### 2. 使用管理界面

```typescript
import { IntegrationPanel } from '@/components/admin';

function AdminPage() {
  return <IntegrationPanel />;
}
```

### 3. 后端集成

#### 初始化服务
```typescript
import { initializeBackendIntegrations } from './integrations';

initializeBackendIntegrations({
  jira: {
    host: process.env.JIRA_HOST!,
    email: process.env.JIRA_EMAIL!,
    apiToken: process.env.JIRA_API_TOKEN!
  },
  github: {
    token: process.env.GITHUB_TOKEN!,
    owner: process.env.GITHUB_OWNER!,
    repo: process.env.GITHUB_REPO!,
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET
  }
});
```

#### 创建 Webhook 端点
```typescript
import express from 'express';
import { jiraService, githubService } from './integrations';

const app = express();

// Jira Webhook
app.post('/webhooks/jira', express.json(), async (req, res) => {
  try {
    await jiraService.handleWebhook(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Jira webhook error:', error);
    res.status(500).send('Error');
  }
});

// GitHub Webhook
app.post('/webhooks/github', express.json(), async (req, res) => {
  try {
    const signature = req.headers['x-hub-signature-256'] as string;
    const eventType = req.headers['x-github-event'] as string;

    if (!githubService.verifyWebhookSignature(JSON.stringify(req.body), signature)) {
      return res.status(401).send('Invalid signature');
    }

    await githubService.handleWebhook(eventType, req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('GitHub webhook error:', error);
    res.status(500).send('Error');
  }
});
```

## API 使用示例

### Jira 操作

#### 创建 Issue
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

console.log('Created issue:', issue.key);
```

#### 更新 Issue
```typescript
await jiraClient.updateIssue('PROJ-123', {
  summary: '更新后的标题',
  description: '更新后的描述'
});
```

#### 搜索 Issues
```typescript
const result = await jiraClient.searchIssues({
  jql: 'project = PROJ AND status = "In Progress"',
  maxResults: 50
});

console.log('Found issues:', result.issues.length);
```

#### 转换状态
```typescript
const transitions = await jiraClient.getTransitions('PROJ-123');
const doneTransition = transitions.find(t => t.to.name === 'Done');

if (doneTransition) {
  await jiraClient.transitionIssue('PROJ-123', doneTransition.id, '任务已完成');
}
```

### GitHub 操作

#### 创建 Issue
```typescript
import { githubClient } from '@/services/integrations/github';

const issue = await githubClient.createIssue({
  title: '修复 Bug',
  body: '问题描述...',
  labels: ['bug', 'high-priority'],
  assignees: ['username']
});

console.log('Created issue:', issue.number);
```

#### 创建分支和 PR
```typescript
// 创建分支
await githubClient.createBranch('feature/new-feature', 'main');

// 创建 Pull Request
const pr = await githubClient.createPullRequest({
  title: '实现新功能',
  body: 'PR 描述...',
  head: 'feature/new-feature',
  base: 'main',
  draft: false
});

console.log('Created PR:', pr.number);
```

#### 合并 PR
```typescript
await githubClient.mergePullRequest(123, {
  commit_title: '合并新功能',
  merge_method: 'squash'
});
```

### 同步操作

#### 手动触发同步
```typescript
import { jiraSyncService, githubSyncService } from '@/services/integrations';

// Jira 同步
const jiraResult = await jiraSyncService.manualSync();
console.log('Jira sync result:', jiraResult);

// GitHub 同步
const githubResult = await githubSyncService.manualSync();
console.log('GitHub sync result:', githubResult);
```

#### 关联任务和 Issue
```typescript
// Jira
jiraSyncService.linkTaskToIssue('task-123', 'PROJ-456', 'bidirectional');

// GitHub
githubSyncService.linkTaskToGitHub('task-123', {
  issueNumber: 789,
  branchName: 'feature/task-123'
}, 'bidirectional');
```

#### 获取同步统计
```typescript
const jiraStats = jiraSyncService.getSyncStats();
console.log('Jira mappings:', jiraStats.totalMappings);

const githubStats = githubSyncService.getSyncStats();
console.log('GitHub mappings:', githubStats.totalMappings);
console.log('With PRs:', githubStats.withPRs);
```

## Webhook 配置

### Jira Webhook 设置

1. 进入 Jira 设置 → System → WebHooks
2. 创建新 Webhook
3. URL: `https://your-domain.com/webhooks/jira`
4. 选择事件:
   - Issue created
   - Issue updated
   - Issue deleted
   - Comment created

### GitHub Webhook 设置

1. 进入仓库 Settings → Webhooks
2. 添加新 Webhook
3. Payload URL: `https://your-domain.com/webhooks/github`
4. Content type: `application/json`
5. Secret: 设置密钥用于验证
6. 选择事件:
   - Issues
   - Pull requests
   - Issue comments
   - Pull request reviews

## 状态映射

### 配置状态映射
```typescript
import { jiraStatusMapper } from '@/services/integrations/jira';

// 添加映射
jiraStatusMapper.setMapping('todo', 'To Do', '待处理');
jiraStatusMapper.setMapping('in-progress', 'In Progress', '进行中');
jiraStatusMapper.setMapping('done', 'Done', '已完成');

// 获取映射
const jiraStatus = jiraStatusMapper.mapLocalToJira('in-progress');
// 返回: "In Progress"

const localStatus = jiraStatusMapper.mapJiraToLocal('Done');
// 返回: "done"
```

## 事件监听

### Jira 事件
```typescript
window.addEventListener('jira:issue-created', (event: CustomEvent) => {
  console.log('Jira issue created:', event.detail.issueKey);
});

window.addEventListener('jira:status-changed', (event: CustomEvent) => {
  console.log('Status changed:', event.detail.from, '→', event.detail.to);
});

window.addEventListener('jira:task-update', (event: CustomEvent) => {
  const { taskId, updateData } = event.detail;
  // 更新本地任务
});
```

### GitHub 事件
```typescript
window.addEventListener('github:pr-merged', (event: CustomEvent) => {
  const { taskId, prNumber, mergedAt } = event.detail;
  console.log('PR merged, closing task:', taskId);
});

window.addEventListener('github:issue-opened', (event: CustomEvent) => {
  console.log('GitHub issue opened:', event.detail.issue.number);
});
```

## 错误处理

```typescript
try {
  const issue = await jiraClient.createIssue(payload);
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to create issue:', error.message);
    // 显示错误提示
  }
}
```

## 性能优化

### 批量操作
```typescript
// 使用 Promise.all 并行处理
const tasks = [...]; // 任务列表

const results = await Promise.all(
  tasks.map(task => jiraSyncService.createIssue(task))
);
```

### 缓存策略
- Issue 数据自动缓存 5 分钟
- 状态映射配置持久化到 localStorage
- 同步历史保留最近 100 条记录

## 故障排查

### 连接问题
1. 检查 API Token 是否有效
2. 验证网络连接
3. 查看浏览器控制台错误

### 同步问题
1. 检查映射配置是否正确
2. 查看同步历史中的错误信息
3. 手动触发同步测试

### Webhook 问题
1. 验证 Webhook URL 是否可访问
2. 检查签名验证配置
3. 查看 Webhook 错误日志

## 代码统计

### 前端代码
- Jira 客户端: ~600 行
- Jira 同步服务: ~500 行
- Jira 状态映射: ~250 行
- Jira Webhook 处理: ~400 行
- GitHub 客户端: ~700 行
- GitHub 同步服务: ~550 行
- GitHub Webhook 处理: ~450 行
- UI 组件: ~800 行

**前端总计: ~4,250 行**

### 后端代码
- Jira 服务: ~350 行
- GitHub 服务: ~400 行
- API 路由: ~250 行

**后端总计: ~1,000 行**

**项目总计: ~5,250 行**

## 环境变量

### 后端 .env 配置
```env
# Jira
JIRA_HOST=your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-jira-api-token

# GitHub
GITHUB_TOKEN=ghp_your_github_token
GITHUB_OWNER=your-username
GITHUB_REPO=your-repo
GITHUB_WEBHOOK_SECRET=your-webhook-secret

# Webhook URLs
WEBHOOK_BASE_URL=https://your-domain.com
```

## 安全建议

1. **API Token 安全**
   - 使用环境变量存储敏感信息
   - 定期轮换 Token
   - 限制 Token 权限范围

2. **Webhook 安全**
   - 启用签名验证
   - 使用 HTTPS
   - 设置 IP 白名单（如果可能）

3. **数据隐私**
   - 不在客户端存储敏感数据
   - 加密传输所有数据
   - 定期清理本地缓存

## 支持与贡献

如有问题或建议，请提交 Issue 或 Pull Request。

## 许可证

MIT License
