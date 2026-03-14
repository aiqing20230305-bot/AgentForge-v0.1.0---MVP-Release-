/**
 * React Hook for Task Auto-Execution
 * Integrates task executor with React state management
 */

import { useEffect, useCallback } from 'react'
import { useTaskStore } from '../stores/taskStore'
import { useDataSourceStore } from '../store/useDataSourceStore'
import { taskExecutor } from '../services/taskExecutor'
import type { Task } from '../types/task'

export function useTaskAutoExecution() {
  const { tasks, updateTask } = useTaskStore()
  const { agentsCache } = useDataSourceStore()

  /**
   * Execute a single task
   */
  const executeTask = useCallback(
    async (taskId: string) => {
      const task = tasks.find(t => t.id === taskId)
      if (!task) {
        console.error(`Task ${taskId} not found`)
        return
      }

      // Find agent level
      const agent = agentsCache.find(a => a.id === task.agentId)
      const agentLevel = agent?.level ?? 1

      // Initialize execution fields
      updateTask(taskId, {
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        executionProgress: 0,
        executionLog: [],
        retryCount: 0,
        errorMessage: undefined
      })

      // Execute task
      await taskExecutor.executeTask({
        task,
        agentLevel,
        onProgress: (progress) => {
          updateTask(taskId, { executionProgress: progress })
        },
        onLog: (log) => {
          updateTask(taskId, {
            executionLog: [...(task.executionLog || []), log]
          })
        },
        onComplete: (success, result, error) => {
          const now = new Date().toISOString()
          const duration =
            task.startedAt
              ? (new Date(now).getTime() - new Date(task.startedAt).getTime()) / 1000
              : 0

          updateTask(taskId, {
            status: success ? 'completed' : 'failed',
            completedAt: now,
            actualDuration: duration,
            result: result,
            errorMessage: error,
            executionProgress: success ? 100 : 0
          })

          // Award experience if successful (TODO: integrate with leveling system)
          if (success && agent) {
            console.log(`[EXP] Agent ${agent.name} gained experience from task completion`)
          }
        }
      })
    },
    [tasks, agentsCache, updateTask]
  )

  /**
   * Execute multiple tasks for an agent
   */
  const executeAgentTasks = useCallback(
    async (agentId: string) => {
      const agentTasks = tasks.filter(
        t => t.agentId === agentId && t.status === 'pending' && t.autoExecution !== false
      )

      for (const task of agentTasks) {
        await executeTask(task.id)
      }
    },
    [tasks, executeTask]
  )

  /**
   * Execute all pending tasks with auto-execution enabled
   */
  const executeAllPendingTasks = useCallback(async () => {
    const autoTasks = tasks.filter(
      t => t.status === 'pending' && t.autoExecution !== false
    )

    for (const task of autoTasks) {
      await executeTask(task.id)
    }
  }, [tasks, executeTask])

  /**
   * Cancel task execution
   */
  const cancelExecution = useCallback(
    (taskId: string) => {
      const task = tasks.find(t => t.id === taskId)
      if (!task) return false

      const cancelled = taskExecutor.cancelTask(task.agentId, taskId)
      if (cancelled) {
        updateTask(taskId, {
          status: 'pending',
          executionProgress: 0,
          executionLog: [...(task.executionLog || []), '[CANCELLED] Execution cancelled by user']
        })
      }
      return cancelled
    },
    [tasks, updateTask]
  )

  return {
    executeTask,
    executeAgentTasks,
    executeAllPendingTasks,
    cancelExecution
  }
}
