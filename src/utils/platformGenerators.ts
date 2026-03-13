import type { AgentItem, Category } from '../types'

export type AIPlatform = 'claude' | 'openai' | 'gemini' | 'openclaw' | 'custom'

/**
 * Generate configuration for Claude platform
 */
export function generateClaudeConfig(items: AgentItem[], name: string): string {
  const toolItems = items.filter(i => i.category === 'tools')
  const defaultTools = ['Read', 'Glob', 'Grep', 'Edit', 'Write']
  const agentTools = [...defaultTools, ...toolItems.map(t => t.name)]

  const summary = generateSummary(items)

  const frontmatter = [
    '---',
    `name: ${name}`,
    `description: ${summary}`,
    `tools: [${agentTools.join(', ')}]`,
    'model: sonnet',
    '---'
  ].join('\n')

  return frontmatter + '\n\n' + generateCategorizedSections(items)
}

/**
 * Generate configuration for OpenAI platform (custom instructions format)
 */
export function generateOpenAIConfig(items: AgentItem[], name: string): string {
  const sections: string[] = []

  sections.push(`# ${name}`)
  sections.push('')
  sections.push('## About Me')
  sections.push(`This is an AI agent configuration named "${name}".`)
  sections.push('')

  sections.push('## Custom Instructions')
  sections.push('')

  // Group by category
  const categorized = categorizeItems(items)

  if (categorized.roles.length > 0) {
    sections.push('### Role & Identity')
    categorized.roles.forEach(item => {
      sections.push(`**${item.name}**`)
      sections.push(item.content)
      sections.push('')
    })
  }

  if (categorized.behaviors.length > 0) {
    sections.push('### Behavior Guidelines')
    categorized.behaviors.forEach(item => {
      sections.push(`**${item.name}**`)
      sections.push(item.content)
      sections.push('')
    })
  }

  if (categorized.skills.length > 0) {
    sections.push('### Capabilities')
    categorized.skills.forEach(item => {
      sections.push(`- ${item.name}: ${item.content.substring(0, 100)}...`)
    })
    sections.push('')
  }

  return sections.join('\n')
}

/**
 * Generate configuration for Gemini platform
 */
export function generateGeminiConfig(items: AgentItem[], name: string): string {
  const sections: string[] = []

  sections.push(`# System Prompt for ${name}`)
  sections.push('')
  sections.push('You are an AI assistant with the following configuration:')
  sections.push('')

  const categorized = categorizeItems(items)

  // Roles
  if (categorized.roles.length > 0) {
    sections.push('## Your Role')
    categorized.roles.forEach(item => {
      sections.push(item.content)
      sections.push('')
    })
  }

  // Skills & Behaviors combined
  const capabilities = [...categorized.skills, ...categorized.behaviors]
  if (capabilities.length > 0) {
    sections.push('## Your Capabilities')
    capabilities.forEach(item => {
      sections.push(`### ${item.name}`)
      sections.push(item.content)
      sections.push('')
    })
  }

  // Constraints
  if (categorized.constraints.length > 0) {
    sections.push('## Important Constraints')
    categorized.constraints.forEach(item => {
      sections.push(`- **${item.name}**: ${item.content}`)
    })
    sections.push('')
  }

  return sections.join('\n')
}

/**
 * Generate configuration for OpenClaw platform
 */
export function generateOpenClawConfig(items: AgentItem[], name: string): string {
  const categorized = categorizeItems(items)

  const config: any = {
    name,
    version: '1.0.0',
    platform: 'feishu',
    ai: {
      provider: 'litellm',
      baseURL: 'https://cloudnative.tezign.com/litellm/api/v1',
      model: 'claude-sonnet-4.5',
      fallback_models: ['claude-haiku-4.5', 'claude-sonnet-4']
    },
    bot: {
      name: name,
      description: generateSummary(items),
      avatar: '🦞'
    },
    capabilities: {},
    behaviors: {},
    constraints: {},
    context: {}
  }

  // Map items to config sections
  if (categorized.roles.length > 0) {
    config.bot.role = categorized.roles[0].content
  }

  if (categorized.skills.length > 0) {
    config.capabilities = categorized.skills.reduce((acc, item) => {
      acc[item.name] = item.content
      return acc
    }, {} as any)
  }

  if (categorized.behaviors.length > 0) {
    config.behaviors = categorized.behaviors.reduce((acc, item) => {
      acc[item.name] = item.content
      return acc
    }, {} as any)
  }

  if (categorized.constraints.length > 0) {
    config.constraints = categorized.constraints.reduce((acc, item) => {
      acc[item.name] = item.content
      return acc
    }, {} as any)
  }

  if (categorized.contexts.length > 0) {
    config.context = categorized.contexts.reduce((acc, item) => {
      acc[item.name] = item.content
      return acc
    }, {} as any)
  }

  return JSON.stringify(config, null, 2)
}

