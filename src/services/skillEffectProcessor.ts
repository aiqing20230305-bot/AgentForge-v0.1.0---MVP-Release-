/**
 * Skill Effect Processor
 * Handles skill effects, cooldowns, and activation for agents
 */

import type { SkillEffect, SkillEffectType, Skill, SkillCategory } from '../data/skillTree'
import type { Task } from '../types/task'

export interface ActiveSkillInstance {
  skillId: string
  activatedAt: number
  expiresAt: number
  effects: SkillEffect[]
}

export interface SkillCooldown {
  skillId: string
  cooldownUntil: number
}

export interface SkillEffectContext {
  agentId: string
  agentLevel: number
  unlockedSkills: string[]
  activeSkills: ActiveSkillInstance[]
  cooldowns: SkillCooldown[]
  task?: Task
}

export interface ProcessedEffects {
  tokenReduction: number // Percentage 0-100
  speedBoost: number // Percentage 0-100
  successRate: number // Percentage 0-100
  expGain: number // Percentage 0-100
  attackBoost: number // Percentage 0-100
  defenseBoost: number // Percentage 0-100
  hpRegen: number // Percentage 0-100

  // Computed values
  totalTokenMultiplier: number // e.g., 0.85 for 15% reduction
  totalSpeedMultiplier: number // e.g., 1.2 for 20% boost
  totalSuccessMultiplier: number // e.g., 1.1 for 10% boost
  totalExpMultiplier: number // e.g., 1.5 for 50% boost
}

export interface SkillActivationResult {
  success: boolean
  message: string
  cooldownUntil?: number
  effects?: SkillEffect[]
}

/**
 * Skill Effect Processor Service
 * Manages all skill effects, activations, and cooldowns
 */
class SkillEffectProcessor {
  private contexts: Map<string, SkillEffectContext> = new Map()

  /**
   * Initialize skill context for an agent
   */
  initializeContext(
    agentId: string,
    agentLevel: number,
    unlockedSkills: string[]
  ): SkillEffectContext {
    const context: SkillEffectContext = {
      agentId,
      agentLevel,
      unlockedSkills,
      activeSkills: [],
      cooldowns: []
    }

    this.contexts.set(agentId, context)
    return context
  }

  /**
   * Get or create context for agent
   */
  getContext(agentId: string): SkillEffectContext | undefined {
    return this.contexts.get(agentId)
  }

  /**
   * Update agent's unlocked skills
   */
  updateUnlockedSkills(agentId: string, unlockedSkills: string[]): void {
    const context = this.contexts.get(agentId)
    if (context) {
      context.unlockedSkills = unlockedSkills
    }
  }

  /**
   * Calculate all active effects for an agent
   */
  calculateEffects(
    agentId: string,
    skills: Skill[],
    context?: SkillEffectContext
  ): ProcessedEffects {
    const ctx = context || this.contexts.get(agentId)
    if (!ctx) {
      return this.getDefaultEffects()
    }

    // Clean up expired active skills
    this.cleanupExpiredSkills(ctx)

    const effects: ProcessedEffects = this.getDefaultEffects()

    // Process passive skills (always active)
    const passiveSkills = skills.filter(
      s => s.category === 'passive' && ctx.unlockedSkills.includes(s.id)
    )

    for (const skill of passiveSkills) {
      this.applySkillEffects(skill.effects, effects)
    }

    // Process ultimate skills (always active when unlocked)
    const ultimateSkills = skills.filter(
      s => s.category === 'ultimate' && ctx.unlockedSkills.includes(s.id)
    )

    for (const skill of ultimateSkills) {
      this.applySkillEffects(skill.effects, effects)
    }

    // Process active skills (only when activated)
    for (const activeSkill of ctx.activeSkills) {
      this.applySkillEffects(activeSkill.effects, effects)
    }

    // Calculate multipliers
    effects.totalTokenMultiplier = 1 - (effects.tokenReduction / 100)
    effects.totalSpeedMultiplier = 1 + (effects.speedBoost / 100)
    effects.totalSuccessMultiplier = 1 + (effects.successRate / 100)
    effects.totalExpMultiplier = 1 + (effects.expGain / 100)

    return effects
  }

