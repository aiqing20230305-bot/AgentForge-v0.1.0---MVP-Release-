/**
 * Sync Service
 * Manages synchronization between local storage and cloud backend
 */

import { agentApi, taskApi, Agent, Task as ApiTask, handleApiError } from '../api'
import { useDataSourceStore, AgentData } from '../../store/useDataSourceStore'
import { useTaskStore } from '../../stores/taskStore'
import type { Task } from '../../types/task'

/**
 * Sync status
 */
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'

/**
 * Sync result
 */
export interface SyncResult {
  success: boolean
  synced: {
    agents: number
    tasks: number
  }
  errors: string[]
}

/**
 * Pending operation for offline queue
 */
export interface PendingOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: 'agent' | 'task'
  data: any
  retryCount: number
  timestamp: string
}

const PENDING_OPS_KEY = 'sync_pending_operations'
const MAX_RETRIES = 3

/**
 * Sync Service Class
 * Handles bidirectional sync between local and cloud
 */
export class SyncService {
  private isSyncing = false
  private syncEnabled = false
  private pendingOps: PendingOperation[] = []
  private isInitialized = false

  /**
   * Enable cloud sync
   */
  enable(): void {
    this.syncEnabled = true
  }

  /**
   * Disable cloud sync
   */
  disable(): void {
    this.syncEnabled = false
  }

  /**
   * Check if sync is enabled
   */
  isEnabled(): boolean {
    return this.syncEnabled
  }

  /**
   * Check if sync is in progress
   */
  isSyncInProgress(): boolean {
    return this.isSyncing
  }

