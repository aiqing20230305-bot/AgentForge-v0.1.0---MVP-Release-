/**
 * 任务分析服务
 * 分析任务完成率、Agent性能等指标
 */

import { Agent } from '../../types/agent'
import { Task } from '../../types/task'

/**
 * 任务分析结果
 */
export interface TaskAnalysis {
  completionRate: number // 完成率
  avgDuration: number // 平均耗时（毫秒）
  successRate: number // 成功率
  taskDistribution: TaskDistribution
  performanceByAgent: Map<string, AgentTaskPerformance>
  trends: TaskTrends
}

/**
 * 任务分布
 */
interface TaskDistribution {
  byPriority: Record<string, number>
  byStatus: Record<string, number>
  byAgent: Record<string, number>
}

/**
 * Agent任务性能
 */
export interface AgentTaskPerformance {
  agentId: string
  agentName: string
  totalTasks: number
  completedTasks: number
  failedTasks: number
  inProgressTasks: number
  avgCompletionTime: number
  successRate: number
  performanceScore: number // 0-100
}

/**
 * 任务趋势
 */
interface TaskTrends {
  completionRateTrend: number[] // 最近7天
  taskCountTrend: number[] // 最近7天
  performanceTrend: 'improving' | 'stable' | 'declining'
}

/**
 * 任务分析器类
 */
export class TaskAnalyzer {
  /**
   * 分析所有任务
   */
  analyzeTasks(tasks: Task[], agents: Agent[]): TaskAnalysis {
    const completedTasks = tasks.filter(t => t.status === 'completed')
    const failedTasks = tasks.filter(t => t.status === 'failed')
    const totalFinished = completedTasks.length + failedTasks.length

    return {
      completionRate: totalFinished > 0
        ? completedTasks.length / totalFinished
        : 0,
      avgDuration: this.calculateAvgDuration(completedTasks),
      successRate: totalFinished > 0
        ? completedTasks.length / totalFinished
        : 1,
      taskDistribution: this.analyzeDistribution(tasks),
      performanceByAgent: this.analyzeAgentPerformance(tasks, agents),
      trends: this.analyzeTrends(tasks),
    }
  }

  /**
   * 分析Agent性能
   */
  analyzeAgentPerformance(
    tasks: Task[],
    agents: Agent[]
  ): Map<string, AgentTaskPerformance> {
    const performanceMap = new Map<string, AgentTaskPerformance>()

    for (const agent of agents) {
      const agentTasks = tasks.filter(t => t.agentId === agent.id)
      const completed = agentTasks.filter(t => t.status === 'completed')
      const failed = agentTasks.filter(t => t.status === 'failed')
      const inProgress = agentTasks.filter(t => t.status === 'in_progress')

      const totalFinished = completed.length + failed.length
      const successRate = totalFinished > 0
        ? completed.length / totalFinished
        : 1

      const avgTime = this.calculateAvgDuration(completed)
      const performanceScore = this.calculatePerformanceScore(
        successRate,
        avgTime,
        agentTasks.length
      )

      performanceMap.set(agent.id, {
        agentId: agent.id,
        agentName: agent.name,
        totalTasks: agentTasks.length,
        completedTasks: completed.length,
        failedTasks: failed.length,
        inProgressTasks: inProgress.length,
        avgCompletionTime: avgTime,
        successRate,
        performanceScore,
      })
    }

    return performanceMap
  }

  /**
   * 计算平均耗时
   */
  private calculateAvgDuration(tasks: Task[]): number {
    if (tasks.length === 0) return 0

    const durations = tasks
      .filter(t => t.completedAt && t.createdAt)
      .map(t => {
        const completed = new Date(t.completedAt!).getTime()
        const created = new Date(t.createdAt!).getTime()
        return completed - created
      })

    if (durations.length === 0) return 0

    return durations.reduce((sum, d) => sum + d, 0) / durations.length
  }

  /**
   * 分析任务分布
   */
  private analyzeDistribution(tasks: Task[]): TaskDistribution {
    const byPriority: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    const byAgent: Record<string, number> = {}

    for (const task of tasks) {
      // 按优先级
      byPriority[task.priority || 'medium'] =
        (byPriority[task.priority || 'medium'] || 0) + 1

      // 按状态
      byStatus[task.status] = (byStatus[task.status] || 0) + 1

      // 按Agent
      if (task.agentId) {
        byAgent[task.agentId] = (byAgent[task.agentId] || 0) + 1
      }
    }

    return { byPriority, byStatus, byAgent }
  }

  /**
   * 分析任务趋势
   */
  private analyzeTrends(tasks: Task[]): TaskTrends {
    const completionRateTrend = this.calculateCompletionRateTrend(tasks, 7)
    const taskCountTrend = this.calculateTaskCountTrend(tasks, 7)
    const performanceTrend = this.determinePerformanceTrend(completionRateTrend)

    return {
      completionRateTrend,
      taskCountTrend,
      performanceTrend,
    }
  }

