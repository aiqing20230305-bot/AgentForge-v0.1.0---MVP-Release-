/**
 * Offline Data Storage Service
 * v2.5.0 Phase 2.1 - IndexedDB Implementation
 *
 * 提供完整的离线数据存储功能，支持Agent、Task等数据的本地缓存
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// 数据库版本
const DB_VERSION = 1;
const DB_NAME = 'AgentForgeOfflineDB';

/**
 * 数据库Schema定义
 */
interface AgentForgeDB extends DBSchema {
  agents: {
    key: string;
    value: OfflineAgent;
    indexes: {
      'by-status': string;
      'by-sync': boolean;
      'by-timestamp': number;
    };
  };
  tasks: {
    key: string;
    value: OfflineTask;
    indexes: {
      'by-agent': string;
      'by-status': string;
      'by-sync': boolean;
      'by-timestamp': number;
    };
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: {
      'by-timestamp': number;
      'by-type': string;
    };
  };
  metadata: {
    key: string;
    value: any;
  };
}

/**
 * 离线Agent数据结构
 */
export interface OfflineAgent {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'paused';
  level: number;
  experience: number;

  // 离线标记
  _offline: boolean;
  _synced: boolean;
  _timestamp: number;
  _version: number;

  // 原始数据
  originalData?: any;
}

/**
 * 离线Task数据结构
 */
export interface OfflineTask {
  id: string;
  agentId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';

  // 离线标记
  _offline: boolean;
  _synced: boolean;
  _timestamp: number;
  _version: number;

  // 原始数据
  originalData?: any;
}

/**
 * 同步队列项
 */
export interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: 'agents' | 'tasks';
  data: any;
  timestamp: number;
  retries: number;
}

/**
 * 离线存储服务类
 */
export class OfflineStore {
  private db: IDBPDatabase<AgentForgeDB> | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * 初始化数据库
   */
  async init(): Promise<void> {
    if (this.db) return;

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.initializeDB();
    return this.initPromise;
  }

