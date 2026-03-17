/**
 * Prompt Optimizer Service
 * Prompt自动优化器 - 分析和优化Agent的系统提示词
 */

export interface PromptAnalysis {
  originalPrompt: string
  score: number // 0-100
  issues: PromptIssue[]
  suggestions: PromptSuggestion[]
  optimizedVersions: OptimizedPrompt[]
  metrics: PromptMetrics
}

export interface PromptIssue {
  id: string
  type: 'structure' | 'clarity' | 'completeness' | 'efficiency' | 'specificity'
  severity: 'low' | 'medium' | 'high'
  title: string
  description: string
  location?: { start: number; end: number }
  impact: string[]
}

export interface PromptSuggestion {
  id: string
  title: string
  description: string
  before: string
  after: string
  rationale: string
  estimatedImpact: {
    clarity: number
    consistency: number
    performance: number
  }
}

export interface OptimizedPrompt {
  version: string
  prompt: string
  changes: string[]
  improvementScore: number
  focusAreas: string[]
}

export interface PromptMetrics {
  length: number
  tokenCount: number
  complexity: number
  clarity: number
  specificity: number
  completeness: number
}

interface PromptSection {
  type: 'role' | 'context' | 'skills' | 'constraints' | 'examples' | 'output_format'
  content: string
  present: boolean
  quality: number
}

class PromptOptimizerService {
  private readonly IDEAL_LENGTH = { min: 200, max: 2000 }
  private readonly IDEAL_TOKEN_COUNT = { min: 50, max: 500 }

  /**
   * 分析Prompt质量
   */
  async analyzePrompt(prompt: string): Promise<PromptAnalysis> {
    const sections = this.identifySections(prompt)
    const issues = this.findIssues(prompt, sections)
    const suggestions = this.generateSuggestions(prompt, sections, issues)
    const optimizedVersions = this.generateOptimizedVersions(prompt, suggestions)
    const metrics = this.calculateMetrics(prompt, sections)
    const score = this.calculateOverallScore(metrics, issues)

    return {
      originalPrompt: prompt,
      score,
      issues,
      suggestions,
      optimizedVersions,
      metrics
    }
  }

  /**
   * 识别Prompt结构
   */
  private identifySections(prompt: string): PromptSection[] {
    const sections: PromptSection[] = []

    // 角色定义
    const roleMatch = /你是|you are|i am|role:|角色：/i.test(prompt)
    sections.push({
      type: 'role',
      content: this.extractRoleSection(prompt),
      present: roleMatch,
      quality: roleMatch ? this.assessRoleQuality(prompt) : 0
    })

    // 上下文
    const contextMatch = /背景|context|场景|scenario/i.test(prompt)
    sections.push({
      type: 'context',
      content: this.extractContextSection(prompt),
      present: contextMatch,
      quality: contextMatch ? 60 : 0
    })

    // 技能/能力
    const skillsMatch = /技能|skills|能力|capabilities|擅长/i.test(prompt)
    sections.push({
      type: 'skills',
      content: this.extractSkillsSection(prompt),
      present: skillsMatch,
      quality: skillsMatch ? 70 : 0
    })

    // 约束/规则
    const constraintsMatch = /约束|constraints|规则|rules|必须|must|should/i.test(prompt)
    sections.push({
      type: 'constraints',
      content: this.extractConstraintsSection(prompt),
      present: constraintsMatch,
      quality: constraintsMatch ? 75 : 0
    })

    // 示例
    const examplesMatch = /例子|example|示例|如：|e\.g\./i.test(prompt)
    sections.push({
      type: 'examples',
      content: '',
      present: examplesMatch,
      quality: examplesMatch ? 80 : 0
    })

    // 输出格式
    const formatMatch = /格式|format|输出|output|返回/i.test(prompt)
    sections.push({
      type: 'output_format',
      content: '',
      present: formatMatch,
      quality: formatMatch ? 70 : 0
    })

    return sections
  }

