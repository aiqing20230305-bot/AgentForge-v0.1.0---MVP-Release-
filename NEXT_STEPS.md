# World of Claudecraft - 下一步行动计划

## 📊 当前状态总结（2026-03-13）

### ✅ 已完成（今日工作）

1. **核心 Bug 修复**
   - ✅ Agent ID 格式统一（11 处修改）
   - ✅ 任务列表显示修复
   - ✅ Agent 选择逻辑修复

2. **自动发现功能**
   - ✅ 从浏览器 fetch 改为 Electron API
   - ✅ 支持读取 ~/.openclaw/openclaw.json
   - ✅ 支持扫描本地 Agent 目录
   - ✅ 修复 authToken 读取路径
   - ✅ 修复默认端口（18789）

3. **用户体验**
   - ✅ 连接状态指示器
   - ✅ 改进空状态提示
   - ✅ 增强调试日志

4. **开发基础设施**
   - ✅ Electron 环境修复
   - ✅ 测试套件脚本
   - ✅ CI/CD 配置（GitHub Actions）
   - ✅ 发布检查清单
   - ✅ 开发状态文档

5. **文档**
   - ✅ README.md 更新
   - ✅ TROUBLESHOOTING.md
   - ✅ IMPLEMENTATION_SUMMARY.md
   - ✅ DEVELOPMENT_STATUS.md
   - ✅ RELEASE_CHECKLIST.md

---

## 🎯 静默开发计划（无需人工测试）

### 阶段 1：代码清理和规范（1-2 天）

**目标：代码质量达到开源标准**

#### 1.1 TypeScript 严格模式
```bash
# 1. 更新 tsconfig.json
cat > tsconfig.json <<EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
EOF

# 2. 修复类型错误
npm run typecheck
# 逐个修复报错
```

#### 1.2 ESLint 配置
```bash
# 1. 安装 ESLint
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# 2. 创建 .eslintrc.js
cat > .eslintrc.js <<EOF
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended'
  ],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
}
EOF

# 3. 运行并修复
npm run lint
npm run lint:fix
```

#### 1.3 移除调试代码
```bash
# 查找所有 console.log
grep -rn "console.log" src/ --exclude-dir=node_modules > debug-logs.txt

# 策略：
# - 关键日志保留，添加到 logger
# - 调试日志删除或注释
# - 错误日志保留（console.error）
```

#### 1.4 优化导入
```bash
# 移除未使用的导入
npx eslint src/ --fix

# 统一导入顺序
# 1. React/库导入
# 2. 本地组件
# 3. Utils/Services
# 4. Types
# 5. 样式
```

---

### 阶段 2：自动化测试（2-3 天）

**目标：测试覆盖率 > 70%**

#### 2.1 单元测试框架设置
```bash
# 安装 Jest + React Testing Library
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev ts-jest @types/jest

# 配置 jest.config.js
cat > jest.config.js <<EOF
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}
EOF
```

#### 2.2 关键模块测试

**openclawLoader.ts**
```typescript
// src/utils/__tests__/openclawLoader.test.ts
describe('openclawLoader', () => {
  it('should use simple lowercase Agent IDs', () => {
    const agents = getDefaultAgents()
    expect(agents[0].id).toBe('atlas')
    expect(agents[1].id).toBe('clip')
  })

  it('should convert API agents correctly', () => {
    const apiAgent = { name: 'ATLAS', status: 'online' }
    const converted = convertApiAgentToLocal(apiAgent)
    expect(converted.id).toBe('atlas')
  })
})
```

**autoDiscovery.ts**
```typescript
// src/services/__tests__/autoDiscovery.test.ts
describe('autoDiscovery', () => {
  it('should read OpenClaw config correctly', async () => {
    // Mock electronAPI
    global.window.electronAPI = {
      readFile: jest.fn().mockResolvedValue(JSON.stringify({
        gateway: { auth: { token: 'test-token' } }
      }))
    }

    const results = await discoverOpenClawConfig()
    expect(results[0].config.authToken).toBe('test-token')
  })
})
```

#### 2.3 组件测试

**AgentDisplayPanel.tsx**
```typescript
// src/components/__tests__/AgentDisplayPanel.test.tsx
describe('AgentDisplayPanel', () => {
  it('should set task filter using agent.id', () => {
    const { getByText } = render(<AgentDisplayPanel />)
    const atlasButton = getByText('ATLAS')
    fireEvent.click(atlasButton)

    // 验证 setTaskStoreAgent 被调用时使用了 'atlas' 而非 'ATLAS'
  })
})
```

---

### 阶段 3：错误处理和边界情况（1-2 天）

**目标：所有操作都有错误处理**

#### 3.1 统一错误处理
```typescript
// src/utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string
  ) {
    super(message)
  }
}

export function handleError(error: unknown, context: string) {
  console.error(`[${context}] Error:`, error)

  if (error instanceof AppError) {
    // 显示用户友好的错误消息
    showNotification(error.userMessage, 'error')
  } else {
    // 未知错误
    showNotification('发生未知错误，请查看控制台', 'error')
  }
}
```

#### 3.2 添加 try-catch
```typescript
// 在所有 async 函数中添加错误处理
export async function loadOpenClawAgents(): Promise<OpenClawAgent[]> {
  try {
    console.log('[AgentLoader] Starting agent load...')
    // ... 现有代码
  } catch (error) {
    console.error('[AgentLoader] Failed to load agents:', error)
    // 降级到 demo 数据
    return getDefaultAgents()
  }
}
```

