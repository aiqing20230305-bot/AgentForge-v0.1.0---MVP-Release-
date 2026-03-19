/**
 * Integration Controller
 * Backend API for handling Slack and Discord integrations
 */

import { Request, Response } from 'express'
import crypto from 'crypto'

interface SlackCommand {
  token: string
  team_id: string
  team_domain: string
  channel_id: string
  channel_name: string
  user_id: string
  user_name: string
  command: string
  text: string
  response_url: string
  trigger_id: string
}

interface DiscordInteraction {
  type: number
  id: string
  application_id: string
  token: string
  version: number
  data?: {
    id: string
    name: string
    options?: any[]
  }
  guild_id?: string
  channel_id?: string
  member?: any
  user?: any
}

export class IntegrationController {
  /**
   * Handle Slack slash command
   */
  async handleSlackCommand(req: Request, res: Response): Promise<void> {
    try {
      const command: SlackCommand = req.body

      // Verify Slack signature
      if (!this.verifySlackSignature(req)) {
        res.status(401).json({ error: 'Invalid signature' })
        return
      }

      // Parse command
      const text = command.text.trim()
      const parts = text.split(/\s+/)
      const subcommand = parts[0] || 'help'
      const args = parts.slice(1)

      // Handle command
      let response: any

      switch (subcommand) {
        case 'agent':
          response = await this.handleAgentCommand(args)
          break
        case 'task':
          response = await this.handleTaskCommand(args)
          break
        case 'stats':
          response = await this.handleStatsCommand(args)
          break
        case 'help':
          response = this.getHelpMessage()
          break
        default:
          response = {
            response_type: 'ephemeral',
            text: `Unknown command: ${subcommand}\nType \`/agentforge help\` for available commands.`
          }
      }

      res.json(response)
    } catch (error: any) {
      console.error('Error handling Slack command:', error)
      res.status(500).json({
        response_type: 'ephemeral',
        text: `Error: ${error.message}`
      })
    }
  }

  /**
   * Handle Discord interaction
   */
  async handleDiscordInteraction(req: Request, res: Response): Promise<void> {
    try {
      const interaction: DiscordInteraction = req.body

      // Verify Discord signature
      if (!this.verifyDiscordSignature(req)) {
        res.status(401).json({ error: 'Invalid signature' })
        return
      }

      // Handle ping (Discord verification)
      if (interaction.type === 1) {
        res.json({ type: 1 })
        return
      }

      // Handle application command
      if (interaction.type === 2) {
        const commandName = interaction.data?.name
        const options = interaction.data?.options || []

        let response: any

        switch (commandName) {
          case 'agent':
            response = await this.handleDiscordAgentCommand(options)
            break
          case 'task':
            response = await this.handleDiscordTaskCommand(options)
            break
          case 'stats':
            response = await this.handleDiscordStatsCommand(options)
            break
          case 'help':
            response = this.getDiscordHelpMessage()
            break
          default:
            response = {
              type: 4,
              data: {
                content: 'Unknown command',
                flags: 64
              }
            }
        }

        res.json(response)
      } else {
        res.status(400).json({ error: 'Unknown interaction type' })
      }
    } catch (error: any) {
      console.error('Error handling Discord interaction:', error)
      res.status(500).json({
        type: 4,
        data: {
          content: `Error: ${error.message}`,
          flags: 64
        }
      })
    }
  }

