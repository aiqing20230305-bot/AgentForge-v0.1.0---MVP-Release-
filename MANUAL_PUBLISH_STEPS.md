# 🖱️ AgentForge - 网页手动发布（最简单）

## 📋 您已登录 GitHub，只需 3 个页面操作！

---

## 步骤 1️⃣：推送代码（2 分钟）

### 方法 A：使用 GitHub 网页上传

1. **访问仓库：** https://github.com/Summonair/world-of-claudecraft

2. **点击"Upload files"按钮**（在 Add file 下拉菜单中）

3. **拖拽整个项目文件夹** 或点击"choose your files"选择

4. **提交信息：**
   ```
   AgentForge v0.1.0 MVP Release
   ```

5. **点击"Commit changes"**

**⚠️ 这个方法会覆盖远程文件，适合首次发布**

---

### 方法 B：使用本地 Git（如果您配置了认证）

在终端执行：

```bash
cd ~/Downloads/world-of-claudecraft

# 如果之前设置了密码/SSH key，直接推送
git push origin main
```

**如果提示输入密码：** 使用 Personal Access Token（不是 GitHub 密码）

---

## 步骤 2️⃣：创建标签（1 分钟）

1. **访问：** https://github.com/Summonair/world-of-claudecraft/releases/new

2. **点击"Choose a tag"下拉框**

3. **输入：** `v0.1.0`

4. **点击"Create new tag: v0.1.0 on publish"**

---

## 步骤 3️⃣：创建 Release（2 分钟）

**在同一个页面继续填写：**

### Release 标题
```
AgentForge v0.1.0 - MVP Release 🎉
```

### 描述（复制以下全部内容）

```markdown
# AgentForge v0.1.0 - MVP Release 🎉

> **Forge your AI agents like legendary heroes** | 像锻造传奇英雄一样打造你的 AI Agent

---

## 🌟 What is AgentForge?

AgentForge (formerly World of Claudecraft) is a visual RPG-style builder for Claude AI agents. Equip your agents with skills, behaviors, and constraints like assembling legendary heroes. Manage tasks, track progress, and auto-discover local OpenClaw instances - all in a sleek cyberpunk interface.

**No config needed** - Start with 8 demo agents and 35 sample tasks out of the box!

---

## ✨ Highlights

### 🎮 RPG Equipment System
- Drag & drop components into equipment slots
- Visual token budget tracking
- Rarity-based coloring
- Save and load different loadouts

### 👥 Agent Management
- **8 Built-in Demo Agents** (ATLAS, CLIP, ORACLE, SENTINEL, NEXUS, ECHO, NOVA, AEGIS)
- Visual agent selection with avatars
- Real-time status indicators (🟡 Demo Mode / 🟢 Connected)
- Agent statistics dashboard

### 📋 Task Management
- **35 Pre-configured Sample Tasks**
- Task assignment by agent
- Status tracking (pending → in_progress → completed)
- Priority levels and time-based filtering

### 🔍 Auto-Discovery
- Automatic detection of local OpenClaw configurations
- Port scanning and agent directory scanning
- Connection validation with visual feedback

### 🎨 Modern UI/UX
- Cyberpunk-inspired design
- Smooth animations and transitions
- Helpful empty state guidance

---

## 🚀 Quick Start

```bash
git clone https://github.com/Summonair/agentforge.git
cd agentforge
npm install
npm run electron:dev
```

**That's it!** You'll see 8 demo agents and 35 tasks immediately.

---

## 📖 Documentation

- [README](README.md) - Complete guide
- [README (中文)](README.zh-CN.md) - Chinese version
- [TROUBLESHOOTING](TROUBLESHOOTING.md) - Diagnostic guide
- [CONTRIBUTING](CONTRIBUTING.md) - How to contribute

---

## 🐛 Bug Fixes

- Fixed empty task list (Agent ID standardization)
- Fixed auto-discovery file system access
- Fixed OpenClaw connection (authToken + port)
- Enhanced UX with status indicators and better error messages

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

**Start forging your AI dream team today!** 🚀
像锻造传奇英雄一样打造你的 AI Agent！⚔️
```

### 最后：

4. **点击"Publish release"按钮（绿色大按钮）**

---

## ✅ 完成！

发布后访问：https://github.com/Summonair/world-of-claudecraft

应该看到：
- ✅ 代码已更新
- ✅ v0.1.0 标签出现
- ✅ Release 页面显示发布

---

## 🎁 额外优化（可选，2 分钟）

### 更新仓库名称

1. **Settings** → **General** → **Repository name**
2. 改为：`agentforge`
3. 点击"Rename"

### 更新描述

在仓库首页，点击齿轮图标编辑：

**Description:**
```
⚔️ Forge your AI agents like legendary heroes - RPG-style builder for Claude agents | AI Agent 可视化构建工具
```

**Website:** 留空

**Topics:** `ai-agents`, `claude`, `rpg`, `task-management`, `electron`, `typescript`

---

**总计 5-7 分钟，AgentForge 就正式开源了！** 🎊
