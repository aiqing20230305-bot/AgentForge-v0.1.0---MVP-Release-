/**
 * AI Assistant Service
 * Provides intelligent suggestions and automatic optimizations for task management
 */

import type { Task, TaskPriority } from '../types/task'

export type SuggestionType =
  | 'task_priority'
  | 'skill_upgrade'
  | 'resource_allocation'
  | 'performance_diagnosis'
  | 'workflow_optimization'

export interface Suggestion {
  id: string
  type: SuggestionType
  title: string
  description: string
  confidence: number // 0-100
  impact: 'low' | 'medium' | 'high'
  actionable: boolean
  actions?: SuggestionAction[]
  createdAt: string
  metadata?: any
}

export interface SuggestionAction {
  label: string
  action: () => void | Promise<void>
  destructive?: boolean
}

export interface UserHabits {
  preferredWorkTimes: { hour: number; count: number }[]
  taskCompletionRate: { [priority: string]: number }
  averageTaskDuration: { [priority: string]: number }
  frequentTags: { tag: string; count: number }[]
  agentWorkload: { [agentId: string]: number }
}

export interface PerformanceMetrics {
  taskThroughput: number // tasks per day
  averageCompletionTime: number // hours
  failureRate: number // percentage
  bottlenecks: string[]
}

class AIAssistantService {
  private userHabits: UserHabits | null = null
  private lastAnalysisTime: number = 0
  private analysisInterval = 5 * 60 * 1000 // 5 minutes

  /**
   * Analyze tasks and generate intelligent suggestions
   */
  async generateSuggestions(
    tasks: Task[],
    agentId?: string
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = []

    // Update user habits
    this.updateUserHabits(tasks)

    // Filter tasks if agentId provided
    const filteredTasks = agentId
      ? tasks.filter(t => t.agentId === agentId)
      : tasks

    // Generate different types of suggestions
    suggestions.push(...this.suggestTaskPriorities(filteredTasks))
    suggestions.push(...this.suggestSkillUpgrades(tasks))
    suggestions.push(...this.suggestResourceAllocation(tasks))
    suggestions.push(...this.diagnosePerformanceIssues(tasks))
    suggestions.push(...this.optimizeWorkflow(tasks))

    // Sort by confidence and impact
    return suggestions.sort((a, b) => {
      const impactScore = { high: 3, medium: 2, low: 1 }
      return (
        impactScore[b.impact] * b.confidence -
        impactScore[a.impact] * a.confidence
      )
    })
  }

