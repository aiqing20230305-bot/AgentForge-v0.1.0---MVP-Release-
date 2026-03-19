/**
 * Discord Notifier
 * High-level notification interface for AgentForge events
 */

import { DiscordClient, DiscordMessage, DiscordEmbed } from './DiscordClient'
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

export class DiscordNotifier {
  private client: DiscordClient
  private defaultChannelId: string
  private enabledNotifications: Set<NotificationType>

  constructor(client: DiscordClient, defaultChannelId: string) {
    this.client = client
    this.defaultChannelId = defaultChannelId
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
      idle: '😴',
      working: '🔨',
      error: '❌'
    }

    const statusColor = {
      idle: 0x808080,
      working: 0x00ff00,
      error: 0xff0000
    }

    const embed = this.client.createEmbed({
      title: `${statusEmoji[agent.status]} ${agent.name}`,
      description: `Status changed to: **${agent.status}**`,
      color: statusColor[agent.status],
      fields: [
        { name: 'Level', value: agent.level.toString(), inline: true },
        { name: 'Health', value: `${agent.health}%`, inline: true },
        { name: 'Energy', value: `${agent.energy}%`, inline: true }
      ],
      footer: 'AgentForge',
      timestamp: true
    })

    if (agent.currentTask) {
      embed.fields!.push({
        name: 'Current Task',
        value: agent.currentTask,
        inline: false
      })
    }

