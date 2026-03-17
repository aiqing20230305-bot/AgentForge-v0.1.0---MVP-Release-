/**
 * Discord Client
 * Complete Discord integration with webhooks, bot API, commands, and embeds
 */

import axios, { AxiosInstance } from 'axios'

export interface DiscordConfig {
  webhookUrl?: string
  botToken?: string
  clientId?: string
  clientSecret?: string
  publicKey?: string
  guildId?: string
}

export interface DiscordEmbed {
  title?: string
  description?: string
  url?: string
  timestamp?: string
  color?: number
  footer?: {
    text: string
    icon_url?: string
  }
  image?: {
    url: string
  }
  thumbnail?: {
    url: string
  }
  author?: {
    name: string
    url?: string
    icon_url?: string
  }
  fields?: Array<{
    name: string
    value: string
    inline?: boolean
  }>
}

export interface DiscordMessage {
  content?: string
  embeds?: DiscordEmbed[]
  username?: string
  avatar_url?: string
  tts?: boolean
  allowed_mentions?: {
    parse?: ('roles' | 'users' | 'everyone')[]
    roles?: string[]
    users?: string[]
  }
  components?: DiscordComponent[]
}

export interface DiscordComponent {
  type: number
  components?: any[]
  custom_id?: string
  style?: number
  label?: string
  emoji?: any
  url?: string
  disabled?: boolean
}

export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string
  bot?: boolean
  system?: boolean
  email?: string
  verified?: boolean
}

export interface DiscordChannel {
  id: string
  type: number
  guild_id?: string
  position?: number
  name?: string
  topic?: string
  nsfw?: boolean
  last_message_id?: string
  parent_id?: string
}

export interface DiscordGuild {
  id: string
  name: string
  icon: string
  owner_id: string
  member_count?: number
  description?: string
}

export interface DiscordInteraction {
  id: string
  type: number
  data?: {
    id: string
    name: string
    options?: any[]
  }
  guild_id?: string
  channel_id?: string
  member?: any
  user?: DiscordUser
  token: string
  version: number
}

export class DiscordClient {
  private config: DiscordConfig
  private apiClient: AxiosInstance

  constructor(config: DiscordConfig) {
    this.config = config
    this.apiClient = axios.create({
      baseURL: 'https://discord.com/api/v10',
      headers: {
        'Content-Type': 'application/json',
        ...(config.botToken && { Authorization: `Bot ${config.botToken}` })
      }
    })
  }

  /**
   * Send message via webhook (simple integration)
   */
  async sendWebhook(message: DiscordMessage): Promise<void> {
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
   * Send message to channel via API
   */
  async sendMessage(channelId: string, message: DiscordMessage): Promise<any> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured')
    }

