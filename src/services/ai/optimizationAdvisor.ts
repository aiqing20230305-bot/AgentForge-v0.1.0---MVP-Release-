/**
 * Optimization Advisor Service
 * 自动优化建议引擎 - 分析Agent性能并提供优化建议
 */

export interface OptimizationReport {
  agentId: string
  overallScore: number // 0-100
  categories: OptimizationCategory[]
  criticalIssues: OptimizationIssue[]
  recommendations: OptimizationRecommendation[]
  estimatedImprovement: ImprovementEstimate
  generatedAt: Date
}

export interface OptimizationCategory {
  name: string
  score: number
  issues: OptimizationIssue[]
  impact: 'low' | 'medium' | 'high'
}

export interface OptimizationIssue {
  id: string
  category: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  description: string
  detectedAt: Date
  affectedMetrics: string[]
  potentialCauses: string[]
}

export interface OptimizationRecommendation {
  id: string
  type: RecommendationType
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  implementation: string
  estimatedImpact: {
    performance: number // percentage improvement
    quality: number
    cost: number
  }
  difficulty: 'easy' | 'moderate' | 'hard'
  timeEstimate: string
  actions: OptimizationAction[]
}

export type RecommendationType =
  | 'prompt_optimization'
  | 'parameter_tuning'
  | 'skill_enhancement'
  | 'constraint_adjustment'
  | 'tool_integration'
  | 'workflow_improvement'
  | 'resource_allocation'

export interface OptimizationAction {
  label: string
  description: string
  code?: string
  autoApply: boolean
  onExecute: () => Promise<void>
}

export interface ImprovementEstimate {
  performanceGain: number // percentage
  qualityImprovement: number
  costReduction: number
  timeToApply: string
  confidence: number // 0-100
}

export interface AgentMetrics {
  responseTime: number[]
  successRate: number
  errorRate: number
  tokenUsage: number[]
  completionQuality: number[]
  userSatisfaction: number[]
  taskCompletionRate: number
}

class OptimizationAdvisorService {
  /**
   * 分析Agent并生成优化报告
   */
  async analyzeAgent(
    agentId: string,
    metrics: AgentMetrics,
    config: any
  ): Promise<OptimizationReport> {
    const categories = this.analyzeCategories(metrics, config)
    const criticalIssues = this.findCriticalIssues(categories)
    const recommendations = this.generateRecommendations(
      categories,
      metrics,
      config
    )
    const overallScore = this.calculateOverallScore(categories)
    const estimatedImprovement = this.estimateImprovements(recommendations)

    return {
      agentId,
      overallScore,
      categories,
      criticalIssues,
      recommendations,
      estimatedImprovement,
      generatedAt: new Date()
    }
  }

  /**
   * 分析各个类别
   */
  private analyzeCategories(
    metrics: AgentMetrics,
    config: any
  ): OptimizationCategory[] {
    return [
      this.analyzePerformance(metrics),
      this.analyzeQuality(metrics),
      this.analyzeReliability(metrics),
      this.analyzeCost(metrics),
      this.analyzePrompt(config),
      this.analyzeConfiguration(config)
    ]
  }

