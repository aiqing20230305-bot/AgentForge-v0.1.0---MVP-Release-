#!/usr/bin/env node
/**
 * 🔮 Prophet Auto Developer - 立即执行的自动开发
 *
 * 基于已识别的问题，立即开始优化开发
 */

const { readFile, writeFile, mkdir } = require('fs/promises')
const { join } = require('path')
const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)

class ProphetAutoDev {
  constructor(projectPath) {
    this.projectPath = projectPath
  }

  async execute() {
    console.log('🔮 Prophet Auto Developer: 开始主动开发...\n')

    // 任务1: 添加API密钥安全检查工具
    await this.task1_AddApiKeyValidator()

    // 任务2: 创建错误处理工具类
    await this.task2_CreateErrorHandler()

    // 任务3: 添加性能监控装饰器
    await this.task3_AddPerformanceMonitor()

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  ✨ Prophet 自动开发完成')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('📝 已创建的优化:')
    console.log('   1. API密钥验证器 (apps/api/src/utils/api-key-validator.ts)')
    console.log('   2. 统一错误处理器 (apps/api/src/utils/error-handler.ts)')
    console.log('   3. 性能监控装饰器 (apps/api/src/utils/performance-monitor.ts)')
    console.log('')
    console.log('💡 下一步:')
    console.log('   1. 审查生成的代码')
    console.log('   2. 集成到现有代码中')
    console.log('   3. 添加测试用例')
    console.log('   4. git commit')
    console.log('')
  }

  /**
   * 任务1: 添加API密钥验证器
   */
  async task1_AddApiKeyValidator() {
    console.log('📝 任务1: 创建API密钥验证器...')

    const code = `/**
 * API Key Validator - API密钥安全验证工具
 *
 * 由 Prophet Auto Developer 自动生成
 * 生成时间: ${new Date().toISOString()}
 *
 * 功能:
 * - 验证环境变量中的API密钥
 * - 检测密钥格式
 * - 防止硬编码泄露
 * - 密钥轮换提醒
 */

export class ApiKeyValidator {
  private static readonly KEY_PATTERNS = {
    anthropic: /^sk-ant-[a-zA-Z0-9-_]{32,}$/,
    openai: /^sk-[a-zA-Z0-9]{32,}$/,
    generic: /^[a-zA-Z0-9-_]{20,}$/
  }

  /**
   * 验证所有必需的API密钥
   */
  static validateRequiredKeys(): ValidationResult {
    const required = [
      { name: 'ANTHROPIC_API_KEY', pattern: this.KEY_PATTERNS.anthropic },
      { name: 'OPENAI_API_KEY', pattern: this.KEY_PATTERNS.openai },
      { name: 'KLING_API_KEY', pattern: this.KEY_PATTERNS.generic }
    ]

    const results: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    }

    for (const key of required) {
      const value = process.env[key.name]

      if (!value) {
        results.valid = false
        results.errors.push({
          key: key.name,
          message: \`缺少必需的API密钥: \${key.name}\`,
          severity: 'critical'
        })
        continue
      }

      if (!key.pattern.test(value)) {
        results.warnings.push({
          key: key.name,
          message: \`API密钥格式可能不正确: \${key.name}\`,
          severity: 'medium'
        })
      }

      // 检查密钥是否看起来像是硬编码的测试值
      if (value.includes('test') || value.includes('example')) {
        results.warnings.push({
          key: key.name,
          message: \`检测到测试密钥，请在生产环境中使用真实密钥\`,
          severity: 'high'
        })
      }
    }

    return results
  }

  /**
   * 检查代码中是否有硬编码的密钥
   */
  static async scanForHardcodedKeys(directory: string): Promise<ScanResult> {
    // TODO: 实现代码扫描逻辑
    return {
      found: [],
      filesScanned: 0
    }
  }

  /**
   * 记录API密钥使用情况
   */
  static logKeyUsage(keyName: string, service: string): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      key: keyName,
      service,
      // 不记录实际密钥值
    }

    // TODO: 发送到监控系统
    console.debug('API Key Usage:', logEntry)
  }

  /**
   * 检查密钥是否需要轮换
   */
  static checkKeyRotation(keyName: string): RotationStatus {
    // TODO: 从数据库或配置中获取上次轮换时间
    const lastRotation = new Date('2026-03-01') // 示例
    const daysSinceRotation = Math.floor(
      (Date.now() - lastRotation.getTime()) / (1000 * 60 * 60 * 24)
    )

    return {
      needsRotation: daysSinceRotation > 30,
      daysSinceRotation,
      recommendation: daysSinceRotation > 30
        ? '建议轮换API密钥（已超过30天）'
        : '密钥状态正常'
    }
  }
}

interface ValidationResult {
  valid: boolean
  errors: Array<{
    key: string
    message: string
    severity: 'critical' | 'high' | 'medium' | 'low'
  }>
  warnings: Array<{
    key: string
    message: string
    severity: 'critical' | 'high' | 'medium' | 'low'
  }>
}

interface ScanResult {
  found: Array<{
    file: string
    line: number
    pattern: string
  }>
  filesScanned: number
}

interface RotationStatus {
  needsRotation: boolean
  daysSinceRotation: number
  recommendation: string
}

/**
 * 使用示例:
 *
 * // 在应用启动时验证
 * const validation = ApiKeyValidator.validateRequiredKeys()
 * if (!validation.valid) {
 *   console.error('API密钥验证失败:', validation.errors)
 *   process.exit(1)
 * }
 *
 * // 记录使用
 * ApiKeyValidator.logKeyUsage('ANTHROPIC_API_KEY', 'story-generation')
 *
 * // 检查轮换
 * const rotation = ApiKeyValidator.checkKeyRotation('OPENAI_API_KEY')
 * if (rotation.needsRotation) {
 *   console.warn(rotation.recommendation)
 * }
 */
`

    const filePath = join(
      this.projectPath,
      'apps/api/src/utils/api-key-validator.ts'
    )

    await writeFile(filePath, code)
    console.log('   ✓ 已创建: apps/api/src/utils/api-key-validator.ts\n')
  }

