/**
 * Integration Tests
 * Test suite for Slack and Discord integrations
 */

import { SlackClient, SlackNotifier } from '../slack'
import { DiscordClient, DiscordNotifier } from '../discord'
import { IntegrationManager, getIntegrationManager } from '../IntegrationManager'

describe('Slack Integration', () => {
  describe('SlackClient', () => {
    it('should create client with webhook URL', () => {
      const client = new SlackClient({
        webhookUrl: 'https://hooks.slack.com/services/test'
      })
      expect(client).toBeDefined()
    })

    it('should create client with bot token', () => {
      const client = new SlackClient({
        botToken: 'xoxb-test-token'
      })
      expect(client).toBeDefined()
    })

    it('should update configuration', () => {
      const client = new SlackClient({})
      client.updateConfig({ webhookUrl: 'https://hooks.slack.com/services/test' })
      const config = client.getConfig()
      expect(config.webhookUrl).toBe('***configured***')
    })

    it('should generate OAuth URL', () => {
      const client = new SlackClient({
        clientId: 'test-client-id',
        redirectUri: 'https://example.com/callback'
      })
      const url = client.getAuthorizationUrl('test-state')
      expect(url).toContain('slack.com/oauth/v2/authorize')
      expect(url).toContain('client_id=test-client-id')
      expect(url).toContain('state=test-state')
    })
  })

  describe('SlackNotifier', () => {
    let client: SlackClient
    let notifier: SlackNotifier

    beforeEach(() => {
      client = new SlackClient({ webhookUrl: 'https://hooks.slack.com/services/test' })
      notifier = new SlackNotifier(client, '#test')
    })

    it('should create notifier', () => {
      expect(notifier).toBeDefined()
    })

    it('should set and get default channel', () => {
      notifier.setDefaultChannel('#new-channel')
      expect(notifier.getDefaultChannel()).toBe('#new-channel')
    })

    it('should enable/disable notification types', () => {
      notifier.setEnabledNotifications(['task_complete', 'level_up'])
      expect(notifier.isEnabled('task_complete')).toBe(true)
      expect(notifier.isEnabled('level_up')).toBe(true)
      expect(notifier.isEnabled('task_failed')).toBe(false)
    })
  })
})

describe('Discord Integration', () => {
  describe('DiscordClient', () => {
    it('should create client with webhook URL', () => {
      const client = new DiscordClient({
        webhookUrl: 'https://discord.com/api/webhooks/test'
      })
      expect(client).toBeDefined()
    })

    it('should create client with bot token', () => {
      const client = new DiscordClient({
        botToken: 'test-bot-token'
      })
      expect(client).toBeDefined()
    })

    it('should create embed', () => {
      const client = new DiscordClient({})
      const embed = client.createEmbed({
        title: 'Test',
        description: 'Test embed',
        color: 'success',
        fields: [
          { name: 'Field 1', value: 'Value 1' }
        ],
        footer: 'Test footer',
        timestamp: true
      })

      expect(embed.title).toBe('Test')
      expect(embed.description).toBe('Test embed')
      expect(embed.color).toBe(0x00ff00) // success color
      expect(embed.fields).toHaveLength(1)
      expect(embed.footer?.text).toBe('Test footer')
      expect(embed.timestamp).toBeDefined()
    })

    it('should update configuration', () => {
      const client = new DiscordClient({})
      client.updateConfig({ webhookUrl: 'https://discord.com/api/webhooks/test' })
      const config = client.getConfig()
      expect(config.webhookUrl).toBe('***configured***')
    })
  })

  describe('DiscordNotifier', () => {
    let client: DiscordClient
    let notifier: DiscordNotifier

    beforeEach(() => {
      client = new DiscordClient({ webhookUrl: 'https://discord.com/api/webhooks/test' })
      notifier = new DiscordNotifier(client, '1234567890')
    })

    it('should create notifier', () => {
      expect(notifier).toBeDefined()
    })

    it('should set and get default channel', () => {
      notifier.setDefaultChannel('9876543210')
      expect(notifier.getDefaultChannel()).toBe('9876543210')
    })

    it('should enable/disable notification types', () => {
      notifier.setEnabledNotifications(['task_complete', 'level_up'])
      expect(notifier.isEnabled('task_complete')).toBe(true)
      expect(notifier.isEnabled('level_up')).toBe(true)
      expect(notifier.isEnabled('task_failed')).toBe(false)
    })
  })
})