  /**
   * 发现问题
   */
  private findIssues(prompt: string, sections: PromptSection[]): PromptIssue[] {
    const issues: PromptIssue[] = []

    // 长度问题
    if (prompt.length < this.IDEAL_LENGTH.min) {
      issues.push({
        id: 'too-short',
        type: 'completeness',
        severity: 'high',
        title: 'Prompt过于简短',
        description: `当前长度${prompt.length}字符，建议至少${this.IDEAL_LENGTH.min}字符`,
        impact: ['可能缺少关键信息', '输出一致性差', '难以控制行为']
      })
    } else if (prompt.length > this.IDEAL_LENGTH.max) {
      issues.push({
        id: 'too-long',
        type: 'efficiency',
        severity: 'medium',
        title: 'Prompt过长',
        description: `当前长度${prompt.length}字符，建议不超过${this.IDEAL_LENGTH.max}字符`,
        impact: ['增加成本', '影响响应速度', '可能包含冗余']
      })
    }

    // 结构完整性
    const roleSection = sections.find(s => s.type === 'role')
    if (!roleSection?.present) {
      issues.push({
        id: 'missing-role',
        type: 'structure',
        severity: 'high',
        title: '缺少角色定义',
        description: 'Prompt应该明确定义AI的角色和身份',
        impact: ['行为不一致', '缺乏专业性', '输出质量下降']
      })
    }

    const constraintsSection = sections.find(s => s.type === 'constraints')
    if (!constraintsSection?.present) {
      issues.push({
        id: 'missing-constraints',
        type: 'completeness',
        severity: 'medium',
        title: '缺少约束条件',
        description: '建议添加明确的行为规范和输出约束',
        impact: ['输出可能偏离预期', '缺少质量保障']
      })
    }

    const examplesSection = sections.find(s => s.type === 'examples')
    if (!examplesSection?.present && prompt.length < 500) {
      issues.push({
        id: 'no-examples',
        type: 'clarity',
        severity: 'low',
        title: '缺少示例',
        description: '添加示例可以提高AI理解和输出质量',
        impact: ['理解可能有偏差', '输出格式不确定']
      })
    }

    // 模糊表述
    const vagueTerms = ['可能', '也许', '尽量', 'maybe', 'try to', 'if possible']
    for (const term of vagueTerms) {
      if (prompt.toLowerCase().includes(term)) {
        issues.push({
          id: `vague-${term}`,
          type: 'specificity',
          severity: 'medium',
          title: '包含模糊表述',
          description: `发现模糊词汇"${term}"，建议使用更明确的指令`,
          impact: ['指令不明确', '行为不可控']
        })
        break // 只报告一次
      }
    }

    // 冗余检查
    const sentences = prompt.split(/[。！？.!?]/)
    const duplicates = this.findDuplicateSentences(sentences)
    if (duplicates.length > 0) {
      issues.push({
        id: 'redundant-content',
        type: 'efficiency',
        severity: 'low',
        title: '包含重复内容',
        description: `发现${duplicates.length}处重复或相似表述`,
        impact: ['浪费tokens', '增加成本']
      })
    }

    return issues
  }

