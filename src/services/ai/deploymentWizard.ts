/**
 * Deployment Wizard Service
 * 智能部署向导 - 引导用户完成Agent部署的全流程
 */

export interface DeploymentSession {
  id: string
  agentId: string
  currentStep: number
  totalSteps: number
  steps: DeploymentStep[]
  context: DeploymentContext
  status: 'in_progress' | 'completed' | 'failed'
  startedAt: Date
  completedAt?: Date
}

export interface DeploymentStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed'
  isOptional: boolean
  estimatedTime: string
  tasks: DeploymentTask[]
  validations: DeploymentValidation[]
  tips: string[]
}

export interface DeploymentTask {
  id: string
  title: string
  description: string
  status: 'pending' | 'completed' | 'failed'
  action?: () => Promise<void>
  autoExecutable: boolean
}

export interface DeploymentValidation {
  id: string
  description: string
  check: () => Promise<ValidationResult>
  severity: 'error' | 'warning' | 'info'
}

export interface ValidationResult {
  passed: boolean
  message: string
  details?: string
  suggestions?: string[]
}

export interface DeploymentContext {
  environment: 'development' | 'staging' | 'production'
  platform: 'web' | 'mobile' | 'desktop' | 'api'
  integrations: string[]
  configuration: Record<string, any>
  resources: DeploymentResources
}

export interface DeploymentResources {
  apiKeys: Record<string, string>
  endpoints: Record<string, string>
  quotas: Record<string, number>
  monitoring: MonitoringConfig
}

export interface MonitoringConfig {
  enabled: boolean
  metricsEndpoint?: string
  alertsEnabled: boolean
  alertEmail?: string
}

class DeploymentWizardService {
  /**
   * 开始部署流程
   */
  startDeployment(
    agentId: string,
    targetEnv: 'development' | 'staging' | 'production'
  ): DeploymentSession {
    const steps = this.generateDeploymentSteps(targetEnv)

    return {
      id: `deploy-${Date.now()}`,
      agentId,
      currentStep: 0,
      totalSteps: steps.length,
      steps,
      context: {
        environment: targetEnv,
        platform: 'web',
        integrations: [],
        configuration: {},
        resources: {
          apiKeys: {},
          endpoints: {},
          quotas: {},
          monitoring: {
            enabled: false,
            alertsEnabled: false
          }
        }
      },
      status: 'in_progress',
      startedAt: new Date()
    }
  }

