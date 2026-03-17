/**
 * Discord Integration
 * Complete Discord integration for AgentForge
 */

export { DiscordClient } from './DiscordClient'
export { DiscordNotifier } from './DiscordNotifier'
export { DiscordCommandsHandler } from './DiscordCommands'

export type {
  DiscordConfig,
  DiscordEmbed,
  DiscordMessage,
  DiscordComponent,
  DiscordUser,
  DiscordChannel,
  DiscordGuild,
  DiscordInteraction
} from './DiscordClient'

export type {
  AgentStatus,
  TaskInfo,
  SystemAlert
} from './DiscordNotifier'

export type {
  CommandHandler,
  CommandResponse,
  CommandDefinition,
  CommandOption
} from './DiscordCommands'
