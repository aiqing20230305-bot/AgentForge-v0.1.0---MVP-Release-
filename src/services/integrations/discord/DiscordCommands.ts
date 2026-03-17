/**
 * Discord Commands Handler
 * Process slash commands and interactions from Discord
 */

import { DiscordClient, DiscordInteraction, DiscordEmbed } from './DiscordClient'

export type CommandHandler = (interaction: DiscordInteraction) => Promise<CommandResponse>

export interface CommandResponse {
  type: 'reply' | 'deferred' | 'update'
  content?: string
  embeds?: DiscordEmbed[]
  ephemeral?: boolean
}

export interface CommandDefinition {
  name: string
  description: string
  options?: CommandOption[]
  handler: CommandHandler
}

export interface CommandOption {
  type: number
  name: string
  description: string
  required?: boolean
  choices?: Array<{ name: string; value: string | number }>
}

// Discord interaction response types
const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
  DEFERRED_UPDATE_MESSAGE: 6,
  UPDATE_MESSAGE: 7
}

// Discord application command option types
const CommandOptionType = {
  SUB_COMMAND: 1,
  SUB_COMMAND_GROUP: 2,
  STRING: 3,
  INTEGER: 4,
  BOOLEAN: 5,
  USER: 6,
  CHANNEL: 7,
  ROLE: 8,
  MENTIONABLE: 9,
  NUMBER: 10
}

export class DiscordCommandsHandler {
  private commands: Map<string, CommandDefinition> = new Map()
  private client: DiscordClient
  private registered: boolean = false

  constructor(client: DiscordClient) {
    this.client = client
    this.defineDefaultCommands()
  }

  /**
   * Define default AgentForge commands
   */
  private defineDefaultCommands(): void {
    // /agent command
    this.define({
      name: 'agent',
      description: 'Manage agents',
      options: [
        {
          type: CommandOptionType.SUB_COMMAND,
          name: 'list',
          description: 'List all agents'
        },
        {
          type: CommandOptionType.SUB_COMMAND,
          name: 'status',
          description: 'Get agent status',
          options: [
            {
              type: CommandOptionType.STRING,
              name: 'agent_id',
              description: 'Agent ID',
              required: true
            }
          ]
        },
        {
          type: CommandOptionType.SUB_COMMAND,
          name: 'info',
          description: 'Get agent information',
          options: [
            {
              type: CommandOptionType.STRING,
              name: 'agent_id',
              description: 'Agent ID',
              required: true
            }
          ]
        }
      ],
      handler: async (interaction) => {
        const subcommand = interaction.data?.options?.[0]?.name
        const agentId = interaction.data?.options?.[0]?.options?.[0]?.value

        switch (subcommand) {
          case 'list':
            return this.handleAgentList()
          case 'status':
            return this.handleAgentStatus(agentId as string)
          case 'info':
            return this.handleAgentInfo(agentId as string)
          default:
            return {
              type: 'reply',
              content: 'Unknown subcommand',
              ephemeral: true
            }
        }
      }
    })

    // /task command
    this.define({
      name: 'task',
      description: 'Manage tasks',
      options: [
        {
          type: CommandOptionType.SUB_COMMAND,
          name: 'list',
          description: 'List all tasks'
        },
        {
          type: CommandOptionType.SUB_COMMAND,
          name: 'create',
          description: 'Create a new task',
          options: [
            {
              type: CommandOptionType.STRING,
              name: 'description',
              description: 'Task description',
              required: true
            }
          ]
        },
        {
          type: CommandOptionType.SUB_COMMAND,
          name: 'status',
          description: 'Get task status',
          options: [
            {
              type: CommandOptionType.STRING,
              name: 'task_id',
              description: 'Task ID',
              required: true
            }
          ]
        },
        {
          type: CommandOptionType.SUB_COMMAND,
          name: 'cancel',
          description: 'Cancel a task',
          options: [
            {
              type: CommandOptionType.STRING,
              name: 'task_id',
              description: 'Task ID',
              required: true
            }
          ]
        }
      ],
      handler: async (interaction) => {
        const subcommand = interaction.data?.options?.[0]?.name
        const param = interaction.data?.options?.[0]?.options?.[0]?.value as string

        switch (subcommand) {
          case 'list':
            return this.handleTaskList()
          case 'create':
            return this.handleTaskCreate(param)
          case 'status':
            return this.handleTaskStatus(param)
          case 'cancel':
            return this.handleTaskCancel(param)
          default:
            return {
              type: 'reply',
              content: 'Unknown subcommand',
              ephemeral: true
            }
        }
      }
    })

    // /stats command
    this.define({
      name: 'stats',
      description: 'Show system statistics',
      options: [
        {
          type: CommandOptionType.STRING,
          name: 'period',
          description: 'Time period',
          choices: [
            { name: 'Daily', value: 'daily' },
            { name: 'Weekly', value: 'weekly' },
            { name: 'Monthly', value: 'monthly' }
          ]
        }
      ],
      handler: async (interaction) => {
        const period = interaction.data?.options?.[0]?.value as string || 'daily'
        return this.handleStats(period)
      }
    })

    // /help command
    this.define({
      name: 'help',
      description: 'Show available commands',
      handler: async () => this.handleHelp()
    })
  }

