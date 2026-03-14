# 🤖 AgentForge 自动化发布指南

完整的自动化发布流程，从提交到GitHub Release一键完成。

---

## 📦 工具概览

### 核心脚本
1. **`one-click-release.sh`** - 一键发布（推荐）
2. **`smart-push.sh`** - 智能Git推送（自动处理SSH/HTTPS）
3. **`auto-release.sh`** - 自动创建GitHub Release
4. **`auto-screenshot.js`** - 自动生成产品截图

### CI/CD
- **`.github/workflows/release.yml`** - GitHub Actions自动发布流程

---

## 🚀 快速开始

### 方式1: 一键发布（最简单）⭐

```bash
# 运行一键发布脚本
./scripts/one-click-release.sh 0.3.7

# 或者不指定版本，脚本会提示输入
./scripts/one-click-release.sh
```

**流程说明：**
1. ✅ TypeScript类型检查
2. ✅ 更新package.json版本号
3. ✅ 生成发布说明模板（如不存在）
4. ✅ 创建Git commit和tag
5. ✅ 智能推送到GitHub（自动处理SSH/HTTPS）
6. ✅ 可选：自动生成产品截图
7. ✅ 可选：自动创建GitHub Release

**时间：** ~2分钟（含截图~10分钟）

---

### 方式2: GitHub Actions全自动（最智能）⭐⭐⭐

```bash
# 1. 创建tag并推送
git tag v0.3.7
git push origin v0.3.7

# 2. GitHub Actions自动完成：
#    - TypeScript检查
#    - 构建
#    - 生成截图
#    - 创建Release
#    - 上传构建产物和截图
```

**优点：**
- ✅ 完全自动化
- ✅ 在云端运行，不占用本地资源
- ✅ 可靠的CI环境
- ✅ 自动截图（Playwright）
- ✅ 自动上传构建产物

**设置：**
已配置在`.github/workflows/release.yml`，推送tag即可触发。

---

### 方式3: 分步手动（完全控制）

```bash
# 1. TypeScript检查
npm run typecheck

# 2. 更新版本
npm version 0.3.7 --no-git-tag-version

# 3. 编辑发布说明
nano RELEASE_v0.3.7.md

# 4. Git操作
git add .
git commit -m "release: v0.3.7"
git tag -a v0.3.7 -m "Release v0.3.7"

# 5. 智能推送
./scripts/smart-push.sh

# 6. 生成截图（可选）
npm run dev  # 启动应用
node scripts/auto-screenshot.js  # 另一个终端运行

# 7. 创建GitHub Release
./scripts/auto-release.sh 0.3.7
```

---

## 🔧 工具详解

### 1. smart-push.sh - 智能Git推送

**功能：**
- 自动检测SSH/HTTPS
- SSH失败时自动切换HTTPS
- 提示输入GitHub凭证
- 支持credential helper

**使用：**
```bash
./scripts/smart-push.sh
```

**场景：**
- SSH密钥未配置 → 自动切换HTTPS
- HTTPS未登录 → 提示输入Token
- 自动推送commit + tags

---

### 2. auto-release.sh - GitHub Release自动化

**依赖：** GitHub CLI (`gh`)

**安装gh：**
```bash
# macOS
brew install gh

# Windows
winget install GitHub.cli

# Linux
# 参考: https://github.com/cli/cli#installation
```

**使用：**
```bash
# 首次使用：认证
gh auth login

# 创建Release
./scripts/auto-release.sh 0.3.7

# 或自动读取package.json版本
./scripts/auto-release.sh
```

**功能：**
- ✅ 自动读取发布说明文件
- ✅ 上传截图（如存在）
- ✅ 上传构建产物（可选）
- ✅ 生成Release URL
- ✅ 显示统计信息

---

### 3. auto-screenshot.js - 自动截图

**依赖：** Playwright

**安装：**
```bash
npm install -D playwright
npx playwright install chromium
```

**使用：**
```bash
# 1. 启动应用（终端1）
npm run dev

# 2. 运行截图脚本（终端2）
node scripts/auto-screenshot.js
```

**配置的截图（6张）：**
1. ⭐⭐⭐ 任务搜索系统
2. ⭐⭐ OpenClaw配置复制
3. ⭐ 任务日志复制
4. ⭐⭐⭐ ComponentShowcase - 搜索
5. ⭐⭐ ComponentShowcase - 复制
6. ⭐ ComponentShowcase - 加载

**输出：**
```
docs/screenshots/v0.3.7/
├── v0.3.7-task-search.png
├── v0.3.7-copy-config.png
├── v0.3.7-log-copy.png
├── v0.3.7-showcase-search.png
├── v0.3.7-showcase-copy.png
└── v0.3.7-showcase-loading.png
```

**自定义截图：**
编辑`scripts/auto-screenshot.js`中的`SCREENSHOTS`数组。

---

### 4. one-click-release.sh - 一键发布

