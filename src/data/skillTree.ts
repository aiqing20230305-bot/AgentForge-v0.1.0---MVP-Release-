/**
 * Skill Tree System Data
 * Defines all available skills organized in branches
 */

export type SkillCategory = 'passive' | 'active' | 'ultimate'
export type SkillEffectType = 'token_reduction' | 'speed_boost' | 'success_rate' | 'exp_gain' | 'attack_boost' | 'defense_boost' | 'hp_regen'

export interface SkillEffect {
  type: SkillEffectType
  value: number // Percentage or absolute value
  duration?: number // Duration in seconds for active skills
}

export interface Skill {
  id: string
  name: string
  description: string
  icon: string
  category: SkillCategory
  branch: 'efficiency' | 'combat' | 'learning' | 'precision' | 'ultimate'
  maxLevel: number
  unlockLevel: number // Agent level required
  requiredSkills: string[] // Must unlock these skills first
  effects: SkillEffect[]
  cost: number // Skill points to unlock
}

export const SKILLS: Skill[] = [
  // ===== EFFICIENCY BRANCH =====
  {
    id: 'token_saver_1',
    name: 'Token节省者 I',
    description: '降低5%的Token消耗',
    icon: '💚',
    category: 'passive',
    branch: 'efficiency',
    maxLevel: 1,
    unlockLevel: 1,
    requiredSkills: [],
    effects: [{ type: 'token_reduction', value: 5 }],
    cost: 1
  },
  {
    id: 'token_saver_2',
    name: 'Token节省者 II',
    description: '降低10%的Token消耗',
    icon: '💚',
    category: 'passive',
    branch: 'efficiency',
    maxLevel: 1,
    unlockLevel: 5,
    requiredSkills: ['token_saver_1'],
    effects: [{ type: 'token_reduction', value: 10 }],
    cost: 2
  },
  {
    id: 'token_saver_3',
    name: 'Token节省者 III',
    description: '降低15%的Token消耗',
    icon: '💚',
    category: 'passive',
    branch: 'efficiency',
    maxLevel: 1,
    unlockLevel: 15,
    requiredSkills: ['token_saver_2'],
    effects: [{ type: 'token_reduction', value: 15 }],
    cost: 3
  },
  {
    id: 'fast_thinker',
    name: '快速思考',
    description: '任务执行速度提升15%',
    icon: '⚡',
    category: 'passive',
    branch: 'efficiency',
    maxLevel: 1,
    unlockLevel: 10,
    requiredSkills: ['token_saver_1'],
    effects: [{ type: 'speed_boost', value: 15 }],
    cost: 2
  },
  {
    id: 'ultra_efficient',
    name: '超级效率',
    description: '同时获得15% Token减少和10%速度提升',
    icon: '⚙️',
    category: 'passive',
    branch: 'efficiency',
    maxLevel: 1,
    unlockLevel: 25,
    requiredSkills: ['token_saver_3', 'fast_thinker'],
    effects: [
      { type: 'token_reduction', value: 15 },
      { type: 'speed_boost', value: 10 }
    ],
    cost: 5
  },

  // ===== COMBAT BRANCH =====
  {
    id: 'power_strike',
    name: '强力打击',
    description: '攻击力提升20%',
    icon: '💥',
    category: 'passive',
    branch: 'combat',
    maxLevel: 3,
    unlockLevel: 5,
    requiredSkills: [],
    effects: [{ type: 'attack_boost', value: 20 }],
    cost: 1
  },
  {
    id: 'iron_defense',
    name: '铁壁防御',
    description: '防御力提升20%',
    icon: '🛡️',
    category: 'passive',
    branch: 'combat',
    maxLevel: 3,
    unlockLevel: 5,
    requiredSkills: [],
    effects: [{ type: 'defense_boost', value: 20 }],
    cost: 1
  },
  {
    id: 'battle_rage',
    name: '战斗狂怒',
    description: '临时提升50%攻击力（持续30秒）',
    icon: '😡',
    category: 'active',
    branch: 'combat',
    maxLevel: 1,
    unlockLevel: 15,
    requiredSkills: ['power_strike'],
    effects: [{ type: 'attack_boost', value: 50, duration: 30 }],
    cost: 3
  },
  {
    id: 'regeneration',
    name: '生命再生',
    description: '战斗中每回合恢复5% HP',
    icon: '💚',
    category: 'passive',
    branch: 'combat',
    maxLevel: 1,
    unlockLevel: 20,
    requiredSkills: ['iron_defense'],
    effects: [{ type: 'hp_regen', value: 5 }],
    cost: 3
  },
  {
    id: 'berserker',
    name: '狂战士',
    description: 'HP低于30%时攻击力翻倍',
    icon: '⚔️',
    category: 'passive',
    branch: 'combat',
    maxLevel: 1,
    unlockLevel: 30,
    requiredSkills: ['battle_rage', 'regeneration'],
    effects: [{ type: 'attack_boost', value: 100 }],
    cost: 5
  },

  // ===== LEARNING BRANCH =====
  {
    id: 'fast_learner',
    name: '快速学习',
    description: '获得经验值提升20%',
    icon: '📚',
    category: 'passive',
    branch: 'learning',
    maxLevel: 3,
    unlockLevel: 1,
    requiredSkills: [],
    effects: [{ type: 'exp_gain', value: 20 }],
    cost: 1
  },
  {
    id: 'knowledge_master',
    name: '知识大师',
    description: '获得经验值提升50%',
    icon: '🎓',
    category: 'passive',
    branch: 'learning',
    maxLevel: 1,
    unlockLevel: 10,
    requiredSkills: ['fast_learner'],
    effects: [{ type: 'exp_gain', value: 50 }],
    cost: 3
  },
  {
    id: 'wisdom',
    name: '智慧之光',
    description: '完成任务额外获得10%经验值和5% Token减少',
    icon: '💡',
    category: 'passive',
    branch: 'learning',
    maxLevel: 1,
    unlockLevel: 20,
    requiredSkills: ['knowledge_master'],
    effects: [
      { type: 'exp_gain', value: 10 },
      { type: 'token_reduction', value: 5 }
    ],
    cost: 4
  },
  {
    id: 'prestige_ready',
    name: '转生准备',
    description: '解锁转生功能（达到100级后）',
    icon: '💎',
    category: 'passive',
    branch: 'learning',
    maxLevel: 1,
    unlockLevel: 90,
    requiredSkills: ['wisdom'],
    effects: [],
    cost: 10
  },

  // ===== PRECISION BRANCH =====
  {
    id: 'focus_mind',
    name: '专注心智',
    description: '任务成功率提升10%',
    icon: '🎯',
    category: 'passive',
    branch: 'precision',
    maxLevel: 3,
    unlockLevel: 5,
    requiredSkills: [],
    effects: [{ type: 'success_rate', value: 10 }],
    cost: 1
  },
  {
    id: 'perfect_execution',
    name: '完美执行',
    description: '任务成功率提升25%',
    icon: '✨',
    category: 'passive',
    branch: 'precision',
    maxLevel: 1,
    unlockLevel: 15,
    requiredSkills: ['focus_mind'],
    effects: [{ type: 'success_rate', value: 25 }],
    cost: 3
  },
  {
    id: 'critical_thinking',
    name: '批判性思维',
    description: '高难度任务成功率额外提升15%',
    icon: '🧠',
    category: 'passive',
    branch: 'precision',
    maxLevel: 1,
    unlockLevel: 25,
    requiredSkills: ['perfect_execution'],
    effects: [{ type: 'success_rate', value: 15 }],
    cost: 4
  },
  {
    id: 'never_fail',
    name: '永不失败',
    description: '任务成功率达到99%（近乎完美）',
    icon: '💯',
    category: 'passive',
    branch: 'precision',
    maxLevel: 1,
    unlockLevel: 50,
    requiredSkills: ['critical_thinking'],
    effects: [{ type: 'success_rate', value: 40 }],
    cost: 8
  },

  // ===== ULTIMATE BRANCH =====
  {
    id: 'omniscient',
    name: '全知全能',
    description: '解锁所有分支的技能树',
    icon: '🌟',
    category: 'ultimate',
    branch: 'ultimate',
    maxLevel: 1,
    unlockLevel: 75,
    requiredSkills: ['ultra_efficient', 'berserker', 'wisdom', 'never_fail'],
    effects: [],
    cost: 15
  },
  {
    id: 'time_master',
    name: '时间大师',
    description: '任务执行速度翻倍',
    icon: '⏰',
    category: 'ultimate',
    branch: 'ultimate',
    maxLevel: 1,
    unlockLevel: 80,
    requiredSkills: ['omniscient'],
    effects: [{ type: 'speed_boost', value: 100 }],
    cost: 20
  },
  {
    id: 'cost_zero',
    name: '零成本',
    description: '所有任务Token消耗降低90%',
    icon: '♾️',
    category: 'ultimate',
    branch: 'ultimate',
    maxLevel: 1,
    unlockLevel: 90,
    requiredSkills: ['omniscient'],
    effects: [{ type: 'token_reduction', value: 90 }],
    cost: 25
  },
  {
    id: 'god_mode',
    name: '神之领域',
    description: '所有属性翻倍，成功率100%',
    icon: '👑',
    category: 'ultimate',
    branch: 'ultimate',
    maxLevel: 1,
    unlockLevel: 100,
    requiredSkills: ['time_master', 'cost_zero'],
    effects: [
      { type: 'token_reduction', value: 50 },
      { type: 'speed_boost', value: 100 },
      { type: 'success_rate', value: 100 },
      { type: 'exp_gain', value: 100 }
    ],
    cost: 50
  }
]