  /**
   * 性能分析
   */
  private analyzePerformance(
    metrics: AgentMetrics
  ): OptimizationCategory {
    const issues: OptimizationIssue[] = []

    // 响应时间分析
    const avgResponseTime =
      metrics.responseTime.reduce((a, b) => a + b, 0) /
      metrics.responseTime.length
    const p95ResponseTime = this.calculateP95(metrics.responseTime)

    if (avgResponseTime > 5000) {
      issues.push({
        id: 'slow-response',
        category: 'performance',
        severity: 'warning',
        title: '平均响应时间过长',
        description: `平均响应时间为 ${(avgResponseTime / 1000).toFixed(2)}秒，超过推荐值5秒`,
        detectedAt: new Date(),
        affectedMetrics: ['response_time', 'user_satisfaction'],
        potentialCauses: [
          '提示词过长',
          'max_tokens设置过高',
          '模型选择不当',
          '网络延迟'
        ]
      })
    }

    if (p95ResponseTime > 10000) {
      issues.push({
        id: 'p95-slow',
        category: 'performance',
        severity: 'error',
        title: 'P95响应时间超标',
        description: `95%的请求响应时间超过 ${(p95ResponseTime / 1000).toFixed(2)}秒`,
        detectedAt: new Date(),
        affectedMetrics: ['response_time'],
        potentialCauses: ['偶发性延迟', '资源竞争', '复杂查询']
      })
    }

    // 计算性能得分
    const score = this.calculatePerformanceScore(avgResponseTime, p95ResponseTime)

    return {
      name: '性能',
      score,
      issues,
      impact: issues.some(i => i.severity === 'error') ? 'high' : 'medium'
    }
  }

  /**
   * 质量分析
   */
  private analyzeQuality(metrics: AgentMetrics): OptimizationCategory {
    const issues: OptimizationIssue[] = []

    // 成功率分析
    if (metrics.successRate < 0.9) {
      issues.push({
        id: 'low-success-rate',
        category: 'quality',
        severity: metrics.successRate < 0.7 ? 'critical' : 'warning',
        title: '成功率偏低',
        description: `当前成功率 ${(metrics.successRate * 100).toFixed(1)}%，低于90%标准`,
        detectedAt: new Date(),
        affectedMetrics: ['success_rate', 'user_satisfaction'],
        potentialCauses: [
          '提示词不够明确',
          '约束条件不合理',
          '缺少必要技能',
          '模型能力不足'
        ]
      })
    }

    // 完成质量分析
    const avgQuality =
      metrics.completionQuality.reduce((a, b) => a + b, 0) /
      metrics.completionQuality.length

    if (avgQuality < 0.8) {
      issues.push({
        id: 'low-quality',
        category: 'quality',
        severity: 'warning',
        title: '输出质量待提升',
        description: `平均质量评分 ${(avgQuality * 100).toFixed(1)}/100`,
        detectedAt: new Date(),
        affectedMetrics: ['completion_quality'],
        potentialCauses: [
          '缺少示例',
          '缺少输出格式约束',
          '温度参数不当'
        ]
      })
    }

    const score = (metrics.successRate * 50 + avgQuality * 50)

    return {
      name: '质量',
      score,
      issues,
      impact: issues.some(i => i.severity === 'critical') ? 'high' : 'medium'
    }
  }

  /**
   * 可靠性分析
   */
  private analyzeReliability(
    metrics: AgentMetrics
  ): OptimizationCategory {
    const issues: OptimizationIssue[] = []

    // 错误率分析
    if (metrics.errorRate > 0.05) {
      issues.push({
        id: 'high-error-rate',
        category: 'reliability',
        severity: metrics.errorRate > 0.1 ? 'error' : 'warning',
        title: '错误率偏高',
        description: `错误率 ${(metrics.errorRate * 100).toFixed(2)}%，超过5%阈值`,
        detectedAt: new Date(),
        affectedMetrics: ['error_rate', 'reliability'],
        potentialCauses: [
          'API配置错误',
          '网络不稳定',
          '请求格式问题',
          '权限不足'
        ]
      })
    }

    // 任务完成率分析
    if (metrics.taskCompletionRate < 0.85) {
      issues.push({
        id: 'low-completion',
        category: 'reliability',
        severity: 'warning',
        title: '任务完成率待提升',
        description: `任务完成率 ${(metrics.taskCompletionRate * 100).toFixed(1)}%`,
        detectedAt: new Date(),
        affectedMetrics: ['task_completion_rate'],
        potentialCauses: ['任务超时', '资源不足', '依赖失败']
      })
    }

    const score = ((1 - metrics.errorRate) * 50 + metrics.taskCompletionRate * 50)

    return {
      name: '可靠性',
      score,
      issues,
      impact: issues.length > 0 ? 'high' : 'low'
    }
  }