  /**
   * Activate an active skill
   */
  activateSkill(
    agentId: string,
    skill: Skill
  ): SkillActivationResult {
    const context = this.contexts.get(agentId)
    if (!context) {
      return {
        success: false,
        message: 'Agent context not initialized'
      }
    }

    // Check if skill is unlocked
    if (!context.unlockedSkills.includes(skill.id)) {
      return {
        success: false,
        message: 'Skill not unlocked'
      }
    }

    // Check if skill is on cooldown
    const now = Date.now()
    const cooldown = context.cooldowns.find(c => c.skillId === skill.id)
    if (cooldown && cooldown.cooldownUntil > now) {
      const remainingSeconds = Math.ceil((cooldown.cooldownUntil - now) / 1000)
      return {
        success: false,
        message: `Skill on cooldown (${remainingSeconds}s remaining)`,
        cooldownUntil: cooldown.cooldownUntil
      }
    }

    // Check if it's an active skill
    if (skill.category !== 'active') {
      return {
        success: false,
        message: 'Only active skills can be activated'
      }
    }

    // Get skill duration (default 30s if not specified)
    const duration = skill.effects[0]?.duration || 30
    const expiresAt = now + (duration * 1000)

    // Add to active skills
    const activeSkill: ActiveSkillInstance = {
      skillId: skill.id,
      activatedAt: now,
      expiresAt,
      effects: skill.effects
    }

    context.activeSkills.push(activeSkill)

    // Set cooldown (2x duration)
    const cooldownDuration = duration * 2
    const cooldownUntil = now + (cooldownDuration * 1000)

    // Remove old cooldown if exists
    context.cooldowns = context.cooldowns.filter(c => c.skillId !== skill.id)
    context.cooldowns.push({ skillId: skill.id, cooldownUntil })

    return {
      success: true,
      message: `Skill activated! Effects last ${duration}s, cooldown ${cooldownDuration}s`,
      cooldownUntil,
      effects: skill.effects
    }
  }

  /**
   * Get cooldown status for a skill
   */
  getCooldownStatus(
    agentId: string,
    skillId: string
  ): { onCooldown: boolean; remainingMs: number; remainingSeconds: number } {
    const context = this.contexts.get(agentId)
    if (!context) {
      return { onCooldown: false, remainingMs: 0, remainingSeconds: 0 }
    }

    const now = Date.now()
    const cooldown = context.cooldowns.find(c => c.skillId === skillId)

    if (!cooldown || cooldown.cooldownUntil <= now) {
      return { onCooldown: false, remainingMs: 0, remainingSeconds: 0 }
    }

    const remainingMs = cooldown.cooldownUntil - now
    return {
      onCooldown: true,
      remainingMs,
      remainingSeconds: Math.ceil(remainingMs / 1000)
    }
  }

  /**
   * Get all active skills for an agent
   */
  getActiveSkills(agentId: string): ActiveSkillInstance[] {
    const context = this.contexts.get(agentId)
    if (!context) return []

    this.cleanupExpiredSkills(context)
    return [...context.activeSkills]
  }

  /**
   * Apply skill effects to task execution
   */
  applyEffectsToTask(
    agentId: string,
    task: Task,
    effects: ProcessedEffects
  ): Task {
    const modifiedTask = { ...task }

    // Apply token reduction
    if (modifiedTask.tokenMetrics) {
      modifiedTask.tokenMetrics.estimatedTokens = Math.floor(
        modifiedTask.tokenMetrics.estimatedTokens * effects.totalTokenMultiplier
      )
    }

    // Apply speed boost (reduce estimated duration)
    if (modifiedTask.estimatedDuration) {
      modifiedTask.estimatedDuration = Math.floor(
        modifiedTask.estimatedDuration / effects.totalSpeedMultiplier
      )
    }

    return modifiedTask
  }

  /**
   * Apply effects to task result
   */
  applyEffectsToResult(
    effects: ProcessedEffects,
    baseExp: number,
    baseSuccessRate: number
  ): { exp: number; successRate: number } {
    return {
      exp: Math.floor(baseExp * effects.totalExpMultiplier),
      successRate: Math.min(100, baseSuccessRate * effects.totalSuccessMultiplier)
    }
  }

