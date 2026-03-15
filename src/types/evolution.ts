/**
 * Core Evolution System Types
 * 核心进化系统类型定义
 */

export interface HeartbeatData {
  agentId: string
  timestamp: string
  vitality: number              // 0-100
  heartRate: number             // 心跳频率（次/分钟）
  status: 'healthy' | 'warning' | 'critical' | 'offline'

  metrics: {
    taskQueueLength: number
    avgTaskDuration: number     // 秒
    tokenUsageRate: number      // Token/小时
    successRate: number         // 百分比
    idleTime: number           // 闲置时间（秒）
  }

  warnings: string[]           // 警告列表
}

export interface HeartbeatHistory {
  agentId: string
  records: HeartbeatData[]     // 最近100次心跳
  firstBeat: string
  totalBeats: number
}

export interface EvolutionEvent {
  id: string
  agentId: string
  ruleId: string
  ruleName: string
  timestamp: string
  pointsCost: number

  previousStats: {
    level: number
    vitality: number
    evolutionLevel: number
    [key: string]: any
  }

  newStats: {
    level: number
    vitality: number
    evolutionLevel: number
    [key: string]: any
  }

  impact: {
    statsBoost?: Record<string, number>
    resourceBoost?: Record<string, number>
    attributeBoost?: Record<string, number>
    skillUnlock?: string[]
    vitalityBonus?: number
    experienceBonus?: number
    maxConcurrentTasks?: number
    dailyBonusMultiplier?: number
  }

  trigger: 'auto' | 'manual'
}

export interface EvolutionRule {
  id: string
  name: string
  description: string
  category: 'performance' | 'resource' | 'skill' | 'survival' | 'recovery' | 'balanced' | 'dedication' | 'innovation'
  priority: number
  requiredPoints: number
  requiredLevel: number

  conditions: {
    minSuccessRate?: number
    maxTokenEfficiency?: number
    minCompletedTasks?: number
    maxAvgDuration?: number
    minSkillLevel?: number
    minTaskQueueLength?: number
    minFailedTasks?: number
    recentSuccessRate?: number
    minSkillCount?: number
    minAvgSkillLevel?: number
    minActiveDays?: number
    maxIdleTime?: number
    minUniqueTaskTypes?: number
    experimentalSuccessRate?: number
  }

  effects: {
    statsBoost?: Record<string, number>
    resourceBoost?: Record<string, number>
    attributeBoost?: Record<string, number>
    skillUnlock?: string[]
    vitalityBonus?: number
    experienceBonus?: number
    maxConcurrentTasks?: number
    dailyBonusMultiplier?: number
  }

  metadata: {
    icon: string
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
    description: string
  }
}

export interface VitalityReport {
  current: number
  trend: 'improving' | 'stable' | 'declining'
  recommendations: string[]
  predictions: {
    in1Hour: number
    in1Day: number
    in1Week: number
  }
}

export interface EvolutionConfig {
  heartbeatInterval: number     // 毫秒
  evolutionCheckInterval: number
  autoEvolutionEnabled: boolean
  notificationsEnabled: boolean
  vitalityThresholds: {
    critical: number
    warning: number
    healthy: number
  }
}
