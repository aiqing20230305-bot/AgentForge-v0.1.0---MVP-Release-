/**
 * Heartbeat Monitoring Service
 * 心跳监控服务 - 实时监控Agent健康状态
 */

import type { AgentData } from '../../store/useDataSourceStore'
import type { HeartbeatData, HeartbeatHistory, EvolutionConfig } from '../../types/evolution'
import type { Task } from '../../types/task'
import { useDataSourceStore } from '../../store/useDataSourceStore'
import { useTaskStore } from '../../stores/taskStore'
import { notificationService } from '../notificationService'

class HeartbeatService {
  private intervalId: NodeJS.Timeout | null = null
  private config: EvolutionConfig = {
    heartbeatInterval: 30000,        // 30秒
    evolutionCheckInterval: 3600000, // 1小时
    autoEvolutionEnabled: true,
    notificationsEnabled: true,
    vitalityThresholds: {
      critical: 40,
      warning: 70,
      healthy: 100
    }
  }

  /**
   * 启动心跳监控
   */
  start(): void {
    if (this.intervalId) {
      console.warn('[HeartbeatService] Already running')
      return
    }

    console.log('[HeartbeatService] 🫀 Starting heartbeat monitor...')

    // 立即执行一次
    this.performHeartbeat()

    // 设置定时器
    this.intervalId = setInterval(() => {
      this.performHeartbeat()
    }, this.config.heartbeatInterval)
  }

  /**
   * 停止心跳监控
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('[HeartbeatService] 💔 Heartbeat monitor stopped')
    }
  }

  /**
   * 执行一次心跳检查
   */
  private performHeartbeat(): void {
    const agents = useDataSourceStore.getState().agentsCache

    agents.forEach(agent => {
      try {
        const heartbeatData = this.collectHeartbeatData(agent)
        this.saveHeartbeat(heartbeatData)
        this.checkAlerts(heartbeatData, agent)
      } catch (error) {
        console.error(`[HeartbeatService] Failed for agent ${agent.id}:`, error)
      }
    })
  }

  /**
   * 收集心跳数据
   */
  private collectHeartbeatData(agent: AgentData): HeartbeatData {
    const vitality = this.calculateVitality(agent)
    const metrics = this.collectMetrics(agent)
    const warnings = this.detectWarnings(agent, vitality, metrics)

    return {
      agentId: agent.id,
      timestamp: new Date().toISOString(),
      vitality,
      heartRate: this.calculateHeartRate(vitality),
      status: this.getHealthStatus(vitality),
      metrics,
      warnings
    }
  }

  /**
   * 计算生命力（0-100）
   */
  private calculateVitality(agent: AgentData): number {
    let vitality = 100

    // 获取任务数据
    const tasks = useTaskStore.getState().tasks.filter(t => t.agentId === agent.id)
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'completed').length
    const failedTasks = tasks.filter(t => t.status === 'failed').length
    const pendingTasks = tasks.filter(t => t.status === 'pending').length

    // 1. 任务成功率影响（最大-30）
    if (totalTasks > 0) {
      const successRate = (completedTasks / totalTasks) * 100
      if (successRate < 70) {
        vitality -= (70 - successRate) * 0.5
      }
    }

    // 2. Token效率影响（最大-20）
    if (agent.energyStats && agent.energyBudget) {
      const tokenEfficiency = agent.energyStats.tokensUsedToday / agent.energyBudget.dailyLimit
      if (tokenEfficiency > 0.8) {
        vitality -= (tokenEfficiency - 0.8) * 100
      }
    }

    // 3. 闲置时间影响（最大-20）
    if (agent.metadata?.lastActiveAt) {
      const idleHours = (Date.now() - new Date(agent.metadata.lastActiveAt).getTime()) / 3600000
      if (idleHours > 24) {
        vitality -= Math.min(20, idleHours - 24)
      }
    }

    // 4. 任务队列压力（最大-15）
    if (pendingTasks > 10) {
      vitality -= Math.min(15, (pendingTasks - 10) * 1.5)
    }

    // 5. 错误率影响（最大-15）
    if (totalTasks > 0) {
      const errorRate = failedTasks / totalTasks
      if (errorRate > 0.1) {
        vitality -= errorRate * 150
      }
    }

