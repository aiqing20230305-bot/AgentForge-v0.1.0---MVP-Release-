/**
 * Desktop Features Hook
 * 桌面功能 Hook - 提供所有桌面增强功能的访问接口
 */

import { useEffect, useState, useCallback } from 'react'

interface SystemInfo {
  platform: string
  arch: string
  version: string
  electronVersion: string
  nodeVersion: string
  chromiumVersion: string
}

interface PowerStatus {
  onBattery: boolean
  charging: boolean
}

interface UpdateStatus {
  event: string
  data?: any
  timestamp: string
}

export function useDesktopFeatures() {
  const [isElectron, setIsElectron] = useState(false)
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [powerStatus, setPowerStatus] = useState<PowerStatus | null>(null)

  useEffect(() => {
    setIsElectron(typeof window !== 'undefined' && !!window.electronAPI)
  }, [])

  // System Info
  const getSystemInfo = useCallback(async () => {
    if (!isElectron) return null
    const info = await window.electronAPI.system.getInfo()
    setSystemInfo(info)
    return info
  }, [isElectron])

  // Network Status
  const checkOnlineStatus = useCallback(async () => {
    if (!isElectron) return true
    const online = await window.electronAPI.system.isOnline()
    setIsOnline(online)
    return online
  }, [isElectron])

  // Power Status
  const checkPowerStatus = useCallback(async () => {
    if (!isElectron) return null
    const status = await window.electronAPI.system.getPowerStatus()
    setPowerStatus(status)
    return status
  }, [isElectron])

  // Auto Launch
  const getAutoLaunch = useCallback(async () => {
    if (!isElectron) return false
    return await window.electronAPI.autoLaunch.get()
  }, [isElectron])

  const setAutoLaunch = useCallback(
    async (enabled: boolean) => {
      if (!isElectron) return false
      return await window.electronAPI.autoLaunch.set(enabled)
    },
    [isElectron]
  )

  // Clipboard
  const clipboard = {
    read: useCallback(async () => {
      if (!isElectron) return ''
      return await window.electronAPI.clipboard.readText()
    }, [isElectron]),

    write: useCallback(
      async (text: string) => {
        if (!isElectron) return false
        return await window.electronAPI.clipboard.writeText(text)
      },
      [isElectron]
    ),

    startWatch: useCallback(async () => {
      if (!isElectron) return false
      return await window.electronAPI.clipboard.startWatch()
    }, [isElectron]),

    stopWatch: useCallback(async () => {
      if (!isElectron) return false
      return await window.electronAPI.clipboard.stopWatch()
    }, [isElectron]),

    onChanged: useCallback(
      (callback: (text: string) => void) => {
        if (!isElectron) return
        window.electronAPI.clipboard.onChanged(callback)
      },
      [isElectron]
    ),
  }

  // Screenshot
  const captureScreenshot = useCallback(async () => {
    if (!isElectron) return null
    return await window.electronAPI.screenshot.capture()
  }, [isElectron])

  // Window Management
  const windowManager = {
    toggleMini: useCallback(async () => {
      if (!isElectron) return
      await window.electronAPI.window.toggleMini()
    }, [isElectron]),

    minimize: useCallback(async () => {
      if (!isElectron) return
      await window.electronAPI.window.minimize()
    }, [isElectron]),

    maximize: useCallback(async () => {
      if (!isElectron) return
      await window.electronAPI.window.maximize()
    }, [isElectron]),

    close: useCallback(async () => {
      if (!isElectron) return
      await window.electronAPI.window.closeCurrent()
    }, [isElectron]),

    center: useCallback(async () => {
      if (!isElectron) return
      await window.electronAPI.window.center()
    }, [isElectron]),

    setAlwaysOnTop: useCallback(
      async (flag: boolean) => {
        if (!isElectron) return
        await window.electronAPI.window.setAlwaysOnTop(flag)
      },
      [isElectron]
    ),

    getBounds: useCallback(async () => {
      if (!isElectron) return null
      return await window.electronAPI.window.getBounds()
    }, [isElectron]),

    setBounds: useCallback(
      async (bounds: Electron.Rectangle) => {
        if (!isElectron) return
        await window.electronAPI.window.setBounds(bounds)
      },
      [isElectron]
    ),

    onTrayAction: useCallback(
      (callback: (action: string) => void) => {
        if (!isElectron) return
        window.electronAPI.window.onTrayAction(callback)
      },
      [isElectron]
    ),

    onShortcutAction: useCallback(
      (callback: (action: string) => void) => {
        if (!isElectron) return
        window.electronAPI.window.onShortcutAction(callback)
      },
      [isElectron]
    ),
  }

  // Notifications
  const showNotification = useCallback(
    async (options: { title: string; body: string; icon?: string; silent?: boolean }) => {
      if (!isElectron) {
        // Fallback to Web Notifications API
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(options.title, {
            body: options.body,
            icon: options.icon,
            silent: options.silent,
          })
          return { success: true }
        }
        return { success: false, error: 'Notifications not supported' }
      }
      return await window.electronAPI.showNotification(options)
    },
    [isElectron]
  )

  // Updater
  const updater = {
    check: useCallback(async () => {
      if (!isElectron) return null
      return await window.electronAPI.updater.check()
    }, [isElectron]),

    download: useCallback(async () => {
      if (!isElectron) return null
      return await window.electronAPI.updater.download()
    }, [isElectron]),

    install: useCallback(async () => {
      if (!isElectron) return
      await window.electronAPI.updater.install()
    }, [isElectron]),

    getVersion: useCallback(async () => {
      if (!isElectron) return null
      return await window.electronAPI.updater.getVersion()
    }, [isElectron]),

    getConfig: useCallback(async () => {
      if (!isElectron) return null
      return await window.electronAPI.updater.getConfig()
    }, [isElectron]),

    setConfig: useCallback(
      async (config: any) => {
        if (!isElectron) return null
        return await window.electronAPI.updater.setConfig(config)
      },
      [isElectron]
    ),

    onMessage: useCallback(
      (callback: (message: UpdateStatus) => void) => {
        if (!isElectron) return
        window.electronAPI.updater.onMessage(callback)
      },
      [isElectron]
    ),
  }

  // Memory Info
  const getMemoryInfo = useCallback(async () => {
    if (!isElectron) return null
    return await window.electronAPI.system.getMemoryInfo()
  }, [isElectron])

  // GPU Info
  const getGPUInfo = useCallback(async () => {
    if (!isElectron) return null
    return await window.electronAPI.system.getGPUInfo()
  }, [isElectron])

  return {
    isElectron,
    systemInfo,
    isOnline,
    powerStatus,
    getSystemInfo,
    checkOnlineStatus,
    checkPowerStatus,
    getAutoLaunch,
    setAutoLaunch,
    clipboard,
    captureScreenshot,
    windowManager,
    showNotification,
    updater,
    getMemoryInfo,
    getGPUInfo,
  }
}

/**
 * Hook to listen for tray actions
 * 监听托盘操作的 Hook
 */
export function useTrayActions(handler: (action: string) => void) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.window.onTrayAction(handler)
    }
  }, [handler])
}

/**
 * Hook to listen for shortcut actions
 * 监听快捷键操作的 Hook
 */
export function useShortcutActions(handler: (action: string) => void) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.window.onShortcutAction(handler)
    }
  }, [handler])
}

/**
 * Hook to listen for clipboard changes
 * 监听剪贴板变化的 Hook
 */
export function useClipboardWatch(handler: (text: string) => void, enabled = false) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.electronAPI) return

    window.electronAPI.clipboard.startWatch()
    window.electronAPI.clipboard.onChanged(handler)

    return () => {
      window.electronAPI.clipboard.stopWatch()
    }
  }, [handler, enabled])
}

/**
 * Hook to listen for update events
 * 监听更新事件的 Hook
 */
export function useUpdateListener(handler: (status: UpdateStatus) => void) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.updater.onMessage(handler)
    }
  }, [handler])
}