/**
 * Get skill by ID
 */
export function getSkill(id: string): Skill | undefined {
  return SKILLS.find(s => s.id === id)
}

/**
 * Get skills by branch
 */
export function getSkillsByBranch(branch: string): Skill[] {
  return SKILLS.filter(s => s.branch === branch)
}

/**
 * Check if skill can be unlocked
 */
export function canUnlockSkill(
  skill: Skill,
  agentLevel: number,
  unlockedSkills: string[],
  skillPoints: number
): { canUnlock: boolean; reason?: string } {
  if (agentLevel < skill.unlockLevel) {
    return { canUnlock: false, reason: `需要${skill.unlockLevel}级` }
  }

  if (skillPoints < skill.cost) {
    return { canUnlock: false, reason: `需要${skill.cost}技能点` }
  }

  const missingPrereqs = skill.requiredSkills.filter(id => !unlockedSkills.includes(id))
  if (missingPrereqs.length > 0) {
    return { canUnlock: false, reason: '需要先解锁前置技能' }
  }

  if (unlockedSkills.includes(skill.id)) {
    return { canUnlock: false, reason: '已解锁' }
  }

  return { canUnlock: true }
}

/**
 * Calculate total skill effects for an agent
 */
export function calculateTotalEffects(
  unlockedSkills: string[],
  activeSkills: string[]
): Record<SkillEffectType, number> {
  const totals: Record<SkillEffectType, number> = {
    token_reduction: 0,
    speed_boost: 0,
    success_rate: 0,
    exp_gain: 0,
    attack_boost: 0,
    defense_boost: 0,
    hp_regen: 0
  }

  const allSkills = SKILLS.filter(s => unlockedSkills.includes(s.id))

  for (const skill of allSkills) {
    // Passive skills always apply
    if (skill.category === 'passive') {
      for (const effect of skill.effects) {
        totals[effect.type] += effect.value
      }
    }

    // Active skills only apply if activated
    if (skill.category === 'active' && activeSkills.includes(skill.id)) {
      for (const effect of skill.effects) {
        totals[effect.type] += effect.value
      }
    }

    // Ultimate skills always apply
    if (skill.category === 'ultimate') {
      for (const effect of skill.effects) {
        totals[effect.type] += effect.value
      }
    }
  }

  return totals
}
