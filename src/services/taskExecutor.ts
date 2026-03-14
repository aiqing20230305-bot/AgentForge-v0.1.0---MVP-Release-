/**
 * Task Execution Engine
 * Manages automatic task execution with queue management and retry logic
 */

import type { Task } from '../types/task'
import { TaskSimulator } from '../utils/taskSimulator'

export interface ExecutionOptions {
  maxConcurrent?: number // Max concurrent tasks per agent (default: 3)
  maxRetries?: number // Max retry attempts (default: 3)
  retryDelay?: number // Delay between retries in ms (default: 2000)
}

export interface ExecutionQueueItem {
  task: Task
  agentLevel: number
  onProgress?: (progress: number) => void
  onComplete?: (success: boolean, result?: string, error?: string) => void
  onLog?: (log: string) => void
}

class TaskExecutionEngine {
  private executionQueue: Map<string, ExecutionQueueItem[]> = new Map() // agentId -> queue
  private runningTasks: Map<string, Set<string>> = new Map() // agentId -> Set<taskId>
  private options: Required<ExecutionOptions>

  constructor(options: ExecutionOptions = {}) {
    this.options = {
      maxConcurrent: options.maxConcurrent ?? 3,
      maxRetries: options.maxRetries ?? 3,
      retryDelay: options.retryDelay ?? 2000
    }
  }

  /**
   * Add task to execution queue
   */
  async executeTask(item: ExecutionQueueItem): Promise<void> {
    const { task } = item
    const agentId = task.agentId

    // Initialize agent's queue and running tasks
    if (!this.executionQueue.has(agentId)) {
      this.executionQueue.set(agentId, [])
      this.runningTasks.set(agentId, new Set())
    }

    const running = this.runningTasks.get(agentId)!
    const queue = this.executionQueue.get(agentId)!

    // Check if can run immediately
    if (running.size < this.options.maxConcurrent) {
      this.runTask(item)
    } else {
      // Add to queue
      queue.push(item)
      item.onLog?.(`[QUEUE] Task queued (${queue.length} in queue)`)
    }
  }

  /**
   * Run a single task with retry logic
   */
  private async runTask(item: ExecutionQueueItem): Promise<void> {
    const { task, agentLevel, onProgress, onComplete, onLog } = item
    const agentId = task.agentId
    const running = this.runningTasks.get(agentId)!

    // Mark as running
    running.add(task.id)
    onLog?.(`[START] Execution started`)

    let retryCount = 0
    let success = false
    let result: string | undefined
    let error: string | undefined

    while (retryCount <= this.options.maxRetries && !success) {
      if (retryCount > 0) {
        onLog?.(`[RETRY] Attempt ${retryCount}/${this.options.maxRetries}`)
        await this.delay(this.options.retryDelay)
      }

      try {
        // Progress callback during execution
        const progressInterval = setInterval(() => {
          const randomProgress = Math.min(99, 10 + Math.random() * 80)
          onProgress?.(randomProgress)
        }, 500)

        // Execute task
        const executionResult = await TaskSimulator.simulateExecution(task, agentLevel)

        clearInterval(progressInterval)

        // Process logs
        executionResult.log.forEach(log => onLog?.(log))

        success = executionResult.success
        result = executionResult.result
        error = executionResult.error

        if (!success && retryCount < this.options.maxRetries) {
          onLog?.(`[FAILED] Task failed: ${error}`)
          retryCount++
        } else if (!success) {
          onLog?.(`[FAILED] Max retries exceeded`)
        }
      } catch (err) {
        error = err instanceof Error ? err.message : 'Unknown error'
        onLog?.(`[ERROR] Exception: ${error}`)
        retryCount++
      }
    }

    // Final progress
    onProgress?.(success ? 100 : 0)

    // Mark as complete
    running.delete(task.id)
    onComplete?.(success, result, error)

    // Process next task in queue
    this.processQueue(agentId)
  }

  /**
   * Process next task in agent's queue
   */
  private processQueue(agentId: string): void {
    const queue = this.executionQueue.get(agentId)
    const running = this.runningTasks.get(agentId)

    if (!queue || !running) return

    // Check if can run more tasks
    while (running.size < this.options.maxConcurrent && queue.length > 0) {
      const nextItem = queue.shift()
      if (nextItem) {
        nextItem.onLog?.(`[DEQUEUE] Starting queued task`)
        this.runTask(nextItem)
      }
    }
  }

  /**
   * Cancel task execution
   */
  cancelTask(agentId: string, taskId: string): boolean {
    // Remove from queue
    const queue = this.executionQueue.get(agentId)
    if (queue) {
      const index = queue.findIndex(item => item.task.id === taskId)
      if (index >= 0) {
        queue.splice(index, 1)
        return true
      }
    }

    // Can't cancel running tasks in this simple implementation
    const running = this.runningTasks.get(agentId)
    return running?.has(taskId) ?? false
  }

  /**
   * Get execution stats for agent
   */
  getAgentStats(agentId: string): { running: number; queued: number } {
    return {
      running: this.runningTasks.get(agentId)?.size ?? 0,
      queued: this.executionQueue.get(agentId)?.length ?? 0
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Global singleton instance
export const taskExecutor = new TaskExecutionEngine()
