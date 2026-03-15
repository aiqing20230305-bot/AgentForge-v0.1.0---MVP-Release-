/**
 * Evolution Rules System
 * 进化规则系统 - 定义Agent自动进化的触发条件和效果
 */

import type { EvolutionRule } from '../types/evolution'

/**
 * 进化规则库
 * 按优先级排序，高优先级规则优先评估
 */
export const EVOLUTION_RULES: EvolutionRule[] = [
  // ============================================
  // 1. 效率大师 - Efficiency Master
  // ============================================
  {
    id: 'efficiency_master',
    name: '效率大师',
    description: '连续完成高成功率任务，展现卓越的执行能力',
    category: 'performance',
    priority: 90,
    requiredPoints: 100,
    requiredLevel: 5,

    conditions: {
      minSuccessRate: 85,
      minCompletedTasks: 10,
      maxAvgDuration: 1800, // 30分钟
    },

    effects: {
      statsBoost: {
        speed: 1.15,           // 任务速度 +15%
        successRate: 1.05,     // 成功率 +5%
      },
      skillUnlock: ['quick_execution', 'task_optimization'],
      experienceBonus: 1.1,
    },

    metadata: {
      icon: '⚡',
      rarity: 'rare',
      description: '你的执行效率令人惊叹！任务速度提升15%，成功率提升5%。'
    }
  },

  // ============================================
  // 2. Token 优化者 - Token Optimizer
  // ============================================
  {
    id: 'token_optimizer',
    name: 'Token优化者',
    description: '精通资源管理，以最小成本达成最大产出',
    category: 'resource',
    priority: 85,
    requiredPoints: 120,
    requiredLevel: 8,

    conditions: {
      maxTokenEfficiency: 0.7, // Token使用率 < 70%
      minCompletedTasks: 15,
    },

    effects: {
      resourceBoost: {
        tokenEfficiency: 0.85,  // Token消耗 -15%
      },
      skillUnlock: ['smart_caching', 'prompt_optimization'],
      vitalityBonus: 5,
    },

    metadata: {
      icon: '💎',
      rarity: 'epic',
      description: 'Token使用效率大幅提升！所有任务Token消耗减少15%。'
    }
  },

  // ============================================
  // 3. 专精分化 - Specialization
  // ============================================
  {
    id: 'specialization',
    name: '领域专家',
    description: '在特定技能领域深耕，成为不可替代的专家',
    category: 'skill',
    priority: 80,
    requiredPoints: 150,
    requiredLevel: 10,

    conditions: {
      minSkillLevel: 5,        // 至少一个技能达到5级
      minCompletedTasks: 20,
    },

    effects: {
      statsBoost: {
        expertise: 1.25,         // 专精领域 +25%
      },
      skillUnlock: ['domain_mastery'],
      attributeBoost: {
        intelligence: 5,
        wisdom: 5,
      }
    },

    metadata: {
      icon: '🎓',
      rarity: 'epic',
      description: '在专精领域表现提升25%，智力和智慧永久+5。'
    }
  },

  // ============================================
  // 4. 压力适应者 - Stress Adapter
  // ============================================
  {
    id: 'stress_adapter',
    name: '压力战士',
    description: '在高压环境中不断突破，化压力为动力',
    category: 'survival',
    priority: 75,
    requiredPoints: 80,
    requiredLevel: 6,

    conditions: {
      minTaskQueueLength: 15,   // 队列长度 > 15
      minSuccessRate: 70,        // 仍保持70%成功率
    },

    effects: {
      statsBoost: {
        resilience: 1.2,          // 抗压能力 +20%
        multitasking: 1.15,       // 并发能力 +15%
      },
      vitalityBonus: 10,
      maxConcurrentTasks: 1,      // 最大并发任务 +1
    },

    metadata: {
      icon: '🛡️',
      rarity: 'rare',
      description: '抗压能力和并发处理能力显著提升，生命力+10。'
    }
  },

  // ============================================
  // 5. 快速恢复 - Rapid Recovery
  // ============================================
  {
    id: 'rapid_recovery',
    name: '不屈之志',
    description: '从失败中快速恢复，失败使你更强大',
    category: 'recovery',
    priority: 70,
    requiredPoints: 60,
    requiredLevel: 4,

    conditions: {
      minFailedTasks: 5,         // 至少经历5次失败
      recentSuccessRate: 80,     // 最近成功率恢复到80%
    },

    effects: {
      statsBoost: {
        recovery: 1.3,            // 恢复速度 +30%
        learning: 1.1,            // 学习能力 +10%
      },
      skillUnlock: ['error_analysis', 'adaptive_learning'],
      vitalityBonus: 8,
    },

    metadata: {
      icon: '🔥',
      rarity: 'uncommon',
      description: '从失败中汲取经验，恢复速度+30%，学习能力+10%。'
    }
  },

  // ============================================
  // 6. 全能战士 - All-Rounder
  // ============================================
  {
    id: 'all_rounder',
    name: '全能战士',
    description: '多技能均衡发展，没有明显短板',
    category: 'balanced',
    priority: 65,
    requiredPoints: 200,
    requiredLevel: 15,

    conditions: {
      minSkillCount: 5,          // 至少5个技能
      minAvgSkillLevel: 3,       // 平均技能等级 >= 3
    },

    effects: {
      statsBoost: {
        allAttributes: 1.1,       // 全属性 +10%
      },
      skillUnlock: ['versatility', 'quick_switch'],
      experienceBonus: 1.15,
    },

    metadata: {
      icon: '⚔️',
      rarity: 'legendary',
      description: '全面发展！所有属性+10%，经验获取+15%。'
    }
  },

  // ============================================
  // 7. 长期投入者 - Long-term Commitment
  // ============================================
  {
    id: 'long_term_commitment',
    name: '长期主义者',
    description: '持续活跃，日复一日的坚持带来质变',
    category: 'dedication',
    priority: 60,
    requiredPoints: 180,
    requiredLevel: 12,

    conditions: {
      minActiveDays: 30,         // 活跃天数 >= 30天
      maxIdleTime: 86400,        // 闲置时间 < 24小时
    },

    effects: {
      statsBoost: {
        stamina: 1.2,             // 耐力 +20%
        consistency: 1.15,        // 稳定性 +15%
      },
      vitalityBonus: 15,
      dailyBonusMultiplier: 1.2,
    },

    metadata: {
      icon: '📅',
      rarity: 'epic',
      description: '长期主义的回报！耐力+20%，每日奖励+20%。'
    }
  },

  // ============================================
  // 8. 创新先锋 - Innovation Pioneer
  // ============================================
  {
    id: 'innovation_pioneer',
    name: '创新先锋',
    description: '勇于尝试新方法，不断探索未知领域',
    category: 'innovation',
    priority: 55,
    requiredPoints: 140,
    requiredLevel: 9,

    conditions: {
      minUniqueTaskTypes: 10,    // 完成至少10种不同类型任务
      experimentalSuccessRate: 60,
    },

    effects: {
      statsBoost: {
        creativity: 1.25,         // 创造力 +25%
        adaptability: 1.15,       // 适应性 +15%
      },
      skillUnlock: ['creative_problem_solving', 'pattern_recognition'],
      experienceBonus: 1.12,
    },

    metadata: {
      icon: '🚀',
      rarity: 'rare',
      description: '创新能力大幅提升！创造力+25%，适应性+15%。'
    }
  },
]

/**
 * 根据ID获取进化规则
 */
export function getEvolutionRule(ruleId: string): EvolutionRule | undefined {
  return EVOLUTION_RULES.find(rule => rule.id === ruleId)
}

/**
 * 根据类别获取进化规则
 */
export function getEvolutionRulesByCategory(category: EvolutionRule['category']): EvolutionRule[] {
  return EVOLUTION_RULES.filter(rule => rule.category === category)
}

/**
 * 获取Agent当前可解锁的进化规则
 */
export function getAvailableEvolutions(
  agentLevel: number,
  evolutionPoints: number,
  unlockedRules: string[]
): EvolutionRule[] {
  return EVOLUTION_RULES.filter(rule =>
    rule.requiredLevel <= agentLevel &&
    rule.requiredPoints <= evolutionPoints &&
    !unlockedRules.includes(rule.id)
  ).sort((a, b) => b.priority - a.priority)
}

/**
 * 计算进化规则的稀有度分数
 */
export function getRarityScore(rarity: string): number {
  const rarityMap: Record<string, number> = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5
  }
  return rarityMap[rarity] || 1
}