  /**
   * 任务2: 创建统一错误处理器
   */
  async task2_CreateErrorHandler() {
    console.log('📝 任务2: 创建统一错误处理器...')

    const code = `/**
 * Unified Error Handler - 统一错误处理器
 *
 * 由 Prophet Auto Developer 自动生成
 * 生成时间: ${new Date().toISOString()}
 *
 * 功能:
 * - 统一处理所有AI服务错误
 * - 智能重试机制
 * - 错误分类和追踪
 * - 降级策略
 */

export class UnifiedErrorHandler {
  /**
   * 处理AI服务错误
   */
  static async handleAIError<T>(
    error: Error,
    context: ErrorContext,
    fallback?: () => Promise<T>
  ): Promise<ErrorHandlingResult<T>> {
    const errorType = this.classifyError(error)

    console.error(\`AI Error [\${errorType}]:\`, {
      service: context.service,
      operation: context.operation,
      error: error.message
    })

    switch (errorType) {
      case 'rate_limit':
        return this.handleRateLimit(error, context, fallback)

      case 'timeout':
        return this.handleTimeout(error, context, fallback)

      case 'service_unavailable':
        return this.handleServiceUnavailable(error, context, fallback)

      case 'invalid_request':
        return this.handleInvalidRequest(error, context)

      case 'authentication':
        return this.handleAuthentication(error, context)

      default:
        return this.handleUnknownError(error, context, fallback)
    }
  }

  /**
   * 分类错误类型
   */
  private static classifyError(error: Error): ErrorType {
    const message = error.message.toLowerCase()

    if (message.includes('rate limit') || message.includes('429')) {
      return 'rate_limit'
    }

    if (message.includes('timeout') || message.includes('timed out')) {
      return 'timeout'
    }

    if (
      message.includes('service unavailable') ||
      message.includes('503') ||
      message.includes('502')
    ) {
      return 'service_unavailable'
    }

    if (message.includes('invalid') || message.includes('400')) {
      return 'invalid_request'
    }

    if (
      message.includes('unauthorized') ||
      message.includes('401') ||
      message.includes('api key')
    ) {
      return 'authentication'
    }

    return 'unknown'
  }

  /**
   * 处理速率限制错误
   */
  private static async handleRateLimit<T>(
    error: Error,
    context: ErrorContext,
    fallback?: () => Promise<T>
  ): Promise<ErrorHandlingResult<T>> {
    // 计算退避时间
    const backoffMs = this.calculateBackoff(context.retryCount || 0)

    console.warn(\`Rate limit hit, waiting \${backoffMs}ms before retry\`)

    if (context.retryCount && context.retryCount >= 3) {
      // 达到最大重试次数，使用降级方案
      if (fallback) {
        console.warn('Max retries reached, using fallback')
        const result = await fallback()
        return { success: true, data: result, usedFallback: true }
      }

      return { success: false, error, retryable: false }
    }

    // 等待后重试
    await this.sleep(backoffMs)
    return { success: false, error, retryable: true, backoffMs }
  }

  /**
   * 处理超时错误
   */
  private static async handleTimeout<T>(
    error: Error,
    context: ErrorContext,
    fallback?: () => Promise<T>
  ): Promise<ErrorHandlingResult<T>> {
    if (context.retryCount && context.retryCount >= 2) {
      if (fallback) {
        const result = await fallback()
        return { success: true, data: result, usedFallback: true }
      }
      return { success: false, error, retryable: false }
    }

    const backoffMs = 1000 * (context.retryCount || 0 + 1)
    await this.sleep(backoffMs)
    return { success: false, error, retryable: true, backoffMs }
  }

  /**
   * 处理服务不可用错误
   */
  private static async handleServiceUnavailable<T>(
    error: Error,
    context: ErrorContext,
    fallback?: () => Promise<T>
  ): Promise<ErrorHandlingResult<T>> {
    console.error(\`Service unavailable: \${context.service}\`)

    // 立即尝试降级方案
    if (fallback) {
      try {
        const result = await fallback()
        return { success: true, data: result, usedFallback: true }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
      }
    }

    return { success: false, error, retryable: false }
  }

  /**
   * 处理无效请求错误
   */
  private static async handleInvalidRequest<T>(
    error: Error,
    context: ErrorContext
  ): Promise<ErrorHandlingResult<T>> {
    console.error('Invalid request:', {
      service: context.service,
      operation: context.operation,
      error: error.message
    })

    // 无效请求不应重试
    return { success: false, error, retryable: false }
  }

  /**
   * 处理认证错误
   */
  private static async handleAuthentication<T>(
    error: Error,
    context: ErrorContext
  ): Promise<ErrorHandlingResult<T>> {
    console.error(\`Authentication failed for \${context.service}\`)
    console.error('Please check your API key configuration')

    // 认证错误不应重试
    return { success: false, error, retryable: false }
  }

  /**
   * 处理未知错误
   */
  private static async handleUnknownError<T>(
    error: Error,
    context: ErrorContext,
    fallback?: () => Promise<T>
  ): Promise<ErrorHandlingResult<T>> {
    console.error('Unknown error:', error)

    if (fallback && context.retryCount && context.retryCount >= 1) {
      try {
        const result = await fallback()
        return { success: true, data: result, usedFallback: true }
      } catch {}
    }

    return { success: false, error, retryable: false }
  }

  /**
   * 计算指数退避时间
   */
  private static calculateBackoff(retryCount: number): number {
    const baseDelay = 1000 // 1秒
    const maxDelay = 30000 // 30秒

    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay)

    // 添加随机抖动，避免雷鸣群效应
    const jitter = Math.random() * 0.3 * delay
    return delay + jitter
  }

  /**
   * Sleep 工具
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

type ErrorType =
  | 'rate_limit'
  | 'timeout'
  | 'service_unavailable'
  | 'invalid_request'
  | 'authentication'
  | 'unknown'

interface ErrorContext {
  service: string
  operation: string
  retryCount?: number
  metadata?: Record<string, any>
}

interface ErrorHandlingResult<T> {
  success: boolean
  data?: T
  error?: Error
  retryable?: boolean
  backoffMs?: number
  usedFallback?: boolean
}

/**
 * 使用示例:
 *
 * try {
 *   const result = await anthropic.messages.create(...)
 * } catch (error) {
 *   const handled = await UnifiedErrorHandler.handleAIError(
 *     error,
 *     { service: 'anthropic', operation: 'generateStory' },
 *     async () => {
 *       // 降级方案：使用缓存的响应
 *       return getCachedResponse()
 *     }
 *   )
 *
 *   if (handled.retryable) {
 *     // 重试逻辑
 *   } else if (handled.usedFallback) {
 *     return handled.data
 *   } else {
 *     throw handled.error
 *   }
 * }
 */
`

    const filePath = join(
      this.projectPath,
      'apps/api/src/utils/error-handler.ts'
    )

    await writeFile(filePath, code)
    console.log('   ✓ 已创建: apps/api/src/utils/error-handler.ts\n')
  }

