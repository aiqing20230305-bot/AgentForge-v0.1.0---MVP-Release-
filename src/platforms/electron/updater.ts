/**
 * Auto Updater Manager
 * 自动更新管理
 */

import { app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import Store from 'electron-store'
import log from 'electron-log'

interface UpdateConfig {
  autoDownload: boolean
  autoInstallOnAppQuit: boolean
  checkOnStartup: boolean
  allowPrerelease: boolean
  lastCheckTime?: string
}

interface UpdateStore {
  config: UpdateConfig
}

export class UpdaterManager {
  private mainWindow: BrowserWindow | null = null
  private store: Store<UpdateStore>
  private updateDownloaded = false

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.store = new Store<UpdateStore>({
      name: 'updater',
      defaults: {
        config: {
          autoDownload: true,
          autoInstallOnAppQuit: true,
          checkOnStartup: true,
          allowPrerelease: false,
        },
      },
    })

    this.setupUpdater()
    this.setupIPC()
  }

  /**
   * Setup auto updater
   * 配置自动更新
   */
  private setupUpdater() {
    // Configure logger
    log.transports.file.level = 'info'
    autoUpdater.logger = log

    // Configure updater
    const config = this.store.get('config')
    autoUpdater.autoDownload = config.autoDownload
    autoUpdater.autoInstallOnAppQuit = config.autoInstallOnAppQuit
    autoUpdater.allowPrerelease = config.allowPrerelease

    // Set update feed URL (for production)
    if (!app.isPackaged) {
      // Development mode - disable auto update
      autoUpdater.autoDownload = false
      autoUpdater.autoInstallOnAppQuit = false
      log.info('[Updater] Running in development mode, updates disabled')
      return
    }

    // Event listeners
    autoUpdater.on('checking-for-update', () => {
      log.info('[Updater] Checking for updates...')
      this.sendStatusToWindow('checking-for-update')
    })

    autoUpdater.on('update-available', (info) => {
      log.info('[Updater] Update available:', info.version)
      this.sendStatusToWindow('update-available', {
        version: info.version,
        releaseNotes: info.releaseNotes,
        releaseDate: info.releaseDate,
      })
    })

    autoUpdater.on('update-not-available', (info) => {
      log.info('[Updater] Update not available:', info.version)
      this.sendStatusToWindow('update-not-available', {
        version: info.version,
      })
    })

    autoUpdater.on('error', (error) => {
      log.error('[Updater] Error:', error)
      this.sendStatusToWindow('update-error', {
        message: error.message,
      })
    })

    autoUpdater.on('download-progress', (progress) => {
      log.info(
        `[Updater] Download progress: ${progress.percent.toFixed(2)}% (${progress.transferred}/${progress.total})`
      )
      this.sendStatusToWindow('download-progress', {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total,
      })
    })

    autoUpdater.on('update-downloaded', (info) => {
      log.info('[Updater] Update downloaded:', info.version)
      this.updateDownloaded = true
      this.sendStatusToWindow('update-downloaded', {
        version: info.version,
        releaseNotes: info.releaseNotes,
        releaseDate: info.releaseDate,
      })
    })

    // Check for updates on startup if enabled
    if (config.checkOnStartup) {
      // Wait a bit before checking
      setTimeout(() => {
        this.checkForUpdates()
      }, 5000)
    }
  }

  /**
   * Setup IPC handlers
   * 配置 IPC 处理器
   */
  private setupIPC() {
    ipcMain.handle('updater:check', async () => {
      return await this.checkForUpdates()
    })

    ipcMain.handle('updater:download', async () => {
      return await this.downloadUpdate()
    })

    ipcMain.handle('updater:install', () => {
      this.quitAndInstall()
    })

    ipcMain.handle('updater:get-config', () => {
      return this.store.get('config')
    })

    ipcMain.handle('updater:set-config', (_, config: Partial<UpdateConfig>) => {
      const currentConfig = this.store.get('config')
      const newConfig = { ...currentConfig, ...config }
      this.store.set('config', newConfig)

      // Apply config changes
      if (config.autoDownload !== undefined) {
        autoUpdater.autoDownload = config.autoDownload
      }
      if (config.autoInstallOnAppQuit !== undefined) {
        autoUpdater.autoInstallOnAppQuit = config.autoInstallOnAppQuit
      }
      if (config.allowPrerelease !== undefined) {
        autoUpdater.allowPrerelease = config.allowPrerelease
      }

      return newConfig
    })

    ipcMain.handle('updater:get-version', () => {
      return app.getVersion()
    })
  }

  /**
   * Check for updates
   * 检查更新
   */
  async checkForUpdates(): Promise<{
    success: boolean
    updateAvailable?: boolean
    version?: string
    error?: string
  }> {
    if (!app.isPackaged) {
      return {
        success: false,
        error: 'Updates are disabled in development mode',
      }
    }

    try {
      log.info('[Updater] Manually checking for updates...')
      const result = await autoUpdater.checkForUpdates()

      // Update last check time
      const config = this.store.get('config')
      config.lastCheckTime = new Date().toISOString()
      this.store.set('config', config)

      if (result?.updateInfo) {
        return {
          success: true,
          updateAvailable: true,
          version: result.updateInfo.version,
        }
      }

      return {
        success: true,
        updateAvailable: false,
      }
    } catch (error: any) {
      log.error('[Updater] Check failed:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Download update
   * 下载更新
   */
  async downloadUpdate(): Promise<{ success: boolean; error?: string }> {
    if (!app.isPackaged) {
      return {
        success: false,
        error: 'Updates are disabled in development mode',
      }
    }

    try {
      log.info('[Updater] Downloading update...')
      await autoUpdater.downloadUpdate()
      return { success: true }
    } catch (error: any) {
      log.error('[Updater] Download failed:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Quit and install update
   * 退出并安装更新
   */
  quitAndInstall() {
    if (!this.updateDownloaded) {
      log.warn('[Updater] No update downloaded, cannot install')
      return
    }

    log.info('[Updater] Quitting and installing update...')
    // isSilent: false - show installer
    // isForceRunAfter: true - restart after installation
    autoUpdater.quitAndInstall(false, true)
  }

  /**
   * Send status to window
   * 发送状态到窗口
   */
  private sendStatusToWindow(event: string, data?: any) {
    if (!this.mainWindow) return

    this.mainWindow.webContents.send('updater-message', {
      event,
      data,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Schedule periodic check
   * 定时检查更新
   */
  schedulePeriodicCheck(intervalHours: number = 24) {
    const intervalMs = intervalHours * 60 * 60 * 1000

    setInterval(() => {
      log.info('[Updater] Periodic update check...')
      this.checkForUpdates()
    }, intervalMs)

    log.info(`[Updater] Scheduled periodic check every ${intervalHours} hours`)
  }
}
