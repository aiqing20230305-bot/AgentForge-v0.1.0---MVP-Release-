/**
 * Task Execution Simulator
 * Simulates task execution based on priority, difficulty, and agent stats
 */

import type { Task, TaskPriority } from '../types/task'

export interface SimulationResult {
  success: boolean
  duration: number // seconds
  tokensUsed: number
  log: string[]
  result?: string
  error?: string
}

export class TaskSimulator {
  /**
   * Simulate task execution
   */
  static async simulateExecution(task: Task, agentLevel: number = 1): Promise<SimulationResult> {
    const log: string[] = []

    log.push(`[${new Date().toISOString()}] Task execution started: ${task.title}`)
    log.push(`[INFO] Priority: ${task.priority}, Agent Level: ${agentLevel}`)

    // Calculate execution time based on priority
    const baseDuration = this.getBaseDuration(task.priority)
    const levelModifier = 1 - (agentLevel * 0.02) // 2% faster per level
    const actualDuration = Math.max(1, baseDuration * levelModifier)

    log.push(`[INFO] Estimated duration: ${actualDuration.toFixed(1)}s`)

    // Calculate success rate
    const successRate = this.calculateSuccessRate(task.priority, agentLevel)
    log.push(`[INFO] Success rate: ${(successRate * 100).toFixed(1)}%`)

    // Simulate execution delay
    await this.delay(actualDuration * 1000)

    // Determine success
    const success = Math.random() < successRate

    // Calculate token usage
    const tokensUsed = this.calculateTokenUsage(task.priority, success)
    log.push(`[INFO] Tokens used: ${tokensUsed}`)

    if (success) {
      log.push(`[SUCCESS] Task completed successfully`)
      return {
        success: true,
        duration: actualDuration,
        tokensUsed,
        log,
        result: this.generateSuccessResult(task)
      }
    } else {
      log.push(`[ERROR] Task execution failed`)
      return {
        success: false,
        duration: actualDuration,
        tokensUsed: tokensUsed * 0.5, // Failed tasks use less tokens
        log,
        error: this.generateErrorMessage()
      }
    }
  }

  private static getBaseDuration(priority: TaskPriority): number {
    const durations: Record<TaskPriority, number> = {
      low: 3,
      medium: 5,
      high: 8,
      urgent: 12
    }
    return durations[priority]
  }

  private static calculateSuccessRate(priority: TaskPriority, level: number): number {
    const baseRates: Record<TaskPriority, number> = {
      low: 0.95,
      medium: 0.85,
      high: 0.70,
      urgent: 0.60
    }

    const baseRate = baseRates[priority]
    const levelBonus = Math.min(0.3, level * 0.01) // Max +30% from level

    return Math.min(0.99, baseRate + levelBonus)
  }

  private static calculateTokenUsage(priority: TaskPriority, success: boolean): number {
    const baseTokens: Record<TaskPriority, number> = {
      low: 500,
      medium: 1500,
      high: 3000,
      urgent: 5000
    }

    const base = baseTokens[priority]
    const variance = base * 0.2 * (Math.random() - 0.5) // ±10% variance

    return Math.round(base + variance)
  }

  private static generateSuccessResult(task: Task): string {
    const results = [
      `Successfully completed: ${task.title}`,
      `Task '${task.title}' finished with excellent results`,
      `Completed ${task.title} - All objectives met`,
      `Task execution successful: ${task.title}`
    ]
    return results[Math.floor(Math.random() * results.length)]
  }

  private static generateErrorMessage(): string {
    const errors = [
      'Execution timeout - task complexity exceeded limits',
      'Resource unavailable - retrying may help',
      'Validation failed - check task parameters',
      'External API error - temporary issue',
      'Context overflow - task requires simplification'
    ]
    return errors[Math.floor(Math.random() * errors.length)]
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
