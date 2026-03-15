/**
 * Evolution Engine Service
 * 进化引擎服务 - 自动检测和触发Agent进化
 */

import type { AgentData } from '../../store/useDataSourceStore'
import type { EvolutionRule, EvolutionEvent } from '../../types/evolution'
import { useDataSourceStore } from '../../store/useDataSourceStore'
import { useTaskStore } from '../../stores/taskStore'
import {
  getEvolutionRule,
  getAvailableEvolutions
} from '../../data/evolutionRules'

class EvolutionEngine {
  private intervalId: NodeJS.Timeout | null = null
  private config = {
    checkInterval: 3600000, // 1小时检查一次
    autoEvolutionEnabled: true,
    notificationsEnabled: true,
    evolutionCooldown: 3600000, // 1小时冷却时间
    maxEvolutionsPerDay: 3 // 每天最多进化3次
  }

  /**
   * 启动进化引擎
   */
  start(): void {
    if (this.intervalId) {
      console.warn('[EvolutionEngine] Already running')
      return
    }

    console.log('[EvolutionEngine] 🧬 Starting evolution engine...')

    // 立即执行一次检查
    this.checkEvolutionOpportunities()

    // 设置定时器
    this.intervalId = setInterval(() => {
      this.checkEvolutionOpportunities()
    }, this.config.checkInterval)
  }

  /**
   * 停止进化引擎
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('[EvolutionEngine] 🛑 Evolution engine stopped')
    }
  }

  /**
   * 检查所有Agent的进化机会
   */
  async checkEvolutionOpportunities(): Promise<void> {
    if (!this.config.autoEvolutionEnabled) {
      console.log('[EvolutionEngine] Auto-evolution disabled, skipping check')
      return
    }

    const agents = useDataSourceStore.getState().agentsCache

    console.log(`[EvolutionEngine] 🔍 Checking evolution for ${agents.length} agents...`)

    for (const agent of agents) {
      try {
        // 检查Agent是否启用了自动进化
        if (agent.coreEvolution?.autoEvolutionEnabled === false) {
          continue
        }

        // 检查冷却时间
        if (!this.canEvolveNow(agent)) {
          continue
        }

        // 获取可用的进化规则
        const availableRules = this.getAvailableRulesForAgent(agent)

        if (availableRules.length === 0) {
          continue
        }

        // 按优先级排序，尝试触发最高优先级的进化
        const ruleToApply = availableRules[0]

        // 评估规则条件
        if (this.evaluateRule(agent, ruleToApply)) {
          console.log(
            `[EvolutionEngine] 🌟 Agent ${agent.name} eligible for evolution: ${ruleToApply.name}`
          )

          // 应用进化
          const success = await this.applyEvolution(agent, ruleToApply, 'auto')

          if (success) {
            console.log(
              `[EvolutionEngine] ✨ Agent ${agent.name} evolved successfully!`
            )

            // 通知
            if (this.config.notificationsEnabled) {
              this.notifyEvolution(agent, ruleToApply)
            }
          }
        }
      } catch (error) {
        console.error(`[EvolutionEngine] Failed for agent ${agent.id}:`, error)
      }
    }
  }

  /**
   * 手动触发进化
   */
  async manualEvolve(agentId: string, ruleId: string): Promise<boolean> {
    const agents = useDataSourceStore.getState().agentsCache
    const agent = agents.find(a => a.id === agentId)

    if (!agent) {
      console.error('[EvolutionEngine] Agent not found:', agentId)
      return false
    }

    const rule = getEvolutionRule(ruleId)

    if (!rule) {
      console.error('[EvolutionEngine] Rule not found:', ruleId)
      return false
    }

    // 检查基础条件
    if (agent.level < rule.requiredLevel) {
      console.warn('[EvolutionEngine] Level requirement not met')
      return false
    }

    if ((agent.coreEvolution?.evolutionPoints || 0) < rule.requiredPoints) {
      console.warn('[EvolutionEngine] Evolution points requirement not met')
      return false
    }

    // 应用进化
    return this.applyEvolution(agent, rule, 'manual')
  }

