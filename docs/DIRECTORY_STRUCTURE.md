# 📁 AgentForge 目录结构说明

**最后更新**: 2026-03-20
**版本**: v2.4.0+

---

## 🎯 设计原则

AgentForge的目录结构遵循以下原则：

1. **简洁清晰** - 一级目录控制在6个以内
2. **功能分离** - 前端、后端、文档、测试各司其职
3. **易于导航** - 新贡献者能快速找到目标文件
4. **符合规范** - 遵循GitHub和Node.js项目最佳实践

---

## 📂 一级目录结构（6个）

```
AgentForge/
├── backend/          # 后端服务（Node.js + Express）
├── src/              # 前端源代码（React + TypeScript）
├── docs/             # 项目文档和报告
├── public/           # 公共静态资源
├── scripts/          # 自动化脚本
└── tests/            # 测试文件
```

---

## 📖 详细说明

### 1. `backend/` - 后端服务

Node.js + Express后端应用，包含API、数据库、服务等。

```
backend/
├── src/              # 后端源代码
│   ├── routes/       # API路由定义
│   ├── controllers/  # 控制器逻辑
│   ├── services/     # 业务服务层
│   ├── models/       # 数据模型（Mongoose）
│   ├── middleware/   # 中间件（认证、错误处理等）
│   └── utils/        # 工具函数
├── config/           # 配置文件（迁移自根目录）
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── ...
├── dist/             # 编译输出（.gitignore）
└── package.json      # 后端依赖
```

**关键文件**:
- `src/index.ts` - 应用入口
- `src/app.ts` - Express应用配置
- `src/routes/*.ts` - API路由
- `src/services/analyticsService.ts` - Analytics核心服务

---

### 2. `src/` - 前端源代码

React + TypeScript前端应用，采用组件化架构。

```
src/
├── components/       # React组件
│   ├── dashboard/    # Dashboard相关组件
│   ├── agents/       # Agent管理组件
│   ├── tasks/        # 任务管理组件
│   └── common/       # 通用组件
├── services/         # API客户端服务
│   ├── analyticsApi.ts  # Analytics API客户端
│   └── ...
├── hooks/            # 自定义React Hooks
├── store/            # 状态管理（Zustand）
├── utils/            # 工具函数
│   ├── exportPdf.ts  # PDF导出工具
│   └── ...
├── types/            # TypeScript类型定义
├── styles/           # 全局样式
├── App.tsx           # 应用根组件
└── main.tsx          # 应用入口
```

**关键文件**:
- `App.tsx` - 应用主组件
- `components/dashboard/` - Analytics Dashboard
- `services/analyticsApi.ts` - 前端API集成
- `utils/exportPdf.ts` - 报表导出功能

---

### 3. `docs/` - 项目文档

所有项目文档、API参考、指南、报告的集中存放位置。

```
docs/
├── API_REFERENCE_v2.4.0.md      # API参考文档
├── ANALYTICS_GUIDE.md           # Analytics使用指南
├── DEPLOYMENT_GUIDE_v2.4.0.md   # 部署指南
├── V2.4.0_COMPLETION_REPORT.md  # 版本完成报告
├── DIRECTORY_STRUCTURE.md       # 目录结构说明（本文件）
├── growth-reports/              # 增长报告（迁移自根目录）
│   ├── 2026-03-18.md
│   ├── 2026-03-19.md
│   └── latest.txt
└── ...
```

**文档分类**:
- **用户文档**: 使用指南、快速开始
- **开发文档**: API参考、架构设计
- **运维文档**: 部署指南、监控配置
- **报告**: 版本发布、增长分析

---

### 4. `public/` - 公共静态资源

不需要编译处理的静态资源文件。

```
public/
├── index.html        # HTML模板
├── favicon.ico       # 网站图标
├── images/           # 图片资源
│   └── logo.png
├── fonts/            # 字体文件
└── ...
```

**特点**:
- 直接复制到构建输出目录
- 可通过绝对路径访问（如 `/images/logo.png`）
- 适合不需要打包的静态文件

---

### 5. `scripts/` - 自动化脚本

项目自动化工具、部署脚本、开发辅助脚本。

```
scripts/
├── prophet/          # Prophet AI自动化工具
│   ├── prophet-orchestrator.js
│   ├── prophet-heart.js
│   └── ...
├── deployment/       # 部署脚本
├── migration/        # 数据迁移脚本
└── ...
```

**用途**:
- CI/CD集成
- 数据迁移
- 开发辅助
- 自动化运维

---

### 6. `tests/` - 测试文件

所有测试相关文件，包括单元测试、集成测试、E2E测试。