    await this.send({ embeds: [embed] })
  }

  /**
   * Notify task completion
   */
  async notifyTaskComplete(task: TaskInfo): Promise<void> {
    if (!this.isEnabled('task_complete')) return

    const duration = task.endTime && task.startTime
      ? Math.round((task.endTime.getTime() - task.startTime.getTime()) / 1000)
      : null

    const fields = [
      { name: 'Agent', value: task.agentName, inline: true },
      { name: 'Task ID', value: `\`${task.id}\``, inline: true }
    ]

    if (duration !== null) {
      fields.push({ name: 'Duration', value: `${duration}s`, inline: true })
    }

    const embed = this.client.createEmbed({
      title: '✅ Task Completed',
      description: `**${task.title}**\n${task.description}`,
      color: 'success',
      fields,
      footer: 'AgentForge',
      timestamp: true
    })

    await this.send({ embeds: [embed] })
  }

  /**
   * Notify task failure
   */
  async notifyTaskFailed(task: TaskInfo): Promise<void> {
    if (!this.isEnabled('task_failed')) return

    const embed = this.client.createEmbed({
      title: '❌ Task Failed',
      description: `**${task.title}**\n${task.description}`,
      color: 'error',
      fields: [
        { name: 'Agent', value: task.agentName, inline: true },
        { name: 'Task ID', value: `\`${task.id}\``, inline: true },
        { name: 'Error', value: task.error || 'Unknown error', inline: false }
      ],
      footer: 'AgentForge',
      timestamp: true
    })

    await this.send({ embeds: [embed] })
  }

  /**
   * Notify level up
   */
  async notifyLevelUp(agentName: string, oldLevel: number, newLevel: number): Promise<void> {
    if (!this.isEnabled('level_up')) return

    const embed = this.client.createEmbed({
      title: '🎉 Level Up!',
      description: `**${agentName}** has reached level **${newLevel}**!`,
      color: 0xffd700,
      fields: [
        { name: 'Previous Level', value: oldLevel.toString(), inline: true },
        { name: 'New Level', value: newLevel.toString(), inline: true }
      ],
      footer: 'AgentForge',
      timestamp: true
    })

    await this.send({ embeds: [embed] })
  }

  /**
   * Notify achievement unlocked
   */
  async notifyAchievement(title: string, description: string, icon?: string): Promise<void> {
    if (!this.isEnabled('achievement')) return

    const embed = this.client.createEmbed({
      title: `🏆 ${title}`,
      description,
      color: 0x9c27b0,
      thumbnail: icon,
      footer: 'AgentForge',
      timestamp: true
    })

    await this.send({ embeds: [embed] })
  }

  /**
   * Send system alert
   */
  async sendAlert(alert: SystemAlert): Promise<void> {
    if (!this.isEnabled('system')) return

    const levelEmoji = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      critical: '🚨'
    }

    const levelColor = {
      info: 0x2196f3,
      warning: 0xff9800,
      error: 0xf44336,
      critical: 0x000000
    }

    const embed = this.client.createEmbed({
      title: `${levelEmoji[alert.level]} ${alert.title}`,
      description: alert.message,
      color: levelColor[alert.level],
      footer: alert.source || 'AgentForge',
      timestamp: true
    })

    const message: DiscordMessage = {
      embeds: [embed]
    }

    // For critical alerts, mention @everyone
    if (alert.level === 'critical') {
      message.content = '@everyone'
      message.allowed_mentions = { parse: ['everyone'] }
    }

    await this.send(message)
  }

  /**
   * Send custom message
   */
  async sendCustom(content?: string, embeds?: DiscordEmbed[]): Promise<void> {
    await this.send({ content, embeds })
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

    const fields = [
      { name: 'Total Tasks', value: data.totalTasks.toString(), inline: true },
      { name: 'Completed', value: data.completedTasks.toString(), inline: true },
      { name: 'Failed', value: data.failedTasks.toString(), inline: true },
      { name: 'Success Rate', value: `${successRate}%`, inline: true },
      { name: 'Active Agents', value: `${data.activeAgents}/${data.totalAgents}`, inline: true }
    ]

    if (data.topAgent) {
      fields.push({
        name: '🌟 Top Performer',
        value: `${data.topAgent.name} - ${data.topAgent.tasksCompleted} tasks`,
        inline: false
      })
    }

    const embed = this.client.createEmbed({
      title: '📊 Daily Summary',
      description: `Summary for ${new Date().toLocaleDateString()}`,
      color: 'info',
      fields,
      footer: 'AgentForge',
      timestamp: true
    })

    await this.send({ embeds: [embed] })
  }

  /**
   * Send agent leaderboard
   */
  async sendLeaderboard(agents: Array<{ name: string; level: number; tasksCompleted: number }>): Promise<void> {
    const medals = ['🥇', '🥈', '🥉']

    const description = agents
      .slice(0, 10)
      .map((agent, index) => {
        const medal = index < 3 ? medals[index] : `${index + 1}.`
        return `${medal} **${agent.name}** - Level ${agent.level} (${agent.tasksCompleted} tasks)`
      })
      .join('\n')

    const embed = this.client.createEmbed({
      title: '🏆 Agent Leaderboard',
      description: description || 'No agents yet',
      color: 0xffd700,
      footer: 'AgentForge',
      timestamp: true
    })

    await this.send({ embeds: [embed] })
  }

  /**
   * Send progress update
   */
  async sendProgress(taskTitle: string, progress: number, status: string): Promise<void> {
    const progressBar = this.createProgressBar(progress)

    const embed = this.client.createEmbed({
      title: '📈 Progress Update',
      description: `**${taskTitle}**\n${progressBar} ${progress}%\n\n*${status}*`,
      color: 'info',
      footer: 'AgentForge',
      timestamp: true
    })

    await this.send({ embeds: [embed] })
  }

  /**
   * Create progress bar
   */
  private createProgressBar(progress: number): string {
    const filled = Math.floor(progress / 10)
    const empty = 10 - filled
    return '█'.repeat(filled) + '░'.repeat(empty)
  }

  /**
   * Internal send method
   */
  private async send(message: DiscordMessage): Promise<void> {
    try {
      // Try API first, fallback to webhook
      try {
        await this.client.sendMessage(this.defaultChannelId, message)
      } catch {
        await this.client.sendWebhook(message)
      }
    } catch (error) {
      console.error('Failed to send Discord notification:', error)
      // Don't throw - we don't want to break the app if Discord fails
    }
  }

  /**
   * Set default channel
   */
  setDefaultChannel(channelId: string): void {
    this.defaultChannelId = channelId
  }

  /**
   * Get default channel
   */
  getDefaultChannel(): string {
    return this.defaultChannelId
  }
}
