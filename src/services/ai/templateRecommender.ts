/**
 * Template Recommender Service
 * 智能模板推荐系统 - 基于用户行为和需求推荐最佳模板
 */

import type { AgentTemplate } from './agentCreator'

export interface RecommendationContext {
  userProfile: UserProfile
  currentProject?: ProjectContext
  recentActivity: ActivityLog[]
  preferences: UserPreferences
}

export interface UserProfile {
  userId: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  primaryRole: string[]
  industries: string[]
  favoriteTemplates: string[]
  usageHistory: TemplateUsage[]
}

export interface ProjectContext {
  projectType: string
  techStack: string[]
  teamSize: number
  phase: 'planning' | 'development' | 'testing' | 'deployment' | 'maintenance'
}

export interface ActivityLog {
  timestamp: Date
  action: 'view' | 'apply' | 'modify' | 'delete'
  templateId: string
  success: boolean
  duration?: number
}

export interface UserPreferences {
  communicationStyle: 'formal' | 'casual' | 'technical'
  responseSpeed: 'fast' | 'balanced' | 'thorough'
  verbosity: 'concise' | 'moderate' | 'detailed'
  themes: string[]
}

export interface TemplateUsage {
  templateId: string
  count: number
  lastUsed: Date
  successRate: number
  averageRating: number
}

export interface TemplateRecommendation {
  template: AgentTemplate
  score: number // 0-100
  reasons: RecommendationReason[]
  matchPercentage: number
  popularityIndex: number
  similarUsers: number
}

export interface RecommendationReason {
  type:
    | 'usage_pattern'
    | 'skill_match'
    | 'project_fit'
    | 'trending'
    | 'community'
    | 'success_rate'
  description: string
  weight: number
}

class TemplateRecommenderService {
  private templates: AgentTemplate[] = []
  private userProfiles: Map<string, UserProfile> = new Map()
  private globalStats: Map<string, TemplateStats> = new Map()

  /**
   * 初始化推荐器
   */
  init(templates: AgentTemplate[]) {
    this.templates = templates
    this.updateGlobalStats()
  }

  /**
   * 获取个性化推荐
   */
  getRecommendations(
    context: RecommendationContext,
    limit: number = 5
  ): TemplateRecommendation[] {
    const recommendations: TemplateRecommendation[] = []

    for (const template of this.templates) {
      const score = this.calculateRecommendationScore(template, context)
      const reasons = this.generateReasons(template, context)
      const matchPercentage = this.calculateMatchPercentage(template, context)
      const popularityIndex = this.calculatePopularityIndex(template)
      const similarUsers = this.findSimilarUsers(template, context.userProfile)

      recommendations.push({
        template,
        score,
        reasons,
        matchPercentage,
        popularityIndex,
        similarUsers
      })
    }

    // 按评分排序
    recommendations.sort((a, b) => b.score - a.score)

    return recommendations.slice(0, limit)
  }

  /**
   * 计算推荐评分
   */
  private calculateRecommendationScore(
    template: AgentTemplate,
    context: RecommendationContext
  ): number {
    let score = 0

    // 1. 使用历史匹配 (30%)
    const usageScore = this.getUsageScore(template, context.userProfile)
    score += usageScore * 0.3

    // 2. 技能匹配度 (25%)
    const skillScore = this.getSkillMatchScore(
      template,
      context.userProfile.primaryRole
    )
    score += skillScore * 0.25

    // 3. 项目适配度 (20%)
    if (context.currentProject) {
      const projectScore = this.getProjectFitScore(
        template,
        context.currentProject
      )
      score += projectScore * 0.2
    } else {
      score += 50 * 0.2 // 默认中等分数
    }

    // 4. 社区热度 (15%)
    const communityScore = this.getCommunityScore(template)
    score += communityScore * 0.15

    // 5. 成功率 (10%)
    const successScore = this.getSuccessScore(template, context.userProfile)
    score += successScore * 0.1

    return Math.min(100, Math.max(0, score))
  }

  /**
   * 使用历史评分
   */
  private getUsageScore(
    template: AgentTemplate,
    profile: UserProfile
  ): number {
    // 检查用户是否使用过此模板
    const usage = profile.usageHistory.find(
      u => u.templateId === template.id
    )

    if (!usage) return 50 // 未使用过，默认50分

    // 基于使用次数和成功率计算
    const frequencyScore = Math.min(100, usage.count * 10)
    const successScore = usage.successRate

    // 最近使用加成
    const daysSinceLastUse =
      (Date.now() - usage.lastUsed.getTime()) / (1000 * 60 * 60 * 24)
    const recencyBonus = daysSinceLastUse < 7 ? 20 : daysSinceLastUse < 30 ? 10 : 0

    return (frequencyScore + successScore) / 2 + recencyBonus
  }

