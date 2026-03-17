# AgentForge Integrations

Complete integration system for connecting AgentForge with external platforms.

## Available Integrations

### Communication Platforms
- **Slack** - Complete integration with webhooks, bot API, commands, and OAuth
- **Discord** - Full-featured integration with webhooks, bot API, embeds, and slash commands

### Project Management
- **Jira** - Task synchronization and project management
- **GitHub** - Repository integration and issue tracking

## Quick Start

### 1. Install (Already included in AgentForge)

No additional dependencies needed - all integrations use existing dependencies like axios.

### 2. Configure

Access the Integration Settings from the admin panel:

```
Settings → Integrations
```

Or configure programmatically:

```typescript
import { getIntegrationManager } from './services/integrations'

const manager = getIntegrationManager()

manager.updateConfig({
  slack: {
    enabled: true,
    webhookUrl: 'https://hooks.slack.com/services/...',
    defaultChannel: '#agentforge'
  },
  discord: {
    enabled: true,
    webhookUrl: 'https://discord.com/api/webhooks/...',
    defaultChannelId: '1234567890'
  }
})
```

### 3. Use

Send notifications to all enabled platforms:

```typescript
await manager.notifyAll('task_complete', {
  id: 'task_123',
  title: 'Process Data',
  description: 'Successfully processed 1000 records',
  status: 'completed',
  agentId: 'agent_1',
  agentName: 'Data Processor'
})
```

## Features

### Slack Integration

#### Simple Setup (Webhook)
- ✅ One-way notifications
- ✅ Rich message formatting
- ✅ Attachments and links
- ✅ Custom username and icon
- ⚡ 5 minutes to setup

#### Advanced Setup (Bot API)
- ✅ Channel management
- ✅ User information
- ✅ Interactive messages
- ✅ Slash commands
- ✅ OAuth authentication
- ✅ Reactions and threads
- ⏱️ 30 minutes to setup

### Discord Integration

#### Simple Setup (Webhook)
- ✅ One-way notifications
- ✅ Rich embeds
- ✅ Custom username and avatar
- ✅ Markdown formatting
- ⚡ 5 minutes to setup

#### Advanced Setup (Bot API)
- ✅ Channel and guild management
- ✅ User information
- ✅ Slash commands
- ✅ Buttons and components
- ✅ Reactions and embeds
- ⏱️ 30 minutes to setup

## Notification Types

The system supports the following notification types:

| Type | Description | Slack | Discord |
|------|-------------|-------|---------|
| `task_complete` | Task completed successfully | ✅ | ✅ |
| `task_failed` | Task execution failed | ✅ | ✅ |
| `level_up` | Agent leveled up | ✅ | ✅ |
| `achievement` | Achievement unlocked | ✅ | ✅ |
| `system` | System alerts and messages | ✅ | ✅ |
| `agent_idle` | Agent is idle | ✅ | ✅ |
| `evolution` | Agent evolution event | ✅ | ✅ |
| `vitality_critical` | Agent vitality critical | ✅ | ✅ |
| `health_warning` | Agent health warning | ✅ | ✅ |

You can enable/disable specific notification types per platform in the settings.

## Architecture

### Directory Structure

```
src/services/integrations/
├── slack/
│   ├── SlackClient.ts         # Core Slack API client
│   ├── SlackNotifier.ts       # High-level notification interface
│   ├── SlackCommands.ts       # Slash command handler
│   └── index.ts               # Exports
├── discord/
│   ├── DiscordClient.ts       # Core Discord API client
│   ├── DiscordNotifier.ts     # High-level notification interface
│   ├── DiscordCommands.ts     # Slash command handler
│   └── index.ts               # Exports
├── IntegrationManager.ts      # Unified integration manager
├── examples.ts                # Usage examples
├── USAGE.md                   # Detailed usage guide
└── README.md                  # This file

backend/src/integrations/
├── integrationController.ts   # API endpoint handlers
└── integrationRoutes.ts       # Express routes

src/components/admin/
└── IntegrationSettings.tsx    # UI configuration component
```

### Code Statistics

- **Slack Integration**: ~1,300 lines
- **Discord Integration**: ~1,300 lines
- **Integration Manager**: ~300 lines
- **Admin UI**: ~700 lines
- **Backend API**: ~600 lines
- **Documentation & Examples**: ~1,200 lines
- **Total**: ~5,400 lines

## Setup Guides

### Slack Setup

