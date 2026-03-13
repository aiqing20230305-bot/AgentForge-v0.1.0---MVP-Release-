# World of Claudecraft - 开源发布检查清单

## 📋 发布前必须完成的任务

### 🔧 代码质量

- [ ] **移除所有调试代码**
  ```bash
  # 检查 console.log
  grep -r "console.log\|console.warn\|console.error" src/ --exclude-dir=node_modules

  # 移除或替换为 logger
  ```

- [ ] **TypeScript 严格模式**
  ```json
  // tsconfig.json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true
    }
  }
  ```

- [ ] **ESLint 配置并通过**
  ```bash
  npm run lint
  npm run lint:fix
  ```

- [ ] **移除未使用的导入和变量**
  ```bash
  npx eslint src/ --fix
  ```

---

### 🧪 测试覆盖

- [ ] **运行完整测试套件**
  ```bash
  ./scripts/test-suite.sh
  ```

- [ ] **单元测试（目标覆盖率 > 70%）**
  - [ ] openclawLoader.ts
  - [ ] autoDiscovery.ts
  - [ ] taskStore.ts
  - [ ] buildStore.ts

- [ ] **集成测试**
  - [ ] Agent 加载流程
  - [ ] 任务管理流程
  - [ ] 自动发现流程

- [ ] **E2E 测试（关键路径）**
  - [ ] 首次启动 → 看到 Demo 数据
  - [ ] 选择 Agent → 显示任务
  - [ ] 创建任务 → 任务出现在列表
  - [ ] 自动发现 → 添加数据源

- [ ] **手动测试（3 个平台）**
  - [ ] macOS
  - [ ] Windows
  - [ ] Linux

---

### 📝 文档完整性

- [ ] **README.md 包含：**
  - [ ] 项目简介和截图
  - [ ] 快速开始（3 步以内）
  - [ ] 功能列表
  - [ ] 使用文档
  - [ ] 贡献指南链接
  - [ ] 许可证声明

- [ ] **TROUBLESHOOTING.md 包含：**
  - [ ] 常见问题（至少 5 个）
  - [ ] 错误信息解释
  - [ ] 解决步骤
  - [ ] FAQ

- [ ] **CONTRIBUTING.md（新建）**
  - [ ] 开发环境设置
  - [ ] 代码规范
  - [ ] 提交规范
  - [ ] PR 流程

- [ ] **LICENSE（新建）**
  - [ ] 选择合适的开源许可证（MIT/Apache 2.0/等）
  - [ ] 添加版权声明

- [ ] **CHANGELOG.md（新建）**
  - [ ] 版本历史
  - [ ] 每个版本的变更说明

---

### 🎨 用户体验

- [ ] **首次启动体验**
  - [ ] 无需配置即可看到内容
  - [ ] 状态指示器清晰可见
  - [ ] 有引导提示（可选）

- [ ] **错误处理**
  - [ ] 所有可能失败的操作有 try-catch
  - [ ] 错误信息友好且可操作
  - [ ] 无未处理的 Promise rejection

- [ ] **性能优化**
  - [ ] 大数据集（100+ 任务）加载流畅
  - [ ] 无明显卡顿
  - [ ] 内存泄漏检查

- [ ] **UI 细节**
  - [ ] 所有按钮有 hover 效果
  - [ ] Loading 状态明确
  - [ ] 无布局闪烁
  - [ ] 深色模式支持（如果有）

---

### 🔐 安全性

- [ ] **敏感信息处理**
  - [ ] authToken 不出现在日志中
  - [ ] 不向服务器发送用户数据
  - [ ] localStorage 数据加密（如果需要）

- [ ] **依赖安全**
  ```bash
  npm audit
  npm audit fix
  ```

- [ ] **代码注入防护**
  - [ ] 所有用户输入进行验证
  - [ ] 使用 DOMPurify（如果需要）

---

### 📦 构建和部署

- [ ] **生产构建无错误**
  ```bash
  npm run build
  # 检查 dist/ 输出
  ```

- [ ] **Electron 打包测试**
  ```bash
  npm run build
  # 测试打包后的应用
  ```