  /**
   * 获取Agent可用的进化规则
   */
  private getAvailableRulesForAgent(agent: AgentData): EvolutionRule[] {
    const level = agent.level
    const points = agent.coreEvolution?.evolutionPoints || 0
    const unlockedRules = agent.coreEvolution?.unlockedRules || []

    return getAvailableEvolutions(level, points, unlockedRules)
  }

  /**
   * 检查Agent是否可以进化（冷却时间）
   */
  private canEvolveNow(agent: AgentData): boolean {
    // 检查今日进化次数
    const today = new Date().toISOString().split('T')[0]
    const history = this.getEvolutionHistory(agent.id)
    const todayEvolutions = history.filter(e =>
      e.timestamp.startsWith(today)
    ).length

    if (todayEvolutions >= this.config.maxEvolutionsPerDay) {
      return false
    }

    // 检查最后一次进化时间
    if (history.length > 0) {
      const lastEvolution = history[history.length - 1]
      const timeSinceLastEvolution =
        Date.now() - new Date(lastEvolution.timestamp).getTime()

      if (timeSinceLastEvolution < this.config.evolutionCooldown) {
        return false
      }
    }

    return true
  }

  /**
   * 评估进化规则条件
   */
  private evaluateRule(agent: AgentData, rule: EvolutionRule): boolean {
    const tasks = useTaskStore.getState().tasks.filter(t => t.agentId === agent.id)
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'completed')
    const failedTasks = tasks.filter(t => t.status === 'failed')
    const pendingTasks = tasks.filter(t => t.status === 'pending')

    // 检查最小完成任务数
    if (rule.conditions.minCompletedTasks) {
      if (completedTasks.length < rule.conditions.minCompletedTasks) {
        return false
      }
    }

    // 检查成功率
    if (rule.conditions.minSuccessRate) {
      const successRate =
        totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0
      if (successRate < rule.conditions.minSuccessRate) {
        return false
      }
    }

    // 检查Token效率
    if (rule.conditions.maxTokenEfficiency && agent.energyStats && agent.energyBudget) {
      const tokenEfficiency =
        agent.energyStats.tokensUsedToday / agent.energyBudget.dailyLimit
      if (tokenEfficiency > rule.conditions.maxTokenEfficiency) {
        return false
      }
    }

    // 检查平均任务时长
    if (rule.conditions.maxAvgDuration && completedTasks.length > 0) {
      const durations = completedTasks
        .filter(t => t.actualDuration)
        .map(t => t.actualDuration!)

      if (durations.length > 0) {
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
        if (avgDuration > rule.conditions.maxAvgDuration) {
          return false
        }
      }
    }

    // 检查任务队列长度
    if (rule.conditions.minTaskQueueLength) {
      if (pendingTasks.length < rule.conditions.minTaskQueueLength) {
        return false
      }
    }

    // 检查失败任务数
    if (rule.conditions.minFailedTasks) {
      if (failedTasks.length < rule.conditions.minFailedTasks) {
        return false
      }
    }

    // 检查最近成功率（最近10个任务）
    if (rule.conditions.recentSuccessRate) {
      const recentTasks = tasks.slice(-10)
      const recentCompleted = recentTasks.filter(t => t.status === 'completed')
      const recentSuccessRate =
        recentTasks.length > 0
          ? (recentCompleted.length / recentTasks.length) * 100
          : 0

      if (recentSuccessRate < rule.conditions.recentSuccessRate) {
        return false
      }
    }

    // 检查技能等级
    if (rule.conditions.minSkillLevel && agent.skillTree) {
      const maxSkillLevel = Math.max(
        ...Object.values(agent.skillTree.skillLevels || {})
      )
      if (maxSkillLevel < rule.conditions.minSkillLevel) {
        return false
      }
    }