describe('Integration Manager', () => {
  let manager: IntegrationManager

  beforeEach(() => {
    manager = new IntegrationManager({
      slack: {
        enabled: true,
        webhookUrl: 'https://hooks.slack.com/services/test',
        defaultChannel: '#test'
      },
      discord: {
        enabled: true,
        webhookUrl: 'https://discord.com/api/webhooks/test',
        defaultChannelId: '1234567890'
      }
    })
  })

  it('should create manager', () => {
    expect(manager).toBeDefined()
  })

  it('should check if platforms are enabled', () => {
    expect(manager.isSlackEnabled()).toBe(true)
    expect(manager.isDiscordEnabled()).toBe(true)
  })

  it('should get clients', () => {
    expect(manager.getSlackClient()).toBeDefined()
    expect(manager.getSlackNotifier()).toBeDefined()
    expect(manager.getDiscordClient()).toBeDefined()
    expect(manager.getDiscordNotifier()).toBeDefined()
  })

  it('should update configuration', () => {
    manager.updateConfig({
      slack: {
        enabled: false
      }
    })

    const config = manager.getConfig()
    expect(config.slack?.enabled).toBe(false)
  })

  it('should load and save configuration', () => {
    const config = {
      slack: {
        enabled: true,
        webhookUrl: 'https://hooks.slack.com/services/new-test'
      }
    }

    manager.updateConfig(config)
    const savedConfig = manager.getConfig()
    expect(savedConfig.slack?.webhookUrl).toBe('https://hooks.slack.com/services/new-test')
  })
})

describe('Global Integration Manager', () => {
  it('should get global instance', () => {
    const manager1 = getIntegrationManager()
    const manager2 = getIntegrationManager()
    expect(manager1).toBe(manager2) // Same instance
  })
})

// Mock tests for actual API calls
describe('Integration API Calls (Mocked)', () => {
  it('should send Slack webhook (mock)', async () => {
    const client = new SlackClient({
      webhookUrl: 'https://hooks.slack.com/services/test'
    })

    // Mock axios
    const axios = require('axios')
    axios.post = jest.fn().mockResolvedValue({ data: { ok: true } })

    await expect(client.sendWebhook({ text: 'Test message' })).resolves.toBeUndefined()
  })

  it('should send Discord webhook (mock)', async () => {
    const client = new DiscordClient({
      webhookUrl: 'https://discord.com/api/webhooks/test'
    })

    // Mock axios
    const axios = require('axios')
    axios.post = jest.fn().mockResolvedValue({ data: { id: '123' } })

    await expect(client.sendWebhook({ content: 'Test message' })).resolves.toBeUndefined()
  })
})

describe('Notification Data Structures', () => {
  it('should validate task data structure', () => {
    const taskData = {
      id: 'task_123',
      title: 'Test Task',
      description: 'Test Description',
      status: 'completed' as const,
      agentId: 'agent_1',
      agentName: 'Test Agent',
      startTime: new Date(),
      endTime: new Date()
    }

    expect(taskData.id).toBeDefined()
    expect(taskData.title).toBeDefined()
    expect(taskData.status).toBe('completed')
  })

  it('should validate alert data structure', () => {
    const alertData = {
      level: 'warning' as const,
      title: 'Test Alert',
      message: 'Test message',
      timestamp: new Date(),
      source: 'Test'
    }

    expect(alertData.level).toBe('warning')
    expect(alertData.timestamp).toBeInstanceOf(Date)
  })
})

describe('Error Handling', () => {
  it('should handle missing webhook URL', async () => {
    const client = new SlackClient({})
    await expect(client.sendWebhook({ text: 'test' }))
      .rejects.toThrow('Webhook URL not configured')
  })

  it('should handle missing bot token', async () => {
    const client = new SlackClient({})
    await expect(client.postMessage({ text: 'test', channel: '#test' }))
      .rejects.toThrow('Bot token not configured')
  })

  it('should handle missing OAuth config', () => {
    const client = new SlackClient({})
    expect(() => client.getAuthorizationUrl())
      .toThrow('OAuth not configured')
  })
})

describe('Configuration Validation', () => {
  it('should mask sensitive data in config', () => {
    const client = new SlackClient({
      webhookUrl: 'https://hooks.slack.com/services/secret',
      botToken: 'xoxb-secret-token'
    })

    const config = client.getConfig()
    expect(config.webhookUrl).toBe('***configured***')
    expect(config.botToken).toBe('***configured***')
  })

  it('should preserve non-sensitive data', () => {
    const client = new SlackClient({
      clientId: 'test-client-id',
      redirectUri: 'https://example.com/callback'
    })

    const config = client.getConfig()
    expect(config.clientId).toBe('test-client-id')
    expect(config.redirectUri).toBe('https://example.com/callback')
  })
})
