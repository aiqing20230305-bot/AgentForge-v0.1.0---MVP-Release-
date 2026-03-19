/**
 * 订阅管理器
 * 管理用户订阅状态、用量统计和功能限制
 */

import { SubscriptionPlan, Feature, isFeatureAvailable } from '../utils/featureGate'

// 免费版限制
export const FREE_LIMITS = {
  maxAgents: 3,
  maxTasksPerMonth: 50,
  maxAICallsPerMonth: 100,
  maxTeamMembers: 3,
}

// Pro版限制（无限制）
export const PRO_LIMITS = {
  maxAgents: Infinity,
  maxTasksPerMonth: Infinity,
  maxAICallsPerMonth: 500, // Pro用户有更高的AI调用额度
  maxTeamMembers: Infinity,
}

export interface SubscriptionStatus {
  plan: SubscriptionPlan
  isActive: boolean
  expiresAt: string | null // ISO 8601 date string, null for free plan
  autoRenew: boolean
  paymentMethod: string | null
}

export interface UsageStats {
  agents: number
  tasksThisMonth: number
  aiCallsThisMonth: number
  teamMembers: number
  monthStartDate: string // ISO 8601
}

export interface LimitCheckResult {
  allowed: boolean
  reason?: string
  currentUsage?: number
  limit?: number
  upgradeRequired?: boolean
}

/**
 * 订阅管理器类
 */
class SubscriptionManager {
  private storageKey = 'subscription_status'
  private usageKey = 'usage_stats'

  /**
   * 获取当前订阅状态
   */
  getSubscriptionStatus(): SubscriptionStatus {
    if (typeof window === 'undefined') {
      return this.getDefaultStatus()
    }

    const saved = localStorage.getItem(this.storageKey)
    if (saved) {
      try {
        const status = JSON.parse(saved) as SubscriptionStatus
        // 检查是否过期
        if (status.expiresAt && new Date(status.expiresAt) < new Date()) {
          // 订阅已过期，降级到免费版
          return this.getDefaultStatus()
        }
        return status
      } catch (e) {
        console.error('Failed to parse subscription status:', e)
      }
    }

    return this.getDefaultStatus()
  }

  /**
   * 获取默认订阅状态（免费版）
   */
  private getDefaultStatus(): SubscriptionStatus {
    return {
      plan: SubscriptionPlan.FREE,
      isActive: true,
      expiresAt: null,
      autoRenew: false,
      paymentMethod: null,
    }
  }

  /**
   * 更新订阅状态
   */
  updateSubscriptionStatus(status: Partial<SubscriptionStatus>): void {
    const current = this.getSubscriptionStatus()
    const updated = { ...current, ...status }
    localStorage.setItem(this.storageKey, JSON.stringify(updated))
  }

  /**
   * 获取用量统计
   */
  getUsageStats(): UsageStats {
    if (typeof window === 'undefined') {
      return this.getDefaultUsage()
    }

    const saved = localStorage.getItem(this.usageKey)
    if (saved) {
      try {
        const usage = JSON.parse(saved) as UsageStats

        // 检查是否是新的月份，如果是则重置月度统计
        const monthStart = new Date(usage.monthStartDate)
        const now = new Date()
        if (
          monthStart.getMonth() !== now.getMonth() ||
          monthStart.getFullYear() !== now.getFullYear()
        ) {
          return this.resetMonthlyUsage(usage.agents, usage.teamMembers)
        }

        return usage
      } catch (e) {
        console.error('Failed to parse usage stats:', e)
      }
    }

    return this.getDefaultUsage()
  }

  /**
   * 获取默认用量统计
   */
  private getDefaultUsage(): UsageStats {
    return {
      agents: 0,
      tasksThisMonth: 0,
      aiCallsThisMonth: 0,
      teamMembers: 1, // 默认只有用户自己
      monthStartDate: new Date().toISOString(),
    }
  }

  /**
   * 重置月度用量统计
   */
  private resetMonthlyUsage(currentAgents: number, currentTeamMembers: number): UsageStats {
    const newUsage: UsageStats = {
      agents: currentAgents,
      tasksThisMonth: 0,
      aiCallsThisMonth: 0,
      teamMembers: currentTeamMembers,
      monthStartDate: new Date().toISOString(),
    }
    this.updateUsageStats(newUsage)
    return newUsage
  }

  /**
   * 更新用量统计
   */
  updateUsageStats(stats: Partial<UsageStats>): void {
    const current = this.getUsageStats()
    const updated = { ...current, ...stats }
    localStorage.setItem(this.usageKey, JSON.stringify(updated))
  }

