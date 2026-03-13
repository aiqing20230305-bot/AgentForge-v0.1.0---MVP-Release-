# 🚨 紧急行动计划 - 明天 9:00 前完成

## ⏰ 时间线：2026-03-13 23:00 → 2026-03-14 09:00（10 小时）

---

## 🎯 核心目标

**交付一个开箱即用的 v0.1.0 MVP 版本**
- ✅ 功能完整（核心功能可用）
- ✅ 代码质量合格（无明显 bug）
- ✅ 文档齐全（用户能快速上手）
- ⚠️ 测试覆盖（关键路径有测试，不强求 70%）

---

## 📋 任务分解（按优先级）

### 🔴 P0 - 必须完成（6 小时）

#### 1. 代码清理和规范（2 小时）
- [ ] **移除所有调试 console.log**（保留 error/warn）
- [ ] **修复明显的类型错误**（any 改为具体类型）
- [ ] **统一代码风格**（缩进、命名）
- [ ] **移除未使用的导入**

**执行脚本：**
```bash
# 1.1 找出所有 console.log（30 分钟）
grep -rn "console.log" src/ --exclude-dir=node_modules > /tmp/console-logs.txt
# 手动检查并移除调试日志，保留关键日志

# 1.2 移除未使用的导入（15 分钟）
npx eslint src/ --fix --quiet || true

# 1.3 格式化代码（15 分钟）
npx prettier --write "src/**/*.{ts,tsx}" || true

# 1.4 修复类型错误（1 小时）
# 逐个文件修复，优先修复 errors，warnings 可以忽略
```

#### 2. 核心功能验证和修复（2 小时）
- [ ] **测试 Electron 启动**
- [ ] **验证 8 个 Demo Agent 显示**
- [ ] **验证任务列表显示**
- [ ] **验证自动发现功能**
- [ ] **修复发现的任何 bug**

**执行脚本：**
```bash
# 2.1 启动 Electron 测试（15 分钟）
npm run electron:dev
# 手动测试：
# - 看到 8 个 Agent ✓
# - 点击 ATLAS 看到任务 ✓
# - 自动发现能找到 OpenClaw ✓

# 2.2 Web 版本测试（15 分钟）
npm run dev
# 验证基本功能

# 2.3 修复发现的 bug（1.5 小时）
# 根据测试结果修复
```

#### 3. 最小化测试（1 小时）
- [ ] **手动测试关键路径**（无需写测试代码）
- [ ] **记录测试结果**
- [ ] **确保无阻断性 bug**

**测试清单：**
```
✓ 应用启动
✓ 显示 8 个 Agent
✓ 选择 Agent 显示对应任务
✓ 创建新任务
✓ 修改任务状态
✓ 自动发现扫描
✓ 添加数据源
```

#### 4. 文档最终检查（1 小时）
- [ ] **README.md 确保准确**
- [ ] **TROUBLESHOOTING.md 确保有用**
- [ ] **添加 LICENSE**
- [ ] **添加 CHANGELOG.md**

**执行脚本：**
```bash
# 4.1 添加 LICENSE（5 分钟）
cat > LICENSE <<EOF
MIT License

Copyright (c) 2026 World of Claudecraft Contributors

Permission is hereby granted, free of charge...
EOF

# 4.2 添加 CHANGELOG（10 分钟）
cat > CHANGELOG.md <<EOF
# Changelog

## [0.1.0] - 2026-03-14

### Added
- Initial release
- 8 demo agents
- Task management
- Auto-discovery for OpenClaw
- RPG-style equipment UI

### Fixed
- Agent ID standardization
- Task list empty issue
- Auto-discovery file system access
EOF

# 4.3 检查 README（15 分钟）
# 确保快速开始 3 步清晰

# 4.4 最终文档扫描（30 分钟）
# 检查所有链接、命令是否正确
```

---

### 🟡 P1 - 尽量完成（2 小时）

#### 5. 构建和打包测试（1 小时）
- [ ] **生产构建无错误**
- [ ] **Electron 打包测试**
- [ ] **文件大小检查**

```bash
# 5.1 构建测试（30 分钟）
npm run build
# 检查输出，确保无错误

# 5.2 Electron 打包（30 分钟）
npm run build
# 测试打包后的应用是否能启动
```

#### 6. Git 提交和 GitHub 准备（1 小时）
- [ ] **整理 Git 提交**
- [ ] **创建 .gitignore**
- [ ] **准备 GitHub 仓库描述**

```bash
# 6.1 .gitignore（5 分钟）
cat > .gitignore <<EOF
node_modules/
dist/
dist-electron/
*.log
.DS_Store
.env
*.local
EOF

# 6.2 提交代码（15 分钟）
git add .
git commit -m "feat: v0.1.0 MVP release

- Agent management with 8 demo agents
- Task management system
- Auto-discovery for OpenClaw
- Comprehensive documentation
- Bug fixes and improvements"

# 6.3 推送到 GitHub（10 分钟）
git push origin main
git tag v0.1.0
git push origin v0.1.0

# 6.4 创建 GitHub Release（30 分钟）
# 在 GitHub 上创建 Release
# 上传构建产物（如果有）
```

---

### 🟢 P2 - 如果有时间（2 小时）

#### 7. 代码质量提升（可选）
- [ ] ESLint 配置
- [ ] TypeScript 严格模式
- [ ] 简单单元测试

