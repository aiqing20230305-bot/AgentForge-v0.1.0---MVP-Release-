/**
 * IndexedDB Service
 * High-performance offline storage for Web version
 *
 * Features:
 * - Structured storage for agents, tasks, and settings
 * - Full-text search support
 * - Transaction management
 * - Automatic migrations
 * - Query optimization
 */

/**
 * Database Schema Version
 */
const DB_VERSION = 1
const DB_NAME = 'AgentForgeDB'

/**
 * Object Store Names
 */
export const STORES = {
  AGENTS: 'agents',
  TASKS: 'tasks',
  SETTINGS: 'settings',
  CACHE: 'cache',
  SYNC_QUEUE: 'sync_queue'
} as const

/**
 * IndexedDB Wrapper
 */
export class IndexedDBService {
  private db: IDBDatabase | null = null
  private isInitialized = false

  /**
   * Initialize database
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    console.log('[IndexedDB] Initializing database')

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('[IndexedDB] Failed to open database:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        this.isInitialized = true
        console.log('[IndexedDB] Database opened successfully')
        resolve()
      }

      request.onupgradeneeded = (event) => {
        console.log('[IndexedDB] Upgrading database schema')
        const db = (event.target as IDBOpenDBRequest).result
        this.createSchema(db)
      }
    })
  }

  /**
   * Create database schema
   */
  private createSchema(db: IDBDatabase): void {
    // Agents store
    if (!db.objectStoreNames.contains(STORES.AGENTS)) {
      const agentStore = db.createObjectStore(STORES.AGENTS, { keyPath: 'id' })
      agentStore.createIndex('sourceId', 'sourceId', { unique: false })
      agentStore.createIndex('level', 'level', { unique: false })
      agentStore.createIndex('status', 'status', { unique: false })
      agentStore.createIndex('name', 'name', { unique: false })
      console.log('[IndexedDB] Created agents store')
    }

    // Tasks store
    if (!db.objectStoreNames.contains(STORES.TASKS)) {
      const taskStore = db.createObjectStore(STORES.TASKS, { keyPath: 'id' })
      taskStore.createIndex('agentId', 'agentId', { unique: false })
      taskStore.createIndex('status', 'status', { unique: false })
      taskStore.createIndex('priority', 'priority', { unique: false })
      taskStore.createIndex('createdAt', 'createdAt', { unique: false })
      taskStore.createIndex('cloudId', 'cloudId', { unique: false })
      console.log('[IndexedDB] Created tasks store')
    }

    // Settings store
    if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
      db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' })
      console.log('[IndexedDB] Created settings store')
    }

    // Cache store
    if (!db.objectStoreNames.contains(STORES.CACHE)) {
      const cacheStore = db.createObjectStore(STORES.CACHE, { keyPath: 'key' })
      cacheStore.createIndex('expiry', 'expiry', { unique: false })
      console.log('[IndexedDB] Created cache store')
    }

