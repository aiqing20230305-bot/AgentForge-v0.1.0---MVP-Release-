/**
 * Slack Commands Handler
 * Process slash commands from Slack
 */

import { SlackClient, SlackCommand } from './SlackClient'
import { useBuildStore } from '../../../stores/buildStore'
import { useTaskStore } from '../../../stores/taskStore'

export type CommandHandler = (command: SlackCommand, args: string[]) => Promise<CommandResponse>

export interface CommandResponse {
  response_type?: 'in_channel' | 'ephemeral'
  text: string
  attachments?: any[]
  blocks?: any[]
}

export interface CommandDefinition {
  name: string
  description: string
  usage: string
  handler: CommandHandler
}

export class SlackCommandsHandler {
  private commands: Map<string, CommandDefinition> = new Map()
  private client: SlackClient

  constructor(client: SlackClient) {
    this.client = client
    this.registerDefaultCommands()
  }

  /**
   * Register default AgentForge commands
   */
  private registerDefaultCommands(): void {
    // /agent list - List all agents
    this.register({
      name: 'agent',
      description: 'Manage agents',
      usage: '/agentforge agent [list|status|info] [agent_id]',
      handler: async (cmd, args) => {
        const subcommand = args[0] || 'list'

        switch (subcommand) {
          case 'list':
            return this.handleAgentList()
          case 'status':
            return this.handleAgentStatus(args[1])
          case 'info':
            return this.handleAgentInfo(args[1])
          default:
            return {
              response_type: 'ephemeral',
              text: `Unknown subcommand: ${subcommand}\nUsage: ${this.commands.get('agent')?.usage}`
            }
        }
      }
    })

    // /task - Task management
    this.register({
      name: 'task',
      description: 'Manage tasks',
      usage: '/agentforge task [list|create|status|cancel] [task_id]',
      handler: async (cmd, args) => {
        const subcommand = args[0] || 'list'

        switch (subcommand) {
          case 'list':
            return this.handleTaskList()
          case 'create':
            return this.handleTaskCreate(args.slice(1).join(' '))
          case 'status':
            return this.handleTaskStatus(args[1])
          case 'cancel':
            return this.handleTaskCancel(args[1])
          default:
            return {
              response_type: 'ephemeral',
              text: `Unknown subcommand: ${subcommand}\nUsage: ${this.commands.get('task')?.usage}`
            }
        }
      }
    })

    // /stats - Show statistics
    this.register({
      name: 'stats',
      description: 'Show system statistics',
      usage: '/agentforge stats [daily|weekly|agents]',
      handler: async (cmd, args) => {
        const period = args[0] || 'daily'
        return this.handleStats(period)
      }
    })

    // /help - Show help
    this.register({
      name: 'help',
      description: 'Show available commands',
      usage: '/agentforge help [command]',
      handler: async (cmd, args) => {
        if (args[0]) {
          return this.handleCommandHelp(args[0])
        }
        return this.handleHelp()
      }
    })
  }

  /**
   * Register a command
   */
  register(definition: CommandDefinition): void {
    this.commands.set(definition.name, definition)
  }

  /**
   * Unregister a command
   */
  unregister(name: string): void {
    this.commands.delete(name)
  }

  /**
   * Handle incoming slash command
   */
  async handle(slackCommand: SlackCommand): Promise<CommandResponse> {
    // Parse command text
    const text = slackCommand.text.trim()
    const parts = text.split(/\s+/)
    const commandName = parts[0] || 'help'
    const args = parts.slice(1)

    // Find command
    const command = this.commands.get(commandName)
    if (!command) {
      return {
        response_type: 'ephemeral',
        text: `Unknown command: ${commandName}\nType \`/agentforge help\` to see available commands.`
      }
    }

    try {
      return await command.handler(slackCommand, args)
    } catch (error: any) {
      return {
        response_type: 'ephemeral',
        text: `Error executing command: ${error.message}`
      }
    }
  }

  /**
   * Handle /agent list
   */
  private async handleAgentList(): Promise<CommandResponse> {
    // This would integrate with your agent store
    const agents = await this.fetchAgents()

    if (agents.length === 0) {
      return {
        response_type: 'ephemeral',
        text: 'No agents found.'
      }
    }

    const attachments = agents.map(agent => ({
      color: agent.status === 'working' ? '#36a64f' : '#808080',
      text: `*${agent.name}* (Level ${agent.level})\nStatus: ${agent.status}\nHealth: ${agent.health}% | Energy: ${agent.energy}%`
    }))

    return {
      response_type: 'in_channel',
      text: `*Active Agents (${agents.length})*`,
      attachments
    }
  }

