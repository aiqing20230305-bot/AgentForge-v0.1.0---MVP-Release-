# 🧹 项目文件清理整理计划

**当前状态**: 209个Markdown文件 + 4个Shell脚本 = 混乱
**目标**: 专业、简洁、易导航的项目结构

---

## 📊 现状分析

```
根目录文件混乱：
- 209个.md文件（太多！）
- 4个.sh脚本
- 大量历史版本文档（v0.x, v1.x, v2.0-v2.2）
- 重复和过时的文档
- 缺乏清晰的组织结构
```

---

## 🎯 目标结构

```
AgentForge/
├── 📄 README.md                    # 项目主页（精简版）
├── 📄 LICENSE                       # MIT许可证
├── 📄 CHANGELOG.md                 # 变更日志（仅保留主要版本）
├── 📄 CONTRIBUTING.md              # 贡献指南
├── 📄 CODE_OF_CONDUCT.md           # 行为准则
├── 📄 SECURITY.md                  # 安全政策
│
├── 📁 docs/                         # 📚 所有文档
│   ├── 📄 README.md                # 文档导航（目录）
│   │
│   ├── 📁 guides/                  # 使用指南
│   │   ├── quick-start.md
│   │   ├── installation.md
│   │   ├── deployment.md
│   │   ├── gamification-guide.md
│   │   ├── rtl-guide.md
│   │   ├── sso-guide.md
│   │   └── plugin-development.md
│   │
│   ├── 📁 features/                # 功能文档
│   │   ├── gamification.md
│   │   ├── notifications.md
│   │   ├── reports.md
│   │   ├── i18n-rtl.md
│   │   └── sso-auth.md
│   │
│   ├── 📁 api/                     # API文档
│   │   ├── rest-api.md
│   │   ├── websocket-api.md
│   │   └── plugin-api.md
│   │
│   ├── 📁 architecture/            # 架构文档
│   │   ├── system-design.md
│   │   ├── database-schema.md
│   │   ├── frontend-architecture.md
│   │   └── backend-architecture.md
│   │
│   ├── 📁 releases/                # 发布说明
│   │   ├── v2.3.0.md
│   │   ├── v2.4.0.md
│   │   └── roadmap.md
│   │
│   ├── 📁 operations/              # 运营文档
│   │   ├── growth-strategy.md
│   │   ├── community-management.md
│   │   ├── marketing.md
│   │   └── analytics.md
│   │
│   ├── 📁 testing/                 # 测试文档
│   │   ├── test-strategy.md
│   │   ├── e2e-testing.md
│   │   └── test-coverage.md
│   │
│   └── 📁 archive/                 # 历史归档
│       ├── v0.x/                   # v0.x版本文档
│       ├── v1.x/                   # v1.x版本文档
│       ├── v2.0-v2.2/              # v2.0-v2.2版本文档
│       └── deprecated/             # 废弃的文档
│
├── 📁 scripts/                      # 🔧 所有脚本
│   ├── deploy.sh
│   ├── build.sh
│   ├── test.sh
│   └── cleanup.sh
│
├── 📁 .github/                      # GitHub配置
│   ├── workflows/                  # CI/CD
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── FUNDING.yml
│
├── 📁 src/                          # 源代码（不变）
├── 📁 backend/                      # 后端代码（不变）
├── 📁 tests/                        # 测试文件（不变）
└── 📁 public/                       # 静态资源（不变）
```

---

## 🗂️ 文件分类和归档策略

### ✅ 保留在根目录（7个核心文件）

```
1. README.md                 # 主页（重写为简洁版）
2. LICENSE                   # MIT许可证
3. CHANGELOG.md              # 主要版本变更（精简）
4. CONTRIBUTING.md           # 贡献指南
5. CODE_OF_CONDUCT.md        # 行为准则
6. SECURITY.md               # 安全政策
7. .gitignore                # Git忽略规则
```

### 📚 移动到 docs/guides/

**使用指南类（15个）**：
- QUICK_START_GUIDE.md → quick-start.md
- QUICK_START_PHASE1.md → getting-started.md
- QUICK_START_WEB.md → web-version.md
- DEPLOYMENT_GUIDE.md → deployment.md
- GAMIFICATION_GUIDE.md → gamification-guide.md
- RTL_GUIDE.md → rtl-guide.md
- SSO_INTEGRATION_GUIDE.md → sso-guide.md
- PLUGIN_DEVELOPMENT.md → plugin-development.md
- NOTIFICATION_GUIDE.md → notifications.md
- REPORTS_USER_GUIDE.md → reports.md
- [其他重复的QUICK_START_*.md合并]

