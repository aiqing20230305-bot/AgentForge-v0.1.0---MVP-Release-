/**
 * Background Sync Status Component
 * v2.5.0 Phase 2.3 - Background Sync API
 *
 * 显示后台同步状态的UI组件
 */

import React from 'react';
import { useBackgroundSync } from '../hooks/useBackgroundSync';

export const BackgroundSyncStatus: React.FC = () => {
  const {
    isSupported,
    isRegistered,
    isSyncing,
    syncProgress,
    lastSync,
    error,
    swState,
    triggerSync,
  } = useBackgroundSync();

  // 不支持后台同步
  if (!isSupported) {
    return (
      <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400">⚠️</span>
          <span className="text-yellow-400">您的浏览器不支持后台同步功能</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          建议使用Chrome、Edge或Firefox最新版
        </p>
      </div>
    );
  }

  // Service Worker未注册
  if (!isRegistered) {
    return (
      <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" />
          <span className="text-gray-400">Service Worker: {swState}</span>
        </div>
      </div>
    );
  }

  // 正在同步
  if (isSyncing && syncProgress) {
    const percentage = Math.round((syncProgress.current / syncProgress.total) * 100);

    return (
      <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-blue-400"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm text-blue-400 font-medium">同步中...</span>
          </div>
          <span className="text-xs text-blue-400">
            {syncProgress.current} / {syncProgress.total}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="text-xs text-gray-400 mt-1">
          {percentage}% 完成
        </div>
      </div>
    );
  }

  // 同步错误
  if (error) {
    return (
      <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-red-400">❌</span>
            <span className="text-sm text-red-400">同步失败</span>
          </div>
          <button
            onClick={triggerSync}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs text-white"
          >
            重试
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">{error}</p>
      </div>
    );
  }

  // 空闲状态
  return (
    <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="text-sm text-gray-300">后台同步已就绪</span>
        </div>
        <button
          onClick={triggerSync}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white"
        >
          立即同步
        </button>
      </div>

      {lastSync && (
        <p className="text-xs text-gray-500 mt-1">
          最后同步: {lastSync.toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default BackgroundSyncStatus;
