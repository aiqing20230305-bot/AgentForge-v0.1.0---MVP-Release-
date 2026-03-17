/**
 * Local Database Service
 * 本地数据库服务 - 使用 SQLite 实现离线存储
 */

import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'

export interface Agent {
  id: string
  name: string
  description: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
  syncStatus: 'synced' | 'pending' | 'conflict'
  localVersion: number
  remoteVersion?: number
}

export interface SyncQueue {
  id: string
  agentId: string
  action: 'create' | 'update' | 'delete'
  data: string
  createdAt: string
  retryCount: number
  lastError?: string
}

export class LocalDatabase {
  private db: Database.Database
  private dbPath: string

  constructor() {
    // Get user data path
    const userDataPath = app.getPath('userData')
    this.dbPath = path.join(userDataPath, 'agentforge.db')

    // Initialize database
    this.db = new Database(this.dbPath)
    this.db.pragma('journal_mode = WAL') // Write-Ahead Logging for better performance
    this.db.pragma('foreign_keys = ON')

    this.initialize()
  }

  /**
   * Initialize database schema
   * 初始化数据库模式
   */
  private initialize() {
    // Create agents table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        tags TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        local_version INTEGER NOT NULL DEFAULT 1,
        remote_version INTEGER,
        deleted INTEGER NOT NULL DEFAULT 0
      )
    `)

    // Create sync queue table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        action TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        retry_count INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
      )
    `)

    // Create settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_agents_sync_status ON agents(sync_status);
      CREATE INDEX IF NOT EXISTS idx_agents_updated_at ON agents(updated_at);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_created_at ON sync_queue(created_at);
    `)

    console.log('[LocalDatabase] Database initialized at:', this.dbPath)
  }

  // ==================== Agent Operations ====================

  /**
   * Create agent
   * 创建 Agent
   */
  createAgent(agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Agent {
    const id = this.generateId()
    const now = new Date().toISOString()

    const newAgent: Agent = {
      id,
      ...agent,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
      localVersion: 1,
    }

    const stmt = this.db.prepare(`
      INSERT INTO agents (id, name, description, content, tags, created_at, updated_at, sync_status, local_version)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      newAgent.id,
      newAgent.name,
      newAgent.description || '',
      newAgent.content,
      JSON.stringify(newAgent.tags),
      newAgent.createdAt,
      newAgent.updatedAt,
      newAgent.syncStatus,
      newAgent.localVersion
    )

    // Add to sync queue
    this.addToSyncQueue(newAgent.id, 'create', newAgent)

    return newAgent
  }

  /**
   * Get agent by ID
   * 根据 ID 获取 Agent
   */
  getAgent(id: string): Agent | null {
    const stmt = this.db.prepare(`
      SELECT * FROM agents WHERE id = ? AND deleted = 0
    `)

    const row = stmt.get(id) as any
    return row ? this.rowToAgent(row) : null
  }

  /**
   * Get all agents
   * 获取所有 Agents
   */
  getAllAgents(): Agent[] {
    const stmt = this.db.prepare(`
      SELECT * FROM agents WHERE deleted = 0 ORDER BY updated_at DESC
    `)

    const rows = stmt.all() as any[]
    return rows.map((row) => this.rowToAgent(row))
  }

  /**
   * Update agent
   * 更新 Agent
   */
  updateAgent(id: string, updates: Partial<Agent>): Agent | null {
    const existing = this.getAgent(id)
    if (!existing) return null

    const now = new Date().toISOString()
    const updatedAgent: Agent = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: now,
      localVersion: existing.localVersion + 1,
      syncStatus: 'pending',
    }

    const stmt = this.db.prepare(`
      UPDATE agents
      SET name = ?, description = ?, content = ?, tags = ?,
          updated_at = ?, sync_status = ?, local_version = ?
      WHERE id = ?
    `)

    stmt.run(
      updatedAgent.name,
      updatedAgent.description || '',
      updatedAgent.content,
      JSON.stringify(updatedAgent.tags),
      updatedAgent.updatedAt,
      updatedAgent.syncStatus,
      updatedAgent.localVersion,
      id
    )

    // Add to sync queue
    this.addToSyncQueue(id, 'update', updatedAgent)

    return updatedAgent
  }

  /**
   * Delete agent (soft delete)
   * 删除 Agent（软删除）
   */
  deleteAgent(id: string): boolean {
    const stmt = this.db.prepare(`
      UPDATE agents SET deleted = 1, updated_at = ?, sync_status = 'pending'
      WHERE id = ?
    `)

    const result = stmt.run(new Date().toISOString(), id)

    if (result.changes > 0) {
      // Add to sync queue
      this.addToSyncQueue(id, 'delete', { id })
      return true
    }

    return false
  }

  /**
   * Search agents
   * 搜索 Agents
   */
  searchAgents(query: string): Agent[] {
    const stmt = this.db.prepare(`
      SELECT * FROM agents
      WHERE deleted = 0
        AND (name LIKE ? OR description LIKE ? OR content LIKE ?)
      ORDER BY updated_at DESC
    `)

    const searchPattern = `%${query}%`
    const rows = stmt.all(searchPattern, searchPattern, searchPattern) as any[]
    return rows.map((row) => this.rowToAgent(row))
  }

  /**
   * Get agents by sync status
   * 根据同步状态获取 Agents
   */
  getAgentsBySyncStatus(status: Agent['syncStatus']): Agent[] {
    const stmt = this.db.prepare(`
      SELECT * FROM agents WHERE sync_status = ? AND deleted = 0
    `)

    const rows = stmt.all(status) as any[]
    return rows.map((row) => this.rowToAgent(row))
  }

  // ==================== Sync Queue Operations ====================

  /**
   * Add to sync queue
   * 添加到同步队列
   */
  private addToSyncQueue(
    agentId: string,
    action: SyncQueue['action'],
    data: any
  ): void {
    const stmt = this.db.prepare(`
      INSERT INTO sync_queue (id, agent_id, action, data, created_at, retry_count)
      VALUES (?, ?, ?, ?, ?, 0)
    `)

    stmt.run(this.generateId(), agentId, action, JSON.stringify(data), new Date().toISOString())
  }

  /**
   * Get sync queue
   * 获取同步队列
   */
  getSyncQueue(): SyncQueue[] {
    const stmt = this.db.prepare(`
      SELECT * FROM sync_queue ORDER BY created_at ASC
    `)

    const rows = stmt.all() as any[]
    return rows.map((row) => ({
      id: row.id,
      agentId: row.agent_id,
      action: row.action,
      data: row.data,
      createdAt: row.created_at,
      retryCount: row.retry_count,
      lastError: row.last_error || undefined,
    }))
  }

  /**
   * Remove from sync queue
   * 从同步队列移除
   */
  removeFromSyncQueue(id: string): void {
    const stmt = this.db.prepare(`DELETE FROM sync_queue WHERE id = ?`)
    stmt.run(id)
  }

  /**
   * Update sync queue retry
   * 更新同步队列重试信息
   */
  updateSyncQueueRetry(id: string, error: string): void {
    const stmt = this.db.prepare(`
      UPDATE sync_queue
      SET retry_count = retry_count + 1, last_error = ?
      WHERE id = ?
    `)
    stmt.run(error, id)
  }

  /**
   * Clear sync queue
   * 清空同步队列
   */
  clearSyncQueue(): void {
    this.db.exec('DELETE FROM sync_queue')
  }

  // ==================== Settings Operations ====================

  /**
   * Get setting
   * 获取设置
   */
  getSetting(key: string): string | null {
    const stmt = this.db.prepare(`SELECT value FROM settings WHERE key = ?`)
    const row = stmt.get(key) as any
    return row ? row.value : null
  }

  /**
   * Set setting
   * 设置配置
   */
  setSetting(key: string, value: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?
    `)

    const now = new Date().toISOString()
    stmt.run(key, value, now, value, now)
  }

  // ==================== Utility Methods ====================

  /**
   * Convert database row to Agent
   * 转换数据库行为 Agent 对象
   */
  private rowToAgent(row: any): Agent {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      content: row.content,
      tags: JSON.parse(row.tags || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      syncStatus: row.sync_status,
      localVersion: row.local_version,
      remoteVersion: row.remote_version || undefined,
    }
  }

  /**
   * Generate unique ID
   * 生成唯一 ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get database stats
   * 获取数据库统计信息
   */
  getStats() {
    const agentCount = this.db.prepare('SELECT COUNT(*) as count FROM agents WHERE deleted = 0').get() as any
    const syncPending = this.db.prepare('SELECT COUNT(*) as count FROM agents WHERE sync_status = ?').get('pending') as any
    const queueSize = this.db.prepare('SELECT COUNT(*) as count FROM sync_queue').get() as any

    return {
      totalAgents: agentCount.count,
      pendingSync: syncPending.count,
      queueSize: queueSize.count,
      dbPath: this.dbPath,
    }
  }

  /**
   * Vacuum database (optimize storage)
   * 整理数据库（优化存储）
   */
  vacuum(): void {
    this.db.exec('VACUUM')
    console.log('[LocalDatabase] Database vacuumed')
  }

  /**
   * Close database
   * 关闭数据库
   */
  close(): void {
    this.db.close()
    console.log('[LocalDatabase] Database closed')
  }
}

// Export singleton instance
let dbInstance: LocalDatabase | null = null

export function getDatabase(): LocalDatabase {
  if (!dbInstance) {
    dbInstance = new LocalDatabase()
  }
  return dbInstance
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}