  /**
   * Define a command (doesn't register it yet)
   */
  define(definition: CommandDefinition): void {
    this.commands.set(definition.name, definition)
  }

  /**
   * Remove a command definition
   */
  undefine(name: string): void {
    this.commands.delete(name)
  }

  /**
   * Register all commands with Discord
   */
  async registerCommands(): Promise<void> {
    if (this.registered) return

    for (const [name, definition] of this.commands) {
      try {
        await this.client.createCommand({
          name: definition.name,
          description: definition.description,
          options: definition.options,
          type: 1 // CHAT_INPUT
        })
        console.log(`Registered command: ${name}`)
      } catch (error) {
        console.error(`Failed to register command ${name}:`, error)
      }
    }

    this.registered = true
  }

  /**
   * Handle incoming interaction
   */
  async handle(interaction: DiscordInteraction): Promise<void> {
    // Handle ping (for Discord verification)
    if (interaction.type === 1) {
      await this.client.respondToInteraction(interaction.id, interaction.token, {
        type: InteractionResponseType.PONG
      })
      return
    }

    // Handle application command
    if (interaction.type === 2) {
      const commandName = interaction.data?.name
      if (!commandName) return

      const command = this.commands.get(commandName)
      if (!command) {
        await this.respondError(interaction, 'Unknown command')
        return
      }

      try {
        const response = await command.handler(interaction)
        await this.respond(interaction, response)
      } catch (error: any) {
        await this.respondError(interaction, `Error: ${error.message}`)
      }
    }
  }

  /**
   * Respond to interaction
   */
  private async respond(interaction: DiscordInteraction, response: CommandResponse): Promise<void> {
    let type: number

    switch (response.type) {
      case 'deferred':
        type = InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
        break
      case 'update':
        type = InteractionResponseType.UPDATE_MESSAGE
        break
      default:
        type = InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
    }

    await this.client.respondToInteraction(interaction.id, interaction.token, {
      type,
      data: {
        content: response.content,
        embeds: response.embeds,
        flags: response.ephemeral ? 64 : 0
      }
    })
  }

