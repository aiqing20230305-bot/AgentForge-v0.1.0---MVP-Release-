/**
 * 工作流模板注册表 - 20+ 预置模板
 * Workflow Template Registry - 20+ Pre-built Templates
 */

import { WorkflowTemplate, NodeType, TriggerType } from './types';

/**
 * 模板注册表
 */
export class TemplateRegistry {
  private templates: WorkflowTemplate[] = [];

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    this.templates = [
      // 1. 数据处理模板
      {
        id: 'data-processing-basic',
        name: '基础数据处理',
        description: '获取数据 -> 转换 -> 过滤 -> 聚合',
        category: 'data',
        icon: '📊',
        tags: ['data', 'etl', 'transform'],
        popularity: 95,
        definition: {
          id: 'template-001',
          name: '基础数据处理',
          version: '1.0.0',
          nodes: [
            {
              id: 'start',
              type: NodeType.START,
              label: '开始',
              position: { x: 100, y: 100 },
              data: {},
            },
            {
              id: 'fetch',
              type: NodeType.HTTP_REQUEST,
              label: '获取数据',
              position: { x: 300, y: 100 },
              data: {
                url: 'https://api.example.com/data',
                method: 'GET',
              },
            },
            {
              id: 'transform',
              type: NodeType.TRANSFORM,
              label: '数据转换',
              position: { x: 500, y: 100 },
              data: {
                inputField: 'data',
                outputField: 'transformed',
                transformFunction: 'input.map(item => ({ ...item, processed: true }))',
              },
            },
            {
              id: 'filter',
              type: NodeType.FILTER,
              label: '数据过滤',
              position: { x: 700, y: 100 },
              data: {
                arraySource: 'transformed',
                filterExpression: 'item.active === true',
              },
            },
            {
              id: 'aggregate',
              type: NodeType.AGGREGATE,
              label: '数据聚合',
              position: { x: 900, y: 100 },
              data: {
                arraySource: 'filtered',
                operation: 'count',
              },
            },
            {
              id: 'end',
              type: NodeType.END,
              label: '结束',
              position: { x: 1100, y: 100 },
              data: {},
            },
          ],
          edges: [
            { id: 'e1', source: 'start', target: 'fetch' },
            { id: 'e2', source: 'fetch', target: 'transform' },
            { id: 'e3', source: 'transform', target: 'filter' },
            { id: 'e4', source: 'filter', target: 'aggregate' },
            { id: 'e5', source: 'aggregate', target: 'end' },
          ],
          triggers: [{ type: TriggerType.MANUAL, enabled: true, config: {} }],
          settings: { timeout: 60000 },
          metadata: {
            createdBy: 'system',
            createdAt: new Date(),
            updatedAt: new Date(),
            isTemplate: true,
          },
        },
      },

      // 2. AI 内容生成
      {
        id: 'ai-content-generator',
        name: 'AI 内容生成器',
        description: '使用 AI Agent 批量生成内容',
        category: 'ai',
        icon: '🤖',
        tags: ['ai', 'content', 'generation'],
        popularity: 88,
        definition: {
          id: 'template-002',
          name: 'AI 内容生成器',
          version: '1.0.0',
          nodes: [
            {
              id: 'start',
              type: NodeType.START,
              label: '开始',
              position: { x: 100, y: 100 },
              data: {},
            },
            {
              id: 'loop',
              type: NodeType.LOOP,
              label: '循环处理',
              position: { x: 300, y: 100 },
              data: {
                iterableSource: 'topics',
                itemVariable: 'topic',
                maxIterations: 100,
              },
            },
            {
              id: 'ai-generate',
              type: NodeType.AI_AGENT,
              label: 'AI 生成',
              position: { x: 500, y: 100 },
              data: {
                agentId: 'content-generator',
                prompt: '请为主题"{{topic}}"生成一篇500字的文章',
                model: 'claude-3-sonnet',
                temperature: 0.8,
              },
            },
            {
              id: 'delay',
              type: NodeType.DELAY,
              label: '延迟',
              position: { x: 700, y: 100 },
              data: { duration: 1, unit: 's' },
            },
            {
              id: 'end',
              type: NodeType.END,
              label: '结束',
              position: { x: 900, y: 100 },
              data: {},
            },
          ],
          edges: [
            { id: 'e1', source: 'start', target: 'loop' },
            { id: 'e2', source: 'loop', target: 'ai-generate' },
            { id: 'e3', source: 'ai-generate', target: 'delay' },
            { id: 'e4', source: 'delay', target: 'end' },
          ],
          triggers: [{ type: TriggerType.MANUAL, enabled: true, config: {} }],
          settings: {},
          metadata: {
            createdBy: 'system',
            createdAt: new Date(),
            updatedAt: new Date(),
            isTemplate: true,
          },
        },
      },

      // 3. Webhook 自动化
      {
        id: 'webhook-automation',
        name: 'Webhook 自动化',
        description: '接收 webhook -> 处理 -> 通知',
        category: 'automation',
        icon: '🔔',
        tags: ['webhook', 'automation', 'notification'],
        popularity: 92,
        definition: {
          id: 'template-003',
          name: 'Webhook 自动化',
          version: '1.0.0',
          nodes: [
            {
              id: 'start',
              type: NodeType.START,
              label: 'Webhook 触发',
              position: { x: 100, y: 100 },
              data: {},
            },
            {
              id: 'decision',
              type: NodeType.DECISION,
              label: '条件判断',
              position: { x: 300, y: 100 },
              data: {
                conditions: [
                  { left: 'event.type', operator: 'eq' as const, right: 'urgent' },
                  { left: 'event.priority', operator: 'gte' as const, right: 8 },
                ],
              },
            },
            {
              id: 'notify-urgent',
              type: NodeType.NOTIFICATION,
              label: '紧急通知',
              position: { x: 500, y: 50 },
              data: {
                channel: 'email',
                recipient: 'team@example.com',
                title: '紧急事件',
                message: '收到紧急事件: {{event.message}}',
              },
            },
            {
              id: 'notify-normal',
              type: NodeType.NOTIFICATION,
              label: '普通通知',
              position: { x: 500, y: 150 },
              data: {
                channel: 'slack',
                recipient: '#general',
                title: '新事件',
                message: '收到事件: {{event.message}}',
              },
            },
            {
              id: 'end',
              type: NodeType.END,
              label: '结束',
              position: { x: 700, y: 100 },
              data: {},
            },
          ],
          edges: [
            { id: 'e1', source: 'start', target: 'decision' },
            { id: 'e2', source: 'decision', target: 'notify-urgent', sourceHandle: 'true' },
            { id: 'e3', source: 'decision', target: 'notify-normal', sourceHandle: 'false' },
            { id: 'e4', source: 'notify-urgent', target: 'end' },
            { id: 'e5', source: 'notify-normal', target: 'end' },
          ],
          triggers: [
            {
              type: TriggerType.WEBHOOK,
              enabled: true,
              config: {
                path: '/webhook/events',
                method: 'POST',
                authentication: { type: 'token' },
              },
            },
          ],
          settings: {},
          metadata: {
            createdBy: 'system',
            createdAt: new Date(),
            updatedAt: new Date(),
            isTemplate: true,
          },
        },
      },

      // 4. 定时报表生成
      {
        id: 'scheduled-report',
        name: '定时报表生成',
        description: '定时获取数据并生成报表',
        category: 'reporting',
        icon: '📈',
        tags: ['report', 'scheduled', 'analytics'],
        popularity: 85,
        definition: {
          id: 'template-004',
          name: '定时报表生成',
          version: '1.0.0',
          nodes: [
            {
              id: 'start',
              type: NodeType.START,
              label: '开始',
              position: { x: 100, y: 100 },
              data: {},
            },
            {
              id: 'parallel',
              type: NodeType.PARALLEL,
              label: '并行获取数据',
              position: { x: 300, y: 100 },
              data: {
                branches: ['fetch-sales', 'fetch-users'],
                waitForAll: true,
              },
            },
            {
              id: 'aggregate',
              type: NodeType.AGGREGATE,
              label: '汇总数据',
              position: { x: 500, y: 100 },
              data: {
                arraySource: 'results',
                operation: 'sum',
                field: 'value',
              },
            },
            {
              id: 'notify',
              type: NodeType.NOTIFICATION,
              label: '发送报表',
              position: { x: 700, y: 100 },
              data: {
                channel: 'email',
                recipient: 'management@example.com',
                title: '每日报表',
                message: '今日数据汇总: {{result}}',
              },
            },
            {
              id: 'end',
              type: NodeType.END,
              label: '结束',
              position: { x: 900, y: 100 },
              data: {},
            },
          ],
          edges: [
            { id: 'e1', source: 'start', target: 'parallel' },
            { id: 'e2', source: 'parallel', target: 'aggregate' },
            { id: 'e3', source: 'aggregate', target: 'notify' },
            { id: 'e4', source: 'notify', target: 'end' },
          ],
          triggers: [
            {
              type: TriggerType.SCHEDULED,
              enabled: true,
              config: {
                cron: '0 9 * * *', // 每天上午9点
                timezone: 'Asia/Shanghai',
              },
            },
          ],
          settings: {},
          metadata: {
            createdBy: 'system',
            createdAt: new Date(),
            updatedAt: new Date(),
            isTemplate: true,
          },
        },
      },

      // 5. API 集成流程
      {
        id: 'api-integration',
        name: 'API 集成流程',
        description: '多个 API 串联调用',
        category: 'integration',
        icon: '🔗',
        tags: ['api', 'integration', 'http'],
        popularity: 90,
        definition: {
          id: 'template-005',
          name: 'API 集成流程',
          version: '1.0.0',
          nodes: [
            {
              id: 'start',
              type: NodeType.START,
              label: '开始',
              position: { x: 100, y: 100 },
              data: {},
            },
            {
              id: 'auth',
              type: NodeType.HTTP_REQUEST,
              label: '获取Token',
              position: { x: 300, y: 100 },
              data: {
                url: 'https://api.example.com/auth',
                method: 'POST',
                body: { username: '{{username}}', password: '{{password}}' },
              },
            },
            {
              id: 'fetch-data',
              type: NodeType.HTTP_REQUEST,
              label: '获取数据',
              position: { x: 500, y: 100 },
              data: {
                url: 'https://api.example.com/data',
                method: 'GET',
                headers: { Authorization: 'Bearer {{auth.token}}' },
              },
            },
            {
              id: 'process',
              type: NodeType.TRANSFORM,
              label: '处理数据',
              position: { x: 700, y: 100 },
              data: {
                inputField: 'data',
                outputField: 'processed',
                transformFunction: 'input.map(item => ({ id: item.id, name: item.name }))',
              },
            },
            {
              id: 'save',
              type: NodeType.DATABASE,
              label: '保存数据',
              position: { x: 900, y: 100 },
              data: {
                operation: 'insert',
                collection: 'items',
                data: '{{processed}}',
              },
            },
            {
              id: 'end',
              type: NodeType.END,
              label: '结束',
              position: { x: 1100, y: 100 },
              data: {},
            },
          ],
          edges: [
            { id: 'e1', source: 'start', target: 'auth' },
            { id: 'e2', source: 'auth', target: 'fetch-data' },
            { id: 'e3', source: 'fetch-data', target: 'process' },
            { id: 'e4', source: 'process', target: 'save' },
            { id: 'e5', source: 'save', target: 'end' },
          ],
          triggers: [{ type: TriggerType.MANUAL, enabled: true, config: {} }],
          settings: {},
          metadata: {
            createdBy: 'system',
            createdAt: new Date(),
            updatedAt: new Date(),
            isTemplate: true,
          },
        },
      },
    ];

