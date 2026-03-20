# 🛠️ AgentForge 开发指南

本文档面向AgentForge的开发者和贡献者。

---

## 📋 目录

1. [技术栈](#技术栈)
2. [项目结构](#项目结构)
3. [开发环境搭建](#开发环境搭建)
4. [开发工作流](#开发工作流)
5. [调试技巧](#调试技巧)
6. [性能优化](#性能优化)

---

## 🏗️ 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 18.2+ | UI框架 |
| **TypeScript** | 5.0+ | 类型系统 |
| **Vite** | 5.0+ | 构建工具 |
| **Tailwind CSS** | 3.4+ | 样式框架 |
| **Zustand** | 4.4+ | 状态管理 |
| **ECharts** | 5.4+ | 图表库 |
| **React Router** | 6.20+ | 路由 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| **Node.js** | 20.10+ | 运行时 |
| **Express** | 4.18+ | Web框架 |
| **MongoDB** | 6.0+ | 数据库 |
| **Mongoose** | 8.0+ | ODM |
| **Socket.io** | 4.6+ | WebSocket |
| **JWT** | 9.0+ | 认证 |

### 开发工具

| 工具 | 用途 |
|------|------|
| **ESLint** | 代码规范 |
| **Prettier** | 代码格式化 |
| **Vitest** | 单元测试 |
| **Playwright** | E2E测试 |
| **Postman** | API测试 |

---

## 📁 项目结构

详细说明请查看 [DIRECTORY_STRUCTURE.md](DIRECTORY_STRUCTURE.md)

```
AgentForge/
├── backend/              # 后端服务
│   ├── src/
│   │   ├── routes/       # API路由
│   │   ├── controllers/  # 控制器
│   │   ├── services/     # 业务逻辑
│   │   ├── models/       # 数据模型
│   │   ├── middleware/   # 中间件
│   │   └── utils/        # 工具函数
│   ├── config/           # 配置文件
│   └── docs/             # 后端文档
│
├── src/                  # 前端源代码
│   ├── components/       # React组件
│   ├── services/         # API客户端
│   ├── hooks/            # 自定义Hooks
│   ├── store/            # 状态管理
│   ├── utils/            # 工具函数
│   └── types/            # TypeScript类型
│
├── docs/                 # 项目文档
├── public/               # 静态资源
├── scripts/              # 自动化脚本
└── tests/                # 测试文件
```

---

## 💻 开发环境搭建

### 前置要求

1. **Node.js 20.10+**
   ```bash
   # 使用nvm安装
   nvm install 20
   nvm use 20
   ```

2. **MongoDB 6.0+**
   ```bash
   # macOS
   brew install mongodb-community@6.0

   # Ubuntu
   sudo apt install mongodb

   # Windows
   # 从官网下载安装：mongodb.com/try/download/community
   ```

3. **Git**
   ```bash
   git --version
   ```

---

### Clone仓库

```bash
git clone https://github.com/aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-
cd AgentForge-v0.1.0---MVP-Release-
```

---

### 安装依赖

#### 方式1: 使用npm

```bash
# 前端依赖
npm install

# 后端依赖
cd backend
npm install
cd ..
```

#### 方式2: 使用pnpm（推荐，更快）

```bash
# 安装pnpm
npm install -g pnpm

# 前端依赖
pnpm install

# 后端依赖
cd backend
pnpm install
cd ..
```

---

### 配置环境变量

#### 前端 (.env)

```bash
# 在根目录创建.env文件
cp .env.example .env
```

```.env
# API Base URL
VITE_API_BASE_URL=http://localhost:5000/api

# Google Analytics（可选）
VITE_GA_MEASUREMENT_ID=G-PLACEHOLDER
```

#### 后端 (backend/.env)

```bash
cd backend
cp .env.example .env
```

```.env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/agentforge

# JWT
JWT_SECRET=your_jwt_secret_here_change_in_production
JWT_EXPIRES_IN=7d

# Webhook
JIRA_WEBHOOK_SECRET=your_jira_webhook_secret
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret

# Server
PORT=5000
NODE_ENV=development
```

**生成安全密钥**:
```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Webhook Secrets
openssl rand -hex 32
```

---

### 启动开发服务器

#### 终端1: 启动MongoDB

```bash
# macOS (使用Homebrew)
brew services start mongodb-community

# 或手动启动
mongod --dbpath /path/to/data

# 验证MongoDB运行
mongosh --eval "db.version()"
```

#### 终端2: 启动后端

```bash
cd backend
npm run dev

# 或使用nodemon
npm run dev:watch
```

后端会在 `http://localhost:5000` 启动

#### 终端3: 启动前端

```bash
# 在根目录
npm run dev
```

前端会在 `http://localhost:5173` 启动

浏览器会自动打开！

---

## 🔄 开发工作流

### 创建功能分支

```bash
# 从main分支创建新分支
git checkout main
git pull origin main
git checkout -b feat/your-feature-name
```

### 编写代码

```typescript
// src/components/MyNewComponent.tsx
import React from 'react';

interface Props {
  title: string;
}

export const MyNewComponent: React.FC<Props> = ({ title }) => {
  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
  );
};
```

### 实时预览

保存文件后，Vite会自动热更新（HMR）：
- ⚡ 极快的更新速度（< 100ms）
- 🔄 保留组件状态
- 🎯 只更新改变的模块

### 类型检查

```bash
# 检查TypeScript类型
npm run type-check

# 监听模式
npm run type-check:watch
```

### 代码规范

```bash
# 检查ESLint
npm run lint

# 自动修复
npm run lint:fix

# 格式化代码
npm run format
```

### 运行测试

```bash
# 单元测试
npm test

# 监听模式
npm test:watch

# 覆盖率
npm test:coverage

# E2E测试
npm run test:e2e
```

### 提交代码

```bash
# 添加文件
git add .

# 提交（遵循Conventional Commits）
git commit -m "feat(components): add MyNewComponent"

# 推送
git push origin feat/your-feature-name
```

---

## 🐛 调试技巧

### 前端调试

#### Chrome DevTools

1. 打开 `http://localhost:5173`
2. 按 `F12` 打开DevTools
3. 使用React DevTools扩展

#### VS Code调试

创建 `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack:///*": "${webRoot}/*"
      }
    }
  ]
}
```

#### 调试技巧

```typescript
// 使用console.log（开发环境）
console.log('Debug:', data);

// 使用debugger断点
debugger;

// React DevTools
// 安装：https://react.dev/learn/react-developer-tools
```

---

### 后端调试

#### VS Code调试

`.vscode/launch.json`:

```json
{
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

#### 调试技巧

```typescript
// 日志输出
console.log('API request:', req.body);

// 断点调试
debugger;

// 使用inspect
node --inspect backend/src/index.ts
```

---

### API调试

#### 使用Postman

```bash
# 导入Postman集合
docs/postman/AgentForge.postman_collection.json
```

#### 使用curl

```bash
# GET请求
curl http://localhost:5000/api/analytics/overview

# POST请求
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# 带认证
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/agents
```

---

### Database调试

```bash
# 连接MongoDB Shell
mongosh

# 切换数据库
use agentforge

# 查询数据
db.agents.find()
db.tasks.find({status: "completed"})

# 聚合查询
db.agents.aggregate([
  {$group: {_id: "$status", count: {$sum: 1}}}
])
```

---

## ⚡ 性能优化

### 前端优化

#### 1. 代码分割

```typescript
// 使用React.lazy
const Analytics = React.lazy(() => import('./pages/Analytics'));

// 使用Suspense
<Suspense fallback={<Loading />}>
  <Analytics />
</Suspense>
```

#### 2. memo化

```typescript
// 使用React.memo
export const ExpensiveComponent = React.memo(({ data }) => {
  // ...
});

// 使用useMemo
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// 使用useCallback
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

#### 3. 虚拟化长列表

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
});
```

---

### 后端优化

#### 1. 数据库索引

```typescript
// models/Agent.ts
agentSchema.index({ status: 1, createdAt: -1 });
agentSchema.index({ userId: 1 });
```

#### 2. 查询优化

```typescript
// ❌ 避免N+1查询
for (const agent of agents) {
  const tasks = await Task.find({ agentId: agent._id });
}

// ✅ 使用聚合或populate
const agents = await Agent.find().populate('tasks');
```

#### 3. 缓存

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 });

export async function getAnalytics() {
  const cached = cache.get('analytics');
  if (cached) return cached;

  const data = await fetchAnalytics();
  cache.set('analytics', data);
  return data;
}
```

---

## 📊 监控和分析

### 性能监控

```bash
# 分析Bundle大小
npm run build
npm run analyze

# 检查Bundle
npx vite-bundle-visualizer
```

### 代码质量

```bash
# 复杂度分析
npx complexity-report src/

# 依赖分析
npm run depcheck
```

---

## 🧪 测试

### 单元测试

```typescript
// src/utils/__tests__/exportPdf.test.ts
import { describe, it, expect } from 'vitest';
import { exportDataToCsv } from '../exportPdf';

describe('exportDataToCsv', () => {
  it('should export data to CSV format', () => {
    const data = [{ id: 1, name: 'Test' }];
    const result = exportDataToCsv(data, 'test');

    expect(result).toContain('id,name');
    expect(result).toContain('1,Test');
  });
});
```

### 集成测试

```typescript
// backend/src/__tests__/api.test.ts
import request from 'supertest';
import app from '../app';

describe('Analytics API', () => {
  it('GET /api/analytics/overview', async () => {
    const response = await request(app)
      .get('/api/analytics/overview')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });
});
```

---

## 📚 更多资源

- [API参考](API_REFERENCE_v2.4.0.md)
- [架构文档](ARCHITECTURE.md)
- [测试指南](TESTING_GUIDE.md)
- [贡献指南](../CONTRIBUTING.md)

---

**最后更新**: 2026-03-20
**维护者**: AgentForge Team
