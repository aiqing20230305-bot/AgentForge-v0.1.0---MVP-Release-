/**
 * Service Worker for Background Sync
 * v2.5.0 Phase 2.3 - Background Sync API
 *
 * 提供后台同步功能，即使应用关闭也能同步数据
 */

/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'agentforge-v1';
const SYNC_TAG = 'agentforge-sync';
const RETRY_DELAYS = [1000, 2000, 5000, 10000, 30000]; // 指数退避

interface SyncRequest {
  id: string;
  type: 'agent' | 'task';
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
}

/**
 * Service Worker安装事件
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
      ]);
    })
  );

  // 立即激活新的Service Worker
  self.skipWaiting();
});

/**
 * Service Worker激活事件
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // 立即控制所有页面
  return self.clients.claim();
});

/**
 * Service Worker fetch事件
 */
self.addEventListener('fetch', (event) => {
  // 网络优先，缓存回退策略
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 克隆响应，因为响应流只能使用一次
        const responseToCache = response.clone();

        // 只缓存成功的响应
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // 网络失败，尝试从缓存获取
        return caches.match(event.request);
      })
  );
});

/**
 * Background Sync事件
 * 当网络恢复时自动触发
 */
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sync event:', event.tag);

  if (event.tag === SYNC_TAG) {
    event.waitUntil(syncData());
  }
});

/**
 * 同步数据到服务器
 */
async function syncData(): Promise<void> {
  console.log('[Service Worker] Starting background sync...');

  try {
    // 从IndexedDB获取未同步的数据
    const unsyncedData = await getUnsyncedData();

    if (unsyncedData.length === 0) {
      console.log('[Service Worker] No data to sync');
      await notifyClients({ type: 'sync-complete', count: 0 });
      return;
    }

    console.log(`[Service Worker] Syncing ${unsyncedData.length} items...`);

    let successCount = 0;
    let failCount = 0;

    // 批量同步
    for (const item of unsyncedData) {
      try {
        await syncItem(item);
        successCount++;

        // 通知客户端进度
        await notifyClients({
          type: 'sync-progress',
          current: successCount + failCount,
          total: unsyncedData.length,
        });
      } catch (error) {
        console.error('[Service Worker] Sync item failed:', item.id, error);
        failCount++;

        // 如果重试次数未达上限，重新排队
        if (item.retries < RETRY_DELAYS.length) {
          await requeueItem(item);
        }
      }
    }

    console.log(
      `[Service Worker] Sync complete: ${successCount} success, ${failCount} failed`
    );

    // 通知客户端同步完成
    await notifyClients({
      type: 'sync-complete',
      count: successCount,
      failed: failCount,
    });
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);

    await notifyClients({
      type: 'sync-error',
      error: error.message,
    });
  }
}

/**
 * 从IndexedDB获取未同步的数据
 */
async function getUnsyncedData(): Promise<SyncRequest[]> {
  // 打开IndexedDB
  const db = await openIndexedDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * 同步单个项目到服务器
 */
async function syncItem(item: SyncRequest): Promise<void> {
  const apiUrl = getApiUrl();
  const endpoint = `${apiUrl}/${item.type}s/${item.operation}`;

  let url: string;
  let method: string;
  let body: string | undefined;

  switch (item.operation) {
    case 'create':
      url = `${apiUrl}/${item.type}s`;
      method = 'POST';
      body = JSON.stringify(item.data);
      break;

    case 'update':
      url = `${apiUrl}/${item.type}s/${item.data.id}`;
      method = 'PUT';
      body = JSON.stringify(item.data);
      break;

    case 'delete':
      url = `${apiUrl}/${item.type}s/${item.data.id}`;
      method = 'DELETE';
      break;

    default:
      throw new Error(`Unknown operation: ${item.operation}`);
  }

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  // 同步成功，从队列中删除
  await removeSyncQueueItem(item.id);

  console.log('[Service Worker] Item synced:', item.id);
}

/**
 * 重新排队失败的项目
 */
async function requeueItem(item: SyncRequest): Promise<void> {
  const db = await openIndexedDB();

  const updatedItem: SyncRequest = {
    ...item,
    retries: item.retries + 1,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const request = store.put(updatedItem);

    request.onsuccess = () => {
      console.log('[Service Worker] Item requeued:', item.id);
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * 从同步队列删除项目
 */
async function removeSyncQueueItem(id: string): Promise<void> {
  const db = await openIndexedDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * 打开IndexedDB
 */
async function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AgentForgeOfflineDB', 1);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * 通知所有客户端
 */
async function notifyClients(message: any): Promise<void> {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });

  clients.forEach((client) => {
    client.postMessage(message);
  });
}

/**
 * 获取API URL
 */
function getApiUrl(): string {
  // 从环境变量或默认值获取API URL
  return self.registration.scope.includes('localhost')
    ? 'http://localhost:5000/api'
    : 'https://api.agentforge.app';
}

/**
 * Message事件处理
 * 接收来自主线程的消息
 */
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  const { type, payload } = event.data;

  switch (type) {
    case 'SYNC_NOW':
      // 立即触发同步
      event.waitUntil(syncData());
      break;

    case 'SKIP_WAITING':
      // 跳过等待，立即激活
      self.skipWaiting();
      break;

    default:
      console.warn('[Service Worker] Unknown message type:', type);
  }
});

/**
 * Push通知事件（预留）
 */
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');

  if (!event.data) return;

  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    })
  );
});

/**
 * Notification点击事件
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');

  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // 如果已有窗口打开，聚焦它
      for (const client of clientList) {
        if (client.url === self.registration.scope && 'focus' in client) {
          return client.focus();
        }
      }

      // 否则打开新窗口
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

console.log('[Service Worker] Loaded');
