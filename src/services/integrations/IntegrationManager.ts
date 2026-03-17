/**
 * Integration Manager
 * Unified manager for all integrations (Slack, Discord, etc.)
 */

import { SlackClient, SlackNotifier } from './slack'
import { DiscordClient, DiscordNotifier } from './discord'
import type { NotificationType } from '../notificationService'

export interface IntegrationConfig {
  slack?: {
    enabled: boolean
    webhookUrl?: string
    botToken?: string
    signingSecret?: string
    clientId?: string
    clientSecret?: string
    redirectUri?: string
    defaultChannel?: string
    enabledNotifications?: NotificationType[]
  }
  discord?: {
    enabled: boolean
    webhookUrl?: string
    botToken?: string
    clientId?: string
    clientSecret?: string
    publicKey?: string
    guildId?: string
    defaultChannelId?: string
    enabledNotifications?: NotificationType[]
  }
}

export class IntegrationManager {
  private slackClient?: SlackClient
  private slackNotifier?: SlackNotifier
  private discordClient?: DiscordClient
  private discordNotifier?: DiscordNotifier
  private config: IntegrationConfig

  constructor(config: IntegrationConfig = {}) {
    this.config = config
    this.initialize()
  }

  /**
   * Initialize integrations
   */
  private initialize(): void {
    // Initialize Slack
    if (this.config.slack?.enabled) {
      this.slackClient = new SlackClient({
        webhookUrl: this.config.slack.webhookUrl,
        botToken: this.config.slack.botToken,
        signingSecret: this.config.slack.signingSecret,
        clientId: this.config.slack.clientId,
        clientSecret: this.config.slack.clientSecret,
        redirectUri: this.config.slack.redirectUri
      })

      this.slackNotifier = new SlackNotifier(
        this.slackClient,
        this.config.slack.defaultChannel || '#agentforge'
      )

      if (this.config.slack.enabledNotifications) {
        this.slackNotifier.setEnabledNotifications(this.config.slack.enabledNotifications)
      }
    }

    // Initialize Discord
    if (this.config.discord?.enabled) {
      this.discordClient = new DiscordClient({
        webhookUrl: this.config.discord.webhookUrl,
        botToken: this.config.discord.botToken,
        clientId: this.config.discord.clientId,
        clientSecret: this.config.discord.clientSecret,
        publicKey: this.config.discord.publicKey,
        guildId: this.config.discord.guildId
      })

      this.discordNotifier = new DiscordNotifier(
        this.discordClient,
        this.config.discord.defaultChannelId || ''
      )

      if (this.config.discord.enabledNotifications) {
        this.discordNotifier.setEnabledNotifications(this.config.discord.enabledNotifications)
      }
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<IntegrationConfig>): void {
    this.config = { ...this.config, ...config }
    this.initialize()
    this.saveConfig()
  }

  /**
   * Get current configuration
   */
  getConfig(): IntegrationConfig {
    return this.config
  }

  /**
   * Save configuration to storage
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('integration-config', JSON.stringify(this.config))
    } catch (error) {
      console.error('Failed to save integration config:', error)
    }
  }

  /**
   * Load configuration from storage
   */
  static loadConfig(): IntegrationConfig {
    try {
      const data = localStorage.getItem('integration-config')
      return data ? JSON.parse(data) : {}
    } catch {
      return {}
    }
  }

  /**
   * Get Slack client
   */
  getSlackClient(): SlackClient | undefined {
    return this.slackClient
  }

  /**
   * Get Slack notifier
   */
  getSlackNotifier(): SlackNotifier | undefined {
    return this.slackNotifier
  }

  /**
   * Get Discord client
   */
  getDiscordClient(): DiscordClient | undefined {
    return this.discordClient
  }

  /**
   * Get Discord notifier
   */
  getDiscordNotifier(): DiscordNotifier | undefined {
    return this.discordNotifier
  }

  /**
   * Check if Slack is enabled and configured
   */
  isSlackEnabled(): boolean {
    return this.config.slack?.enabled === true &&
           (!!this.config.slack.webhookUrl || !!this.config.slack.botToken)
  }

  /**
   * Check if Discord is enabled and configured
   */
  isDiscordEnabled(): boolean {
    return this.config.discord?.enabled === true &&
           (!!this.config.discord.webhookUrl || !!this.config.discord.botToken)
  }

  /**
   * Send notification to all enabled platforms
   */
  async notifyAll(type: NotificationType, data: any): Promise<void> {
    const promises: Promise<void>[] = []

    // Slack notification
    if (this.slackNotifier && this.slackNotifier.isEnabled(type)) {
      promises.push(this.sendSlackNotification(type, data))
    }

    // Discord notification
    if (this.discordNotifier && this.discordNotifier.isEnabled(type)) {
      promises.push(this.sendDiscordNotification(type, data))
    }

    await Promise.allSettled(promises)
  }

  /**
   * Send Slack notification based on type
   */
  private async sendSlackNotification(type: NotificationType, data: any): Promise<void> {
    if (!this.slackNotifier) return

    try {
      switch (type) {
        case 'task_complete':
          await this.slackNotifier.notifyTaskComplete(data)
          break
        case 'task_failed':
          await this.slackNotifier.notifyTaskFailed(data)
          break
        case 'level_up':
          await this.slackNotifier.notifyLevelUp(data.agentName, data.oldLevel, data.newLevel)
          break
        case 'achievement':
          await this.slackNotifier.notifyAchievement(data.title, data.description, data.icon)
          break
        case 'system':
          await this.slackNotifier.sendAlert(data)
          break
        case 'agent_idle':
          await this.slackNotifier.notifyAgentStatus(data)
          break
      }
    } catch (error) {
      console.error('Failed to send Slack notification:', error)
    }
  }

  /**
   * Send Discord notification based on type
   */
  private async sendDiscordNotification(type: NotificationType, data: any): Promise<void> {
    if (!this.discordNotifier) return

    try {
      switch (type) {
        case 'task_complete':
          await this.discordNotifier.notifyTaskComplete(data)
          break
        case 'task_failed':
          await this.discordNotifier.notifyTaskFailed(data)
          break
        case 'level_up':
          await this.discordNotifier.notifyLevelUp(data.agentName, data.oldLevel, data.newLevel)
          break
        case 'achievement':
          await this.discordNotifier.notifyAchievement(data.title, data.description, data.icon)
          break
        case 'system':
          await this.discordNotifier.sendAlert(data)
          break
        case 'agent_idle':
          await this.discordNotifier.notifyAgentStatus(data)
          break
      }
    } catch (error) {
      console.error('Failed to send Discord notification:', error)
    }
  }

  /**
   * Test all enabled integrations
   */
  async testConnections(): Promise<{
    slack?: { success: boolean; error?: string }
    discord?: { success: boolean; error?: string }
  }> {
    const results: any = {}

    if (this.slackClient && this.isSlackEnabled()) {
      results.slack = await this.slackClient.testConnection()
    }

    if (this.discordClient && this.isDiscordEnabled()) {
      results.discord = await this.discordClient.testConnection()
    }

    return results
  }

  /**
   * Send daily summary to all platforms
   */
  async sendDailySummary(data: {
    totalTasks: number
    completedTasks: number
    failedTasks: number
    activeAgents: number
    totalAgents: number
    topAgent?: { name: string; tasksCompleted: number }
  }): Promise<void> {
    const promises: Promise<void>[] = []

    if (this.slackNotifier && this.isSlackEnabled()) {
      promises.push(this.slackNotifier.sendDailySummary(data))
    }

    if (this.discordNotifier && this.isDiscordEnabled()) {
      promises.push(this.discordNotifier.sendDailySummary(data))
    }

    await Promise.allSettled(promises)
  }
}

// Global singleton instance
let integrationManager: IntegrationManager | null = null

export function getIntegrationManager(): IntegrationManager {
  if (!integrationManager) {
    const config = IntegrationManager.loadConfig()
    integrationManager = new IntegrationManager(config)
  }
  return integrationManager
}

export function resetIntegrationManager(): void {
  integrationManager = null
}