```
tests/
├── api-test.sh       # API自动化测试脚本
├── TEST_RESULTS.md   # 测试结果报告
├── unit/             # 单元测试
├── integration/      # 集成测试
└── e2e/              # 端到端测试
```

**测试框架**:
- **Backend**: Jest/Mocha
- **Frontend**: Vitest + React Testing Library
- **E2E**: Playwright
- **API**: Shell脚本 + curl

---

## 🔧 配置文件位置

### 根目录配置（保留在根目录）

```
AgentForge/
├── package.json          # 项目依赖（前端）
├── package-lock.json     # 依赖锁定文件
├── .gitignore            # Git忽略规则
├── .eslintrc.json        # ESLint配置
├── tsconfig.json         # TypeScript配置（根）
├── vitest.config.ts      # Vitest测试配置
└── README.md             # 项目说明
```

### 后端配置（backend/config/）

```
backend/config/
├── vite.config.ts        # Vite构建配置
├── tailwind.config.js    # Tailwind CSS配置
├── tsconfig.json         # TypeScript配置（后端）
├── postcss.config.js     # PostCSS配置
└── ...
```

---

## 📦 构建产物（不提交到Git）

以下目录由构建工具生成，已添加到`.gitignore`：

```
.gitignore 包含:
├── node_modules/    # 依赖包
├── dist/            # 前端构建输出
├── backend/dist/    # 后端编译输出
├── .output/         # Electron打包输出
├── .dist/           # 临时构建产物
├── coverage/        # 测试覆盖率报告
└── .logs/           # 日志文件
```

---

## 🔄 目录优化历史

### v2.4.0+ (2026-03-20)

**优化**: 一级目录从8个减少到6个

**移动操作**:
- `config/` → `backend/config/`
  - 理由: 配置主要服务于后端构建
- `growth-reports/` → `docs/growth-reports/`
  - 理由: 报告属于文档类别

**受益**:
- ✅ 更清晰的项目结构
- ✅ 符合GitHub最佳实践
- ✅ 便于新贡献者快速上手
- ✅ 减少根目录文件混乱

---

## 🎯 寻找文件指南

### 我想找...

| 想找什么 | 去哪里找 |
|---------|---------|
| **API路由定义** | `backend/src/routes/` |
| **Analytics服务** | `backend/src/services/analyticsService.ts` |
| **Dashboard组件** | `src/components/dashboard/` |
| **API客户端** | `src/services/analyticsApi.ts` |
| **导出功能** | `src/utils/exportPdf.ts` |
| **API文档** | `docs/API_REFERENCE_v2.4.0.md` |
| **使用指南** | `docs/ANALYTICS_GUIDE.md` |
| **测试脚本** | `tests/api-test.sh` |
| **配置文件** | `backend/config/` 或 根目录 |
| **静态资源** | `public/` |

---

## 🚀 快速导航

### 开发相关
- **前端开发**: `src/`
- **后端开发**: `backend/src/`
- **样式调整**: `src/styles/` 或 `backend/config/tailwind.config.js`
- **API集成**: `src/services/`

### 文档相关
- **查看API**: `docs/API_REFERENCE_v2.4.0.md`
- **学习使用**: `docs/ANALYTICS_GUIDE.md`
- **了解架构**: `docs/ARCHITECTURE.md`

### 运维相关
- **部署项目**: `docs/DEPLOYMENT_GUIDE_v2.4.0.md`
- **运行测试**: `tests/api-test.sh`
- **查看脚本**: `scripts/`

---

## 📝 贡献指南

在提交代码前，请确保：

1. **文件放对位置** - 参考本文档的目录结构
2. **不提交构建产物** - 检查`.gitignore`规则
3. **保持目录简洁** - 新增目录需讨论
4. **更新文档** - 目录结构变化需更新本文档

---

## 💡 最佳实践

### ✅ 推荐做法

- 前端组件放在 `src/components/`
- 后端服务放在 `backend/src/services/`
- 文档放在 `docs/`
- 测试放在 `tests/`
- 配置放在 `backend/config/` 或根目录

### ❌ 避免做法

- 不要在根目录创建新的一级目录
- 不要在错误的位置放置文件
- 不要提交构建产物到Git
- 不要混淆前端和后端代码

---

## 🔗 相关文档

- [项目README](../README.md)
- [贡献指南](CONTRIBUTING.md)
- [开发指南](DEVELOPMENT.md)
- [API参考](API_REFERENCE_v2.4.0.md)

---

**维护者**: AgentForge Team
**最后更新**: 2026-03-20
**版本**: v2.4.0+