    // 检查技能数量
    if (rule.conditions.minSkillCount && agent.skillTree) {
      const skillCount = Object.keys(agent.skillTree.skillLevels || {}).length
      if (skillCount < rule.conditions.minSkillCount) {
        return false
      }
    }

    // 检查平均技能等级
    if (rule.conditions.minAvgSkillLevel && agent.skillTree) {
      const skillLevels = Object.values(agent.skillTree.skillLevels || {})
      if (skillLevels.length > 0) {
        const avgSkillLevel =
          skillLevels.reduce((a, b) => a + b, 0) / skillLevels.length
        if (avgSkillLevel < rule.conditions.minAvgSkillLevel) {
          return false
        }
      } else {
        return false
      }
    }

    // 检查活跃天数
    if (rule.conditions.minActiveDays && agent.metadata?.createdAt) {
      const daysSinceCreation = Math.floor(
        (Date.now() - new Date(agent.metadata.createdAt).getTime()) / 86400000
      )
      if (daysSinceCreation < rule.conditions.minActiveDays) {
        return false
      }
    }

    // 检查闲置时间
    if (rule.conditions.maxIdleTime && agent.metadata?.lastActiveAt) {
      const idleTime = Date.now() - new Date(agent.metadata.lastActiveAt).getTime()
      if (idleTime > rule.conditions.maxIdleTime) {
        return false
      }
    }

    // 检查任务类型多样性
    if (rule.conditions.minUniqueTaskTypes) {
      const uniqueTypes = new Set(tasks.map(t => t.tags?.[0] || 'default'))
      if (uniqueTypes.size < rule.conditions.minUniqueTaskTypes) {
        return false
      }
    }