  /**
   * 生成优化建议
   */
  private generateSuggestions(
    prompt: string,
    sections: PromptSection[],
    issues: PromptIssue[]
  ): PromptSuggestion[] {
    const suggestions: PromptSuggestion[] = []

    // 基于问题生成建议
    for (const issue of issues) {
      if (issue.id === 'missing-role') {
        suggestions.push({
          id: 'add-role',
          title: '添加角色定义',
          description: '在开头明确定义AI的角色',
          before: prompt.substring(0, 50) + '...',
          after:
            '你是一个专业的[角色名称]，专注于[核心职责]。你的主要任务是...\n\n' +
            prompt.substring(0, 50) +
            '...',
          rationale: '明确的角色定义可以提升输出的一致性和专业性',
          estimatedImpact: {
            clarity: 30,
            consistency: 40,
            performance: 5
          }
        })
      }

      if (issue.id === 'missing-constraints') {
        suggestions.push({
          id: 'add-constraints',
          title: '添加约束条件',
          description: '明确输出的限制和要求',
          before: prompt,
          after:
            prompt +
            '\n\n约束条件：\n- 必须使用简洁清晰的语言\n- 回答长度控制在[X]字以内\n- 保持客观中立的态度',
          rationale: '约束条件可以确保输出质量和格式的一致性',
          estimatedImpact: {
            clarity: 25,
            consistency: 35,
            performance: 0
          }
        })
      }

      if (issue.type === 'specificity') {
        suggestions.push({
          id: 'improve-specificity',
          title: '提高指令明确性',
          description: '将模糊表述改为具体指令',
          before: issue.description,
          after: '必须[具体动作]，确保[具体结果]',
          rationale: '明确的指令可以减少歧义，提高执行准确性',
          estimatedImpact: {
            clarity: 35,
            consistency: 30,
            performance: 10
          }
        })
      }
    }

    // 添加一般性优化建议
    if (!sections.find(s => s.type === 'output_format' && s.present)) {
      suggestions.push({
        id: 'add-output-format',
        title: '指定输出格式',
        description: '明确期望的输出结构',
        before: prompt,
        after:
          prompt +
          '\n\n输出格式：\n```\n[具体的输出结构示例]\n```',
        rationale: '明确的输出格式可以提高结果的可用性',
        estimatedImpact: {
          clarity: 20,
          consistency: 40,
          performance: 0
        }
      })
    }

    return suggestions
  }

  /**
   * 生成优化版本
   */
  private generateOptimizedVersions(
    originalPrompt: string,
    suggestions: PromptSuggestion[]
  ): OptimizedPrompt[] {
    const versions: OptimizedPrompt[] = []

    // 版本1: 轻度优化 - 只修复关键问题
    const lightChanges = suggestions
      .filter(s => s.estimatedImpact.consistency > 30)
      .slice(0, 2)

    if (lightChanges.length > 0) {
      versions.push({
        version: '轻度优化',
        prompt: this.applyChanges(originalPrompt, lightChanges),
        changes: lightChanges.map(c => c.title),
        improvementScore: 15,
        focusAreas: ['一致性', '明确性']
      })
    }

    // 版本2: 标准优化 - 平衡所有方面
    const standardChanges = suggestions.slice(0, 4)
    if (standardChanges.length > 0) {
      versions.push({
        version: '标准优化',
        prompt: this.applyChanges(originalPrompt, standardChanges),
        changes: standardChanges.map(c => c.title),
        improvementScore: 30,
        focusAreas: ['结构', '清晰度', '完整性']
      })
    }

    // 版本3: 深度优化 - 全面重构
    versions.push({
      version: '深度优化',
      prompt: this.reconstructPrompt(originalPrompt, suggestions),
      changes: ['完整重构Prompt结构', '优化表述', '添加示例', '明确约束'],
      improvementScore: 50,
      focusAreas: ['所有维度']
    })

    return versions
  }

  /**
   * 应用修改
   */
  private applyChanges(
    prompt: string,
    changes: PromptSuggestion[]
  ): string {
    let result = prompt

    for (const change of changes) {
      if (change.id === 'add-role') {
        result =
          '你是一个专业的AI助手，具有以下特点：\n\n' + result
      } else if (change.id === 'add-constraints') {
        result +=
          '\n\n约束条件：\n- 保持专业和准确\n- 使用清晰简洁的语言\n- 提供具体可行的建议'
      } else if (change.id === 'add-output-format') {
        result += '\n\n请按照以下格式输出：\n[具体格式说明]'
      }
    }

    return result
  }

  /**
   * 重构Prompt
   */
  private reconstructPrompt(
    original: string,
    suggestions: PromptSuggestion[]
  ): string {
    // 提取核心信息
    const role = this.extractRoleSection(original) || '专业AI助手'
    const skills = this.extractSkillsSection(original)
    const constraints = this.extractConstraintsSection(original)

    // 重构为结构化格式
    let reconstructed = `# 角色定义\n你是一个${role}。\n\n`

    if (skills) {
      reconstructed += `# 核心能力\n${skills}\n\n`
    }

    reconstructed += `# 工作原则\n- 保持专业和准确性\n- 使用清晰易懂的语言\n- 提供具体可执行的建议\n\n`

    if (constraints) {
      reconstructed += `# 约束条件\n${constraints}\n\n`
    }

    reconstructed += `# 输出要求\n- 结构清晰，层次分明\n- 关键信息突出\n- 适当使用示例说明`

    return reconstructed
  }

