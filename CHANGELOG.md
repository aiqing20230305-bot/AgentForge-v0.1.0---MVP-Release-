# Changelog

All notable changes to World of Claudecraft will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-14

### Added
- 🎮 **RPG-style Agent Management Interface**
  - Visual equipment system for building Claude agent configurations
  - Drag & drop support for agent components
  - Token budget tracking with rarity-based coloring

- 👥 **Multi-Agent Management**
  - 8 built-in demo agents (ATLAS, CLIP, ORACLE, SENTINEL, NEXUS, ECHO, NOVA, AEGIS)
  - Agent selection with visual avatars
  - Real-time agent status display
  - Connection status indicator (Demo Mode / OpenClaw Connected)

- 📋 **Task Management System**
  - 35 pre-configured sample tasks
  - Task assignment by agent
  - Status tracking (pending, in_progress, completed)
  - Priority levels (low, medium, high, urgent)
  - Time-based filtering (today, week, month, all)
  - Task statistics dashboard

- 🔍 **Auto-Discovery Feature**
  - Automatic scanning for local OpenClaw instances
  - Port scanning (18789, 3000, 8080, 8888, 5000)
  - Configuration file detection (~/.openclaw/openclaw.json)
  - Local agent directory scanning (~/.openclaw/agents/)
  - Claude agent detection (~/.claude/agents/)
  - Connection validation with visual feedback

- 💬 **Agent Chat Interface**
  - Direct messaging with agents
  - Message history
  - Agent response display

- 🎨 **Modern UI/UX**
  - Cyberpunk-inspired design
  - Smooth animations and transitions
  - Responsive layout
  - Empty state guidance with actionable buttons

- 📦 **Export & Integration**
  - Export to ~/.claude/agents/ directory
  - Export to clipboard
  - Save custom loadouts
  - Multi-loadout support

- 📖 **Comprehensive Documentation**
  - Quick start guide (README.md)
  - Detailed troubleshooting guide (TROUBLESHOOTING.md)
  - Setup verification script
  - Development status tracking

### Fixed
- 🐛 **Agent ID Standardization**
  - Fixed inconsistent Agent ID formats causing task list to be empty
  - Unified ID format from `local_agent_*` / `openclaw_*` to simple lowercase (`atlas`, `clip`, etc.)
  - Fixed task filtering to correctly match agent IDs
  - Updated 11 locations across codebase

- 🔧 **Auto-Discovery Improvements**
  - Fixed file system access using Electron API instead of browser fetch
  - Corrected authToken reading path (gateway.auth.token)
  - Updated default port from 18790 to 18789
  - Improved validation logic for OpenClaw Gateway

- 🎨 **UI/UX Fixes**
  - Fixed empty state messaging
  - Added helpful guidance when no tasks are present
  - Added create task button in empty state
  - Improved agent selection visual feedback

- 🔍 **Debug & Diagnostics**
  - Added comprehensive console logging with prefixes
  - Added agent loading diagnostics
  - Added task filtering metrics
  - Made troubleshooting easier for users

### Changed
- 🔄 **Improved Agent Selection Logic**
  - Changed from `agent.name.toLowerCase()` to `agent.id`
  - Ensures consistency across all components
  - More reliable task filtering

- 📊 **Enhanced Status Indicators**
  - Added connection mode detection
  - Visual differentiation between demo and live modes
  - Agent count display

### Technical
- **Dependencies:** Electron, React 18, TypeScript, Vite, Zustand, TailwindCSS
- **Supported Platforms:** macOS, Windows, Linux
- **Node.js Requirement:** >= 16.0.0
- **Browser Support:** Chrome/Edge >= 90, Safari >= 14, Firefox >= 88

### Documentation
- README.md - Getting started guide with out-of-the-box experience
- TROUBLESHOOTING.md - Complete diagnostic guide with console log interpretation
- IMPLEMENTATION_SUMMARY.md - Technical implementation details
- DEVELOPMENT_STATUS.md - Current development status
- RELEASE_CHECKLIST.md - 82-item pre-release checklist
- NEXT_STEPS.md - Future development roadmap

### Development
- setup verification script (scripts/verify-setup.js)
- Automated test suite (scripts/test-suite.sh)
- GitHub Actions CI/CD configuration
- Log cleanup automation

---

## [Unreleased]

### Planned Features
- Unit tests (target 70% coverage)
- TypeScript strict mode
- ESLint configuration
- Performance optimizations
- Multi-language support (i18n)
- Advanced task scheduling
- Batch operations
- Agent performance monitoring

---

**Full Changelog:** https://github.com/Summonair/world-of-claudecraft/compare/v0.0.0...v0.1.0
