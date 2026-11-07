import { createHmac } from 'crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AgentItem } from '../../../types'
import { useBuildStore } from '../../../stores/buildStore'
import { useTaskStore } from '../../../stores/taskStore'
import { DiscordClient, DiscordNotifier } from '../discord'
import { DiscordCommandsHandler } from '../discord/DiscordCommands'
import {
  IntegrationManager,
  getIntegrationManager,
  resetIntegrationManager,
} from '../IntegrationManager'
import { SlackClient, SlackNotifier } from '../slack'
import { SlackCommandsHandler } from '../slack/SlackCommands'

const payload = {
  ok: true,
  ts: '1.0',
  channels: [{ id: 'C1', name: 'general' }],
  channel: { id: 'C1', name: 'general' },
  user: { id: 'U1', name: 'ada' },
  access_token: 'xoxb-token',
  id: '1',
  username: 'bot',
  name: 'guild',
}

vi.mock('axios', () => {
  const api = {
    post: vi.fn(() => Promise.resolve({ data: payload })),
    get: vi.fn(() => Promise.resolve({ data: payload })),
    patch: vi.fn(() => Promise.resolve({ data: payload })),
    put: vi.fn(() => Promise.resolve({ data: payload })),
    delete: vi.fn(() => Promise.resolve({ data: payload })),
    defaults: { headers: {} as Record<string, string> },
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  }
  const axios = Object.assign(vi.fn(), {
    post: api.post,
    get: api.get,
    create: vi.fn(() => api),
  })
  return { default: axios }
})

const slackConfig = {
  webhookUrl: 'https://hooks.slack.com/services/test',
  botToken: 'xoxb-test',
  signingSecret: 'secret',
  clientId: 'client',
  clientSecret: 'secret',
  redirectUri: 'https://example.com/callback',
}

const discordConfig = {
  webhookUrl: 'https://discord.com/api/webhooks/test',
  botToken: 'bot-token',
  clientId: 'client',
  clientSecret: 'secret',
  publicKey: 'ab',
  guildId: 'guild-1',
}

