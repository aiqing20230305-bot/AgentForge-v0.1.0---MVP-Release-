/**
 * 数据源管理 Store
 * 支持多个 OpenClaw 实例和其他 Agent 数据源
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getAvatarByRole } from '../utils/avatarLibrary'

// 数据源类型
export type DataSourceType = 'openclaw' | 'custom-api' | 'local-script' | 'ssh-remote'

// OpenClaw 配置
export interface OpenClawSourceConfig {
  gatewayUrl: string
  authToken: string
}

// 自定义 API 配置
export interface CustomAPISourceConfig {
  apiEndpoint: string
  headers?: Record<string, string>
  authType?: 'bearer' | 'basic' | 'apikey' | 'none'
  authValue?: string
}

// 本地脚本配置
export interface LocalScriptSourceConfig {
  scriptPath: string
  interpreter?: string // node, python, bash, etc.
  args?: string[]
}

// SSH 远程配置
export interface SSHRemoteSourceConfig {
  host: string
  port: number
  username: string
  authMethod: 'password' | 'privatekey'
  password?: string
  privateKeyPath?: string
  openclawPath?: string // remote openclaw installation path
}

// 统一配置类型
export type DataSourceConfig =
  | { type: 'openclaw'; config: OpenClawSourceConfig }
  | { type: 'custom-api'; config: CustomAPISourceConfig }
  | { type: 'local-script'; config: LocalScriptSourceConfig }
  | { type: 'ssh-remote'; config: SSHRemoteSourceConfig }

// 数据源定义
export interface DataSource {
  id: string
  name: string
  description?: string
  type: DataSourceType
  config:
    | OpenClawSourceConfig
    | CustomAPISourceConfig
    | LocalScriptSourceConfig
    | SSHRemoteSourceConfig
  enabled: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
  // 连接状态
  status?: 'online' | 'offline' | 'error' | 'unknown'
  lastChecked?: string
  errorMessage?: string
}

// Energy tracking
export interface EnergyRecord {
  id: string
  taskId: string
  taskTitle: string
  tokensUsed: number
  timestamp: string
  model: string
  duration: number
}

// Level up history
export interface LevelUpRecord {
  level: number
  timestamp: string
  expGained: number
}

// Agent 数据（从数据源获取的标准格式）
export interface AgentData {
  id: string
  name: string
  displayName: string
  sourceId: string // 来自哪个数据源
  sourceName: string
  level: number
  exp: number
  maxExp: number
  role: string
  skills: string[]
  personality?: string
  status: 'online' | 'offline' | 'working' | 'idle' | 'unknown'
  color?: string
  avatar?: string
  description?: string
  metadata?: Record<string, any> // 额外的自定义字段

  // Team collaboration
  teamId?: string // 所属团队ID

  // Energy tracking
  energyStats?: {
    totalTokensUsed: number
    tokensUsedToday: number
    tokensUsedThisWeek: number
    tokensUsedThisMonth: number
    averagePerTask: number
    peakTokensPerHour: number
  }
  energyBudget?: {
    dailyLimit: number
    weeklyLimit: number
    monthlyLimit: number
    alertThreshold: number
  }
  energyHistory?: EnergyRecord[]

  // Leveling system
  levelSystem?: {
    currentLevel: number
    currentExp: number
    expToNextLevel: number
    totalExp: number
    prestigeLevel: number
    levelHistory: LevelUpRecord[]
  }

  // Skill tree
  skillTree?: {
    unlockedSkills: string[]
    activeSkills: string[]
    skillPoints: number
    skillLevels: Record<string, number>
  }

  // Achievements
  achievements?: {
    unlocked: string[]
    progress: Record<string, number>
  }

  // PvP stats
  pvpStats?: {
    wins: number
    losses: number
    winRate: number
    mmr: number
    rankTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master'
    rankPoints: number
    totalBattles: number
  }

  // Core Evolution System (Heart System)
  coreEvolution?: {
    vitality: number              // 0-100 生命力
    heartRate: number             // 心跳频率（次/分钟）
    lastHeartbeat: string        // 最后心跳时间
    evolutionPoints: number      // 进化点
    evolutionLevel: number       // 进化等级 0-10
    totalEvolutions: number      // 总进化次数
    healthStatus: 'healthy' | 'warning' | 'critical' | 'offline'
    autoEvolutionEnabled: boolean
    unlockedRules?: string[]     // 已解锁的进化规则ID列表
    nextEvolution?: {
      ruleId: string
      ruleName: string
      requiredPoints: number
      progress: number           // 0-1
    }
  }
}

interface DataSourceStore {
  // 数据源列表
  sources: DataSource[]
  // 当前选中的数据源 ID
  activeSourceId: string | null
  // 从所有数据源获取的 Agent 数据（缓存）
  agentsCache: AgentData[]

  // 添加数据源
  addSource: (source: Omit<DataSource, 'id' | 'createdAt' | 'updatedAt'>) => string
  // 更新数据源
  updateSource: (id: string, updates: Partial<Omit<DataSource, 'id' | 'createdAt'>>) => void
  // 删除数据源
  removeSource: (id: string) => void
  // 切换数据源启用状态
  toggleSourceEnabled: (id: string) => void
  // 设置默认数据源
  setDefaultSource: (id: string) => void
  // 设置当前活跃数据源
  setActiveSource: (id: string | null) => void

  // 获取指定数据源
  getSource: (id: string) => DataSource | undefined
  // 获取默认数据源
  getDefaultSource: () => DataSource | undefined
  // 获取所有启用的数据源
  getEnabledSources: () => DataSource[]
  // 获取指定类型的数据源
  getSourcesByType: (type: DataSourceType) => DataSource[]

  // Agent 缓存管理
  updateAgentsCache: (agents: AgentData[]) => void
  getAgentsBySource: (sourceId: string) => AgentData[]
  clearAgentsCache: () => void

  // 游戏化功能
  addAgentExp: (agentId: string, expAmount: number) => void
  addAgentCoins: (agentId: string, coinAmount: number) => void
}

export const useDataSourceStore = create<DataSourceStore>()(
  persist(
    (set, get) => ({
      sources: [],
      activeSourceId: null,
      agentsCache: [],

      addSource: source => {
        const id = `source_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date().toISOString()

        // 如果是第一个数据源，自动设为默认
        const isFirstSource = get().sources.length === 0

        const newSource: DataSource = {
          ...source,
          id,
          createdAt: now,
          updatedAt: now,
          isDefault: isFirstSource || source.isDefault,
          status: 'unknown'
        }

        // 如果设置为默认，取消其他数据源的默认状态
        set(state => ({
          sources: [
            ...state.sources.map(s => (newSource.isDefault ? { ...s, isDefault: false } : s)),
            newSource
          ],
          // 如果是第一个数据源，自动设为活跃
          activeSourceId: isFirstSource ? id : state.activeSourceId
        }))

        return id
      },

      updateSource: (id, updates) => {
        set(state => ({
          sources: state.sources.map(source =>
            source.id === id
              ? {
                  ...source,
                  ...updates,
                  updatedAt: new Date().toISOString()
                }
              : source
          )
        }))
      },

      removeSource: id => {
        set(state => {
          const remainingSources = state.sources.filter(s => s.id !== id)
          const wasDefault = state.sources.find(s => s.id === id)?.isDefault

          // 如果删除的是默认数据源，将第一个启用的数据源设为默认
          if (wasDefault && remainingSources.length > 0) {
            const newDefault = remainingSources.find(s => s.enabled) || remainingSources[0]
            newDefault.isDefault = true
          }

          return {
            sources: remainingSources,
            // 如果删除的是当前活跃数据源，清空活跃状态
            activeSourceId: state.activeSourceId === id ? null : state.activeSourceId,
            // 清除该数据源的 Agent 缓存
            agentsCache: state.agentsCache.filter(agent => agent.sourceId !== id)
          }
        })
      },

      toggleSourceEnabled: id => {
        set(state => ({
          sources: state.sources.map(source =>
            source.id === id
              ? { ...source, enabled: !source.enabled, updatedAt: new Date().toISOString() }
              : source
          )
        }))
      },

      setDefaultSource: id => {
        set(state => ({
          sources: state.sources.map(source => ({
            ...source,
            isDefault: source.id === id,
            updatedAt: source.id === id ? new Date().toISOString() : source.updatedAt
          }))
        }))
      },

      setActiveSource: id => {
        set({ activeSourceId: id })
      },

      getSource: id => {
        return get().sources.find(s => s.id === id)
      },

      getDefaultSource: () => {
        return get().sources.find(s => s.isDefault)
      },

      getEnabledSources: () => {
        return get().sources.filter(s => s.enabled)
      },

      getSourcesByType: type => {
        return get().sources.filter(s => s.type === type)
      },

      updateAgentsCache: agents => {
        set({ agentsCache: agents })
      },

      getAgentsBySource: sourceId => {
        return get().agentsCache.filter(agent => agent.sourceId === sourceId)
      },

      clearAgentsCache: () => {
        set({ agentsCache: [] })
      },

      /**
       * 给Agent增加经验值
       */
      addAgentExp: (agentId: string, expAmount: number) => {
        set(state => {
          const agents = [...state.agentsCache]
          const agent = agents.find(a => a.id === agentId)

          if (!agent || !agent.levelSystem) return state

          // 增加经验值
          let newCurrentExp = agent.levelSystem.currentExp + expAmount
          let newLevel = agent.levelSystem.currentLevel
          let newExpToNext = agent.levelSystem.expToNextLevel

          // 检查是否升级
          while (newCurrentExp >= newExpToNext) {
            newCurrentExp -= newExpToNext
            newLevel += 1
            newExpToNext = Math.round(100 * Math.pow(1.5, newLevel))

            // 升级奖励：每级+2技能点
            if (agent.skillTree) {
              agent.skillTree.skillPoints += 2
            }

            // 记录升级历史
            agent.levelSystem.levelHistory.push({
              level: newLevel,
              timestamp: new Date().toISOString(),
              expGained: expAmount
            })
          }

          // 更新数据
          agent.levelSystem.currentExp = newCurrentExp
          agent.levelSystem.currentLevel = newLevel
          agent.levelSystem.expToNextLevel = newExpToNext
          agent.levelSystem.totalExp += expAmount
          agent.level = newLevel // 同步旧字段

          return { agentsCache: agents }
        })
      },

      /**
       * 给Agent增加金币
       */
      addAgentCoins: (agentId: string, coinAmount: number) => {
        const agents = get().agentsCache
        const updatedAgents = agents.map(agent => {
          if (agent.id === agentId) {
            const currentCoins = agent.metadata?.coins || 0
            const newCoins = currentCoins + coinAmount

            console.log(`[Store] Agent ${agent.name} gained ${coinAmount} coins (total: ${newCoins})`)

            return {
              ...agent,
              metadata: {
                ...agent.metadata,
                coins: newCoins,
                lastCoinUpdate: new Date().toISOString()
              }
            }
          }
          return agent
        })

        get().updateAgentsCache(updatedAgents)
      }
    }),
    {
      name: 'agent-data-source-store'
    }
  )
)

