import { describe, expect, it } from 'vitest'
import {
  ALL_AVATARS,
  AVATAR_COLORS,
  AVATAR_LIBRARY,
  getAvatarByRole,
  getAvatarDisplay,
  getColorForAgent,
  getRandomAvatar,
  getRandomAvatarColor,
  getRandomAvatarFromCategory,
  getUniqueRandomAvatars,
  isValidEmoji,
} from '../avatarLibrary'
import { countTokens, formatTokens, getTokenBudgetStatus } from '../tokenizer'

describe('avatarLibrary', () => {
  it('picks avatars from the library and by role', () => {
    expect(ALL_AVATARS.length).toBeGreaterThan(0)
    expect(AVATAR_LIBRARY.robots).toContain(getRandomAvatarFromCategory('robots'))
    expect(AVATAR_COLORS).toContain(getRandomAvatarColor())
    expect(ALL_AVATARS).toContain(getRandomAvatar())
    expect(getUniqueRandomAvatars(3)).toHaveLength(3)
    expect(getUniqueRandomAvatars(10_000).length).toBeLessThanOrEqual(ALL_AVATARS.length)

    for (const role of ['leader', 'warrior', 'analyst', 'artist', 'support', 'unknown role']) {
      expect(getAvatarByRole(role)).toBeTruthy()
    }
    expect(isValidEmoji('🤖')).toBe(true)
    expect(isValidEmoji('abc')).toBe(false)
    expect(getAvatarDisplay(undefined)).toBeTruthy()
    expect(getAvatarDisplay('🤖')).toBe('🤖')
    expect(getAvatarDisplay('https://example.com/a.png')).toBe('https://example.com/a.png')
    expect(getAvatarDisplay('http://example.com/a.png')).toContain('http://')
    expect(getAvatarDisplay('data:image/png;base64,aa')).toContain('data:')
    expect(getAvatarDisplay('plain')).toBeTruthy()
    expect(getColorForAgent('agent-a')).toBe(getColorForAgent('agent-a'))
    expect(AVATAR_COLORS).toContain(getColorForAgent('agent-b'))
  })
})

describe('tokenizer', () => {
  it('counts, formats, and rates a token budget', () => {
    expect(countTokens('hello world')).toBeGreaterThan(0)
    expect(formatTokens(999)).toBe('999')
    expect(formatTokens(1500)).toBe('1.5k')
    expect(getTokenBudgetStatus(10, 100)).toBe('safe')
    expect(getTokenBudgetStatus(80, 100)).toBe('warning')
    expect(getTokenBudgetStatus(95, 100)).toBe('danger')
  })
})