  /**
   * 计算指标
   */
  private calculateMetrics(
    prompt: string,
    sections: PromptSection[]
  ): PromptMetrics {
    return {
      length: prompt.length,
      tokenCount: this.estimateTokens(prompt),
      complexity: this.calculateComplexity(prompt),
      clarity: this.assessClarity(prompt),
      specificity: this.assessSpecificity(prompt),
      completeness: this.assessCompleteness(sections)
    }
  }

  /**
   * 计算总分
   */
  private calculateOverallScore(
    metrics: PromptMetrics,
    issues: PromptIssue[]
  ): number {
    let score = 100

    // 根据指标调整
    score -= Math.abs(metrics.length - 1000) / 20
    score -= Math.abs(metrics.tokenCount - 250) / 10

    // 根据问题严重性扣分
    for (const issue of issues) {
      if (issue.severity === 'high') score -= 15
      else if (issue.severity === 'medium') score -= 10
      else score -= 5
    }

    // 加上正面指标
    score += metrics.clarity * 0.2
    score += metrics.specificity * 0.15
    score += metrics.completeness * 0.15

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  // === 辅助方法 ===

  private extractRoleSection(prompt: string): string {
    const match = prompt.match(/你是[^。！？.!?]+/i)
    return match ? match[0] : ''
  }

  private extractContextSection(prompt: string): string {
    const match = prompt.match(/背景[：:][^。！？.!?]+/i)
    return match ? match[0] : ''
  }

  private extractSkillsSection(prompt: string): string {
    const match = prompt.match(/技能|能力[：:][^。！？.!?]+/i)
    return match ? match[0] : ''
  }

  private extractConstraintsSection(prompt: string): string {
    const match = prompt.match(/约束|规则[：:][^。！？.!?]+/i)
    return match ? match[0] : ''
  }

  private assessRoleQuality(prompt: string): number {
    let quality = 50
    if (/专业|professional/i.test(prompt)) quality += 15
    if (/擅长|expert/i.test(prompt)) quality += 15
    if (/职责|responsibility/i.test(prompt)) quality += 20
    return Math.min(100, quality)
  }

  private estimateTokens(text: string): number {
    // 简化估算: 中文≈1字符1token, 英文≈4字符1token
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
    const otherChars = text.length - chineseChars
    return chineseChars + Math.ceil(otherChars / 4)
  }

  private calculateComplexity(prompt: string): number {
    const sentences = prompt.split(/[。！？.!?]/).length
    const avgWordsPerSentence = prompt.length / sentences
    return Math.min(100, avgWordsPerSentence)
  }

  private assessClarity(prompt: string): number {
    let score = 70
    // 有结构性标记
    if (/^#+\s|\n[-*]\s/m.test(prompt)) score += 15
    // 有编号列表
    if (/\d+\.\s/m.test(prompt)) score += 10
    // 避免模糊词汇
    if (!/可能|也许|尽量/i.test(prompt)) score += 5
    return Math.min(100, score)
  }

  private assessSpecificity(prompt: string): number {
    let score = 60
    if (/具体|明确|precise|specific/i.test(prompt)) score += 20
    if (/必须|must|should/i.test(prompt)) score += 15
    if (/\d+/i.test(prompt)) score += 5 // 包含数字
    return Math.min(100, score)
  }

  private assessCompleteness(sections: PromptSection[]): number {
    const presentCount = sections.filter(s => s.present).length
    const totalCount = sections.length
    return (presentCount / totalCount) * 100
  }

  private findDuplicateSentences(sentences: string[]): string[] {
    const seen = new Set<string>()
    const duplicates: string[] = []

    for (const sentence of sentences) {
      const normalized = sentence.trim().toLowerCase()
      if (normalized.length > 10) {
        if (seen.has(normalized)) {
          duplicates.push(sentence)
        }
        seen.add(normalized)
      }
    }

    return duplicates
  }
}

export const promptOptimizer = new PromptOptimizerService()
