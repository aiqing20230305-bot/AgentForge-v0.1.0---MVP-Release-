import { describe, it, expect } from 'vitest'
import { getRandomAvatar, isValidEmoji } from '../avatarLibrary'

describe('avatarLibrary', () => {
  describe('getRandomAvatar', () => {
    it('should return a string', () => {
      const avatar = getRandomAvatar()
      expect(typeof avatar).toBe('string')
    })

    it('should return a non-empty string', () => {
      const avatar = getRandomAvatar()
      expect(avatar.length).toBeGreaterThan(0)
    })

    it('should return different avatars when called multiple times', () => {
      const avatars = new Set()
      for (let i = 0; i < 10; i++) {
        avatars.add(getRandomAvatar())
      }
      // Should get at least 2 different avatars in 10 calls
      expect(avatars.size).toBeGreaterThan(1)
    })
  })

  describe('isValidEmoji', () => {
    it('should validate emoji characters as true', () => {
      expect(isValidEmoji('🤖')).toBe(true)
      expect(isValidEmoji('🦾')).toBe(true)
      expect(isValidEmoji('🧠')).toBe(true)
      expect(isValidEmoji('⚡')).toBe(true)
    })

    it('should validate non-emoji strings as false', () => {
      expect(isValidEmoji('test')).toBe(false)
      expect(isValidEmoji('123')).toBe(false)
      expect(isValidEmoji('')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isValidEmoji(' ')).toBe(false)
      expect(isValidEmoji('abc🤖')).toBe(true) // Contains emoji
    })
  })
})