#### Webhook (Simple)

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name your app "AgentForge" and select workspace
4. Navigate to "Incoming Webhooks"
5. Activate incoming webhooks
6. Click "Add New Webhook to Workspace"
7. Select a channel and authorize
8. Copy the webhook URL
9. Paste in AgentForge settings

#### Bot (Advanced)

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Navigate to "OAuth & Permissions"
4. Add Bot Token Scopes:
   - `channels:read` - List channels
   - `channels:write` - Manage channels
   - `chat:write` - Send messages
   - `users:read` - Get user info
   - `commands` - Slash commands
5. Install app to workspace
6. Copy "Bot User OAuth Token" (starts with `xoxb-`)
7. Navigate to "Basic Information"
8. Copy "Signing Secret"
9. Paste both in AgentForge settings

#### Slash Commands (Optional)

1. Navigate to "Slash Commands"
2. Click "Create New Command"
3. Command: `/agentforge`
4. Request URL: `https://your-domain.com/api/integrations/slack/commands`
5. Short Description: "Manage AgentForge"
6. Save and reinstall app

### Discord Setup

#### Webhook (Simple)

1. Open your Discord server
2. Go to Server Settings → Integrations
3. Click "Webhooks"
4. Click "New Webhook"
5. Name it "AgentForge"
6. Select a channel
7. Click "Copy Webhook URL"
8. Paste in AgentForge settings

#### Bot (Advanced)

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Name it "AgentForge"
4. Navigate to "Bot"
5. Click "Add Bot"
6. Copy the bot token
7. Enable "MESSAGE CONTENT INTENT"
8. Enable "SERVER MEMBERS INTENT"
9. Navigate to "OAuth2" → "URL Generator"
10. Select scopes: `bot`, `applications.commands`
11. Select permissions:
    - Read Messages/View Channels
    - Send Messages
    - Embed Links
    - Attach Files
    - Read Message History
    - Add Reactions
12. Copy generated URL and open in browser
13. Invite bot to your server
14. Right-click server name → Copy ID (enable Developer Mode first)
15. Right-click channel → Copy ID
16. Paste all values in AgentForge settings

#### Slash Commands (Optional)

Commands are automatically registered when you configure bot token and client ID. The system will register:
- `/agent` - Manage agents
- `/task` - Manage tasks
- `/stats` - Show statistics
- `/help` - Show help

## Usage Examples

### Basic Notification

```typescript
import { getIntegrationManager } from './services/integrations'

const manager = getIntegrationManager()

// Send task completion notification
await manager.notifyAll('task_complete', {
  id: 'task_123',
  title: 'Data Processing',
  description: 'Processed 10,000 records successfully',
  status: 'completed',
  agentId: 'agent_1',
  agentName: 'Data Processor',
  startTime: new Date('2024-01-01T10:00:00'),
  endTime: new Date('2024-01-01T10:05:00')
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

### Platform-Specific Features

```typescript
// Slack: Rich message with blocks
const slackClient = manager.getSlackClient()
await slackClient.postMessage({
  channel: '#agentforge',
  blocks: [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🎉 Milestone Reached!' }
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: 'Successfully processed *1,000,000* records!' }
    }
  ]
})

// Discord: Rich embed with progress
const discordNotifier = manager.getDiscordNotifier()
await discordNotifier.sendProgress(
  'Database Migration',
  75,
  'Migrating 7,500/10,000 records'
)
```

## API Reference

### IntegrationManager

Main class for managing all integrations.

```typescript
class IntegrationManager {
  // Configuration
  updateConfig(config: Partial<IntegrationConfig>): void
  getConfig(): IntegrationConfig

  // Status
  isSlackEnabled(): boolean
  isDiscordEnabled(): boolean

  // Clients
  getSlackClient(): SlackClient | undefined
  getSlackNotifier(): SlackNotifier | undefined
  getDiscordClient(): DiscordClient | undefined
  getDiscordNotifier(): DiscordNotifier | undefined

  // Notifications
  notifyAll(type: NotificationType, data: any): Promise<void>
  sendDailySummary(data: SummaryData): Promise<void>

  // Testing
  testConnections(): Promise<TestResults>
}
```

### SlackClient

Low-level Slack API client.

```typescript
class SlackClient {
  // Messages
  sendWebhook(message: SlackMessage): Promise<void>
  postMessage(message: SlackMessage): Promise<any>
  updateMessage(channel: string, ts: string, message: Partial<SlackMessage>): Promise<any>
  deleteMessage(channel: string, ts: string): Promise<void>

