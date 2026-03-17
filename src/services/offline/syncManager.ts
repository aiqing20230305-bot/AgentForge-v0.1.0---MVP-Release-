/**
 * Sync Manager
 * 后台同步管理器 - 处理离线数据同步
 */

import { getDatabase, Agent, SyncQueue } from './localDatabase'
import axios from 'axios'

interface SyncConfig {
  enabled: boolean
  interval: number // milliseconds
  retryLimit: number
  conflictResolution: 'local' | 'remote' | 'manual'
}

interface ConflictInfo {
  agentId: string
  localVersion: Agent
  remoteVersion: Agent
  timestamp: string
}

export class SyncManager {
  private db = getDatabase()
  private syncTimer: NodeJS.Timeout | null = null
  private isSyncing = false
  private config: SyncConfig = {
    enabled: true,
    interval: 60000, // 1 minute
    retryLimit: 3,
    conflictResolution: 'manual',
  }
  private conflicts: ConflictInfo[] = []
  private onStatusChange?: (status: SyncStatus) => void

  /**
   * Start sync manager
   * 启动同步管理器
   */
  start() {
    if (!this.config.enabled) {
      console.log('[SyncManager] Sync disabled')
      return
    }

    console.log('[SyncManager] Starting sync manager...')

    // Initial sync
    this.sync()

    // Schedule periodic sync
    this.syncTimer = setInterval(() => {
      this.sync()
    }, this.config.interval)

    console.log(`[SyncManager] Scheduled sync every ${this.config.interval}ms`)
  }

