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
- Task creation and editing

### 🔍 Auto-Discovery
- Automatic detection of local OpenClaw configurations
- Port scanning (18789, 3000, 8080, etc.)
- Agent directory scanning (~/.openclaw/agents/, ~/.claude/agents/)
- Connection validation with visual feedback

### 🎨 Modern UI/UX
- Cyberpunk-inspired design
- Smooth animations and transitions
- Responsive layout
- Helpful empty state guidance

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Summonair/agentforge.git
cd agentforge

# Install dependencies
npm install

# Start the application
npm run electron:dev

# OR start web version
npm run dev
```

**That's it!** You'll immediately see:
- 8 demo agents in the agent switcher
- Status indicator showing 🟡 Demo Mode
- Click ATLAS → see 4 tasks
- Click CLIP → see 5 tasks

---

## 📖 Documentation

- **[README](README.md)** - Complete getting started guide
- **[README (中文)](README.zh-CN.md)** - 中文版本
- **[TROUBLESHOOTING](TROUBLESHOOTING.md)** - Diagnostic guide with console log interpretation
- **[CONTRIBUTING](CONTRIBUTING.md)** - How to contribute
- **[CHANGELOG](CHANGELOG.md)** - Version history

---

## 🐛 Bug Fixes in v0.1.0

### Critical Fixes
- **Fixed empty task list issue** - Standardized Agent ID format (11 code changes)
- **Fixed auto-discovery** - Switched from browser fetch to Electron API
- **Fixed authToken reading** - Corrected path from `gateway.authToken` to `gateway.auth.token`
- **Fixed default port** - Updated from 18790 to 18789

### UX Improvements
- Added connection status indicator
- Enhanced empty state messaging
- Improved error logging with prefixes
- Better visual feedback

---

## 🛠️ Technical Details

### Built With
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Desktop**: Electron
- **State**: Zustand
- **DnD**: react-dnd
- **Build**: Vite

### Requirements
- Node.js >= 16.0.0
- npm >= 8.0.0

### Supported Platforms
- macOS (tested)
- Windows (should work)
- Linux (should work)

---

## 📊 Project Stats

- **363 files changed**
- **31,761 lines added**
- **61 TypeScript/React components**
- **1,200+ lines of documentation**
- **12 utility scripts**

---

## 🎯 What's Next?

### Short-term (1-2 weeks)
- Fix TypeScript type errors
- Add ESLint configuration
- Unit tests (target 50% coverage)

### Mid-term (1 month)
- E2E tests for critical paths
- API documentation
- Architecture guide
- Video tutorials

### Long-term
- Multi-datasource support
- Task scheduling system
- Performance monitoring
- Internationalization (i18n)

See [NEXT_STEPS.md](NEXT_STEPS.md) for the complete roadmap.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on:
- Development setup
- Code style guidelines
- Commit conventions
- Pull request process

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Claude AI** - Powerful AI capabilities
- **OpenClaw** - Agent orchestration framework
- **All contributors and users** - Thank you for your support!

---

## 📞 Support

- **Issues**: https://github.com/Summonair/agentforge/issues
- **Discussions**: https://github.com/Summonair/agentforge/discussions

---

## 🎊 Release Notes

This is the first public release of AgentForge (v0.1.0 MVP). While we've fixed critical bugs and tested core functionality, some features are still in development:

⚠️ **Known Limitations:**
- TypeScript compilation warnings (30 type issues - does not affect runtime)
- No automated tests yet (manual testing passed)
- Electron packaging incomplete (use `npm run electron:dev`)

✅ **What Works:**
- All core features (Agent management, Task system, Auto-discovery)
- Electron and Web versions
- Documentation and troubleshooting guides
- Demo mode with 8 agents and 35 tasks

---

**Start forging your AI dream team today!** 🚀

像锻造传奇英雄一样打造你的 AI Agent！⚔️