  /**
   * 成本分析
   */
  private analyzeCost(metrics: AgentMetrics): OptimizationCategory {
    const issues: OptimizationIssue[] = []

    // Token使用分析
    const avgTokens =
      metrics.tokenUsage.reduce((a, b) => a + b, 0) / metrics.tokenUsage.length
    const p95Tokens = this.calculateP95(metrics.tokenUsage)

    if (avgTokens > 2000) {
      issues.push({
        id: 'high-token-usage',
        category: 'cost',
        severity: 'info',
        title: 'Token使用量较高',
        description: `平均使用 ${Math.round(avgTokens)} tokens`,
        detectedAt: new Date(),
        affectedMetrics: ['token_usage', 'cost'],
        potentialCauses: [
          '提示词冗长',
          '输出过于详细',
          'max_tokens设置过高'
        ]
      })
    }

    // 成本效益分析
    const costEfficiency = metrics.successRate / (avgTokens / 1000)
    if (costEfficiency < 0.5) {
      issues.push({
        id: 'low-cost-efficiency',
        category: 'cost',
        severity: 'warning',
        title: '成本效益待优化',
        description: '相对成功率，token消耗偏高',
        detectedAt: new Date(),
        affectedMetrics: ['cost', 'efficiency'],
        potentialCauses: ['重复提示', '无效上下文', '过度生成']
      })
    }

    const score = Math.max(0, 100 - (avgTokens / 30))

    return {
      name: '成本',
      score,
      issues,
      impact: issues.some(i => i.severity === 'warning') ? 'medium' : 'low'
    }
  }

  /**
   * Prompt分析
   */
  private analyzePrompt(config: any): OptimizationCategory {
    const issues: OptimizationIssue[] = []
    const prompt = config.systemPrompt || config.prompt || ''

    // Prompt长度检查
    if (prompt.length < 100) {
      issues.push({
        id: 'short-prompt',
        category: 'prompt',
        severity: 'warning',
        title: 'Prompt过于简短',
        description: '缺少足够的上下文和约束',
        detectedAt: new Date(),
        affectedMetrics: ['quality', 'consistency'],
        potentialCauses: ['缺少角色定义', '缺少示例', '缺少约束']
      })
    }

    if (prompt.length > 4000) {
      issues.push({
        id: 'long-prompt',
        category: 'prompt',
        severity: 'info',
        title: 'Prompt过长',
        description: '可能包含冗余信息',
        detectedAt: new Date(),
        affectedMetrics: ['cost', 'performance'],
        potentialCauses: ['重复描述', '过多示例', '冗余约束']
      })
    }

    // 结构化检查
    const hasRole = /你是|you are|role/i.test(prompt)
    const hasConstraints = /约束|限制|constraint|must|should/i.test(prompt)
    const hasExamples = /例子|示例|example|如:/i.test(prompt)

    if (!hasRole) {
      issues.push({
        id: 'missing-role',
        category: 'prompt',
        severity: 'warning',
        title: '缺少角色定义',
        description: 'Prompt中未明确定义Agent角色',
        detectedAt: new Date(),
        affectedMetrics: ['consistency', 'quality'],
        potentialCauses: ['结构不完整']
      })
    }

    if (!hasConstraints) {
      issues.push({
        id: 'missing-constraints',
        category: 'prompt',
        severity: 'info',
        title: '建议添加约束',
        description: '明确的约束可提升输出一致性',
        detectedAt: new Date(),
        affectedMetrics: ['consistency'],
        potentialCauses: ['缺少行为规范']
      })
    }

    const score =
      (hasRole ? 40 : 0) +
      (hasConstraints ? 30 : 0) +
      (hasExamples ? 30 : 0)

    return {
      name: 'Prompt质量',
      score,
      issues,
      impact: issues.some(i => i.severity === 'warning') ? 'high' : 'medium'
    }
  }

