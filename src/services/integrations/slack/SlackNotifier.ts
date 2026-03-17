/**
 * Slack Notifier
 * High-level notification interface for AgentForge events
 */

import { SlackClient, SlackMessage, SlackAttachment, SlackBlock } from './SlackClient'
import type { NotificationType } from '../../notificationService'

export interface AgentStatus {
  id: string
  name: string
  status: 'idle' | 'working' | 'error'
  level: number
  currentTask?: string
  health: number
  energy: number
}

export interface TaskInfo {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  agentId: string
  agentName: string
  startTime?: Date
  endTime?: Date
  error?: string
}

export interface SystemAlert {
  level: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  timestamp: Date
  source?: string
}

export class SlackNotifier {
  private client: SlackClient
  private defaultChannel: string
  private enabledNotifications: Set<NotificationType>

  constructor(client: SlackClient, defaultChannel = '#agentforge') {
    this.client = client
    this.defaultChannel = defaultChannel
    this.enabledNotifications = new Set([
      'task_complete',
      'task_failed',
      'level_up',
      'achievement',
      'system'
    ])
  }

  /**
   * Set enabled notification types
   */
  setEnabledNotifications(types: NotificationType[]): void {
    this.enabledNotifications = new Set(types)
  }

  /**
   * Check if notification type is enabled
   */
  isEnabled(type: NotificationType): boolean {
    return this.enabledNotifications.has(type)
  }

  /**
   * Notify agent status change
   */
  async notifyAgentStatus(agent: AgentStatus): Promise<void> {
    if (!this.isEnabled('system')) return

    const statusEmoji = {
      idle: ':sleeping:',
      working: ':hammer_and_wrench:',
      error: ':x:'
    }

    const statusColor = {
      idle: '#808080',
      working: '#36a64f',
      error: '#ff0000'
    }

    const fields = [
      { title: 'Level', value: agent.level.toString(), short: true },
      { title: 'Health', value: `${agent.health}%`, short: true },
      { title: 'Energy', value: `${agent.energy}%`, short: true },
      { title: 'Status', value: agent.status, short: true }
    ]

    if (agent.currentTask) {
      fields.push({ title: 'Current Task', value: agent.currentTask, short: false })
    }

    const message: SlackMessage = {
      text: `Agent status update: ${agent.name}`,
      channel: this.defaultChannel,
      attachments: [
        {
          color: statusColor[agent.status],
          title: `${statusEmoji[agent.status]} ${agent.name}`,
          text: `Status changed to: ${agent.status}`,
          fields,
          footer: 'AgentForge',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    }

    await this.send(message)
  }

  /**
   * Notify task completion
   */
  async notifyTaskComplete(task: TaskInfo): Promise<void> {
    if (!this.isEnabled('task_complete')) return

    const duration = task.endTime && task.startTime
      ? Math.round((task.endTime.getTime() - task.startTime.getTime()) / 1000)
      : null

    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '✅ Task Completed',
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${task.title}*\n${task.description}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Agent:* ${task.agentName}\n*Task ID:* \`${task.id}\`${duration ? `\n*Duration:* ${duration}s` : ''}`
        }
      }
    ]

    const message: SlackMessage = {
      text: `Task completed: ${task.title}`,
      channel: this.defaultChannel,
      blocks
    }

