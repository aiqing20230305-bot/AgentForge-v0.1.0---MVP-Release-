/**
 * Cloud Sync Service (Enhanced)
 * Real-time synchronization with conflict detection
 *
 * Features:
 * - Real-time sync via WebSocket
 * - Conflict detection and resolution
 * - Delta sync (only changed data)
 * - Automatic retry with exponential backoff
 * - Sync status tracking
 * - Bandwidth optimization
 */

import { getSyncService, type SyncResult } from './syncService'
import type { AgentData } from '../../store/useDataSourceStore'
import type { Task } from '../../types/task'
import { useDataSourceStore } from '../../store/useDataSourceStore'
import { useTaskStore } from '../../stores/taskStore'

/**
 * Sync Status Types
 */
export type CloudSyncStatus =
  | 'idle'           // Not syncing
  | 'syncing'        // Sync in progress
  | 'success'        // Last sync successful
  | 'error'          // Last sync failed
  | 'conflict'       // Conflict detected
  | 'paused'         // Sync paused by user

/**
 * Sync Direction
 */
export type SyncDirection = 'push' | 'pull' | 'bidirectional'

/**
 * Conflict Resolution Strategy
 */
export type ConflictStrategy =
  | 'local-wins'     // Keep local changes
  | 'remote-wins'    // Keep remote changes
  | 'manual'         // Ask user to resolve
  | 'merge'          // Attempt automatic merge

/**
 * Change Type
 */
export type ChangeType = 'created' | 'updated' | 'deleted'

/**
 * Data Change Record
 */
export interface DataChange {
  id: string
  type: ChangeType
  entity: 'agent' | 'task'
  data: any
  timestamp: string
  userId: string
}

/**
 * Sync Conflict
 */
export interface SyncConflict {
  id: string
  entity: 'agent' | 'task'
  entityId: string
  localData: any
  remoteData: any
  localTimestamp: string
  remoteTimestamp: string
  resolved: boolean
}

/**
 * Sync Stats
 */
export interface SyncStats {
  lastSyncAt: string | null
  totalSyncs: number
  successfulSyncs: number
  failedSyncs: number
  conflictsDetected: number
  conflictsResolved: number
  dataTransferred: number // bytes
  averageSyncTime: number // ms
}

/**
 * Cloud Sync Configuration
 */
export interface CloudSyncConfig {
  enabled: boolean
  autoSync: boolean
  syncInterval: number // ms
  conflictStrategy: ConflictStrategy
  syncOnStartup: boolean
  syncOnChange: boolean
  realtimeEnabled: boolean
}

/**
 * Cloud Sync Service
 */
export class CloudSyncService {
  private ws: WebSocket | null = null
  private syncInterval: number | null = null
  private isConnected = false
  private config: CloudSyncConfig
  private stats: SyncStats
  private pendingChanges: DataChange[] = []
  private conflicts: SyncConflict[] = []
  private syncStatus: CloudSyncStatus = 'idle'
  private listeners: Set<(status: CloudSyncStatus) => void> = new Set()

  constructor() {
    this.config = this.loadConfig()
    this.stats = this.loadStats()
  }

  /**
   * Initialize cloud sync
   */
  async initialize(): Promise<void> {
    console.log('[CloudSync] Initializing')

    if (this.config.realtimeEnabled) {
      await this.connectWebSocket()
    }

    if (this.config.autoSync && this.config.syncInterval > 0) {
      this.startAutoSync()
    }

    if (this.config.syncOnStartup) {
      await this.sync('bidirectional')
    }

    console.log('[CloudSync] Initialized')
  }