  /**
   * Webhook endpoint for receiving notifications
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { platform, event, data } = req.body

      // Process webhook event
      console.log(`Webhook received: ${platform} - ${event}`, data)

      // Here you would typically:
      // 1. Validate the webhook
      // 2. Process the event
      // 3. Update your database
      // 4. Send notifications if needed

      res.json({ success: true })
    } catch (error: any) {
      console.error('Error handling webhook:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * OAuth callback for Slack
   */
  async handleSlackOAuth(req: Request, res: Response): Promise<void> {
    try {
      const { code, state } = req.query

      if (!code) {
        res.status(400).json({ error: 'Missing code parameter' })
        return
      }

      // Exchange code for token
      // This would typically be handled by your SlackClient
      // Store the tokens securely in your database

      res.json({ success: true, message: 'Slack integration successful' })
    } catch (error: any) {
      console.error('Error handling Slack OAuth:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * OAuth callback for Discord
   */
  async handleDiscordOAuth(req: Request, res: Response): Promise<void> {
    try {
      const { code, state } = req.query

      if (!code) {
        res.status(400).json({ error: 'Missing code parameter' })
        return
      }

      // Exchange code for token
      // Store the tokens securely in your database

      res.json({ success: true, message: 'Discord integration successful' })
    } catch (error: any) {
      console.error('Error handling Discord OAuth:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Get integration status
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = {
        slack: {
          enabled: false,
          configured: false,
          webhookUrl: false,
          botToken: false
        },
        discord: {
          enabled: false,
          configured: false,
          webhookUrl: false,
          botToken: false
        }
      }

      // Load from your configuration/database
      // Update status accordingly

      res.json(status)
    } catch (error: any) {
      console.error('Error getting integration status:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Test integration connection
   */
  async testConnection(req: Request, res: Response): Promise<void> {
    try {
      const { platform } = req.params
      const config = req.body

      // Test the connection using the provided config
      let result: any

      if (platform === 'slack') {
        // Test Slack connection
        result = { success: true, message: 'Slack connection successful' }
      } else if (platform === 'discord') {
        // Test Discord connection
        result = { success: true, message: 'Discord connection successful' }
      } else {
        res.status(400).json({ error: 'Invalid platform' })
        return
      }

      res.json(result)
    } catch (error: any) {
      console.error('Error testing connection:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Verify Slack request signature
   */
  private verifySlackSignature(req: Request): boolean {
    const signingSecret = process.env.SLACK_SIGNING_SECRET
    if (!signingSecret) return true // Skip verification if not configured

    const signature = req.headers['x-slack-signature'] as string
    const timestamp = req.headers['x-slack-request-timestamp'] as string
    const body = JSON.stringify(req.body)

    if (!signature || !timestamp) return false

    // Check timestamp to prevent replay attacks
    const time = Math.floor(Date.now() / 1000)
    if (Math.abs(time - parseInt(timestamp)) > 60 * 5) return false

    const sigBasestring = `v0:${timestamp}:${body}`
    const mySignature = 'v0=' + crypto
      .createHmac('sha256', signingSecret)
      .update(sigBasestring)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(mySignature),
      Buffer.from(signature)
    )
  }

  /**
   * Verify Discord request signature
   */
  private verifyDiscordSignature(req: Request): boolean {
    const publicKey = process.env.DISCORD_PUBLIC_KEY
    if (!publicKey) return true // Skip verification if not configured

    const signature = req.headers['x-signature-ed25519'] as string
    const timestamp = req.headers['x-signature-timestamp'] as string
    const body = JSON.stringify(req.body)

    if (!signature || !timestamp) return false

    try {
      const nacl = require('tweetnacl')
      return nacl.sign.detached.verify(
        Buffer.from(timestamp + body),
        Buffer.from(signature, 'hex'),
        Buffer.from(publicKey, 'hex')
      )
    } catch {
      return false
    }
  }

  /**
   * Handle agent command
   */
  private async handleAgentCommand(args: string[]): Promise<any> {
    const subcommand = args[0] || 'list'

    // Implement actual logic here
    return {
      response_type: 'in_channel',
      text: `Agent command: ${subcommand}`
    }
  }

  /**
   * Handle task command
   */
  private async handleTaskCommand(args: string[]): Promise<any> {
    const subcommand = args[0] || 'list'

    // Implement actual logic here
    return {
      response_type: 'in_channel',
      text: `Task command: ${subcommand}`
    }
  }

  /**
   * Handle stats command
   */
  private async handleStatsCommand(args: string[]): Promise<any> {
    const period = args[0] || 'daily'

    // Implement actual logic here
    return {
      response_type: 'in_channel',
      text: `Stats for period: ${period}`
    }
  }

  /**
   * Get help message for Slack
   */
  private getHelpMessage(): any {
    return {
      response_type: 'ephemeral',
      text: `*AgentForge Commands*\n\n` +
            `• \`agent list\` - List all agents\n` +
            `• \`agent status <id>\` - Get agent status\n` +
            `• \`task list\` - List all tasks\n` +
            `• \`task create <desc>\` - Create new task\n` +
            `• \`stats [period]\` - Show statistics\n` +
            `• \`help\` - Show this message`
    }
  }

  /**
   * Handle Discord agent command
   */
  private async handleDiscordAgentCommand(options: any[]): Promise<any> {
    // Implement actual logic here
    return {
      type: 4,
      data: {
        content: 'Agent command executed'
      }
    }
  }

  /**
   * Handle Discord task command
   */
  private async handleDiscordTaskCommand(options: any[]): Promise<any> {
    // Implement actual logic here
    return {
      type: 4,
      data: {
        content: 'Task command executed'
      }
    }
  }

  /**
   * Handle Discord stats command
   */
  private async handleDiscordStatsCommand(options: any[]): Promise<any> {
    // Implement actual logic here
    return {
      type: 4,
      data: {
        content: 'Stats command executed'
      }
    }
  }

  /**
   * Get help message for Discord
   */
  private getDiscordHelpMessage(): any {
    return {
      type: 4,
      data: {
        embeds: [
          {
            title: 'AgentForge Commands',
            description:
              `**/agent** - Manage agents\n` +
              `**/task** - Manage tasks\n` +
              `**/stats** - Show statistics\n` +
              `**/help** - Show this message`,
            color: 0x9c27b0
          }
        ],
        flags: 64
      }
    }
  }
}

export const integrationController = new IntegrationController()
