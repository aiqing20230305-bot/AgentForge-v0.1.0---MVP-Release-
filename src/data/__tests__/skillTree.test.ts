import { describe, expect, it } from 'vitest'
import {
  SKILLS,
  calculateTotalEffects,
  canUnlockSkill,
  getSkill,
  getSkillsByBranch,
} from '../skillTree'

describe('skillTree', () => {
  it('looks up skills and branches', () => {
    expect(SKILLS.length).toBeGreaterThan(0)
    const first = SKILLS[0]
    expect(getSkill(first.id)?.name).toBe(first.name)
    expect(getSkill('missing')).toBeUndefined()
    expect(getSkillsByBranch(first.branch).every(skill => skill.branch === first.branch)).toBe(true)
    expect(getSkillsByBranch('missing-branch')).toEqual([])
  })

  it('explains why a skill cannot be unlocked and sums active effects', () => {
    const costly = SKILLS.find(skill => skill.cost > 0) ?? SKILLS[0]
    expect(canUnlockSkill(costly, 0, [], 0).canUnlock).toBe(false)
    expect(canUnlockSkill(costly, costly.unlockLevel, [], 0).reason).toContain('技能点')
    expect(canUnlockSkill(costly, 99, [], 999).canUnlock).toBe(
      costly.requiredSkills.length === 0
    )
    expect(canUnlockSkill(costly, 99, [costly.id, ...costly.requiredSkills], 999).reason).toBe('已解锁')

    const withPrereq = SKILLS.find(skill => skill.requiredSkills.length > 0)
    if (withPrereq) {
      expect(canUnlockSkill(withPrereq, 99, [], 999).reason).toContain('前置')
      expect(
        canUnlockSkill(withPrereq, 99, withPrereq.requiredSkills, 999).canUnlock
      ).toBe(true)
    }

    const passive = SKILLS.find(skill => skill.category === 'passive')
    const active = SKILLS.find(skill => skill.category === 'active')
    const ultimate = SKILLS.find(skill => skill.category === 'ultimate')
    const totals = calculateTotalEffects(
      [passive?.id, active?.id, ultimate?.id].filter(Boolean) as string[],
      active ? [active.id] : []
    )
    expect(totals.token_reduction).toBeGreaterThanOrEqual(0)
    expect(calculateTotalEffects([], []).attack_boost).toBe(0)
  })
})