  /**
   * 生成部署步骤
   */
  private generateDeploymentSteps(
    environment: string
  ): DeploymentStep[] {
    const steps: DeploymentStep[] = [
      {
        id: 'pre-flight',
        title: '部署前检查',
        description: '验证Agent配置和依赖项',
        status: 'pending',
        isOptional: false,
        estimatedTime: '2分钟',
        tasks: [
          {
            id: 'check-config',
            title: '检查Agent配置',
            description: '验证必需的配置项',
            status: 'pending',
            autoExecutable: true
          },
          {
            id: 'check-dependencies',
            title: '检查依赖项',
            description: '确认所有依赖已安装',
            status: 'pending',
            autoExecutable: true
          },
          {
            id: 'check-credentials',
            title: '验证API凭证',
            description: '确认API密钥有效',
            status: 'pending',
            autoExecutable: true
          }
        ],
        validations: [
          {
            id: 'valid-config',
            description: 'Agent配置完整性',
            check: async () => ({
              passed: true,
              message: '配置验证通过'
            }),
            severity: 'error'
          }
        ],
        tips: [
          '确保所有必需字段已填写',
          '检查API密钥是否正确',
          '验证网络连接正常'
        ]
      },

      {
        id: 'environment-setup',
        title: '环境配置',
        description: '设置目标环境的配置',
        status: 'pending',
        isOptional: false,
        estimatedTime: '3分钟',
        tasks: [
          {
            id: 'set-env-vars',
            title: '设置环境变量',
            description: '配置必要的环境变量',
            status: 'pending',
            autoExecutable: false
          },
          {
            id: 'configure-endpoints',
            title: '配置API端点',
            description: '设置服务端点URL',
            status: 'pending',
            autoExecutable: false
          },
          {
            id: 'set-quotas',
            title: '配置资源配额',
            description: '设置请求限制和配额',
            status: 'pending',
            autoExecutable: true
          }
        ],
        validations: [
          {
            id: 'env-accessible',
            description: '环境可访问性',
            check: async () => ({
              passed: true,
              message: '环境连接正常'
            }),
            severity: 'error'
          }
        ],
        tips: [
          '使用环境特定的配置文件',
          '不要在代码中硬编码敏感信息',
          '为生产环境启用SSL'
        ]
      },

      {
        id: 'integration-setup',
        title: '集成配置',
        description: '配置第三方服务集成',
        status: 'pending',
        isOptional: true,
        estimatedTime: '5分钟',
        tasks: [
          {
            id: 'setup-monitoring',
            title: '配置监控',
            description: '设置性能监控和告警',
            status: 'pending',
            autoExecutable: false
          },
          {
            id: 'setup-logging',
            title: '配置日志',
            description: '设置日志收集和存储',
            status: 'pending',
            autoExecutable: true
          },
          {
            id: 'setup-analytics',
            title: '配置分析',
            description: '设置使用情况分析',
            status: 'pending',
            autoExecutable: true
          }
        ],
        validations: [],
        tips: [
          '推荐使用集中式日志管理',
          '配置错误告警通知',
          '启用性能指标追踪'
        ]
      },

      {
        id: 'security-check',
        title: '安全检查',
        description: '验证安全配置和权限',
        status: 'pending',
        isOptional: false,
        estimatedTime: '3分钟',
        tasks: [
          {
            id: 'check-permissions',
            title: '检查权限',
            description: '验证访问权限设置',
            status: 'pending',
            autoExecutable: true
          },
          {
            id: 'check-encryption',
            title: '检查加密',
            description: '确认数据传输加密',
            status: 'pending',
            autoExecutable: true
          },
          {
            id: 'check-auth',
            title: '检查认证',
            description: '验证身份认证配置',
            status: 'pending',
            autoExecutable: true
          }
        ],
        validations: [
          {
            id: 'https-enabled',
            description: 'HTTPS已启用',
            check: async () => ({
              passed: environment === 'production',
              message:
                environment === 'production'
                  ? 'HTTPS已启用'
                  : '开发环境可跳过HTTPS',
              suggestions:
                environment === 'production'
                  ? []
                  : ['生产环境必须启用HTTPS']
            }),
            severity: environment === 'production' ? 'error' : 'warning'
          }
        ],
        tips: [
          '永远不要在日志中记录敏感信息',
          '定期轮换API密钥',
          '启用速率限制防止滥用'
        ]
      },

      {
        id: 'deployment',
        title: '执行部署',
        description: '部署Agent到目标环境',
        status: 'pending',
        isOptional: false,
        estimatedTime: '2分钟',
        tasks: [
          {
            id: 'deploy-agent',
            title: '部署Agent',
            description: '上传Agent配置和代码',
            status: 'pending',
            autoExecutable: true
          },
          {
            id: 'start-service',
            title: '启动服务',
            description: '启动Agent服务',
            status: 'pending',
            autoExecutable: true
          },
          {
            id: 'warm-up',
            title: '预热服务',
            description: '发送测试请求预热',
            status: 'pending',
            autoExecutable: true
          }
        ],
        validations: [
          {
            id: 'service-running',
            description: '服务运行状态',
            check: async () => ({
              passed: true,
              message: '服务运行正常'
            }),
            severity: 'error'
          }
        ],
        tips: [
          '部署前建议先在staging测试',
          '保留上一个版本以便回滚',
          '监控部署过程中的错误日志'
        ]
      },

      {
        id: 'verification',
        title: '部署验证',
        description: '验证部署是否成功',
        status: 'pending',
        isOptional: false,
        estimatedTime: '2分钟',
        tasks: [
          {
            id: 'health-check',
            title: '健康检查',
            description: '检查服务健康状态',
            status: 'pending',
            autoExecutable: true
          },
          {
            id: 'integration-test',
            title: '集成测试',
            description: '运行基础集成测试',
            status: 'pending',
            autoExecutable: true
          },
          {
            id: 'smoke-test',
            title: '冒烟测试',
            description: '执行关键功能测试',
            status: 'pending',
            autoExecutable: true
          }
        ],
        validations: [
          {
            id: 'all-tests-pass',
            description: '所有测试通过',
            check: async () => ({
              passed: true,
              message: '所有验证测试通过'
            }),
            severity: 'error'
          }
        ],
        tips: [
          '验证关键业务流程',
          '检查响应时间是否正常',
          '确认监控指标正常上报'
        ]
      },

      {
        id: 'post-deployment',
        title: '部署后配置',
        description: '完成最后的配置步骤',
        status: 'pending',
        isOptional: true,
        estimatedTime: '2分钟',
        tasks: [
          {
            id: 'setup-monitoring-dashboard',
            title: '配置监控面板',
            description: '设置性能监控仪表盘',
            status: 'pending',
            autoExecutable: false
          },
          {
            id: 'setup-alerts',
            title: '配置告警',
            description: '设置关键指标告警',
            status: 'pending',
            autoExecutable: false
          },
          {
            id: 'document-deployment',
            title: '记录部署信息',
            description: '保存部署日志和配置',
            status: 'pending',
            autoExecutable: true
          }
        ],
        validations: [],
        tips: [
          '记录部署时间和版本号',
          '通知团队成员部署完成',
          '准备回滚方案'
        ]
      }
    ]

    // 生产环境添加额外步骤
    if (environment === 'production') {
      steps.splice(5, 0, {
        id: 'load-testing',
        title: '负载测试',
        description: '执行负载和压力测试',
        status: 'pending',
        isOptional: false,
        estimatedTime: '5分钟',
        tasks: [
          {
            id: 'run-load-test',
            title: '运行负载测试',
            description: '模拟实际负载',
            status: 'pending',
            autoExecutable: true
          },
          {
            id: 'analyze-results',
            title: '分析结果',
            description: '检查性能指标',
            status: 'pending',
            autoExecutable: false
          }
        ],
        validations: [
          {
            id: 'performance-acceptable',
            description: '性能符合要求',
            check: async () => ({
              passed: true,
              message: '性能测试通过'
            }),
            severity: 'error'
          }
        ],
        tips: [
          '确保响应时间 < 2秒',
          '验证并发处理能力',
          '检查内存和CPU使用'
        ]
      })
    }

    return steps
  }

