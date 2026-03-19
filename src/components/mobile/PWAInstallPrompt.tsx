/**
 * PWA安装提示组件
 * 引导用户安装到主屏幕
 */
import React, { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // 检测iOS设备
    const userAgent = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(ios)

    // 检查是否已经安装
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
    if (isInstalled) {
      return
    }

    // 检查是否已经关闭过提示
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissTime = parseInt(dismissed)
      const daysSinceDismiss = (Date.now() - dismissTime) / (1000 * 60 * 60 * 24)
      if (daysSinceDismiss < 7) {
        return // 7天内不再提示
      }
    }

    // 监听beforeinstallprompt事件（Android/Chrome）
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // iOS设备直接显示提示（因为iOS不支持beforeinstallprompt）
    if (ios && !isInstalled) {
      setTimeout(() => setShowPrompt(true), 3000) // 3秒后显示
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // iOS设备，显示指引
      return
    }

    // Android/Chrome设备，触发安装
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted installation')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up"
      style={{
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      <div
        className="relative p-4 rounded-2xl backdrop-blur-xl shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.3)'
        }}
      >
        {/* 关闭按钮 */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-3">
          {/* 图标 */}
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Download size={24} className="text-white" />
          </div>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold mb-1">
              安装AgentForge
            </h3>
            <p className="text-sm text-gray-300 mb-3">
              添加到主屏幕，随时管理你的AI Agent
            </p>

            {isIOS ? (
              // iOS安装指引
              <div className="text-xs text-gray-400 space-y-1">
                <p>1. 点击浏览器底部的 <strong>分享按钮</strong></p>
                <p>2. 选择 <strong>"添加到主屏幕"</strong></p>
              </div>
            ) : (
              // Android/Chrome安装按钮
              <button
                onClick={handleInstall}
                className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium rounded-lg active:scale-95 transition-transform"
              >
                立即安装
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 添加动画
const style = document.createElement('style')
style.textContent = `
@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
`
document.head.appendChild(style)