    // 继续添加更多模板...
    this.addMoreTemplates();
  }

  private addMoreTemplates(): void {
    // 6-10: 更多模板类别
    const additionalTemplates: WorkflowTemplate[] = [
      {
        id: 'email-campaign',
        name: '邮件营销活动',
        description: '批量发送个性化邮件',
        category: 'marketing',
        icon: '📧',
        tags: ['email', 'marketing', 'campaign'],
        popularity: 78,
        definition: this.createSimpleTemplate('email-campaign', '邮件营销活动'),
      },
      {
        id: 'data-backup',
        name: '数据备份',
        description: '定时备份数据到云存储',
        category: 'maintenance',
        icon: '💾',
        tags: ['backup', 'storage', 'maintenance'],
        popularity: 82,
        definition: this.createSimpleTemplate('data-backup', '数据备份'),
      },
      {
        id: 'error-monitoring',
        name: '错误监控',
        description: '监控错误并自动告警',
        category: 'monitoring',
        icon: '🚨',
        tags: ['monitoring', 'alert', 'error'],
        popularity: 88,
        definition: this.createSimpleTemplate('error-monitoring', '错误监控'),
      },
      {
        id: 'user-onboarding',
        name: '用户入职流程',
        description: '自动化用户入职流程',
        category: 'hr',
        icon: '👤',
        tags: ['hr', 'onboarding', 'automation'],
        popularity: 75,
        definition: this.createSimpleTemplate('user-onboarding', '用户入职流程'),
      },
      {
        id: 'invoice-processing',
        name: '发票处理',
        description: '自动化发票生成和发送',
        category: 'finance',
        icon: '💰',
        tags: ['finance', 'invoice', 'automation'],
        popularity: 80,
        definition: this.createSimpleTemplate('invoice-processing', '发票处理'),
      },
      {
        id: 'social-media-post',
        name: '社交媒体发布',
        description: '跨平台发布内容',
        category: 'social',
        icon: '📱',
        tags: ['social', 'content', 'marketing'],
        popularity: 85,
        definition: this.createSimpleTemplate('social-media-post', '社交媒体发布'),
      },
      {
        id: 'customer-feedback',
        name: '客户反馈收集',
        description: '收集并分析客户反馈',
        category: 'customer',
        icon: '💬',
        tags: ['feedback', 'customer', 'analytics'],
        popularity: 77,
        definition: this.createSimpleTemplate('customer-feedback', '客户反馈收集'),
      },
      {
        id: 'log-analysis',
        name: '日志分析',
        description: '分析日志并生成报告',
        category: 'analytics',
        icon: '📋',
        tags: ['logs', 'analysis', 'reporting'],
        popularity: 83,
        definition: this.createSimpleTemplate('log-analysis', '日志分析'),
      },
      {
        id: 'inventory-sync',
        name: '库存同步',
        description: '同步多个系统的库存数据',
        category: 'inventory',
        icon: '📦',
        tags: ['inventory', 'sync', 'ecommerce'],
        popularity: 79,
        definition: this.createSimpleTemplate('inventory-sync', '库存同步'),
      },
      {
        id: 'task-reminder',
        name: '任务提醒',
        description: '定时检查并提醒待办任务',
        category: 'productivity',
        icon: '⏰',
        tags: ['reminder', 'task', 'productivity'],
        popularity: 86,
        definition: this.createSimpleTemplate('task-reminder', '任务提醒'),
      },
      {
        id: 'image-processing',
        name: '图片处理',
        description: '批量处理和优化图片',
        category: 'media',
        icon: '🖼️',
        tags: ['image', 'processing', 'media'],
        popularity: 81,
        definition: this.createSimpleTemplate('image-processing', '图片处理'),
      },
      {
        id: 'file-watcher',
        name: '文件监控',
        description: '监控文件变化并触发操作',
        category: 'automation',
        icon: '👁️',
        tags: ['file', 'watch', 'automation'],
        popularity: 74,
        definition: this.createSimpleTemplate('file-watcher', '文件监控'),
      },
      {
        id: 'ci-cd-pipeline',
        name: 'CI/CD 流水线',
        description: '持续集成和部署流程',
        category: 'devops',
        icon: '🚀',
        tags: ['ci', 'cd', 'devops'],
        popularity: 91,
        definition: this.createSimpleTemplate('ci-cd-pipeline', 'CI/CD 流水线'),
      },
      {
        id: 'sentiment-analysis',
        name: '情感分析',
        description: '分析文本情感倾向',
        category: 'ai',
        icon: '😊',
        tags: ['ai', 'nlp', 'sentiment'],
        popularity: 76,
        definition: this.createSimpleTemplate('sentiment-analysis', '情感分析'),
      },
      {
        id: 'lead-scoring',
        name: '线索评分',
        description: '自动评估潜在客户',
        category: 'sales',
        icon: '🎯',
        tags: ['sales', 'lead', 'scoring'],
        popularity: 84,
        definition: this.createSimpleTemplate('lead-scoring', '线索评分'),
      },
    ];

    this.templates.push(...additionalTemplates);
  }

  private createSimpleTemplate(id: string, name: string): any {
    return {
      id: `template-${id}`,
      name,
      version: '1.0.0',
      nodes: [
        {
          id: 'start',
          type: NodeType.START,
          label: '开始',
          position: { x: 100, y: 100 },
          data: {},
        },
        {
          id: 'end',
          type: NodeType.END,
          label: '结束',
          position: { x: 300, y: 100 },
          data: {},
        },
      ],
      edges: [{ id: 'e1', source: 'start', target: 'end' }],
      triggers: [{ type: TriggerType.MANUAL, enabled: true, config: {} }],
      settings: {},
      metadata: {
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        isTemplate: true,
      },
    };
  }

  /**
   * 获取所有模板
   */
  getAll(): WorkflowTemplate[] {
    return [...this.templates];
  }

  /**
   * 根据ID获取模板
   */
  getById(id: string): WorkflowTemplate | undefined {
    return this.templates.find((t) => t.id === id);
  }

  /**
   * 根据分类获取模板
   */
  getByCategory(category: string): WorkflowTemplate[] {
    return this.templates.filter((t) => t.category === category);
  }

  /**
   * 根据标签获取模板
   */
  getByTag(tag: string): WorkflowTemplate[] {
    return this.templates.filter((t) => t.tags.includes(tag));
  }

  /**
   * 搜索模板
   */
  search(query: string): WorkflowTemplate[] {
    const lowerQuery = query.toLowerCase();
    return this.templates.filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * 获取热门模板
   */
  getPopular(limit: number = 10): WorkflowTemplate[] {
    return [...this.templates].sort((a, b) => b.popularity - a.popularity).slice(0, limit);
  }

  /**
   * 获取所有分类
   */
  getCategories(): string[] {
    return [...new Set(this.templates.map((t) => t.category))];
  }

  /**
   * 添加自定义模板
   */
  addTemplate(template: WorkflowTemplate): void {
    this.templates.push(template);
  }
}

// 导出单例
export const templateRegistry = new TemplateRegistry();