  /**
   * Handle /agent status
   */
  private async handleAgentStatus(agentId: string): Promise<CommandResponse> {
    if (!agentId) {
      return {
        response_type: 'ephemeral',
        text: 'Please provide an agent ID.\nUsage: `/agentforge agent status <agent_id>`'
      }
    }

    const agent = await this.fetchAgent(agentId)
    if (!agent) {
      return {
        response_type: 'ephemeral',
        text: `Agent not found: ${agentId}`
      }
    }

    return {
      response_type: 'in_channel',
      text: `*${agent.name}* Status`,
      attachments: [
        {
          color: '#2196F3',
          fields: [
            { title: 'Level', value: agent.level.toString(), short: true },
            { title: 'Status', value: agent.status, short: true },
            { title: 'Health', value: `${agent.health}%`, short: true },
            { title: 'Energy', value: `${agent.energy}%`, short: true },
            { title: 'Current Task', value: agent.currentTask || 'None', short: false }
          ]
        }
      ]
    }
  }

  /**
   * Handle /agent info
   */
  private async handleAgentInfo(agentId: string): Promise<CommandResponse> {
    if (!agentId) {
      return {
        response_type: 'ephemeral',
        text: 'Please provide an agent ID.\nUsage: `/agentforge agent info <agent_id>`'
      }
    }

    const agent = await this.fetchAgent(agentId)
    if (!agent) {
      return {
        response_type: 'ephemeral',
        text: `Agent not found: ${agentId}`
      }
    }

    return {
      response_type: 'in_channel',
      text: `*${agent.name}* Information`,
      attachments: [
        {
          color: '#9C27B0',
          fields: [
            { title: 'ID', value: agent.id, short: true },
            { title: 'Class', value: agent.class, short: true },
            { title: 'Level', value: agent.level.toString(), short: true },
            { title: 'Experience', value: agent.experience.toString(), short: true },
            { title: 'Tasks Completed', value: agent.tasksCompleted.toString(), short: true },
            { title: 'Success Rate', value: `${agent.successRate}%`, short: true }
          ]
        }
      ]
    }
  }

  /**
   * Handle /task list
   */
  private async handleTaskList(): Promise<CommandResponse> {
    const tasks = await this.fetchTasks()

    if (tasks.length === 0) {
      return {
        response_type: 'ephemeral',
        text: 'No active tasks.'
      }
    }

    const attachments = tasks.map(task => ({
      color: task.status === 'completed' ? '#36a64f' : task.status === 'failed' ? '#ff0000' : '#FFA500',
      text: `*${task.title}*\nAgent: ${task.agentName}\nStatus: ${task.status}`
    }))

    return {
      response_type: 'in_channel',
      text: `*Active Tasks (${tasks.length})*`,
      attachments
    }
  }

  /**
   * Handle /task create
   */
  private async handleTaskCreate(description: string): Promise<CommandResponse> {
    if (!description) {
      return {
        response_type: 'ephemeral',
        text: 'Please provide a task description.\nUsage: `/agentforge task create <description>`'
      }
    }

    // This would integrate with your task creation system
    const taskId = await this.createTask(description)

    return {
      response_type: 'in_channel',
      text: `Task created successfully!`,
      attachments: [
        {
          color: '#36a64f',
          text: `Task ID: \`${taskId}\`\nDescription: ${description}`
        }
      ]
    }
  }

  /**
   * Handle /task status
   */
  private async handleTaskStatus(taskId: string): Promise<CommandResponse> {
    if (!taskId) {
      return {
        response_type: 'ephemeral',
        text: 'Please provide a task ID.\nUsage: `/agentforge task status <task_id>`'
      }
    }

    const task = await this.fetchTask(taskId)
    if (!task) {
      return {
        response_type: 'ephemeral',
        text: `Task not found: ${taskId}`
      }
    }

    return {
      response_type: 'in_channel',
      text: `*Task Status*`,
      attachments: [
        {
          color: '#2196F3',
          fields: [
            { title: 'Title', value: task.title, short: false },
            { title: 'Status', value: task.status, short: true },
            { title: 'Agent', value: task.agentName, short: true },
            { title: 'Started', value: task.startTime ? new Date(task.startTime).toLocaleString() : 'N/A', short: true },
            { title: 'Progress', value: `${task.progress || 0}%`, short: true }
          ]
        }
      ]
    }
  }

