/**
 * WebApp Component
 * Web版特定的入口组件
 *
 * Features:
 * - PWA支持
 * - 快速登录
 * - 离线模式
 * - 性能优化
 */

import { useEffect, useState } from 'react'
import { getQuickAuth } from '../services/auth/quickAuth'
import { getCloudSync } from '../services/sync/cloudSync'
import { getIndexedDB } from '../services/offline/indexedDB'
import App from '../App'

/**
 * Install Prompt Event
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * WebApp Component
 */
export function WebApp() {
  const [isReady, setIsReady] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  /**
   * Initialize Web version
   */
  useEffect(() => {
    initializeWebApp()
  }, [])

  /**
   * Setup PWA install prompt
   */
  useEffect(() => {
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)

      // Check if user hasn't dismissed the banner before
      const dismissed = localStorage.getItem('install_banner_dismissed')
      if (!dismissed) {
        setShowInstallBanner(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
    }
  }, [])

  /**
   * Monitor online/offline status
   */
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  /**
   * Initialize web app services
   */
  async function initializeWebApp() {
    console.log('[WebApp] Initializing...')

    try {
      // 1. Register Service Worker
      await registerServiceWorker()

      // 2. Initialize IndexedDB
      const db = getIndexedDB()
      await db.initialize()

      // 3. Check authentication
      const auth = getQuickAuth()
      const authState = auth.getAuthState()

      if (!authState.isAuthenticated) {
        // Auto-login as guest for instant access
        console.log('[WebApp] Auto-logging in as guest')
        await auth.loginAsGuest()
      } else {
        console.log('[WebApp] User already authenticated')
      }

      // 4. Initialize cloud sync if authenticated
      if (authState.isAuthenticated && !authState.isGuest) {
        const cloudSync = getCloudSync()
        await cloudSync.initialize()
      }

      // 5. Pre-cache critical resources
      await preCacheCriticalResources()

      console.log('[WebApp] Initialization complete')
      setIsReady(true)
    } catch (error) {
      console.error('[WebApp] Initialization failed:', error)
      // Continue anyway - app should work offline
      setIsReady(true)
    }
  }

  /**
   * Register Service Worker
   */
  async function registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/serviceWorker.js', {
          scope: '/'
        })

        console.log('[WebApp] Service Worker registered:', registration.scope)

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[WebApp] New version available')
                // Show update notification
                showUpdateNotification()
              }
            })
          }
        })
      } catch (error) {
        console.error('[WebApp] Service Worker registration failed:', error)
      }
    }
  }

  /**
   * Pre-cache critical resources
   */
  async function preCacheCriticalResources(): Promise<void> {
    console.log('[WebApp] Pre-caching critical resources')

    const criticalUrls = [
      '/manifest.json',
      '/icon-192.png',
      '/icon-512.png'
    ]

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_URLS',
        urls: criticalUrls
      })
    }
  }

  /**
   * Show update notification
   */
  function showUpdateNotification() {
    const shouldUpdate = window.confirm('新版本可用！是否立即更新？')

    if (shouldUpdate) {
      // Tell service worker to skip waiting
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
      }

      // Reload page
      window.location.reload()
    }
  }

  /**
   * Handle PWA install
   */
  async function handleInstall() {
    if (!installPrompt) return

    try {
      await installPrompt.prompt()
      const choiceResult = await installPrompt.userChoice

      if (choiceResult.outcome === 'accepted') {
        console.log('[WebApp] PWA installed')
      }

      setInstallPrompt(null)
      setShowInstallBanner(false)
    } catch (error) {
      console.error('[WebApp] Install failed:', error)
    }
  }

  /**
   * Dismiss install banner
   */
  function dismissInstallBanner() {
    setShowInstallBanner(false)
    localStorage.setItem('install_banner_dismissed', 'true')
  }

  /**
   * Render loading screen
   */
  if (!isReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent" />
          <div className="mt-4 text-white text-lg">正在启动 AgentForge...</div>
          <div className="mt-2 text-gray-400 text-sm">首次加载可能需要几秒钟</div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex-1">
              <div className="font-bold text-lg">安装 AgentForge 到您的设备</div>
              <div className="text-sm opacity-90">获得类似原生应用的体验，支持离线使用</div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleInstall}
                className="px-6 py-2 bg-white text-cyan-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                安装
              </button>
              <button
                onClick={dismissInstallBanner}
                className="px-4 py-2 text-white/80 hover:text-white transition-colors"
              >
                稍后
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {isOffline && (
        <div className="fixed top-4 right-4 z-[9998] bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
          <span className="font-medium">离线模式</span>
        </div>
      )}

      {/* Main App */}
      <App />

      {/* Performance Monitoring */}
      {import.meta.env.DEV && <PerformanceMonitor />}
    </>
  )
}

/**
 * Performance Monitor (Dev Only)
 */
function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<{
    fps: number
    memory: number
    loadTime: number
  } | null>(null)

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let rafId: number

    const measureFPS = () => {
      frameCount++
      const now = performance.now()

      if (now >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime))
        const memory = (performance as any).memory
          ? Math.round((performance as any).memory.usedJSHeapSize / 1048576)
          : 0

        const loadTime = Math.round(performance.now())

        setMetrics({ fps, memory, loadTime })

        frameCount = 0
        lastTime = now
      }

      rafId = requestAnimationFrame(measureFPS)
    }

    rafId = requestAnimationFrame(measureFPS)

    return () => cancelAnimationFrame(rafId)
  }, [])

  if (!metrics) return null

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-black/80 text-white p-3 rounded-lg text-xs font-mono">
      <div>FPS: {metrics.fps}</div>
      <div>Memory: {metrics.memory} MB</div>
      <div>Load: {metrics.loadTime} ms</div>
    </div>
  )
}

export default WebApp
