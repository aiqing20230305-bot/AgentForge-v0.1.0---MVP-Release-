/**
 * React Hook for Online/Offline Status Detection
 * v2.5.0 Phase 2.1 - IndexedDB Integration
 *
 * 监听浏览器在线/离线状态变化
 */

import { useState, useEffect } from 'react';

export interface UseOnlineStatusReturn {
  /**
   * 当前在线状态
   */
  isOnline: boolean;

  /**
   * 上次状态变化时间
   */
  lastChangeTime: Date | null;

  /**
   * 状态变化次数（用于调试）
   */
  changeCount: number;
}

/**
 * Hook for detecting online/offline status
 *
 * @example
 * ```tsx
 * const { isOnline } = useOnlineStatus();
 *
 * if (!isOnline) {
 *   return <div>离线模式 - 数据将在恢复连接后同步</div>;
 * }
 * ```
 */
export function useOnlineStatus(): UseOnlineStatusReturn {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [lastChangeTime, setLastChangeTime] = useState<Date | null>(null);
  const [changeCount, setChangeCount] = useState<number>(0);

  useEffect(() => {
    /**
     * 处理在线状态变化
     */
    const handleOnline = () => {
      console.log('[useOnlineStatus] Connection restored - online');
      setIsOnline(true);
      setLastChangeTime(new Date());
      setChangeCount((prev) => prev + 1);
    };

    /**
     * 处理离线状态变化
     */
    const handleOffline = () => {
      console.log('[useOnlineStatus] Connection lost - offline');
      setIsOnline(false);
      setLastChangeTime(new Date());
      setChangeCount((prev) => prev + 1);
    };

    // 添加事件监听
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 清理
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    lastChangeTime,
    changeCount,
  };
}

/**
 * Hook for triggering callbacks on online/offline changes
 *
 * @param onOnline - Callback when going online
 * @param onOffline - Callback when going offline
 *
 * @example
 * ```tsx
 * useOnlineStatusCallback(
 *   () => syncManager.startSync(),
 *   () => console.warn('Offline mode activated')
 * );
 * ```
 */
export function useOnlineStatusCallback(
  onOnline?: () => void,
  onOffline?: () => void
): UseOnlineStatusReturn {
  const status = useOnlineStatus();

  useEffect(() => {
    if (status.lastChangeTime) {
      if (status.isOnline && onOnline) {
        onOnline();
      } else if (!status.isOnline && onOffline) {
        onOffline();
      }
    }
  }, [status.isOnline, status.lastChangeTime, onOnline, onOffline]);

  return status;
}

export default useOnlineStatus;