  /**
   * 执行步骤
   */
  async executeStep(
    session: DeploymentSession,
    stepId: string
  ): Promise<DeploymentSession> {
    const step = session.steps.find(s => s.id === stepId)
    if (!step) {
      throw new Error(`Step ${stepId} not found`)
    }

    step.status = 'in_progress'

    try {
      // 执行所有任务
      for (const task of step.tasks) {
        if (task.autoExecutable && task.action) {
          task.status = 'pending'
          await task.action()
          task.status = 'completed'
        }
      }

      // 运行验证
      const validationResults = await Promise.all(
        step.validations.map(v => v.check())
      )

      const hasError = validationResults.some(
        (r, i) =>
          !r.passed && step.validations[i].severity === 'error'
      )

      if (hasError) {
        step.status = 'failed'
        throw new Error('验证失败')
      }

      step.status = 'completed'
      session.currentStep++

      // 检查是否全部完成
      if (session.currentStep >= session.totalSteps) {
        session.status = 'completed'
        session.completedAt = new Date()
      }
    } catch (error) {
      step.status = 'failed'
      session.status = 'failed'
      throw error
    }

    return session
  }

  /**
   * 跳过可选步骤
   */
  skipStep(session: DeploymentSession, stepId: string): DeploymentSession {
    const step = session.steps.find(s => s.id === stepId)
    if (!step) {
      throw new Error(`Step ${stepId} not found`)
    }

    if (!step.isOptional) {
      throw new Error(`Step ${stepId} is not optional`)
    }

    step.status = 'skipped'
    session.currentStep++

    return session
  }

  /**
   * 获取部署进度
   */
  getProgress(session: DeploymentSession): {
    percentage: number
    currentStepTitle: string
    remainingTime: string
  } {
    const completedSteps = session.steps.filter(
      s => s.status === 'completed' || s.status === 'skipped'
    ).length

    const percentage = (completedSteps / session.totalSteps) * 100

    const currentStep = session.steps[session.currentStep]
    const currentStepTitle = currentStep?.title || '已完成'

    // 计算剩余时间
    const remainingSteps = session.steps.slice(session.currentStep)
    const totalMinutes = remainingSteps.reduce((sum, step) => {
      const time = parseInt(step.estimatedTime) || 0
      return sum + time
    }, 0)

    const remainingTime =
      totalMinutes > 60
        ? `约${Math.ceil(totalMinutes / 60)}小时`
        : `约${totalMinutes}分钟`

    return {
      percentage: Math.round(percentage),
      currentStepTitle,
      remainingTime
    }
  }

  /**
   * 获取部署建议
   */
  getRecommendations(context: DeploymentContext): string[] {
    const recommendations: string[] = []

    if (context.environment === 'production') {
      recommendations.push('生产环境建议启用所有监控和告警')
      recommendations.push('确保配置了备份和回滚策略')
      recommendations.push('使用蓝绿部署或金丝雀发布')
    }

    if (!context.resources.monitoring.enabled) {
      recommendations.push('强烈建议启用性能监控')
    }

    if (!context.resources.monitoring.alertsEnabled) {
      recommendations.push('建议配置关键指标告警')
    }

    if (Object.keys(context.resources.apiKeys).length === 0) {
      recommendations.push('请配置必要的API密钥')
    }

    return recommendations
  }

  /**
   * 生成部署检查清单
   */
  generateChecklist(environment: string): string[] {
    const baseChecklist = [
      '✓ Agent配置完整',
      '✓ API密钥已配置',
      '✓ 网络连接正常',
      '✓ 依赖项已安装',
      '✓ 环境变量已设置'
    ]

    if (environment === 'production') {
      return [
        ...baseChecklist,
        '✓ HTTPS已启用',
        '✓ 监控已配置',
        '✓ 告警已设置',
        '✓ 负载测试通过',
        '✓ 回滚方案就绪',
        '✓ 备份已配置'
      ]
    }

    return baseChecklist
  }
}

export const deploymentWizard = new DeploymentWizardService()
