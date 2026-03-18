# 🚀 工作流引擎 - 快速启动指南

> 5分钟快速上手 AgentForge 工作流引擎

## 📦 第一步：启动应用

### 方式 1: 独立工作流应用

```tsx
// 在你的 App.tsx 或路由中添加
import { WorkflowApp } from '@/components/workflow';

function App() {
  return <WorkflowApp />;
}
```

### 方式 2: 集成到现有页面

```tsx
import { WorkflowList, WorkflowEditor } from '@/components/workflow';
import { workflowManager } from '@/services/workflow';

function MyWorkflowPage() {
  const [mode, setMode] = useState('list');
  const [workflow, setWorkflow] = useState(null);

  return mode === 'list' ? (
    <WorkflowList
      onSelectWorkflow={(wf) => {
        setWorkflow(wf);
        setMode('edit');
      }}
      onCreateNew={() => setMode('create')}
    />
  ) : (
    <WorkflowEditor
      workflow={workflow}
      onSave={async (wf) => {
        await workflowManager.updateWorkflow(wf);
        alert('已保存！');
      }}
    />
  );
}
```

## 🎨 第二步：创建第一个工作流

### 从模板创建（推荐）

```typescript
import { workflowManager } from '@/services/workflow';

// 1. 查看可用模板
const templates = workflowManager.getTemplates();
console.log(templates); // 20+ 模板

// 2. 从模板创建
const workflow = await workflowManager.createWorkflow(
  '我的数据处理流程',
  '处理用户数据',
  'data-processing-basic' // 模板ID
);

// 3. 执行工作流
const result = await workflowManager.executeWorkflow(
  workflow.id,
  { users: [...] } // 输入数据
);

console.log('执行结果:', result);
```

### 从零创建

```typescript
// 1. 创建空白工作流
const workflow = await workflowManager.createWorkflow(
  '自定义流程',
  '从零开始'
);

// 2. 添加节点
workflow.nodes.push({
  id: 'http-1',
  type: 'http_request',
  label: '获取数据',
  position: { x: 300, y: 100 },
  data: {
    url: 'https://api.example.com/data',
    method: 'GET',
  },
});

// 3. 连接节点
workflow.edges.push({
  id: 'e1',
  source: 'start',
  target: 'http-1',
});

// 4. 保存
await workflowManager.updateWorkflow(workflow);
```

## ⚡ 第三步：常用场景示例

### 场景 1: API 数据获取和处理

```typescript
const apiWorkflow = {
  name: 'API 数据处理',
  nodes: [
    { id: 'start', type: 'start', label: '开始', position: { x: 100, y: 100 }, data: {} },
    {
      id: 'fetch',
      type: 'http_request',
      label: '获取数据',
      position: { x: 300, y: 100 },
      data: {
        url: 'https://jsonplaceholder.typicode.com/users',
        method: 'GET',
      },
    },
    {
      id: 'transform',
      type: 'transform',
      label: '提取字段',
      position: { x: 500, y: 100 },
      data: {
        inputField: 'data',
        outputField: 'users',
        transformFunction: 'input.map(u => ({ id: u.id, name: u.name, email: u.email }))',
      },
    },
    { id: 'end', type: 'end', label: '结束', position: { x: 700, y: 100 }, data: {} },
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'fetch' },
    { id: 'e2', source: 'fetch', target: 'transform' },
    { id: 'e3', source: 'transform', target: 'end' },
  ],
};

// 执行
const result = await workflowManager.executeWorkflow(apiWorkflow.id);
console.log('处理后的用户:', result.output.users);
```

### 场景 2: 定时任务

```typescript
const scheduledWorkflow = {
  name: '每日数据同步',
  triggers: [
    {
      type: 'scheduled',
      enabled: true,
      config: {
        cron: '0 2 * * *', // 每天凌晨2点
        timezone: 'Asia/Shanghai',
      },
    },
  ],
  nodes: [
    // ... 同步逻辑节点
  ],
};

// 启用定时执行
await workflowManager.enableWorkflow(scheduledWorkflow.id);
```

### 场景 3: Webhook 自动化

```typescript
const webhookWorkflow = {
  name: 'Github Webhook 处理',
  triggers: [
    {
      type: 'webhook',
      enabled: true,
      config: {
        path: '/webhook/github',
        method: 'POST',
        authentication: {
          type: 'token',
          secret: 'your-secret-token',
        },
      },
    },
  ],
  nodes: [
    {
      id: 'parse',
      type: 'transform',
      label: '解析事件',
      data: {
        transformFunction: 'input.repository.name',
      },
    },
    {
      id: 'notify',
      type: 'notification',
      label: '发送通知',
      data: {
        channel: 'slack',
        message: 'Received push to {{repository}}',
      },
    },
  ],
};
```

### 场景 4: AI 内容生成

```typescript
const aiWorkflow = {
  name: 'AI 文章生成',
  nodes: [
    {
      id: 'loop',
      type: 'loop',
      label: '循环主题',
      data: {
        iterableSource: 'topics',
        itemVariable: 'topic',
      },
    },
    {
      id: 'ai',
      type: 'ai_agent',
      label: 'AI 写作',
      data: {
        agentId: 'writer',
        prompt: '写一篇关于{{topic}}的文章',
        model: 'claude-3-sonnet',
      },
    },
  ],
};

// 执行
const result = await workflowManager.executeWorkflow(aiWorkflow.id, {
  topics: ['AI', '编程', '设计'],
});
```

## 🎯 第四步：高级功能

### 条件判断

```typescript
{
  id: 'decision',
  type: 'decision',
  label: '判断用户类型',
  data: {
    conditions: [
      {
        left: 'user.vip',
        operator: 'eq',
        right: true,
      },
    ],
  },
}

// 条件边
{
  id: 'e-vip',
  source: 'decision',
  target: 'vip-process',
  sourceHandle: 'true',
}
```