  /**
   * Respond with error
   */
  private async respondError(interaction: DiscordInteraction, message: string): Promise<void> {
    await this.client.respondToInteraction(interaction.id, interaction.token, {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `❌ ${message}`,
        flags: 64 // Ephemeral
      }
    })
  }

  /**
   * Handle /agent list
   */
  private async handleAgentList(): Promise<CommandResponse> {
    const agents = await this.fetchAgents()

    if (agents.length === 0) {
      return {
        type: 'reply',
        content: 'No agents found.',
        ephemeral: true
      }
    }

    const embed = this.client.createEmbed({
      title: `Active Agents (${agents.length})`,
      description: agents
        .map(a => `**${a.name}** (Level ${a.level}) - ${a.status}\nHealth: ${a.health}% | Energy: ${a.energy}%`)
        .join('\n\n'),
      color: 'info',
      timestamp: true
    })

    return {
      type: 'reply',
      embeds: [embed]
    }
  }

  /**
   * Handle /agent status
   */
  private async handleAgentStatus(agentId: string): Promise<CommandResponse> {
    const agent = await this.fetchAgent(agentId)
    if (!agent) {
      return {
        type: 'reply',
        content: `Agent not found: ${agentId}`,
        ephemeral: true
      }
    }

    const embed = this.client.createEmbed({
      title: `${agent.name} Status`,
      color: 'info',
      fields: [
        { name: 'Level', value: agent.level.toString(), inline: true },
        { name: 'Status', value: agent.status, inline: true },
        { name: 'Health', value: `${agent.health}%`, inline: true },
        { name: 'Energy', value: `${agent.energy}%`, inline: true },
        { name: 'Current Task', value: agent.currentTask || 'None', inline: false }
      ],
      timestamp: true
    })

    return {
      type: 'reply',
      embeds: [embed]
    }
  }

  /**
   * Handle /agent info
   */
  private async handleAgentInfo(agentId: string): Promise<CommandResponse> {
    const agent = await this.fetchAgent(agentId)
    if (!agent) {
      return {
        type: 'reply',
        content: `Agent not found: ${agentId}`,
        ephemeral: true
      }
    }

    const embed = this.client.createEmbed({
      title: `${agent.name} Information`,
      color: 0x9c27b0,
      fields: [
        { name: 'ID', value: agent.id, inline: true },
        { name: 'Class', value: agent.class, inline: true },
        { name: 'Level', value: agent.level.toString(), inline: true },
        { name: 'Experience', value: agent.experience.toString(), inline: true },
        { name: 'Tasks Completed', value: agent.tasksCompleted.toString(), inline: true },
        { name: 'Success Rate', value: `${agent.successRate}%`, inline: true }
      ],
      timestamp: true
    })

    return {
      type: 'reply',
      embeds: [embed]
    }
  }

  /**
   * Handle /task list
   */
  private async handleTaskList(): Promise<CommandResponse> {
    const tasks = await this.fetchTasks()

    if (tasks.length === 0) {
      return {
        type: 'reply',
        content: 'No active tasks.',
        ephemeral: true
      }
    }

    const embed = this.client.createEmbed({
      title: `Active Tasks (${tasks.length})`,
      description: tasks
        .map(t => `**${t.title}**\nAgent: ${t.agentName}\nStatus: ${t.status}`)
        .join('\n\n'),
      color: 'info',
      timestamp: true
    })

    return {
      type: 'reply',
      embeds: [embed]
    }
  }

  /**
   * Handle /task create
   */
  private async handleTaskCreate(description: string): Promise<CommandResponse> {
    const taskId = await this.createTask(description)

    const embed = this.client.createEmbed({
      title: '✅ Task Created',
      description: `Task ID: \`${taskId}\`\n${description}`,
      color: 'success',
      timestamp: true
    })

    return {
      type: 'reply',
      embeds: [embed]
    }
  }

  /**
   * Handle /task status
   */
  private async handleTaskStatus(taskId: string): Promise<CommandResponse> {
    const task = await this.fetchTask(taskId)
    if (!task) {
      return {
        type: 'reply',
        content: `Task not found: ${taskId}`,
        ephemeral: true
      }
    }

    const embed = this.client.createEmbed({
      title: 'Task Status',
      description: `**${task.title}**`,
      color: 'info',
      fields: [
        { name: 'Status', value: task.status, inline: true },
        { name: 'Agent', value: task.agentName, inline: true },
        { name: 'Progress', value: `${task.progress || 0}%`, inline: true },
        { name: 'Started', value: task.startTime ? new Date(task.startTime).toLocaleString() : 'N/A', inline: true }
      ],
      timestamp: true
    })

    return {
      type: 'reply',
      embeds: [embed]
    }
  }

  /**
   * Handle /task cancel
   */
  private async handleTaskCancel(taskId: string): Promise<CommandResponse> {
    await this.cancelTask(taskId)

    return {
      type: 'reply',
      content: `Task \`${taskId}\` has been cancelled.`
    }
  }

  /**
   * Handle /stats
   */
  private async handleStats(period: string): Promise<CommandResponse> {
    const stats = await this.fetchStats(period)

    const embed = this.client.createEmbed({
      title: `System Statistics (${period})`,
      color: 'info',
      fields: [
        { name: 'Total Tasks', value: stats.totalTasks.toString(), inline: true },
        { name: 'Completed', value: stats.completedTasks.toString(), inline: true },
        { name: 'Failed', value: stats.failedTasks.toString(), inline: true },
        { name: 'Success Rate', value: `${stats.successRate}%`, inline: true },
        { name: 'Active Agents', value: stats.activeAgents.toString(), inline: true },
        { name: 'Total Agents', value: stats.totalAgents.toString(), inline: true }
      ],
      timestamp: true
    })

    return {
      type: 'reply',
      embeds: [embed]
    }
  }

  /**
   * Handle /help
   */
  private async handleHelp(): Promise<CommandResponse> {
    const commandList = Array.from(this.commands.values())
      .map(cmd => `**/${cmd.name}** - ${cmd.description}`)
      .join('\n')

    const embed = this.client.createEmbed({
      title: 'AgentForge Commands',
      description: commandList,
      color: 'info',
      footer: 'Use /command for detailed help',
      timestamp: true
    })

    return {
      type: 'reply',
      embeds: [embed],
      ephemeral: true
    }
  }

  /**
   * Placeholder methods - integrate with your actual data layer
   */
  private async fetchAgents(): Promise<any[]> {
    return []
  }

  private async fetchAgent(id: string): Promise<any | null> {
    return null
  }

  private async fetchTasks(): Promise<any[]> {
    return []
  }

  private async fetchTask(id: string): Promise<any | null> {
    return null
  }

  private async createTask(description: string): Promise<string> {
    return 'task_' + Date.now()
  }

  private async cancelTask(id: string): Promise<void> {
    // TODO: Implement
  }

  private async fetchStats(period: string): Promise<any> {
    return {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      successRate: 0,
      activeAgents: 0,
      totalAgents: 0
    }
  }
}
