/**
 * Conflict Resolution Service
 * v2.5.0 Phase 2.2 - Conflict Resolution
 *
 * 处理离线数据同步时的版本冲突
 */

import { offlineStore, OfflineAgent, OfflineTask } from './offlineStore';

/**
 * 冲突类型
 */
export type ConflictType = 'agent' | 'task';

/**
 * 冲突解决策略
 */
export type ResolutionStrategy =
  | 'keep_local'      // 保留本地版本
  | 'keep_remote'     // 保留服务器版本
  | 'merge_auto'      // 自动合并
  | 'merge_manual';   // 手动合并

/**
 * 冲突数据结构
 */
export interface Conflict<T = OfflineAgent | OfflineTask> {
  id: string;
  type: ConflictType;
  localVersion: T;
  remoteVersion: T;
  baseVersion?: T;  // 基准版本（如果有）
  detectedAt: number;
  resolved: boolean;
  resolution?: {
    strategy: ResolutionStrategy;
    mergedData?: T;
    resolvedAt: number;
    resolvedBy?: string;  // 用户ID
  };
}

/**
 * 冲突解决结果
 */
export interface ResolutionResult<T = any> {
  success: boolean;
  mergedData?: T;
  strategy: ResolutionStrategy;
  conflicts?: string[];  // 无法自动解决的字段
  error?: string;
}

/**
 * 字段冲突信息
 */
export interface FieldConflict {
  field: string;
  localValue: any;
  remoteValue: any;
  baseValue?: any;
}

/**
 * 冲突解决器类
 */
export class ConflictResolver {
  /**
   * 检测是否存在冲突
   */
  detectConflict<T extends { _version: number; _timestamp: number }>(
    local: T,
    remote: T
  ): boolean {
    // 如果版本号不同，说明有冲突
    if (local._version !== remote._version) {
      return true;
    }

    // 如果时间戳差异过大（可能是时钟不同步），标记为潜在冲突
    const timeDiff = Math.abs(local._timestamp - remote._timestamp);
    if (timeDiff > 60000) {  // 1分钟
      console.warn('[ConflictResolver] Large timestamp difference detected:', timeDiff);
      return true;
    }

    return false;
  }

  /**
   * 创建冲突记录
   */
  async createConflict<T extends OfflineAgent | OfflineTask>(
    type: ConflictType,
    local: T,
    remote: T,
    base?: T
  ): Promise<Conflict<T>> {
    const conflict: Conflict<T> = {
      id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      localVersion: local,
      remoteVersion: remote,
      baseVersion: base,
      detectedAt: Date.now(),
      resolved: false,
    };

    // 保存到IndexedDB的metadata中
    const existingConflicts = await this.getUnresolvedConflicts();
    await offlineStore.setMetadata('conflicts', [
      ...existingConflicts,
      conflict,
    ]);

    console.log('[ConflictResolver] Conflict created:', conflict.id);

    return conflict;
  }

  /**
   * 获取未解决的冲突列表
   */
  async getUnresolvedConflicts(): Promise<Conflict[]> {
    const conflicts = await offlineStore.getMetadata('conflicts');
    return (conflicts || []).filter((c: Conflict) => !c.resolved);
  }

  /**
   * 获取所有冲突（包括已解决）
   */
  async getAllConflicts(): Promise<Conflict[]> {
    const conflicts = await offlineStore.getMetadata('conflicts');
    return conflicts || [];
  }

  /**
   * 自动解决冲突
   */
  async autoResolve<T extends OfflineAgent | OfflineTask>(
    conflict: Conflict<T>
  ): Promise<ResolutionResult<T>> {
    console.log('[ConflictResolver] Attempting auto-resolve:', conflict.id);

    const { localVersion, remoteVersion, baseVersion } = conflict;

    // 1. 检查是否可以简单合并（无真正冲突）
    const fieldConflicts = this.findFieldConflicts(
      localVersion,
      remoteVersion,
      baseVersion
    );

    if (fieldConflicts.length === 0) {
      // 没有字段冲突，使用最新版本
      const merged = localVersion._timestamp > remoteVersion._timestamp
        ? localVersion
        : remoteVersion;

      return {
        success: true,
        mergedData: merged,
        strategy: 'merge_auto',
      };
    }

    // 2. 尝试三向合并
    if (baseVersion) {
      const mergeResult = this.threeWayMerge(
        localVersion,
        remoteVersion,
        baseVersion
      );

      if (mergeResult.success) {
        return mergeResult;
      }
    }

    // 3. 应用自动合并规则
    const autoMerged = this.applyAutoMergeRules(
      localVersion,
      remoteVersion,
      fieldConflicts
    );

    if (autoMerged.conflicts && autoMerged.conflicts.length > 0) {
      // 仍有冲突，需要手动解决
      return {
        success: false,
        strategy: 'merge_manual',
        conflicts: autoMerged.conflicts,
      };
    }

    return {
      success: true,
      mergedData: autoMerged.mergedData,
      strategy: 'merge_auto',
    };
  }

