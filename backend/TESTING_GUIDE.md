# AgentForge Cloud Sync - Testing Guide

## Quick Start Testing

### Prerequisites
- Node.js installed
- MongoDB running (or use cloud MongoDB)
- Two terminal windows

---

## Step-by-Step Testing

### 1. Start Backend Server

**Terminal 1**:
```bash
cd /Users/zhangjingwei/Desktop/AgentForge/backend
npm run dev
```

**Expected Output**:
```
🚀 Backend server started
📍 Server: http://localhost:3001
📡 API: http://localhost:3001/api/v1
🗄️  Database: Connected to MongoDB
```

**If MongoDB Connection Fails**:
- Check MongoDB is running: `mongosh`
- Or update `.env` to use cloud MongoDB URL

---

### 2. Start Frontend App

**Terminal 2**:
```bash
cd /Users/zhangjingwei/Desktop/AgentForge
npm run dev
```

**Expected Output**:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

App should open automatically in browser.

---

## Test Scenarios

### Test 1: User Registration ✅

1. **Open Settings**:
   - Click ⚙️ (settings icon) in top-right corner
   - OR: Click "设置" tab in right panel

2. **Navigate to Cloud Sync**:
   - Click "云同步" tab (last tab with cloud icon)

3. **Open Login Modal**:
   - Click "Login to Enable Cloud Sync" button

4. **Switch to Register**:
   - Click "Don't have an account? Sign up" at bottom

5. **Fill Registration Form**:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123` (min 6 chars)

6. **Submit**:
   - Click "Create Account" button
   - Should show loading spinner
   - Modal should close on success

7. **Verify Success**:
   - Top bar should show "Cloud Sync" (blue)
   - Settings → Cloud Sync should show user info

---

### Test 2: First Sync (Push Local Data) ✅

1. **Check Initial State**:
   - Settings → Cloud Sync tab
   - Should show "Local Agents" count (e.g., 4 agents)
   - Should show "Synced Agents" count (0 initially)

2. **Push to Cloud**:
   - Click "Push" button (green, Upload icon)
   - Should show "Syncing..." spinner

3. **Verify Result**:
   - Should show "Sync Successful" message (green)
   - Should display "Synced X agents and 0 tasks"
   - "Synced Agents" count should increase

4. **Verify in Backend**:
   - Check MongoDB: `mongosh`
   - `use agentforge`
   - `db.agents.find().pretty()`
   - Should see uploaded agents

---

### Test 3: Pull from Cloud ✅

1. **Pull Data**:
   - Click "Pull" button (blue, Database icon)
   - Should show "Syncing..." spinner

2. **Verify Result**:
   - Should show "Sync Successful" message
   - Local agent cache should update
   - Agents should have `metadata.cloudId` field

3. **Check Agent Cards**:
   - Main display should show agents
   - (Future) CloudSyncIndicator would show green cloud icon

---

### Test 4: Full Bidirectional Sync ✅

1. **Full Sync**:
   - Click "Full Sync" button (purple, Activity icon)
   - Performs Push then Pull

2. **Verify Result**:
   - Shows combined sync count
   - All local agents should be synced
   - All cloud agents should be downloaded

---

### Test 5: Manual Sync from TopBar ✅

1. **Locate CloudSyncToggle**:
   - Top bar → Look for "Cloud Sync" section
   - Should show blue cloud icon (enabled state)

2. **Click Sync Button**:
   - Click "Sync" button next to toggle
   - Should show "Syncing..." text
   - Spinner icon should rotate

3. **Verify Result**:
   - Should show "Synced" checkmark (green)
   - OR: Error message if sync fails (red)
   - Status clears after 3 seconds

---

### Test 6: Disable/Enable Sync ✅

1. **Disable Sync**:
   - TopBar → Click toggle switch (turns gray)
   - Text changes to "Offline Mode"
   - "Sync" button disappears

2. **Try to Re-enable**:
   - Click toggle switch again
   - Should turn blue
   - Text changes to "Cloud Sync"
   - "Sync" button reappears
   - Automatically triggers sync

---

### Test 7: Logout ✅

1. **Logout**:
   - Settings → Cloud Sync tab
   - Click "Logout" button (red)

2. **Verify**:
   - TopBar shows "Offline Mode"
   - Settings shows "Not connected"
   - "Login to Enable Cloud Sync" button appears

---

### Test 8: Login with Existing Account ✅

1. **Open Login Modal**:
   - Settings → Cloud Sync → "Login to Enable Cloud Sync"

2. **Fill Login Form**:
   - Email: `test@example.com`
   - Password: `password123`

3. **Submit**:
   - Click "Login" button
   - Modal closes on success

4. **Auto-Sync**:
   - LoginModal triggers `onSuccess` callback
   - Automatically enables sync and pulls data

---

## Error Testing

### Test 9: Wrong Password ❌

1. **Try Login**:
   - Email: `test@example.com`
   - Password: `wrongpassword`

2. **Expected Result**:
   - Red error banner appears
   - "Invalid credentials" or similar message
   - Modal stays open

---

### Test 10: Network Error ❌

1. **Stop Backend Server**:
   - Terminal 1: Ctrl+C

2. **Try Sync**:
   - Click any sync button

3. **Expected Result**:
   - Shows error: "Sync failed. Please check your connection."
   - Red error banner

4. **Restart Server**:
   - Terminal 1: `npm run dev`

---

### Test 11: Token Expiration ⏰

1. **Wait 1 Hour**:
   - JWT access token expires after 1 hour (configurable)

2. **Try Sync**:
   - Should automatically refresh token
   - Sync continues normally

3. **If Refresh Fails**:
   - User is logged out
   - Must login again

---

## Advanced Testing

### Test 12: Multiple Users

1. **Create Second User**:
   - Logout from first account
   - Register as `user2@example.com`

2. **Upload Data**:
   - Second user uploads their agents
   - Should be isolated from first user

3. **Verify Isolation**:
   - Backend: `db.agents.find({ userId: ObjectId("...") })`
   - Each user should only see their own agents

---

### Test 13: Concurrent Sync

1. **Open Two Browser Windows**:
   - Window A: AgentForge with User 1
   - Window B: AgentForge with User 2

2. **Sync Simultaneously**:
   - Both users click "Sync" at same time

3. **Verify**:
   - Both syncs complete successfully
   - No data corruption
   - Each user's data is separate

---

### Test 14: Large Dataset

1. **Create Many Agents**:
   - Manually create 50+ agents in local storage

2. **Push to Cloud**:
   - Click "Push" button
   - May take a few seconds

3. **Verify Performance**:
   - Sync should complete in < 10 seconds
   - No browser freezing
   - All agents uploaded

---

## Backend API Testing (Optional)

### Using curl or Postman

**Register**:
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"apitest","email":"api@test.com","password":"test123"}'
```

