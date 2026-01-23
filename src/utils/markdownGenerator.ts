import type { AgentItem, Category } from '../types'

// Category emojis for summary
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

/**
 * Generate combined agents.md from equipped items
 */
export function generateMarkdown(items: AgentItem[], name: string = 'custom-agent'): string {
  if (items.length === 0) {
    return `---
name: ${name}
description: Empty agent configuration
tools: [Read, Glob, Grep, Edit, Write]
model: sonnet
---

No components equipped.`
  }

  // Extract tools from items if any
  const toolItems = items.filter(i => i.category === 'tools')
  const defaultTools = ['Read', 'Glob', 'Grep', 'Edit', 'Write']
  const agentTools = [...defaultTools, ...toolItems.map(t => t.name)]

  // Note: If we had specific tool mapping we would add them here
  // For now we default to the standard set + any capability implied by "tools" items

  const summary = generateSummary(items)

  const frontmatter = [
    '---',
    `name: ${name}`,
    `description: Custom agent configuration (${summary})`,
    `tools: [${agentTools.join(', ')}]`,
    'model: sonnet',
    '---'
  ].join('\n')

  const sections: string[] = []
  sections.push(frontmatter)
  sections.push('')

  // Group items by category
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

  for (const item of items) {
    if (categorized[item.category]) {
      categorized[item.category].push(item)
    }
  }

  // Output categories in logical order
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
      // Clean up content
      let content = item.content || ''

      // Defensive: handle if content is somehow an object
      if (typeof content !== 'string') {
        try {
          content = JSON.stringify(content, null, 2)
        } catch (e) {
          content = String(content)
        }
      }

      content = content.trim()

      // If content starts with a # heading that matches the name, remove it
      const headingMatch = content.match(/^#\s+(.+)$/m)
      if (headingMatch && headingMatch[1].toLowerCase() === item.name.toLowerCase()) {
        content = content.replace(/^#\s+.+\n*/m, '').trim()
      }

      sections.push(`### ${item.name}`)
      sections.push('')
      sections.push(content)
      sections.push('')
    }
  }

  return sections.join('\n')
}

/**
 * Generate a summary of equipped items
 */
export function generateSummary(items: AgentItem[]): string {
  if (items.length === 0) return 'No components equipped'

  const counts: Partial<Record<Category, number>> = {}
  let totalTokens = 0

  for (const item of items) {
    counts[item.category] = (counts[item.category] || 0) + 1
    totalTokens += item.tokens
  }

  const parts: string[] = []
  for (const [category, count] of Object.entries(counts)) {
    const icon = CATEGORY_EMOJIS[category as Category] || '•'
    parts.push(`${icon} ${count}`)
  }

  return `${parts.join(' • ')} | ~${totalTokens} tokens`
}
