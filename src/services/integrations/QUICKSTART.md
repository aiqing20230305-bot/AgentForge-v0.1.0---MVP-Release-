# Quick Start Guide

Get started with Slack and Discord integrations in 5 minutes!

## Option 1: Webhook (Easiest) ⚡

### Slack Webhook

1. **Get Webhook URL**
   - Visit: https://api.slack.com/apps
   - Create app → Enable "Incoming Webhooks"
   - Add webhook to channel
   - Copy webhook URL

2. **Configure in AgentForge**
   ```typescript
   import { getIntegrationManager } from './services/integrations'

   const manager = getIntegrationManager()
   manager.updateConfig({
     slack: {
       enabled: true,
       webhookUrl: 'YOUR_WEBHOOK_URL',
       defaultChannel: '#agentforge'
     }
   })
   ```

3. **Send Notification**
   ```typescript
   await manager.notifyAll('task_complete', {
     id: 'task_1',
     title: 'First Task',
     description: 'My first notification!',
     status: 'completed',
     agentId: 'agent_1',
     agentName: 'My Agent'
   })
   ```

### Discord Webhook

1. **Get Webhook URL**
   - Open Discord server settings
   - Go to Integrations → Webhooks
   - Create webhook
   - Copy webhook URL

2. **Configure in AgentForge**
   ```typescript
   manager.updateConfig({
     discord: {
       enabled: true,
       webhookUrl: 'YOUR_WEBHOOK_URL',
       defaultChannelId: 'CHANNEL_ID'
     }
   })
   ```

3. **Done!** Same notification code works for both platforms.

## Option 2: Bot Integration (Advanced) 🤖

For slash commands, user info, and advanced features.

### Slack Bot

1. **Create Slack App**: https://api.slack.com/apps
2. **Add Bot Token Scopes**:
   - `channels:read`
   - `chat:write`
   - `users:read`
3. **Install to Workspace**
4. **Copy Bot Token** (starts with `xoxb-`)
5. **Configure**:
   ```typescript
   manager.updateConfig({
     slack: {
       enabled: true,
       botToken: 'YOUR_BOT_TOKEN',
       defaultChannel: '#agentforge'
     }
   })
   ```

### Discord Bot

1. **Create Discord App**: https://discord.com/developers/applications
2. **Add Bot** and copy token
3. **Enable Intents**: MESSAGE_CONTENT, GUILDS
4. **Invite to Server** with proper permissions
5. **Get IDs**: Enable Developer Mode, right-click to copy IDs
6. **Configure**:
   ```typescript
   manager.updateConfig({
     discord: {
       enabled: true,
       botToken: 'YOUR_BOT_TOKEN',
       guildId: 'YOUR_GUILD_ID',
       defaultChannelId: 'YOUR_CHANNEL_ID'
     }
   })
   ```

## Testing

```typescript
// Test all connections
const results = await manager.testConnections()

if (results.slack?.success) {
  console.log('✅ Slack working!')
}

if (results.discord?.success) {
  console.log('✅ Discord working!')
}
```

## Common Use Cases

### Task Notifications

```typescript
// Task completed
await manager.notifyAll('task_complete', {
  id: 'task_123',
  title: 'Data Processing',
  description: 'Processed 1000 records',
  status: 'completed',
  agentId: 'agent_1',
  agentName: 'Data Processor',
  startTime: new Date('2024-01-01T10:00:00'),
  endTime: new Date('2024-01-01T10:05:00')
})

// Task failed
await manager.notifyAll('task_failed', {
  id: 'task_124',
  title: 'API Call',
  description: 'Failed to connect',
  status: 'failed',
  agentId: 'agent_2',
  agentName: 'API Monitor',
  error: 'Connection timeout'
})
```

### Level Up & Achievements

```typescript
// Agent leveled up
await manager.notifyAll('level_up', {
  agentName: 'Data Processor',
  oldLevel: 5,
  newLevel: 6
})

// Achievement unlocked
await manager.notifyAll('achievement', {
  title: 'Task Master',
  description: 'Completed 100 tasks!',
  icon: '🏆'
})
```

### System Alerts

```typescript
// Info
await manager.notifyAll('system', {
  level: 'info',
  title: 'System Started',
  message: 'AgentForge is online',
  timestamp: new Date()
})

// Warning
await manager.notifyAll('system', {
  level: 'warning',
  title: 'High CPU Usage',
  message: 'CPU at 85%',
  timestamp: new Date(),
  source: 'System Monitor'
})

// Critical
await manager.notifyAll('system', {
  level: 'critical',
  title: 'Database Down',
  message: 'Cannot connect to database',
  timestamp: new Date(),
  source: 'Database Monitor'
})
```

### Daily Summary

```typescript
await manager.sendDailySummary({
  totalTasks: 150,
  completedTasks: 142,
  failedTasks: 8,
  activeAgents: 5,
  totalAgents: 10,
  topAgent: {
    name: 'Data Processor',
    tasksCompleted: 45
  }
})
```

## UI Configuration

Access the integration settings UI:

1. Open AgentForge
2. Go to **Settings**
3. Click **Integrations**
4. Configure Slack and Discord
5. Test connections
6. Enable/disable notification types

## Troubleshooting

### Slack Issues

**❌ "Channel not found"**
- Invite bot to channel first: `/invite @YourBot`

**❌ "Invalid signature"**
- Check signing secret is correct

**❌ "Missing scopes"**
- Add required OAuth scopes and reinstall app

### Discord Issues

**❌ "403 Forbidden"**
- Check bot permissions in server settings

**❌ "Unknown Channel"**
- Verify channel ID is correct
- Enable Developer Mode to copy IDs

**❌ "401 Unauthorized"**
- Verify bot token is correct

## Next Steps

- 📖 [Full Documentation](./README.md)
- 💡 [Usage Examples](./examples.ts)
- 📚 [Detailed Guide](./USAGE.md)
- 🔧 [Backend Setup](../../backend/src/integrations/README.md)

## Support

Need help?

- 💬 Discord: https://discord.gg/agentforge
- 📧 Email: support@agentforge.com
- 🐛 Issues: https://github.com/your-repo/agentforge/issues

---

**Happy integrating! 🚀**
