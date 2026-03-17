/**
 * 智能任务推荐引擎
 * 基于历史数据和Agent能力进行任务推荐
 */

import { Agent } from '../../types/agent'
import { Task } from '../../types/task'

/**
 * 推荐结果接口
 */
export interface TaskRecommendation {
  task: Task
  agent: Agent
  score: number // 0-100 匹配度评分
  confidence: number // 0-1 推荐置信度
  reasons: string[] // 推荐原因
  metrics: RecommendationMetrics
}

/**
 * 推荐指标
 */
interface RecommendationMetrics {
  skillMatch: number // 技能匹配度
  workloadBalance: number // 工作负载平衡
  historicalPerformance: number // 历史表现
  taskPriority: number // 任务优先级
  availabilityScore: number // 可用性评分
}

/**
 * 任务推荐引擎类
 */
export class RecommendationEngine {
  private taskHistory: Map<string, TaskHistory[]> = new Map()
  private agentPerformance: Map<string, AgentPerformance> = new Map()

  /**
   * 为Agent推荐任务
   */
  recommendTasksForAgent(
    agent: Agent,
    availableTasks: Task[],
    allAgents: Agent[],
    limit: number = 5
  ): TaskRecommendation[] {
    const recommendations: TaskRecommendation[] = []

    for (const task of availableTasks) {
      const score = this.calculateMatchScore(agent, task, allAgents)
      const confidence = this.calculateConfidence(agent, task)
      const reasons = this.generateReasons(agent, task, score)
      const metrics = this.calculateMetrics(agent, task, allAgents)

      recommendations.push({
        task,
        agent,
        score,
        confidence,
        reasons,
        metrics,
      })
    }

    // 按评分排序并限制数量
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * 为任务推荐Agent
   */
  recommendAgentsForTask(
    task: Task,
    availableAgents: Agent[],
    limit: number = 3
  ): TaskRecommendation[] {
    const recommendations: TaskRecommendation[] = []

    for (const agent of availableAgents) {
      const score = this.calculateMatchScore(agent, task, availableAgents)
      const confidence = this.calculateConfidence(agent, task)
      const reasons = this.generateReasons(agent, task, score)
      const metrics = this.calculateMetrics(agent, task, availableAgents)

      recommendations.push({
        task,
        agent,
        score,
        confidence,
        reasons,
        metrics,
      })
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * 计算匹配评分（0-100）
   */
  private calculateMatchScore(
    agent: Agent,
    task: Task,
    allAgents: Agent[]
  ): number {
    const weights = {
      skillMatch: 0.35,
      workloadBalance: 0.20,
      historicalPerformance: 0.25,
      taskPriority: 0.15,
      availability: 0.05,
    }

    const metrics = this.calculateMetrics(agent, task, allAgents)

    const score =
      metrics.skillMatch * weights.skillMatch +
      metrics.workloadBalance * weights.workloadBalance +
      metrics.historicalPerformance * weights.historicalPerformance +
      metrics.taskPriority * weights.taskPriority +
      metrics.availabilityScore * weights.availability

    return Math.round(score)
  }

  /**
   * 计算详细指标
   */
  private calculateMetrics(
    agent: Agent,
    task: Task,
    allAgents: Agent[]
  ): RecommendationMetrics {
    return {
      skillMatch: this.calculateSkillMatch(agent, task),
      workloadBalance: this.calculateWorkloadBalance(agent, allAgents),
      historicalPerformance: this.calculateHistoricalPerformance(agent, task),
      taskPriority: this.normalizeTaskPriority(task),
      availabilityScore: this.calculateAvailability(agent),
    }
  }

  /**
   * 计算技能匹配度（0-100）
   */
  private calculateSkillMatch(agent: Agent, task: Task): number {
    if (!agent.skills || agent.skills.length === 0) return 50

    // TF-IDF相似度计算
    const taskKeywords = this.extractKeywords(task.title + ' ' + task.description)
    const agentSkills = agent.skills.map(s => s.name.toLowerCase())

    let matchCount = 0
    for (const keyword of taskKeywords) {
      if (agentSkills.some(skill => skill.includes(keyword) || keyword.includes(skill))) {
        matchCount++
      }
    }

    const matchRatio = taskKeywords.length > 0
      ? matchCount / taskKeywords.length
      : 0

    // 考虑Agent等级加成
    const levelBonus = Math.min(agent.level / 100, 0.2) // 最多+20分

    return Math.min(matchRatio * 100 + levelBonus * 100, 100)
  }

  /**
   * 计算工作负载平衡（0-100）
   */
  private calculateWorkloadBalance(agent: Agent, allAgents: Agent[]): number {
    const agentTaskCount = this.getAgentTaskCount(agent.id)

    // 计算平均任务数
    const totalTasks = allAgents.reduce(
      (sum, a) => sum + this.getAgentTaskCount(a.id),
      0
    )
    const avgTasks = totalTasks / allAgents.length

    // 任务越少，评分越高
    if (agentTaskCount === 0) return 100
    if (agentTaskCount <= avgTasks) return 80

    const overloadRatio = agentTaskCount / (avgTasks * 2)
    return Math.max(0, 100 - overloadRatio * 100)
  }

  /**
   * 计算历史表现（0-100）
   */
  private calculateHistoricalPerformance(agent: Agent, task: Task): number {
    const performance = this.agentPerformance.get(agent.id)

    if (!performance) return 70 // 默认中等评分

    // 综合考虑多个因素
    const completionRate = performance.completedTasks /
      Math.max(performance.totalTasks, 1)
    const avgQuality = performance.avgQualityScore
    const successRate = 1 - (performance.failedTasks / Math.max(performance.totalTasks, 1))

    const score = (
      completionRate * 0.4 +
      avgQuality * 0.4 +
      successRate * 0.2
    ) * 100

    return Math.round(score)
  }

  /**
   * 标准化任务优先级（0-100）
   */
  private normalizeTaskPriority(task: Task): number {
    const priorityMap: Record<string, number> = {
      high: 100,
      medium: 60,
      low: 30,
    }

    return priorityMap[task.priority || 'medium'] || 60
  }

  /**
   * 计算可用性评分（0-100）
   */
  private calculateAvailability(agent: Agent): number {
    // 根据Agent状态评分
    const statusScore: Record<string, number> = {
      idle: 100,
      available: 100,
      working: 40,
      busy: 20,
      offline: 0,
    }

    return statusScore[agent.status] || 50
  }

  /**
   * 计算推荐置信度（0-1）
   */
  private calculateConfidence(agent: Agent, task: Task): number {
    const performance = this.agentPerformance.get(agent.id)

    if (!performance) return 0.6 // 新Agent默认置信度

    // 数据样本越多，置信度越高
    const sampleSize = performance.totalTasks
    const sampleConfidence = Math.min(sampleSize / 20, 1) // 20个任务后达到满置信度

    // 性能稳定性
    const stabilityScore = 1 - (performance.performanceStdDev || 0.2)

    return (sampleConfidence * 0.6 + stabilityScore * 0.4)
  }

  /**
   * 生成推荐原因
   */
  private generateReasons(agent: Agent, task: Task, score: number): string[] {
    const reasons: string[] = []

    // 技能匹配
    const skillMatch = this.calculateSkillMatch(agent, task)
    if (skillMatch > 80) {
      reasons.push(`技能高度匹配 (${skillMatch}分)`)
    } else if (skillMatch > 60) {
      reasons.push(`技能较为匹配 (${skillMatch}分)`)
    }

    // 工作负载
    const taskCount = this.getAgentTaskCount(agent.id)
    if (taskCount === 0) {
      reasons.push('当前无任务，可立即开始')
    } else if (taskCount <= 2) {
      reasons.push(`负载较轻 (${taskCount}个任务)`)
    }

    // 历史表现
    const performance = this.agentPerformance.get(agent.id)
    if (performance && performance.avgQualityScore > 0.8) {
      reasons.push('历史表现优异')
    }

    // 等级匹配
    if (agent.level >= 50) {
      reasons.push('经验丰富的高级Agent')
    }

    // 可用性
    if (agent.status === 'idle' || agent.status === 'available') {
      reasons.push('当前处于空闲状态')
    }

    // 如果没有明显理由，添加默认说明
    if (reasons.length === 0) {
      reasons.push('综合评估推荐')
    }

    return reasons
  }

  /**
   * 提取关键词
   */
  private extractKeywords(text: string): string[] {
    // 简单的关键词提取
    const stopWords = new Set(['的', '是', '在', '和', '了', '有', 'the', 'a', 'an', 'and', 'or'])

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
  }

  /**
   * 获取Agent当前任务数
   */
  private getAgentTaskCount(agentId: string): number {
    const history = this.taskHistory.get(agentId) || []
    return history.filter(h => h.status === 'in_progress').length
  }

  /**
   * 更新任务历史
   */
  updateTaskHistory(agentId: string, task: Task, outcome: TaskOutcome): void {
    const history = this.taskHistory.get(agentId) || []

    history.push({
      taskId: task.id,
      agentId,
      status: outcome.status,
      completedAt: new Date(),
      qualityScore: outcome.qualityScore,
      duration: outcome.duration,
    })

    this.taskHistory.set(agentId, history)
    this.updateAgentPerformance(agentId)
  }

  /**
   * 更新Agent性能数据
   */
  private updateAgentPerformance(agentId: string): void {
    const history = this.taskHistory.get(agentId) || []

    const completed = history.filter(h => h.status === 'completed')
    const failed = history.filter(h => h.status === 'failed')
    const avgQuality = completed.length > 0
      ? completed.reduce((sum, h) => sum + (h.qualityScore || 0), 0) / completed.length
      : 0

    // 计算性能标准差
    const qualityScores = completed.map(h => h.qualityScore || 0)
    const stdDev = this.calculateStdDev(qualityScores)

    this.agentPerformance.set(agentId, {
      totalTasks: history.length,
      completedTasks: completed.length,
      failedTasks: failed.length,
      avgQualityScore: avgQuality,
      performanceStdDev: stdDev,
    })
  }

  /**
   * 计算标准差
   */
  private calculateStdDev(values: number[]): number {
    if (values.length === 0) return 0

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
    const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length

    return Math.sqrt(variance)
  }
}

/**
 * 任务历史记录
 */
interface TaskHistory {
  taskId: string
  agentId: string
  status: 'completed' | 'failed' | 'in_progress'
  completedAt: Date
  qualityScore?: number
  duration?: number // 毫秒
}

/**
 * Agent性能数据
 */
interface AgentPerformance {
  totalTasks: number
  completedTasks: number
  failedTasks: number
  avgQualityScore: number
  performanceStdDev: number
}

/**
 * 任务结果
 */
export interface TaskOutcome {
  status: 'completed' | 'failed'
  qualityScore: number // 0-1
  duration: number // 毫秒
}

/**
 * 单例实例
 */
export const recommendationEngine = new RecommendationEngine()