    try {
      const response = await this.apiClient.post(`/channels/${channelId}/messages`, message)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to send message: ${error.message}`)
    }
  }

  /**
   * Edit message
   */
  async editMessage(channelId: string, messageId: string, message: Partial<DiscordMessage>): Promise<any> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured')
    }

    try {
      const response = await this.apiClient.patch(`/channels/${channelId}/messages/${messageId}`, message)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to edit message: ${error.message}`)
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(channelId: string, messageId: string): Promise<void> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured')
    }

    try {
      await this.apiClient.delete(`/channels/${channelId}/messages/${messageId}`)
    } catch (error: any) {
      throw new Error(`Failed to delete message: ${error.message}`)
    }
  }

  /**
   * Add reaction to message
   */
  async addReaction(channelId: string, messageId: string, emoji: string): Promise<void> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured')
    }

    try {
      const encodedEmoji = encodeURIComponent(emoji)
      await this.apiClient.put(`/channels/${channelId}/messages/${messageId}/reactions/${encodedEmoji}/@me`)
    } catch (error: any) {
      throw new Error(`Failed to add reaction: ${error.message}`)
    }
  }

  /**
   * Get channel info
   */
  async getChannel(channelId: string): Promise<DiscordChannel> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured')
    }

    try {
      const response = await this.apiClient.get(`/channels/${channelId}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to get channel: ${error.message}`)
    }
  }

  /**
   * List guild channels
   */
  async listGuildChannels(guildId?: string): Promise<DiscordChannel[]> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured')
    }

    const targetGuildId = guildId || this.config.guildId
    if (!targetGuildId) {
      throw new Error('Guild ID not configured')
    }

    try {
      const response = await this.apiClient.get(`/guilds/${targetGuildId}/channels`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to list channels: ${error.message}`)
    }
  }

  /**
   * Get guild info
   */
  async getGuild(guildId?: string): Promise<DiscordGuild> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured')
    }

    const targetGuildId = guildId || this.config.guildId
    if (!targetGuildId) {
      throw new Error('Guild ID not configured')
    }

    try {
      const response = await this.apiClient.get(`/guilds/${targetGuildId}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to get guild: ${error.message}`)
    }
  }

  /**
   * Get user info
   */
  async getUser(userId: string): Promise<DiscordUser> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured')
    }

    try {
      const response = await this.apiClient.get(`/users/${userId}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to get user: ${error.message}`)
    }
  }

  /**
   * Get current bot user
   */
  async getCurrentUser(): Promise<DiscordUser> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured')
    }

    try {
      const response = await this.apiClient.get('/users/@me')
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to get current user: ${error.message}`)
    }
  }

  /**
   * Create slash command (application command)
   */
  async createCommand(command: {
    name: string
    description: string
    options?: any[]
    type?: number
  }): Promise<any> {
    if (!this.config.botToken || !this.config.clientId) {
      throw new Error('Bot token and client ID required')
    }

    try {
      const endpoint = this.config.guildId
        ? `/applications/${this.config.clientId}/guilds/${this.config.guildId}/commands`
        : `/applications/${this.config.clientId}/commands`

      const response = await this.apiClient.post(endpoint, command)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to create command: ${error.message}`)
    }
  }

  /**
   * List commands
   */
  async listCommands(): Promise<any[]> {
    if (!this.config.botToken || !this.config.clientId) {
      throw new Error('Bot token and client ID required')
    }

    try {
      const endpoint = this.config.guildId
        ? `/applications/${this.config.clientId}/guilds/${this.config.guildId}/commands`
        : `/applications/${this.config.clientId}/commands`

      const response = await this.apiClient.get(endpoint)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to list commands: ${error.message}`)
    }
  }

  /**
   * Delete command
   */
  async deleteCommand(commandId: string): Promise<void> {
    if (!this.config.botToken || !this.config.clientId) {
      throw new Error('Bot token and client ID required')
    }

    try {
      const endpoint = this.config.guildId
        ? `/applications/${this.config.clientId}/guilds/${this.config.guildId}/commands/${commandId}`
        : `/applications/${this.config.clientId}/commands/${commandId}`

      await this.apiClient.delete(endpoint)
    } catch (error: any) {
      throw new Error(`Failed to delete command: ${error.message}`)
    }
  }

  /**
   * Respond to interaction
   */
  async respondToInteraction(interactionId: string, token: string, response: {
    type: number
    data?: any
  }): Promise<void> {
    try {
      await this.apiClient.post(`/interactions/${interactionId}/${token}/callback`, response)
    } catch (error: any) {
      throw new Error(`Failed to respond to interaction: ${error.message}`)
    }
  }

  /**
   * Send followup message to interaction
   */
  async sendFollowup(token: string, message: DiscordMessage): Promise<any> {
    if (!this.config.botToken || !this.config.clientId) {
      throw new Error('Bot token and client ID required')
    }

    try {
      const response = await this.apiClient.post(
        `/webhooks/${this.config.clientId}/${token}`,
        message
      )
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to send followup: ${error.message}`)
    }
  }

  /**
   * Verify interaction signature (for webhook endpoint)
   */
  verifySignature(signature: string, timestamp: string, body: string): boolean {
    if (!this.config.publicKey) {
      throw new Error('Public key not configured')
    }

    const nacl = require('tweetnacl')

    try {
      return nacl.sign.detached.verify(
        Buffer.from(timestamp + body),
        Buffer.from(signature, 'hex'),
        Buffer.from(this.config.publicKey, 'hex')
      )
    } catch {
      return false
    }
  }

  /**
   * Create rich embed
   */
  createEmbed(options: {
    title?: string
    description?: string
    color?: 'success' | 'error' | 'warning' | 'info' | number
    fields?: Array<{ name: string; value: string; inline?: boolean }>
    footer?: string
    timestamp?: boolean
    thumbnail?: string
    image?: string
    author?: { name: string; icon?: string; url?: string }
  }): DiscordEmbed {
    const colorMap = {
      success: 0x00ff00,
      error: 0xff0000,
      warning: 0xffa500,
      info: 0x0099ff
    }

    const embed: DiscordEmbed = {
      title: options.title,
      description: options.description,
      color: typeof options.color === 'string' ? colorMap[options.color] : options.color,
      fields: options.fields
    }

    if (options.footer) {
      embed.footer = { text: options.footer }
    }

    if (options.timestamp) {
      embed.timestamp = new Date().toISOString()
    }

    if (options.thumbnail) {
      embed.thumbnail = { url: options.thumbnail }
    }

    if (options.image) {
      embed.image = { url: options.image }
    }

    if (options.author) {
      embed.author = {
        name: options.author.name,
        url: options.author.url,
        icon_url: options.author.icon
      }
    }

    return embed
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<DiscordConfig>): void {
    this.config = { ...this.config, ...config }

    if (config.botToken) {
      this.apiClient.defaults.headers.Authorization = `Bot ${config.botToken}`
    }
  }

  /**
   * Get current configuration (without sensitive data)
   */
  getConfig(): Partial<DiscordConfig> {
    return {
      webhookUrl: this.config.webhookUrl ? '***configured***' : undefined,
      botToken: this.config.botToken ? '***configured***' : undefined,
      clientId: this.config.clientId,
      guildId: this.config.guildId
    }
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.config.webhookUrl) {
        await this.sendWebhook({ content: 'Test connection from AgentForge' })
        return { success: true }
      } else if (this.config.botToken) {
        await this.getCurrentUser()
        return { success: true }
      } else {
        return { success: false, error: 'No configuration found' }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}