describe('integration client paths', () => {
  beforeEach(() => {
    useBuildStore.setState({
      inventoryItems: [
        {
          id: 'agent-1',
          path: '/tmp/agent.md',
          name: 'Lina',
          category: 'agents' as AgentItem['category'],
          content: 'agent',
          tokens: 10,
          rarity: 'rare',
          modifiedAt: '2026-01-01T00:00:00.000Z',
          description: 'front line',
        } as AgentItem & { description: string },
      ],
    })
  })

  it('exercises Slack client, notifier, and slash commands', async () => {
    const bare = new SlackClient({})
    await expect(bare.sendWebhook({ text: 'x' })).rejects.toThrow('Webhook URL')
    await expect(bare.postMessage({ text: 'x' })).rejects.toThrow('Bot token')
    expect(() => bare.getAuthorizationUrl()).toThrow('OAuth')
    expect(() => bare.verifySignature('1', '{}', 'v0=aa')).toThrow('Signing secret')

    const client = new SlackClient(slackConfig)
    await client.sendWebhook({ text: 'hello', channel: '#general' })
    await client.postMessage({ text: 'hello', channel: '#general', blocks: [] })
    await client.updateMessage('C1', '1.0', { text: 'edit' })
    await client.deleteMessage('C1', '1.0')
    await client.getUserInfo('U1')
    await client.listChannels(false)
    await client.getChannelInfo('C1')
    await client.joinChannel('C1')
    await client.sendEphemeral('C1', 'U1', 'psst')
    await client.addReaction('C1', '1.0', 'thumbsup')
    expect(client.getAuthorizationUrl('state', ['chat:write'])).toContain('client_id=client')
    await client.exchangeCodeForToken('code')
    const timestamp = String(Math.floor(Date.now() / 1000))
    const body = '{}'
    const signature =
      'v0=' + createHmac('sha256', 'secret').update(`v0:${timestamp}:${body}`).digest('hex')
    expect(client.verifySignature(timestamp, body, signature)).toBe(true)
    expect(client.verifySignature('1', body, signature)).toBe(false)
    client.updateConfig({ botToken: 'xoxb-next' })
    expect(client.getConfig().botToken).toBe('***configured***')
    await expect(client.testConnection()).resolves.toEqual({ success: true })

    const notifier = new SlackNotifier(client)
    notifier.setEnabledNotifications([
      'task_complete',
      'task_failed',
      'level_up',
      'achievement',
      'system',
      'agent_idle',
    ])
    expect(notifier.isEnabled('system')).toBe(true)
    await notifier.notifyAgentStatus({ name: 'Lina', status: 'working', level: 4, currentTask: 'build' } as never)
    await notifier.notifyAgentStatus({ name: 'Lina', status: 'idle', level: 4 } as never)
    await notifier.notifyTaskComplete({ title: 'Ship', agentName: 'Lina', duration: 3, result: 'ok' } as never)
    await notifier.notifyTaskFailed({ title: 'Ship', agentName: 'Lina', error: 'boom' } as never)
    await notifier.notifyLevelUp('Lina', 3, 4)
    await notifier.notifyAchievement('First', 'did it', ':star:')
    await notifier.sendAlert({ level: 'warning', title: 'Disk', message: 'low', source: 'ci', timestamp: new Date() } as never)
    await notifier.sendAlert({ level: 'error', title: 'Disk', message: 'full', source: 'ci', timestamp: new Date() } as never)
    await notifier.sendCustom('hello')
    await notifier.sendDailySummary({
      totalTasks: 4,
      completedTasks: 3,
      failedTasks: 1,
      activeAgents: 1,
      totalAgents: 2,
      topAgent: { name: 'Lina', tasksCompleted: 3 },
    })

    const commands = new SlackCommandsHandler(client)
    const base = {
      command: '/agentforge',
      user_id: 'U1',
      user_name: 'ada',
      channel_id: 'C1',
      channel_name: 'general',
      team_id: 'T1',
      response_url: '',
      trigger_id: '',
    }
    await commands.handle({ ...base, text: 'agent list' })
    await commands.handle({ ...base, text: 'agent status agent-1' })
    await commands.handle({ ...base, text: 'agent status missing' })
    await commands.handle({ ...base, text: 'agent info agent-1' })
    await commands.handle({ ...base, text: 'agent info missing' })
    await commands.handle({ ...base, text: 'agent nope' })
    await commands.handle({ ...base, text: 'task list' })
    await commands.handle({ ...base, text: 'task create write tests' })
    const taskId = useTaskStore.getState().tasks[0]?.id
    await commands.handle({ ...base, text: `task status ${taskId}` })
    await commands.handle({ ...base, text: 'task status missing' })
    await commands.handle({ ...base, text: `task cancel ${taskId}` })
    await commands.handle({ ...base, text: 'task nope' })
    await commands.handle({ ...base, text: 'stats weekly' })
    await commands.handle({ ...base, text: 'help' })
    await commands.handle({ ...base, text: 'help agent' })
    await commands.handle({ ...base, text: 'help missing' })
    await commands.handle({ ...base, text: 'nope' })
  })

  it('exercises Discord client, notifier, commands, and the manager', async () => {
    const bare = new DiscordClient({})
    await expect(bare.sendWebhook({ content: 'x' })).rejects.toThrow('Webhook URL')
    await expect(bare.sendMessage('c', { content: 'x' })).rejects.toThrow('Bot token')
    expect(() => bare.verifySignature('aa', '1', '{}')).toThrow('Public key')

    const client = new DiscordClient(discordConfig)
    await client.sendWebhook({ content: 'hello' })
    await client.sendMessage('c', { content: 'hello' })
    await client.editMessage('c', 'm', { content: 'edit' })
    await client.deleteMessage('c', 'm')
    await client.addReaction('c', 'm', '👍')
    await client.getChannel('c')
    await client.listGuildChannels()
    await client.getGuild()
    await client.getUser('u')
    await client.getCurrentUser()
    await client.createCommand({ name: 'agent', description: 'manage' })
    await client.listCommands()
    await client.deleteCommand('cmd')
    await client.respondToInteraction('i', 't', { type: 4, data: { content: 'ok' } })
    await client.sendFollowup('t', { content: 'later' })
    expect(() => client.verifySignature('zz', '1', '{}')).toThrow(/tweetnacl/)
    expect(client.createEmbed({
      title: 't',
      description: 'd',
      color: 'success',
      fields: [{ name: 'n', value: 'v', inline: true }],
      footer: 'f',
      timestamp: true,
      thumbnail: 'https://example.com/t.png',
      image: 'https://example.com/i.png',
      author: { name: 'ada', icon: 'https://example.com/a.png', url: 'https://example.com' },
    }).title).toBe('t')
    expect(client.createEmbed({ color: 'error' }).color).toBe(0xff0000)
    expect(client.createEmbed({ color: 'warning' }).color).toBe(0xffa500)
    expect(client.createEmbed({ color: 'info' }).color).toBe(0x0099ff)
    expect(client.createEmbed({ color: 5 }).color).toBe(5)
    client.updateConfig({ botToken: 'next' })
    expect(client.getConfig().botToken).toBe('***configured***')
    await expect(client.testConnection()).resolves.toMatchObject({ success: true })

    const notifier = new DiscordNotifier(client, 'channel-1')
    notifier.setEnabledNotifications([
      'task_complete',
      'task_failed',
      'level_up',
      'achievement',
      'system',
      'agent_idle',
    ])
    await notifier.notifyAgentStatus({ name: 'Lina', status: 'working', level: 4, currentTask: 'build' } as never)
    await notifier.notifyAgentStatus({ name: 'Lina', status: 'idle', level: 4 } as never)
    await notifier.notifyTaskComplete({ title: 'Ship', agentName: 'Lina', result: 'ok' } as never)
    await notifier.notifyTaskFailed({ title: 'Ship', agentName: 'Lina', error: 'boom' } as never)
    await notifier.notifyLevelUp('Lina', 3, 4)
    await notifier.notifyAchievement('First', 'did it')
    await notifier.sendAlert({ level: 'critical', title: 'Disk', message: 'full', source: 'ci' } as never)
    await notifier.sendAlert({ level: 'info', title: 'Disk', message: 'ok' } as never)
    await notifier.sendCustom('hello', [{ title: 'e' }])
    await notifier.sendDailySummary({
      totalTasks: 4,
      completedTasks: 3,
      failedTasks: 1,
      activeAgents: 1,
      totalAgents: 2,
      topAgent: { name: 'Lina', tasksCompleted: 3 },
    })
    await notifier.sendLeaderboard([{ name: 'Lina', level: 4, tasksCompleted: 3 }])
    await notifier.sendProgress('Ship', 40, 'running')

    const commands = new DiscordCommandsHandler(client)
    await commands.registerCommands()
    await commands.registerCommands()
    const interaction = (name: string, sub?: string, value?: string) => ({
      type: 2,
      id: 'i',
      token: 't',
      application_id: 'a',
      data: {
        name,
        options: sub ? [{ name: sub, options: value ? [{ name: 'value', value }] : [] }] : [],
      },
    })
    await commands.handle({ type: 1, id: 'i', token: 't', application_id: 'a' } as never)
    for (const call of [
      interaction('agent', 'list'),
      interaction('agent', 'status', 'agent-1'),
      interaction('agent', 'status', 'missing'),
      interaction('agent', 'info', 'agent-1'),
      interaction('agent', 'info', 'missing'),
      interaction('agent', 'nope'),
      interaction('task', 'list'),
      interaction('task', 'create', 'write tests'),
      interaction('task', 'status', useTaskStore.getState().tasks[0]?.id),
      interaction('task', 'status', 'missing'),
      interaction('task', 'cancel', useTaskStore.getState().tasks[0]?.id),
      interaction('task', 'nope'),
      interaction('stats', 'period', 'weekly'),
      interaction('help'),
      interaction('missing'),
    ]) {
      await commands.handle(call as never)
    }

    resetIntegrationManager()
    localStorage.setItem('integration-config', '{')
    expect(IntegrationManager.loadConfig()).toEqual({})
    localStorage.setItem('integration-config', JSON.stringify({ slack: { enabled: false } }))
    const loaded = getIntegrationManager()
    expect(loaded.isSlackEnabled()).toBe(false)
    resetIntegrationManager()

    const manager = new IntegrationManager({
      slack: { enabled: true, ...slackConfig, enabledNotifications: ['task_complete', 'task_failed', 'level_up', 'achievement', 'system', 'agent_idle'] },
      discord: { enabled: true, ...discordConfig, defaultChannelId: 'c', enabledNotifications: ['task_complete', 'task_failed', 'level_up', 'achievement', 'system', 'agent_idle'] },
    })
    expect(manager.isSlackEnabled()).toBe(true)
    expect(manager.isDiscordEnabled()).toBe(true)
    expect(manager.getSlackClient()).toBeDefined()
    expect(manager.getDiscordNotifier()).toBeDefined()
    const task = { title: 'Ship', agentName: 'Lina', result: 'ok', error: 'boom' }
    for (const type of ['task_complete', 'task_failed', 'level_up', 'achievement', 'system', 'agent_idle'] as const) {
      await manager.notifyAll(type, {
        ...task,
        agentName: 'Lina',
        oldLevel: 3,
        newLevel: 4,
        title: 'First',
        description: 'did it',
        level: 'warning',
        message: 'low',
        name: 'Lina',
        status: 'working',
      })
    }
    await manager.testConnections()
    await manager.sendDailySummary({
      totalTasks: 4,
      completedTasks: 3,
      failedTasks: 1,
      activeAgents: 1,
      totalAgents: 2,
      topAgent: { name: 'Lina', tasksCompleted: 3 },
    })
    manager.updateConfig({ slack: { enabled: false }, discord: { enabled: false } })
    expect(manager.getConfig().slack?.enabled).toBe(false)
    expect(manager.isSlackEnabled()).toBe(false)
    expect(manager.isDiscordEnabled()).toBe(false)
  })
})
