/**
 * Service Worker Registration and Management
 * v2.5.0 Phase 2.3 - Background Sync API
 *
 * 注册和管理Service Worker
 */

export interface ServiceWorkerMessage {
  type: string;
  payload?: any;
}

export interface SyncStatus {
  isSyncing: boolean;
  progress: {
    current: number;
    total: number;
  } | null;
  lastSync: Date | null;
  error: string | null;
}

/**
 * Service Worker管理器
 */
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private syncStatusListeners: Array<(status: SyncStatus) => void> = [];
  private currentStatus: SyncStatus = {
    isSyncing: false,
    progress: null,
    lastSync: null,
    error: null,
  };

  /**
   * 注册Service Worker
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    // 检查浏览器支持
    if (!('serviceWorker' in navigator)) {
      console.warn('[ServiceWorkerManager] Service Worker not supported');
      return null;
    }

    if (!('SyncManager' in window)) {
      console.warn('[ServiceWorkerManager] Background Sync not supported');
    }

    try {
      console.log('[ServiceWorkerManager] Registering Service Worker...');

      this.registration = await navigator.serviceWorker.register(
        '/service-worker.js',
        {
          scope: '/',
        }
      );

      console.log('[ServiceWorkerManager] Service Worker registered:', this.registration.scope);

      // 监听Service Worker状态变化
      this.setupListeners();

      // 检查更新
      this.registration.addEventListener('updatefound', () => {
        console.log('[ServiceWorkerManager] Service Worker update found');
        const newWorker = this.registration!.installing;

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[ServiceWorkerManager] New Service Worker installed');
              // 通知用户有新版本
              this.notifyUpdate();
            }
          });
        }
      });

      return this.registration;
    } catch (error) {
      console.error('[ServiceWorkerManager] Registration failed:', error);
      return null;
    }
  }

  /**
   * 设置消息监听器
   */
  private setupListeners(): void {
    if (!navigator.serviceWorker) return;

    // 监听Service Worker消息
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleMessage(event.data);
    });

    // 监听控制器变化
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[ServiceWorkerManager] Controller changed');
      window.location.reload();
    });
  }

  /**
   * 处理Service Worker消息
   */
  private handleMessage(message: any): void {
    console.log('[ServiceWorkerManager] Message from SW:', message);

    const { type } = message;

    switch (type) {
      case 'sync-progress':
        this.updateStatus({
          isSyncing: true,
          progress: {
            current: message.current,
            total: message.total,
          },
          lastSync: this.currentStatus.lastSync,
          error: null,
        });
        break;

      case 'sync-complete':
        this.updateStatus({
          isSyncing: false,
          progress: null,
          lastSync: new Date(),
          error: message.failed > 0 ? `${message.failed} items failed` : null,
        });

        // 显示通知
        if (message.count > 0) {
          this.showNotification(
            'Sync Complete',
            `${message.count} items synced successfully`
          );
        }
        break;

      case 'sync-error':
        this.updateStatus({
          isSyncing: false,
          progress: null,
          lastSync: this.currentStatus.lastSync,
          error: message.error,
        });

        this.showNotification('Sync Error', message.error);
        break;

      default:
        console.warn('[ServiceWorkerManager] Unknown message type:', type);
    }
  }

  /**
   * 更新同步状态
   */
  private updateStatus(status: SyncStatus): void {
    this.currentStatus = status;
    this.syncStatusListeners.forEach((listener) => listener(status));
  }

  /**
   * 注册后台同步
   */
  async registerSync(tag: string = 'agentforge-sync'): Promise<boolean> {
    if (!this.registration) {
      console.error('[ServiceWorkerManager] No registration found');
      return false;
    }

    if (!('sync' in this.registration)) {
      console.warn('[ServiceWorkerManager] Background Sync not supported');
      return false;
    }

    try {
      await (this.registration as any).sync.register(tag);
      console.log('[ServiceWorkerManager] Background sync registered:', tag);
      return true;
    } catch (error) {
      console.error('[ServiceWorkerManager] Failed to register sync:', error);
      return false;
    }
  }

  /**
   * 立即触发同步
   */
  async triggerSync(): Promise<void> {
    if (!this.registration || !this.registration.active) {
      console.error('[ServiceWorkerManager] No active Service Worker');
      return;
    }

    console.log('[ServiceWorkerManager] Triggering immediate sync');

    // 发送消息到Service Worker
    this.registration.active.postMessage({
      type: 'SYNC_NOW',
    });

    // 同时注册后台同步（网络恢复时触发）
    await this.registerSync();
  }

  /**
   * 注销Service Worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('[ServiceWorkerManager] Service Worker unregistered:', result);
      this.registration = null;
      return result;
    } catch (error) {
      console.error('[ServiceWorkerManager] Unregister failed:', error);
      return false;
    }
  }

  /**
   * 更新Service Worker
   */
  async update(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      await this.registration.update();
      console.log('[ServiceWorkerManager] Service Worker updated');
    } catch (error) {
      console.error('[ServiceWorkerManager] Update failed:', error);
    }
  }

  /**
   * 跳过等待，立即激活新版本
   */
  async skipWaiting(): Promise<void> {
    const waiting = this.registration?.waiting;

    if (!waiting) {
      return;
    }

    waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  /**
   * 监听同步状态变化
   */
  onSyncStatusChange(listener: (status: SyncStatus) => void): () => void {
    this.syncStatusListeners.push(listener);

    // 返回取消监听函数
    return () => {
      const index = this.syncStatusListeners.indexOf(listener);
      if (index > -1) {
        this.syncStatusListeners.splice(index, 1);
      }
    };
  }

  /**
   * 获取当前同步状态
   */
  getSyncStatus(): SyncStatus {
    return { ...this.currentStatus };
  }

  /**
   * 显示浏览器通知
   */
  private async showNotification(title: string, body: string): Promise<void> {
    if (!('Notification' in window)) {
      return;
    }

    // 请求通知权限
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted' && this.registration) {
      await this.registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'agentforge-sync',
      });
    }
  }

  /**
   * 通知用户有新版本
   */
  private notifyUpdate(): void {
    // 可以在这里显示UI提示用户刷新
    console.log('[ServiceWorkerManager] New version available');

    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  }

  /**
   * 检查Service Worker状态
   */
  getState(): string {
    if (!this.registration) {
      return 'not-registered';
    }

    if (this.registration.active) {
      return 'active';
    }

    if (this.registration.installing) {
      return 'installing';
    }

    if (this.registration.waiting) {
      return 'waiting';
    }

    return 'unknown';
  }

  /**
   * 检查是否支持后台同步
   */
  static isSupported(): boolean {
    return 'serviceWorker' in navigator && 'SyncManager' in window;
  }
}

// 导出单例
export const serviceWorkerManager = new ServiceWorkerManager();

// 自动注册（如果支持）
if (typeof window !== 'undefined' && ServiceWorkerManager.isSupported()) {
  serviceWorkerManager.register().catch(console.error);
}

export default serviceWorkerManager;