  /**
   * Task Priority Recommendations
   */
  private suggestTaskPriorities(tasks: Task[]): Suggestion[] {
    const suggestions: Suggestion[] = []
    const pendingTasks = tasks.filter(t => t.status === 'pending')

    // High priority tasks that have been pending too long
    const staleTasks = pendingTasks.filter(t => {
      const daysSinceCreation =
        (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      return t.priority === 'high' && daysSinceCreation > 3
    })

    if (staleTasks.length > 0) {
      suggestions.push({
        id: `priority-${Date.now()}-1`,
        type: 'task_priority',
        title: '高优先级任务积压',
        description: `发现 ${staleTasks.length} 个高优先级任务已等待超过3天。建议立即处理或重新评估优先级。`,
        confidence: 90,
        impact: 'high',
        actionable: true,
        createdAt: new Date().toISOString(),
        metadata: { tasks: staleTasks.map(t => t.id) }
      })
    }

    // Too many urgent tasks
    const urgentTasks = pendingTasks.filter(t => t.priority === 'urgent')
    if (urgentTasks.length > 5) {
      suggestions.push({
        id: `priority-${Date.now()}-2`,
        type: 'task_priority',
        title: '紧急任务过多',
        description: `当前有 ${urgentTasks.length} 个紧急任务。考虑重新评估优先级，避免"一切都紧急"的情况。`,
        confidence: 85,
        impact: 'medium',
        actionable: true,
        createdAt: new Date().toISOString(),
        metadata: { tasks: urgentTasks.map(t => t.id) }
      })
    }

    // Low priority tasks with simple tags that can be batch processed
    const lowPriorityTasks = pendingTasks.filter(t => t.priority === 'low')
    if (lowPriorityTasks.length > 10) {
      suggestions.push({
        id: `priority-${Date.now()}-3`,
        type: 'task_priority',
        title: '低优先级任务积累',
        description: `有 ${lowPriorityTasks.length} 个低优先级任务。建议安排专门时间批量处理。`,
        confidence: 75,
        impact: 'low',
        actionable: true,
        createdAt: new Date().toISOString(),
        metadata: { tasks: lowPriorityTasks.map(t => t.id) }
      })
    }

    return suggestions
  }

  /**
   * Skill Upgrade Suggestions
   */
  private suggestSkillUpgrades(tasks: Task[]): Suggestion[] {
    const suggestions: Suggestion[] = []
    const completedTasks = tasks.filter(t => t.status === 'completed')
    const failedTasks = tasks.filter(t => t.status === 'failed')

    // Analyze task tags to identify skill gaps
    const tagFrequency = new Map<string, number>()
    tasks.forEach(task => {
      task.tags?.forEach(tag => {
        tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1)
      })
    })

    // Identify areas with high failure rate
    const failureByTag = new Map<string, { total: number; failed: number }>()
    tasks.forEach(task => {
      task.tags?.forEach(tag => {
        const stats = failureByTag.get(tag) || { total: 0, failed: 0 }
        stats.total++
        if (task.status === 'failed') stats.failed++
        failureByTag.set(tag, stats)
      })
    })

    failureByTag.forEach((stats, tag) => {
      const failureRate = stats.failed / stats.total
      if (failureRate > 0.3 && stats.total >= 3) {
        suggestions.push({
          id: `skill-${Date.now()}-${tag}`,
          type: 'skill_upgrade',
          title: `${tag} 技能需要提升`,
          description: `在 ${tag} 相关任务中，失败率达到 ${(failureRate * 100).toFixed(1)}%。建议投入时间学习或寻求专家支持。`,
          confidence: 80,
          impact: 'high',
          actionable: true,
          createdAt: new Date().toISOString(),
          metadata: { tag, failureRate, totalTasks: stats.total }
        })
      }
    })

    // Suggest learning based on frequently used tags
    const topTags = Array.from(tagFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    if (topTags.length > 0) {
      suggestions.push({
        id: `skill-${Date.now()}-growth`,
        type: 'skill_upgrade',
        title: '核心技能加强',
        description: `你经常处理 ${topTags.map(([tag]) => tag).join('、')} 相关任务。建议深化这些领域的专业知识。`,
        confidence: 70,
        impact: 'medium',
        actionable: true,
        createdAt: new Date().toISOString(),
        metadata: { topTags }
      })
    }

    return suggestions
  }

  /**
   * Resource Allocation Optimization
   */
  private suggestResourceAllocation(tasks: Task[]): Suggestion[] {
    const suggestions: Suggestion[] = []

    // Analyze workload by agent
    const agentWorkload = new Map<string, { total: number; inProgress: number; pending: number }>()
    tasks.forEach(task => {
      const load = agentWorkload.get(task.agentId) || { total: 0, inProgress: 0, pending: 0 }
      load.total++
      if (task.status === 'in_progress') load.inProgress++
      if (task.status === 'pending') load.pending++
      agentWorkload.set(task.agentId, load)
    })

    // Find overloaded agents
    const overloadedAgents: string[] = []
    const underloadedAgents: string[] = []

    agentWorkload.forEach((load, agentId) => {
      if (load.inProgress > 5) {
        overloadedAgents.push(agentId)
      } else if (load.inProgress < 2 && load.pending > 0) {
        underloadedAgents.push(agentId)
      }
    })

    if (overloadedAgents.length > 0) {
      suggestions.push({
        id: `resource-${Date.now()}-overload`,
        type: 'resource_allocation',
        title: 'Agent负载不均',
        description: `${overloadedAgents.join(', ')} 当前任务过多。建议重新分配任务或暂停新任务分配。`,
        confidence: 85,
        impact: 'high',
        actionable: true,
        createdAt: new Date().toISOString(),
        metadata: { overloadedAgents, underloadedAgents }
      })
    }

    if (overloadedAgents.length > 0 && underloadedAgents.length > 0) {
      suggestions.push({
        id: `resource-${Date.now()}-rebalance`,
        type: 'resource_allocation',
        title: '资源重新平衡',
        description: `可以将部分任务从 ${overloadedAgents.join(', ')} 转移到 ${underloadedAgents.join(', ')}`,
        confidence: 75,
        impact: 'medium',
        actionable: true,
        createdAt: new Date().toISOString(),
        metadata: { from: overloadedAgents, to: underloadedAgents }
      })
    }

    return suggestions
  }

  /**
   * Performance Issue Diagnosis
   */
  private diagnosePerformanceIssues(tasks: Task[]): Suggestion[] {
    const suggestions: Suggestion[] = []

    // Calculate completion rate
    const completedCount = tasks.filter(t => t.status === 'completed').length
    const failedCount = tasks.filter(t => t.status === 'failed').length
    const totalFinished = completedCount + failedCount

    if (totalFinished > 0) {
      const failureRate = (failedCount / totalFinished) * 100

      if (failureRate > 20) {
        suggestions.push({
          id: `perf-${Date.now()}-failure`,
          type: 'performance_diagnosis',
          title: '任务失败率偏高',
          description: `当前任务失败率为 ${failureRate.toFixed(1)}%，建议检查任务定义、资源配置或执行流程。`,
          confidence: 90,
          impact: 'high',
          actionable: true,
          createdAt: new Date().toISOString(),
          metadata: { failureRate, failedCount, totalFinished }
        })
      }
    }

    // Analyze task duration
    const completedWithDuration = tasks.filter(
      t => t.status === 'completed' && t.startedAt && t.completedAt
    )

    if (completedWithDuration.length > 5) {
      const durations = completedWithDuration.map(t => {
        const start = new Date(t.startedAt!).getTime()
        const end = new Date(t.completedAt!).getTime()
        return (end - start) / (1000 * 60 * 60) // hours
      })

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
      const longRunningTasks = completedWithDuration.filter((t, i) => durations[i] > avgDuration * 2)

      if (longRunningTasks.length > 3) {
        suggestions.push({
          id: `perf-${Date.now()}-duration`,
          type: 'performance_diagnosis',
          title: '任务耗时过长',
          description: `发现 ${longRunningTasks.length} 个任务耗时超过平均值2倍。建议拆分复杂任务或优化执行流程。`,
          confidence: 80,
          impact: 'medium',
          actionable: true,
          createdAt: new Date().toISOString(),
          metadata: { avgDuration, longRunningTasks: longRunningTasks.map(t => t.id) }
        })
      }
    }

    // Check for stuck tasks
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
    const stuckTasks = inProgressTasks.filter(t => {
      const hoursSinceStart =
        (Date.now() - new Date(t.startedAt || t.createdAt).getTime()) / (1000 * 60 * 60)
      return hoursSinceStart > 24
    })

    if (stuckTasks.length > 0) {
      suggestions.push({
        id: `perf-${Date.now()}-stuck`,
        type: 'performance_diagnosis',
        title: '任务可能卡住',
        description: `${stuckTasks.length} 个任务已运行超过24小时。建议检查执行状态或考虑重启。`,
        confidence: 85,
        impact: 'high',
        actionable: true,
        createdAt: new Date().toISOString(),
        metadata: { stuckTasks: stuckTasks.map(t => t.id) }
      })
    }

    return suggestions
  }

  /**
   * Workflow Optimization
   */
  private optimizeWorkflow(tasks: Task[]): Suggestion[] {
    const suggestions: Suggestion[] = []

    // Analyze task creation patterns
    const tasksByHour = new Map<number, number>()
    tasks.forEach(task => {
      const hour = new Date(task.createdAt).getHours()
      tasksByHour.set(hour, (tasksByHour.get(hour) || 0) + 1)
    })

    // Find peak hours
    const peakHour = Array.from(tasksByHour.entries())
      .sort((a, b) => b[1] - a[1])[0]

    if (peakHour && peakHour[1] > tasks.length * 0.2) {
      suggestions.push({
        id: `workflow-${Date.now()}-peak`,
        type: 'workflow_optimization',
        title: '任务创建时间集中',
        description: `大部分任务在 ${peakHour[0]}:00 创建。建议分散任务创建时间或在高峰期增加资源。`,
        confidence: 70,
        impact: 'low',
        actionable: true,
        createdAt: new Date().toISOString(),
        metadata: { peakHour: peakHour[0], count: peakHour[1] }
      })
    }

    // Suggest batch processing for similar tasks
    const tagGroups = new Map<string, Task[]>()
    tasks.filter(t => t.status === 'pending').forEach(task => {
      task.tags?.forEach(tag => {
        const group = tagGroups.get(tag) || []
        group.push(task)
        tagGroups.set(tag, group)
      })
    })

    tagGroups.forEach((group, tag) => {
      if (group.length >= 5) {
        suggestions.push({
          id: `workflow-${Date.now()}-${tag}`,
          type: 'workflow_optimization',
          title: `批量处理 ${tag} 任务`,
          description: `有 ${group.length} 个 ${tag} 相关的待处理任务。建议集中时间批量处理以提高效率。`,
          confidence: 75,
          impact: 'medium',
          actionable: true,
          createdAt: new Date().toISOString(),
          metadata: { tag, taskCount: group.length, tasks: group.map(t => t.id) }
        })
      }
    })

    // Workflow automation suggestion
    const repeatPatterns = this.findRepeatPatterns(tasks)
    if (repeatPatterns.length > 0) {
      suggestions.push({
        id: `workflow-${Date.now()}-automation`,
        type: 'workflow_optimization',
        title: '任务自动化机会',
        description: `发现 ${repeatPatterns.length} 种重复任务模式。建议创建自动化工作流减少手动操作。`,
        confidence: 80,
        impact: 'high',
        actionable: true,
        createdAt: new Date().toISOString(),
        metadata: { patterns: repeatPatterns }
      })
    }

    return suggestions
  }

  /**
   * Find repeat task patterns
   */
  private findRepeatPatterns(tasks: Task[]): string[] {
    const patterns: string[] = []
    const titleWords = new Map<string, number>()

    tasks.forEach(task => {
      // Extract meaningful words (3+ chars)
      const words = task.title
        .toLowerCase()
        .split(/[\s\-_]+/)
        .filter(w => w.length >= 3)

      words.forEach(word => {
        titleWords.set(word, (titleWords.get(word) || 0) + 1)
      })
    })

    // Find frequently repeated words (potential patterns)
    titleWords.forEach((count, word) => {
      if (count >= 5 && !['任务', '项目', '开发', '测试'].includes(word)) {
        patterns.push(word)
      }
    })

    return patterns.slice(0, 3)
  }

  /**
   * Update user habits based on task history
   */
  private updateUserHabits(tasks: Task[]): void {
    const now = Date.now()
    if (now - this.lastAnalysisTime < this.analysisInterval) {
      return // Skip if analyzed recently
    }

    this.lastAnalysisTime = now

    // Analyze preferred work times
    const workTimes = new Map<number, number>()
    tasks
      .filter(t => t.startedAt)
      .forEach(task => {
        const hour = new Date(task.startedAt!).getHours()
        workTimes.set(hour, (workTimes.get(hour) || 0) + 1)
      })

    // Calculate completion rate by priority
    const completionRate: { [key: string]: number } = {}
    const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent']
    priorities.forEach(priority => {
      const tasksWithPriority = tasks.filter(t => t.priority === priority)
      const completed = tasksWithPriority.filter(t => t.status === 'completed').length
      completionRate[priority] = tasksWithPriority.length > 0
        ? completed / tasksWithPriority.length
        : 0
    })

    // Calculate average duration by priority
    const avgDuration: { [key: string]: number } = {}
    priorities.forEach(priority => {
      const completed = tasks.filter(
        t => t.priority === priority && t.status === 'completed' && t.startedAt && t.completedAt
      )
      if (completed.length > 0) {
        const totalDuration = completed.reduce((sum, task) => {
          const duration = new Date(task.completedAt!).getTime() - new Date(task.startedAt!).getTime()
          return sum + duration
        }, 0)
        avgDuration[priority] = totalDuration / completed.length / (1000 * 60 * 60) // hours
      }
    })

    // Analyze frequent tags
    const tagFrequency = new Map<string, number>()
    tasks.forEach(task => {
      task.tags?.forEach(tag => {
        tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1)
      })
    })

    const frequentTags = Array.from(tagFrequency.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Analyze agent workload
    const agentWorkload: { [key: string]: number } = {}
    tasks.forEach(task => {
      agentWorkload[task.agentId] = (agentWorkload[task.agentId] || 0) + 1
    })

    this.userHabits = {
      preferredWorkTimes: Array.from(workTimes.entries()).map(([hour, count]) => ({ hour, count })),
      taskCompletionRate: completionRate,
      averageTaskDuration: avgDuration,
      frequentTags,
      agentWorkload
    }
  }

  /**
   * Get user habits
   */
  getUserHabits(): UserHabits | null {
    return this.userHabits
  }

  /**
   * Calculate performance metrics
   */
  getPerformanceMetrics(tasks: Task[]): PerformanceMetrics {
    const completedTasks = tasks.filter(t => t.status === 'completed')
    const failedTasks = tasks.filter(t => t.status === 'failed')

    // Task throughput (tasks per day)
    const oldestTask = tasks.reduce((oldest, task) => {
      const taskDate = new Date(task.createdAt).getTime()
      return taskDate < oldest ? taskDate : oldest
    }, Date.now())

    const daysSinceStart = (Date.now() - oldestTask) / (1000 * 60 * 60 * 24)
    const taskThroughput = daysSinceStart > 0 ? completedTasks.length / daysSinceStart : 0

    // Average completion time
    const durations = completedTasks
      .filter(t => t.startedAt && t.completedAt)
      .map(t => {
        const start = new Date(t.startedAt!).getTime()
        const end = new Date(t.completedAt!).getTime()
        return (end - start) / (1000 * 60 * 60) // hours
      })

    const averageCompletionTime =
      durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0

    // Failure rate
    const totalFinished = completedTasks.length + failedTasks.length
    const failureRate = totalFinished > 0 ? (failedTasks.length / totalFinished) * 100 : 0

    // Identify bottlenecks
    const bottlenecks: string[] = []
    const agentFailureRate = new Map<string, { total: number; failed: number }>()

    tasks.forEach(task => {
      if (task.status === 'completed' || task.status === 'failed') {
        const stats = agentFailureRate.get(task.agentId) || { total: 0, failed: 0 }
        stats.total++
        if (task.status === 'failed') stats.failed++
        agentFailureRate.set(task.agentId, stats)
      }
    })

    agentFailureRate.forEach((stats, agentId) => {
      if (stats.total >= 5 && stats.failed / stats.total > 0.3) {
        bottlenecks.push(`Agent ${agentId} 高失败率 (${((stats.failed / stats.total) * 100).toFixed(1)}%)`)
      }
    })

    return {
      taskThroughput,
      averageCompletionTime,
      failureRate,
      bottlenecks
    }
  }

  /**
   * Parse natural language commands
   */
  async parseCommand(command: string, tasks: Task[]): Promise<{
    intent: string
    action?: () => void
    response: string
  }> {
    const lowerCommand = command.toLowerCase().trim()

    // Optimize task queue
    if (lowerCommand.includes('优化') && lowerCommand.includes('任务')) {
      const suggestions = await this.generateSuggestions(tasks)
      const highImpact = suggestions.filter(s => s.impact === 'high')

      return {
        intent: 'optimize_tasks',
        response: highImpact.length > 0
          ? `已分析任务队列，发现 ${highImpact.length} 个高影响建议：\n${highImpact.map(s => `- ${s.title}`).join('\n')}`
          : '任务队列运行良好，暂无优化建议。'
      }
    }

    // Analyze performance
    if (lowerCommand.includes('分析') || lowerCommand.includes('性能')) {
      const metrics = this.getPerformanceMetrics(tasks)
      return {
        intent: 'analyze_performance',
        response: `性能分析结果：
- 任务吞吐量：${metrics.taskThroughput.toFixed(2)} 个/天
- 平均完成时间：${metrics.averageCompletionTime.toFixed(1)} 小时
- 失败率：${metrics.failureRate.toFixed(1)}%
${metrics.bottlenecks.length > 0 ? `- 瓶颈：${metrics.bottlenecks.join(', ')}` : '- 无明显瓶颈'}`
      }
    }

    // Show suggestions
    if (lowerCommand.includes('建议') || lowerCommand.includes('推荐')) {
      const suggestions = await this.generateSuggestions(tasks)
      return {
        intent: 'get_suggestions',
        response: suggestions.length > 0
          ? `为您找到 ${suggestions.length} 条建议：\n${suggestions.slice(0, 5).map(s => `- ${s.title} (置信度: ${s.confidence}%)`).join('\n')}`
          : '当前没有新建议。'
      }
    }

    // Check habits
    if (lowerCommand.includes('习惯') || lowerCommand.includes('统计')) {
      const habits = this.getUserHabits()
      if (habits) {
        const topHour = habits.preferredWorkTimes.sort((a, b) => b.count - a.count)[0]
        return {
          intent: 'check_habits',
          response: `用户习惯分析：
- 高效工作时段：${topHour?.hour || 'N/A'}:00
- 常用标签：${habits.frequentTags.slice(0, 3).map(t => t.tag).join(', ')}
- 高优先级完成率：${((habits.taskCompletionRate.high || 0) * 100).toFixed(1)}%`
        }
      }
    }

    // Default response
    return {
      intent: 'unknown',
      response: '我可以帮你：\n- 优化任务队列\n- 分析性能指标\n- 提供智能建议\n- 查看工作习惯\n\n试试说："帮我优化任务队列"'
    }
  }
}

// Global singleton instance
export const aiAssistant = new AIAssistantService()