  /**
   * 检查是否可以创建新Agent
   */
  canCreateAgent(): LimitCheckResult {
    const { plan } = this.getSubscriptionStatus()
    const { agents } = this.getUsageStats()

    const limit = plan === SubscriptionPlan.PRO
      ? PRO_LIMITS.maxAgents
      : FREE_LIMITS.maxAgents

    if (agents >= limit) {
      return {
        allowed: false,
        reason: `您已达到${plan === SubscriptionPlan.FREE ? '免费版' : '当前版本'}的Agent数量上限`,
        currentUsage: agents,
        limit,
        upgradeRequired: plan === SubscriptionPlan.FREE,
      }
    }

    return { allowed: true }
  }

  /**
   * 检查是否可以创建新任务
   */
  canCreateTask(): LimitCheckResult {
    const { plan } = this.getSubscriptionStatus()
    const { tasksThisMonth } = this.getUsageStats()

    const limit = plan === SubscriptionPlan.PRO
      ? PRO_LIMITS.maxTasksPerMonth
      : FREE_LIMITS.maxTasksPerMonth

    if (tasksThisMonth >= limit) {
      return {
        allowed: false,
        reason: `您本月已达到任务数量上限（${limit}个）`,
        currentUsage: tasksThisMonth,
        limit,
        upgradeRequired: plan === SubscriptionPlan.FREE,
      }
    }

    return { allowed: true }
  }

  /**
   * 检查是否可以调用AI
   */
  canCallAI(): LimitCheckResult {
    const { plan } = this.getSubscriptionStatus()
    const { aiCallsThisMonth } = this.getUsageStats()

    const limit = plan === SubscriptionPlan.PRO
      ? PRO_LIMITS.maxAICallsPerMonth
      : FREE_LIMITS.maxAICallsPerMonth

    if (aiCallsThisMonth >= limit) {
      return {
        allowed: false,
        reason: `您本月的AI调用次数已用完（${limit}次）`,
        currentUsage: aiCallsThisMonth,
        limit,
        upgradeRequired: plan === SubscriptionPlan.FREE,
      }
    }

    return { allowed: true }
  }

  /**
   * 检查是否可以使用某个功能
   */
  canUseFeature(feature: Feature): LimitCheckResult {
    const { plan } = this.getSubscriptionStatus()

    if (!isFeatureAvailable(feature, plan)) {
      return {
        allowed: false,
        reason: `此功能仅限${SubscriptionPlan.PRO === plan ? 'Pro' : '高级'}用户使用`,
        upgradeRequired: true,
      }
    }

    return { allowed: true }
  }

  /**
   * 增加Agent数量
   */
  incrementAgents(): void {
    const usage = this.getUsageStats()
    this.updateUsageStats({ agents: usage.agents + 1 })
  }

  /**
   * 减少Agent数量
   */
  decrementAgents(): void {
    const usage = this.getUsageStats()
    this.updateUsageStats({ agents: Math.max(0, usage.agents - 1) })
  }

  /**
   * 增加任务数量
   */
  incrementTasks(): void {
    const usage = this.getUsageStats()
    this.updateUsageStats({ tasksThisMonth: usage.tasksThisMonth + 1 })
  }

  /**
   * 增加AI调用次数
   */
  incrementAICalls(): void {
    const usage = this.getUsageStats()
    this.updateUsageStats({ aiCallsThisMonth: usage.aiCallsThisMonth + 1 })
  }

  /**
   * 获取距离下月重置的剩余天数
   */
  getDaysUntilReset(): number {
    const usage = this.getUsageStats()
    const monthStart = new Date(usage.monthStartDate)
    const nextMonth = new Date(monthStart)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    const now = new Date()
    const diffMs = nextMonth.getTime() - now.getTime()
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  }

  /**
   * 获取用量百分比
   */
  getUsagePercentage(): {
    agents: number
    tasks: number
    aiCalls: number
  } {
    const { plan } = this.getSubscriptionStatus()
    const usage = this.getUsageStats()

    const limits = plan === SubscriptionPlan.PRO ? PRO_LIMITS : FREE_LIMITS

    return {
      agents: limits.maxAgents === Infinity
        ? 0
        : (usage.agents / limits.maxAgents) * 100,
      tasks: limits.maxTasksPerMonth === Infinity
        ? 0
        : (usage.tasksThisMonth / limits.maxTasksPerMonth) * 100,
      aiCalls: limits.maxAICallsPerMonth === Infinity
        ? 0
        : (usage.aiCallsThisMonth / limits.maxAICallsPerMonth) * 100,
    }
  }
}

// 单例导出
export const subscriptionManager = new SubscriptionManager()
