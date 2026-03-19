/**
 * Skill Effect Processor Tests
 */

import { skillEffectProcessor } from '../skillEffectProcessor'
import { SKILLS } from '../../data/skillTree'
import type { Task } from '../../types/task'

describe('SkillEffectProcessor', () => {
  const testAgentId = 'test-agent-1'
  const testAgentLevel = 50

  beforeEach(() => {
    // Clear all contexts before each test
    skillEffectProcessor.clearAll()
  })

  describe('Context Management', () => {
    it('should initialize context for an agent', () => {
      const unlockedSkills = ['token_saver_1', 'fast_thinker']
      const context = skillEffectProcessor.initializeContext(
        testAgentId,
        testAgentLevel,
        unlockedSkills
      )

      expect(context).toBeDefined()
      expect(context.agentId).toBe(testAgentId)
      expect(context.agentLevel).toBe(testAgentLevel)
      expect(context.unlockedSkills).toEqual(unlockedSkills)
      expect(context.activeSkills).toEqual([])
      expect(context.cooldowns).toEqual([])
    })

    it('should get existing context', () => {
      skillEffectProcessor.initializeContext(testAgentId, testAgentLevel, [])
      const context = skillEffectProcessor.getContext(testAgentId)

      expect(context).toBeDefined()
      expect(context?.agentId).toBe(testAgentId)
    })

    it('should update unlocked skills', () => {
      skillEffectProcessor.initializeContext(testAgentId, testAgentLevel, ['skill1'])
      skillEffectProcessor.updateUnlockedSkills(testAgentId, ['skill1', 'skill2'])

      const context = skillEffectProcessor.getContext(testAgentId)
      expect(context?.unlockedSkills).toEqual(['skill1', 'skill2'])
    })
  })

  describe('Effect Calculation', () => {
    it('should calculate effects for passive skills', () => {
      const unlockedSkills = ['token_saver_1', 'token_saver_2', 'fast_thinker']
      skillEffectProcessor.initializeContext(testAgentId, testAgentLevel, unlockedSkills)

      const effects = skillEffectProcessor.calculateEffects(testAgentId, SKILLS)

      expect(effects.tokenReduction).toBeGreaterThan(0)
      expect(effects.speedBoost).toBeGreaterThan(0)
      expect(effects.totalTokenMultiplier).toBeLessThan(1)
      expect(effects.totalSpeedMultiplier).toBeGreaterThan(1)
    })

    it('should not apply effects for locked skills', () => {
      skillEffectProcessor.initializeContext(testAgentId, testAgentLevel, [])

      const effects = skillEffectProcessor.calculateEffects(testAgentId, SKILLS)

      expect(effects.tokenReduction).toBe(0)
      expect(effects.speedBoost).toBe(0)
      expect(effects.successRate).toBe(0)
      expect(effects.expGain).toBe(0)
    })

    it('should calculate correct multipliers', () => {
      const unlockedSkills = ['token_saver_1'] // 5% reduction
      skillEffectProcessor.initializeContext(testAgentId, testAgentLevel, unlockedSkills)

      const effects = skillEffectProcessor.calculateEffects(testAgentId, SKILLS)

      expect(effects.tokenReduction).toBe(5)
      expect(effects.totalTokenMultiplier).toBeCloseTo(0.95)
    })
  })

  describe('Skill Activation', () => {
    it('should activate an active skill successfully', () => {
      const battleRage = SKILLS.find(s => s.id === 'battle_rage')!
      skillEffectProcessor.initializeContext(testAgentId, testAgentLevel, ['battle_rage'])

      const result = skillEffectProcessor.activateSkill(testAgentId, battleRage)

      expect(result.success).toBe(true)
      expect(result.cooldownUntil).toBeDefined()
      expect(result.effects).toEqual(battleRage.effects)
    })

    it('should fail to activate locked skill', () => {
      const battleRage = SKILLS.find(s => s.id === 'battle_rage')!
      skillEffectProcessor.initializeContext(testAgentId, testAgentLevel, [])

      const result = skillEffectProcessor.activateSkill(testAgentId, battleRage)

      expect(result.success).toBe(false)
      expect(result.message).toContain('not unlocked')
    })

    it('should fail to activate skill on cooldown', () => {
      const battleRage = SKILLS.find(s => s.id === 'battle_rage')!
      skillEffectProcessor.initializeContext(testAgentId, testAgentLevel, ['battle_rage'])

      // First activation
      skillEffectProcessor.activateSkill(testAgentId, battleRage)

      // Second activation (should fail)
      const result = skillEffectProcessor.activateSkill(testAgentId, battleRage)

      expect(result.success).toBe(false)
      expect(result.message).toContain('cooldown')
    })

    it('should fail to activate passive skill', () => {
      const tokenSaver = SKILLS.find(s => s.id === 'token_saver_1')!
      skillEffectProcessor.initializeContext(testAgentId, testAgentLevel, ['token_saver_1'])

      const result = skillEffectProcessor.activateSkill(testAgentId, tokenSaver)

      expect(result.success).toBe(false)
      expect(result.message).toContain('active skills')
    })
  })

  describe('Cooldown Management', () => {
    it('should track cooldown status', () => {
      const battleRage = SKILLS.find(s => s.id === 'battle_rage')!
      skillEffectProcessor.initializeContext(testAgentId, testAgentLevel, ['battle_rage'])

      skillEffectProcessor.activateSkill(testAgentId, battleRage)

      const status = skillEffectProcessor.getCooldownStatus(testAgentId, 'battle_rage')

      expect(status.onCooldown).toBe(true)
      expect(status.remainingSeconds).toBeGreaterThan(0)
    })

    it('should return no cooldown for inactive skill', () => {
      skillEffectProcessor.initializeContext(testAgentId, testAgentLevel, [])

      const status = skillEffectProcessor.getCooldownStatus(testAgentId, 'battle_rage')

      expect(status.onCooldown).toBe(false)
      expect(status.remainingSeconds).toBe(0)
    })
  })

  describe('Active Skills', () => {
    it('should return active skills', () => {
      const battleRage = SKILLS.find(s => s.id === 'battle_rage')!
      skillEffectProcessor.initializeContext(testAgentId, testAgentLevel, ['battle_rage'])

      skillEffectProcessor.activateSkill(testAgentId, battleRage)

      const activeSkills = skillEffectProcessor.getActiveSkills(testAgentId)

      expect(activeSkills.length).toBe(1)
      expect(activeSkills[0].skillId).toBe('battle_rage')
    })

    it('should clean up expired skills', async () => {
      // Create a skill with very short duration for testing
      const testSkill = {
        ...SKILLS.find(s => s.id === 'battle_rage')!,
        effects: [{ type: 'attack_boost' as const, value: 50, duration: 0.1 }]
      }

      skillEffectProcessor.initializeContext(testAgentId, testAgentLevel, ['battle_rage'])
      skillEffectProcessor.activateSkill(testAgentId, testSkill)

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 200))

      const activeSkills = skillEffectProcessor.getActiveSkills(testAgentId)

      expect(activeSkills.length).toBe(0)
    })
  })

  describe('Task Application', () => {
    it('should apply effects to task', () => {
      const unlockedSkills = ['token_saver_1', 'fast_thinker']
      skillEffectProcessor.initializeContext(testAgentId, testAgentLevel, unlockedSkills)

      const effects = skillEffectProcessor.calculateEffects(testAgentId, SKILLS)

      const task: Task = {
        id: 'test-task',
        title: 'Test Task',
        description: 'Test',
        status: 'pending',
        priority: 'medium',
        agentId: testAgentId,
        agentName: 'Test Agent',
        createdAt: new Date().toISOString(),
        estimatedDuration: 100,
        tokenMetrics: {
          estimatedTokens: 1000,
          actualTokens: 0,
          inputTokens: 0,
          outputTokens: 0,
          model: 'gpt-4',
          costUSD: 0
        }
      }

      const modifiedTask = skillEffectProcessor.applyEffectsToTask(testAgentId, task, effects)

      expect(modifiedTask.tokenMetrics?.estimatedTokens).toBeLessThan(1000)
      expect(modifiedTask.estimatedDuration).toBeLessThan(100)
    })

    it('should apply effects to result', () => {
      const unlockedSkills = ['fast_learner']
      skillEffectProcessor.initializeContext(testAgentId, testAgentLevel, unlockedSkills)

      const effects = skillEffectProcessor.calculateEffects(testAgentId, SKILLS)

      const result = skillEffectProcessor.applyEffectsToResult(effects, 100, 80)

      expect(result.exp).toBeGreaterThan(100)
      expect(result.successRate).toBeGreaterThanOrEqual(80)
    })
  })

  describe('Visual Effects', () => {
    it('should generate visual effect data', () => {
      const battleRage = SKILLS.find(s => s.id === 'battle_rage')!

      const visualEffect = skillEffectProcessor.generateVisualEffect(battleRage)

      expect(visualEffect.skillId).toBe('battle_rage')
      expect(visualEffect.name).toBe(battleRage.name)
      expect(visualEffect.icon).toBe(battleRage.icon)
      expect(visualEffect.colors).toBeDefined()
      expect(visualEffect.particles).toBeDefined()
      expect(visualEffect.animation).toBeDefined()
    })
  })
})