    return true
  }

  /**
   * 应用进化
   */
  private async applyEvolution(
    agent: AgentData,
    rule: EvolutionRule,
    trigger: 'auto' | 'manual'
  ): Promise<boolean> {
    try {
      // 记录进化前的状态
      const previousStats = {
        level: agent.level,
        vitality: agent.coreEvolution?.vitality || 100,
        evolutionLevel: agent.coreEvolution?.evolutionLevel || 0,
        evolutionPoints: agent.coreEvolution?.evolutionPoints || 0
      }

      // 扣除进化点
      const newPoints = (agent.coreEvolution?.evolutionPoints || 0) - rule.requiredPoints

      // 应用效果
      const updatedAgent = this.updateAgentStats(agent, rule.effects)

      // 更新Agent的coreEvolution字段
      updatedAgent.coreEvolution = {
        ...updatedAgent.coreEvolution,
        evolutionPoints: newPoints,
        evolutionLevel: (agent.coreEvolution?.evolutionLevel || 0) + 1,
        totalEvolutions: (agent.coreEvolution?.totalEvolutions || 0) + 1,
        vitality: (agent.coreEvolution?.vitality || 100) + (rule.effects.vitalityBonus || 0),
        unlockedRules: [
          ...(agent.coreEvolution?.unlockedRules || []),
          rule.id
        ],
        lastHeartbeat: new Date().toISOString(),
        heartRate: agent.coreEvolution?.heartRate || 60,
        healthStatus: agent.coreEvolution?.healthStatus || 'healthy',
        autoEvolutionEnabled: agent.coreEvolution?.autoEvolutionEnabled ?? true
      }

      // 记录进化后的状态
      const newStats = {
        level: updatedAgent.level,
        vitality: updatedAgent.coreEvolution.vitality,
        evolutionLevel: updatedAgent.coreEvolution.evolutionLevel,
        evolutionPoints: updatedAgent.coreEvolution.evolutionPoints
      }

      // 创建进化事件
      const evolutionEvent: EvolutionEvent = {
        id: `evolution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        agentId: agent.id,
        ruleId: rule.id,
        ruleName: rule.name,
        timestamp: new Date().toISOString(),
        pointsCost: rule.requiredPoints,
        previousStats,
        newStats,
        impact: rule.effects,
        trigger
      }

      // 保存进化事件
      this.saveEvolutionEvent(evolutionEvent)

      // 更新Agent数据
      const store = useDataSourceStore.getState()
      const agents = store.agentsCache
      const updatedAgents = agents.map(a =>
        a.id === agent.id ? updatedAgent : a
      )
      store.updateAgentsCache(updatedAgents)

      console.log(`[EvolutionEngine] 🎉 Evolution completed: ${agent.name} -> ${rule.name}`)

      return true
    } catch (error) {
      console.error('[EvolutionEngine] Evolution failed:', error)
      return false
    }
  }

  /**
   * 更新Agent属性（应用进化效果）
   */
  private updateAgentStats(agent: AgentData, effects: EvolutionRule['effects']): AgentData {
    const updatedAgent = { ...agent }

    // 应用属性提升
    if (effects.attributeBoost && updatedAgent.metadata) {
      Object.entries(effects.attributeBoost).forEach(([attr, value]) => {
        if (updatedAgent.metadata) {
          updatedAgent.metadata[attr] =
            (updatedAgent.metadata[attr] || 0) + value
        }
      })
    }

    // 应用技能解锁
    if (effects.skillUnlock && updatedAgent.skillTree) {
      const currentUnlocked = updatedAgent.skillTree.unlockedSkills || []
      updatedAgent.skillTree.unlockedSkills = [
        ...currentUnlocked,
        ...effects.skillUnlock.filter(skill => !currentUnlocked.includes(skill))
      ]
    }

    // 应用经验加成
    if (effects.experienceBonus && updatedAgent.levelSystem) {
      updatedAgent.levelSystem.totalExp = Math.round(
        updatedAgent.levelSystem.totalExp * effects.experienceBonus
      )
    }

    return updatedAgent
  }

  /**
   * 保存进化事件
   */
  private saveEvolutionEvent(event: EvolutionEvent): void {
    const key = `evolution_history_${event.agentId}`

    try {
      const saved = localStorage.getItem(key)
      const history: EvolutionEvent[] = saved ? JSON.parse(saved) : []

      history.push(event)

      // 只保留最近50次进化
      const trimmedHistory = history.slice(-50)

      localStorage.setItem(key, JSON.stringify(trimmedHistory))
    } catch (error) {
      console.error('[EvolutionEngine] Failed to save evolution event:', error)
    }
  }

  /**
   * 获取进化历史
   */
  getEvolutionHistory(agentId: string): EvolutionEvent[] {
    try {
      const saved = localStorage.getItem(`evolution_history_${agentId}`)
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('[EvolutionEngine] Failed to load evolution history:', error)
      return []
    }
  }

  /**
   * 获取Agent的下一个可能进化
   */
  getNextEvolution(agent: AgentData): EvolutionRule | null {
    const availableRules = this.getAvailableRulesForAgent(agent)

    if (availableRules.length === 0) {
      return null
    }

    // 返回最高优先级的规则
    return availableRules[0]
  }

  /**
   * 通知进化事件
   */
  private notifyEvolution(agent: AgentData, rule: EvolutionRule): void {
    console.log(
      `[EvolutionEngine] 🎉 ${agent.name} 完成进化: ${rule.name}\n` +
        `${rule.metadata.icon} ${rule.metadata.description}`
    )

    // TODO: 集成通知系统
    // notificationService.notify({
    //   title: `${agent.name} 完成进化！`,
    //   message: `${rule.metadata.icon} ${rule.name}\n${rule.metadata.description}`,
    //   type: 'success',
    //   agentId: agent.id
    // })
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...config }

    // 如果检查间隔改变，重启服务
    if (config.checkInterval && this.intervalId) {
      this.stop()
      this.start()
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): typeof this.config {
    return { ...this.config }
  }
}

// 单例实例
let evolutionEngineInstance: EvolutionEngine | null = null

export function getEvolutionEngine(): EvolutionEngine {
  if (!evolutionEngineInstance) {
    evolutionEngineInstance = new EvolutionEngine()
  }
  return evolutionEngineInstance
}

export type { EvolutionEngine }