  /**
   * Pull data from cloud to local
   * Downloads agents and tasks from backend
   */
  async pullFromCloud(): Promise<SyncResult> {
    if (!this.syncEnabled) {
      return {
        success: false,
        synced: { agents: 0, tasks: 0 },
        errors: ['Cloud sync is disabled']
      }
    }

    if (this.isSyncing) {
      return {
        success: false,
        synced: { agents: 0, tasks: 0 },
        errors: ['Sync already in progress']
      }
    }

    this.isSyncing = true
    const errors: string[] = []
    let agentCount = 0
    let taskCount = 0

    try {
      // Fetch agents from cloud
      try {
        const cloudAgents = await agentApi.getAll()

        // Convert API agents to local format
        const localAgents = cloudAgents.map(this.convertApiAgentToLocal)

        // Update local store - merge with existing agents
        useDataSourceStore.getState().updateAgentsCache(localAgents)
        agentCount = localAgents.length
      } catch (error) {
        errors.push(`Agents sync failed: ${handleApiError(error)}`)
      }

      // Fetch tasks from cloud
      try {
        const cloudTasks = await taskApi.getAll()
        const taskStore = useTaskStore.getState()
        const agentsCache = useDataSourceStore.getState().agentsCache
        const cloudToLocalMap = this.buildAgentCloudToLocalMap(agentsCache)

        for (const apiTask of cloudTasks) {
          const localAgentId = cloudToLocalMap.get(apiTask.agentId)

          if (!localAgentId) {
            errors.push(`Task "${apiTask.title}": Agent not found (cloudId: ${apiTask.agentId})`)
            continue
          }

          // Find agent name
          const agent = agentsCache.find(a => a.id === localAgentId)
          const agentName = agent?.name || 'Unknown'

          // Check if task already exists locally
          const existingTask = taskStore.tasks.find(t => t.cloudId === apiTask.id)

          if (existingTask) {
            // Update only if cloud is newer
            const cloudUpdatedAt = new Date(apiTask.updatedAt)
            const localUpdatedAt = new Date(existingTask.updatedAt || existingTask.createdAt)

            if (cloudUpdatedAt > localUpdatedAt) {
              taskStore.updateTask(existingTask.id, {
                ...this.convertApiTaskToLocal(apiTask, localAgentId, agentName),
                id: existingTask.id
              })
              taskCount++
            }
          } else {
            // Create new local task
            taskStore.addTask(this.convertApiTaskToLocal(apiTask, localAgentId, agentName))
            taskCount++
          }
        }

        console.log(`[Sync] Synced ${taskCount} tasks from cloud`)
      } catch (error) {
        errors.push(`Tasks sync failed: ${handleApiError(error)}`)
      }

      return {
        success: errors.length === 0,
        synced: { agents: agentCount, tasks: taskCount },
        errors
      }
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Push local data to cloud
   * Uploads local agents and tasks to backend
   */
  async pushToCloud(): Promise<SyncResult> {
    if (!this.syncEnabled) {
      return {
        success: false,
        synced: { agents: 0, tasks: 0 },
        errors: ['Cloud sync is disabled']
      }
    }

    if (this.isSyncing) {
      return {
        success: false,
        synced: { agents: 0, tasks: 0 },
        errors: ['Sync already in progress']
      }
    }

    this.isSyncing = true
    const errors: string[] = []
    let agentCount = 0
    let taskCount = 0

    try {
      const localAgents = useDataSourceStore.getState().agentsCache
      const localToCloudMap = this.buildAgentLocalToCloudMap(localAgents)
      const taskStore = useTaskStore.getState()
      const localTasks = taskStore.tasks

      // Push agents to cloud first (agents must exist before tasks)
      for (const localAgent of localAgents) {
        try {
          const cloudId = localAgent.metadata?.cloudId as string | undefined
          if (cloudId) {
            // Update existing agent
            await agentApi.update(cloudId, this.convertLocalAgentToApi(localAgent))
          } else {
            // Create new agent
            const cloudAgent = await agentApi.create(this.convertLocalAgentToApi(localAgent))
            // Update local agent with cloud ID
            const agents = useDataSourceStore.getState().agentsCache
            const updatedAgents = agents.map((a: AgentData) =>
              a.id === localAgent.id ? {
                ...a,
                metadata: {
                  ...a.metadata,
                  cloudId: cloudAgent.id
                }
              } : a
            )
            useDataSourceStore.getState().updateAgentsCache(updatedAgents)

            // Update mapping
            localToCloudMap.set(localAgent.id, cloudAgent.id)
          }
          agentCount++
        } catch (error) {
          errors.push(`Agent sync failed (${localAgent.name}): ${handleApiError(error)}`)
        }
      }

      // Push unsynced tasks to cloud (tasks without cloudId)
      const unsyncedTasks = localTasks.filter(t => !t.cloudId)

      for (const task of unsyncedTasks) {
        const cloudAgentId = localToCloudMap.get(task.agentId)

        if (!cloudAgentId) {
          errors.push(`Task "${task.title}": Agent not synced (localId: ${task.agentId})`)
          continue
        }

        try {
          const apiTaskData = this.convertLocalTaskToApi(task, cloudAgentId)
          const createdTask = await taskApi.create(apiTaskData)

          // Update local task with cloudId
          taskStore.updateTask(task.id, {
            ...task,
            cloudId: createdTask.id,
            agentCloudId: cloudAgentId,
            metadata: {
              ...task.metadata,
              lastSyncedAt: new Date().toISOString()
            }
          })
          taskCount++
        } catch (error) {
          errors.push(`Task create failed (${task.title}): ${handleApiError(error)}`)
        }
      }

      // Push modified tasks (have cloudId but updated since last sync)
      const modifiedTasks = localTasks.filter(t => {
        if (!t.cloudId) return false
        const lastSynced = t.metadata?.lastSyncedAt
        if (!lastSynced) return true
        return new Date(t.updatedAt || t.createdAt) > new Date(lastSynced)
      })

      for (const task of modifiedTasks) {
        const cloudAgentId = localToCloudMap.get(task.agentId)
        if (!cloudAgentId) {
          errors.push(`Task "${task.title}": Agent not synced`)
          continue
        }

        try {
          const apiTaskData = this.convertLocalTaskToApi(task, cloudAgentId)
          await taskApi.update(task.cloudId!, apiTaskData)

          taskStore.updateTask(task.id, {
            ...task,
            metadata: {
              ...task.metadata,
              lastSyncedAt: new Date().toISOString()
            }
          })
          taskCount++
        } catch (error) {
          errors.push(`Task update failed (${task.title}): ${handleApiError(error)}`)
        }
      }

      return {
        success: errors.length === 0,
        synced: { agents: agentCount, tasks: taskCount },
        errors
      }
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Full bidirectional sync
   * Push local changes then pull cloud changes
   */
  async fullSync(): Promise<SyncResult> {
    const pushResult = await this.pushToCloud()
    const pullResult = await this.pullFromCloud()

    return {
      success: pushResult.success && pullResult.success,
      synced: {
        agents: pushResult.synced.agents + pullResult.synced.agents,
        tasks: pushResult.synced.tasks + pullResult.synced.tasks
      },
      errors: [...pushResult.errors, ...pullResult.errors]
    }
  }

  /**
   * Convert API agent to local format
   */
  private convertApiAgentToLocal(apiAgent: Agent): AgentData {
    const sourceId = 'cloud-sync' // Default source ID for cloud-synced agents
    return {
      id: apiAgent.id,
      name: apiAgent.name,
      displayName: apiAgent.name,
      sourceId,
      sourceName: 'Cloud Sync',
      level: apiAgent.level,
      exp: apiAgent.experience,
      maxExp: 1000,
      role: 'Agent',
      skills: apiAgent.tags || [],
      status: apiAgent.status === 'error' ? 'offline' : (apiAgent.status as any),
      avatar: apiAgent.avatar,
      description: apiAgent.systemPrompt,
      metadata: {
        cloudId: apiAgent.id,
        aiModel: apiAgent.aiModel,
        temperature: apiAgent.temperature,
        maxTokens: apiAgent.maxTokens
      },
      levelSystem: {
        currentLevel: apiAgent.level,
        currentExp: apiAgent.experience,
        expToNextLevel: 1000,
        totalExp: apiAgent.experience,
        prestigeLevel: 0,
        levelHistory: []
      },
      energyStats: {
        totalTokensUsed: apiAgent.tokensUsed,
        tokensUsedToday: 0,
        tokensUsedThisWeek: 0,
        tokensUsedThisMonth: 0,
        averagePerTask: 0,
        peakTokensPerHour: 0
      },
      skillTree: {
        unlockedSkills: [],
        activeSkills: [],
        skillPoints: 0,
        skillLevels: {}
      },
      achievements: {
        unlocked: [],
        progress: {}
      }
    }
  }

  /**
   * Convert local agent to API format
   */
  private convertLocalAgentToApi(localAgent: AgentData): any {
    return {
      name: localAgent.name,
      aiModel: localAgent.metadata?.aiModel || 'gpt-3.5-turbo',
      systemPrompt: localAgent.description,
      temperature: localAgent.metadata?.temperature || 0.7,
      maxTokens: localAgent.metadata?.maxTokens || 2000,
      avatar: localAgent.avatar,
      tags: localAgent.skills || []
    }
  }

  /**
   * Build Agent cloud-to-local ID mapping
   */
  private buildAgentCloudToLocalMap(agents: AgentData[]): Map<string, string> {
    const map = new Map<string, string>()
    agents.forEach(agent => {
      if (agent.metadata?.cloudId) {
        map.set(agent.metadata.cloudId as string, agent.id)
      }
    })
    return map
  }

  /**
   * Build Agent local-to-cloud ID mapping
   */
  private buildAgentLocalToCloudMap(agents: AgentData[]): Map<string, string> {
    const map = new Map<string, string>()
    agents.forEach(agent => {
      if (agent.metadata?.cloudId) {
        map.set(agent.id, agent.metadata.cloudId as string)
      }
    })
    return map
  }

  /**
   * Convert API task to local format
   */
  private convertApiTaskToLocal(apiTask: ApiTask, localAgentId: string, agentName: string): Omit<Task, 'id'> {
    return {
      cloudId: apiTask.id,
      title: apiTask.title,
      description: apiTask.description || '',
      status: apiTask.status,
      priority: apiTask.priority,
      agentId: localAgentId,
      agentName: agentName,
      agentCloudId: apiTask.agentId,
      createdAt: apiTask.createdAt,
      updatedAt: apiTask.updatedAt,
      startedAt: apiTask.startedAt,
      completedAt: apiTask.completedAt,
      result: apiTask.result,
      errorMessage: apiTask.errorMessage,
      tags: apiTask.tags || [],
      retryCount: apiTask.retryCount || 0,
      estimatedDuration: apiTask.estimatedDuration,
      actualDuration: apiTask.actualDuration,
      executionLog: apiTask.executionLog || [],
      tokenMetrics: apiTask.tokensUsed ? {
        estimatedTokens: 0,
        actualTokens: apiTask.tokensUsed,
        inputTokens: 0,
        outputTokens: 0,
        model: 'unknown',
        costUSD: 0
      } : undefined,
      metadata: {
        lastSyncedAt: new Date().toISOString()
      }
    }
  }

  /**
   * Convert local task to API format
   */
  private convertLocalTaskToApi(task: Task, cloudAgentId: string): any {
    return {
      agentId: cloudAgentId,
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      result: task.result,
      errorMessage: task.errorMessage,
      estimatedDuration: task.estimatedDuration,
      actualDuration: task.actualDuration,
      tokensUsed: task.tokenMetrics?.actualTokens || 0,
      scheduledAt: task.startedAt,
      tags: task.tags || []
    }
  }

  /**
   * Initialize offline queue system
   * Load pending operations from localStorage and setup listeners
   */
  initialize(): void {
    if (this.isInitialized) return

    // Load pending operations from localStorage
    try {
      const saved = localStorage.getItem(PENDING_OPS_KEY)
      if (saved) {
        this.pendingOps = JSON.parse(saved)
        console.log(`[Sync] Loaded ${this.pendingOps.length} pending operations from storage`)
      }
    } catch (error) {
      console.error('[Sync] Failed to load pending operations:', error)
      this.pendingOps = []
    }

    // Listen for network status changes
    window.addEventListener('online', () => {
      console.log('[Sync] Network back online, processing pending operations')
      this.processPendingOps()
    })

    this.isInitialized = true
    console.log('[Sync] Offline queue system initialized')
  }

  /**
   * Queue an operation for later execution (when offline)
   */
  queueOperation(op: Omit<PendingOperation, 'id' | 'retryCount' | 'timestamp'>): void {
    const operation: PendingOperation = {
      ...op,
      id: `${op.type}_${op.entity}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      retryCount: 0,
      timestamp: new Date().toISOString()
    }

    this.pendingOps.push(operation)
    this.savePendingOps()

    console.log(`[Sync] Queued operation: ${operation.type} ${operation.entity}`, operation.id)
  }

  /**
   * Process all pending operations
   */
  async processPendingOps(): Promise<void> {
    if (this.pendingOps.length === 0) return

    console.log(`[Sync] Processing ${this.pendingOps.length} pending operations`)
    const ops = [...this.pendingOps]
    const failed: PendingOperation[] = []

    for (const op of ops) {
      try {
        await this.executeOperation(op)
        console.log(`[Sync] ✅ Executed operation: ${op.id}`)
        // Remove from queue
        this.pendingOps = this.pendingOps.filter(o => o.id !== op.id)
      } catch (error) {
        console.error(`[Sync] ❌ Failed to execute operation ${op.id}:`, error)
        op.retryCount++

        if (op.retryCount >= MAX_RETRIES) {
          console.error(`[Sync] Max retries reached for operation ${op.id}, discarding`)
          this.pendingOps = this.pendingOps.filter(o => o.id !== op.id)
        } else {
          failed.push(op)
        }
      }
    }

    this.savePendingOps()
    console.log(`[Sync] Processed operations: ${ops.length - failed.length} succeeded, ${failed.length} failed`)
  }

  /**
   * Execute a single pending operation
   */
  private async executeOperation(op: PendingOperation): Promise<void> {
    switch (op.entity) {
      case 'agent':
        return this.executeAgentOperation(op)
      case 'task':
        return this.executeTaskOperation(op)
      default:
        throw new Error(`Unknown entity type: ${op.entity}`)
    }
  }

  /**
   * Execute an agent operation
   */
  private async executeAgentOperation(op: PendingOperation): Promise<void> {
    switch (op.type) {
      case 'create':
        await agentApi.create(op.data)
        break
      case 'update':
        await agentApi.update(op.data.id, op.data)
        break
      case 'delete':
        await agentApi.delete(op.data.id)
        break
      default:
        throw new Error(`Unknown operation type: ${op.type}`)
    }
  }

  /**
   * Execute a task operation
   */
  private async executeTaskOperation(op: PendingOperation): Promise<void> {
    switch (op.type) {
      case 'create':
        await taskApi.create(op.data)
        break
      case 'update':
        await taskApi.update(op.data.id, op.data)
        break
      case 'delete':
        await taskApi.delete(op.data.id)
        break
      default:
        throw new Error(`Unknown operation type: ${op.type}`)
    }
  }

  /**
   * Save pending operations to localStorage
   */
  private savePendingOps(): void {
    try {
      localStorage.setItem(PENDING_OPS_KEY, JSON.stringify(this.pendingOps))
    } catch (error) {
      console.error('[Sync] Failed to save pending operations:', error)
    }
  }

  /**
   * Get current pending operations count
   */
  getPendingOpsCount(): number {
    return this.pendingOps.length
  }

  /**
   * Clear all pending operations
   */
  clearPendingOps(): void {
    this.pendingOps = []
    localStorage.removeItem(PENDING_OPS_KEY)
    console.log('[Sync] Cleared all pending operations')
  }
}

// Singleton instance
let syncServiceInstance: SyncService | null = null

/**
 * Get Sync Service instance (singleton)
 */
export const getSyncService = (): SyncService => {
  if (!syncServiceInstance) {
    syncServiceInstance = new SyncService()
    syncServiceInstance.initialize()
  }
  return syncServiceInstance
}
