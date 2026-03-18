# ⚡ AgentForge Quick Start Guide

**Get started in 5 minutes!**

---

## 🚀 Installation

### Option 1: npm (Recommended for Development)

```bash
# Clone the repository
git clone https://github.com/aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-.git
cd AgentForge-v0.1.0---MVP-Release-

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

---

### Option 2: Docker (Recommended for Production)

```bash
# Pull the image
docker pull agentforge/agentforge:latest

# Run the container
docker run -p 5173:5173 agentforge/agentforge:latest
```

Open http://localhost:5173 in your browser.

---

### Option 3: Desktop App (Easiest)

Download for your platform:
- **macOS**: [Download DMG](link) (Intel & Apple Silicon)
- **Windows**: [Download Installer](link) (x64 & x86)
- **Linux**: [Download AppImage](link) or [DEB](link) or [RPM](link)

Double-click to install and launch.

---

## 🎯 First Steps

### 1. Welcome Tour (2 minutes)

On first launch, you'll see an interactive onboarding tour:

✅ **Step 1**: Overview of the dashboard
✅ **Step 2**: Creating your first agent
✅ **Step 3**: Connecting data sources
✅ **Step 4**: Task management basics
✅ **Step 5**: Quick tips & shortcuts

**Tip**: You can restart the tour anytime from Help → Start Tour

---

### 2. Create Your First Agent (1 minute)

**Quick Create**:
1. Click the **"+ New Agent"** button (or press `Cmd+N` / `Ctrl+N`)
2. Enter basic info:
   - **Name**: e.g., "My First Agent"
   - **Role**: e.g., "Data Analyst"
   - **Avatar**: Choose or upload
3. Click **"Create Agent"**

That's it! Your agent is now live with default settings.

**Advanced Setup** (optional):
- Set skills and capabilities
- Configure behavior patterns
- Add constraints and rules
- Customize personality

---

### 3. Monitor Agent Health (30 seconds)

Your agent starts with a **heartbeat monitor**:

**Vitality Score** (0-100):
- 🟢 **80-100**: Healthy - All systems go
- 🟡 **50-79**: Warning - Minor issues
- 🟠 **20-49**: Critical - Needs attention
- 🔴 **0-19**: Offline - Action required

**View Details**:
- Click on agent card
- See real-time vitality gauge
- Check heartbeat chart
- Review health recommendations

---

### 4. Create a Task (30 seconds)

**Quick Task**:
1. Press `Cmd+T` / `Ctrl+T` (or click "+ New Task")
2. Enter task details:
   - **Title**: What needs to be done
   - **Agent**: Assign to your agent
   - **Priority**: High/Medium/Low
3. Click **"Create"**

Your agent will automatically start working on it!

**Task Status**:
- ⏳ **Pending**: Waiting to start
- 🔄 **In Progress**: Agent working
- ✅ **Completed**: Successfully done
- ❌ **Failed**: Error occurred (auto-retry)

---

### 5. Watch Evolution Happen (Live)

AgentForge agents **automatically evolve**:

**Evolution Triggers**:
- Complete 10 tasks → **Productivity Boost**
- Low error rate → **Quality Achiever**
- Fast responses → **Speed Demon**
- And 17 more rules...

**How to See**:
1. Click agent card
2. Go to **Evolution** tab
3. View evolution timeline
4. See applied improvements

**Rarity Levels**:
- ⚪ Common (Base improvements)
- 🟢 Uncommon (Good performance)
- 🔵 Rare (Excellent performance)
- 🟣 Epic (Outstanding performance)
- 🟠 Legendary (Game-changing achievements)

---

## 🎮 Key Features

### RPG Progression

**Level System**:
- Start at Level 1
- Gain XP from completed tasks
- Level up for rewards
- Unlock new skills

**Skill Tree**:
- 5 branches: Combat, Knowledge, Speed, Efficiency, Social
- 30+ skills to unlock
- Real effects on performance
- Strategic planning required

**Achievements**:
- 50+ achievements to earn
- Track progress in Achievement panel
- Share on social media
- Collect badges

---

### Privacy Controls

**Data Sources** (User-Authorized Only):

1. **Local Storage** (Default):
   - 100% offline capable
   - No external connections
   - Your data stays local

2. **OpenClaw** (Optional):
   - Manual URL input required
   - Test connection first
   - Revoke anytime

3. **Custom APIs** (Optional):
   - Provide API key
   - Configure endpoints
   - Full control

**No Auto-Scanning**: AgentForge NEVER connects to services without your explicit authorization.

---

### Real-Time Features

**Heartbeat Monitoring**:
- 30-second intervals
- 6 vitality factors tracked
- Automatic warnings
- Predictive alerts

**Live Updates**:
- WebSocket connection
- Real-time sync
- Instant notifications
- No page refresh needed

**Performance**:
- 60fps UI updates
- 1000+ agents supported
- Virtual scrolling
- Optimized rendering

---

## ⌨️ Essential Shortcuts

**Universal**:
- `Cmd+K` / `Ctrl+K` - Global search
- `Cmd+/` / `Ctrl+/` - Keyboard shortcuts help
- `Esc` - Close modal/drawer

**Agent Management**:
- `Cmd+N` / `Ctrl+N` - New agent
- `Cmd+E` / `Ctrl+E` - Edit agent
- `Cmd+D` / `Ctrl+D` - Delete agent

**Task Management**:
- `Cmd+T` / `Ctrl+T` - New task
- `Cmd+F` / `Ctrl+F` - Search tasks
- `Cmd+R` / `Ctrl+R` - Refresh tasks

**Settings**:
- `Cmd+,` / `Ctrl+,` - Open settings
- `Cmd+S` / `Ctrl+S` - Save settings

**View full list**: Press `Cmd+/` or `Ctrl+/`

---

## 🎨 Customization

### Theme Selection

**Built-in Themes**:
1. **Light** - Clean, professional
2. **Dark** - Easy on eyes
3. **Auto** - Follow system

**Change Theme**:
- Click theme toggle (top-right)
- Or go to Settings → Appearance

**Custom Themes** (Pro):
- Create your own
- 7-color editor
- Import/export
- Share with community

---

### Language Selection

**Supported Languages**:
- 🇺🇸 English
- 🇨🇳 简体中文
- 🇯🇵 日本語
- 🇰🇷 한국어

**Change Language**:
1. Settings → Language
2. Select from dropdown
3. UI updates instantly

**Contribute Translations**:
- Add new languages
- Improve existing
- See Contributing Guide

---

### Notifications

**Desktop Notifications** (Electron):
- Native OS notifications
- macOS, Windows, Linux
- Sound effects (3 types)
- Volume control

**Browser Notifications** (Web):
- Web Notification API
- Permission required
- Click to open app

**Notification Center**:
- History of all notifications
- Filter by type
- Mark as read
- Clear all

---

## 🔧 Advanced Features

### Predictive Analytics

**Forecast Agent Health**:
1. Open agent details
2. Go to Predictions tab
3. See 1h/6h/24h forecasts
4. View confidence levels

**Use Cases**:
- Prevent downtime
- Plan maintenance
- Optimize workload
- Resource allocation

---

### Team Collaboration (Pro)

**Create Team**:
1. Settings → Teams
2. Click "Create Team"
3. Invite members
4. Assign roles

**Roles**:
- **Admin**: Full control
- **Member**: Create/edit agents
- **Viewer**: Read-only access

---

### Integrations (Enterprise)

**Available Integrations**:
- Jira (bidirectional sync)
- GitHub (issues, PRs)
- Slack (notifications)
- Discord (bot commands)
- Zapier (1000+ apps)
- Webhooks (custom)

**Setup**: Settings → Integrations

---

### Workflow Automation (Enterprise)

**Build Workflows**:
1. Settings → Workflows
2. Click "New Workflow"
3. Drag nodes (16 types)
4. Connect logic
5. Test & deploy

**Node Types**:
- Trigger nodes
- Action nodes
- Condition nodes
- Loop nodes
- And more...

---

## 🆘 Troubleshooting

### Agent Not Responding?

**Check**:
1. ✅ Heartbeat active? (should show pulse)
2. ✅ Tasks assigned? (needs work to do)
3. ✅ Data source connected? (if using external)
4. ✅ No errors in console? (F12 → Console)

**Fix**:
- Restart heartbeat manually
- Check connection status
- Review error logs
- Contact support

---

### Performance Issues?

**Quick Fixes**:
1. **Enable Performance Mode**:
   - Settings → Performance
   - Toggle "High Performance Mode"

2. **Reduce Animations**:
   - Settings → Accessibility
   - Toggle "Reduce Motion"

3. **Clear Cache**:
   - Settings → Advanced
   - Click "Clear Cache"

4. **Limit Agents Displayed**:
   - Use filters
   - Archive inactive agents

---

### Data Not Syncing?

**Cloud Sync Issues**:
1. Check internet connection
2. Verify sync enabled: Settings → Cloud Sync
3. Check offline queue: View pending items
4. Force sync: Click "Sync Now"

**Local-First**:
- Core features work offline
- Sync happens when online
- No data loss

---

### Can't Install Desktop App?

**macOS**:
- Error: "App can't be opened"
- Fix: System Settings → Privacy & Security → Open Anyway

**Windows**:
- Error: "Windows protected your PC"
- Fix: Click "More info" → "Run anyway"

**Linux**:
- Make executable: `chmod +x AgentForge.AppImage`
- Run: `./AgentForge.AppImage`

---

## 📚 Next Steps

### Learn More

**Documentation**:
- [Full Documentation](link)
- [API Reference](link)
- [Plugin Development](link)
- [Contributing Guide](link)

**Tutorials**:
- [Video Tutorials](link)
- [Step-by-Step Guides](link)
- [Best Practices](link)

**Community**:
- [Discord Server](link) - Live chat & support
- [GitHub Discussions](link) - Q&A & ideas
- [Twitter](link) - Updates & announcements

---

### Get Involved

**Contribute**:
- Report bugs: [GitHub Issues](link)
- Request features: [Discussions](link)
- Submit PRs: [Contributing Guide](link)
- Translate: [i18n Guide](link)

**Perks**:
- Free Pro license
- Contributor badge
- Featured in docs
- Exclusive swag

---

### Upgrade to Pro

**Pro Features**:
- ♾️ Unlimited agents
- ♾️ Unlimited tasks
- 🎨 Custom themes
- 🤖 AI recommendations
- 👥 Team collaboration
- 📊 Advanced analytics
- ⚡ Priority support
- 🎁 Early access

**Pricing**:
- **Monthly**: $9.99/month
- **Annual**: $99/year (2 months free)
- **Enterprise**: Custom pricing

**Try Free**: 14-day trial, no credit card

[Upgrade Now](link)

---

## 💬 Get Help

### Support Channels

**Community** (Free):
- [Discord](link) - Live chat
- [GitHub Discussions](link) - Q&A
- [Twitter](link) - Quick questions

**Email** (All users):
- support@agentforge.io
- Response: 24-48 hours

**Priority** (Pro/Enterprise):
- priority@agentforge.io
- Response: 2-4 hours
- Video call support

---

### FAQ

**Q: Is AgentForge free?**
A: Yes! Core features are 100% free and open source. Pro version available for advanced needs.

**Q: Can I self-host?**
A: Absolutely! Full self-hosting support with Docker, npm, or desktop app.

**Q: Does it work offline?**
A: Yes! Core features work 100% offline. Cloud sync is optional.

**Q: What about privacy?**
A: AgentForge NEVER auto-scans services. Every connection requires explicit authorization.

**Q: Can I migrate from other tools?**
A: Yes! Import from CSV, JSON, or API. Migration guides available.

**Q: Is my data safe?**
A: Data stays local by default. Cloud sync uses encryption. Full control is yours.

**Q: Can I contribute?**
A: Yes! We welcome contributions. Check our Contributing Guide.

**Q: How do I upgrade to Pro?**
A: Settings → Subscription → Choose Plan. 14-day trial available.

---

## 🎉 You're All Set!

Congratulations! You're ready to forge amazing AI agents.

**Quick Recap**:
1. ✅ Agent created
2. ✅ Heartbeat monitoring active
3. ✅ Task assigned
4. ✅ Evolution enabled
5. ✅ Ready to scale!

**What's Next**:
- Create more agents
- Build agent teams
- Unlock achievements
- Join community
- Share your work!

**Welcome to AgentForge!** ⚔️

---

**Need Help?**
- 💬 [Join Discord](link)
- 📖 [Read Full Docs](link)
- 🐛 [Report Issues](link)
- 💡 [Request Features](link)

**Happy Forging!** 🚀