### 🎯 移动到 docs/features/

**功能文档类（20+个）**：
- GAMIFICATION_SUMMARY.md → gamification.md
- NOTIFICATION_SYSTEM_SUMMARY.md → notifications.md
- RTL_SYSTEM_SUMMARY.md → i18n-rtl.md
- SSO_SYSTEM_SUMMARY.md → sso-auth.md
- REPORTS_SYSTEM_SUMMARY.md → reports.md
- ACHIEVEMENT_SYSTEM.md → achievements.md
- REFERRAL_SYSTEM.md → referral-system.md
- ONBOARDING_SYSTEM.md → onboarding.md
- [其他功能相关文档]

### 🚀 移动到 docs/releases/

**发布和路线图类（30+个）**：
- ROADMAP_v2.3.0.md → v2.3.0-roadmap.md
- ROADMAP_v2.4.0.md → v2.4.0-roadmap.md
- PRODUCT_ROADMAP_*.md → roadmap.md（合并）
- EVOLUTION_ROADMAP.md → evolution.md
- [其他ROADMAP_*.md]

### 📈 移动到 docs/operations/

**增长和运营类（40+个）**：
- COLD_START_STRATEGY.md → cold-start.md
- GROWTH_TRACKER.md → growth-tracking.md
- SOCIAL_MEDIA_TEMPLATES.md → social-media.md
- LAUNCH_SPRINT_v2.3.0.md → v2.3.0-launch.md
- COMMUNITY_BUILDER_SUMMARY.md → community.md
- ANALYTICS_DASHBOARD_README.md → analytics.md
- AUTOMATION_*.md → automation/
- [其他增长相关文档]

### 🏗️ 移动到 docs/architecture/

**架构设计类（10+个）**：
- ARCHITECTURE.md → system-design.md
- DATABASE_SCHEMA.md → database-schema.md
- API_DOCUMENTATION.md → api-reference.md
- PLUGIN_ARCHITECTURE.md → plugin-system.md
- [其他架构文档]

### 🧪 移动到 docs/testing/

**测试相关（10+个）**：
- TESTING_STRATEGY.md → test-strategy.md
- E2E_TESTING_GUIDE.md → e2e-testing.md
- TEST_COVERAGE_REPORT.md → coverage-report.md
- PHASE*.md测试相关 → testing/phases/

### 📦 归档到 docs/archive/

**历史版本文档（80+个）**：

**v0.x时代**：
- 所有CHANGELOG_v0.*.md → archive/v0.x/changelogs/
- 所有v0.x相关功能文档 → archive/v0.x/

**v1.x时代**：
- CHANGELOG_v1.*.md → archive/v1.x/changelogs/
- ROADMAP_v1.*.md → archive/v1.x/roadmaps/
- TASK*_v1.*.md → archive/v1.x/tasks/

**v2.0-v2.2时代**：
- v2.0.md, v2.1.0.md, v2.2.0.md → archive/v2.0-v2.2/
- 相关功能文档 → archive/v2.0-v2.2/features/

**过时的Sprint和临时文档**：
- 14H_SPRINT_*.md → archive/deprecated/sprints/
- 3DAY_SPRINT_*.md → archive/deprecated/sprints/
- PHASE*_PROGRESS.md → archive/deprecated/progress/
- *_SUMMARY.md（已合并的） → archive/deprecated/summaries/

### 🔧 移动到 scripts/

**脚本文件（4个）**：
- DEPLOY_NOW.sh → deploy.sh
- BUILD_*.sh → build.sh
- TEST_*.sh → test.sh
- 其他.sh → scripts/

### 🗑️ 删除（完全过时，无需归档）

**重复文件**：
- 多个相同内容的QUICK_START_*.md（保留最新）
- 多个ROADMAP_v2.*.md（保留v2.3.0+）

**临时文件**：
- *_DRAFT.md
- *_TEMP.md
- *_OLD.md
- *_BACKUP.md

---

## 🚀 执行步骤

### Step 1: 创建目录结构（2分钟）

