/**
 * Experience Calculator
 * Handles XP calculations for leveling system
 */

import type { Task, TaskPriority } from '../types/task'

export class ExpCalculator {
  /**
   * Calculate experience gained from completing a task
   */
  static calculateTaskExp(task: Task): number {
    let baseExp = 100

    // Priority multiplier
    const priorityMultipliers: Record<TaskPriority, number> = {
      low: 1.0,
      medium: 1.5,
      high: 2.0,
      urgent: 3.0
    }
    baseExp *= priorityMultipliers[task.priority]

    // Duration bonus (logarithmic scaling)
    if (task.actualDuration) {
      const durationMinutes = task.actualDuration / 60
      baseExp *= 1 + Math.log10(durationMinutes + 1) * 0.5
    }

    // Token usage bonus
    if (task.tokenMetrics?.actualTokens) {
      const tokenBonus = 1 + (task.tokenMetrics.actualTokens / 10000) * 0.2
      baseExp *= tokenBonus
    }

    // First-time completion bonus
    // Track if task type is completed for first time using localStorage
    const firstTimeKey = `first_time_${task.tags?.[0] || 'default'}_${task.agentId}`
    const isFirstTime = !localStorage.getItem(firstTimeKey)

    if (isFirstTime) {
      baseExp *= 1.5
      localStorage.setItem(firstTimeKey, new Date().toISOString())
      console.log(`[ExpCalculator] First-time bonus! +50% exp for task type: ${task.tags?.[0]}`)
    }

    return Math.round(baseExp)
  }

  /**
   * Calculate experience required for a given level
   */
  static calculateExpForLevel(level: number): number {
    // Formula: 100 * 1.5^(level-1)
    // Level 1: 100 XP
    // Level 2: 150 XP
    // Level 10: ~3800 XP
    // Level 50: ~637 million XP
    return Math.round(100 * Math.pow(1.5, level - 1))
  }

  /**
   * Calculate total experience from level 1 to target level
   */
  static calculateTotalExpForLevel(targetLevel: number): number {
    let total = 0
    for (let level = 1; level < targetLevel; level++) {
      total += this.calculateExpForLevel(level)
    }
    return total
  }

  /**
   * Calculate current level from total experience
   */
  static calculateLevelFromExp(totalExp: number): number {
    let level = 1
    let expNeeded = 0

    while (expNeeded <= totalExp) {
      expNeeded += this.calculateExpForLevel(level)
      if (expNeeded <= totalExp) {
        level++
      }
    }

    return level
  }

  /**
   * Calculate experience progress for current level
   */
  static calculateLevelProgress(
    currentExp: number,
    currentLevel: number
  ): {
    currentLevelExp: number
    expForNextLevel: number
    percentage: number
  } {
    const expForPreviousLevel = this.calculateTotalExpForLevel(currentLevel)
    const expForNextLevel = this.calculateExpForLevel(currentLevel)
    const currentLevelExp = currentExp - expForPreviousLevel

    return {
      currentLevelExp,
      expForNextLevel,
      percentage: (currentLevelExp / expForNextLevel) * 100
    }
  }

  /**
   * Award skill points based on level
   */
  static calculateSkillPoints(level: number): number {
    // 1 skill point every 5 levels
    return Math.floor(level / 5)
  }

  /**
   * Calculate prestige benefits
   */
  static calculatePrestigeBenefits(prestigeLevel: number): {
    expBonus: number
    skillPointBonus: number
    startingLevel: number
  } {
    return {
      expBonus: prestigeLevel * 10, // 10% exp bonus per prestige level
      skillPointBonus: prestigeLevel * 5, // 5 bonus skill points per prestige
      startingLevel: 1 + prestigeLevel * 5 // Start at level 6, 11, 16, etc.
    }
  }
}