  /**
   * Handle /task cancel
   */
  private async handleTaskCancel(taskId: string): Promise<CommandResponse> {
    if (!taskId) {
      return {
        response_type: 'ephemeral',
        text: 'Please provide a task ID.\nUsage: `/agentforge task cancel <task_id>`'
      }
    }

    await this.cancelTask(taskId)

    return {
      response_type: 'in_channel',
      text: `Task \`${taskId}\` has been cancelled.`
    }
  }

  /**
   * Handle /stats
   */
  private async handleStats(period: string): Promise<CommandResponse> {
    const stats = await this.fetchStats(period)

    return {
      response_type: 'in_channel',
      text: `*System Statistics (${period})*`,
      attachments: [
        {
          color: '#2196F3',
          fields: [
            { title: 'Total Tasks', value: stats.totalTasks.toString(), short: true },
            { title: 'Completed', value: stats.completedTasks.toString(), short: true },
            { title: 'Failed', value: stats.failedTasks.toString(), short: true },
            { title: 'Success Rate', value: `${stats.successRate}%`, short: true },
            { title: 'Active Agents', value: stats.activeAgents.toString(), short: true },
            { title: 'Total Agents', value: stats.totalAgents.toString(), short: true }
          ]
        }
      ]
    }
  }

  /**
   * Handle /help
   */
  private async handleHelp(): Promise<CommandResponse> {
    const commandList = Array.from(this.commands.values())
      .map(cmd => `• \`${cmd.name}\` - ${cmd.description}`)
      .join('\n')

    return {
      response_type: 'ephemeral',
      text: `*AgentForge Commands*\n\n${commandList}\n\nType \`/agentforge help <command>\` for detailed usage.`
    }
  }

  /**
   * Handle /help <command>
   */
  private async handleCommandHelp(commandName: string): Promise<CommandResponse> {
    const command = this.commands.get(commandName)
    if (!command) {
      return {
        response_type: 'ephemeral',
        text: `Unknown command: ${commandName}`
      }
    }

    return {
      response_type: 'ephemeral',
      text: `*${command.name}*\n${command.description}\n\nUsage: \`${command.usage}\``
    }
  }

  /**
   * Data integration methods - integrated with Zustand stores
   */
  private async fetchAgents(): Promise<any[]> {
    const buildStore = useBuildStore.getState()
    const agents = buildStore.inventoryItems.filter(item => item.category === 'agents')
    return agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      status: 'active',
      category: agent.category
    }))
  }

  private async fetchAgent(id: string): Promise<any | null> {
    const buildStore = useBuildStore.getState()
    const agent = buildStore.inventoryItems.find(item => item.id === id)
    if (!agent) return null

    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      category: agent.category,
      status: 'active'
    }
  }

  private async fetchTasks(): Promise<any[]> {
    const taskStore = useTaskStore.getState()
    return taskStore.tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      agentId: task.agentId,
      agentName: task.agentName,
      createdAt: task.createdAt
    }))
  }

  private async fetchTask(id: string): Promise<any | null> {
    const taskStore = useTaskStore.getState()
    const task = taskStore.tasks.find(t => t.id === id)
    if (!task) return null

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      agentId: task.agentId,
      agentName: task.agentName,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
      result: task.result
    }
  }

  private async createTask(description: string): Promise<string> {
    const taskStore = useTaskStore.getState()
    const taskId = 'task_' + Date.now()

    taskStore.addTask({
      title: description,
      description: description,
      status: 'pending',
      priority: 'medium',
      agentId: null,
      agentName: 'Unassigned',
      tags: ['slack-created']
    })

    return taskId
  }

  private async cancelTask(id: string): Promise<void> {
    const taskStore = useTaskStore.getState()
    taskStore.updateTask(id, { status: 'failed' })
  }

  private async fetchStats(period: string): Promise<any> {
    const taskStore = useTaskStore.getState()
    const buildStore = useBuildStore.getState()

    const stats = taskStore.getTaskStats()
    const agents = buildStore.inventoryItems.filter(item => item.category === 'agents')

    return {
      totalTasks: stats.total,
      completedTasks: stats.completed,
      failedTasks: stats.failed,
      successRate: stats.total > 0 ? (stats.completed / stats.total * 100).toFixed(1) + '%' : '0%',
      activeAgents: agents.length,
      totalAgents: agents.length,
      pendingTasks: stats.pending,
      inProgressTasks: stats.in_progress
    }
  }
}