```bash
# 创建docs目录结构
mkdir -p docs/{guides,features,api,architecture,releases,operations,testing,archive/{v0.x,v1.x,v2.0-v2.2,deprecated}}

# 创建scripts目录
mkdir -p scripts

# 创建docs README
```

### Step 2: 移动核心指南（5分钟）

```bash
# 使用Git mv保留历史
git mv QUICK_START_GUIDE.md docs/guides/quick-start.md
git mv DEPLOYMENT_GUIDE.md docs/guides/deployment.md
git mv GAMIFICATION_GUIDE.md docs/guides/gamification-guide.md
git mv RTL_GUIDE.md docs/guides/rtl-guide.md
git mv PLUGIN_DEVELOPMENT.md docs/guides/plugin-development.md
# [继续其他指南...]
```

### Step 3: 移动功能文档（5分钟）

```bash
git mv GAMIFICATION_SUMMARY.md docs/features/gamification.md
git mv NOTIFICATION_SYSTEM_SUMMARY.md docs/features/notifications.md
git mv RTL_SYSTEM_SUMMARY.md docs/features/i18n-rtl.md
# [继续...]
```

### Step 4: 归档历史版本（10分钟）

```bash
# v0.x归档
git mv CHANGELOG_v0.*.md docs/archive/v0.x/

# v1.x归档
git mv CHANGELOG_v1.*.md docs/archive/v1.x/
git mv ROADMAP_v1.*.md docs/archive/v1.x/

# v2.0-v2.2归档
git mv PHASE1_*.md docs/archive/v2.0-v2.2/
```

### Step 5: 移动脚本文件（2分钟）

```bash
git mv DEPLOY_NOW.sh scripts/deploy.sh
git mv *.sh scripts/
chmod +x scripts/*.sh
```

### Step 6: 创建文档导航（5分钟）

创建 `docs/README.md` 作为文档中心：

```markdown
# 📚 AgentForge Documentation

Welcome to AgentForge documentation!

## 🚀 Quick Links

- [Quick Start Guide](guides/quick-start.md)
- [Installation](guides/installation.md)
- [Deployment](guides/deployment.md)
- [API Reference](api/rest-api.md)

## 📖 Documentation Structure

### Guides
User-facing guides and tutorials
- [Quick Start](guides/quick-start.md)
- [Gamification Guide](guides/gamification-guide.md)
- [RTL Support Guide](guides/rtl-guide.md)
- [SSO Integration](guides/sso-guide.md)
- [Plugin Development](guides/plugin-development.md)

### Features
Detailed feature documentation
- [Gamification System](features/gamification.md)
- [Notification System](features/notifications.md)
- [Reporting System](features/reports.md)
- [i18n & RTL](features/i18n-rtl.md)
- [SSO Authentication](features/sso-auth.md)

### Architecture
Technical architecture and design
- [System Design](architecture/system-design.md)
- [Database Schema](architecture/database-schema.md)
- [Frontend Architecture](architecture/frontend-architecture.md)
- [Backend Architecture](architecture/backend-architecture.md)

### API
API documentation
- [REST API](api/rest-api.md)
- [WebSocket API](api/websocket-api.md)
- [Plugin API](api/plugin-api.md)

### Releases
Release notes and roadmap
- [v2.3.0 Release Notes](releases/v2.3.0.md)
- [v2.4.0 Roadmap](releases/v2.4.0-roadmap.md)
- [Product Roadmap](releases/roadmap.md)

### Operations
Growth, marketing, and community
- [Growth Strategy](operations/growth-strategy.md)
- [Community Management](operations/community-management.md)
- [Marketing](operations/marketing.md)
- [Analytics](operations/analytics.md)

### Testing
Testing strategy and guides
- [Test Strategy](testing/test-strategy.md)
- [E2E Testing](testing/e2e-testing.md)
- [Test Coverage](testing/coverage-report.md)

### Archive
Historical documents
- [v0.x Archive](archive/v0.x/)
- [v1.x Archive](archive/v1.x/)
- [v2.0-v2.2 Archive](archive/v2.0-v2.2/)
```

### Step 7: 更新根目录README（5分钟）

重写 `README.md` 为简洁的项目主页：