**集成所有工具的超级脚本。**

**使用：**
```bash
# 指定版本
./scripts/one-click-release.sh 0.3.7

# 交互式输入版本
./scripts/one-click-release.sh
```

**流程：**
```
1. TypeScript检查         [自动]
2. 版本号更新             [自动]
3. 发布说明生成           [自动/手动编辑]
4. Git commit & tag       [自动]
5. 推送到GitHub           [自动，智能处理凭证]
6. 产品截图               [可选，自动]
7. GitHub Release         [可选，自动]
```

---

## 🔐 凭证配置

### SSH密钥（推荐）

```bash
# 1. 生成SSH密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. 添加到ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 3. 复制公钥
cat ~/.ssh/id_ed25519.pub
# 粘贴到: https://github.com/settings/keys

# 4. 测试
ssh -T git@github.com
```

---

### HTTPS + Personal Access Token

```bash
# 1. 生成Token
# 访问: https://github.com/settings/tokens
# 权限: repo (全部)

# 2. 配置credential helper（避免重复输入）
git config --global credential.helper store

# 3. 首次推送时输入
git push
# Username: 你的GitHub用户名
# Password: 粘贴Token（不是密码！）

# 4. 凭证会保存到 ~/.git-credentials
```

---

### GitHub CLI认证

```bash
# 运行认证流程
gh auth login

# 选择：
# ? What account do you want to log into? GitHub.com
# ? What is your preferred protocol for Git operations? HTTPS
# ? Authenticate Git with your GitHub credentials? Yes
# ? How would you like to authenticate GitHub CLI? Login with a web browser

# 或使用Token
gh auth login --with-token < token.txt
```

---

## 📊 GitHub Actions设置

### 启用Actions
1. 访问：`https://github.com/yourusername/agentforge/settings/actions`
2. 确保"Allow all actions"已启用

### 触发发布
```bash
# 推送tag即可触发
git tag v0.3.7
git push origin v0.3.7

# 查看运行状态
gh run list
gh run view
```

### 监控构建
访问：`https://github.com/yourusername/agentforge/actions`

---

## 🎯 最佳实践

### 1. 版本号规范
遵循语义化版本（SemVer）：
- **MAJOR.MINOR.PATCH** (例: 1.2.3)
- **MAJOR**: 不兼容的API变更
- **MINOR**: 向后兼容的新功能
- **PATCH**: 向后兼容的bug修复

### 2. 发布说明模板
使用`RELEASE_v{VERSION}.md`文件：
- 📝 Overview（概述）
- ✨ What's New（新功能）
- 🐛 Bug Fixes（修复）
- 📊 Technical Details（技术细节）
- 📦 Installation（安装）

### 3. 截图规范
- **分辨率：** 1920x1080 (Full HD)
- **格式：** PNG（高质量）
- **命名：** `v{VERSION}-{feature}.png`
- **优化：** 使用ImageOptim/TinyPNG压缩

### 4. Git提交信息
```bash
# 好的提交信息
release: v0.3.7 - Feature Name

✨ New Features:
- Feature 1 description
- Feature 2 description

🔧 Improvements:
- Improvement description

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

## 🐛 常见问题

### Q: SSH推送失败？
**A:** 运行`smart-push.sh`会自动切换到HTTPS。

### Q: HTTPS需要重复输入密码？
**A:** 配置credential helper：
```bash
git config --global credential.helper store
```

### Q: Playwright截图失败？
**A:** 确保：
1. 应用已启动（`npm run dev`）
2. Playwright已安装（`npx playwright install chromium`）
3. 端口5173可访问

### Q: gh CLI未认证？
**A:** 运行`gh auth login`完成认证。

### Q: GitHub Actions失败？
**A:** 检查：
1. `.github/workflows/release.yml`语法
2. Actions权限已启用
3. GITHUB_TOKEN可用（自动提供）

---

## 📚 参考文档

- [GitHub CLI文档](https://cli.github.com/manual/)
- [Playwright文档](https://playwright.dev/)
- [GitHub Actions文档](https://docs.github.com/actions)
- [语义化版本](https://semver.org/lang/zh-CN/)

---

## 🎉 总结

**推荐工作流：**

| 场景 | 方法 | 时间 |
|------|------|------|
| 快速发布 | `one-click-release.sh` | 2分钟 |
| 包含截图 | `one-click-release.sh` + 截图选项 | 10分钟 |
| 完全自动 | Push tag → GitHub Actions | 5分钟（云端） |
| 手动控制 | 分步执行各脚本 | 15分钟 |

**所有脚本位置：**
```
scripts/
├── one-click-release.sh      # 一键发布（推荐）
├── smart-push.sh              # 智能推送
├── auto-release.sh            # GitHub Release
└── auto-screenshot.js         # 自动截图

.github/workflows/
└── release.yml                # CI/CD配置
```

---

**现在开始你的自动化发布之旅吧！** 🚀