- [ ] **Web 版本测试**
  ```bash
  npm run preview
  # 在不同浏览器中测试
  ```

- [ ] **文件大小优化**
  - [ ] 移除未使用的依赖
  - [ ] 代码分割（如果需要）
  - [ ] 资源压缩

---

### 🌍 国际化（可选）

- [ ] **多语言支持准备**
  - [ ] 提取所有硬编码文本
  - [ ] 创建语言文件结构
  - [ ] 至少支持中英文

---

### 🤝 社区准备

- [ ] **GitHub 仓库配置**
  - [ ] 添加 Description
  - [ ] 添加 Topics/Tags
  - [ ] 设置 GitHub Pages（如果需要）
  - [ ] 配置 Issue 模板
  - [ ] 配置 PR 模板

- [ ] **CI/CD 配置**
  - [ ] GitHub Actions 测试流程
  - [ ] 自动化发布（可选）
  - [ ] Badge 添加到 README

- [ ] **社交媒体准备**
  - [ ] 准备发布推文
  - [ ] 准备 Product Hunt 页面（可选）
  - [ ] 准备演示视频/GIF

---

### ✅ 最终验证

- [ ] **新机器测试**
  ```bash
  # 在全新环境中：
  git clone <repo>
  cd world-of-claudecraft
  npm install
  npm run dev
  # ← 应该能立即看到 8 个 Agent
  ```

- [ ] **README 指令测试**
  - [ ] 按照 README 步骤操作
  - [ ] 确保每一步都能成功
  - [ ] 时间不超过 5 分钟

- [ ] **运行验证脚本**
  ```bash
  node scripts/verify-setup.js
  # 应该全部通过
  ```

- [ ] **运行完整测试**
  ```bash
  ./scripts/test-suite.sh
  # 0 个失败
  ```

---

## 📅 发布流程

### 1. 准备发布

```bash
# 1. 确保所有测试通过
./scripts/test-suite.sh

# 2. 更新版本号
npm version <major|minor|patch>

# 3. 更新 CHANGELOG
# 手动编辑 CHANGELOG.md

# 4. 提交发布
git add .
git commit -m "chore: prepare for v1.0.0 release"
git tag v1.0.0
```

### 2. 发布到 GitHub

```bash
# 推送代码和标签
git push origin main
git push origin v1.0.0

# 在 GitHub 上创建 Release
# - 使用 tag v1.0.0
# - 复制 CHANGELOG 内容
# - 上传构建产物（如果有）
```

### 3. 发布后

- [ ] 监控 GitHub Issues
- [ ] 回答社区问题
- [ ] 收集用户反馈
- [ ] 规划下一版本

---

## 🎯 发布标准

### MVP 最小可行产品（v0.1.0）

- ✅ 8 个 Demo Agent 开箱即用
- ✅ 任务列表显示正常
- ✅ 基本的任务管理（创建、更新、过滤）
- ✅ 自动发现本地 OpenClaw
- ✅ README + TROUBLESHOOTING 文档
- ⚠️ 测试覆盖率 > 50%

### Beta 版本（v0.5.0）

- ✅ MVP 所有功能
- ✅ Agent 对话功能
- ✅ 完整的任务生命周期
- ✅ 测试覆盖率 > 70%
- ✅ 完整文档（含贡献指南）
- ✅ CI/CD 配置

### 正式版本（v1.0.0）

- ✅ Beta 所有功能
- ✅ 3 个平台测试通过
- ✅ 性能优化完成
- ✅ 无已知严重 Bug
- ✅ 社区反馈采纳
- ✅ 完善的错误处理

---

## 📊 当前状态检查

```bash
# 运行此命令查看当前完成度
./scripts/test-suite.sh

# 查看文档完整性
ls -1 *.md

# 查看测试覆盖率
npm run test:coverage
```

---

**预计发布时间线：**

- **v0.1.0 (MVP)**: 1 周内（已完成 80%）
- **v0.5.0 (Beta)**: 2-3 周内
- **v1.0.0 (正式)**: 1-2 个月内
