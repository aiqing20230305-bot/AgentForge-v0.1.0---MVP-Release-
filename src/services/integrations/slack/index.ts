/**
 * Slack Integration
 * Complete Slack integration for AgentForge
 */

export { SlackClient } from './SlackClient'
export { SlackNotifier } from './SlackNotifier'
export { SlackCommandsHandler } from './SlackCommands'

export type {
  SlackConfig,
  SlackMessage,
  SlackAttachment,
  SlackBlock,
  SlackUser,
  SlackChannel,
  SlackCommand,
  SlackOAuthResponse
} from './SlackClient'

export type {
  AgentStatus,
  TaskInfo,
  SystemAlert
} from './SlackNotifier'

export type {
  CommandHandler,
  CommandResponse,
  CommandDefinition
} from './SlackCommands'