/**
 * Generate configuration for custom platform (YAML format)
 */
export function generateCustomConfig(items: AgentItem[], name: string): string {
  const sections: string[] = []

  sections.push(`agent: ${name}`)
  sections.push(`description: ${generateSummary(items)}`)
  sections.push('')

  const categorized = categorizeItems(items)

  Object.entries(categorized).forEach(([category, categoryItems]) => {
    if (categoryItems.length > 0) {
      sections.push(`${category}:`)
      categoryItems.forEach(item => {
        sections.push(`  - name: ${item.name}`)
        sections.push(`    tokens: ${item.tokens}`)
        sections.push(`    content: |`)
        item.content.split('\n').forEach(line => {
          sections.push(`      ${line}`)
        })
        sections.push('')
      })
    }
  })

  return sections.join('\n')
}

/**
 * Main generator function that routes to platform-specific generators
 */
export function generatePlatformConfig(
  platform: AIPlatform,
  items: AgentItem[],
  name: string
): string {
  switch (platform) {
    case 'claude':
      return generateClaudeConfig(items, name)
    case 'openai':
      return generateOpenAIConfig(items, name)
    case 'gemini':
      return generateGeminiConfig(items, name)
    case 'openclaw':
      return generateOpenClawConfig(items, name)
    case 'custom':
      return generateCustomConfig(items, name)
    default:
      return generateClaudeConfig(items, name)
  }
}

/**
 * Get file extension for platform
 */
export function getPlatformExtension(platform: AIPlatform): string {
  switch (platform) {
    case 'openclaw':
      return 'json'
    case 'custom':
      return 'yaml'
    default:
      return 'md'
  }
}

// Helper functions

function categorizeItems(items: AgentItem[]) {
  const categorized: Record<Category, AgentItem[]> = {
    roles: [],
    skills: [],
    behaviors: [],
    personalities: [],
    constraints: [],
    contexts: [],
    formats: [],
    tools: []
  }

  items.forEach(item => {
    if (categorized[item.category]) {
      categorized[item.category].push(item)
    }
  })

  return categorized
}

function generateCategorizedSections(items: AgentItem[]): string {
  const categorized = categorizeItems(items)
  const sections: string[] = []

  const categoryOrder: Category[] = [
    'roles',
    'personalities',
    'behaviors',
    'skills',
    'contexts',
    'constraints',
    'formats',
    'tools'
  ]

  for (const category of categoryOrder) {
    const categoryItems = categorized[category]
    if (categoryItems.length === 0) continue

    const title = category.charAt(0).toUpperCase() + category.slice(1)
    sections.push(`## ${title}`)
    sections.push('')

    for (const item of categoryItems) {
      sections.push(`### ${item.name}`)
      sections.push('')
      sections.push(item.content.trim())
      sections.push('')
    }
  }

  return sections.join('\n')
}

function generateSummary(items: AgentItem[]): string {
  if (items.length === 0) return 'Empty agent configuration'

  const counts: Partial<Record<Category, number>> = {}
  let totalTokens = 0

  for (const item of items) {
    counts[item.category] = (counts[item.category] || 0) + 1
    totalTokens += item.tokens
  }

  const CATEGORY_EMOJIS: Record<Category, string> = {
    roles: '👤',
    skills: '⚡',
    behaviors: '🎭',
    personalities: '✨',
    constraints: '🚫',
    contexts: '📍',
    formats: '📋',
    tools: '🔧'
  }

  const parts: string[] = []
  for (const [category, count] of Object.entries(counts)) {
    const icon = CATEGORY_EMOJIS[category as Category] || '•'
    parts.push(`${icon} ${count}`)
  }

  return `${parts.join(' • ')} | ~${totalTokens} tokens`
}
