/**
 * Integration Examples
 * Real-world usage examples for Slack and Discord integrations
 */

import { getIntegrationManager } from './IntegrationManager'
import { SlackClient, SlackNotifier } from './slack'
import { DiscordClient, DiscordNotifier } from './discord'

/**
 * Example 1: Basic Setup with Webhooks
 */
export async function basicWebhookSetup() {
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

  // Send a test notification
  await manager.notifyAll('system', {
    level: 'info',
    title: 'AgentForge Started',
    message: 'AgentForge system is now online',
    timestamp: new Date()
  })

  console.log('✅ Basic setup complete')
}

/**
 * Example 2: Task Lifecycle Notifications
 */
export async function taskLifecycleExample() {
  const manager = getIntegrationManager()

  const taskId = 'task_' + Date.now()
  const startTime = new Date()

  // Task started (optional)
  await manager.notifyAll('system', {
    level: 'info',
    title: 'Task Started',
    message: `Processing CSV file with 10,000 records`,
    timestamp: new Date(),
    source: 'Task Manager'
  })

  // Simulate task execution
  await new Promise(resolve => setTimeout(resolve, 5000))

  // Task completed
  await manager.notifyAll('task_complete', {
    id: taskId,
    title: 'Process CSV File',
    description: 'Successfully processed 10,000 records',
    status: 'completed',
    agentId: 'agent_1',
    agentName: 'CSV Processor',
    startTime,
    endTime: new Date()
  })

  console.log('✅ Task lifecycle notifications sent')
}

/**
 * Example 3: Agent Status Monitoring
 */
export async function agentMonitoringExample() {
  const manager = getIntegrationManager()

  const agents = [
    {
      id: 'agent_1',
      name: 'Data Processor',
      status: 'working' as const,
      level: 5,
      currentTask: 'Processing batch #42',
      health: 95,
      energy: 80
    },
    {
      id: 'agent_2',
      name: 'API Monitor',
      status: 'idle' as const,
      level: 3,
      health: 100,
      energy: 100
    }
  ]

  // Send status for each agent
  for (const agent of agents) {
    await manager.notifyAll('agent_idle', agent)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('✅ Agent status updates sent')
}

/**
 * Example 4: Achievement System
 */
export async function achievementSystemExample() {
  const manager = getIntegrationManager()

  const achievements = [
    {
      title: 'First Steps',
      description: 'Completed your first task',
      icon: '🎯'
    },
    {
      title: 'Task Master',
      description: 'Completed 100 tasks',
      icon: '🏆'
    },
    {
      title: 'Speed Demon',
      description: 'Completed a task in under 1 minute',
      icon: '⚡'
    }
  ]

  for (const achievement of achievements) {
    await manager.notifyAll('achievement', achievement)
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log('✅ Achievement notifications sent')
}

/**
 * Example 5: Daily Summary Report
 */
export async function dailySummaryExample() {
  const manager = getIntegrationManager()

  // Calculate daily statistics
  const stats = {
    totalTasks: 150,
    completedTasks: 142,
    failedTasks: 8,
    activeAgents: 5,
    totalAgents: 10,
    topAgent: {
      name: 'Data Processor',
      tasksCompleted: 45
    }
  }

  await manager.sendDailySummary(stats)

  console.log('✅ Daily summary sent')
}

/**
 * Example 6: Error Handling and Alerts
 */
export async function errorHandlingExample() {
  const manager = getIntegrationManager()

  const errorLevels = ['info', 'warning', 'error', 'critical'] as const

  for (const level of errorLevels) {
    await manager.notifyAll('system', {
      level,
      title: `${level.toUpperCase()} Alert`,
      message: `This is a ${level} level alert for testing`,
      timestamp: new Date(),
      source: 'Error Handler'
    })
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  console.log('✅ Error alerts sent')
}

/**
 * Example 7: Slack-specific Features
 */
export async function slackSpecificExample() {
  const manager = getIntegrationManager()
  const slackClient = manager.getSlackClient()
  const slackNotifier = manager.getSlackNotifier()

  if (!slackClient || !slackNotifier) {
    console.log('⚠️  Slack not configured')
    return
  }

  // List available channels
  const channels = await slackClient.listChannels()
  console.log('Available channels:', channels.map(c => c.name))

  // Send message with rich formatting
  await slackClient.postMessage({
    channel: '#agentforge',
    text: 'Task Status Update',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📊 Task Status Update'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*In Progress:* 5 tasks\n*Completed:* 142 tasks\n*Failed:* 8 tasks'
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Need more details? Check the dashboard.'
        }
      }
    ]
  })

  console.log('✅ Slack-specific features demonstrated')
}

/**
 * Example 8: Discord-specific Features
 */
export async function discordSpecificExample() {
  const manager = getIntegrationManager()
  const discordClient = manager.getDiscordClient()
  const discordNotifier = manager.getDiscordNotifier()

  if (!discordClient || !discordNotifier) {
    console.log('⚠️  Discord not configured')
    return
  }

  // Get guild information
  const guild = await discordClient.getGuild()
  console.log('Guild:', guild.name)

  // Send rich embed
  const embed = discordClient.createEmbed({
    title: '📊 System Statistics',
    description: 'Current system status and metrics',
    color: 'info',
    fields: [
      { name: 'Active Agents', value: '5/10', inline: true },
      { name: 'Tasks Today', value: '150', inline: true },
      { name: 'Success Rate', value: '94.7%', inline: true },
      { name: 'Uptime', value: '99.9%', inline: true }
    ],
    footer: 'AgentForge Dashboard',
    timestamp: true
  })

  await discordClient.sendMessage(discordNotifier.getDefaultChannel(), {
    embeds: [embed]
  })

  // Send progress bar
  await discordNotifier.sendProgress(
    'Data Migration',
    65,
    'Migrating records: 6,500/10,000'
  )

  console.log('✅ Discord-specific features demonstrated')
}