  /**
   * 计算完成率趋势（最近N天）
   */
  private calculateCompletionRateTrend(tasks: Task[], days: number): number[] {
    const trend: number[] = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dayTasks = tasks.filter(t => {
        const createdAt = new Date(t.createdAt || 0)
        return createdAt >= date && createdAt < nextDate
      })

      const completed = dayTasks.filter(t => t.status === 'completed').length
      const total = dayTasks.length

      trend.push(total > 0 ? completed / total : 0)
    }

    return trend
  }

  /**
   * 计算任务数量趋势（最近N天）
   */
  private calculateTaskCountTrend(tasks: Task[], days: number): number[] {
    const trend: number[] = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dayTasks = tasks.filter(t => {
        const createdAt = new Date(t.createdAt || 0)
        return createdAt >= date && createdAt < nextDate
      })

      trend.push(dayTasks.length)
    }

    return trend
  }

  /**
   * 判断性能趋势
   */
  private determinePerformanceTrend(
    completionRates: number[]
  ): 'improving' | 'stable' | 'declining' {
    if (completionRates.length < 3) return 'stable'

    const recent = completionRates.slice(-3)
    const earlier = completionRates.slice(-6, -3)

    if (earlier.length === 0) return 'stable'

    const recentAvg = recent.reduce((sum, r) => sum + r, 0) / recent.length
    const earlierAvg = earlier.reduce((sum, r) => sum + r, 0) / earlier.length

    const diff = recentAvg - earlierAvg

    if (diff > 0.1) return 'improving'
    if (diff < -0.1) return 'declining'
    return 'stable'
  }

  /**
   * 计算性能评分（0-100）
   */
  private calculatePerformanceScore(
    successRate: number,
    avgDuration: number,
    totalTasks: number
  ): number {
    // 成功率权重 50%
    const successScore = successRate * 50

    // 效率权重 30%（基于平均耗时）
    const targetDuration = 3600000 // 1小时
    const efficiencyRatio = Math.min(targetDuration / Math.max(avgDuration, 1000), 1)
    const efficiencyScore = efficiencyRatio * 30

    // 经验权重 20%（基于任务数量）
    const experienceScore = Math.min(totalTasks / 50, 1) * 20

    return Math.round(successScore + efficiencyScore + experienceScore)
  }

  /**
   * 计算技能匹配度
   */
  calculateSkillMatchScore(agent: Agent, task: Task): number {
    if (!agent.skills || agent.skills.length === 0) return 50

    const taskKeywords = this.extractTaskKeywords(task)
    const agentSkillNames = agent.skills.map(s => s.name.toLowerCase())

    let matchCount = 0
    for (const keyword of taskKeywords) {
      for (const skill of agentSkillNames) {
        if (skill.includes(keyword) || keyword.includes(skill)) {
          matchCount++
          break
        }
      }
    }

    const baseScore = (matchCount / Math.max(taskKeywords.length, 1)) * 100

    // 等级加成
    const levelBonus = Math.min(agent.level / 100, 0.15) * 100

    return Math.min(baseScore + levelBonus, 100)
  }

  /**
   * 提取任务关键词
   */
  private extractTaskKeywords(task: Task): string[] {
    const text = `${task.title} ${task.description || ''}`.toLowerCase()
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      '的', '是', '在', '和', '了', '有', '个', '人', '这', '中', '上'
    ])

    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 10) // 只取前10个关键词
  }

  /**
   * 预测任务完成时间
   */
  predictCompletionTime(agent: Agent, task: Task, historicalData: Task[]): number {
    // 获取Agent的历史任务
    const agentTasks = historicalData.filter(
      t => t.agentId === agent.id && t.status === 'completed'
    )

    if (agentTasks.length === 0) {
      // 无历史数据，返回默认值（1小时）
      return 3600000
    }

    // 计算相似任务的平均耗时
    const similarTasks = agentTasks.filter(t => {
      const similarity = this.calculateTaskSimilarity(task, t)
      return similarity > 0.5
    })

    const avgDuration = similarTasks.length > 0
      ? this.calculateAvgDuration(similarTasks)
      : this.calculateAvgDuration(agentTasks)

    return avgDuration
  }

  /**
   * 计算任务相似度（0-1）
   */
  private calculateTaskSimilarity(task1: Task, task2: Task): number {
    const keywords1 = new Set(this.extractTaskKeywords(task1))
    const keywords2 = new Set(this.extractTaskKeywords(task2))

    // Jaccard相似度
    const intersection = new Set(
      [...keywords1].filter(k => keywords2.has(k))
    )
    const union = new Set([...keywords1, ...keywords2])

    return union.size > 0 ? intersection.size / union.size : 0
  }
}

/**
 * 单例实例
 */
export const taskAnalyzer = new TaskAnalyzer()
