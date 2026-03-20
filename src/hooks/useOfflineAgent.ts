/**
 * React Hook for Offline Agent Operations
 * v2.5.0 Phase 2.1 - IndexedDB Integration
 *
 * 提供Agent离线操作的React Hook封装
 */

import { useState, useEffect, useCallback } from 'react';
import { offlineStore, OfflineAgent } from '../services/offline/offlineStore';

export interface UseOfflineAgentReturn {
  agents: OfflineAgent[];
  loading: boolean;
  error: Error | null;

  // CRUD Operations
  getAgent: (id: string) => Promise<OfflineAgent | undefined>;
  getAllAgents: () => Promise<OfflineAgent[]>;
  saveAgent: (agent: Partial<OfflineAgent>) => Promise<void>;
  updateAgent: (id: string, updates: Partial<OfflineAgent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;

  // Sync Operations
  getUnsyncedAgents: () => Promise<OfflineAgent[]>;
  markAsSynced: (id: string) => Promise<void>;

  // Refresh
  refresh: () => Promise<void>;
}

/**
 * Hook for offline Agent operations
 */
export function useOfflineAgent(): UseOfflineAgentReturn {
  const [agents, setAgents] = useState<OfflineAgent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 刷新Agent列表
   */
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allAgents = await offlineStore.getAllAgents();
      setAgents(allAgents);
    } catch (err) {
      console.error('[useOfflineAgent] Failed to refresh agents:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 初始化时加载Agent列表
   */
  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * 获取单个Agent
   */
  const getAgent = useCallback(async (id: string): Promise<OfflineAgent | undefined> => {
    try {
      return await offlineStore.getAgent(id);
    } catch (err) {
      console.error('[useOfflineAgent] Failed to get agent:', err);
      throw err;
    }
  }, []);

  /**
   * 获取所有Agents
   */
  const getAllAgents = useCallback(async (): Promise<OfflineAgent[]> => {
    try {
      return await offlineStore.getAllAgents();
    } catch (err) {
      console.error('[useOfflineAgent] Failed to get all agents:', err);
      throw err;
    }
  }, []);

  /**
   * 保存新Agent
   */
  const saveAgent = useCallback(async (agent: Partial<OfflineAgent>): Promise<void> => {
    try {
      await offlineStore.saveAgent(agent);
      await refresh();
    } catch (err) {
      console.error('[useOfflineAgent] Failed to save agent:', err);
      throw err;
    }
  }, [refresh]);

  /**
   * 更新Agent
   */
  const updateAgent = useCallback(async (
    id: string,
    updates: Partial<OfflineAgent>
  ): Promise<void> => {
    try {
      await offlineStore.updateAgent(id, updates);
      await refresh();
    } catch (err) {
      console.error('[useOfflineAgent] Failed to update agent:', err);
      throw err;
    }
  }, [refresh]);

  /**
   * 删除Agent
   */
  const deleteAgent = useCallback(async (id: string): Promise<void> => {
    try {
      await offlineStore.deleteAgent(id);
      await refresh();
    } catch (err) {
      console.error('[useOfflineAgent] Failed to delete agent:', err);
      throw err;
    }
  }, [refresh]);

  /**
   * 获取未同步的Agents
   */
  const getUnsyncedAgents = useCallback(async (): Promise<OfflineAgent[]> => {
    try {
      return await offlineStore.getUnsyncedAgents();
    } catch (err) {
      console.error('[useOfflineAgent] Failed to get unsynced agents:', err);
      throw err;
    }
  }, []);

  /**
   * 标记为已同步
   */
  const markAsSynced = useCallback(async (id: string): Promise<void> => {
    try {
      await offlineStore.markAsSynced('agents', id);
      await refresh();
    } catch (err) {
      console.error('[useOfflineAgent] Failed to mark as synced:', err);
      throw err;
    }
  }, [refresh]);

  return {
    agents,
    loading,
    error,
    getAgent,
    getAllAgents,
    saveAgent,
    updateAgent,
    deleteAgent,
    getUnsyncedAgents,
    markAsSynced,
    refresh,
  };
}

export default useOfflineAgent;
