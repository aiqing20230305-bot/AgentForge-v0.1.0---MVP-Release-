/**
 * 测试 Agent 数据
 * 用于快速测试 AgentForge 功能
 */

import type { AgentData } from '../store/useDataSourceStore'

/**
 * 丽娜姐 - 高级产品经理测试Agent
 */
export const linaJieAgent: AgentData = {
  id: 'lina-jie-test-001',
  name: 'lina-jie',
  displayName: '丽娜姐',
  avatar: '👩‍💼',
  sourceId: 'local',
  sourceName: '本地测试',

  // 等级系统
  level: 25,
  exp: 15800,
  maxExp: 18000,
  levelSystem: {
    currentLevel: 25,
    currentExp: 15800,
    totalExp: 15800,
    expToNextLevel: 2200,
    prestigeLevel: 0,
    levelHistory: [
      { level: 24, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), expGained: 1800 },
      { level: 25, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), expGained: 2000 }
    ]
  },

  // 技能树
  skillTree: {
    unlockedSkills: [
      'product_planning',      // 产品规划
      'user_research',         // 用户研究
      'data_analysis',         // 数据分析
      'prototype_design',      // 原型设计
      'agile_management',      // 敏捷管理
      'feature_prioritization' // 功能优先级
    ],
    activeSkills: [],
    skillLevels: {
      product_planning: 8,
      user_research: 7,
      data_analysis: 9,
      prototype_design: 6,
      agile_management: 7,
      feature_prioritization: 8
    },
    skillPoints: 3
  },

  // 核心进化系统
  coreEvolution: {
    vitality: 92,              // 生命力
    heartRate: 64,             // 心率
    lastHeartbeat: new Date().toISOString(),
    evolutionPoints: 450,      // 进化点
    evolutionLevel: 3,         // 进化等级
    totalEvolutions: 3,        // 总进化次数
    healthStatus: 'healthy',
    autoEvolutionEnabled: true,
    unlockedRules: [
      'efficient_executor',
      'task_master',
      'quick_learner'
    ]
  },

  // 能量预算
  energyBudget: {
    dailyLimit: 50000,
    weeklyLimit: 300000,
    monthlyLimit: 1000000,
    alertThreshold: 0.8
  },

  // 能量统计
  energyStats: {
    totalTokensUsed: 346550,
    tokensUsedToday: 12350,
    tokensUsedThisWeek: 89200,
    tokensUsedThisMonth: 245000,
    averagePerTask: 2221,
    peakTokensPerHour: 8500
  },

  // PvP战斗属性
  pvpStats: {
    totalBattles: 18,
    wins: 14,
    losses: 4,
    winRate: 0.78,
    mmr: 1850,
    rankTier: 'gold' as const,
    rankPoints: 1850
  },

  // 基本技能列表
  skills: [
    '产品规划',
    '用户研究',
    '数据分析',
    '原型设计',
    '敏捷管理',
    '功能优先级'
  ],

  // 角色和个性
  role: '高级产品经理',
  personality: '专业、果断、追求完美。擅长产品规划和用户体验优化，对细节有极致追求。',
  description: '资深产品经理，10年+产品经验，擅长从0到1打造爆款产品。精通用户研究、数据分析、原型设计。对产品质量有极致追求，是团队的质量守门人。',

  color: '#E91E63', // 玫瑰红
  status: 'idle' as const,

  // 元数据
  metadata: {
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60天前创建
    lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),   // 2小时前活跃
    coins: 3250,
    totalTasksCompleted: 156,
    totalTasksFailed: 8,
    averageTaskDuration: 1800, // 30分钟
    specialties: ['产品规划', '用户体验', '数据驱动', 'MVP设计', 'A/B测试'],
    achievements: [
      'task_master',
      'efficiency_expert',
      'battle_winner',
      'level_25_reached',
      'perfect_week'
    ]
  }
}

/**
 * 其他测试Agent（未来扩展）
 */
export const testAgents: AgentData[] = [
  linaJieAgent,
  // 可以添加更多测试Agent
]

/**
 * 为丽娜姐生成初始测试任务
 */
export const linaJieTestTasks = [
  {
    id: 'lina-task-001',
    title: '验证 AgentForge 核心功能',
    description: '测试Agent展示、任务管理、升级系统等核心功能是否正常工作',
    agentId: 'lina-jie-test-001',
    agentName: '丽娜姐',
    status: 'pending' as const,
    priority: 'high' as const,
    tags: ['测试', '验收'],
    estimatedDuration: 3600,
    createdAt: new Date().toISOString(),
    tokenMetrics: {
      estimatedTokens: 5000,
      actualTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      model: 'claude-opus-4-6',
      costUSD: 0
    },
    metadata: {
      testCase: true,
      category: 'qa'
    }
  },
  {
    id: 'lina-task-002',
    title: '体验技能升级系统',
    description: '测试技能点分配、技能升级、技能效果展示等功能',
    agentId: 'lina-jie-test-001',
    agentName: '丽娜姐',
    status: 'pending' as const,
    priority: 'medium' as const,
    tags: ['技能', '测试'],
    estimatedDuration: 1800,
    createdAt: new Date().toISOString(),
    tokenMetrics: {
      estimatedTokens: 3000,
      actualTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      model: 'claude-opus-4-6',
      costUSD: 0
    }
  },
  {
    id: 'lina-task-003',
    title: '参与 PvP 战斗测试',
    description: '挑战其他Agent，测试战斗系统、技能释放、战斗动画等',
    agentId: 'lina-jie-test-001',
    agentName: '丽娜姐',
    status: 'pending' as const,
    priority: 'medium' as const,
    tags: ['战斗', 'PvP'],
    estimatedDuration: 2400,
    createdAt: new Date().toISOString(),
    tokenMetrics: {
      estimatedTokens: 4000,
      actualTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      model: 'claude-opus-4-6',
      costUSD: 0
    }
  },
  {
    id: 'lina-task-004',
    title: '验证心跳监控和进化系统',
    description: '检查生命力仪表盘、健康状态、自动进化触发等功能',
    agentId: 'lina-jie-test-001',
    agentName: '丽娜姐',
    status: 'pending' as const,
    priority: 'high' as const,
    tags: ['进化', '监控'],
    estimatedDuration: 3000,
    createdAt: new Date().toISOString(),
    tokenMetrics: {
      estimatedTokens: 4500,
      actualTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      model: 'claude-opus-4-6',
      costUSD: 0
    }
  },
  {
    id: 'lina-task-005',
    title: '测试成就系统和奖励',
    description: '解锁成就、查看进度、领取奖励，验证成就系统完整性',
    agentId: 'lina-jie-test-001',
    agentName: '丽娜姐',
    status: 'completed' as const,
    priority: 'low' as const,
    tags: ['成就', '奖励'],
    estimatedDuration: 1200,
    actualDuration: 1150,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    tokenMetrics: {
      estimatedTokens: 2000,
      actualTokens: 1950,
      inputTokens: 850,
      outputTokens: 1100,
      model: 'claude-opus-4-6',
      costUSD: 0.0293
    }
  }
]

/**
 * 添加测试Agent到Store
 */
export function loadTestAgent(agentId: string = 'lina-jie-test-001'): AgentData | null {
  const agent = testAgents.find(a => a.id === agentId)
  return agent || null
}

/**
 * 获取所有测试Agent
 */
export function getAllTestAgents(): AgentData[] {
  return testAgents
}
