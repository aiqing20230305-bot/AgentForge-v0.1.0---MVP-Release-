# 🚀 AgentForge 快速开始指南

**5分钟上手AgentForge！**

---

## 📋 目录

1. [环境要求](#环境要求)
2. [安装方式](#安装方式)
3. [第一个Agent](#第一个Agent)
4. [常见问题](#常见问题)

---

## 💻 环境要求

### 最低要求

| 项目 | 要求 |
|------|------|
| **Node.js** | ≥ 18.0.0 |
| **npm** | ≥ 9.0.0 |
| **内存** | ≥ 4GB RAM |
| **磁盘** | ≥ 500MB 可用空间 |

### 推荐环境

| 项目 | 推荐 |
|------|------|
| **Node.js** | 20.10.0+ |
| **包管理器** | pnpm 或 npm |
| **操作系统** | macOS / Windows 10+ / Linux |
| **浏览器** | Chrome / Edge / Firefox 最新版 |

### 检查环境

```bash
# 检查Node.js版本
node --version
# 应该显示 v18.0.0 或更高

# 检查npm版本
npm --version
# 应该显示 9.0.0 或更高
```

---

## 🎯 安装方式

### 方式1: Web版（最快！）

**无需安装，立即体验！**

👉 访问: [https://agentforge.vercel.app](https://agentforge.vercel.app)

✅ 优点：
- 零配置
- 任何设备
- 自动更新

❌ 限制：
- 需要网络
- 功能受限

---

### 方式2: 本地运行（推荐）

**完整功能，离线可用**

#### Step 1: Clone仓库

```bash
git clone https://github.com/aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-
cd AgentForge-v0.1.0---MVP-Release-
```

#### Step 2: 安装依赖

```bash
# 使用npm
npm install

# 或使用pnpm（更快）
pnpm install
```

**预计时间**: 2-3分钟

#### Step 3: 启动应用

```bash
# 启动前端开发服务器
npm run dev
```

浏览器会自动打开 `http://localhost:5173`

🎉 **成功！** 你现在可以使用AgentForge了！

---

### 方式3: 使用后端API

**如果你需要完整的Analytics和认证功能**

#### Step 1: 配置MongoDB

```bash
# 安装MongoDB（macOS）
brew install mongodb-community

# 启动MongoDB
brew services start mongodb-community

# 或手动启动
mongod --dbpath /path/to/data
```

#### Step 2: 配置环境变量

```bash
# 复制环境变量模板
cd backend
cp .env.example .env

# 编辑.env文件
vi .env
```

**必需的配置**:
```bash
# MongoDB连接
MONGODB_URI=mongodb://localhost:27017/agentforge

# JWT密钥（生成随机密钥）
JWT_SECRET=$(openssl rand -hex 32)

# Webhook密钥（可选）
JIRA_WEBHOOK_SECRET=$(openssl rand -hex 32)
```

#### Step 3: 启动后端

```bash
cd backend
npm install
npm run dev
```

后端会在 `http://localhost:5000` 启动

#### Step 4: 启动前端（新终端）

```bash
# 返回根目录
cd ..

# 启动前端
npm run dev
```

---

## 🤖 创建第一个Agent

### Step 1: 进入Dashboard

启动应用后，你会看到主Dashboard界面。

### Step 2: 点击"新建Agent"

在左侧导航栏或Dashboard上找到"新建Agent"按钮。

### Step 3: 选择模板

我们为你准备了10个模板：

| 模板 | 适用场景 |
|------|----------|
| 🤖 **智能客服** | 客户支持 |
| 📝 **内容创作** | 文章、博客 |
| 🔍 **数据分析** | 数据处理 |
| 💼 **任务管理** | 项目管理 |
| 🎨 **创意助手** | 设计、创意 |
| 📊 **报表生成** | 数据报告 |
| 🌐 **翻译助手** | 多语言翻译 |
| 💻 **代码助手** | 编程辅助 |
| 📧 **邮件管理** | 邮件处理 |
| 🎯 **通用助手** | 任何任务 |

**推荐**: 首次使用选择"智能客服"或"通用助手"

### Step 4: 配置Agent

```
┌─────────────────────────────┐
│  创建新Agent                 │
├─────────────────────────────┤
│  名称: [我的第一个Agent]     │
│  模板: [智能客服]            │
│  等级: Lv.1                  │
│  稀有度: 普通                │
└─────────────────────────────┘
       [取消]   [创建]
```

填写：
- **名称**: 给你的Agent起个名字
- **描述**（可选）: 简短描述用途

点击"创建"！

### Step 5: 分配第一个任务

Agent创建后，点击Agent卡片，然后：

1. 点击"**分配任务**"
2. 输入任务描述：
   ```
   回答客户咨询："你们的产品支持哪些平台？"
   ```
3. 点击"**开始执行**"

### Step 6: 观察Agent工作

你会看到：
- ⚡ 实时进度条
- 📊 任务状态更新
- 🎯 完成度百分比
- ⏱️ 预计剩余时间

### Step 7: 查看结果

任务完成后：
- ✅ 查看执行结果
- 📈 查看性能数据
- 🏆 获得经验值
- ⬆️ 可能升级！

---

## 🎮 探索更多功能

### Dashboard

查看系统概览：
- 📊 Analytics图表
- 🤖 Agent性能排行
- 📋 任务完成统计
- 👥 用户活动热力图

访问: `http://localhost:5173/analytics`

### Agent进化

完成任务让Agent升级：
- ⭐ 获得经验值
- 🆙 等级提升
- 🎁 解锁新技能
- 🏆 提升稀有度

### 技能树

为Agent配点：
- 🚀 **速度** - 更快完成任务
- 🎯 **精确度** - 提高成功率
- 💪 **效率** - 降低资源消耗
- 🛡️ **可靠性** - 减少错误

### PVP竞技场

与其他Agent对战（开发中）：
- ⚔️ 回合制战斗
- 🏆 MMR排名
- 🌍 全球排行榜

---

## 🎯 常见任务

### 查看API文档

```bash
# 访问API参考
open docs/API_REFERENCE_v2.4.0.md

# 或在线查看
https://github.com/.../blob/main/docs/API_REFERENCE_v2.4.0.md
```

### 导出Dashboard报表

1. 进入Analytics页面
2. 点击右上角"**导出**"按钮
3. 选择格式：
   - 📄 PDF - 完整报表
   - 📊 CSV - 数据表格
   - 📋 JSON - 原始数据
   - 📧 Email - 邮件分享

### 配置Webhook

编辑 `backend/.env`:

```bash
# Jira Webhook
JIRA_WEBHOOK_SECRET=your_secret_here

# GitHub Webhook
GITHUB_WEBHOOK_SECRET=another_secret_here
```

重启后端服务生效。

---

## ❓ 常见问题

### Q1: 端口被占用怎么办？

**错误**: `Port 5173 is already in use`

**解决**:
```bash
# 查找占用进程
lsof -i :5173

# 杀掉进程
kill -9 <PID>

# 或使用其他端口
npm run dev -- --port 3000
```

---

### Q2: MongoDB连接失败

**错误**: `MongoNetworkError: connect ECONNREFUSED`

**解决**:
```bash
# 检查MongoDB是否运行
pgrep mongo

# 如果没有运行，启动它
brew services start mongodb-community

# 或手动启动
mongod --dbpath /path/to/data
```

---

### Q3: 依赖安装失败

**错误**: `npm ERR! code ELIFECYCLE`

**解决**:
```bash
# 清理缓存
npm cache clean --force

# 删除node_modules
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

---

### Q4: 构建失败

**错误**: 各种TypeScript错误

**解决**:
```bash
# 检查Node版本
node --version  # 应该 ≥ 18

# 检查TypeScript
npx tsc --version

# 重新构建
npm run build
```

---

### Q5: API请求401错误

**错误**: `Unauthorized - Invalid token`

**原因**: 认证Token过期或无效

**解决**:
- Web版：刷新页面重新登录
- 本地版：清除localStorage
  ```javascript
  localStorage.clear()
  location.reload()
  ```

---

### Q6: 热更新不工作

**问题**: 修改代码后页面不刷新

**解决**:
```bash
# 停止开发服务器 (Ctrl+C)

# 清理缓存
rm -rf .vite

# 重启
npm run dev
```

---

### Q7: Electron窗口空白

**问题**: 启动Electron后显示空白

**解决**:
```bash
# 检查是否成功构建
npm run build

# 清理dist目录
rm -rf dist dist-electron

# 重新构建
npm run electron:build
```

---

## 📚 下一步

恭喜！你已经掌握了AgentForge的基础。

### 深入学习

- 📖 [完整用户指南](ANALYTICS_GUIDE.md)
- 🏗️ [架构文档](ARCHITECTURE.md)
- 🧪 [测试指南](TESTING_GUIDE.md)
- 🤝 [贡献指南](../CONTRIBUTING.md)

### 加入社区

- 💬 [Discord社区](https://discord.gg/agentforge)
- 📧 邮件: support@agentforge.io
- 🐛 [报告Bug](https://github.com/.../issues)
- ⭐ [Star on GitHub](https://github.com/.../star)

---

## 💡 提示和技巧

### 性能优化

```bash
# 使用生产模式
npm run build
npm run preview

# 启用缓存
export VITE_CACHE_ENABLED=true

# 减少Bundle大小
npm run analyze
```

### 开发技巧

```bash
# 只监听特定文件
npm run dev -- --watch src/

# 启用调试模式
DEBUG=* npm run dev

# 快速重启
npm run dev:fast
```

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Cmd+K` | 快速搜索 |
| `Cmd+N` | 新建Agent |
| `Cmd+/` | 命令面板 |
| `?` | 显示帮助 |

---

## 🎉 祝你玩得开心！

AgentForge让AI Agent开发变得简单有趣。

有问题？随时联系我们！

---

**更新日期**: 2026-03-20
**版本**: v2.4.0
**维护者**: AgentForge Team