#### 3.3 边界情况处理
```typescript
// 空数组、null、undefined 检查
const tasks = getFilteredTasks() || []
const agent = agents.find(a => a.id === selectedId) ?? getDefaultAgent()

// 目录不存在检查
async function scanDirectory(path: string) {
  try {
    const exists = await window.electronAPI.fileExists(path)
    if (!exists) {
      console.warn(`Directory not found: ${path}`)
      return []
    }
    return await window.electronAPI.scanDirectory(path)
  } catch (error) {
    return []
  }
}
```

---

### 阶段 4：性能优化（1 天）

#### 4.1 React 性能
```typescript
// 使用 useMemo 缓存计算
const filteredTasks = useMemo(() => {
  return tasks.filter(t => t.agentId === selectedAgentId)
}, [tasks, selectedAgentId])

// 使用 useCallback 避免重复创建函数
const handleSelectAgent = useCallback((agent: OpenClawAgent) => {
  setSelectedAgent(agent)
  setTaskStoreAgent(agent.id)
}, [])

// 使用 React.memo 避免不必要的渲染
export default React.memo(TaskItem)
```

#### 4.2 虚拟滚动（如果需要）
```bash
# 当任务数 > 100 时，使用虚拟滚动
npm install react-window
```

---

### 阶段 5：文档完善（1-2 天）

#### 5.1 API 文档
```markdown
## API Reference

### `loadOpenClawAgents()`

加载 OpenClaw Agent 列表。

**返回值：** `Promise<OpenClawAgent[]>`

**加载顺序：**
1. 数据源管理器
2. OpenClaw Gateway
3. 默认 Demo 数据

**示例：**
\`\`\`typescript
const agents = await loadOpenClawAgents()
console.log(agents[0].id) // "atlas"
\`\`\`
```

#### 5.2 架构文档
```markdown
## Architecture

### Data Flow

```
User Action → Component → Store → Service → API/Storage
                ↓
            UI Update
```

### Key Components

- **AgentDisplayPanel**: Agent 选择和展示
- **TaskManagementPanel**: 任务列表和管理
- **AutoDiscoveryPanel**: 自动发现数据源
```

#### 5.3 贡献指南
```markdown
# Contributing to World of Claudecraft

## Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Run tests: `npm test`
5. Start dev server: `npm run dev`

## Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Add tests for new features
- Update documentation

## Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Tests
- `chore:` Maintenance
```

---

### 阶段 6：CI/CD 和自动化（1 天）

#### 6.1 GitHub Actions 完善
```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: |
          npm ci
          npm run build
      - name: Create Release
        uses: actions/create-release@v1
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
```

#### 6.2 Pre-commit Hooks
```bash
# 安装 husky
npm install --save-dev husky lint-staged

# 设置 pre-commit
npx husky install
npx husky add .husky/pre-commit "npm test"

# package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

## 📅 时间线

| 阶段 | 任务 | 预计时间 | 累计时间 |
|------|------|----------|----------|
| 1 | 代码清理和规范 | 1-2 天 | 2 天 |
| 2 | 自动化测试 | 2-3 天 | 5 天 |
| 3 | 错误处理 | 1-2 天 | 7 天 |
| 4 | 性能优化 | 1 天 | 8 天 |
| 5 | 文档完善 | 1-2 天 | 10 天 |
| 6 | CI/CD | 1 天 | 11 天 |
| **总计** | | **约 2 周** | |

---

## 🎯 里程碑

### Week 1: 代码质量提升
- [ ] TypeScript 严格模式通过
- [ ] ESLint 0 警告
- [ ] 测试覆盖率 > 50%

### Week 2: 测试和文档
- [ ] 测试覆盖率 > 70%
- [ ] 所有文档完成
- [ ] CI/CD 配置完成

### Week 3: MVP 发布
- [ ] 运行 RELEASE_CHECKLIST.md 所有项
- [ ] 在 3 个平台测试
- [ ] 发布 v0.1.0

---

## 🚀 自动化脚本

### 每日运行
```bash
# 代码检查
npm run typecheck
npm run lint

# 测试
npm test
./scripts/test-suite.sh

# 构建
npm run build
```

### 每周运行
```bash
# 依赖更新
npm outdated
npm update

# 安全检查
npm audit
npm audit fix

# 覆盖率检查
npm run test:coverage
```

---

## 📌 当前待办事项（优先级排序）

### 🔴 高优先级（本周）
1. [ ] 运行 `./scripts/test-suite.sh` 并修复所有失败项
2. [ ] 配置 TypeScript 严格模式
3. [ ] 添加基本单元测试（目标 50% 覆盖率）
4. [ ] 移除生产环境 console.log

### 🟡 中优先级（下周）
1. [ ] 完成 CONTRIBUTING.md
2. [ ] 添加 LICENSE 文件
3. [ ] 配置 GitHub Actions
4. [ ] 增加测试覆盖率到 70%

### 🟢 低优先级（有时间再做）
1. [ ] 性能优化
2. [ ] 多语言支持
3. [ ] 更多主题选项
4. [ ] 高级功能开发

---

## 📊 进度追踪

使用此命令查看当前进度：

```bash
# 总体健康检查
./scripts/test-suite.sh

# 测试覆盖率
npm run test:coverage

# 代码质量
npm run lint

# 类型检查
npm run typecheck
```

---

**下次工作开始时，从这里继续：**

1. 运行 `./scripts/test-suite.sh`
2. 查看失败项并逐个修复
3. 每天提交进度到 Git
4. 更新此文档