/**
 * Example 9: Custom Command Handlers
 */
export async function customCommandExample() {
  const manager = getIntegrationManager()
  const slackClient = manager.getSlackClient()

  if (!slackClient) {
    console.log('⚠️  Slack not configured')
    return
  }

  const { SlackCommandsHandler } = await import('./slack')
  const handler = new SlackCommandsHandler(slackClient)

  // Register custom command
  handler.register({
    name: 'deploy',
    description: 'Deploy an agent to production',
    usage: '/agentforge deploy <agent_id> [environment]',
    handler: async (command, args) => {
      const agentId = args[0]
      const environment = args[1] || 'production'

      // Simulate deployment
      return {
        response_type: 'in_channel',
        text: `🚀 Deploying agent \`${agentId}\` to \`${environment}\`...`,
        attachments: [
          {
            color: '#36a64f',
            text: 'Deployment initiated. You will be notified when complete.',
            footer: 'AgentForge Deployment',
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      }
    }
  })

  console.log('✅ Custom command registered')
}

/**
 * Example 10: Integration with NotificationService
 */
export async function notificationServiceIntegration() {
  const manager = getIntegrationManager()
  const { notificationService } = await import('../notificationService')

  // Hook into notification service
  const originalShow = notificationService.show.bind(notificationService)
  notificationService.show = async function(options) {
    // Call original notification
    await originalShow(options)

    // Also send to integrations
    const data = {
      id: options.taskId || 'unknown',
      title: options.title,
      description: options.message,
      status: options.type === 'task_complete' ? 'completed' : 'failed',
      agentId: options.agentId || 'unknown',
      agentName: options.agentId || 'Unknown Agent'
    }

    await manager.notifyAll(options.type, data)
  }

  console.log('✅ Integration with NotificationService complete')
}

/**
 * Example 11: Scheduled Reports
 */
export async function scheduledReportsExample() {
  const manager = getIntegrationManager()

  // Schedule daily report at 9 AM
  const scheduleTime = new Date()
  scheduleTime.setHours(9, 0, 0, 0)

  const now = new Date()
  const delay = scheduleTime.getTime() - now.getTime()

  if (delay > 0) {
    setTimeout(async () => {
      await manager.sendDailySummary({
        totalTasks: Math.floor(Math.random() * 200),
        completedTasks: Math.floor(Math.random() * 180),
        failedTasks: Math.floor(Math.random() * 20),
        activeAgents: Math.floor(Math.random() * 10),
        totalAgents: 10,
        topAgent: {
          name: 'Agent Alpha',
          tasksCompleted: Math.floor(Math.random() * 50)
        }
      })

      console.log('✅ Daily report sent')
    }, delay)

    console.log(`📅 Daily report scheduled for ${scheduleTime.toLocaleString()}`)
  }
}

/**
 * Example 12: Testing All Connections
 */
export async function testAllConnections() {
  const manager = getIntegrationManager()

  console.log('🔍 Testing integrations...')

  const results = await manager.testConnections()

  console.log('\n📊 Test Results:')
  console.log('─'.repeat(50))

  if (results.slack) {
    if (results.slack.success) {
      console.log('✅ Slack: Connected')
    } else {
      console.log(`❌ Slack: Failed - ${results.slack.error}`)
    }
  } else {
    console.log('⚪ Slack: Not configured')
  }

  if (results.discord) {
    if (results.discord.success) {
      console.log('✅ Discord: Connected')
    } else {
      console.log(`❌ Discord: Failed - ${results.discord.error}`)
    }
  } else {
    console.log('⚪ Discord: Not configured')
  }

  console.log('─'.repeat(50))
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('🚀 Running all integration examples...\n')

  const examples = [
    { name: 'Basic Setup', fn: basicWebhookSetup },
    { name: 'Task Lifecycle', fn: taskLifecycleExample },
    { name: 'Agent Monitoring', fn: agentMonitoringExample },
    { name: 'Achievement System', fn: achievementSystemExample },
    { name: 'Daily Summary', fn: dailySummaryExample },
    { name: 'Error Handling', fn: errorHandlingExample },
    { name: 'Slack Features', fn: slackSpecificExample },
    { name: 'Discord Features', fn: discordSpecificExample },
    { name: 'Custom Commands', fn: customCommandExample },
    { name: 'Test Connections', fn: testAllConnections }
  ]

  for (const example of examples) {
    console.log(`\n📝 ${example.name}`)
    console.log('─'.repeat(50))
    try {
      await example.fn()
    } catch (error: any) {
      console.error(`❌ Error: ${error.message}`)
    }
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log('\n✅ All examples completed!')
}

// Export for easy testing
export default {
  basicWebhookSetup,
  taskLifecycleExample,
  agentMonitoringExample,
  achievementSystemExample,
  dailySummaryExample,
  errorHandlingExample,
  slackSpecificExample,
  discordSpecificExample,
  customCommandExample,
  notificationServiceIntegration,
  scheduledReportsExample,
  testAllConnections,
  runAllExamples
}