  /**
   * 技能匹配评分
   */
  private getSkillMatchScore(
    template: AgentTemplate,
    userRoles: string[]
  ): number {
    if (!template.config.role) return 50

    // 完全匹配
    if (
      userRoles.some(role =>
        template.config.role?.toLowerCase().includes(role.toLowerCase())
      )
    ) {
      return 100
    }

    // 技能关键词匹配
    const templateSkills = template.config.skills || []
    const matchCount = userRoles.filter(role =>
      templateSkills.some(skill =>
        skill.toLowerCase().includes(role.toLowerCase())
      )
    ).length

    return Math.min(100, (matchCount / Math.max(1, userRoles.length)) * 100)
  }

  /**
   * 项目适配度评分
   */
  private getProjectFitScore(
    template: AgentTemplate,
    project: ProjectContext
  ): number {
    let score = 50 // 基础分

    // 项目阶段匹配
    const phaseRoleMap: Record<string, string[]> = {
      planning: ['Product', 'Analyst', 'Architect'],
      development: ['Developer', 'Engineer', 'Reviewer'],
      testing: ['QA', 'Test', 'Quality'],
      deployment: ['DevOps', 'Engineer', 'SRE'],
      maintenance: ['Support', 'Engineer', 'Monitor']
    }

    const expectedRoles = phaseRoleMap[project.phase] || []
    if (
      expectedRoles.some(role =>
        template.config.role?.toLowerCase().includes(role.toLowerCase())
      )
    ) {
      score += 30
    }

    // 技术栈匹配
    const templateSkills = (template.config.skills || []).map(s =>
      s.toLowerCase()
    )
    const matchingStack = project.techStack.filter(tech =>
      templateSkills.some(skill => skill.includes(tech.toLowerCase()))
    )

    score += (matchingStack.length / project.techStack.length) * 20

    return Math.min(100, score)
  }

  /**
   * 社区热度评分
   */
  private getCommunityScore(template: AgentTemplate): number {
    // 基于使用次数和评分
    const usageWeight = 0.6
    const ratingWeight = 0.4

    // 归一化使用次数 (假设10000为最高)
    const normalizedUsage = Math.min(100, (template.usageCount / 10000) * 100)

    // 评分转为百分比
    const normalizedRating = (template.rating / 5) * 100

    return normalizedUsage * usageWeight + normalizedRating * ratingWeight
  }

  /**
   * 成功率评分
   */
  private getSuccessScore(
    template: AgentTemplate,
    profile: UserProfile
  ): number {
    const usage = profile.usageHistory.find(
      u => u.templateId === template.id
    )

    if (!usage) {
      // 没有个人使用记录，使用全局成功率
      const globalStats = this.globalStats.get(template.id)
      return globalStats?.successRate || 75 // 默认75分
    }

    return usage.successRate
  }

  /**
   * 生成推荐理由
   */
  private generateReasons(
    template: AgentTemplate,
    context: RecommendationContext
  ): RecommendationReason[] {
    const reasons: RecommendationReason[] = []

    // 使用模式理由
    const usage = context.userProfile.usageHistory.find(
      u => u.templateId === template.id
    )
    if (usage && usage.count > 5) {
      reasons.push({
        type: 'usage_pattern',
        description: `你已成功使用此模板 ${usage.count} 次`,
        weight: 0.3
      })
    }

    // 技能匹配理由
    const matchingSkills = context.userProfile.primaryRole.filter(role =>
      template.config.role?.toLowerCase().includes(role.toLowerCase())
    )
    if (matchingSkills.length > 0) {
      reasons.push({
        type: 'skill_match',
        description: `与你的技能"${matchingSkills[0]}"高度匹配`,
        weight: 0.25
      })
    }

    // 项目适配理由
    if (context.currentProject) {
      const phaseMatch = this.isPhaseMatch(
        template,
        context.currentProject.phase
      )
      if (phaseMatch) {
        reasons.push({
          type: 'project_fit',
          description: `适合当前项目的${context.currentProject.phase}阶段`,
          weight: 0.2
        })
      }
    }

    // 热门推荐
    if (template.usageCount > 1000) {
      reasons.push({
        type: 'trending',
        description: `社区热门，已被使用 ${template.usageCount} 次`,
        weight: 0.15
      })
    }

    // 高评分推荐
    if (template.rating >= 4.5) {
      reasons.push({
        type: 'success_rate',
        description: `用户评分 ${template.rating}/5.0，品质优秀`,
        weight: 0.1
      })
    }

    return reasons
  }

