/**
 * Conflict List Component
 * v2.5.0 Phase 2.2 - Conflict Resolution
 *
 * 显示所有数据冲突的列表
 */

import React, { useState } from 'react';
import { useConflictResolution } from '../hooks/useConflictResolution';
import { Conflict, ResolutionStrategy } from '../services/offline/conflictResolver';
import ConflictResolutionModal from './ConflictResolutionModal';

export const ConflictList: React.FC = () => {
  const {
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
  } = useConflictResolution();

  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  /**
   * 打开解决模态框
   */
  const openResolutionModal = (conflict: Conflict) => {
    setSelectedConflict(conflict);
    setIsModalOpen(true);
  };

  /**
   * 关闭模态框
   */
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedConflict(null);
  };

  /**
   * 自动解决单个冲突
   */
  const handleAutoResolve = async (conflictId: string) => {
    setProcessing(conflictId);
    try {
      const result = await autoResolve(conflictId);
      if (result.success) {
        console.log('[ConflictList] Auto-resolved:', conflictId);
      } else {
        alert('无法自动解决此冲突，请手动解决。\n冲突字段: ' + result.conflicts?.join(', '));
      }
    } catch (error) {
      alert('自动解决失败: ' + (error as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  /**
   * 手动解决冲突（从模态框）
   */
  const handleManualResolve = async (
    strategy: ResolutionStrategy,
    mergedData?: any
  ) => {
    if (!selectedConflict) return;

    setProcessing(selectedConflict.id);
    try {
      const result = await manualResolve(
        selectedConflict.id,
        strategy,
        mergedData
      );

      if (result.success) {
        console.log('[ConflictList] Manually resolved:', selectedConflict.id);
      }
    } finally {
      setProcessing(null);
    }
  };

  /**
   * 批量解决所有冲突
   */
  const handleResolveAll = async () => {
    if (!confirm(`确定要自动解决所有 ${unresolvedConflicts.length} 个冲突吗？`)) {
      return;
    }

    setProcessing('all');
    try {
      const result = await resolveAll('merge_auto');
      alert(
        `解决完成:\n成功: ${result.resolved}\n失败: ${result.failed}\n剩余: ${result.conflicts.length}`
      );
    } catch (error) {
      alert('批量解决失败: ' + (error as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  /**
   * 清除已解决的冲突
   */
  const handleClearResolved = async () => {
    if (!confirm('确定要清除所有已解决的冲突记录吗？')) {
      return;
    }

    try {
      const cleared = await clearResolved();
      alert(`已清除 ${cleared} 条已解决的冲突记录`);
    } catch (error) {
      alert('清除失败: ' + (error as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-gray-800 rounded-lg">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-400">加载冲突列表...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
        <p className="text-red-400">错误: {error.message}</p>
        <button
          onClick={refresh}
          className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400">总冲突</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
          </div>
          <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
            <div className="text-sm text-yellow-400">未解决</div>
            <div className="text-2xl font-bold text-yellow-400 mt-1">{stats.unresolved}</div>
          </div>
          <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
            <div className="text-sm text-green-400">已解决</div>
            <div className="text-2xl font-bold text-green-400 mt-1">{stats.resolved}</div>
          </div>
        </div>
      )}

      {/* Actions */}
      {unresolvedConflicts.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={handleResolveAll}
            disabled={processing !== null}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white disabled:opacity-50"
          >
            {processing === 'all' ? '解决中...' : '自动解决全部'}
          </button>
          <button
            onClick={refresh}
            disabled={processing !== null}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white disabled:opacity-50"
          >
            刷新
          </button>
          {stats && stats.resolved > 0 && (
            <button
              onClick={handleClearResolved}
              disabled={processing !== null}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white disabled:opacity-50"
            >
              清除已解决
            </button>
          )}
        </div>
      )}

      {/* Conflict List */}
      {unresolvedConflicts.length === 0 ? (
        <div className="p-8 text-center bg-gray-800 rounded-lg">
          <div className="text-4xl mb-4">🎉</div>
          <p className="text-lg text-white font-semibold">没有未解决的冲突</p>
          <p className="text-sm text-gray-400 mt-2">所有数据已同步</p>
        </div>
      ) : (
        <div className="space-y-2">
          {unresolvedConflicts.map((conflict) => (
            <div
              key={conflict.id}
              className="p-4 bg-gray-800 rounded-lg border border-yellow-500/30 hover:border-yellow-500/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-400 rounded">
                      {conflict.type === 'agent' ? 'Agent' : 'Task'}
                    </span>
                    <span className="text-sm text-gray-400">
                      ID: {conflict.localVersion.id}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-gray-300">
                    <div>
                      <span className="text-gray-500">本地版本:</span> v
                      {conflict.localVersion._version} @{' '}
                      {new Date(conflict.localVersion._timestamp).toLocaleString()}
                    </div>
                    <div className="mt-1">
                      <span className="text-gray-500">服务器版本:</span> v
                      {conflict.remoteVersion._version} @{' '}
                      {new Date(conflict.remoteVersion._timestamp).toLocaleString()}
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    检测时间: {new Date(conflict.detectedAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAutoResolve(conflict.id)}
                    disabled={processing === conflict.id || processing === 'all'}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm disabled:opacity-50"
                  >
                    {processing === conflict.id ? '处理中...' : '自动解决'}
                  </button>
                  <button
                    onClick={() => openResolutionModal(conflict)}
                    disabled={processing !== null}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm disabled:opacity-50"
                  >
                    手动解决
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolved Conflicts (Collapsible) */}
      {stats && stats.resolved > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer p-4 bg-gray-800 rounded-lg hover:bg-gray-700">
            <span className="font-semibold text-white">
              已解决的冲突 ({stats.resolved})
            </span>
          </summary>
          <div className="mt-2 space-y-2">
            {conflicts
              .filter((c) => c.resolved)
              .map((conflict) => (
                <div
                  key={conflict.id}
                  className="p-4 bg-gray-800/50 rounded-lg border border-green-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs bg-green-900/30 text-green-400 rounded">
                          ✓ 已解决
                        </span>
                        <span className="text-sm text-gray-400">
                          {conflict.type === 'agent' ? 'Agent' : 'Task'} ID:{' '}
                          {conflict.localVersion.id}
                        </span>
                      </div>
                      {conflict.resolution && (
                        <div className="mt-2 text-xs text-gray-500">
                          策略: {conflict.resolution.strategy} •{' '}
                          {new Date(conflict.resolution.resolvedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </details>
      )}

      {/* Resolution Modal */}
      <ConflictResolutionModal
        conflict={selectedConflict}
        isOpen={isModalOpen}
        onClose={closeModal}
        onResolve={handleManualResolve}
      />
    </div>
  );
};

export default ConflictList;
