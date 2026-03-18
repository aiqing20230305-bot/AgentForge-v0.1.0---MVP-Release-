# World of Claudecraft - Troubleshooting Guide

This guide helps you diagnose and fix common issues with World of Claudecraft.

## 🔍 Quick Diagnostics

Before diving into specific issues, check these basics:

1. **Check Browser Console**: Press `F12` or `Cmd+Option+I` to open developer tools
2. **Look for `[AgentLoader]` and `[TaskPanel]` logs**: These show what's happening
3. **Check Connection Status**: Top-left corner shows **🟡 Demo Mode** or **🟢 OpenClaw Connected**

---

## ❌ Common Issues

### 1. Task List is Empty

**Symptoms:**
- Agent panel shows agents correctly
- Task management panel shows "该 Agent 暂无任务" or empty list
- Agent statistics show 0 tasks

**Root Causes:**
- Agent ID format mismatch between agents and tasks
- Tasks not loaded from store
- Agent selection not triggering properly

**Solutions:**

**Step 1: Check Console Logs**
Open browser console and look for these logs:
```
[AgentLoader] Using mock data (8 default agents)
[AgentDisplay] Loaded agents: atlas (ATLAS), clip (CLIP), ...
[AgentDisplay] Selected agent: atlas → ATLAS
[TaskPanel] Selected agent: atlas
[TaskPanel] Total tasks in store: 35
[TaskPanel] Filtered tasks: 4
[TaskPanel] First 3 task agentIds: ["atlas", "atlas", "atlas"]
```

**Step 2: Verify Agent IDs**
- Agent IDs should be simple lowercase: `atlas`, `clip`, `oracle`, etc.
- If you see `local_agent_atlas` or `openclaw_atlas`, the fix didn't apply correctly
- Check `src/utils/openclawLoader.ts` lines 155-309

**Step 3: Verify Task Data**
- Check `src/stores/taskStore.ts` SAMPLE_TASKS
- Task `agentId` fields should match agent IDs: `"atlas"`, `"clip"`, etc.

**Step 4: Clear Cache**
```bash
# Clear browser storage
localStorage.clear()
sessionStorage.clear()
# Refresh the page
```

---

### 2. OpenClaw Connection Fails

**Symptoms:**
- Status shows **🟡 Demo Mode** when you expect **🟢 OpenClaw Connected**
- Console shows: `[AgentLoader] Using mock data (8 default agents)`

**Root Causes:**
- OpenClaw service not running
- Data source not configured
- Network connectivity issues

**Solutions:**

**Step 1: Check if OpenClaw is Running**
```bash
# Check if the OpenClaw service is accessible
curl http://localhost:3000/api/agents
# Should return JSON with agent data
```

**Step 2: Verify Data Source Configuration**
1. Open Settings in the UI (gear icon)
2. Go to "Data Sources" tab
3. Check if OpenClaw source is added and enabled
4. Test connection using the "Test" button

**Step 3: Check Console for Errors**
Look for:
```
从数据源管理器加载失败: <error message>
从 OpenClaw Gateway 加载失败: <error message>
```

**Step 4: Start OpenClaw Bridge (if using)**
```bash
cd scripts
node openclaw-bridge.js
# Should show: OpenClaw Gateway running on port 3000
```

---

### 3. Agent Selection Not Working

**Symptoms:**
- Clicking agent avatars doesn't update task list
- Selected agent doesn't highlight properly

**Solutions:**

**Step 1: Check Console on Click**
Click an agent and look for:
```
[AgentDisplay] Selected agent: <agent-id> → <AGENT-NAME>
[TaskPanel] Selected agent: <agent-id>
```

**Step 2: Verify AgentDisplayPanel.tsx**
- Line 20: Should use `data[0].id` not `data[0].name.toLowerCase()`
- Line 28: Should use `agent.id` not `agent.name.toLowerCase()`

---

### 4. Application Won't Start

**Symptoms:**
- `npm run dev` fails
- Blank screen on launch
- Build errors

**Solutions:**

