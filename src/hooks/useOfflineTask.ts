/**
 * React Hook for Offline Task Operations
 * v2.5.0 Phase 2.1 - IndexedDB Integration
 *
 * 提供Task离线操作的React Hook封装
 */

import { useState, useEffect, useCallback } from 'react';
import { offlineStore, OfflineTask } from '../services/offline/offlineStore';

export interface UseOfflineTaskReturn {
  tasks: OfflineTask[];
  loading: boolean;
  error: Error | null;

  // CRUD Operations
  getTask: (id: string) => Promise<OfflineTask | undefined>;
  getAllTasks: () => Promise<OfflineTask[]>;
  getTasksByAgent: (agentId: string) => Promise<OfflineTask[]>;
  saveTask: (task: Partial<OfflineTask>) => Promise<void>;
  updateTask: (id: string, updates: Partial<OfflineTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Sync Operations
  getUnsyncedTasks: () => Promise<OfflineTask[]>;
  markAsSynced: (id: string) => Promise<void>;

  // Refresh
  refresh: () => Promise<void>;
}

/**
 * Hook for offline Task operations
 */
export function useOfflineTask(agentId?: string): UseOfflineTaskReturn {
  const [tasks, setTasks] = useState<OfflineTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 刷新Task列表
   */
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let allTasks: OfflineTask[];
      if (agentId) {
        allTasks = await offlineStore.getTasksByAgent(agentId);
      } else {
        allTasks = await offlineStore.getAllTasks();
      }

      setTasks(allTasks);
    } catch (err) {
      console.error('[useOfflineTask] Failed to refresh tasks:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  /**
   * 初始化时加载Task列表
   */
  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * 获取单个Task
   */
  const getTask = useCallback(async (id: string): Promise<OfflineTask | undefined> => {
    try {
      return await offlineStore.getTask(id);
    } catch (err) {
      console.error('[useOfflineTask] Failed to get task:', err);
      throw err;
    }
  }, []);

  /**
   * 获取所有Tasks
   */
  const getAllTasks = useCallback(async (): Promise<OfflineTask[]> => {
    try {
      return await offlineStore.getAllTasks();
    } catch (err) {
      console.error('[useOfflineTask] Failed to get all tasks:', err);
      throw err;
    }
  }, []);

  /**
   * 获取特定Agent的Tasks
   */
  const getTasksByAgent = useCallback(async (agentId: string): Promise<OfflineTask[]> => {
    try {
      return await offlineStore.getTasksByAgent(agentId);
    } catch (err) {
      console.error('[useOfflineTask] Failed to get tasks by agent:', err);
      throw err;
    }
  }, []);

  /**
   * 保存新Task
   */
  const saveTask = useCallback(async (task: Partial<OfflineTask>): Promise<void> => {
    try {
      await offlineStore.saveTask(task);
      await refresh();
    } catch (err) {
      console.error('[useOfflineTask] Failed to save task:', err);
      throw err;
    }
  }, [refresh]);

  /**
   * 更新Task
   */
  const updateTask = useCallback(async (
    id: string,
    updates: Partial<OfflineTask>
  ): Promise<void> => {
    try {
      await offlineStore.updateTask(id, updates);
      await refresh();
    } catch (err) {
      console.error('[useOfflineTask] Failed to update task:', err);
      throw err;
    }
  }, [refresh]);

  /**
   * 删除Task
   */
  const deleteTask = useCallback(async (id: string): Promise<void> => {
    try {
      await offlineStore.deleteTask(id);
      await refresh();
    } catch (err) {
      console.error('[useOfflineTask] Failed to delete task:', err);
      throw err;
    }
  }, [refresh]);

  /**
   * 获取未同步的Tasks
   */
  const getUnsyncedTasks = useCallback(async (): Promise<OfflineTask[]> => {
    try {
      return await offlineStore.getUnsyncedTasks();
    } catch (err) {
      console.error('[useOfflineTask] Failed to get unsynced tasks:', err);
      throw err;
    }
  }, []);

  /**
   * 标记为已同步
   */
  const markAsSynced = useCallback(async (id: string): Promise<void> => {
    try {
      await offlineStore.markAsSynced('tasks', id);
      await refresh();
    } catch (err) {
      console.error('[useOfflineTask] Failed to mark as synced:', err);
      throw err;
    }
  }, [refresh]);

  return {
    tasks,
    loading,
    error,
    getTask,
    getAllTasks,
    getTasksByAgent,
    saveTask,
    updateTask,
    deleteTask,
    getUnsyncedTasks,
    markAsSynced,
    refresh,
  };
}

export default useOfflineTask;
