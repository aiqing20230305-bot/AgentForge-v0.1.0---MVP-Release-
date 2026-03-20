/**
 * React Hook for Conflict Resolution
 * v2.5.0 Phase 2.2 - Conflict Resolution
 *
 * 提供冲突解决的React Hook封装
 */

import { useState, useEffect, useCallback } from 'react';
import {
  conflictResolver,
  Conflict,
  ResolutionStrategy,
  ResolutionResult,
} from '../services/offline/conflictResolver';

export interface UseConflictResolutionReturn {
  // 冲突列表
  conflicts: Conflict[];
  unresolvedConflicts: Conflict[];

  // 状态
  loading: boolean;
  error: Error | null;

  // 统计信息
  stats: {
    total: number;
    unresolved: number;
    resolved: number;
  } | null;

  // 操作方法
  autoResolve: (conflictId: string) => Promise<ResolutionResult>;
  manualResolve: (
    conflictId: string,
    strategy: ResolutionStrategy,
    mergedData?: any,
    userId?: string
  ) => Promise<ResolutionResult>;
  resolveAll: (strategy?: ResolutionStrategy) => Promise<{
    resolved: number;
    failed: number;
    conflicts: Conflict[];
  }>;
  clearResolved: (olderThan?: number) => Promise<number>;
  refresh: () => Promise<void>;
}

/**
 * Hook for conflict resolution operations
 */
export function useConflictResolution(): UseConflictResolutionReturn {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [unresolvedConflicts, setUnresolvedConflicts] = useState<Conflict[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    unresolved: number;
    resolved: number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 刷新冲突列表和统计
   */
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [allConflicts, unresolved, conflictStats] = await Promise.all([
        conflictResolver.getAllConflicts(),
        conflictResolver.getUnresolvedConflicts(),
        conflictResolver.getConflictStats(),
      ]);

      setConflicts(allConflicts);
      setUnresolvedConflicts(unresolved);
      setStats({
        total: conflictStats.total,
        unresolved: conflictStats.unresolved,
        resolved: conflictStats.resolved,
      });
    } catch (err) {
      console.error('[useConflictResolution] Failed to refresh:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 初始化时加载数据
   */
  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * 自动解决冲突
   */
  const autoResolve = useCallback(
    async (conflictId: string): Promise<ResolutionResult> => {
      try {
        const conflict = conflicts.find((c) => c.id === conflictId);
        if (!conflict) {
          throw new Error(`Conflict ${conflictId} not found`);
        }

        const result = await conflictResolver.autoResolve(conflict);

        // 刷新列表
        await refresh();

        return result;
      } catch (err) {
        console.error('[useConflictResolution] Auto-resolve failed:', err);
        throw err;
      }
    },
    [conflicts, refresh]
  );

  /**
   * 手动解决冲突
   */
  const manualResolve = useCallback(
    async (
      conflictId: string,
      strategy: ResolutionStrategy,
      mergedData?: any,
      userId?: string
    ): Promise<ResolutionResult> => {
      try {
        const result = await conflictResolver.manualResolve(
          conflictId,
          strategy,
          mergedData,
          userId
        );

        // 刷新列表
        await refresh();

        return result;
      } catch (err) {
        console.error('[useConflictResolution] Manual resolve failed:', err);
        throw err;
      }
    },
    [refresh]
  );

  /**
   * 批量解决所有冲突
   */
  const resolveAll = useCallback(
    async (strategy: ResolutionStrategy = 'merge_auto') => {
      try {
        const result = await conflictResolver.resolveAll(strategy);

        // 刷新列表
        await refresh();

        return result;
      } catch (err) {
        console.error('[useConflictResolution] Resolve all failed:', err);
        throw err;
      }
    },
    [refresh]
  );

  /**
   * 清除已解决的冲突
   */
  const clearResolved = useCallback(
    async (olderThan?: number): Promise<number> => {
      try {
        const cleared = await conflictResolver.clearResolvedConflicts(olderThan);

        // 刷新列表
        await refresh();

        return cleared;
      } catch (err) {
        console.error('[useConflictResolution] Clear resolved failed:', err);
        throw err;
      }
    },
    [refresh]
  );

  return {
    conflicts,
    unresolvedConflicts,
    loading,
    error,
    stats,
    autoResolve,
    manualResolve,
    resolveAll,
    clearResolved,
    refresh,
  };
}

export default useConflictResolution;