  /**
   * 查找字段级冲突
   */
  private findFieldConflicts<T extends Record<string, any>>(
    local: T,
    remote: T,
    base?: T
  ): FieldConflict[] {
    const conflicts: FieldConflict[] = [];
    const allKeys = new Set([
      ...Object.keys(local),
      ...Object.keys(remote),
    ]);

    // 排除元数据字段
    const metadataFields = ['_version', '_timestamp', '_synced', '_offline', 'originalData'];

    for (const key of allKeys) {
      if (metadataFields.includes(key)) continue;

      const localValue = local[key];
      const remoteValue = remote[key];
      const baseValue = base?.[key];

      // 检查是否有冲突
      if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
        // 如果有基准版本，检查是否是真正的冲突
        if (base) {
          const localChanged = JSON.stringify(localValue) !== JSON.stringify(baseValue);
          const remoteChanged = JSON.stringify(remoteValue) !== JSON.stringify(baseValue);

          // 只有双方都修改了才是冲突
          if (localChanged && remoteChanged) {
            conflicts.push({
              field: key,
              localValue,
              remoteValue,
              baseValue,
            });
          }
        } else {
          // 没有基准版本，直接标记为冲突
          conflicts.push({
            field: key,
            localValue,
            remoteValue,
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * 三向合并算法
   */
  private threeWayMerge<T extends Record<string, any>>(
    local: T,
    remote: T,
    base: T
  ): ResolutionResult<T> {
    const merged = { ...base };
    const conflicts: string[] = [];

    const allKeys = new Set([
      ...Object.keys(local),
      ...Object.keys(remote),
      ...Object.keys(base),
    ]);

    const metadataFields = ['_version', '_timestamp', '_synced', '_offline', 'originalData'];

    for (const key of allKeys) {
      if (metadataFields.includes(key)) continue;

      const localValue = local[key];
      const remoteValue = remote[key];
      const baseValue = base[key];

      const localChanged = JSON.stringify(localValue) !== JSON.stringify(baseValue);
      const remoteChanged = JSON.stringify(remoteValue) !== JSON.stringify(baseValue);

      if (!localChanged && !remoteChanged) {
        // 双方都没改，保持基准版本
        merged[key] = baseValue;
      } else if (localChanged && !remoteChanged) {
        // 只有本地改了，采用本地版本
        merged[key] = localValue;
      } else if (!localChanged && remoteChanged) {
        // 只有远程改了，采用远程版本
        merged[key] = remoteValue;
      } else {
        // 双方都改了，需要进一步判断
        if (JSON.stringify(localValue) === JSON.stringify(remoteValue)) {
          // 虽然都改了，但改成一样的，没问题
          merged[key] = localValue;
        } else {
          // 真正的冲突
          conflicts.push(key);
          // 默认采用时间戳更新的版本
          merged[key] = local._timestamp > remote._timestamp
            ? localValue
            : remoteValue;
        }
      }
    }

    // 更新元数据
    (merged as any)._version = Math.max(local._version, remote._version) + 1;
    (merged as any)._timestamp = Date.now();
    (merged as any)._synced = false;

    return {
      success: conflicts.length === 0,
      mergedData: merged as T,
      strategy: conflicts.length === 0 ? 'merge_auto' : 'merge_manual',
      conflicts: conflicts.length > 0 ? conflicts : undefined,
    };
  }

  /**
   * 应用自动合并规则
   */
  private applyAutoMergeRules<T extends Record<string, any>>(
    local: T,
    remote: T,
    fieldConflicts: FieldConflict[]
  ): { mergedData: T; conflicts?: string[] } {
    const merged = { ...local };
    const unresolvedConflicts: string[] = [];

    for (const conflict of fieldConflicts) {
      const { field, localValue, remoteValue } = conflict;

      // 规则1: 数值类型，取较大值
      if (typeof localValue === 'number' && typeof remoteValue === 'number') {
        merged[field] = Math.max(localValue, remoteValue);
        continue;
      }

      // 规则2: 数组类型，合并去重
      if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
        merged[field] = [...new Set([...localValue, ...remoteValue])];
        continue;
      }

      // 规则3: 布尔类型，优先true
      if (typeof localValue === 'boolean' && typeof remoteValue === 'boolean') {
        merged[field] = localValue || remoteValue;
        continue;
      }

      // 规则4: 字符串类型，如果长度差异大，取较长的（可能更完整）
      if (typeof localValue === 'string' && typeof remoteValue === 'string') {
        if (Math.abs(localValue.length - remoteValue.length) > 10) {
          merged[field] = localValue.length > remoteValue.length
            ? localValue
            : remoteValue;
          continue;
        }
      }

      // 规则5: 特殊字段处理
      if (field === 'status') {
        // 状态优先级: completed > in_progress > pending > failed
        const statusPriority: Record<string, number> = {
          completed: 4,
          in_progress: 3,
          pending: 2,
          failed: 1,
        };
        const localPriority = statusPriority[localValue] || 0;
        const remotePriority = statusPriority[remoteValue] || 0;
        merged[field] = localPriority > remotePriority ? localValue : remoteValue;
        continue;
      }

      // 无法自动解决
      unresolvedConflicts.push(field);
      // 默认保留本地版本
      merged[field] = localValue;
    }

    // 更新元数据
    (merged as any)._version = Math.max(local._version, remote._version) + 1;
    (merged as any)._timestamp = Date.now();
    (merged as any)._synced = false;

    return {
      mergedData: merged,
      conflicts: unresolvedConflicts.length > 0 ? unresolvedConflicts : undefined,
    };
  }

  /**
   * 手动解决冲突
   */
  async manualResolve<T extends OfflineAgent | OfflineTask>(
    conflictId: string,
    strategy: ResolutionStrategy,
    mergedData?: T,
    userId?: string
  ): Promise<ResolutionResult<T>> {
    const conflicts = await this.getAllConflicts();
    const conflict = conflicts.find((c) => c.id === conflictId);

    if (!conflict) {
      return {
        success: false,
        strategy,
        error: `Conflict ${conflictId} not found`,
      };
    }

    let finalData: T | undefined;

    switch (strategy) {
      case 'keep_local':
        finalData = conflict.localVersion as T;
        break;

      case 'keep_remote':
        finalData = conflict.remoteVersion as T;
        break;

      case 'merge_manual':
        if (!mergedData) {
          return {
            success: false,
            strategy,
            error: 'Merged data is required for manual merge',
          };
        }
        finalData = mergedData;
        break;

      default:
        return {
          success: false,
          strategy,
          error: `Invalid strategy: ${strategy}`,
        };
    }

    // 更新冲突状态
    conflict.resolved = true;
    conflict.resolution = {
      strategy,
      mergedData: finalData,
      resolvedAt: Date.now(),
      resolvedBy: userId,
    };

    // 保存更新后的冲突列表
    await offlineStore.setMetadata('conflicts', conflicts);

    console.log('[ConflictResolver] Conflict resolved:', conflictId, strategy);

    return {
      success: true,
      mergedData: finalData,
      strategy,
    };
  }

  /**
   * 批量解决冲突
   */
  async resolveAll(strategy: ResolutionStrategy = 'merge_auto'): Promise<{
    resolved: number;
    failed: number;
    conflicts: Conflict[];
  }> {
    const unresolvedConflicts = await this.getUnresolvedConflicts();
    let resolved = 0;
    let failed = 0;

    for (const conflict of unresolvedConflicts) {
      try {
        let result: ResolutionResult;

        if (strategy === 'merge_auto') {
          result = await this.autoResolve(conflict);
        } else {
          result = await this.manualResolve(conflict.id, strategy);
        }

        if (result.success) {
          resolved++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error('[ConflictResolver] Failed to resolve conflict:', conflict.id, error);
        failed++;
      }
    }

    const remainingConflicts = await this.getUnresolvedConflicts();

    return {
      resolved,
      failed,
      conflicts: remainingConflicts,
    };
  }

  /**
   * 清除已解决的冲突历史
   */
  async clearResolvedConflicts(olderThan?: number): Promise<number> {
    const allConflicts = await this.getAllConflicts();
    const threshold = olderThan || Date.now() - 7 * 24 * 60 * 60 * 1000;  // 默认7天

    const remaining = allConflicts.filter((conflict) => {
      if (!conflict.resolved) return true;  // 保留未解决的
      if (conflict.resolution!.resolvedAt > threshold) return true;  // 保留最近的
      return false;
    });

    const cleared = allConflicts.length - remaining.length;

    await offlineStore.setMetadata('conflicts', remaining);

    console.log('[ConflictResolver] Cleared', cleared, 'resolved conflicts');

    return cleared;
  }

  /**
   * 获取冲突统计
   */
  async getConflictStats(): Promise<{
    total: number;
    unresolved: number;
    resolved: number;
    byType: Record<ConflictType, number>;
    byStrategy: Record<ResolutionStrategy, number>;
  }> {
    const allConflicts = await this.getAllConflicts();

    const stats = {
      total: allConflicts.length,
      unresolved: 0,
      resolved: 0,
      byType: { agent: 0, task: 0 } as Record<ConflictType, number>,
      byStrategy: {
        keep_local: 0,
        keep_remote: 0,
        merge_auto: 0,
        merge_manual: 0,
      } as Record<ResolutionStrategy, number>,
    };

    for (const conflict of allConflicts) {
      if (conflict.resolved) {
        stats.resolved++;
        if (conflict.resolution) {
          stats.byStrategy[conflict.resolution.strategy]++;
        }
      } else {
        stats.unresolved++;
      }

      stats.byType[conflict.type]++;
    }

    return stats;
  }
}

// 导出单例
export const conflictResolver = new ConflictResolver();

export default conflictResolver;