  /**
   * Generate visual effect data for UI
   */
  generateVisualEffect(skill: Skill): SkillVisualEffect {
    const colors = this.getEffectColors(skill)
    const particles = this.getParticleConfig(skill)

    return {
      skillId: skill.id,
      name: skill.name,
      icon: skill.icon,
      colors,
      particles,
      animation: this.getAnimationType(skill),
      duration: skill.effects[0]?.duration || 30
    }
  }

  /**
   * Clean up expired active skills
   */
  private cleanupExpiredSkills(context: SkillEffectContext): void {
    const now = Date.now()
    context.activeSkills = context.activeSkills.filter(s => s.expiresAt > now)
    context.cooldowns = context.cooldowns.filter(c => c.cooldownUntil > now + 60000) // Keep for 1 min after expiry
  }

  /**
   * Apply skill effects to the effects object
   */
  private applySkillEffects(
    effects: SkillEffect[],
    target: ProcessedEffects
  ): void {
    for (const effect of effects) {
      switch (effect.type) {
        case 'token_reduction':
          target.tokenReduction += effect.value
          break
        case 'speed_boost':
          target.speedBoost += effect.value
          break
        case 'success_rate':
          target.successRate += effect.value
          break
        case 'exp_gain':
          target.expGain += effect.value
          break
        case 'attack_boost':
          target.attackBoost += effect.value
          break
        case 'defense_boost':
          target.defenseBoost += effect.value
          break
        case 'hp_regen':
          target.hpRegen += effect.value
          break
      }
    }
  }

  /**
   * Get default empty effects
   */
  private getDefaultEffects(): ProcessedEffects {
    return {
      tokenReduction: 0,
      speedBoost: 0,
      successRate: 0,
      expGain: 0,
      attackBoost: 0,
      defenseBoost: 0,
      hpRegen: 0,
      totalTokenMultiplier: 1,
      totalSpeedMultiplier: 1,
      totalSuccessMultiplier: 1,
      totalExpMultiplier: 1
    }
  }

  /**
   * Get effect colors based on skill type
   */
  private getEffectColors(skill: Skill): string[] {
    const colorMap: Record<string, string[]> = {
      efficiency: ['#10b981', '#34d399', '#6ee7b7'],
      combat: ['#ef4444', '#f87171', '#fca5a5'],
      learning: ['#3b82f6', '#60a5fa', '#93c5fd'],
      precision: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
      ultimate: ['#f59e0b', '#fbbf24', '#fcd34d']
    }

    return colorMap[skill.branch] || ['#6366f1', '#818cf8', '#a5b4fc']
  }

  /**
   * Get particle configuration
   */
  private getParticleConfig(skill: Skill): ParticleConfig {
    const baseConfig: ParticleConfig = {
      count: 50,
      size: { min: 2, max: 6 },
      speed: { min: 1, max: 3 },
      lifetime: { min: 1, max: 2 }
    }

    // Adjust based on skill category
    if (skill.category === 'ultimate') {
      baseConfig.count = 100
      baseConfig.size = { min: 4, max: 10 }
    } else if (skill.category === 'active') {
      baseConfig.count = 75
      baseConfig.size = { min: 3, max: 8 }
    }

    return baseConfig
  }

  /**
   * Get animation type for skill
   */
  private getAnimationType(skill: Skill): AnimationType {
    const animationMap: Record<string, AnimationType> = {
      efficiency: 'pulse',
      combat: 'explosion',
      learning: 'spiral',
      precision: 'beam',
      ultimate: 'nova'
    }

    return animationMap[skill.branch] || 'pulse'
  }

  /**
   * Reset agent context
   */
  resetContext(agentId: string): void {
    this.contexts.delete(agentId)
  }

  /**
   * Clear all contexts
   */
  clearAll(): void {
    this.contexts.clear()
  }
}

// Visual effect types
export interface SkillVisualEffect {
  skillId: string
  name: string
  icon: string
  colors: string[]
  particles: ParticleConfig
  animation: AnimationType
  duration: number
}

export interface ParticleConfig {
  count: number
  size: { min: number; max: number }
  speed: { min: number; max: number }
  lifetime: { min: number; max: number }
}

export type AnimationType = 'pulse' | 'explosion' | 'spiral' | 'beam' | 'nova'

// Global singleton instance
export const skillEffectProcessor = new SkillEffectProcessor()