  /**
   * 配置分析
   */
  private analyzeConfiguration(config: any): OptimizationCategory {
    const issues: OptimizationIssue[] = []

    // Temperature检查
    const temperature = config.temperature || 0.7
    if (temperature > 0.9) {
      issues.push({
        id: 'high-temperature',
        category: 'configuration',
        severity: 'info',
        title: 'Temperature偏高',
        description: `当前值 ${temperature}，可能影响输出稳定性`,
        detectedAt: new Date(),
        affectedMetrics: ['consistency', 'reliability'],
        potentialCauses: ['需要更多创造性']
      })
    }

    // Max tokens检查
    const maxTokens = config.maxTokens || config.max_tokens || 1000
    if (maxTokens > 4000) {
      issues.push({
        id: 'high-max-tokens',
        category: 'configuration',
        severity: 'warning',
        title: 'max_tokens设置过高',
        description: `当前 ${maxTokens}，可能增加成本和延迟`,
        detectedAt: new Date(),
        affectedMetrics: ['cost', 'performance'],
        potentialCauses: ['预留过多', '未优化']
      })
    }

    const score =
      (temperature <= 0.9 ? 50 : 30) +
      (maxTokens <= 2000 ? 50 : 30)

    return {
      name: '参数配置',
      score,
      issues,
      impact: issues.length > 0 ? 'medium' : 'low'
    }
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(
    categories: OptimizationCategory[],
    metrics: AgentMetrics,
    config: any
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = []

    // 针对每个类别的问题生成建议
    for (const category of categories) {
      for (const issue of category.issues) {
        const rec = this.generateRecommendationForIssue(issue, metrics, config)
        if (rec) recommendations.push(rec)
      }
    }

    // 按优先级排序
    recommendations.sort((a, b) => {
      const priorityMap = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityMap[b.priority] - priorityMap[a.priority]
    })

    return recommendations
  }

  /**
   * 为特定问题生成建议
   */
  private generateRecommendationForIssue(
    issue: OptimizationIssue,
    metrics: AgentMetrics,
    config: any
  ): OptimizationRecommendation | null {
    const recMap: Record<string, OptimizationRecommendation> = {
      'slow-response': {
        id: 'optimize-response-time',
        type: 'parameter_tuning',
        priority: 'high',
        title: '优化响应时间',
        description: '通过调整参数和优化提示词来提升响应速度',
        implementation: '1. 缩短提示词长度\n2. 降低max_tokens\n3. 使用更快的模型',
        estimatedImpact: {
          performance: 40,
          quality: -5,
          cost: 20
        },
        difficulty: 'moderate',
        timeEstimate: '30分钟',
        actions: [
          {
            label: '自动优化max_tokens',
            description: '根据历史数据调整max_tokens',
            autoApply: true,
            onExecute: async () => {
              // 实现自动调整逻辑
            }
          }
        ]
      },

      'low-success-rate': {
        id: 'improve-success-rate',
        type: 'prompt_optimization',
        priority: 'critical',
        title: '提升成功率',
        description: '优化提示词结构，添加更明确的约束和示例',
        implementation: '1. 添加明确的角色定义\n2. 增加输出格式约束\n3. 提供少量示例',
        estimatedImpact: {
          performance: 10,
          quality: 50,
          cost: 0
        },
        difficulty: 'moderate',
        timeEstimate: '1小时',
        actions: [
          {
            label: '使用推荐Prompt模板',
            description: '应用经过优化的Prompt模板',
            autoApply: false,
            onExecute: async () => {
              // 应用模板逻辑
            }
          }
        ]
      },

      'high-token-usage': {
        id: 'reduce-tokens',
        type: 'parameter_tuning',
        priority: 'medium',
        title: '降低Token消耗',
        description: '优化提示词和配置以减少Token使用',
        implementation: '1. 移除冗余描述\n2. 降低max_tokens\n3. 使用更简洁的表达',
        estimatedImpact: {
          performance: 10,
          quality: 0,
          cost: 35
        },
        difficulty: 'easy',
        timeEstimate: '20分钟',
        actions: [
          {
            label: '自动精简Prompt',
            description: 'AI辅助精简提示词',
            autoApply: false,
            onExecute: async () => {
              // 精简逻辑
            }
          }
        ]
      },

      'missing-role': {
        id: 'add-role-definition',
        type: 'prompt_optimization',
        priority: 'high',
        title: '添加角色定义',
        description: '在Prompt开头明确定义Agent的角色和职责',
        implementation: '添加类似："你是一个专业的{角色}，负责{职责}..."',
        estimatedImpact: {
          performance: 0,
          quality: 30,
          cost: 5
        },
        difficulty: 'easy',
        timeEstimate: '10分钟',
        actions: [
          {
            label: '生成角色定义',
            description: 'AI自动生成角色描述',
            autoApply: true,
            onExecute: async () => {
              // 生成逻辑
            }
          }
        ]
      }
    }

    return recMap[issue.id] || null
  }

  /**
   * 计算总体得分
   */
  private calculateOverallScore(
    categories: OptimizationCategory[]
  ): number {
    const weights = {
      性能: 0.25,
      质量: 0.3,
      可靠性: 0.25,
      成本: 0.1,
      'Prompt质量': 0.05,
      参数配置: 0.05
    }

    let totalScore = 0
    for (const category of categories) {
      const weight = weights[category.name as keyof typeof weights] || 0.1
      totalScore += category.score * weight
    }

    return Math.round(totalScore)
  }

  /**
   * 估算改进效果
   */
  private estimateImprovements(
    recommendations: OptimizationRecommendation[]
  ): ImprovementEstimate {
    // 取前3个高优先级建议
    const topRecs = recommendations
      .filter(r => r.priority === 'critical' || r.priority === 'high')
      .slice(0, 3)

    const performanceGain = topRecs.reduce(
      (sum, r) => sum + r.estimatedImpact.performance,
      0
    )
    const qualityImprovement = topRecs.reduce(
      (sum, r) => sum + r.estimatedImpact.quality,
      0
    )
    const costReduction = topRecs.reduce(
      (sum, r) => sum + r.estimatedImpact.cost,
      0
    )

    const timeToApply = topRecs
      .reduce((sum, r) => {
        const time = parseInt(r.timeEstimate) || 30
        return sum + time
      }, 0)

    return {
      performanceGain: Math.round(performanceGain / topRecs.length),
      qualityImprovement: Math.round(qualityImprovement / topRecs.length),
      costReduction: Math.round(costReduction / topRecs.length),
      timeToApply: `${timeToApply}分钟`,
      confidence: 85
    }
  }

  /**
   * 查找关键问题
   */
  private findCriticalIssues(
    categories: OptimizationCategory[]
  ): OptimizationIssue[] {
    const critical: OptimizationIssue[] = []

    for (const category of categories) {
      critical.push(
        ...category.issues.filter(
          i => i.severity === 'critical' || i.severity === 'error'
        )
      )
    }

    return critical
  }

  /**
   * 计算性能得分
   */
  private calculatePerformanceScore(
    avgTime: number,
    p95Time: number
  ): number {
    // 理想: avg < 3s, p95 < 5s = 100分
    // 可接受: avg < 5s, p95 < 10s = 70分
    // 差: avg > 10s = < 50分

    let score = 100

    if (avgTime > 3000) score -= ((avgTime - 3000) / 100)
    if (p95Time > 5000) score -= ((p95Time - 5000) / 200)

    return Math.max(0, Math.min(100, score))
  }

  /**
   * 计算P95值
   */
  private calculateP95(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.floor(sorted.length * 0.95)
    return sorted[index] || sorted[sorted.length - 1]
  }
}

export const optimizationAdvisor = new OptimizationAdvisorService()
