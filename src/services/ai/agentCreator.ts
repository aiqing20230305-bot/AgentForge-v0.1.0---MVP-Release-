/**
 * AI Agent Creator Service
 * 对话式AI创建Agent - 理解自然语言需求，智能生成Agent配置
 */

export interface AgentCreationContext {
  conversation: ConversationMessage[]
  extractedInfo: ExtractedAgentInfo
  suggestions: CreationSuggestion[]
  completeness: number // 0-100
}

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  intent?: string
  entities?: Record<string, any>
}

export interface ExtractedAgentInfo {
  name?: string
  role?: string
  skills?: string[]
  personality?: string[]
  constraints?: string[]
  goals?: string[]
  tools?: string[]
  context?: string
  expertise?: string[]
  communicationStyle?: string
}

export interface CreationSuggestion {
  field: keyof ExtractedAgentInfo
  value: any
  confidence: number
  reason: string
}

export interface AgentTemplate {
  id: string
  name: string
  description: string
  category: string
  config: ExtractedAgentInfo
  usageCount: number
  rating: number
}

class AgentCreatorService {
  private templates: AgentTemplate[] = [
    {
      id: 'code-reviewer',
      name: '代码审查专家',
      description: '专注于代码质量审查、最佳实践建议',
      category: 'development',
      config: {
        role: 'Senior Code Reviewer',
        skills: ['静态分析', '设计模式识别', '性能优化', '安全审计'],
        personality: ['严谨', '专业', '建设性'],
        constraints: ['必须提供具体改进建议', '遵循SOLID原则', '考虑可维护性'],
        tools: ['ESLint', 'SonarQube', 'CodeClimate'],
        expertise: ['TypeScript', 'React', 'Node.js', '架构设计']
      },
      usageCount: 1250,
      rating: 4.8
    },
    {
      id: 'product-analyst',
      name: '产品分析师',
      description: '需求分析、用户研究、产品策略',
      category: 'product',
      config: {
        role: 'Product Analyst',
        skills: ['用户研究', '数据分析', '竞品分析', 'A/B测试'],
        personality: ['数据驱动', '同理心', '战略思维'],
        constraints: ['必须提供数据支撑', '考虑商业价值', '关注用户体验'],
        tools: ['Google Analytics', 'Mixpanel', 'Figma'],
        expertise: ['用户体验', '数据可视化', '产品策略', '市场分析']
      },
      usageCount: 980,
      rating: 4.6
    },
    {
      id: 'tech-writer',
      name: '技术文档专家',
      description: '撰写清晰、专业的技术文档和教程',
      category: 'documentation',
      config: {
        role: 'Technical Writer',
        skills: ['技术写作', 'API文档', '教程设计', 'Markdown'],
        personality: ['清晰', '耐心', '细致'],
        constraints: ['使用简洁语言', '提供实例代码', '确保准确性'],
        tools: ['Markdown', 'Swagger', 'GitBook'],
        expertise: ['文档架构', '技术传播', 'API设计', '教学方法']
      },
      usageCount: 750,
      rating: 4.7
    },
    {
      id: 'devops-engineer',
      name: 'DevOps工程师',
      description: 'CI/CD、容器化、云服务配置',
      category: 'devops',
      config: {
        role: 'DevOps Engineer',
        skills: ['容器编排', 'CI/CD', '监控告警', '自动化部署'],
        personality: ['效率优先', '可靠性', '问题解决'],
        constraints: ['确保高可用', '优化成本', '安全第一'],
        tools: ['Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
        expertise: ['云架构', '容器化', '自动化', '监控系统']
      },
      usageCount: 1100,
      rating: 4.9
    },
    {
      id: 'ui-designer',
      name: 'UI设计师',
      description: '界面设计、交互设计、视觉优化',
      category: 'design',
      config: {
        role: 'UI/UX Designer',
        skills: ['界面设计', '交互设计', '视觉系统', '原型制作'],
        personality: ['创意', '用户中心', '美学敏感'],
        constraints: ['遵循设计规范', '考虑可访问性', '保持一致性'],
        tools: ['Figma', 'Sketch', 'Adobe XD'],
        expertise: ['设计系统', '交互原型', '视觉设计', '用户测试']
      },
      usageCount: 890,
      rating: 4.7
    }
  ]

  /**
   * 开始对话式创建流程
   */
  startConversation(): AgentCreationContext {
    return {
      conversation: [
        {
          id: '1',
          role: 'assistant',
          content: '你好！我是AI助手，帮你创建理想的Agent。\n\n请描述你想要的Agent，比如：\n- "我需要一个代码审查助手"\n- "帮我做产品分析"\n- "写技术文档的专家"\n\n或者告诉我你的具体需求！',
          timestamp: new Date()
        }
      ],
      extractedInfo: {},
      suggestions: [],
      completeness: 0
    }
  }

  /**
   * 处理用户输入，更新上下文
   */
  async processUserInput(
    context: AgentCreationContext,
    userInput: string
  ): Promise<AgentCreationContext> {
    // 添加用户消息
    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userInput,
      timestamp: new Date()
    }

    // 分析用户意图和实体
    const { intent, entities } = this.analyzeInput(userInput)
    userMessage.intent = intent
    userMessage.entities = entities

    // 更新提取的信息
    const updatedInfo = this.updateExtractedInfo(
      context.extractedInfo,
      entities
    )

    // 生成建议
    const suggestions = this.generateSuggestions(updatedInfo, userInput)

    // 生成AI响应
    const assistantMessage = this.generateResponse(
      intent,
      updatedInfo,
      suggestions
    )

    // 计算完成度
    const completeness = this.calculateCompleteness(updatedInfo)

    return {
      conversation: [
        ...context.conversation,
        userMessage,
        assistantMessage
      ],
      extractedInfo: updatedInfo,
      suggestions,
      completeness
    }
  }