**Login**:
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"api@test.com","password":"test123"}'
```

Response includes `accessToken` and `refreshToken`.

**Get Agents**:
```bash
curl http://localhost:3001/api/v1/agents \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Create Agent**:
```bash
curl -X POST http://localhost:3001/api/v1/agents \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Agent",
    "aiModel": "gpt-4",
    "systemPrompt": "You are a test agent",
    "temperature": 0.7,
    "maxTokens": 2000
  }'
```

---

## Common Issues & Solutions

### Issue 1: Backend Won't Start
**Error**: `Cannot connect to MongoDB`

**Solution**:
- Check MongoDB is running: `mongosh`
- Update `.env`: `MONGODB_URI=mongodb://localhost:27017/agentforge`
- Or use cloud MongoDB: `MONGODB_URI=mongodb+srv://...`

---

### Issue 2: CORS Error
**Error**: `Access to fetch at 'http://localhost:3001' from origin 'http://localhost:5173' has been blocked by CORS`

**Solution**:
- Backend `.env` should have: `FRONTEND_URL=http://localhost:5173`
- Restart backend server

---

### Issue 3: 401 Unauthorized
**Error**: Sync fails with 401 error

**Solution**:
- User is not logged in
- Token expired (login again)
- Backend JWT_SECRET mismatch (regenerate token)

---

### Issue 4: Sync Shows 0 Agents
**Possible Causes**:
1. No agents in local storage
2. Agent conversion error
3. Backend database empty

**Debug**:
1. Check browser console for errors
2. Check local storage: `localStorage.getItem('agent-storage')`
3. Check backend logs for errors

---

### Issue 5: Modal Won't Close
**Cause**: JavaScript error during login/register

**Solution**:
- Check browser console for errors
- Verify backend is responding
- Clear browser cache and reload

---

## Success Checklist

After completing all tests, verify:

- [ ] User can register new account
- [ ] User can login with existing account
- [ ] User can logout
- [ ] Push sync uploads agents to backend
- [ ] Pull sync downloads agents from backend
- [ ] Full sync works bidirectionally
- [ ] TopBar toggle enables/disables sync
- [ ] Manual sync button triggers sync
- [ ] Sync status feedback works (loading, success, error)
- [ ] Error messages display correctly
- [ ] Token refresh works (test after 1 hour)
- [ ] Multiple users have isolated data
- [ ] Backend server handles concurrent requests
- [ ] TypeScript compilation passes (no errors)
- [ ] Browser console has no errors during normal flow

---

## Performance Benchmarks

| Operation | Expected Time | Acceptable Time |
|-----------|---------------|-----------------|
| Login | < 500ms | < 1s |
| Register | < 500ms | < 1s |
| Push (10 agents) | < 1s | < 3s |
| Pull (10 agents) | < 1s | < 3s |
| Full Sync (10 agents) | < 2s | < 5s |
| Toggle Enable/Disable | Instant | < 100ms |

---

## Next Steps After Testing

1. **Fix Any Bugs Found**
2. **Improve Error Messages**
3. **Add CloudSyncIndicator to Agent Cards**
4. **Implement Task Sync**
5. **Add WebSocket Real-time Updates**
6. **Write Automated Tests**

---

## Automated Testing (Future)

### Unit Tests (Vitest)
- Test API client functions
- Test sync service logic
- Test auth context hooks

### Integration Tests (Playwright)
- Test full login flow
- Test sync operations
- Test error scenarios

### E2E Tests
- Test complete user journey
- Test multi-user scenarios
- Test offline/online transitions

---

**Testing Guide Version**: 1.0
**Last Updated**: 2026-03-15
**Author**: Claude (AgentForge Development Team)
