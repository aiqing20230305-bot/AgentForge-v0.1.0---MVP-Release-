/**
 * React Hook for Service Worker and Background Sync
 * v2.5.0 Phase 2.3 - Background Sync API
 */

import { useState, useEffect, useCallback } from 'react';
import {
  serviceWorkerManager,
  SyncStatus,
} from '../services/serviceWorkerManager';

export interface UseBackgroundSyncReturn {
  // 状态
  isSupported: boolean;
  isRegistered: boolean;
  isSyncing: boolean;
  syncProgress: { current: number; total: number } | null;
  lastSync: Date | null;
  error: string | null;
  swState: string;

  // 操作
  triggerSync: () => Promise<void>;
  registerSync: () => Promise<boolean>;
  updateServiceWorker: () => Promise<void>;
  skipWaiting: () => Promise<void>;
}

/**
 * Hook for background sync operations
 */
export function useBackgroundSync(): UseBackgroundSyncReturn {
  const [isSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    return 'serviceWorker' in navigator && 'SyncManager' in window;
  });

  const [isRegistered, setIsRegistered] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    progress: null,
    lastSync: null,
    error: null,
  });
  const [swState, setSwState] = useState('not-registered');

  /**
   * 初始化
   */
  useEffect(() => {
    if (!isSupported) return;

    // 检查注册状态
    const checkRegistration = () => {
      const state = serviceWorkerManager.getState();
      setSwState(state);
      setIsRegistered(state === 'active');
    };

    checkRegistration();

    // 定期检查
    const interval = setInterval(checkRegistration, 5000);

    // 监听同步状态
    const unsubscribe = serviceWorkerManager.onSyncStatusChange(setSyncStatus);

    // 监听Service Worker更新
    const handleUpdate = () => {
      console.log('[useBackgroundSync] Service Worker update available');
      // 可以在这里显示更新提示
    };

    window.addEventListener('sw-update-available', handleUpdate);

    return () => {
      clearInterval(interval);
      unsubscribe();
      window.removeEventListener('sw-update-available', handleUpdate);
    };
  }, [isSupported]);

  /**
   * 触发立即同步
   */
  const triggerSync = useCallback(async () => {
    if (!isSupported || !isRegistered) {
      console.warn('[useBackgroundSync] Cannot trigger sync: not supported or not registered');
      return;
    }

    await serviceWorkerManager.triggerSync();
  }, [isSupported, isRegistered]);

  /**
   * 注册后台同步
   */
  const registerSync = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !isRegistered) {
      return false;
    }

    return await serviceWorkerManager.registerSync();
  }, [isSupported, isRegistered]);

  /**
   * 更新Service Worker
   */
  const updateServiceWorker = useCallback(async () => {
    if (!isSupported) return;

    await serviceWorkerManager.update();
  }, [isSupported]);

  /**
   * 跳过等待，激活新版本
   */
  const skipWaiting = useCallback(async () => {
    if (!isSupported) return;

    await serviceWorkerManager.skipWaiting();
  }, [isSupported]);

  return {
    isSupported,
    isRegistered,
    isSyncing: syncStatus.isSyncing,
    syncProgress: syncStatus.progress,
    lastSync: syncStatus.lastSync,
    error: syncStatus.error,
    swState,
    triggerSync,
    registerSync,
    updateServiceWorker,
    skipWaiting,
  };
}

export default useBackgroundSync;
