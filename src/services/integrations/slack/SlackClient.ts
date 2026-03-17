/**
 * Slack Client
 * Complete Slack integration with webhooks, bot API, commands, and OAuth
 */

import axios, { AxiosInstance } from 'axios'

export interface SlackConfig {
  webhookUrl?: string
  botToken?: string
  signingSecret?: string
  clientId?: string
  clientSecret?: string
  redirectUri?: string
}

export interface SlackMessage {
  text: string
  channel?: string
  username?: string
  icon_emoji?: string
  icon_url?: string
  attachments?: SlackAttachment[]
  blocks?: SlackBlock[]
  thread_ts?: string
  reply_broadcast?: boolean
}

export interface SlackAttachment {
  color?: string
  pretext?: string
  author_name?: string
  author_link?: string
  author_icon?: string
  title?: string
  title_link?: string
  text?: string
  fields?: Array<{ title: string; value: string; short?: boolean }>
  image_url?: string
  thumb_url?: string
  footer?: string
  footer_icon?: string
  ts?: number
}

export interface SlackBlock {
  type: string
  text?: {
    type: string
    text: string
    emoji?: boolean
  }
  elements?: any[]
  accessory?: any
  block_id?: string
}

export interface SlackUser {
  id: string
  name: string
  real_name: string
  profile: {
    email?: string
    display_name: string
    image_48: string
    image_192: string
  }
}

export interface SlackChannel {
  id: string
  name: string
  is_channel: boolean
  is_group: boolean
  is_im: boolean
  is_private: boolean
  is_archived: boolean
  num_members?: number
}

export interface SlackCommand {
  command: string
  text: string
  user_id: string
  user_name: string
  channel_id: string
  channel_name: string
  team_id: string
  response_url: string
  trigger_id: string
}

export interface SlackOAuthResponse {
  ok: boolean
  access_token: string
  token_type: string
  scope: string
  bot_user_id?: string
  app_id: string
  team: {
    id: string
    name: string
  }
  authed_user?: {
    id: string
    scope?: string
    access_token?: string
    token_type?: string
  }
  incoming_webhook?: {
    channel: string
    channel_id: string
    configuration_url: string
    url: string
  }
  error?: string
}

export class SlackClient {
  private config: SlackConfig
  private apiClient: AxiosInstance

  constructor(config: SlackConfig) {
    this.config = config
    this.apiClient = axios.create({
      baseURL: 'https://slack.com/api',
      headers: {
        'Content-Type': 'application/json',
        ...(config.botToken && { Authorization: `Bearer ${config.botToken}` })
      }
    })
  }

  /**
   * Send message via webhook (simple integration)
   */
  async sendWebhook(message: SlackMessage): Promise<void> {
    if (!this.config.webhookUrl) {
      throw new Error('Webhook URL not configured')
    }

    try {
      await axios.post(this.config.webhookUrl, message)
    } catch (error: any) {
      throw new Error(`Failed to send webhook: ${error.message}`)
    }
  }

