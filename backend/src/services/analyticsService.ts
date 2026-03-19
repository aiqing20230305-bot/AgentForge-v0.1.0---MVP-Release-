/**
 * Analytics Service
 * v2.4.0 Phase 1.2 - 数据分析服务
 */

interface QueryOptions {
  timeRange: string
  teamId?: string
  userId?: string
  agentId?: string
  limit?: number
  groupBy?: string
  filters?: Record<string, any>
  metrics?: string[]
}

export class AnalyticsService {
  /**
   * 获取时间范围的开始日期
   */
  private getStartDate(timeRange: string): Date {
    const now = new Date()
    switch (timeRange) {
      case 'day':
        return new Date(now.setHours(0, 0, 0, 0))
      case 'week':
        return new Date(now.setDate(now.getDate() - 7))
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1))
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1))
      default:
        return new Date(now.setDate(now.getDate() - 7))
    }
  }

  /**
   * 获取概览数据
   */
  async getOverview(options: QueryOptions) {
    const { timeRange, teamId, userId } = options
    const startDate = this.getStartDate(timeRange)

    // TODO: 从数据库聚合实际数据
    // 这里返回模拟数据
    return {
      metrics: {
        totalAgents: 42,
        agentChange: 12.5,
        totalTasks: 156,
        taskChange: 8.3,
        activeUsers: 23,
        userChange: -2.1,
        avgResponseTime: 245,
        responseChange: -5.6 // 负数表示改进
      },
      summary: {
        timeRange,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
        teamId: teamId || null,
        userId: userId || null
      }
    }
  }

  /**
   * 获取Agent性能数据
   */
  async getAgentPerformance(options: QueryOptions) {
    const { timeRange, limit = 10, teamId } = options
    const startDate = this.getStartDate(timeRange)

    // TODO: 从数据库查询实际Agent性能
    // 模拟数据
    const agents = [
      { id: '1', name: 'Agent-001', totalTasks: 45, successTasks: 42, failedTasks: 3, avgTime: 234 },
      { id: '2', name: 'Agent-002', totalTasks: 38, successTasks: 36, failedTasks: 2, avgTime: 256 },
      { id: '3', name: 'Agent-003', totalTasks: 32, successTasks: 30, failedTasks: 2, avgTime: 289 },
      { id: '4', name: 'Agent-004', totalTasks: 28, successTasks: 27, failedTasks: 1, avgTime: 198 },
      { id: '5', name: 'Agent-005', totalTasks: 25, successTasks: 23, failedTasks: 2, avgTime: 312 }
    ]

    return {
      agents: agents.slice(0, limit).map(agent => ({
        ...agent,
        successRate: (agent.successTasks / agent.totalTasks * 100).toFixed(2) + '%'
      })),
      summary: {
        totalAgents: agents.length,
        timeRange,
        startDate: startDate.toISOString()
      }
    }
  }

  /**
   * 获取任务完成统计
   */
  async getTaskCompletion(options: QueryOptions) {
    const { timeRange, teamId, agentId } = options
    const startDate = this.getStartDate(timeRange)

    // TODO: 从数据库聚合任务状态
    // 模拟数据
    return {
      status: {
        completed: 142,
        inProgress: 18,
        pending: 8,
        failed: 4
      },
      total: 172,
      completionRate: '82.56%',
      trend: [
        { date: '03-13', completed: 18, failed: 2 },
        { date: '03-14', completed: 22, failed: 1 },
        { date: '03-15', completed: 25, failed: 0 },
        { date: '03-16', completed: 20, failed: 1 },
        { date: '03-17', completed: 24, failed: 0 },
        { date: '03-18', completed: 19, failed: 0 },
        { date: '03-19', completed: 14, failed: 0 }
      ],
      summary: {
        timeRange,
        startDate: startDate.toISOString(),
        teamId: teamId || null,
        agentId: agentId || null
      }
    }
  }

  /**
   * 获取用户活动数据
   */
  async getUserActivity(options: QueryOptions) {
    const { timeRange, teamId } = options
    const startDate = this.getStartDate(timeRange)

    // TODO: 从数据库聚合用户活动
    // 模拟热力图数据
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    const hours = Array.from({ length: 24 }, (_, i) => i)

    const heatmap = days.map(day => {
      return hours.map(hour => {
        // 工作时间活跃度高
        let value = Math.floor(Math.random() * 10)
        if (hour >= 9 && hour <= 18 && !day.includes('周')) {
          value += Math.floor(Math.random() * 20)
        }
        return {
          day,
          hour,
          value
        }
      })
    }).flat()

    return {
      heatmap,
      stats: {
        totalUsers: 23,
        activeUsers: 18,
        dailyActiveUsers: 15,
        peakHour: 14, // 14:00最活跃
        peakDay: '周三'
      },
      summary: {
        timeRange,
        startDate: startDate.toISOString(),
        teamId: teamId || null
      }
    }
  }

  /**
   * 自定义分析查询
   */
  async getCustomAnalytics(options: QueryOptions) {
    const { metric, timeRange, groupBy, filters } = options
    const startDate = this.getStartDate(timeRange)

    // TODO: 实现灵活的自定义查询
    // 支持的metric: agents, tasks, users, performance, etc.

    // 模拟返回
    return {
      metric,
      data: [],
      groupBy,
      filters,
      summary: {
        timeRange,
        startDate: startDate.toISOString()
      }
    }
  }

  /**
   * 获取趋势数据
   */
  async getTrends(options: QueryOptions) {
    const { timeRange, metrics = ['agents', 'tasks'], teamId } = options
    const startDate = this.getStartDate(timeRange)

    // TODO: 从数据库查询历史趋势
    // 模拟7天趋势数据
    const trendData = [
      { date: '03-13', agents: 28, tasks: 65, users: 18 },
      { date: '03-14', agents: 32, tasks: 78, users: 20 },
      { date: '03-15', agents: 35, tasks: 92, users: 22 },
      { date: '03-16', agents: 38, tasks: 103, users: 21 },
      { date: '03-17', agents: 40, tasks: 128, users: 23 },
      { date: '03-18', agents: 41, tasks: 142, users: 22 },
      { date: '03-19', agents: 42, tasks: 156, users: 23 }
    ]

    return {
      trends: trendData.map(item => {
        const filtered: any = { date: item.date }
        metrics.forEach(metric => {
          if (metric in item) {
            filtered[metric] = item[metric as keyof typeof item]
          }
        })
        return filtered
      }),
      summary: {
        metrics,
        timeRange,
        startDate: startDate.toISOString(),
        teamId: teamId || null
      }
    }
  }

  /**
   * 预测分析（Phase 1.3）
   */
  async predictTrend(metric: string, historicalData: number[]): Promise<number[]> {
    // TODO: 实现简单的线性回归预测
    // 使用最小二乘法预测未来7天

    if (historicalData.length < 3) {
      return []
    }

    // 简单移动平均预测
    const predictions: number[] = []
    const windowSize = 3

    for (let i = 0; i < 7; i++) {
      const lastValues = historicalData.slice(-windowSize)
      const avg = lastValues.reduce((a, b) => a + b, 0) / lastValues.length
      predictions.push(Math.round(avg * (1 + Math.random() * 0.1))) // 添加小幅增长
      historicalData.push(predictions[predictions.length - 1])
    }

    return predictions
  }

  /**
   * 异常检测（Phase 1.3）
   */
  async detectAnomalies(data: number[]): Promise<number[]> {
    // TODO: 使用Z-score方法检测异常值

    const mean = data.reduce((a, b) => a + b, 0) / data.length
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    const stdDev = Math.sqrt(variance)

    const anomalyIndices: number[] = []
    const threshold = 2 // Z-score阈值

    data.forEach((value, index) => {
      const zScore = Math.abs((value - mean) / stdDev)
      if (zScore > threshold) {
        anomalyIndices.push(index)
      }
    })

    return anomalyIndices
  }
}