  // Channels
  listChannels(excludeArchived?: boolean): Promise<SlackChannel[]>
  getChannelInfo(channelId: string): Promise<SlackChannel>
  joinChannel(channelId: string): Promise<void>

  // Users
  getUserInfo(userId: string): Promise<SlackUser>

  // OAuth
  getAuthorizationUrl(state?: string, scopes?: string[]): string
  exchangeCodeForToken(code: string): Promise<SlackOAuthResponse>

  // Utility
  verifySignature(timestamp: string, body: string, signature: string): boolean
  testConnection(): Promise<{ success: boolean; error?: string }>
}
```

### DiscordClient

Low-level Discord API client.

```typescript
class DiscordClient {
  // Messages
  sendWebhook(message: DiscordMessage): Promise<void>
  sendMessage(channelId: string, message: DiscordMessage): Promise<any>
  editMessage(channelId: string, messageId: string, message: Partial<DiscordMessage>): Promise<any>
  deleteMessage(channelId: string, messageId: string): Promise<void>

  // Channels
  listGuildChannels(guildId?: string): Promise<DiscordChannel[]>
  getChannel(channelId: string): Promise<DiscordChannel>

  // Users
  getUser(userId: string): Promise<DiscordUser>
  getCurrentUser(): Promise<DiscordUser>

  // Commands
  createCommand(command: CommandDefinition): Promise<any>
  listCommands(): Promise<any[]>
  deleteCommand(commandId: string): Promise<void>

  // Utility
  createEmbed(options: EmbedOptions): DiscordEmbed
  verifySignature(signature: string, timestamp: string, body: string): boolean
  testConnection(): Promise<{ success: boolean; error?: string }>
}
```

## Security

### Best Practices

1. **Never commit tokens**: Store in environment variables
2. **Use signing secrets**: Verify webhook signatures
3. **Implement rate limiting**: Respect API limits
4. **Use HTTPS**: For webhook endpoints
5. **Rotate tokens regularly**: Update credentials periodically
6. **Restrict permissions**: Only grant necessary OAuth scopes
7. **Log security events**: Monitor for suspicious activity

### Environment Variables

```bash
# Backend .env file
SLACK_SIGNING_SECRET=your_signing_secret
SLACK_CLIENT_ID=your_client_id
SLACK_CLIENT_SECRET=your_client_secret

DISCORD_PUBLIC_KEY=your_public_key
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
```

## Troubleshooting

### Common Issues

#### Slack

**"Invalid signature"**
- Verify signing secret is correct
- Check that timestamp is recent (< 5 minutes)
- Ensure request body is unmodified

**"Channel not found"**
- Invite bot to channel first
- Check channel ID is correct
- Verify bot has access permissions

**"Missing scopes"**
- Add required OAuth scopes
- Reinstall app to workspace

#### Discord

**"401 Unauthorized"**
- Check bot token is correct
- Verify token hasn't been regenerated

**"403 Forbidden"**
- Check bot has required permissions
- Verify bot is in the guild
- Check channel permissions

**"Unknown Channel"**
- Verify channel ID is correct
- Ensure bot has access to channel
- Check Developer Mode is enabled

## Performance

### Rate Limits

- **Slack**: ~1 message per second per channel
- **Discord**: Varies by endpoint (typically 5-50 req/sec)

### Optimization Tips

1. **Batch notifications**: Group related notifications
2. **Use webhooks**: For simple one-way notifications
3. **Cache channel lists**: Don't fetch repeatedly
4. **Handle failures gracefully**: Don't block on errors
5. **Queue messages**: During high load

## Contributing

To add a new integration:

1. Create a new directory: `src/services/integrations/yourplatform/`
2. Implement client class with API methods
3. Implement notifier class for high-level interface
4. Add to IntegrationManager
5. Create UI settings component
6. Add backend routes if needed
7. Write documentation and examples
8. Submit pull request

## License

Part of AgentForge project. See main LICENSE file.

## Support

- 📖 [Detailed Usage Guide](./USAGE.md)
- 💡 [Examples](./examples.ts)
- 🐛 [Report Issues](https://github.com/your-repo/agentforge/issues)
- 💬 [Discord Community](https://discord.gg/agentforge)
- 📧 [Email Support](mailto:support@agentforge.com)

---

**Built with ❤️ for the AgentForge community**
