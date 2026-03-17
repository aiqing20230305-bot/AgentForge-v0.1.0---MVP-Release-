/**
 * OpenClaw Auto Sync Service
 *
 * 自动同步OpenClaw Agent数据到Store
 * - 定期拉取Agent列表
 * - 更新Store中的agentsCache
 * - 处理增量更新
 */

import { getOpenClawWSClient } from './openclawWebSocket'
import { mergeOpenClawAgents } from '../adapters/openclawWSAdapter'
import { useDataSourceStore } from '../store/useDataSourceStore'

interface SyncStatus {
  enabled: boolean
  lastSyncTime: string | null
  syncInterval: number // 毫秒
  errorCount: number
  lastError: string | null
}

class OpenClawAutoSyncService {
  private syncIntervalId: NodeJS.Timeout | null = null
  private status: SyncStatus = {
    enabled: false,
    lastSyncTime: null,
    syncInterval: 5000, // 默认5秒
    errorCount: 0,
    lastError: null,
  }
  private listeners: Set<(status: SyncStatus) => void> = new Set()

  /**
   * 开始自动同步
   */
  start(intervalMs: number = 5000) {
    if (this.syncIntervalId) {
      console.log('[AutoSync] Already running')
      return
    }

    console.log(`[AutoSync] 🔄 Starting auto-sync (interval: ${intervalMs}ms)`)

    this.status.enabled = true
    this.status.syncInterval = intervalMs
    this.notifyListeners()

    // 立即执行一次同步
    this.syncNow()

    // 设置定时同步
    this.syncIntervalId = setInterval(() => {
      this.syncNow()
    }, intervalMs)
  }

  /**
   * 停止自动同步
   */
  stop() {
    if (!this.syncIntervalId) {
      console.log('[AutoSync] Not running')
      return
    }

    console.log('[AutoSync] 🛑 Stopping auto-sync')

    clearInterval(this.syncIntervalId)
    this.syncIntervalId = null
    this.status.enabled = false
    this.notifyListeners()
  }

  /**
   * 立即同步一次
   */
  async syncNow(): Promise<boolean> {
    try {
      console.log('[AutoSync] 🔄 Syncing...')

      const client = getOpenClawWSClient()

      // 检查连接状态
      if (!client.isConnected()) {
        throw new Error('OpenClaw not connected')
      }

      // 获取OpenClaw Agents
      const openclawAgents = await client.getAgents()
      console.log(`[AutoSync] Fetched ${openclawAgents.length} agents`)

      // 获取当前Store中的Agents
      const dataSourceStore = useDataSourceStore.getState()
      const currentAgents = dataSourceStore.agentsCache

      // 获取OpenClaw数据源信息
      const openclawSource = dataSourceStore.sources.find(s => s.type === 'openclaw')
      const sourceId = openclawSource?.id || 'openclaw-default'
      const sourceName = openclawSource?.name || 'OpenClaw Gateway'

      // 智能合并（保留本地数据，更新状态）
      const mergedAgents = mergeOpenClawAgents(currentAgents, openclawAgents, sourceId, sourceName)

      // 更新Store
      dataSourceStore.updateAgentsCache(mergedAgents)

      // 更新状态
      this.status.lastSyncTime = new Date().toISOString()
      this.status.errorCount = 0
      this.status.lastError = null
      this.notifyListeners()

      console.log('[AutoSync] ✅ Sync complete')
      return true
    } catch (error) {
      console.error('[AutoSync] ❌ Sync failed:', error)

      this.status.errorCount++
      this.status.lastError = String(error)
      this.notifyListeners()

      // 如果连续失败3次，停止自动同步
      if (this.status.errorCount >= 3) {
        console.error('[AutoSync] Too many errors, stopping auto-sync')
        this.stop()
      }

      return false
    }
  }

  /**
   * 获取同步状态
   */
  getStatus(): SyncStatus {
    return { ...this.status }
  }

  /**
   * 监听状态变化
   */
  onStatusChange(callback: (status: SyncStatus) => void) {
    this.listeners.add(callback)
    // 立即调用一次
    callback(this.getStatus())
  }

  /**
   * 移除监听器
   */
  offStatusChange(callback: (status: SyncStatus) => void) {
    this.listeners.delete(callback)
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners() {
    const status = this.getStatus()
    this.listeners.forEach(listener => listener(status))
  }

  /**
   * 设置同步间隔
   */
  setInterval(intervalMs: number) {
    if (this.status.enabled) {
      // 重新启动以应用新间隔
      this.stop()
      this.start(intervalMs)
    } else {
      this.status.syncInterval = intervalMs
    }
  }

  /**
   * 是否正在同步
   */
  isEnabled(): boolean {
    return this.status.enabled
  }
}

// 单例实例
let instance: OpenClawAutoSyncService | null = null

/**
 * 获取Auto Sync Service实例
 */
export function getAutoSyncService(): OpenClawAutoSyncService {
  if (!instance) {
    instance = new OpenClawAutoSyncService()
  }
  return instance
}

/**
 * 暴露到window对象供调试使用
 */
if (typeof window !== 'undefined') {
  ;(window as any).autoSync = {
    start: () => getAutoSyncService().start(),
    stop: () => getAutoSyncService().stop(),
    syncNow: () => getAutoSyncService().syncNow(),
    getStatus: () => getAutoSyncService().getStatus(),
  }

  console.log('[AutoSync] Debug utilities available:')
  console.log('  - window.autoSync.start() - Start auto-sync')
  console.log('  - window.autoSync.stop() - Stop auto-sync')
  console.log('  - window.autoSync.syncNow() - Sync immediately')
  console.log('  - window.autoSync.getStatus() - Get sync status')
}
