/**
 * Conflict Resolution Modal Component
 * v2.5.0 Phase 2.2 - Conflict Resolution
 *
 * 冲突解决UI界面
 */

import React, { useState, useMemo } from 'react';
import { Conflict, ResolutionStrategy, FieldConflict } from '../services/offline/conflictResolver';

export interface ConflictResolutionModalProps {
  conflict: Conflict | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (
    strategy: ResolutionStrategy,
    mergedData?: any
  ) => Promise<void>;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  conflict,
  isOpen,
  onClose,
  onResolve,
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<ResolutionStrategy>('merge_auto');
  const [customValues, setCustomValues] = useState<Record<string, any>>({});
  const [resolving, setResolving] = useState(false);

  // 计算字段差异
  const fieldDifferences = useMemo(() => {
    if (!conflict) return [];

    const { localVersion, remoteVersion } = conflict;
    const differences: Array<{
      field: string;
      localValue: any;
      remoteValue: any;
      isDifferent: boolean;
    }> = [];

    const allKeys = new Set([
      ...Object.keys(localVersion),
      ...Object.keys(remoteVersion),
    ]);

    const metadataFields = ['_version', '_timestamp', '_synced', '_offline', 'originalData'];

    for (const key of allKeys) {
      if (metadataFields.includes(key)) continue;

      const localValue = localVersion[key];
      const remoteValue = remoteVersion[key];
      const isDifferent = JSON.stringify(localValue) !== JSON.stringify(remoteValue);

      differences.push({
        field: key,
        localValue,
        remoteValue,
        isDifferent,
      });
    }

    return differences;
  }, [conflict]);

  // 构建合并数据
  const buildMergedData = (): any => {
    if (!conflict) return null;

    const merged = { ...conflict.localVersion };

    switch (selectedStrategy) {
      case 'keep_local':
        return conflict.localVersion;

      case 'keep_remote':
        return conflict.remoteVersion;

      case 'merge_auto':
        // 自动合并由服务端处理
        return undefined;

      case 'merge_manual':
        // 使用用户选择的值
        for (const [field, value] of Object.entries(customValues)) {
          merged[field] = value;
        }
        return merged;

      default:
        return merged;
    }
  };

  // 处理解决
  const handleResolve = async () => {
    if (!conflict) return;

    setResolving(true);
    try {
      const mergedData = buildMergedData();
      await onResolve(selectedStrategy, mergedData);
      onClose();
    } catch (error) {
      console.error('[ConflictResolutionModal] Failed to resolve:', error);
      alert('解决冲突失败: ' + (error as Error).message);
    } finally {
      setResolving(false);
    }
  };

  // 选择字段值
  const selectFieldValue = (field: string, value: any, source: 'local' | 'remote') => {
    setCustomValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen || !conflict) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-900 rounded-lg border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">解决数据冲突</h2>
              <p className="text-sm text-gray-400 mt-1">
                {conflict.type === 'agent' ? 'Agent' : 'Task'} ID: {conflict.localVersion.id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
              disabled={resolving}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Strategy Selector */}
          <div className="mt-4 space-y-2">
            <label className="text-sm text-gray-400">选择解决策略:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedStrategy('keep_local')}
                className={`p-3 rounded-lg border ${
                  selectedStrategy === 'keep_local'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="font-semibold">保留本地版本</div>
                <div className="text-xs mt-1 opacity-70">使用设备上的数据</div>
              </button>

              <button
                onClick={() => setSelectedStrategy('keep_remote')}
                className={`p-3 rounded-lg border ${
                  selectedStrategy === 'keep_remote'
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="font-semibold">保留服务器版本</div>
                <div className="text-xs mt-1 opacity-70">使用服务器上的数据</div>
              </button>

              <button
                onClick={() => setSelectedStrategy('merge_auto')}
                className={`p-3 rounded-lg border ${
                  selectedStrategy === 'merge_auto'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="font-semibold">自动合并</div>
                <div className="text-xs mt-1 opacity-70">智能合并双方数据</div>
              </button>

              <button
                onClick={() => setSelectedStrategy('merge_manual')}
                className={`p-3 rounded-lg border ${
                  selectedStrategy === 'merge_manual'
                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="font-semibold">手动合并</div>
                <div className="text-xs mt-1 opacity-70">逐字段选择数据</div>
              </button>
            </div>
          </div>
        </div>

        {/* Body - Field Comparison */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {fieldDifferences.map(({ field, localValue, remoteValue, isDifferent }) => (
              <div
                key={field}
                className={`p-4 rounded-lg border ${
                  isDifferent
                    ? 'border-yellow-500/30 bg-yellow-500/5'
                    : 'border-gray-700 bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{field}</h4>
                  {isDifferent && (
                    <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                      冲突
                    </span>
                  )}
                </div>

                {selectedStrategy === 'merge_manual' && isDifferent ? (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Local Version */}
                    <button
                      onClick={() => selectFieldValue(field, localValue, 'local')}
                      className={`p-3 rounded border text-left ${
                        customValues[field] === localValue
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-xs text-gray-400 mb-1">本地版本</div>
                      <div className="text-sm text-white break-all">
                        {JSON.stringify(localValue, null, 2)}
                      </div>
                    </button>

                    {/* Remote Version */}
                    <button
                      onClick={() => selectFieldValue(field, remoteValue, 'remote')}
                      className={`p-3 rounded border text-left ${
                        customValues[field] === remoteValue
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-xs text-gray-400 mb-1">服务器版本</div>
                      <div className="text-sm text-white break-all">
                        {JSON.stringify(remoteValue, null, 2)}
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded bg-gray-700/30">
                      <div className="text-xs text-gray-400 mb-1">本地版本</div>
                      <div className="text-sm text-white break-all">
                        {JSON.stringify(localValue, null, 2)}
                      </div>
                    </div>
                    <div className="p-3 rounded bg-gray-700/30">
                      <div className="text-xs text-gray-400 mb-1">服务器版本</div>
                      <div className="text-sm text-white break-all">
                        {JSON.stringify(remoteValue, null, 2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            检测到 {fieldDifferences.filter((f) => f.isDifferent).length} 个字段冲突
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={resolving}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleResolve}
              disabled={resolving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 flex items-center gap-2"
            >
              {resolving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  解决中...
                </>
              ) : (
                '解决冲突'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictResolutionModal;
