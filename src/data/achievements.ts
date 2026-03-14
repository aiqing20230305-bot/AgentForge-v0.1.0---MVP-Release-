/**
 * Achievement System Data
 * Defines all available achievements in AgentForge
 */

export type AchievementCategory = 'tasks' | 'level' | 'skills' | 'pvp' | 'energy' | 'special'
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
  rarity: AchievementRarity
  requirement: number
  rewards: {
    coins?: number
    exp?: number
    title?: string
  }
  hidden?: boolean // Hidden until unlocked
}

export const ACHIEVEMENTS: Achievement[] = [
  // Task Achievements
  {
    id: 'first_task',
    name: '初出茅庐',
    description: '完成第一个任务',
    icon: '🎯',
    category: 'tasks',
    rarity: 'common',
    requirement: 1,
    rewards: { coins: 100, exp: 50 }
  },
  {
    id: 'task_beginner',
    name: '任务新手',
    description: '完成10个任务',
    icon: '📋',
    category: 'tasks',
    rarity: 'common',
    requirement: 10,
    rewards: { coins: 500, exp: 200 }
  },
  {
    id: 'task_master',
    name: '任务大师',
    description: '完成100个任务',
    icon: '⭐',
    category: 'tasks',
    rarity: 'epic',
    requirement: 100,
    rewards: { coins: 5000, exp: 2000, title: '任务大师' }
  },
  {
    id: 'task_legend',
    name: '传奇执行者',
    description: '完成1000个任务',
    icon: '🏆',
    category: 'tasks',
    rarity: 'legendary',
    requirement: 1000,
    rewards: { coins: 50000, exp: 20000, title: '传奇执行者' },
    hidden: true
  },
  {
    id: 'speed_demon',
    name: '速度恶魔',
    description: '在10秒内完成一个任务',
    icon: '⚡',
    category: 'tasks',
    rarity: 'rare',
    requirement: 1,
    rewards: { coins: 1000, exp: 500 }
  },
  {
    id: 'perfect_streak',
    name: '完美连击',
    description: '连续完成20个任务无失败',
    icon: '🔥',
    category: 'tasks',
    rarity: 'rare',
    requirement: 20,
    rewards: { coins: 2000, exp: 1000 }
  },
  {
    id: 'multitasker',
    name: '多线程专家',
    description: '同时执行3个任务',
    icon: '🧠',
    category: 'tasks',
    rarity: 'rare',
    requirement: 1,
    rewards: { coins: 1500, exp: 750 }
  },

  // Level Achievements
  {
    id: 'level_10',
    name: '初级进化',
    description: '达到10级',
    icon: '📈',
    category: 'level',
    rarity: 'common',
    requirement: 10,
    rewards: { coins: 1000, exp: 0 }
  },
  {
    id: 'level_25',
    name: '中级进化',
    description: '达到25级',
    icon: '📊',
    category: 'level',
    rarity: 'rare',
    requirement: 25,
    rewards: { coins: 3000, exp: 0, title: '中级Agent' }
  },
  {
    id: 'level_50',
    name: '高级进化',
    description: '达到50级',
    icon: '🚀',
    category: 'level',
    rarity: 'epic',
    requirement: 50,
    rewards: { coins: 10000, exp: 0, title: '高级Agent' }
  },
  {
    id: 'level_100',
    name: '满级大佬',
    description: '达到100级',
    icon: '👑',
    category: 'level',
    rarity: 'legendary',
    requirement: 100,
    rewards: { coins: 50000, exp: 0, title: '满级Agent' },
    hidden: true
  },
  {
    id: 'first_prestige',
    name: '首次转生',
    description: '完成第一次转生',
    icon: '💎',
    category: 'level',
    rarity: 'legendary',
    requirement: 1,
    rewards: { coins: 100000, exp: 0, title: '转生者' },
    hidden: true
  },

  // Skill Achievements
  {
    id: 'first_skill',
    name: '技能觉醒',
    description: '解锁第一个技能',
    icon: '✨',
    category: 'skills',
    rarity: 'common',
    requirement: 1,
    rewards: { coins: 200, exp: 100 }
  },
  {
    id: 'skill_collector',
    name: '技能收集者',
    description: '解锁10个技能',
    icon: '🎁',
    category: 'skills',
    rarity: 'rare',
    requirement: 10,
    rewards: { coins: 2000, exp: 1000 }
  },
  {
    id: 'skill_master',
    name: '技能大师',
    description: '解锁所有技能',
    icon: '🌟',
    category: 'skills',
    rarity: 'legendary',
    requirement: 25,
    rewards: { coins: 10000, exp: 5000, title: '技能大师' },
    hidden: true
  },
  {
    id: 'max_skill_level',
    name: '技能圆满',
    description: '将一个技能升到满级',
    icon: '💫',
    category: 'skills',
    rarity: 'epic',
    requirement: 1,
    rewards: { coins: 3000, exp: 1500 }
  },

  // PvP Achievements
  {
    id: 'first_battle',
    name: '初入战场',
    description: '参加第一场PvP战斗',
    icon: '⚔️',
    category: 'pvp',
    rarity: 'common',
    requirement: 1,
    rewards: { coins: 300, exp: 150 }
  },
  {
    id: 'first_victory',
    name: '首次胜利',
    description: '赢得第一场PvP战斗',
    icon: '🎉',
    category: 'pvp',
    rarity: 'common',
    requirement: 1,
    rewards: { coins: 500, exp: 250 }
  },
  {
    id: 'pvp_warrior',
    name: 'PvP战士',
    description: '赢得10场PvP战斗',
    icon: '🛡️',
    category: 'pvp',
    rarity: 'rare',
    requirement: 10,
    rewards: { coins: 2000, exp: 1000 }
  },
  {
    id: 'pvp_champion',
    name: 'PvP冠军',
    description: '赢得100场PvP战斗',
    icon: '🏅',
    category: 'pvp',
    rarity: 'legendary',
    requirement: 100,
    rewards: { coins: 20000, exp: 10000, title: 'PvP冠军' },
    hidden: true
  },
  {
    id: 'undefeated',
    name: '无敌战神',
    description: '连胜10场PvP',
    icon: '🔱',
    category: 'pvp',
    rarity: 'epic',
    requirement: 10,
    rewards: { coins: 5000, exp: 2500 }
  },
  {
    id: 'ranked_top10',
    name: '排行榜前十',
    description: '进入PvP排行榜前10名',
    icon: '🏆',
    category: 'pvp',
    rarity: 'epic',
    requirement: 1,
    rewards: { coins: 10000, exp: 5000, title: '排名高手' }
  },

  // Energy Achievements
  {
    id: 'energy_saver',
    name: '节能专家',
    description: '完成50个任务且Token使用低于预算',
    icon: '💚',
    category: 'energy',
    rarity: 'epic',
    requirement: 50,
    rewards: { coins: 3000, exp: 1500 }
  },
  {
    id: 'zero_waste',
    name: '零浪费',
    description: '连续完成20个任务无Token浪费',
    icon: '♻️',
    category: 'energy',
    rarity: 'rare',
    requirement: 20,
    rewards: { coins: 2000, exp: 1000 }
  },
  {
    id: 'efficiency_king',
    name: '效率之王',
    description: 'Token效率提升50%（通过技能）',
    icon: '⚙️',
    category: 'energy',
    rarity: 'epic',
    requirement: 1,
    rewards: { coins: 5000, exp: 2500, title: '效率之王' }
  },

  // Special Achievements
  {
    id: 'early_bird',
    name: '早起的鸟儿',
    description: '在凌晨4-6点完成任务',
    icon: '🌅',
    category: 'special',
    rarity: 'common',
    requirement: 1,
    rewards: { coins: 500, exp: 250 }
  },
  {
    id: 'night_owl',
    name: '夜猫子',
    description: '在午夜12-2点完成任务',
    icon: '🦉',
    category: 'special',
    rarity: 'common',
    requirement: 1,
    rewards: { coins: 500, exp: 250 }
  },
  {
    id: 'perfectionist',
    name: '完美主义者',
    description: '完成100个任务成功率100%',
    icon: '💯',
    category: 'special',
    rarity: 'legendary',
    requirement: 100,
    rewards: { coins: 10000, exp: 5000, title: '完美主义者' },
    hidden: true
  },
  {
    id: 'season_champion',
    name: '赛季冠军',
    description: '在赛季结束时排名第一',
    icon: '👑',
    category: 'special',
    rarity: 'legendary',
    requirement: 1,
    rewards: { coins: 50000, exp: 25000, title: '赛季冠军' },
    hidden: true
  },
  {
    id: 'hardcore',
    name: '硬核玩家',
    description: '连续30天每天完成任务',
    icon: '💪',
    category: 'special',
    rarity: 'epic',
    requirement: 30,
    rewards: { coins: 15000, exp: 7500, title: '硬核玩家' }
  }
]

/**
 * Get achievement by ID
 */
export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id)
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category)
}

/**
 * Get total available achievement points
 */
export function getTotalAchievementPoints(): number {
  return ACHIEVEMENTS.reduce((sum, a) => sum + (a.rewards.exp || 0), 0)
}