  /**
   * Post message via API (requires bot token)
   */
  async postMessage(message: SlackMessage): Promise<any> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured')
    }

    try {
      const response = await this.apiClient.post('/chat.postMessage', {
        channel: message.channel || '#general',
        text: message.text,
        username: message.username,
        icon_emoji: message.icon_emoji,
        icon_url: message.icon_url,
        attachments: message.attachments,
        blocks: message.blocks,
        thread_ts: message.thread_ts,
        reply_broadcast: message.reply_broadcast
      })

      if (!response.data.ok) {
        throw new Error(response.data.error)
      }

      return response.data
    } catch (error: any) {
      throw new Error(`Failed to post message: ${error.message}`)
    }
  }

  /**
   * Update message
   */
  async updateMessage(channel: string, ts: string, message: Partial<SlackMessage>): Promise<any> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured')
    }

    try {
      const response = await this.apiClient.post('/chat.update', {
        channel,
        ts,
        text: message.text,
        attachments: message.attachments,
        blocks: message.blocks
      })

      if (!response.data.ok) {
        throw new Error(response.data.error)
      }

      return response.data
    } catch (error: any) {
      throw new Error(`Failed to update message: ${error.message}`)
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(channel: string, ts: string): Promise<void> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured')
    }

    try {
      const response = await this.apiClient.post('/chat.delete', { channel, ts })

      if (!response.data.ok) {
        throw new Error(response.data.error)
      }
    } catch (error: any) {
      throw new Error(`Failed to delete message: ${error.message}`)
    }
  }

  /**
   * Get user info
   */
  async getUserInfo(userId: string): Promise<SlackUser> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured')
    }

    try {
      const response = await this.apiClient.get('/users.info', {
        params: { user: userId }
      })

      if (!response.data.ok) {
        throw new Error(response.data.error)
      }

      return response.data.user
    } catch (error: any) {
      throw new Error(`Failed to get user info: ${error.message}`)
    }
  }

  /**
   * List channels
   */
  async listChannels(excludeArchived = true): Promise<SlackChannel[]> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured')
    }

    try {
      const response = await this.apiClient.get('/conversations.list', {
        params: {
          exclude_archived: excludeArchived,
          types: 'public_channel,private_channel'
        }
      })

      if (!response.data.ok) {
        throw new Error(response.data.error)
      }

      return response.data.channels
    } catch (error: any) {
      throw new Error(`Failed to list channels: ${error.message}`)
    }
  }

  /**
   * Get channel info
   */
  async getChannelInfo(channelId: string): Promise<SlackChannel> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured')
    }

    try {
      const response = await this.apiClient.get('/conversations.info', {
        params: { channel: channelId }
      })

      if (!response.data.ok) {
        throw new Error(response.data.error)
      }

      return response.data.channel
    } catch (error: any) {
      throw new Error(`Failed to get channel info: ${error.message}`)
    }
  }

  /**
   * Join channel
   */
  async joinChannel(channelId: string): Promise<void> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured')
    }

    try {
      const response = await this.apiClient.post('/conversations.join', { channel: channelId })

      if (!response.data.ok) {
        throw new Error(response.data.error)
      }
    } catch (error: any) {
      throw new Error(`Failed to join channel: ${error.message}`)
    }
  }

  /**
   * Send ephemeral message (only visible to specific user)
   */
  async sendEphemeral(channel: string, user: string, text: string, blocks?: SlackBlock[]): Promise<void> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured')
    }

    try {
      const response = await this.apiClient.post('/chat.postEphemeral', {
        channel,
        user,
        text,
        blocks
      })

      if (!response.data.ok) {
        throw new Error(response.data.error)
      }
    } catch (error: any) {
      throw new Error(`Failed to send ephemeral message: ${error.message}`)
    }
  }

  /**
   * Add reaction to message
   */
  async addReaction(channel: string, timestamp: string, emoji: string): Promise<void> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured')
    }

    try {
      const response = await this.apiClient.post('/reactions.add', {
        channel,
        timestamp,
        name: emoji.replace(/:/g, '')
      })

      if (!response.data.ok && response.data.error !== 'already_reacted') {
        throw new Error(response.data.error)
      }
    } catch (error: any) {
      throw new Error(`Failed to add reaction: ${error.message}`)
    }
  }

  /**
   * OAuth: Get authorization URL
   */
  getAuthorizationUrl(state?: string, scopes?: string[]): string {
    if (!this.config.clientId || !this.config.redirectUri) {
      throw new Error('OAuth not configured (missing clientId or redirectUri)')
    }

    const defaultScopes = [
      'channels:read',
      'channels:write',
      'chat:write',
      'users:read',
      'commands',
      'incoming-webhook'
    ]

    const scope = (scopes || defaultScopes).join(',')
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope,
      ...(state && { state })
    })

    return `https://slack.com/oauth/v2/authorize?${params.toString()}`
  }

  /**
   * OAuth: Exchange code for access token
   */
  async exchangeCodeForToken(code: string): Promise<SlackOAuthResponse> {
    if (!this.config.clientId || !this.config.clientSecret || !this.config.redirectUri) {
      throw new Error('OAuth not configured')
    }

    try {
      const response = await axios.post('https://slack.com/api/oauth.v2.access', null, {
        params: {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
          redirect_uri: this.config.redirectUri
        }
      })

      if (!response.data.ok) {
        throw new Error(response.data.error || 'OAuth exchange failed')
      }

      return response.data
    } catch (error: any) {
      throw new Error(`OAuth exchange failed: ${error.message}`)
    }
  }

  /**
   * Verify request signature (for slash commands and events)
   */
  verifySignature(timestamp: string, body: string, signature: string): boolean {
    if (!this.config.signingSecret) {
      throw new Error('Signing secret not configured')
    }

    const crypto = require('crypto')
    const time = Math.floor(Date.now() / 1000)

    // Reject old requests (replay attack protection)
    if (Math.abs(time - parseInt(timestamp)) > 60 * 5) {
      return false
    }

    const sigBasestring = `v0:${timestamp}:${body}`
    const mySignature = 'v0=' + crypto
      .createHmac('sha256', this.config.signingSecret)
      .update(sigBasestring)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(mySignature),
      Buffer.from(signature)
    )
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SlackConfig>): void {
    this.config = { ...this.config, ...config }

    if (config.botToken) {
      this.apiClient.defaults.headers.Authorization = `Bearer ${config.botToken}`
    }
  }

  /**
   * Get current configuration (without sensitive data)
   */
  getConfig(): Partial<SlackConfig> {
    return {
      webhookUrl: this.config.webhookUrl ? '***configured***' : undefined,
      botToken: this.config.botToken ? '***configured***' : undefined,
      clientId: this.config.clientId,
      redirectUri: this.config.redirectUri
    }
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.config.webhookUrl) {
        await this.sendWebhook({ text: 'Test connection from AgentForge' })
        return { success: true }
      } else if (this.config.botToken) {
        const response = await this.apiClient.post('/auth.test')
        if (response.data.ok) {
          return { success: true }
        } else {
          return { success: false, error: response.data.error }
        }
      } else {
        return { success: false, error: 'No configuration found' }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}