  private async initializeDB(): Promise<void> {
    try {
      this.db = await openDB<AgentForgeDB>(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion, transaction) {
          console.log(`[OfflineStore] Upgrading DB from v${oldVersion} to v${newVersion}`);

          // 创建agents存储
          if (!db.objectStoreNames.contains('agents')) {
            const agentStore = db.createObjectStore('agents', { keyPath: 'id' });
            agentStore.createIndex('by-status', 'status');
            agentStore.createIndex('by-sync', '_synced');
            agentStore.createIndex('by-timestamp', '_timestamp');
            console.log('[OfflineStore] Created agents store');
          }

          // 创建tasks存储
          if (!db.objectStoreNames.contains('tasks')) {
            const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
            taskStore.createIndex('by-agent', 'agentId');
            taskStore.createIndex('by-status', 'status');
            taskStore.createIndex('by-sync', '_synced');
            taskStore.createIndex('by-timestamp', '_timestamp');
            console.log('[OfflineStore] Created tasks store');
          }

          // 创建同步队列
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
            syncStore.createIndex('by-timestamp', 'timestamp');
            syncStore.createIndex('by-type', 'type');
            console.log('[OfflineStore] Created syncQueue store');
          }

          // 创建元数据存储
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', { keyPath: 'key' });
            console.log('[OfflineStore] Created metadata store');
          }
        },
      });

      console.log('[OfflineStore] Database initialized successfully');

      // 设置最后打开时间
      await this.setMetadata('lastOpened', Date.now());
    } catch (error) {
      console.error('[OfflineStore] Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * 确保数据库已初始化
   */
  private async ensureDB(): Promise<IDBPDatabase<AgentForgeDB>> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  // ==========================================
  // Agent操作
  // ==========================================

  /**
   * 保存Agent到离线存储
   */
  async saveAgent(agent: Partial<OfflineAgent>): Promise<void> {
    const db = await this.ensureDB();

    const offlineAgent: OfflineAgent = {
      id: agent.id || this.generateId(),
      name: agent.name || 'Unnamed Agent',
      description: agent.description,
      status: agent.status || 'active',
      level: agent.level || 1,
      experience: agent.experience || 0,

      _offline: true,
      _synced: false,
      _timestamp: Date.now(),
      _version: 1,

      originalData: agent,
    };

    await db.put('agents', offlineAgent);
    console.log('[OfflineStore] Saved agent:', offlineAgent.id);

    // 添加到同步队列
    await this.addToSyncQueue('create', 'agents', offlineAgent);
  }

  /**
   * 获取Agent
   */
  async getAgent(id: string): Promise<OfflineAgent | undefined> {
    const db = await this.ensureDB();
    return db.get('agents', id);
  }

  /**
   * 获取所有Agents
   */
  async getAllAgents(): Promise<OfflineAgent[]> {
    const db = await this.ensureDB();
    return db.getAll('agents');
  }

  /**
   * 获取未同步的Agents
   */
  async getUnsyncedAgents(): Promise<OfflineAgent[]> {
    const db = await this.ensureDB();
    return db.getAllFromIndex('agents', 'by-sync', false);
  }

  /**
   * 更新Agent
   */
  async updateAgent(id: string, updates: Partial<OfflineAgent>): Promise<void> {
    const db = await this.ensureDB();
    const agent = await db.get('agents', id);

    if (!agent) {
      throw new Error(`Agent ${id} not found`);
    }

    const updatedAgent: OfflineAgent = {
      ...agent,
      ...updates,
      _synced: false,
      _timestamp: Date.now(),
      _version: agent._version + 1,
    };

    await db.put('agents', updatedAgent);
    console.log('[OfflineStore] Updated agent:', id);

    // 添加到同步队列
    await this.addToSyncQueue('update', 'agents', updatedAgent);
  }

  /**
   * 删除Agent
   */
  async deleteAgent(id: string): Promise<void> {
    const db = await this.ensureDB();
    const agent = await db.get('agents', id);

    if (agent) {
      await this.addToSyncQueue('delete', 'agents', { id });
    }

    await db.delete('agents', id);
    console.log('[OfflineStore] Deleted agent:', id);
  }

  // ==========================================
  // Task操作
  // ==========================================

  /**
   * 保存Task到离线存储
   */
  async saveTask(task: Partial<OfflineTask>): Promise<void> {
    const db = await this.ensureDB();

    const offlineTask: OfflineTask = {
      id: task.id || this.generateId(),
      agentId: task.agentId || '',
      title: task.title || 'Unnamed Task',
      description: task.description,
      status: task.status || 'pending',
      priority: task.priority || 'medium',

      _offline: true,
      _synced: false,
      _timestamp: Date.now(),
      _version: 1,

      originalData: task,
    };

    await db.put('tasks', offlineTask);
    console.log('[OfflineStore] Saved task:', offlineTask.id);

    await this.addToSyncQueue('create', 'tasks', offlineTask);
  }

  /**
   * 获取Task
   */
  async getTask(id: string): Promise<OfflineTask | undefined> {
    const db = await this.ensureDB();
    return db.get('tasks', id);
  }

  /**
   * 获取所有Tasks
   */
  async getAllTasks(): Promise<OfflineTask[]> {
    const db = await this.ensureDB();
    return db.getAll('tasks');
  }

  /**
   * 获取特定Agent的Tasks
   */
  async getTasksByAgent(agentId: string): Promise<OfflineTask[]> {
    const db = await this.ensureDB();
    return db.getAllFromIndex('tasks', 'by-agent', agentId);
  }

  /**
   * 获取未同步的Tasks
   */
  async getUnsyncedTasks(): Promise<OfflineTask[]> {
    const db = await this.ensureDB();
    return db.getAllFromIndex('tasks', 'by-sync', false);
  }

  /**
   * 更新Task
   */
  async updateTask(id: string, updates: Partial<OfflineTask>): Promise<void> {
    const db = await this.ensureDB();
    const task = await db.get('tasks', id);

    if (!task) {
      throw new Error(`Task ${id} not found`);
    }

    const updatedTask: OfflineTask = {
      ...task,
      ...updates,
      _synced: false,
      _timestamp: Date.now(),
      _version: task._version + 1,
    };

    await db.put('tasks', updatedTask);
    console.log('[OfflineStore] Updated task:', id);

    await this.addToSyncQueue('update', 'tasks', updatedTask);
  }

  /**
   * 删除Task
   */
  async deleteTask(id: string): Promise<void> {
    const db = await this.ensureDB();
    const task = await db.get('tasks', id);

    if (task) {
      await this.addToSyncQueue('delete', 'tasks', { id });
    }

    await db.delete('tasks', id);
    console.log('[OfflineStore] Deleted task:', id);
  }

  // ==========================================
  // 同步队列操作
  // ==========================================

  /**
   * 添加到同步队列
   */
  private async addToSyncQueue(
    type: SyncQueueItem['type'],
    collection: SyncQueueItem['collection'],
    data: any
  ): Promise<void> {
    const db = await this.ensureDB();

    const queueItem: SyncQueueItem = {
      id: this.generateId(),
      type,
      collection,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    await db.put('syncQueue', queueItem);
    console.log('[OfflineStore] Added to sync queue:', type, collection);
  }

  /**
   * 获取同步队列
   */
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const db = await this.ensureDB();
    return db.getAll('syncQueue');
  }

  /**
   * 清除同步队列项
   */
  async clearSyncQueueItem(id: string): Promise<void> {
    const db = await this.ensureDB();
    await db.delete('syncQueue', id);
  }

  /**
   * 清空同步队列
   */
  async clearSyncQueue(): Promise<void> {
    const db = await this.ensureDB();
    const items = await db.getAll('syncQueue');

    for (const item of items) {
      await db.delete('syncQueue', item.id);
    }

    console.log('[OfflineStore] Cleared sync queue');
  }

  // ==========================================
  // 元数据操作
  // ==========================================

  /**
   * 设置元数据
   */
  async setMetadata(key: string, value: any): Promise<void> {
    const db = await this.ensureDB();
    await db.put('metadata', { key, value });
  }

  /**
   * 获取元数据
   */
  async getMetadata(key: string): Promise<any> {
    const db = await this.ensureDB();
    const record = await db.get('metadata', key);
    return record?.value;
  }

  // ==========================================
  // 工具方法
  // ==========================================

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 标记为已同步
   */
  async markAsSynced(collection: 'agents' | 'tasks', id: string): Promise<void> {
    const db = await this.ensureDB();

    const item = await db.get(collection, id);
    if (item) {
      item._synced = true;
      item._timestamp = Date.now();
      await db.put(collection, item);
    }
  }

  /**
   * 获取存储统计信息
   */
  async getStats(): Promise<{
    agents: number;
    tasks: number;
    unsyncedAgents: number;
    unsyncedTasks: number;
    syncQueueSize: number;
  }> {
    const db = await this.ensureDB();

    const [
      agents,
      tasks,
      unsyncedAgents,
      unsyncedTasks,
      syncQueue,
    ] = await Promise.all([
      db.count('agents'),
      db.count('tasks'),
      db.countFromIndex('agents', 'by-sync', false),
      db.countFromIndex('tasks', 'by-sync', false),
      db.count('syncQueue'),
    ]);

    return {
      agents,
      tasks,
      unsyncedAgents,
      unsyncedTasks,
      syncQueueSize: syncQueue,
    };
  }

  /**
   * 清空所有数据
   */
  async clearAll(): Promise<void> {
    const db = await this.ensureDB();

    await Promise.all([
      db.clear('agents'),
      db.clear('tasks'),
      db.clear('syncQueue'),
    ]);

    console.log('[OfflineStore] Cleared all data');
  }

  /**
   * 关闭数据库
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
      console.log('[OfflineStore] Database closed');
    }
  }
}

// 导出单例
export const offlineStore = new OfflineStore();

// 自动初始化
if (typeof window !== 'undefined') {
  offlineStore.init().catch(console.error);
}

export default offlineStore;
