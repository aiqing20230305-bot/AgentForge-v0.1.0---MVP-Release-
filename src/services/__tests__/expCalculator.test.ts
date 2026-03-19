import { describe, it, expect } from 'vitest'
import { ExpCalculator } from '../expCalculator'
import type { Task, TaskPriority } from '../../types/task'

describe('ExpCalculator', () => {
  describe('calculateTaskExp', () => {
    it('should calculate base experience for a simple task', () => {
      const task: Partial<Task> = {
        priority: 'medium',
        actualDuration: undefined,
        tokenMetrics: undefined,
      }

      const exp = ExpCalculator.calculateTaskExp(task as Task)
      expect(exp).toBe(150) // Base 100 * medium multiplier 1.5
    })

    it('should apply priority multipliers correctly', () => {
      const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent']
      const expected = [100, 150, 200, 300]

      priorities.forEach((priority, index) => {
        const task: Partial<Task> = { priority }
        const exp = ExpCalculator.calculateTaskExp(task as Task)
        expect(exp).toBe(expected[index])
      })
    })

    it('should apply duration bonus', () => {
      const task: Partial<Task> = {
        priority: 'low',
        actualDuration: 600, // 10 minutes in seconds
        tokenMetrics: undefined,
      }

      const exp = ExpCalculator.calculateTaskExp(task as Task)
      expect(exp).toBeGreaterThan(100) // Should be more than base
      expect(exp).toBeLessThan(200) // But not too much
    })

    it('should apply token usage bonus', () => {
      const task: Partial<Task> = {
        priority: 'low',
        actualDuration: undefined,
        tokenMetrics: {
          estimatedTokens: 5000,
          actualTokens: 5000,
          costUSD: 0.25,
        },
      }

      const exp = ExpCalculator.calculateTaskExp(task as Task)
      expect(exp).toBeGreaterThan(100) // Should have token bonus
    })

    it('should combine all bonuses correctly', () => {
      const taskWithAllBonuses: Partial<Task> = {
        priority: 'high',
        actualDuration: 3600, // 60 minutes
        tokenMetrics: {
          estimatedTokens: 10000,
          actualTokens: 10000,
          costUSD: 0.5,
        },
      }

      const exp = ExpCalculator.calculateTaskExp(taskWithAllBonuses as Task)
      expect(exp).toBeGreaterThan(400) // Should be significantly boosted
    })

    it('should return rounded integer values', () => {
      const task: Partial<Task> = {
        priority: 'medium',
        actualDuration: 123, // Odd duration
      }

      const exp = ExpCalculator.calculateTaskExp(task as Task)
      expect(Number.isInteger(exp)).toBe(true)
    })
  })

  describe('calculateExpForLevel', () => {
    it('should calculate exp for level 1', () => {
      expect(ExpCalculator.calculateExpForLevel(1)).toBe(100)
    })

    it('should calculate exp for level 2', () => {
      expect(ExpCalculator.calculateExpForLevel(2)).toBe(150)
    })

    it('should calculate exp for level 10', () => {
      const exp = ExpCalculator.calculateExpForLevel(10)
      expect(exp).toBeGreaterThan(3000)
      expect(exp).toBeLessThan(4000)
    })

    it('should return increasing values for higher levels', () => {
      const level5 = ExpCalculator.calculateExpForLevel(5)
      const level10 = ExpCalculator.calculateExpForLevel(10)
      const level15 = ExpCalculator.calculateExpForLevel(15)

      expect(level10).toBeGreaterThan(level5)
      expect(level15).toBeGreaterThan(level10)
    })

    it('should use exponential growth formula', () => {
      // Formula: 100 * 1.5^(level-1)
      // Verify the pattern
      const level1 = ExpCalculator.calculateExpForLevel(1)
      const level2 = ExpCalculator.calculateExpForLevel(2)

      expect(level2 / level1).toBeCloseTo(1.5, 1)
    })
  })

  describe('calculateTotalExpForLevel', () => {
    it('should return 0 for level 1', () => {
      expect(ExpCalculator.calculateTotalExpForLevel(1)).toBe(0)
    })

    it('should return 100 for level 2', () => {
      // Total exp from level 1 to 2 is just level 1's requirement
      expect(ExpCalculator.calculateTotalExpForLevel(2)).toBe(100)
    })

    it('should return cumulative sum for higher levels', () => {
      const totalLevel5 = ExpCalculator.calculateTotalExpForLevel(5)
      const totalLevel4 = ExpCalculator.calculateTotalExpForLevel(4)
      const level4Requirement = ExpCalculator.calculateExpForLevel(4)

      expect(totalLevel5).toBe(totalLevel4 + level4Requirement)
    })

    it('should increase monotonically', () => {
      const levels = [1, 2, 5, 10, 20]
      const totals = levels.map(l => ExpCalculator.calculateTotalExpForLevel(l))

      for (let i = 1; i < totals.length; i++) {
        expect(totals[i]).toBeGreaterThan(totals[i - 1])
      }
    })
  })

  describe('calculateLevelFromExp', () => {
    it('should return level 1 for 0 exp', () => {
      expect(ExpCalculator.calculateLevelFromExp(0)).toBe(1)
    })

    it('should return level 1 for 99 exp', () => {
      expect(ExpCalculator.calculateLevelFromExp(99)).toBe(1)
    })

    it('should return level 2 for 100 exp', () => {
      expect(ExpCalculator.calculateLevelFromExp(100)).toBe(2)
    })

    it('should return level 2 for 249 exp', () => {
      // 100 (level 1) + 149 < 150 (level 2 requirement)
      expect(ExpCalculator.calculateLevelFromExp(249)).toBe(2)
    })

    it('should return level 3 for 250 exp', () => {
      // 100 + 150 = 250 (exactly enough for level 3)
      expect(ExpCalculator.calculateLevelFromExp(250)).toBe(3)
    })

    it('should handle large exp values', () => {
      const level = ExpCalculator.calculateLevelFromExp(100000)
      expect(level).toBeGreaterThan(1)
      expect(level).toBeLessThan(100) // Reasonable upper bound
    })

    it('should be inverse of calculateTotalExpForLevel', () => {
      const testLevels = [2, 5, 10, 15, 20]

      testLevels.forEach(targetLevel => {
        const totalExp = ExpCalculator.calculateTotalExpForLevel(targetLevel)
        const calculatedLevel = ExpCalculator.calculateLevelFromExp(totalExp)
        expect(calculatedLevel).toBe(targetLevel)
      })
    })
  })

  describe('calculateLevelProgress', () => {
    it('should calculate progress at level 1 with 0 exp', () => {
      const progress = ExpCalculator.calculateLevelProgress(0, 1)

      expect(progress.currentLevelExp).toBe(0)
      expect(progress.expForNextLevel).toBe(100)
      expect(progress.percentage).toBe(0)
    })

    it('should calculate progress at level 1 with 50 exp', () => {
      const progress = ExpCalculator.calculateLevelProgress(50, 1)

      expect(progress.currentLevelExp).toBe(50)
      expect(progress.expForNextLevel).toBe(100)
      expect(progress.percentage).toBe(50)
    })

    it('should calculate progress at level 2 with 100 exp', () => {
      const progress = ExpCalculator.calculateLevelProgress(100, 2)

      expect(progress.currentLevelExp).toBe(0) // Just reached level 2
      expect(progress.expForNextLevel).toBe(150) // Next level requirement
      expect(progress.percentage).toBe(0)
    })

    it('should calculate progress at level 2 with 175 exp', () => {
      const progress = ExpCalculator.calculateLevelProgress(175, 2)

      expect(progress.currentLevelExp).toBe(75) // 175 - 100 (previous level total)
      expect(progress.expForNextLevel).toBe(150)
      expect(progress.percentage).toBe(50)
    })

    it('should calculate 100% progress when at next level threshold', () => {
      const progress = ExpCalculator.calculateLevelProgress(250, 2)

      expect(progress.currentLevelExp).toBe(150)
      expect(progress.expForNextLevel).toBe(150)
      expect(progress.percentage).toBe(100)
    })

    it('should handle higher levels correctly', () => {
      const level = 10
      const totalExp = ExpCalculator.calculateTotalExpForLevel(level)
      const progress = ExpCalculator.calculateLevelProgress(totalExp, level)

      expect(progress.currentLevelExp).toBe(0)
      expect(progress.percentage).toBe(0)
    })
  })

  describe('calculateSkillPoints', () => {
    it('should return 0 skill points for levels 1-4', () => {
      for (let level = 1; level <= 4; level++) {
        expect(ExpCalculator.calculateSkillPoints(level)).toBe(0)
      }
    })

    it('should return 1 skill point for levels 5-9', () => {
      for (let level = 5; level <= 9; level++) {
        expect(ExpCalculator.calculateSkillPoints(level)).toBe(1)
      }
    })

    it('should return 2 skill points for levels 10-14', () => {
      for (let level = 10; level <= 14; level++) {
        expect(ExpCalculator.calculateSkillPoints(level)).toBe(2)
      }
    })

    it('should return 10 skill points for level 50', () => {
      expect(ExpCalculator.calculateSkillPoints(50)).toBe(10)
    })

    it('should increase by 1 every 5 levels', () => {
      expect(ExpCalculator.calculateSkillPoints(5)).toBe(1)
      expect(ExpCalculator.calculateSkillPoints(10)).toBe(2)
      expect(ExpCalculator.calculateSkillPoints(15)).toBe(3)
      expect(ExpCalculator.calculateSkillPoints(20)).toBe(4)
    })
  })

  describe('calculatePrestigeBenefits', () => {
    it('should return no benefits for prestige level 0', () => {
      const benefits = ExpCalculator.calculatePrestigeBenefits(0)

      expect(benefits.expBonus).toBe(0)
      expect(benefits.skillPointBonus).toBe(0)
      expect(benefits.startingLevel).toBe(1)
    })

    it('should calculate benefits for prestige level 1', () => {
      const benefits = ExpCalculator.calculatePrestigeBenefits(1)

      expect(benefits.expBonus).toBe(10) // 10% bonus
      expect(benefits.skillPointBonus).toBe(5) // 5 bonus points
      expect(benefits.startingLevel).toBe(6) // Start at level 6
    })

    it('should calculate benefits for prestige level 3', () => {
      const benefits = ExpCalculator.calculatePrestigeBenefits(3)

      expect(benefits.expBonus).toBe(30) // 30% bonus
      expect(benefits.skillPointBonus).toBe(15) // 15 bonus points
      expect(benefits.startingLevel).toBe(16) // Start at level 16
    })

    it('should scale linearly with prestige level', () => {
      const prestige1 = ExpCalculator.calculatePrestigeBenefits(1)
      const prestige2 = ExpCalculator.calculatePrestigeBenefits(2)

      expect(prestige2.expBonus).toBe(prestige1.expBonus * 2)
      expect(prestige2.skillPointBonus).toBe(prestige1.skillPointBonus * 2)
      expect(prestige2.startingLevel).toBe(prestige1.startingLevel + 5)
    })

    it('should handle high prestige levels', () => {
      const benefits = ExpCalculator.calculatePrestigeBenefits(10)

      expect(benefits.expBonus).toBe(100) // 100% exp bonus
      expect(benefits.skillPointBonus).toBe(50)
      expect(benefits.startingLevel).toBe(51)
    })
  })

  describe('edge cases', () => {
    it('should handle negative priority (if somehow passed)', () => {
      const task: Partial<Task> = {
        priority: 'low',
        actualDuration: -100, // Negative duration
      }

      // Should not crash
      expect(() => ExpCalculator.calculateTaskExp(task as Task)).not.toThrow()
    })

    it('should handle very large token values', () => {
      const task: Partial<Task> = {
        priority: 'low',
        tokenMetrics: {
          estimatedTokens: 1000000,
          actualTokens: 1000000,
          costUSD: 50,
        },
      }

      const exp = ExpCalculator.calculateTaskExp(task as Task)
      expect(exp).toBeGreaterThan(100)
      expect(Number.isFinite(exp)).toBe(true)
    })

    it('should handle level 0 gracefully', () => {
      // Edge case: level 0 should still work
      const exp = ExpCalculator.calculateExpForLevel(0)
      expect(Number.isFinite(exp)).toBe(true)
    })

    it('should handle very high levels', () => {
      const exp = ExpCalculator.calculateExpForLevel(100)
      expect(Number.isFinite(exp)).toBe(true)
      expect(exp).toBeGreaterThan(0)
    })
  })
})