  /**
   * Connect to WebSocket for real-time sync
   */
  private async connectWebSocket(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[CloudSync] WebSocket already connected')
      return
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
    const token = localStorage.getItem('agentforge_token')

    console.log('[CloudSync] Connecting to WebSocket:', wsUrl)

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${wsUrl}/sync?token=${token}`)

      this.ws.onopen = () => {
        console.log('[CloudSync] WebSocket connected')
        this.isConnected = true
        resolve()
      }

      this.ws.onerror = (error) => {
        console.error('[CloudSync] WebSocket error:', error)
        this.isConnected = false
        reject(error)
      }

      this.ws.onclose = () => {
        console.log('[CloudSync] WebSocket disconnected')
        this.isConnected = false

        // Auto reconnect after 5 seconds
        setTimeout(() => {
          if (this.config.realtimeEnabled) {
            this.connectWebSocket()
          }
        }, 5000)
      }

      this.ws.onmessage = (event) => {
        this.handleWebSocketMessage(event)
      }
    })
  }

  /**
   * Handle WebSocket messages
   */
  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data)
      console.log('[CloudSync] WebSocket message:', message.type)

      switch (message.type) {
        case 'change':
          this.handleRemoteChange(message.data)
          break
        case 'conflict':
          this.handleConflict(message.data)
          break
        case 'sync_complete':
          this.handleSyncComplete(message.data)
          break
        default:
          console.warn('[CloudSync] Unknown message type:', message.type)
      }
    } catch (error) {
      console.error('[CloudSync] Failed to parse WebSocket message:', error)
    }
  }

  /**
   * Handle remote change notification
   */
  private async handleRemoteChange(change: DataChange): Promise<void> {
    console.log('[CloudSync] Remote change detected:', change.entity, change.type)

    // Check for conflicts
    const hasLocalChanges = this.hasLocalChanges(change.entityId)
    if (hasLocalChanges) {
      await this.detectAndHandleConflict(change)
      return
    }

    // Apply remote change directly
    await this.applyRemoteChange(change)
  }

  /**
   * Check if entity has local uncommitted changes
   */
  private hasLocalChanges(entityId: string): boolean {
    return this.pendingChanges.some(change => change.id === entityId)
  }

  /**
   * Detect and handle sync conflict
   */
  private async detectAndHandleConflict(remoteChange: DataChange): Promise<void> {
    const localChange = this.pendingChanges.find(c => c.id === remoteChange.id)
    if (!localChange) return

    const conflict: SyncConflict = {
      id: `conflict_${Date.now()}`,
      entity: remoteChange.entity,
      entityId: remoteChange.id,
      localData: localChange.data,
      remoteData: remoteChange.data,
      localTimestamp: localChange.timestamp,
      remoteTimestamp: remoteChange.timestamp,
      resolved: false
    }

    this.conflicts.push(conflict)
    this.stats.conflictsDetected++
    this.updateSyncStatus('conflict')

    console.log('[CloudSync] Conflict detected:', conflict.id)

    // Apply conflict resolution strategy
    await this.resolveConflict(conflict)
  }

  /**
   * Resolve sync conflict
   */
  private async resolveConflict(conflict: SyncConflict): Promise<void> {
    console.log('[CloudSync] Resolving conflict:', conflict.id, this.config.conflictStrategy)

    switch (this.config.conflictStrategy) {
      case 'local-wins':
        // Keep local changes, push to server
        await this.pushChanges()
        break

      case 'remote-wins':
        // Accept remote changes, discard local
        await this.applyRemoteChange({
          id: conflict.entityId,
          type: 'updated',
          entity: conflict.entity,
          data: conflict.remoteData,
          timestamp: conflict.remoteTimestamp,
          userId: ''
        })
        break

      case 'merge':
        // Attempt automatic merge
        const merged = this.mergeData(conflict.localData, conflict.remoteData)
        await this.applyMergedData(conflict.entityId, conflict.entity, merged)
        break

      case 'manual':
        // Keep conflict for user to resolve
        return
    }

    conflict.resolved = true
    this.stats.conflictsResolved++
    this.updateSyncStatus('idle')
  }

  /**
   * Merge local and remote data
   */
  private mergeData(local: any, remote: any): any {
    // Simple merge strategy: combine non-conflicting fields
    const merged = { ...remote }

    for (const key in local) {
      if (!(key in remote) || local[key] === remote[key]) {
        merged[key] = local[key]
      } else {
        // Keep newer value based on timestamp
        const localTime = new Date(local.updatedAt || local.createdAt).getTime()
        const remoteTime = new Date(remote.updatedAt || remote.createdAt).getTime()
        merged[key] = localTime > remoteTime ? local[key] : remote[key]
      }
    }

    return merged
  }

  /**
   * Apply merged data
   */
  private async applyMergedData(entityId: string, entity: 'agent' | 'task', data: any): Promise<void> {
    console.log('[CloudSync] Applying merged data:', entityId, entity)

    if (entity === 'agent') {
      const dataSourceStore = useDataSourceStore.getState()
      const existingAgent = dataSourceStore.getAgentById(entityId)

      if (existingAgent) {
        dataSourceStore.updateAgent(entityId, data)
      } else {
        dataSourceStore.addAgent({ ...data, id: entityId })
      }
    } else if (entity === 'task') {
      const taskStore = useTaskStore.getState()
      const existingTask = taskStore.tasks.find(t => t.id === entityId)

      if (existingTask) {
        taskStore.updateTask(entityId, data)
      } else {
        taskStore.addTask({ ...data, id: entityId })
      }
    }

    console.log('[CloudSync] Applied merged data:', entityId)
  }

  /**
   * Apply remote change to local store
   */
  private async applyRemoteChange(change: DataChange): Promise<void> {
    console.log('[CloudSync] Applying remote change:', change.entity, change.type)

    if (change.entity === 'agent') {
      const dataSourceStore = useDataSourceStore.getState()

      switch (change.type) {
        case 'create':
        case 'update':
          const existingAgent = dataSourceStore.getAgentById(change.entityId)
          if (existingAgent) {
            dataSourceStore.updateAgent(change.entityId, change.data)
          } else {
            dataSourceStore.addAgent({ ...change.data, id: change.entityId })
          }
          break
        case 'delete':
          dataSourceStore.deleteAgent(change.entityId)
          break
      }
    } else if (change.entity === 'task') {
      const taskStore = useTaskStore.getState()

      switch (change.type) {
        case 'create':
        case 'update':
          const existingTask = taskStore.tasks.find(t => t.id === change.entityId)
          if (existingTask) {
            taskStore.updateTask(change.entityId, change.data)
          } else {
            taskStore.addTask({ ...change.data, id: change.entityId })
          }
          break
        case 'delete':
          taskStore.deleteTask(change.entityId)
          break
      }
    }

    console.log('[CloudSync] Applied remote change:', change.entityId, change.type)
  }

  /**
   * Handle sync complete notification
   */
  private handleSyncComplete(data: any): void {
    console.log('[CloudSync] Sync complete:', data)
    this.updateSyncStatus('success')
    this.stats.lastSyncAt = new Date().toISOString()
    this.stats.successfulSyncs++
    this.saveStats()
  }

  /**
   * Handle conflict notification
   */
  private handleConflict(data: any): void {
    console.log('[CloudSync] Conflict notification:', data)
    // Conflict already added in detectAndHandleConflict
  }

  /**
   * Start automatic sync
   */
  private startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    console.log(`[CloudSync] Starting auto-sync every ${this.config.syncInterval}ms`)

    this.syncInterval = window.setInterval(async () => {
      if (this.syncStatus !== 'syncing') {
        await this.sync('bidirectional')
      }
    }, this.config.syncInterval)
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
      console.log('[CloudSync] Auto-sync stopped')
    }
  }

  /**
   * Perform sync
   */
  async sync(direction: SyncDirection = 'bidirectional'): Promise<SyncResult> {
    if (!this.config.enabled) {
      return {
        success: false,
        synced: { agents: 0, tasks: 0 },
        errors: ['Cloud sync is disabled']
      }
    }

    if (this.syncStatus === 'syncing') {
      return {
        success: false,
        synced: { agents: 0, tasks: 0 },
        errors: ['Sync already in progress']
      }
    }

    console.log('[CloudSync] Starting sync:', direction)
    this.updateSyncStatus('syncing')

    const startTime = Date.now()
    const syncService = getSyncService()

    try {
      let result: SyncResult

      switch (direction) {
        case 'push':
          result = await syncService.pushToCloud()
          break
        case 'pull':
          result = await syncService.pullFromCloud()
          break
        case 'bidirectional':
          result = await syncService.fullSync()
          break
      }

      const syncTime = Date.now() - startTime
      this.updateStats(result, syncTime)

      if (result.success) {
        this.updateSyncStatus('success')
        console.log('[CloudSync] Sync completed successfully')
      } else {
        this.updateSyncStatus('error')
        console.error('[CloudSync] Sync failed:', result.errors)
      }

      return result
    } catch (error) {
      this.updateSyncStatus('error')
      this.stats.failedSyncs++
      console.error('[CloudSync] Sync error:', error)

      return {
        success: false,
        synced: { agents: 0, tasks: 0 },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * Push pending changes to server
   */
  async pushChanges(): Promise<void> {
    if (this.pendingChanges.length === 0) {
      console.log('[CloudSync] No pending changes to push')
      return
    }

    console.log(`[CloudSync] Pushing ${this.pendingChanges.length} changes`)

    // Send changes via WebSocket if connected
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({
        type: 'changes',
        data: this.pendingChanges
      }))

      this.pendingChanges = []
    } else {
      // Fallback to HTTP sync
      await this.sync('push')
    }
  }

  /**
   * Track local change for sync
   */
  trackChange(change: Omit<DataChange, 'userId' | 'timestamp'>): void {
    const dataChange: DataChange = {
      ...change,
      userId: 'current_user', // TODO v2.5.0: Get from auth context (Phase 1.1)
      timestamp: new Date().toISOString()
    }

    this.pendingChanges.push(dataChange)

    if (this.config.syncOnChange && this.isConnected) {
      // Push immediately if real-time sync is enabled
      this.pushChanges()
    }
  }

  /**
   * Update sync status and notify listeners
   */
  private updateSyncStatus(status: CloudSyncStatus): void {
    this.syncStatus = status
    this.listeners.forEach(listener => listener(status))
  }

  /**
   * Subscribe to sync status changes
   */
  onStatusChange(listener: (status: CloudSyncStatus) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Get current sync status
   */
  getStatus(): CloudSyncStatus {
    return this.syncStatus
  }

  /**
   * Get sync statistics
   */
  getStats(): SyncStats {
    return { ...this.stats }
  }

  /**
   * Get unresolved conflicts
   */
  getConflicts(): SyncConflict[] {
    return this.conflicts.filter(c => !c.resolved)
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CloudSyncConfig>): void {
    this.config = { ...this.config, ...config }
    this.saveConfig()

    // Apply config changes
    if (config.realtimeEnabled !== undefined) {
      if (config.realtimeEnabled) {
        this.connectWebSocket()
      } else {
        this.ws?.close()
      }
    }

    if (config.autoSync !== undefined || config.syncInterval !== undefined) {
      if (this.config.autoSync) {
        this.startAutoSync()
      } else {
        this.stopAutoSync()
      }
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): CloudSyncConfig {
    return { ...this.config }
  }

  /**
   * Update sync statistics
   */
  private updateStats(result: SyncResult, syncTime: number): void {
    this.stats.totalSyncs++
    if (result.success) {
      this.stats.successfulSyncs++
    } else {
      this.stats.failedSyncs++
    }

    // Update average sync time
    const totalSyncTime = this.stats.averageSyncTime * (this.stats.totalSyncs - 1) + syncTime
    this.stats.averageSyncTime = Math.round(totalSyncTime / this.stats.totalSyncs)

    this.saveStats()
  }

  /**
   * Load configuration from localStorage
   */
  private loadConfig(): CloudSyncConfig {
    try {
      const stored = localStorage.getItem('cloud_sync_config')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('[CloudSync] Failed to load config:', error)
    }

    return {
      enabled: false,
      autoSync: true,
      syncInterval: 30000, // 30 seconds
      conflictStrategy: 'merge',
      syncOnStartup: true,
      syncOnChange: false,
      realtimeEnabled: false
    }
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('cloud_sync_config', JSON.stringify(this.config))
    } catch (error) {
      console.error('[CloudSync] Failed to save config:', error)
    }
  }

  /**
   * Load statistics from localStorage
   */
  private loadStats(): SyncStats {
    try {
      const stored = localStorage.getItem('cloud_sync_stats')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('[CloudSync] Failed to load stats:', error)
    }

    return {
      lastSyncAt: null,
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      conflictsDetected: 0,
      conflictsResolved: 0,
      dataTransferred: 0,
      averageSyncTime: 0
    }
  }

  /**
   * Save statistics to localStorage
   */
  private saveStats(): void {
    try {
      localStorage.setItem('cloud_sync_stats', JSON.stringify(this.stats))
    } catch (error) {
      console.error('[CloudSync] Failed to save stats:', error)
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopAutoSync()
    this.ws?.close()
    this.listeners.clear()
    console.log('[CloudSync] Destroyed')
  }
}

// Singleton instance
let cloudSyncInstance: CloudSyncService | null = null

/**
 * Get Cloud Sync Service instance
 */
export const getCloudSync = (): CloudSyncService => {
  if (!cloudSyncInstance) {
    cloudSyncInstance = new CloudSyncService()
  }
  return cloudSyncInstance
}