  /**
   * 计算匹配百分比
   */
  private calculateMatchPercentage(
    template: AgentTemplate,
    context: RecommendationContext
  ): number {
    const factors = []

    // 角色匹配
    if (
      context.userProfile.primaryRole.some(role =>
        template.config.role?.toLowerCase().includes(role.toLowerCase())
      )
    ) {
      factors.push(100)
    } else {
      factors.push(50)
    }

    // 技能匹配
    const userSkills = context.userProfile.primaryRole
    const templateSkills = template.config.skills || []
    const matchingSkills = userSkills.filter(skill =>
      templateSkills.some(ts =>
        ts.toLowerCase().includes(skill.toLowerCase())
      )
    )
    factors.push((matchingSkills.length / userSkills.length) * 100)

    // 使用历史
    const hasUsed = context.userProfile.usageHistory.some(
      u => u.templateId === template.id
    )
    factors.push(hasUsed ? 100 : 50)

    // 平均值
    return Math.round(
      factors.reduce((sum, f) => sum + f, 0) / factors.length
    )
  }

  /**
   * 计算热度指数
   */
  private calculatePopularityIndex(template: AgentTemplate): number {
    // 综合使用次数和评分
    const usageIndex = Math.min(100, (template.usageCount / 1000) * 50)
    const ratingIndex = (template.rating / 5) * 50

    return Math.round(usageIndex + ratingIndex)
  }

  /**
   * 查找相似用户数量
   */
  private findSimilarUsers(
    template: AgentTemplate,
    profile: UserProfile
  ): number {
    // 简化实现：基于模板使用次数估算
    // 实际应该查询数据库中相似用户
    return Math.round(template.usageCount * 0.1)
  }

  /**
   * 判断项目阶段匹配
   */
  private isPhaseMatch(
    template: AgentTemplate,
    phase: string
  ): boolean {
    const phaseKeywords: Record<string, string[]> = {
      planning: ['plan', 'product', 'analyst', 'strategy'],
      development: ['code', 'develop', 'engineer', 'program'],
      testing: ['test', 'qa', 'quality', 'review'],
      deployment: ['devops', 'deploy', 'sre', 'infra'],
      maintenance: ['support', 'maintain', 'monitor', 'ops']
    }

    const keywords = phaseKeywords[phase] || []
    const role = template.config.role?.toLowerCase() || ''

    return keywords.some(keyword => role.includes(keyword))
  }

  /**
   * 更新全局统计
   */
  private updateGlobalStats() {
    for (const template of this.templates) {
      this.globalStats.set(template.id, {
        totalUsage: template.usageCount,
        averageRating: template.rating,
        successRate: 80, // 默认80%成功率
        trendScore: this.calculateTrendScore(template)
      })
    }
  }

  /**
   * 计算趋势分数
   */
  private calculateTrendScore(template: AgentTemplate): number {
    // 简化实现：基于使用量和评分
    const usageScore = Math.min(100, (template.usageCount / 1000) * 50)
    const ratingScore = (template.rating / 5) * 50

    return usageScore + ratingScore
  }

  /**
   * 记录模板使用
   */
  recordUsage(
    userId: string,
    templateId: string,
    success: boolean,
    rating?: number
  ) {
    const profile = this.userProfiles.get(userId)
    if (!profile) return

    const existingUsage = profile.usageHistory.find(
      u => u.templateId === templateId
    )

    if (existingUsage) {
      existingUsage.count++
      existingUsage.lastUsed = new Date()
      existingUsage.successRate =
        (existingUsage.successRate * (existingUsage.count - 1) +
          (success ? 100 : 0)) /
        existingUsage.count

      if (rating) {
        existingUsage.averageRating =
          (existingUsage.averageRating * (existingUsage.count - 1) + rating) /
          existingUsage.count
      }
    } else {
      profile.usageHistory.push({
        templateId,
        count: 1,
        lastUsed: new Date(),
        successRate: success ? 100 : 0,
        averageRating: rating || 0
      })
    }

    // 更新全局统计
    const template = this.templates.find(t => t.id === templateId)
    if (template) {
      template.usageCount++
    }
  }

  /**
   * 获取趋势模板
   */
  getTrendingTemplates(limit: number = 10): AgentTemplate[] {
    return [...this.templates]
      .sort((a, b) => {
        const scoreA = a.usageCount * a.rating
        const scoreB = b.usageCount * b.rating
        return scoreB - scoreA
      })
      .slice(0, limit)
  }

  /**
   * 按分类获取模板
   */
  getTemplatesByCategory(category: string): AgentTemplate[] {
    return this.templates.filter(t => t.category === category)
  }

  /**
   * 搜索模板
   */
  searchTemplates(query: string): AgentTemplate[] {
    const lowerQuery = query.toLowerCase()

    return this.templates.filter(
      t =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.config.role?.toLowerCase().includes(lowerQuery) ||
        t.config.skills?.some(s => s.toLowerCase().includes(lowerQuery))
    )
  }
}

interface TemplateStats {
  totalUsage: number
  averageRating: number
  successRate: number
  trendScore: number
}

export const templateRecommender = new TemplateRecommenderService()
