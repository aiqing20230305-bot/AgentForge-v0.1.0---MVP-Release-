/**
 * Service Worker for AgentForge PWA
 * Provides offline support, caching, and background sync
 *
 * Performance Targets:
 * - First load: < 2s
 * - Subsequent loads: < 0.5s
 * - Offline mode: Full functionality
 */

/// <reference lib="WebWorker" />

declare const self: ServiceWorkerGlobalScope

const CACHE_VERSION = 'agentforge-v1.5.0'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`
const IMAGE_CACHE = `${CACHE_VERSION}-images`

// Files to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
]

// Runtime cache patterns
const CACHE_PATTERNS = {
  static: [
    /\.js$/,
    /\.css$/,
    /\.woff2?$/,
    /\.ttf$/
  ],
  images: [
    /\.png$/,
    /\.jpg$/,
    /\.jpeg$/,
    /\.gif$/,
    /\.svg$/,
    /\.webp$/
  ],
  api: [
    /\/api\//
  ]
}

// Max cache sizes
const MAX_CACHE_SIZE = {
  dynamic: 50, // 50 entries
  images: 100  // 100 images
}

/**
 * Install Event
 * Cache static assets
 */
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[SW] Installing Service Worker v' + CACHE_VERSION)

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[SW] Static assets cached')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('[SW] Install failed:', error)
      })
  )
})

/**
 * Activate Event
 * Clean up old caches
 */
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[SW] Activating Service Worker v' + CACHE_VERSION)

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.startsWith('agentforge-') && !cacheName.startsWith(CACHE_VERSION)) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Old caches cleaned')
        return self.clients.claim()
      })
  )
})

/**
 * Fetch Event
 * Implement caching strategies
 */
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip chrome-extension and non-http(s) URLs
  if (!url.protocol.startsWith('http')) {
    return
  }

  // API requests: Network First with Cache Fallback
  if (CACHE_PATTERNS.api.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(networkFirstStrategy(request))
    return
  }

  // Images: Cache First with Network Fallback
  if (CACHE_PATTERNS.images.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE))
    return
  }

  // Static assets: Cache First with Network Fallback
  if (CACHE_PATTERNS.static.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE))
    return
  }

  // HTML: Network First with Cache Fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(request))
    return
  }

  // Default: Network First
  event.respondWith(networkFirstStrategy(request))
})

/**
 * Cache First Strategy
 * Try cache first, fallback to network
 */
async function cacheFirstStrategy(request: Request, cacheName: string): Promise<Response> {
  try {
    const cache = await caches.open(cacheName)
    const cached = await cache.match(request)

    if (cached) {
      console.log('[SW] Cache hit:', request.url)
      return cached
    }

    console.log('[SW] Cache miss, fetching:', request.url)
    const response = await fetch(request)

    if (response.ok) {
      await cache.put(request, response.clone())
      await limitCacheSize(cacheName, MAX_CACHE_SIZE.images)
    }

    return response
  } catch (error) {
    console.error('[SW] Cache first strategy failed:', error)
    throw error
  }
}

/**
 * Network First Strategy
 * Try network first, fallback to cache
 */
async function networkFirstStrategy(request: Request): Promise<Response> {
  try {
    const response = await fetch(request)

    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      await cache.put(request, response.clone())
      await limitCacheSize(DYNAMIC_CACHE, MAX_CACHE_SIZE.dynamic)
    }

    return response
  } catch (error) {
    console.log('[SW] Network failed, checking cache:', request.url)
    const cache = await caches.open(DYNAMIC_CACHE)
    const cached = await cache.match(request)

    if (cached) {
      console.log('[SW] Returning cached response')
      return cached
    }

    // Return offline page for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      const offlineResponse = await cache.match('/')
      if (offlineResponse) {
        return offlineResponse
      }
    }

    throw error
  }
}

/**
 * Limit cache size
 * Remove oldest entries if cache exceeds limit
 */
async function limitCacheSize(cacheName: string, maxSize: number): Promise<void> {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()

  if (keys.length > maxSize) {
    const deleteCount = keys.length - maxSize
    console.log(`[SW] Cache ${cacheName} exceeds limit, deleting ${deleteCount} entries`)

    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(keys[i])
    }
  }
}

/**
 * Background Sync Event
 * Sync data when connection is restored
 */
self.addEventListener('sync', (event: any) => {
  console.log('[SW] Background sync triggered:', event.tag)

  if (event.tag === 'sync-data') {
    event.waitUntil(syncData())
  }
})

/**
 * Sync data with backend
 */
async function syncData(): Promise<void> {
  try {
    console.log('[SW] Syncing data with backend')

    // Notify clients to trigger sync
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_REQUEST',
        timestamp: Date.now()
      })
    })

    console.log('[SW] Sync notification sent to clients')
  } catch (error) {
    console.error('[SW] Sync failed:', error)
  }
}

/**
 * Message Event
 * Handle messages from clients
 */
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  console.log('[SW] Message received:', event.data)

  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data?.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then(cache => cache.addAll(event.data.urls))
        .then(() => {
          event.ports[0]?.postMessage({ success: true })
        })
        .catch(error => {
          event.ports[0]?.postMessage({ success: false, error: error.message })
        })
    )
  }
})

/**
 * Push Notification Event
 * Handle push notifications
 */
self.addEventListener('push', (event: PushEvent) => {
  console.log('[SW] Push notification received')

  const data = event.data?.json() || {}
  const title = data.title || 'AgentForge'
  const options: NotificationOptions = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: data,
    actions: data.actions || []
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

/**
 * Notification Click Event
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('[SW] Notification clicked:', event.notification.data)

  event.notification.close()

  event.waitUntil(
    self.clients.openWindow(event.notification.data?.url || '/')
  )
})

console.log('[SW] Service Worker loaded')