### 并行执行

```typescript
{
  id: 'parallel',
  type: 'parallel',
  label: '并行处理',
  data: {
    branches: ['task-1', 'task-2', 'task-3'],
    waitForAll: true, // 等待所有分支完成
    continueOnError: false, // 任一失败则停止
  },
}
```

### 错误处理

```typescript
{
  id: 'risky-task',
  type: 'task',
  label: '可能失败的任务',
  retryPolicy: {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2, // 指数退避：1s, 2s, 4s
  },
  onError: {
    strategy: 'fallback',
    fallbackNode: 'backup-task',
    notification: {
      enabled: true,
      channels: ['email'],
    },
  },
}
```

### 表达式使用

```typescript
// JavaScript 表达式
{
  transformFunction: 'data.filter(item => item.price > 100).map(item => item.name)';
}

// 模板字符串
{
  message: 'Hello {{user.name}}, you have {{unread}} messages';
}

// JSONPath 查询
{
  source: 'response.data.users[0].email';
}
```

## 📊 第五步：监控和调试

### 查看执行历史

```typescript
// 获取最近50次执行
const history = workflowManager.getExecutionHistory('workflow-id', 50);

history.forEach((exec) => {
  console.log(`${exec.executionId}: ${exec.status} (${exec.duration}ms)`);
});
```

### 获取统计信息

```typescript
const stats = await workflowManager.getWorkflowStatistics('workflow-id');

console.log('总执行次数:', stats.totalExecutions);
console.log('成功率:', stats.successRate, '%');
console.log('平均耗时:', stats.averageDuration, 'ms');
console.log('失败次数:', stats.failedExecutions);
```

### 查看执行详情

```typescript
const result = await workflowManager.getExecutionResult('execution-id');

// 执行追踪
result.trace.forEach((step) => {
  console.log(`节点: ${step.nodeName}`);
  console.log(`状态: ${step.status}`);
  console.log(`耗时: ${step.duration}ms`);
  if (step.error) {
    console.error(`错误: ${step.error.message}`);
  }
});
```

## 🔧 第六步：集成到后端

### Express 集成

```typescript
// backend/src/app.ts
import workflowRoutes from './workflow/workflowRoutes';

app.use('/api/workflow', workflowRoutes);
```

### API 端点

```
GET    /api/workflow/workflows           # 获取所有工作流
GET    /api/workflow/workflows/:id       # 获取单个工作流
POST   /api/workflow/workflows           # 创建工作流
PUT    /api/workflow/workflows/:id       # 更新工作流
DELETE /api/workflow/workflows/:id       # 删除工作流
POST   /api/workflow/workflows/:id/execute  # 执行工作流
GET    /api/workflow/executions/:id      # 获取执行结果
GET    /api/workflow/templates           # 获取模板列表
```

## 💡 最佳实践

### 1. 工作流命名规范

```typescript
// ✅ 好的命名
'用户注册-邮件通知-v1.0';
'每日数据同步-MySQL到Redis';
'订单处理-支付回调';

// ❌ 避免
'test1';
'workflow';
'新建工作流';
```

### 2. 节点标签清晰

```typescript
// ✅ 清晰的标签
{ label: '获取用户列表', type: 'http_request' }
{ label: '过滤活跃用户', type: 'filter' }
{ label: '发送欢迎邮件', type: 'notification' }

// ❌ 模糊的标签
{ label: 'API', type: 'http_request' }
{ label: '处理', type: 'transform' }
```

### 3. 错误处理覆盖

```typescript
// 关键节点务必添加错误处理
criticalNode.retryPolicy = { maxRetries: 3 };
criticalNode.onError = { strategy: 'fallback' };
```

### 4. 使用模板变量

```typescript
// ✅ 使用变量，便于复用
workflow.settings.variables = {
  apiUrl: 'https://api.example.com',
  apiKey: process.env.API_KEY,
};

// 在节点中使用
node.data.url = '{{apiUrl}}/users';
```

## 🎉 快速开始 Checklist

- [ ] 安装依赖
- [ ] 导入 WorkflowApp 组件
- [ ] 查看预置模板
- [ ] 创建第一个工作流
- [ ] 添加节点和连接
- [ ] 执行并查看结果
- [ ] 配置触发器
- [ ] 部署到生产环境

## 📚 下一步学习

1. 阅读完整文档: `/src/services/workflow/README.md`
2. 查看所有模板: `templateRegistry.getAll()`
3. 学习表达式引擎: `expressionEngine` API
4. 自定义节点类型: 实现 `NodeExecutor` 接口
5. 性能优化: 并行执行、缓存策略

## 🆘 常见问题

**Q: 如何停止正在执行的工作流？**
```typescript
await workflowManager.cancelExecution('execution-id');
```

**Q: 工作流可以嵌套吗？**
```typescript
// 可以通过 AI_AGENT 节点调用子工作流
{
  type: 'ai_agent',
  data: {
    agentId: 'sub-workflow-executor',
    prompt: '执行子工作流: workflow-id',
  },
}
```

**Q: 如何导出/导入工作流？**
```typescript
// 导出
const json = await workflowManager.exportWorkflow('workflow-id');

// 导入
const imported = await workflowManager.importWorkflow(json);
```

**Q: 支持工作流版本控制吗？**
```typescript
// 通过复制实现版本
const v2 = await workflowManager.duplicateWorkflow(
  'workflow-id',
  'My Workflow v2.0'
);
```

---

🎊 **恭喜！你已经掌握了 AgentForge 工作流引擎的基本用法！**

需要帮助？查看完整文档或提交 Issue。

Happy Workflow Building! 🚀