#### 8. 高级功能完善（可选）
- [ ] Agent 对话测试
- [ ] 任务同步测试
- [ ] 性能优化

---

## ⏱️ 详细时间表

### 23:00 - 01:00（2 小时）- 代码清理
```bash
cd ~/Downloads/world-of-claudecraft

# 移除调试代码
grep -rn "console.log" src/ > /tmp/logs.txt
# 逐个文件检查和清理

# 代码格式化
npm install --save-dev prettier
npx prettier --write "src/**/*.{ts,tsx}"

# 基本类型修复
# 优先修复 error，warning 可以暂时忽略
```

### 01:00 - 03:00（2 小时）- 功能验证
```bash
# 启动测试
npm run electron:dev

# 手动测试所有核心功能
# 记录问题并修复

# 如果有阻断性 bug，优先修复
```

### 03:00 - 04:00（1 小时）- 测试和验证
```bash
# 运行验证脚本
node scripts/verify-setup.js

# 手动测试清单
# 记录所有通过的功能
```

### 04:00 - 05:00（1 小时）- 文档
```bash
# 添加 LICENSE
# 添加 CHANGELOG
# 检查 README 准确性
# 最终文档扫描
```

### 05:00 - 06:00（1 小时）- 构建测试
```bash
# 生产构建
npm run build

# Electron 打包
# 测试打包后的应用
```

### 06:00 - 07:00（1 小时）- Git 和 GitHub
```bash
# 整理提交
# 推送代码
# 创建 tag
# 准备 Release
```

### 07:00 - 08:00（1 小时）- 缓冲时间
```bash
# 修复最后发现的问题
# 补充文档
# 最终检查
```

### 08:00 - 09:00（1 小时）- 最终验证
```bash
# 在全新环境测试（如果可能）
# 运行所有验证脚本
# 准备演示
```

---

## ✅ 完成标准（MVP v0.1.0）

### 必须达到：
- [x] 应用能启动（Electron）
- [x] 显示 8 个 Demo Agent
- [x] 任务列表显示正常
- [x] 自动发现功能工作
- [x] README 清晰准确
- [x] 无阻断性 bug
- [x] 代码已提交到 Git
- [x] LICENSE 文件存在

### 尽量达到：
- [ ] 生产构建成功
- [ ] GitHub Release 创建
- [ ] CHANGELOG 完整
- [ ] 代码风格统一

### 不强求：
- [ ] 测试覆盖率 70%
- [ ] TypeScript 严格模式
- [ ] ESLint 0 警告
- [ ] 所有高级功能

---

## 🚨 应急方案

### 如果时间不够：

**最小可交付（6 小时）：**
1. ✅ 代码清理（移除明显的调试代码）
2. ✅ 功能验证（确保核心功能可用）
3. ✅ 文档检查（README + LICENSE）
4. ✅ Git 提交

**可以跳过：**
- ❌ 完整的代码规范
- ❌ 单元测试
- ❌ Electron 打包
- ❌ GitHub Release

---

## 📝 执行检查清单

### 开始前（5 分钟）
- [ ] 关闭所有干扰
- [ ] 准备好开发环境
- [ ] 查看此计划
- [ ] 设置闹钟（每 2 小时）

### 每个阶段结束时
- [ ] 记录完成情况
- [ ] 提交代码（防止丢失）
- [ ] 休息 5 分钟
- [ ] 继续下一阶段

### 最终检查（8:30）
- [ ] 运行 `node scripts/verify-setup.js`
- [ ] 测试 `npm run electron:dev`
- [ ] 检查 README 指令
- [ ] 确认所有文件已提交

---

## 🎯 成功输出

**明天 9:00 能交付：**

1. **功能完整的应用**
   - Electron 和 Web 版本都能运行
   - 核心功能（Agent 管理、任务管理）可用
   - 自动发现功能工作

2. **清晰的文档**
   - README.md（快速开始）
   - TROUBLESHOOTING.md（故障排除）
   - CHANGELOG.md（版本记录）
   - LICENSE（开源许可）

3. **Git 仓库就绪**
   - 代码已提交
   - Tag v0.1.0 已创建
   - 准备好推送到 GitHub

4. **可演示**
   - 能在 5 分钟内展示核心功能
   - 能回答"怎么用"的问题

---

## 📊 进度追踪

创建一个简单的进度文件：

```bash
cat > /tmp/progress.txt <<EOF
23:00 - 代码清理 [ ]
01:00 - 功能验证 [ ]
03:00 - 测试验证 [ ]
04:00 - 文档完善 [ ]
05:00 - 构建测试 [ ]
06:00 - Git 提交 [ ]
07:00 - 缓冲时间 [ ]
08:00 - 最终验证 [ ]
EOF

# 每完成一个阶段就标记
sed -i '' 's/\[ \]/\[x\]/' /tmp/progress.txt
cat /tmp/progress.txt
```

---

## 🔥 立即开始

**现在就开始第一步：**

```bash
cd ~/Downloads/world-of-claudecraft

# 1. 查找所有 console.log
grep -rn "console.log" src/ --exclude-dir=node_modules > /tmp/console-logs.txt

# 2. 查看有多少个
wc -l /tmp/console-logs.txt

# 3. 开始逐个清理
# 打开编辑器开始工作
```

---

**时间紧迫，立即行动！每 2 小时检查一次进度，确保按计划进行。** 🚀