  /**
   * 分析用户输入，提取意图和实体
   */
  private analyzeInput(input: string): {
    intent: string
    entities: Record<string, any>
  } {
    const lowercaseInput = input.toLowerCase()
    const entities: Record<string, any> = {}

    // 意图识别
    let intent = 'provide_info'
    if (
      lowercaseInput.includes('需要') ||
      lowercaseInput.includes('想要') ||
      lowercaseInput.includes('帮我')
    ) {
      intent = 'describe_need'
    } else if (
      lowercaseInput.includes('确认') ||
      lowercaseInput.includes('好的') ||
      lowercaseInput.includes('可以')
    ) {
      intent = 'confirm'
    } else if (
      lowercaseInput.includes('修改') ||
      lowercaseInput.includes('改成') ||
      lowercaseInput.includes('换成')
    ) {
      intent = 'modify'
    }

    // 实体提取
    // 角色提取
    const rolePatterns = [
      { pattern: /(代码审查|code review)/i, value: 'Code Reviewer' },
      { pattern: /(产品分析|product)/i, value: 'Product Analyst' },
      { pattern: /(技术文档|documentation)/i, value: 'Technical Writer' },
      { pattern: /(devops|运维)/i, value: 'DevOps Engineer' },
      { pattern: /(设计师|designer)/i, value: 'Designer' },
      { pattern: /(测试|test|qa)/i, value: 'QA Engineer' },
      { pattern: /(数据分析|data)/i, value: 'Data Analyst' }
    ]

    for (const { pattern, value } of rolePatterns) {
      if (pattern.test(input)) {
        entities.role = value
        break
      }
    }

    // 技能提取
    const skillKeywords = [
      'TypeScript',
      'React',
      'Node.js',
      'Python',
      'Docker',
      'Kubernetes',
      'AWS',
      '数据分析',
      '机器学习',
      'UI设计',
      '产品设计',
      'API开发',
      '性能优化',
      '安全审计'
    ]

    const extractedSkills = skillKeywords.filter(skill =>
      input.toLowerCase().includes(skill.toLowerCase())
    )
    if (extractedSkills.length > 0) {
      entities.skills = extractedSkills
    }

    // 名称提取
    const nameMatch = input.match(/叫["""]?([^"""\s，。]+)["""]?/)
    if (nameMatch) {
      entities.name = nameMatch[1]
    }

    // 个性特征提取
    const personalityKeywords = [
      '严谨',
      '友好',
      '专业',
      '创意',
      '高效',
      '耐心',
      '幽默',
      '同理心'
    ]
    const extractedPersonality = personalityKeywords.filter(trait =>
      input.includes(trait)
    )
    if (extractedPersonality.length > 0) {
      entities.personality = extractedPersonality
    }

    return { intent, entities }
  }

  /**
   * 更新提取的信息
   */
  private updateExtractedInfo(
    current: ExtractedAgentInfo,
    entities: Record<string, any>
  ): ExtractedAgentInfo {
    const updated = { ...current }

    if (entities.name) updated.name = entities.name
    if (entities.role) updated.role = entities.role

    if (entities.skills) {
      updated.skills = [...(updated.skills || []), ...entities.skills]
    }

    if (entities.personality) {
      updated.personality = [
        ...(updated.personality || []),
        ...entities.personality
      ]
    }

    if (entities.constraints) {
      updated.constraints = [
        ...(updated.constraints || []),
        ...entities.constraints
      ]
    }

    return updated
  }

  /**
   * 生成建议
   */
  private generateSuggestions(
    info: ExtractedAgentInfo,
    userInput: string
  ): CreationSuggestion[] {
    const suggestions: CreationSuggestion[] = []

    // 基于角色推荐相关技能
    if (info.role && !info.skills) {
      const template = this.findTemplateByRole(info.role)
      if (template) {
        suggestions.push({
          field: 'skills',
          value: template.config.skills,
          confidence: 85,
          reason: `基于"${info.role}"角色的常见技能要求`
        })
      }
    }

    // 基于技能推荐个性
    if (info.skills && !info.personality) {
      const recommendedPersonality =
        this.recommendPersonalityBySkills(info.skills)
      if (recommendedPersonality.length > 0) {
        suggestions.push({
          field: 'personality',
          value: recommendedPersonality,
          confidence: 75,
          reason: '基于技能类型推荐的性格特征'
        })
      }
    }

    // 如果没有名称，生成建议
    if (!info.name && info.role) {
      suggestions.push({
        field: 'name',
        value: this.generateAgentName(info.role),
        confidence: 70,
        reason: '基于角色自动生成的名称'
      })
    }

    return suggestions
  }

  /**
   * 生成AI响应
   */
  private generateResponse(
    intent: string,
    info: ExtractedAgentInfo,
    suggestions: CreationSuggestion[]
  ): ConversationMessage {
    let content = ''

    const completeness = this.calculateCompleteness(info)

    if (intent === 'describe_need' || intent === 'provide_info') {
      // 确认理解的信息
      const understood: string[] = []
      if (info.role) understood.push(`角色：${info.role}`)
      if (info.name) understood.push(`名称：${info.name}`)
      if (info.skills)
        understood.push(`技能：${info.skills.slice(0, 3).join('、')}`)

      if (understood.length > 0) {
        content += '好的，我理解了：\n' + understood.join('\n') + '\n\n'
      }

      // 提供建议
      if (suggestions.length > 0) {
        content += '我为你推荐以下配置：\n'
        suggestions.slice(0, 2).forEach((s, i) => {
          content += `${i + 1}. ${s.reason}：${Array.isArray(s.value) ? s.value.join('、') : s.value}\n`
        })
        content += '\n'
      }

      // 询问下一步
      if (completeness < 60) {
        content += '还有一些信息可以帮助我优化Agent：\n'
        if (!info.personality)
          content += '- 你希望Agent的性格特征是什么？（严谨/友好/专业等）\n'
        if (!info.constraints)
          content += '- 有什么特殊的约束或要求吗？\n'
        if (!info.context)
          content += '- Agent将在什么场景下使用？\n'
      } else if (completeness < 90) {
        content += '\n信息已经很充分了！我可以为你创建这个Agent。'
        content +=
          '\n\n你还可以补充：\n- 使用场景\n- 特殊约束\n- 工具偏好'
        content += '\n\n或者直接说"确认创建"！'
      } else {
        content +=
          '\n完美！所有信息都已就绪。\n\n回复"确认创建"开始构建你的Agent！'
      }
    } else if (intent === 'confirm') {
      content = '太好了！正在为你创建Agent...\n\n'
      content += this.generateAgentSummary(info)
    }

    return {
      id: `msg-${Date.now()}-assistant`,
      role: 'assistant',
      content: content.trim(),
      timestamp: new Date()
    }
  }

  /**
   * 计算完成度
   */
  private calculateCompleteness(info: ExtractedAgentInfo): number {
    const weights = {
      role: 25,
      name: 10,
      skills: 20,
      personality: 15,
      constraints: 10,
      tools: 10,
      context: 10
    }

    let score = 0
    if (info.role) score += weights.role
    if (info.name) score += weights.name
    if (info.skills && info.skills.length > 0) score += weights.skills
    if (info.personality && info.personality.length > 0)
      score += weights.personality
    if (info.constraints && info.constraints.length > 0)
      score += weights.constraints
    if (info.tools && info.tools.length > 0) score += weights.tools
    if (info.context) score += weights.context

    return Math.min(100, score)
  }

  /**
   * 查找模板
   */
  private findTemplateByRole(role: string): AgentTemplate | undefined {
    return this.templates.find(t =>
      t.config.role?.toLowerCase().includes(role.toLowerCase())
    )
  }

  /**
   * 基于技能推荐个性
   */
  private recommendPersonalityBySkills(skills: string[]): string[] {
    const skillLower = skills.map(s => s.toLowerCase())

    if (
      skillLower.some(s =>
        ['代码', 'code', '审查', 'review'].some(k => s.includes(k))
      )
    ) {
      return ['严谨', '专业', '建设性']
    }

    if (
      skillLower.some(s =>
        ['产品', 'product', '分析', 'analysis'].some(k => s.includes(k))
      )
    ) {
      return ['数据驱动', '同理心', '战略思维']
    }

    if (
      skillLower.some(s =>
        ['设计', 'design', 'ui', 'ux'].some(k => s.includes(k))
      )
    ) {
      return ['创意', '用户中心', '美学敏感']
    }

    return ['专业', '高效', '友好']
  }

  /**
   * 生成Agent名称
   */
  private generateAgentName(role: string): string {
    const prefixes = ['智能', 'AI', '专业', '高级']
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    return `${prefix}${role}`
  }

  /**
   * 生成Agent摘要
   */
  private generateAgentSummary(info: ExtractedAgentInfo): string {
    let summary = '📋 Agent配置摘要\n\n'
    if (info.name) summary += `名称：${info.name}\n`
    if (info.role) summary += `角色：${info.role}\n`
    if (info.skills)
      summary += `技能：${info.skills.join('、')}\n`
    if (info.personality)
      summary += `个性：${info.personality.join('、')}\n`
    if (info.tools) summary += `工具：${info.tools.join('、')}\n`

    return summary
  }

  /**
   * 获取推荐模板
   */
  getTemplates(): AgentTemplate[] {
    return this.templates.sort((a, b) => {
      // 按使用次数和评分排序
      return b.usageCount * b.rating - a.usageCount * a.rating
    })
  }

  /**
   * 应用模板
   */
  applyTemplate(templateId: string): ExtractedAgentInfo {
    const template = this.templates.find(t => t.id === templateId)
    if (!template) {
      throw new Error('Template not found')
    }

    // 增加使用次数
    template.usageCount++

    return { ...template.config }
  }

  /**
   * 生成最终Agent配置
   */
  generateAgentConfig(info: ExtractedAgentInfo): any {
    return {
      name: info.name || '未命名Agent',
      role: info.role || 'General Assistant',
      systemPrompt: this.generateSystemPrompt(info),
      config: {
        temperature: 0.7,
        maxTokens: 2000,
        topP: 0.9
      },
      metadata: {
        skills: info.skills || [],
        personality: info.personality || [],
        constraints: info.constraints || [],
        tools: info.tools || [],
        expertise: info.expertise || [],
        createdBy: 'ai-assistant',
        createdAt: new Date().toISOString()
      }
    }
  }

  /**
   * 生成系统提示词
   */
  private generateSystemPrompt(info: ExtractedAgentInfo): string {
    let prompt = `你是一个${info.role || 'AI助手'}`

    if (info.name) {
      prompt += `，名字是${info.name}`
    }

    prompt += '。\n\n'

    if (info.skills && info.skills.length > 0) {
      prompt += `核心技能：\n${info.skills.map(s => `- ${s}`).join('\n')}\n\n`
    }

    if (info.personality && info.personality.length > 0) {
      prompt += `性格特征：${info.personality.join('、')}\n\n`
    }

    if (info.constraints && info.constraints.length > 0) {
      prompt += `工作约束：\n${info.constraints.map(c => `- ${c}`).join('\n')}\n\n`
    }

    if (info.goals && info.goals.length > 0) {
      prompt += `主要目标：\n${info.goals.map(g => `- ${g}`).join('\n')}\n\n`
    }

    if (info.context) {
      prompt += `工作场景：${info.context}\n\n`
    }

    prompt += '请始终保持专业、准确、有帮助的态度完成任务。'

    return prompt
  }
}

export const agentCreator = new AgentCreatorService()
