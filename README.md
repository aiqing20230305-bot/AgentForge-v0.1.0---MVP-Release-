# World of Claudecraft ⚔️🤖

**Build AI Agents with an RPG Loadout System.**

Stop managing Markdown files. World of Claudecraft lets you construct powerful Claude agent configurations using a familiar RPG equipment interface. Drag and drop Roles, Skills, and Behaviors to craft the perfect build.

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