  /**
   * 任务3: 添加性能监控装饰器
   */
  async task3_AddPerformanceMonitor() {
    console.log('📝 任务3: 创建性能监控装饰器...')

    const code = `/**
 * Performance Monitor - 性能监控装饰器
 *
 * 由 Prophet Auto Developer 自动生成
 * 生成时间: ${new Date().toISOString()}
 *
 * 功能:
 * - 自动追踪函数执行时间
 * - 记录性能指标
 * - 检测慢查询
 * - 生成性能报告
 */

export class PerformanceMonitor {
  private static metrics: Map<string, PerformanceMetric[]> = new Map()

  /**
   * 装饰器：监控异步函数性能
   */
  static monitor(options: MonitorOptions = {}) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value

      descriptor.value = async function (...args: any[]) {
        const startTime = Date.now()
        const methodName = \`\${target.constructor.name}.\${propertyKey}\`

        try {
          const result = await originalMethod.apply(this, args)
          const duration = Date.now() - startTime

          PerformanceMonitor.recordMetric(methodName, {
            duration,
            success: true,
            timestamp: new Date()
          })

          if (duration > (options.slowThreshold || 1000)) {
            console.warn(\`Slow operation: \${methodName} took \${duration}ms\`)
          }

          return result
        } catch (error) {
          const duration = Date.now() - startTime

          PerformanceMonitor.recordMetric(methodName, {
            duration,
            success: false,
            error: error.message,
            timestamp: new Date()
          })

          throw error
        }
      }

      return descriptor
    }
  }

  /**
   * 记录性能指标
   */
  static recordMetric(name: string, metric: PerformanceMetric): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const metrics = this.metrics.get(name)!
    metrics.push(metric)

    // 限制存储的指标数量
    if (metrics.length > 1000) {
      metrics.splice(0, metrics.length - 1000)
    }
  }

  /**
   * 获取性能统计
   */
  static getStats(name?: string): PerformanceStats | Map<string, PerformanceStats> {
    if (name) {
      const metrics = this.metrics.get(name) || []
      return this.calculateStats(metrics)
    }

    const allStats = new Map<string, PerformanceStats>()
    for (const [methodName, metrics] of this.metrics.entries()) {
      allStats.set(methodName, this.calculateStats(metrics))
    }

    return allStats
  }

  /**
   * 计算统计数据
   */
  private static calculateStats(metrics: PerformanceMetric[]): PerformanceStats {
    if (metrics.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        successRate: 0
      }
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b)
    const successCount = metrics.filter(m => m.success).length

    return {
      count: metrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      p50: durations[Math.floor(durations.length * 0.5)],
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)],
      successRate: (successCount / metrics.length) * 100
    }
  }

  /**
   * 生成性能报告
   */
  static generateReport(): string {
    const lines: string[] = []

    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('  性能监控报告')
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('')

    const allStats = this.getStats() as Map<string, PerformanceStats>

    for (const [name, stats] of allStats.entries()) {
      lines.push(\`📊 \${name}\`)
      lines.push(\`   调用次数: \${stats.count}\`)
      lines.push(\`   成功率: \${stats.successRate.toFixed(1)}%\`)
      lines.push(\`   平均耗时: \${stats.avgDuration.toFixed(0)}ms\`)
      lines.push(\`   P50: \${stats.p50.toFixed(0)}ms\`)
      lines.push(\`   P95: \${stats.p95.toFixed(0)}ms\`)
      lines.push(\`   P99: \${stats.p99.toFixed(0)}ms\`)
      lines.push(\`   最小: \${stats.minDuration.toFixed(0)}ms\`)
      lines.push(\`   最大: \${stats.maxDuration.toFixed(0)}ms\`)
      lines.push('')
    }

    return lines.join('\\n')
  }

  /**
   * 清空指标
   */
  static clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name)
    } else {
      this.metrics.clear()
    }
  }
}

interface MonitorOptions {
  slowThreshold?: number // 慢操作阈值（毫秒）
}

interface PerformanceMetric {
  duration: number
  success: boolean
  timestamp: Date
  error?: string
}

interface PerformanceStats {
  count: number
  avgDuration: number
  minDuration: number
  maxDuration: number
  p50: number
  p95: number
  p99: number
  successRate: number
}

/**
 * 使用示例:
 *
 * class StoryAgent {
 *   @PerformanceMonitor.monitor({ slowThreshold: 2000 })
 *   async generateStory(imageUrl: string) {
 *     // 函数执行时间会被自动追踪
 *     return await this.callAI(imageUrl)
 *   }
 * }
 *
 * // 查看统计
 * const stats = PerformanceMonitor.getStats('StoryAgent.generateStory')
 * console.log(\`平均耗时: \${stats.avgDuration}ms\`)
 *
 * // 生成报告
 * console.log(PerformanceMonitor.generateReport())
 */
`

    const filePath = join(
      this.projectPath,
      'apps/api/src/utils/performance-monitor.ts'
    )

    await writeFile(filePath, code)
    console.log('   ✓ 已创建: apps/api/src/utils/performance-monitor.ts\n')
  }
}

// 执行
const projectPath = process.argv[2] || process.cwd()
const autoDev = new ProphetAutoDev(projectPath)

autoDev.execute().catch(console.error)