/**
 * 初始化默认数据源（如果没有）
 */
export function initializeDefaultDataSources(): void {
  const store = useDataSourceStore.getState()

  // 如果已有数据源，不初始化
  if (store.sources.length > 0) {
    // 但仍然需要确保所有Agent有扩展数据
    initializeAgentExtendedData()

    // 如果没有Agent，创建默认Agent（用于测试和演示）
    if (store.agentsCache.length === 0) {
      createDefaultAgent()
    }
    return
  }

  // 添加默认的本地 OpenClaw 数据源
  store.addSource({
    name: '本地 OpenClaw',
    description: '本地 OpenClaw 桥接服务（上海小龙虾）',
    type: 'openclaw',
    config: {
      gatewayUrl: 'http://localhost:18790',
      authToken: 'e4d645acd59df43f1032fa5bcee1540238c01e9796296266'
    },
    enabled: true,
    isDefault: true
  })

  // 如果没有Agent，创建默认Agent（用于测试和演示）
  if (store.agentsCache.length === 0) {
    createDefaultAgent()
  }

  // 初始化Agent扩展数据
  initializeAgentExtendedData()
}

/**
 * 创建默认演示Agent（当没有真实Agent时）
 */
function createDefaultAgent(): void {
  const store = useDataSourceStore.getState()
  const sources = store.sources

  if (sources.length === 0) return

  const defaultAgent: AgentData = {
    id: 'demo-agent-001',
    name: '演示Agent',
    displayName: '演示Agent',
    sourceId: sources[0].id,
    sourceName: sources[0].name,
    status: 'online',
    level: 1,
    exp: 0,
    maxExp: 100,
    role: 'Team Member',
    skills: [],
    personality: 'Professional and helpful',
    color: '#3b82f6',
    avatar: getAvatarByRole('Team Member'), // 🎯 Random avatar from library
    description: '演示用 Agent',

    // 技能树
    skillTree: {
      unlockedSkills: [],
      activeSkills: [],
      skillPoints: 5,
      skillLevels: {}
    },

    // 成就系统
    achievements: {
      unlocked: [],
      progress: {}
    },

    // 等级系统
    levelSystem: {
      currentLevel: 1,
      currentExp: 0,
      expToNextLevel: 100,
      totalExp: 0,
      prestigeLevel: 0,
      levelHistory: []
    },

    // 能耗统计
    energyStats: {
      totalTokensUsed: 0,
      tokensUsedToday: 0,
      tokensUsedThisWeek: 0,
      tokensUsedThisMonth: 0,
      averagePerTask: 0,
      peakTokensPerHour: 0
    },

    // 能耗预算
    energyBudget: {
      dailyLimit: 50000,
      weeklyLimit: 300000,
      monthlyLimit: 1000000,
      alertThreshold: 80
    },

    // 能耗历史
    energyHistory: [],

    // PVP统计
    pvpStats: {
      wins: 0,
      losses: 0,
      winRate: 0,
      mmr: 1000,
      rankTier: 'bronze',
      rankPoints: 0,
      totalBattles: 0
    }
  }

  store.updateAgentsCache([defaultAgent])
  console.log('[Store] Created default demo agent:', defaultAgent.name)
}

