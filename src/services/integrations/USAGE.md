# Integration Usage Guide

Complete guide for using Slack and Discord integrations in AgentForge.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Slack Integration](#slack-integration)
3. [Discord Integration](#discord-integration)
4. [Integration Manager](#integration-manager)
5. [Backend API](#backend-api)
6. [Advanced Usage](#advanced-usage)

## Quick Start

### Installation

```bash
# No additional dependencies needed - uses axios which is already installed
```

### Basic Setup

```typescript
import { getIntegrationManager } from './services/integrations'

// Initialize with configuration
const manager = getIntegrationManager()

manager.updateConfig({
  slack: {
    enabled: true,
    webhookUrl: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
    defaultChannel: '#agentforge'
  },
  discord: {
    enabled: true,
    webhookUrl: 'https://discord.com/api/webhooks/YOUR/WEBHOOK/URL',
    defaultChannelId: '1234567890'
  }
})

// Send notification to all platforms
await manager.notifyAll('task_complete', {
  id: 'task_123',
  title: 'Process Data',
  description: 'Successfully processed 1000 records',
  status: 'completed',
  agentId: 'agent_1',
  agentName: 'Data Processor'
})
```

## Slack Integration

### Simple Setup (Webhook Only)

```typescript
import { SlackClient, SlackNotifier } from './services/integrations/slack'

// Create client with webhook
const client = new SlackClient({
  webhookUrl: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
})

// Create notifier
const notifier = new SlackNotifier(client, '#agentforge')

// Send notification
await notifier.notifyTaskComplete({
  id: 'task_123',
  title: 'Process Data',
  description: 'Successfully processed 1000 records',
  status: 'completed',
  agentId: 'agent_1',
  agentName: 'Data Processor'
})
```

### Advanced Setup (Bot API)

```typescript
import { SlackClient, SlackNotifier } from './services/integrations/slack'

// Create client with bot token
const client = new SlackClient({
  botToken: 'xoxb-YOUR-BOT-TOKEN',
  signingSecret: 'YOUR-SIGNING-SECRET'
})

// List channels
const channels = await client.listChannels()
console.log('Available channels:', channels)

// Post message with interactive elements
await client.postMessage({
  channel: '#agentforge',
  text: 'Task completed!',
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Task Completed*\nYour task has been completed successfully!'
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'View Details' },
          url: 'https://agentforge.app/tasks/123'
        }
      ]
    }
  ]
})

// Get user info
const user = await client.getUserInfo('U12345678')
console.log('User:', user.real_name)
```

### Slash Commands

```typescript
import { SlackCommandsHandler } from './services/integrations/slack'

const handler = new SlackCommandsHandler(client)

// Register custom command
handler.register({
  name: 'deploy',
  description: 'Deploy an agent',
  usage: '/agentforge deploy <agent_id>',
  handler: async (command, args) => {
    const agentId = args[0]
    // Deploy logic here
    return {
      response_type: 'in_channel',
      text: `Deploying agent ${agentId}...`
    }
  }
})

// Handle incoming command (in your backend)
const response = await handler.handle(slackCommand)
```

### OAuth Integration

```typescript
// Get authorization URL
const authUrl = client.getAuthorizationUrl('random-state-string')
console.log('Authorize at:', authUrl)

// Exchange code for token (in OAuth callback)
const result = await client.exchangeCodeForToken(code)
console.log('Access token:', result.access_token)
console.log('Bot user ID:', result.bot_user_id)
```

## Discord Integration

### Simple Setup (Webhook Only)

```typescript
import { DiscordClient, DiscordNotifier } from './services/integrations/discord'

// Create client with webhook
const client = new DiscordClient({
  webhookUrl: 'https://discord.com/api/webhooks/YOUR/WEBHOOK/URL'
})

// Create notifier
const notifier = new DiscordNotifier(client, '1234567890')

// Send notification
await notifier.notifyTaskComplete({
  id: 'task_123',
  title: 'Process Data',
  description: 'Successfully processed 1000 records',
  status: 'completed',
  agentId: 'agent_1',
  agentName: 'Data Processor'
})
```

### Advanced Setup (Bot API)

```typescript
import { DiscordClient, DiscordNotifier } from './services/integrations/discord'

// Create client with bot token
const client = new DiscordClient({
  botToken: 'YOUR-BOT-TOKEN',
  clientId: 'YOUR-CLIENT-ID',
  guildId: 'YOUR-GUILD-ID'
})

// List channels
const channels = await client.listGuildChannels()
console.log('Available channels:', channels)

// Send rich embed
const embed = client.createEmbed({
  title: 'Task Completed',
  description: 'Your task has been completed successfully!',
  color: 'success',
  fields: [
    { name: 'Task ID', value: 'task_123', inline: true },
    { name: 'Duration', value: '5 minutes', inline: true }
  ],
  footer: 'AgentForge',
  timestamp: true
})

await client.sendMessage('1234567890', {
  embeds: [embed]
})

// Add reaction
await client.addReaction('1234567890', 'message_id', '✅')
```

### Slash Commands

```typescript
import { DiscordCommandsHandler } from './services/integrations/discord'

const handler = new DiscordCommandsHandler(client)

// Register custom command
handler.define({
  name: 'deploy',
  description: 'Deploy an agent',
  options: [
    {
      type: 3, // STRING
      name: 'agent_id',
      description: 'Agent ID to deploy',
      required: true
    }
  ],
  handler: async (interaction) => {
    const agentId = interaction.data?.options?.[0]?.value
    // Deploy logic here
    return {
      type: 'reply',
      content: `Deploying agent ${agentId}...`
    }
  }
})

// Register all commands with Discord
await handler.registerCommands()

// Handle incoming interaction (in your backend)
await handler.handle(interaction)
```

## Integration Manager

### Unified Notifications

```typescript
import { getIntegrationManager } from './services/integrations'

const manager = getIntegrationManager()

// Task completion
await manager.notifyAll('task_complete', {
  id: 'task_123',
  title: 'Process Data',
  description: 'Successfully processed 1000 records',
  status: 'completed',
  agentId: 'agent_1',
  agentName: 'Data Processor',
  startTime: new Date('2024-01-01T10:00:00'),
  endTime: new Date('2024-01-01T10:05:00')
})

// Task failure
await manager.notifyAll('task_failed', {
  id: 'task_124',
  title: 'Import CSV',
  description: 'Failed to import data',
  status: 'failed',
  agentId: 'agent_2',
  agentName: 'CSV Importer',
  error: 'File not found'
})

// Level up
await manager.notifyAll('level_up', {
  agentName: 'Data Processor',
  oldLevel: 5,
  newLevel: 6
})

// Achievement
await manager.notifyAll('achievement', {
  title: 'Task Master',
  description: 'Completed 100 tasks',
  icon: 'https://example.com/trophy.png'
})

// System alert
await manager.notifyAll('system', {
  level: 'critical',
  title: 'High Memory Usage',
  message: 'System memory usage is at 95%',
  timestamp: new Date(),
  source: 'System Monitor'
})
```

### Daily Summary

```typescript
// Send daily summary to all platforms
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

### Test Connections

```typescript
// Test all enabled integrations
const results = await manager.testConnections()

if (results.slack?.success) {
  console.log('✅ Slack connected')
} else {
  console.error('❌ Slack failed:', results.slack?.error)
}

if (results.discord?.success) {
  console.log('✅ Discord connected')
} else {
  console.error('❌ Discord failed:', results.discord?.error)
}
```

### Configuration Management

```typescript
// Update configuration
manager.updateConfig({
  slack: {
    enabled: true,
    enabledNotifications: ['task_complete', 'level_up', 'achievement']
  },
  discord: {
    enabled: true,
    enabledNotifications: ['task_failed', 'system']
  }
})

// Get current configuration
const config = manager.getConfig()
console.log('Current config:', config)

// Check if platform is enabled
if (manager.isSlackEnabled()) {
  console.log('Slack is enabled')
}
```

## Backend API

### Express Routes

```typescript
// In your backend/src/index.ts
import integrationRoutes from './integrations/integrationRoutes'

app.use('/api/integrations', integrationRoutes)
```

### Environment Variables

```bash
# .env file
SLACK_SIGNING_SECRET=your_signing_secret
SLACK_CLIENT_ID=your_client_id
SLACK_CLIENT_SECRET=your_client_secret

DISCORD_PUBLIC_KEY=your_public_key
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
```

### Webhook Endpoints

- **Slack Commands**: `POST /api/integrations/slack/commands`
- **Discord Interactions**: `POST /api/integrations/discord/interactions`
- **OAuth Callbacks**:
  - Slack: `GET /api/integrations/slack/oauth/callback`
  - Discord: `GET /api/integrations/discord/oauth/callback`
- **Status**: `GET /api/integrations/status`
- **Test**: `POST /api/integrations/test/:platform`

## Advanced Usage

### Custom Notifications

#### Slack

```typescript
const notifier = manager.getSlackNotifier()

// Send custom message with attachments
await notifier.sendCustom(
  'Custom message',
  [
    {
      color: '#36a64f',
      title: 'Custom Notification',
      text: 'This is a custom notification',
      fields: [
        { title: 'Field 1', value: 'Value 1', short: true },
        { title: 'Field 2', value: 'Value 2', short: true }
      ]
    }
  ]
)
```

#### Discord

```typescript
const notifier = manager.getDiscordNotifier()

// Send custom message with embeds
const embed = client.createEmbed({
  title: 'Custom Notification',
  description: 'This is a custom notification',
  color: 0x00ff00,
  fields: [
    { name: 'Field 1', value: 'Value 1', inline: true },
    { name: 'Field 2', value: 'Value 2', inline: true }
  ]
})

await notifier.sendCustom('Custom message', [embed])
```

### Progress Updates

```typescript
const discordNotifier = manager.getDiscordNotifier()

// Send progress update
await discordNotifier.sendProgress(
  'Data Processing',
  75, // 75% complete
  'Processing records 7500/10000'
)
```

### Leaderboard

```typescript
const discordNotifier = manager.getDiscordNotifier()

// Send agent leaderboard
await discordNotifier.sendLeaderboard([
  { name: 'Agent Alpha', level: 10, tasksCompleted: 150 },
  { name: 'Agent Beta', level: 8, tasksCompleted: 120 },
  { name: 'Agent Gamma', level: 7, tasksCompleted: 95 }
])
```

### Error Handling

```typescript
try {
  await manager.notifyAll('task_complete', taskData)
} catch (error) {
  console.error('Failed to send notifications:', error)
  // Notifications are non-blocking - the app continues even if they fail
}
```

## Best Practices

1. **Use Webhooks for Simple Cases**: Start with webhooks for one-way notifications
2. **Bot Token for Advanced Features**: Use bot tokens when you need:
   - Channel management
   - User information
   - Interactive elements
   - Slash commands
3. **Enable Only Needed Notifications**: Reduce noise by enabling only relevant notification types
4. **Test Connections Regularly**: Verify integrations are working correctly
5. **Handle Errors Gracefully**: Don't let integration failures break your app
6. **Secure Your Tokens**: Store tokens in environment variables, never in code
7. **Rate Limiting**: Be aware of API rate limits (Slack: 1/sec, Discord: varies)
8. **Use Ephemeral Messages**: For sensitive or user-specific information

## Troubleshooting

### Slack Issues

- **Invalid Signature**: Check your signing secret
- **Channel Not Found**: Ensure bot is invited to the channel
- **Missing Scopes**: Add required OAuth scopes in Slack app settings

### Discord Issues

- **401 Unauthorized**: Verify bot token is correct
- **403 Forbidden**: Check bot permissions in Discord server
- **Unknown Channel**: Ensure channel ID is correct and bot has access

## Support

For more information, see:
- [Slack API Documentation](https://api.slack.com/)
- [Discord API Documentation](https://discord.com/developers/docs/)
- [AgentForge Documentation](https://github.com/your-repo/agentforge)
