import { describe, expect, it } from 'vitest'
import type { AgentItem, Category } from '../../types'
import {
  generateClaudeConfig,
  generateCustomConfig,
  generateGeminiConfig,
  generateOpenAIConfig,
  generateOpenClawConfig,
  generatePlatformConfig,
  getPlatformExtension,
} from '../platformGenerators'

const categories: Category[] = [
  'roles',
  'skills',
  'behaviors',
  'personalities',
  'constraints',
  'contexts',
  'formats',
  'tools',
]

function item(category: Category, name = category): AgentItem {
  return {
    id: name,
    path: `/tmp/${name}.md`,
    name,
    category,
    content: `${name} line\nsecond`,
    tokens: 12,
    rarity: 'common',
    modifiedAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('platformGenerators', () => {
  const items = categories.map(category => item(category))

  it('renders every platform, including an empty config and the default branch', () => {
    expect(generateClaudeConfig([], 'empty')).toContain('Empty agent configuration')
    expect(generateClaudeConfig(items, 'hero')).toContain('## Roles')
    expect(generateOpenAIConfig(items, 'hero')).toContain('Custom Instructions')
    expect(generateGeminiConfig(items, 'hero')).toContain('System Prompt')
    expect(generateOpenClawConfig(items, 'hero')).toContain('hero')
    expect(generateCustomConfig(items, 'hero')).toContain('agent: hero')

    for (const platform of ['claude', 'openai', 'gemini', 'openclaw', 'custom'] as const) {
      expect(generatePlatformConfig(platform, items, 'hero').length).toBeGreaterThan(0)
    }
    expect(generatePlatformConfig('claude', items, 'hero')).toContain('name: hero')
  })

  it('maps file extensions', () => {
    expect(getPlatformExtension('openclaw')).toBe('json')
    expect(getPlatformExtension('custom')).toBe('yaml')
    expect(getPlatformExtension('claude')).toBe('md')
    expect(getPlatformExtension('openai')).toBe('md')
  })
})
