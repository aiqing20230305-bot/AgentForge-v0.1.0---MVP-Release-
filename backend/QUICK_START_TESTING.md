# Quick Start Testing - Cloud Sync Integration

## Option 1: Cloud MongoDB (Recommended - 5 minutes) ⚡

### Step 1: Create Free MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up (free tier - no credit card required)
3. Create a free M0 cluster (512MB - plenty for testing)

### Step 2: Get Connection String

1. In MongoDB Atlas dashboard, click "Connect"
2. Choose "Connect your application"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. Add database name at the end: `...mongodb.net/agentforge?retryWrites=true&w=majority`

### Step 3: Update Backend .env

Edit `/Users/zhangjingwei/Desktop/AgentForge/backend/.env`:

```bash
# Change this line:
MONGODB_URI=mongodb://localhost:27017/agentforge

# To your Atlas connection string:
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/agentforge?retryWrites=true&w=majority
```

### Step 4: Whitelist Your IP

In MongoDB Atlas:
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for testing)
4. Confirm

---

## Option 2: Local MongoDB (Longer - 10 minutes) 🐌

### Install MongoDB via Homebrew

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB service
brew services start mongodb-community@7.0

# Verify it's running
mongosh --eval "db.version()"
```

**Note**: Keep MongoDB running in the background for testing.

---

## Start Testing (After MongoDB Setup)

### Terminal 1: Start Backend

```bash
cd /Users/zhangjingwei/Desktop/AgentForge/backend
npm run dev
```

**Expected output**:
```
🚀 Backend server started
📍 Server: http://localhost:3001
📡 API: http://localhost:3001/api/v1
🗄️  Database: Connected to MongoDB
✅ Connected to database: agentforge
```

**If you see "❌ Database connection failed"**:
- Check your MongoDB connection string
- Verify MongoDB is running (local) or IP is whitelisted (cloud)

---

### Terminal 2: Start Frontend

```bash
cd /Users/zhangjingwei/Desktop/AgentForge
npm run dev
```

**Expected output**:
```
VITE v5.x.x ready in XXX ms
➜  Local:   http://localhost:5173/
```

Browser should open automatically.

---

## Test Scenario 1: User Registration ✅

1. **Open App** (http://localhost:5173)

2. **Navigate to Settings**:
   - Click ⚙️ icon in top-right corner

3. **Go to Cloud Sync Tab**:
   - Click last tab "云同步" (cloud icon)

4. **Open Login Modal**:
   - Click blue button "Login to Enable Cloud Sync"

5. **Switch to Register**:
   - At bottom: "Don't have an account? **Sign up**"

6. **Fill Form**:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `test123456` (min 6 chars)

7. **Submit**:
   - Click green "Create Account" button
   - Should see loading spinner
   - Modal closes automatically

8. **Verify Success** ✅:
   - Top bar shows "Cloud Sync" (blue, enabled)
   - Settings panel shows:
     - Account: testuser (test@example.com)
     - Logout button appears

**Screenshot checkpoints**:
- [ ] Login modal appears
- [ ] Registration form renders
- [ ] Success: modal closes
- [ ] TopBar shows "Cloud Sync"

---

## Test Scenario 2: First Sync (Push Local Data) ⬆️

1. **Check Initial State**:
   - Settings → 云同步 tab
   - "Local Agents": Shows count (e.g., 4 agents)
   - "Synced Agents": Shows 0

2. **Click "Push" Button** (green, upload icon):
   - Button shows "Syncing..." with spinner
   - Wait 1-3 seconds

3. **Verify Success** ✅:
   - Green success banner appears
   - Message: "Synced X agents and 0 tasks"
   - "Synced Agents" count updates (e.g., 0 → 4)

4. **Verify in Backend** (Terminal 1):
   - Should see logs:
     ```
     POST /api/v1/agents - 201 (Created)
     POST /api/v1/agents - 201 (Created)
     ...
     ```

**Screenshot checkpoints**:
- [ ] Before: Synced Agents = 0
- [ ] Loading: "Syncing..." spinner
- [ ] Success: Green banner
- [ ] After: Synced Agents = 4

---

## Test Scenario 3: Pull from Cloud ⬇️

1. **Click "Pull" Button** (blue, database icon)

2. **Verify Success** ✅:
   - Blue success banner
   - Message: "Synced X agents and 0 tasks"
   - Agent cards should refresh

3. **Check Agent Metadata**:
   - Open browser DevTools (F12)
   - Console: `localStorage.getItem('agent-storage')`
   - Look for `metadata.cloudId` field in agents

**Expected**: All agents now have `cloudId` field.

---

## Test Scenario 4: TopBar Manual Sync 🔄

1. **Locate CloudSyncToggle**:
   - Top bar → Right side
   - Shows blue cloud icon + "Cloud Sync" text

2. **Click "Sync" Button**:
   - Button shows "Syncing..." with rotating icon
   - Wait 1-3 seconds

3. **Verify Result** ✅:
   - Shows green checkmark + "Synced"
   - Status clears after 3 seconds

---

## Test Scenario 5: Disable/Enable Sync 🔀

1. **Disable**:
   - Click toggle switch (turns from blue to gray)
   - Text changes to "Offline Mode"
   - Cloud icon becomes CloudOff icon
   - "Sync" button disappears

2. **Re-Enable**:
   - Click toggle switch (turns blue)
   - Text changes to "Cloud Sync"
   - Automatically triggers sync
   - Shows "Syncing..." then "Synced"

---

## Test Scenario 6: Logout & Login 🚪

1. **Logout**:
   - Settings → 云同步 → Click red "Logout" button
   - TopBar changes to "Offline Mode"
   - Settings shows "Not connected"

2. **Login Again**:
   - Click "Login to Enable Cloud Sync"
   - Enter credentials:
     - Email: `test@example.com`
     - Password: `test123456`
   - Click "Login"

3. **Auto-Sync After Login** ✅:
   - Modal closes
   - Sync automatically triggers
   - Agents pulled from cloud

---

## Error Testing ❌

### Test: Wrong Password

1. Login with wrong password: `wrongpass123`
2. Expected: Red error banner
3. Message: "Invalid credentials"
4. Modal stays open

### Test: Backend Offline

1. Stop backend (Terminal 1: Ctrl+C)
2. Try to sync
3. Expected: Red error banner
4. Message: "Sync failed. Please check your connection."
5. Restart backend: `npm run dev`

---

## Success Checklist ✅

After testing, verify:

- [ ] User registration works
- [ ] User login works
- [ ] Push sync uploads agents
- [ ] Pull sync downloads agents
- [ ] Full sync works
- [ ] TopBar toggle works
- [ ] Manual sync works
- [ ] Sync status shows correctly
- [ ] Error messages display
- [ ] Logout works
- [ ] Login after logout works
- [ ] No console errors during normal flow

---

## Troubleshooting

### Backend won't start
```bash
# Check port 3001 is free
lsof -i :3001
# If something is using it, kill it:
kill -9 <PID>
```

### Frontend won't start
```bash
# Check port 5173 is free
lsof -i :5173
```

### MongoDB connection fails (Cloud)
1. Check connection string is correct
2. Verify IP is whitelisted in Atlas
3. Check password doesn't contain special chars

### MongoDB connection fails (Local)
```bash
# Check if MongoDB is running
brew services list | grep mongodb
# Restart if needed
brew services restart mongodb-community@7.0
```

---

## Next Steps After Testing

1. Report any bugs found
2. Test with larger datasets (50+ agents)
3. Test concurrent syncs (multiple users)
4. Add CloudSyncIndicator to agent cards
5. Implement task sync
6. Add WebSocket real-time updates

---

**Quick Start Guide Version**: 1.0
**Last Updated**: 2026-03-15
