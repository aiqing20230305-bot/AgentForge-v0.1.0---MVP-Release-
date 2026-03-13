# AgentForge ⚔️

<div align="center">

**Forge your AI agents like legendary heroes**

像锻造传奇英雄一样打造你的 AI Agent

---

🎮 **RPG Equipment System** · 📋 **Task Management** · 🔍 **Auto-Discovery** · 🎨 **Cyberpunk UI**

[English](#english) | [中文](#中文)

</div>

---

## English

AgentForge is a visual RPG-style builder for Claude AI agents. Equip your agents with skills, behaviors, and constraints like assembling legendary heroes. Manage tasks, track progress, and auto-discover local OpenClaw instances - all in a sleek cyberpunk interface.

**No config needed** - Start with 8 demo agents and 35 sample tasks out of the box!

---

## 中文

AgentForge 是面向 Claude AI Agent 的 RPG 风格可视化构建工具。像组装传奇英雄一样为 Agent 装备技能、行为和约束。管理任务、追踪进度、自动发现本地 OpenClaw 实例——一切都在赛博朋克风格的界面中完成。

**开箱即用** - 内置 8 个示例 Agent 和 35 个示例任务！

![World of Claudecraft](main.png)

## ✨ Features

- **🛡️ Visual Equipment UI**: WoW-inspired character equipment interface
- **🐉 Drag & Drop**: Drag items from inventory to equipment slots
- **💰 Token Budget**: Track token usage with build-wide budget limits and rarity colors based on token count
- **📜 Category System**: Items categorized as roles, skills, behaviors, etc.
- **💾 Loadouts**: Save and load different equipment configurations
- **🚀 Export**: Save directly to `~/.claude/agents/your-agent-name.md` or clipboard
- **👥 Agent Management**: View and manage multiple AI agents with task tracking
- **📋 Task System**: Assign and monitor tasks for each agent with status tracking
- **🔌 OpenClaw Integration**: Optional connection to live agent systems (falls back to demo mode)
- **🎯 Out-of-the-Box**: Works immediately with 8 demo agents and 35 sample tasks

## 🎮 Getting Started

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

**🎉 First Launch Experience:**
- No configuration required! The app starts with:
  - **8 demo agents** (ATLAS, CLIP, ORACLE, SENTINEL, NEXUS, ECHO, NOVA, AEGIS)
  - **35 sample tasks** across different agents
  - Full agent and task management interface
- Status indicator shows **🟡 Demo Mode** (or **🟢 OpenClaw Connected** if connected)

### 📂 Using Sample items
To play with our samples:
1. Click the **Gear Icon** (Settings) in the UI.
2. Select the `sample-components` directory.
3. The inventory will populate with the sample items.

### 👥 Agent & Task Management
- Click on any agent avatar to view their details and assigned tasks
- Use the task management panel to:
  - View tasks filtered by agent
  - Change task status (pending → in progress → completed)
  - Create new tasks for agents
  - Track completion statistics

## ⚔️ Slot Configuration

Each slot represents a different aspect of your agent's personality and capabilities:

| Slot | Category | Description |
|------|----------|-------------|
| **HEAD** | `roles` | Primary role & persona |
| **CHEST** | `behaviors` | Core behavioral patterns |
| **HANDS** | `skills` | Abilities & specific skills |
| **LEGS** | `constraints` | Rules & operational boundaries |
| **FEET** | `formats` | Output formatting rules |
| **RINGS** | `personalities`/`contexts` | Communication style & Context |
| **OFFHAND** | `tools` | Tool integrations (MCP, scripts) |


## 📤 Exporting Agents

1. **Initiate Export**: Click the **Export** button in the preview panel and select "Save to Claude".
   
   ![Export Menu](image-1.png)

2. **Name Your Agent**: Enter a unique name for your agent configuration.
   
   ![Agent Naming Modal](image-2.png)

3. **Activate in Claude**: Execute the `/agent` command in Claude to see and use your new agent.
   
   ![Claude Agent Integration](image-3.png)


## 🛠️ Tech Stack

- **Electron** & **React 18**
- **TypeScript** & **Vite**
- **Tailwind CSS** for styling
- **Zustand** for state management
- **react-dnd** for drag-and-drop interactions