    // Sync queue store
    if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
      const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' })
      syncStore.createIndex('timestamp', 'timestamp', { unique: false })
      syncStore.createIndex('entity', 'entity', { unique: false })
      console.log('[IndexedDB] Created sync queue store')
    }
  }

  /**
   * Get object store
   */
  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    const transaction = this.db.transaction(storeName, mode)
    return transaction.objectStore(storeName)
  }

  /**
   * Add item to store
   */
  async add<T>(storeName: string, item: T): Promise<void> {
    await this.initialize()

    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite')
      const request = store.add(item)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Put (add or update) item in store
   */
  async put<T>(storeName: string, item: T): Promise<void> {
    await this.initialize()

    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite')
      const request = store.put(item)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get item from store by key
   */
  async get<T>(storeName: string, key: string | number): Promise<T | undefined> {
    await this.initialize()

    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get all items from store
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    await this.initialize()

    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get items by index
   */
  async getByIndex<T>(
    storeName: string,
    indexName: string,
    value: any
  ): Promise<T[]> {
    await this.initialize()

    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(value)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Query items with filter
   */
  async query<T>(
    storeName: string,
    filter: (item: T) => boolean
  ): Promise<T[]> {
    await this.initialize()

    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName)
      const request = store.openCursor()
      const results: T[] = []

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          const item = cursor.value as T
          if (filter(item)) {
            results.push(item)
          }
          cursor.continue()
        } else {
          resolve(results)
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Delete item from store
   */
  async delete(storeName: string, key: string | number): Promise<void> {
    await this.initialize()

    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite')
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Clear all items from store
   */
  async clear(storeName: string): Promise<void> {
    await this.initialize()

    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite')
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Count items in store
   */
  async count(storeName: string): Promise<number> {
    await this.initialize()

    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName)
      const request = store.count()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Batch operations
   */
  async batch<T>(
    storeName: string,
    operations: Array<{ type: 'add' | 'put' | 'delete'; key?: string | number; item?: T }>
  ): Promise<void> {
    await this.initialize()

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)

      operations.forEach(op => {
        switch (op.type) {
          case 'add':
            if (op.item) store.add(op.item)
            break
          case 'put':
            if (op.item) store.put(op.item)
            break
          case 'delete':
            if (op.key) store.delete(op.key)
            break
        }
      })
    })
  }

  /**
   * Export database to JSON
   */
  async exportToJSON(): Promise<Record<string, any[]>> {
    await this.initialize()

    const data: Record<string, any[]> = {}

    for (const storeName of Object.values(STORES)) {
      data[storeName] = await this.getAll(storeName)
    }

    return data
  }

  /**
   * Import database from JSON
   */
  async importFromJSON(data: Record<string, any[]>): Promise<void> {
    await this.initialize()

    for (const [storeName, items] of Object.entries(data)) {
      if (Object.values(STORES).includes(storeName as any)) {
        await this.clear(storeName)

        const operations = items.map(item => ({
          type: 'put' as const,
          item
        }))

        await this.batch(storeName, operations)
      }
    }

    console.log('[IndexedDB] Import completed')
  }

  /**
   * Get database size estimate
   */
  async getSize(): Promise<{ usage: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0
      }
    }

    return { usage: 0, quota: 0 }
  }

  /**
   * Clean expired cache entries
   */
  async cleanExpiredCache(): Promise<number> {
    await this.initialize()

    const now = Date.now()
    const store = this.getStore(STORES.CACHE, 'readwrite')
    const index = store.index('expiry')
    const request = index.openCursor(IDBKeyRange.upperBound(now))

    let deletedCount = 0

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          deletedCount++
          cursor.continue()
        } else {
          console.log(`[IndexedDB] Cleaned ${deletedCount} expired cache entries`)
          resolve(deletedCount)
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Set cache item with expiry
   */
  async setCache(key: string, value: any, ttlMs: number): Promise<void> {
    await this.initialize()

    const item = {
      key,
      value,
      expiry: Date.now() + ttlMs,
      createdAt: Date.now()
    }

    await this.put(STORES.CACHE, item)
  }

  /**
   * Get cache item
   */
  async getCache<T>(key: string): Promise<T | null> {
    await this.initialize()

    const item = await this.get<any>(STORES.CACHE, key)

    if (!item) {
      return null
    }

    if (item.expiry < Date.now()) {
      await this.delete(STORES.CACHE, key)
      return null
    }

    return item.value
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      this.isInitialized = false
      console.log('[IndexedDB] Database closed')
    }
  }

  /**
   * Delete database
   */
  static async deleteDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME)

      request.onsuccess = () => {
        console.log('[IndexedDB] Database deleted')
        resolve()
      }

      request.onerror = () => {
        console.error('[IndexedDB] Failed to delete database:', request.error)
        reject(request.error)
      }
    })
  }
}

// Singleton instance
let dbInstance: IndexedDBService | null = null

/**
 * Get IndexedDB Service instance
 */
export const getIndexedDB = (): IndexedDBService => {
  if (!dbInstance) {
    dbInstance = new IndexedDBService()
  }
  return dbInstance
}

/**
 * Initialize IndexedDB on module load
 */
if (typeof window !== 'undefined' && 'indexedDB' in window) {
  getIndexedDB().initialize().catch(error => {
    console.error('[IndexedDB] Auto-initialization failed:', error)
  })
}