  /**
   * Stop sync manager
   * 停止同步管理器
   */
  stop() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
    console.log('[SyncManager] Sync manager stopped')
  }

  /**
   * Perform sync
   * 执行同步
   */
  async sync(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('[SyncManager] Sync already in progress, skipping...')
      return { success: false, message: 'Sync already in progress' }
    }

    this.isSyncing = true
    this.updateStatus({ state: 'syncing', progress: 0 })

    try {
      console.log('[SyncManager] Starting sync...')

      // Get sync queue
      const queue = this.db.getSyncQueue()
      console.log(`[SyncManager] ${queue.length} items in sync queue`)

      if (queue.length === 0) {
        this.updateStatus({ state: 'idle', progress: 100 })
        return { success: true, message: 'Nothing to sync' }
      }

      // Process queue items
      const results = await this.processQueue(queue)

      // Update status
      const failedCount = results.filter((r) => !r.success).length
      if (failedCount === 0) {
        this.updateStatus({ state: 'idle', progress: 100 })
        return {
          success: true,
          message: `Synced ${results.length} items`,
          synced: results.length,
        }
      } else {
        this.updateStatus({ state: 'error', progress: 100 })
        return {
          success: false,
          message: `${failedCount} items failed to sync`,
          synced: results.length - failedCount,
          failed: failedCount,
        }
      }
    } catch (error: any) {
      console.error('[SyncManager] Sync error:', error)
      this.updateStatus({ state: 'error', progress: 0 })
      return {
        success: false,
        message: error.message,
      }
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Process sync queue
   * 处理同步队列
   */
  private async processQueue(queue: SyncQueue[]): Promise<Array<{ success: boolean }>> {
    const results: Array<{ success: boolean }> = []
    const total = queue.length

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i]

      // Update progress
      this.updateStatus({
        state: 'syncing',
        progress: ((i + 1) / total) * 100,
        currentItem: item.agentId,
      })

      try {
        // Check retry limit
        if (item.retryCount >= this.config.retryLimit) {
          console.warn(`[SyncManager] Item ${item.id} exceeded retry limit, skipping`)
          results.push({ success: false })
          continue
        }

        // Process item based on action
        await this.processSyncItem(item)

        // Remove from queue on success
        this.db.removeFromSyncQueue(item.id)

        // Update agent sync status
        const agent = this.db.getAgent(item.agentId)
        if (agent) {
          this.db.updateAgent(item.agentId, { syncStatus: 'synced' })
        }

        results.push({ success: true })
      } catch (error: any) {
        console.error(`[SyncManager] Failed to sync item ${item.id}:`, error)

        // Update retry count
        this.db.updateSyncQueueRetry(item.id, error.message)

        results.push({ success: false })
      }
    }

    return results
  }

  /**
   * Process single sync item
   * 处理单个同步项
   */
  private async processSyncItem(item: SyncQueue): Promise<void> {
    const data = JSON.parse(item.data)

    switch (item.action) {
      case 'create':
        await this.syncCreate(data)
        break
      case 'update':
        await this.syncUpdate(data)
        break
      case 'delete':
        await this.syncDelete(data.id)
        break
      default:
        throw new Error(`Unknown sync action: ${item.action}`)
    }
  }

  /**
   * Sync create operation
   * 同步创建操作
   */
  private async syncCreate(agent: Agent): Promise<void> {
    // TODO: Implement actual API call
    console.log('[SyncManager] Sync create:', agent.id)

    // Mock API call
    await this.mockApiCall('POST', '/api/agents', agent)

    // Update remote version
    this.db.updateAgent(agent.id, {
      remoteVersion: agent.localVersion,
      syncStatus: 'synced',
    })
  }

  /**
   * Sync update operation
   * 同步更新操作
   */
  private async syncUpdate(agent: Agent): Promise<void> {
    console.log('[SyncManager] Sync update:', agent.id)

    // Check for conflicts
    const remoteAgent = await this.fetchRemoteAgent(agent.id)
    if (remoteAgent && remoteAgent.version > (agent.remoteVersion || 0)) {
      // Conflict detected
      await this.handleConflict(agent, remoteAgent)
      return
    }

    // Mock API call
    await this.mockApiCall('PUT', `/api/agents/${agent.id}`, agent)

    // Update remote version
    this.db.updateAgent(agent.id, {
      remoteVersion: agent.localVersion,
      syncStatus: 'synced',
    })
  }

  /**
   * Sync delete operation
   * 同步删除操作
   */
  private async syncDelete(agentId: string): Promise<void> {
    console.log('[SyncManager] Sync delete:', agentId)

    // Mock API call
    await this.mockApiCall('DELETE', `/api/agents/${agentId}`)
  }

  /**
   * Handle conflict
   * 处理冲突
   */
  private async handleConflict(localAgent: Agent, remoteAgent: any): Promise<void> {
    console.warn('[SyncManager] Conflict detected:', localAgent.id)

    const conflict: ConflictInfo = {
      agentId: localAgent.id,
      localVersion: localAgent,
      remoteVersion: remoteAgent,
      timestamp: new Date().toISOString(),
    }

    this.conflicts.push(conflict)

    // Update agent status
    this.db.updateAgent(localAgent.id, { syncStatus: 'conflict' })

    // Auto-resolve based on config
    if (this.config.conflictResolution !== 'manual') {
      await this.resolveConflict(
        localAgent.id,
        this.config.conflictResolution === 'local' ? 'local' : 'remote'
      )
    }
  }

  /**
   * Resolve conflict
   * 解决冲突
   */
  async resolveConflict(agentId: string, resolution: 'local' | 'remote'): Promise<void> {
    const conflictIndex = this.conflicts.findIndex((c) => c.agentId === agentId)
    if (conflictIndex === -1) {
      throw new Error('Conflict not found')
    }

    const conflict = this.conflicts[conflictIndex]

    if (resolution === 'local') {
      // Use local version - sync to remote
      await this.mockApiCall('PUT', `/api/agents/${agentId}`, conflict.localVersion)
      this.db.updateAgent(agentId, {
        remoteVersion: conflict.localVersion.localVersion,
        syncStatus: 'synced',
      })
    } else {
      // Use remote version - update local
      this.db.updateAgent(agentId, {
        ...conflict.remoteVersion,
        localVersion: conflict.remoteVersion.version,
        remoteVersion: conflict.remoteVersion.version,
        syncStatus: 'synced',
      })
    }

    // Remove from conflicts
    this.conflicts.splice(conflictIndex, 1)
  }

  /**
   * Fetch remote agent
   * 获取远程 Agent
   */
  private async fetchRemoteAgent(agentId: string): Promise<any> {
    try {
      // TODO: Implement actual API call
      // const response = await axios.get(`/api/agents/${agentId}`)
      // return response.data

      // Mock: return null (no remote version)
      return null
    } catch (error) {
      console.error('[SyncManager] Failed to fetch remote agent:', error)
      return null
    }
  }

  /**
   * Mock API call
   * 模拟 API 调用
   */
  private async mockApiCall(method: string, url: string, data?: any): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500))

    // Simulate occasional failures
    if (Math.random() < 0.1) {
      throw new Error('Network error (simulated)')
    }

    console.log(`[SyncManager] Mock API: ${method} ${url}`)
  }

  /**
   * Update sync status
   * 更新同步状态
   */
  private updateStatus(status: SyncStatus) {
    if (this.onStatusChange) {
      this.onStatusChange(status)
    }
  }

  /**
   * Set status change callback
   * 设置状态变化回调
   */
  onStatusChangeCallback(callback: (status: SyncStatus) => void) {
    this.onStatusChange = callback
  }

  /**
   * Get conflicts
   * 获取冲突列表
   */
  getConflicts(): ConflictInfo[] {
    return this.conflicts
  }

  /**
   * Configure sync
   * 配置同步
   */
  configure(config: Partial<SyncConfig>) {
    this.config = { ...this.config, ...config }

    // Restart if interval changed
    if (config.interval && this.syncTimer) {
      this.stop()
      this.start()
    }
  }

  /**
   * Get configuration
   * 获取配置
   */
  getConfig(): SyncConfig {
    return { ...this.config }
  }
}

// Types
interface SyncResult {
  success: boolean
  message: string
  synced?: number
  failed?: number
}

interface SyncStatus {
  state: 'idle' | 'syncing' | 'error'
  progress: number
  currentItem?: string
}

// Export singleton instance
let syncManagerInstance: SyncManager | null = null

export function getSyncManager(): SyncManager {
  if (!syncManagerInstance) {
    syncManagerInstance = new SyncManager()
  }
  return syncManagerInstance
}
