import { encode } from 'gpt-tokenizer'

/**
 * Count tokens in a string using gpt-tokenizer
 * This uses the GPT-4 tokenizer which is close to Claude's tokenization
 */
export function countTokens(text: string): number {
  try {
    const tokens = encode(text)
    return tokens.length
  } catch {
    // Fallback: rough estimate based on words/characters
    // Average ~4 characters per token for English
    return Math.ceil(text.length / 4)
  }
}

/**
 * Format token count for display
 */
export function formatTokens(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

/**
 * Get token budget status
 */
export function getTokenBudgetStatus(current: number, max: number): 'safe' | 'warning' | 'danger' {
  const percentage = (current / max) * 100
  if (percentage >= 90) return 'danger'
  if (percentage >= 75) return 'warning'
  return 'safe'
}