    return Math.max(0, Math.min(100, Math.round(vitality)))
  }

  /**
   * 计算心跳频率
   * 生命力越低，心跳越快（压力反应）
   */
  private calculateHeartRate(vitality: number): number {
    return Math.round(60 + (100 - vitality) * 0.5)
  }

  /**
   * 获取健康状态
   */
  private getHealthStatus(vitality: number): HeartbeatData['status'] {
    if (vitality >= this.config.vitalityThresholds.warning) return 'healthy'
    if (vitality >= this.config.vitalityThresholds.critical) return 'warning'
    if (vitality > 0) return 'critical'
    return 'offline'
  }

  /**
   * 收集指标数据
   */
  private collectMetrics(agent: AgentData) {
    const tasks = useTaskStore.getState().tasks.filter(t => t.agentId === agent.id)
    const completedTasks = tasks.filter(t => t.status === 'completed')
    const totalTasks = tasks.length

    // 计算平均任务时长
    let avgTaskDuration = 0
    if (completedTasks.length > 0) {
      const durations = completedTasks
        .filter(t => t.completedAt && t.startedAt)
        .map(t => {
          const start = new Date(t.startedAt!).getTime()
          const end = new Date(t.completedAt!).getTime()
          return (end - start) / 1000 // 秒
        })

      if (durations.length > 0) {
        avgTaskDuration = durations.reduce((a, b) => a + b, 0) / durations.length
      }
    }

    // 计算Token使用率
    const tokenUsageRate = agent.energyStats?.tokensUsedToday || 0

    // 计算成功率
    const successRate = totalTasks > 0
      ? (completedTasks.length / totalTasks) * 100
      : 0

    // 计算闲置时间
    const idleTime = agent.metadata?.lastActiveAt
      ? (Date.now() - new Date(agent.metadata.lastActiveAt).getTime()) / 1000
      : 0

    return {
      taskQueueLength: tasks.filter(t => t.status === 'pending').length,
      avgTaskDuration,
      tokenUsageRate,
      successRate,
      idleTime
    }
  }

  /**
   * 检测警告
   */
  private detectWarnings(
    agent: AgentData,
    vitality: number,
    metrics: HeartbeatData['metrics']
  ): string[] {
    const warnings: string[] = []

    if (vitality < 40) {
      warnings.push('⚠️ 生命力危急！请立即检查Agent状态')
    }

    if (metrics.taskQueueLength > 20) {
      warnings.push('📋 任务队列过长，建议增加自动执行或分配给其他Agent')
    }

    if (agent.energyBudget && metrics.tokenUsageRate > agent.energyBudget.dailyLimit * 0.9) {
      warnings.push('⚡ Token使用接近预算，建议优化或调整预算')
    }

    if (metrics.successRate < 70 && metrics.taskQueueLength > 5) {
      warnings.push('❌ 成功率偏低，建议检查任务难度或技能配置')
    }

    if (metrics.idleTime > 86400) {
      warnings.push('💤 Agent闲置超过1天，考虑分配新任务')
    }

    if (metrics.avgTaskDuration > 3600) {
      warnings.push('⏱️ 平均任务耗时过长，建议优化或拆分任务')
    }

    return warnings
  }

  /**
   * 计算任务完成时的进化点奖励
   */
  private calculateEvolutionPoints(task: Task): number {
    let points = 10 // 基础点数

    // 1. 难度系数（基于优先级）
    const priorityBonus: Record<string, number> = {
      low: 5,
      medium: 10,
      high: 15,
      urgent: 20
    }
    points += priorityBonus[task.priority] || 10

    // 2. 成功奖励
    if (task.status === 'completed') {
      points += 10
    }

    // 3. Token效率奖励（低消耗高产出）
    if (task.tokenMetrics) {
      const efficiency =
        task.tokenMetrics.actualTokens / task.tokenMetrics.estimatedTokens
      if (efficiency < 0.8) {
        points += Math.round((1 - efficiency) * 20)
      }
    }

    // 4. 速度奖励（快速完成）
    if (task.actualDuration && task.estimatedDuration) {
      const speedRatio = task.actualDuration / task.estimatedDuration
      if (speedRatio < 0.8) {
        points += Math.round((1 - speedRatio) * 15)
      }
    }

    return Math.round(points)
  }

  /**
   * 保存心跳数据
   */
  private saveHeartbeat(heartbeatData: HeartbeatData): void {
    const key = `heartbeat_history_${heartbeatData.agentId}`

    try {
      const saved = localStorage.getItem(key)
      let history: HeartbeatHistory = saved
        ? JSON.parse(saved)
        : {
            agentId: heartbeatData.agentId,
            records: [],
            firstBeat: heartbeatData.timestamp,
            totalBeats: 0
          }

      // 添加新记录
      history.records.push(heartbeatData)
      history.totalBeats++

      // 只保留最近100次
      if (history.records.length > 100) {
        history.records = history.records.slice(-100)
      }

      localStorage.setItem(key, JSON.stringify(history))

      // 计算进化点（基于最近完成的任务）
      const recentlyCompletedTasks = useTaskStore.getState().tasks.filter(t =>
        t.agentId === heartbeatData.agentId &&
        t.status === 'completed' &&
        t.completedAt &&
        new Date(t.completedAt).getTime() > Date.now() - 30000 // 最近30秒
      )

      let earnedPoints = 0
      for (const task of recentlyCompletedTasks) {
        earnedPoints += this.calculateEvolutionPoints(task)
      }

      // 更新Agent的coreEvolution字段
      const store = useDataSourceStore.getState()
      const agents = store.agentsCache
      const updatedAgents = agents.map(a =>
        a.id === heartbeatData.agentId
          ? {
              ...a,
              coreEvolution: {
                vitality: heartbeatData.vitality,
                heartRate: heartbeatData.heartRate,
                lastHeartbeat: heartbeatData.timestamp,
                evolutionPoints: (a.coreEvolution?.evolutionPoints || 0) + earnedPoints,
                evolutionLevel: a.coreEvolution?.evolutionLevel || 0,
                totalEvolutions: a.coreEvolution?.totalEvolutions || 0,
                healthStatus: heartbeatData.status,
                autoEvolutionEnabled: a.coreEvolution?.autoEvolutionEnabled ?? true,
                unlockedRules: a.coreEvolution?.unlockedRules || []
              }
            }
          : a
      )
      store.updateAgentsCache(updatedAgents)

      // 如果获得了进化点，记录日志
      if (earnedPoints > 0) {
        console.log(
          `[HeartbeatService] 💎 Agent ${heartbeatData.agentId} earned ${earnedPoints} evolution points`
        )
      }
    } catch (error) {
      console.error('[HeartbeatService] Failed to save heartbeat:', error)
    }
  }

  /**
   * 检查告警
   */
  private checkAlerts(heartbeatData: HeartbeatData, agent: AgentData): void {
    if (!this.config.notificationsEnabled) return

    // 危急状态告警
    if (heartbeatData.status === 'critical') {
      console.warn(
        `[HeartbeatService] 🚨 Agent ${agent.name} 生命力危急！`,
        `当前: ${heartbeatData.vitality}%`
      )

      notificationService.show({
        type: 'vitality_critical',
        title: `Agent ${agent.name} 生命力危急！`,
        message: `当前生命力: ${heartbeatData.vitality}%\n${heartbeatData.warnings.join('\n')}`,
        agentId: agent.id
      }).catch(err => {
        console.warn('[HeartbeatService] Failed to show critical notification:', err)
      })
    }

    // 警告状态
    if (heartbeatData.status === 'warning' && heartbeatData.warnings.length > 0) {
      console.warn(
        `[HeartbeatService] ⚠️ Agent ${agent.name} 健康警告:`,
        heartbeatData.warnings
      )

      notificationService.show({
        type: 'health_warning',
        title: `Agent ${agent.name} 健康警告`,
        message: heartbeatData.warnings.join('\n'),
        agentId: agent.id,
        silent: true // 警告级别静音，避免打扰
      }).catch(err => {
        console.warn('[HeartbeatService] Failed to show warning notification:', err)
      })
    }
  }

  /**
   * 获取心跳历史
   */
  getHeartbeatHistory(agentId: string): HeartbeatHistory | null {
    try {
      const saved = localStorage.getItem(`heartbeat_history_${agentId}`)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('[HeartbeatService] Failed to load history:', error)
      return null
    }
  }

  /**
   * 获取最新心跳
   */
  getLatestHeartbeat(agentId: string): HeartbeatData | null {
    const history = this.getHeartbeatHistory(agentId)
    return history && history.records.length > 0
      ? history.records[history.records.length - 1]
      : null
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<EvolutionConfig>): void {
    this.config = { ...this.config, ...config }

    // 如果心跳间隔改变，重启服务
    if (config.heartbeatInterval && this.intervalId) {
      this.stop()
      this.start()
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): EvolutionConfig {
    return { ...this.config }
  }
}

// 单例实例
let heartbeatServiceInstance: HeartbeatService | null = null

export function getHeartbeatService(): HeartbeatService {
  if (!heartbeatServiceInstance) {
    heartbeatServiceInstance = new HeartbeatService()
  }
  return heartbeatServiceInstance
}

export type { HeartbeatService }