    await this.send(message)
  }

  /**
   * Notify task failure
   */
  async notifyTaskFailed(task: TaskInfo): Promise<void> {
    if (!this.isEnabled('task_failed')) return

    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '❌ Task Failed',
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${task.title}*\n${task.description}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Agent:* ${task.agentName}\n*Task ID:* \`${task.id}\`\n*Error:* ${task.error || 'Unknown error'}`
        }
      }
    ]

    const message: SlackMessage = {
      text: `Task failed: ${task.title}`,
      channel: this.defaultChannel,
      blocks
    }

    await this.send(message)
  }

  /**
   * Notify level up
   */
  async notifyLevelUp(agentName: string, oldLevel: number, newLevel: number): Promise<void> {
    if (!this.isEnabled('level_up')) return

    const message: SlackMessage = {
      text: `${agentName} leveled up!`,
      channel: this.defaultChannel,
      attachments: [
        {
          color: '#FFD700',
          title: '🎉 Level Up!',
          text: `*${agentName}* has reached level ${newLevel}!`,
          fields: [
            { title: 'Previous Level', value: oldLevel.toString(), short: true },
            { title: 'New Level', value: newLevel.toString(), short: true }
          ],
          footer: 'AgentForge',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    }

    await this.send(message)
  }

  /**
   * Notify achievement unlocked
   */
  async notifyAchievement(title: string, description: string, icon?: string): Promise<void> {
    if (!this.isEnabled('achievement')) return

    const message: SlackMessage = {
      text: `Achievement unlocked: ${title}`,
      channel: this.defaultChannel,
      attachments: [
        {
          color: '#9C27B0',
          title: `🏆 ${title}`,
          text: description,
          thumb_url: icon,
          footer: 'AgentForge',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    }

    await this.send(message)
  }

  /**
   * Send system alert
   */
  async sendAlert(alert: SystemAlert): Promise<void> {
    if (!this.isEnabled('system')) return

    const levelEmoji = {
      info: ':information_source:',
      warning: ':warning:',
      error: ':x:',
      critical: ':rotating_light:'
    }

    const levelColor = {
      info: '#2196F3',
      warning: '#FF9800',
      error: '#F44336',
      critical: '#000000'
    }

    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${levelEmoji[alert.level]} ${alert.title}`,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: alert.message
        }
      }
    ]

    if (alert.source) {
      blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `*Source:* ${alert.source} | *Time:* ${alert.timestamp.toLocaleString()}`
          }
        ]
      })
    }

    const message: SlackMessage = {
      text: `${alert.level.toUpperCase()}: ${alert.title}`,
      channel: this.defaultChannel,
      blocks
    }

    // For critical alerts, also mention @channel
    if (alert.level === 'critical') {
      message.text = `<!channel> ${message.text}`
    }

    await this.send(message)
  }

  /**
   * Send custom message
   */
  async sendCustom(text: string, attachments?: SlackAttachment[], blocks?: SlackBlock[]): Promise<void> {
    const message: SlackMessage = {
      text,
      channel: this.defaultChannel,
      attachments,
      blocks
    }

    await this.send(message)
  }

  /**
   * Send daily summary
   */
  async sendDailySummary(data: {
    totalTasks: number
    completedTasks: number
    failedTasks: number
    activeAgents: number
    totalAgents: number
    topAgent?: { name: string; tasksCompleted: number }
  }): Promise<void> {
    const successRate = data.totalTasks > 0
      ? Math.round((data.completedTasks / data.totalTasks) * 100)
      : 0

    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📊 Daily Summary',
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Tasks*\nTotal: ${data.totalTasks} | Completed: ${data.completedTasks} | Failed: ${data.failedTasks}\nSuccess Rate: ${successRate}%`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Agents*\nActive: ${data.activeAgents} / ${data.totalAgents}`
        }
      }
    ]

    if (data.topAgent) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*🌟 Top Performer*\n${data.topAgent.name} - ${data.topAgent.tasksCompleted} tasks completed`
        }
      })
    }

    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Generated by AgentForge | ${new Date().toLocaleDateString()}`
        }
      ]
    })

    const message: SlackMessage = {
      text: 'Daily Summary',
      channel: this.defaultChannel,
      blocks
    }

    await this.send(message)
  }

  /**
   * Internal send method
   */
  private async send(message: SlackMessage): Promise<void> {
    try {
      // Try API first, fallback to webhook
      try {
        await this.client.postMessage(message)
      } catch {
        await this.client.sendWebhook(message)
      }
    } catch (error) {
      console.error('Failed to send Slack notification:', error)
      // Don't throw - we don't want to break the app if Slack fails
    }
  }

  /**
   * Set default channel
   */
  setDefaultChannel(channel: string): void {
    this.defaultChannel = channel
  }

  /**
   * Get default channel
   */
  getDefaultChannel(): string {
    return this.defaultChannel
  }
}