/**
 * 初始化Agent扩展数据（技能树、成就、等级系统等）
 */
export function initializeAgentExtendedData(): void {
  const store = useDataSourceStore.getState()
  const agents = [...store.agentsCache]

  agents.forEach(agent => {
    // 初始化技能树
    if (!agent.skillTree) {
      agent.skillTree = {
        unlockedSkills: [],
        activeSkills: [],
        skillPoints: 5, // 给新用户5个技能点
        skillLevels: {}
      }
    }

    // 初始化成就系统
    if (!agent.achievements) {
      agent.achievements = {
        unlocked: [],
        progress: {
          // 初始化一些基础进度
          first_task: 0,
          task_master: 0,
          level_10: agent.level >= 10 ? 1 : 0
        }
      }
    }

    // 初始化等级系统
    if (!agent.levelSystem) {
      agent.levelSystem = {
        currentLevel: agent.level || 1,
        currentExp: agent.exp || 0,
        expToNextLevel: Math.round(100 * Math.pow(1.5, agent.level || 1)),
        totalExp: agent.exp || 0,
        prestigeLevel: 0,
        levelHistory: []
      }
    }

    // 初始化能耗统计
    if (!agent.energyStats) {
      agent.energyStats = {
        totalTokensUsed: 0,
        tokensUsedToday: 0,
        tokensUsedThisWeek: 0,
        tokensUsedThisMonth: 0,
        averagePerTask: 0,
        peakTokensPerHour: 0
      }
    }

    // 初始化能耗预算
    if (!agent.energyBudget) {
      agent.energyBudget = {
        dailyLimit: 100000,
        weeklyLimit: 500000,
        monthlyLimit: 2000000,
        alertThreshold: 80
      }
    }

    // 初始化PvP统计
    if (!agent.pvpStats) {
      agent.pvpStats = {
        wins: 0,
        losses: 0,
        winRate: 0,
        mmr: 1000,
        rankTier: 'bronze',
        rankPoints: 0,
        totalBattles: 0
      }
    }
  })

  // 更新缓存
  store.updateAgentsCache(agents)
}