```markdown
# 🎮 AgentForge

> Gamified AI Agent Development Platform - Make development fun and productive

[![GitHub Stars](https://img.shields.io/github/stars/xxx/agentforge?style=social)](https://github.com/xxx/agentforge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.3.0-blue)](https://github.com/xxx/agentforge/releases)

[截图展示]

## ✨ Features

- 🎮 **Gamification 2.0** - 105 achievements, daily challenges, leaderboards
- 🌍 **True Internationalization** - RTL support, 3 languages
- 🔐 **Enterprise Ready** - SSO, advanced reporting, smart notifications
- ⚡ **30-Second Onboarding** - From landing to first Agent in 30 seconds
- 💎 **100% Open Source** - MIT License

## 🚀 Quick Start

```bash
# Try web version (fastest)
https://app.agentforge.dev

# Run locally
git clone https://github.com/xxx/agentforge.git
npm install && npm run dev
```

## 📚 Documentation

- [Quick Start Guide](docs/guides/quick-start.md)
- [Full Documentation](docs/README.md)
- [API Reference](docs/api/rest-api.md)
- [Contributing](CONTRIBUTING.md)

## 🎯 Roadmap

- v2.3.0 ✅ - Enterprise & Gamification
- v2.4.0 🚧 - Mobile App, Team Collaboration
- v3.0.0 📅 - AI Optimization, 10+ Languages

[See full roadmap](docs/releases/roadmap.md)

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 License

[MIT License](LICENSE)

## 🌟 Star History

Help us reach 10K stars!

[Star history chart]
```

### Step 8: 清理和提交（5分钟）

```bash
# 删除完全过时的文件
git rm *_DRAFT.md *_TEMP.md *_OLD.md

# 提交所有更改
git add .
git commit -m "refactor: 🧹 项目文件大清理 - 专业化文档结构

重大整理：
- 209个Markdown文件 → 50+个有组织的文档
- 创建docs/目录结构（7个子目录）
- 归档历史版本（v0.x, v1.x, v2.0-v2.2）
- 移动脚本到scripts/目录
- 重写README.md为简洁版
- 创建docs/README.md导航中心

结果：
- 根目录清爽（7个核心文件）
- 文档分类清晰（guides/features/api/etc）
- 历史文档归档（archive/）
- 易于导航和维护

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## ✅ 清理后的效果

### Before（混乱）

```
AgentForge/
├── 209个.md文件散落根目录 ❌
├── 4个.sh脚本混杂 ❌
├── 无清晰组织结构 ❌
├── 大量历史遗留文档 ❌
└── 难以查找和导航 ❌
```

### After（专业）

```
AgentForge/
├── 7个核心文件在根目录 ✅
├── docs/分类清晰的文档 ✅
├── scripts/集中的脚本文件 ✅
├── archive/归档的历史文档 ✅
└── 易于查找和维护 ✅
```

---

## 📊 统计对比

| 指标 | Before | After | 改善 |
|------|--------|-------|------|
| 根目录文件 | 209个.md | 7个核心 | -96% |
| 文档组织 | 无 | 7个分类 | ✅ |
| 历史归档 | 散落 | 统一archive/ | ✅ |
| 查找时间 | >5分钟 | <30秒 | 10x faster |
| 新人体验 | 困惑 | 清晰 | ✅ |
| 专业度 | 业余 | 专业 | ✅ |

---

## ⏱️ 预计时间

**总计**: ~45分钟

- Step 1: 创建目录（2分钟）
- Step 2-5: 移动文件（22分钟）
- Step 6: 创建导航（5分钟）
- Step 7: 更新README（5分钟）
- Step 8: 清理提交（5分钟）
- 缓冲时间（6分钟）

---

## 🚨 注意事项

1. **使用 `git mv` 而不是 `mv`**
   - 保留Git历史记录
   - 避免丢失文件追踪

2. **先测试后执行**
   - 可以先在分支上测试
   - 确认无误后合并到main

3. **更新内部链接**
   - 文件移动后，文档内的链接需要更新
   - 使用正则表达式批量替换

4. **更新CI/CD**
   - 如果CI/CD配置引用文档路径，需要更新

---

**执行者**: Claude Sonnet 4.5
**预计完成**: 2026-03-18（今天）
**优先级**: P0（立即执行）
**收益**: 项目专业化、易维护、用户友好

---

**开始整理！让AgentForge看起来像一个成熟的开源项目！** 🚀