**Step 1: Check Node.js Version**
```bash
node --version
# Should be v16 or higher
```

**Step 2: Reinstall Dependencies**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Step 3: Check Port Availability**
```bash
# Default is 5173
lsof -i :5173
# Kill process if needed
kill -9 <PID>
```

**Step 4: Try Clean Build**
```bash
npm run clean  # if available
npm run dev
```

---

## 🐛 Interpreting Console Logs

### Agent Loading Logs

```
[AgentLoader] Starting agent load...
```
→ Agent loading process initiated

```
[AgentLoader] Loaded X agents from data sources
```
→ Successfully loaded from configured data sources (OpenClaw/custom)

```
[AgentLoader] Gateway returned X agents
```
→ Successfully loaded from legacy OpenClaw Gateway

```
[AgentLoader] Using mock data (8 default agents)
```
→ Fallback to demo mode (8 built-in agents)

### Agent Display Logs

```
[AgentDisplay] Loaded agents: atlas (ATLAS), clip (CLIP), ...
```
→ Lists all loaded agents with their ID and name

```
[AgentDisplay] Selected agent: atlas → ATLAS
```
→ Shows which agent was just selected

### Task Panel Logs

```
[TaskPanel] Selected agent: atlas
```
→ Current agent filter for tasks

```
[TaskPanel] Total tasks in store: 35
```
→ Total tasks available (before filtering)

```
[TaskPanel] Filtered tasks: 4
```
→ Tasks matching current agent + filters

```
[TaskPanel] First 3 task agentIds: ["atlas", "atlas", "clip"]
```
→ Shows agentId of first few tasks (helps debug mismatches)

---

## 📋 Common Questions (FAQ)

### Q: Why do I see 8 agents but they all show 0 tasks?

**A:** Agent ID mismatch. Check console logs for `[TaskPanel] First 3 task agentIds`. If they don't match agent IDs from `[AgentDisplay] Loaded agents`, there's a format inconsistency.

### Q: How do I know if I'm using demo mode or real OpenClaw?

**A:** Look at the top-left status indicator:
- **🟡 Demo Mode** = Using built-in sample data
- **🟢 OpenClaw Connected** = Connected to live agent system

### Q: Can I add my own agents to demo mode?

**A:** Yes! Edit `src/utils/openclawLoader.ts` function `getDefaultAgents()` and add your agent object following the same format.

### Q: Tasks aren't updating when I change status

**A:** Check that the task store is persisting changes:
1. Open browser DevTools
2. Go to Application → Local Storage
3. Look for task-related keys
4. Try clearing localStorage and reloading

### Q: Where is the task data stored?

**A:**
- Demo mode: `src/stores/taskStore.ts` SAMPLE_TASKS array
- Real mode: Fetched from OpenClaw API or custom data source

---

## 🔧 Advanced Debugging

### Enable Verbose Logging

Add to `src/main.tsx`:
```typescript
// Add at the top
window.DEBUG = true
```

### Inspect State

Open console and run:
```javascript
// Check agent store
console.log(useTaskStore.getState())

// Check specific agent tasks
console.log(useTaskStore.getState().tasks.filter(t => t.agentId === 'atlas'))
```

### Force Demo Mode

Edit `src/utils/openclawLoader.ts`:
```typescript
export async function loadOpenClawAgents(): Promise<OpenClawAgent[]> {
  // Comment out data source and gateway loading
  // return getDefaultAgents() immediately
  console.log('[AgentLoader] Forced demo mode')
  return getDefaultAgents()
}
```

---

## 🆘 Still Having Issues?

1. **Check GitHub Issues**: https://github.com/Summonair/world-of-claudecraft/issues
2. **Include in Your Report**:
   - Console logs (especially `[AgentLoader]` and `[TaskPanel]`)
   - Connection status (demo vs connected)
   - Steps to reproduce
   - Expected vs actual behavior

3. **Provide Environment Details**:
   - Node.js version: `node --version`
   - OS: macOS/Windows/Linux
   - Browser: Chrome/Firefox/etc
