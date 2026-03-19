/**
 * Window Manager
 * 多窗口管理
 */

import { BrowserWindow, screen, ipcMain } from 'electron'
import path from 'path'
import Store from 'electron-store'

interface WindowConfig {
  id: string
  type: 'main' | 'mini' | 'screenshot' | 'custom'
  x?: number
  y?: number
  width?: number
  height?: number
  alwaysOnTop?: boolean
  frame?: boolean
  transparent?: boolean
  route?: string
}

interface WindowState {
  windows: { [id: string]: WindowConfig }
}

export class WindowManager {
  private windows: Map<string, BrowserWindow> = new Map()
  private store: Store<WindowState>
  private mainWindow: BrowserWindow | null = null

  constructor() {
    this.store = new Store<WindowState>({
      name: 'windows',
      defaults: {
        windows: {},
      },
    })

    this.setupIPC()
  }

  /**
   * Set main window
   * 设置主窗口
   */
  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window
    this.windows.set('main', window)
  }

  /**
   * Create new window
   * 创建新窗口
   */
  createWindow(config: WindowConfig): BrowserWindow {
    const existingWindow = this.windows.get(config.id)
    if (existingWindow && !existingWindow.isDestroyed()) {
      existingWindow.focus()
      return existingWindow
    }

    // Get display bounds
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

    // Default window options
    const defaultOptions: Electron.BrowserWindowConstructorOptions = {
      width: config.width || 800,
      height: config.height || 600,
      x: config.x,
      y: config.y,
      backgroundColor: '#0a0a0f',
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    }

    // Type-specific options
    let windowOptions: Electron.BrowserWindowConstructorOptions = { ...defaultOptions }

    switch (config.type) {
      case 'mini':
        windowOptions = {
          ...windowOptions,
          width: 400,
          height: 500,
          frame: false,
          transparent: true,
          alwaysOnTop: true,
          resizable: false,
          skipTaskbar: true,
          x: screenWidth - 420,
          y: 80,
        }
        break

      case 'screenshot':
        windowOptions = {
          ...windowOptions,
          width: screenWidth,
          height: screenHeight,
          frame: false,
          transparent: true,
          alwaysOnTop: true,
          fullscreen: true,
          skipTaskbar: true,
        }
        break

      case 'custom':
        windowOptions = {
          ...windowOptions,
          frame: config.frame ?? true,
          transparent: config.transparent ?? false,
          alwaysOnTop: config.alwaysOnTop ?? false,
        }
        break
    }

    // Create window
    const window = new BrowserWindow(windowOptions)

    // Load content
    const isDev = process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL
    if (isDev) {
      const baseUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'
      const route = config.route ? `#${config.route}` : ''
      window.loadURL(`${baseUrl}${route}`)
    } else {
      window.loadFile(path.join(__dirname, '../dist/index.html'), {
        hash: config.route || '',
      })
    }

    // Show when ready
    window.once('ready-to-show', () => {
      window.show()
    })

    // Handle close
    window.on('closed', () => {
      this.windows.delete(config.id)
    })

    // Store window
    this.windows.set(config.id, window)

    // Save config
    this.saveWindowConfig(config)

    return window
  }

  /**
   * Get window by ID
   * 根据 ID 获取窗口
   */
  getWindow(id: string): BrowserWindow | undefined {
    return this.windows.get(id)
  }

  /**
   * Close window
   * 关闭窗口
   */
  closeWindow(id: string) {
    const window = this.windows.get(id)
    if (window && !window.isDestroyed()) {
      window.close()
    }
  }

  /**
   * Close all windows except main
   * 关闭除主窗口外的所有窗口
   */
  closeAllExceptMain() {
    this.windows.forEach((window, id) => {
      if (id !== 'main' && !window.isDestroyed()) {
        window.close()
      }
    })
  }

  /**
   * Toggle mini mode
   * 切换迷你模式
   */
  toggleMiniMode() {
    const miniWindow = this.windows.get('mini')

    if (miniWindow && !miniWindow.isDestroyed()) {
      miniWindow.close()
    } else {
      this.createWindow({
        id: 'mini',
        type: 'mini',
        route: '/mini',
      })

      // Optionally hide main window
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.hide()
      }
    }
  }

  /**
   * Create screenshot window
   * 创建截图窗口
   */
  createScreenshotWindow(): BrowserWindow {
    return this.createWindow({
      id: 'screenshot',
      type: 'screenshot',
      route: '/screenshot',
    })
  }

  /**
   * Save window config
   * 保存窗口配置
   */
  private saveWindowConfig(config: WindowConfig) {
    const windows = this.store.get('windows')
    windows[config.id] = config
    this.store.set('windows', windows)
  }

  /**
   * Restore saved windows
   * 恢复保存的窗口
   */
  restoreWindows() {
    const savedWindows = this.store.get('windows')

    Object.entries(savedWindows).forEach(([id, config]) => {
      if (id !== 'main' && config.type !== 'screenshot') {
        this.createWindow(config)
      }
    })
  }

  /**
   * Setup IPC handlers
   * 配置 IPC 处理器
   */
  private setupIPC() {
    ipcMain.handle('window:create', (_, config: WindowConfig) => {
      const window = this.createWindow(config)
      return window.id
    })

    ipcMain.handle('window:close', (_, id: string) => {
      this.closeWindow(id)
    })

    ipcMain.handle('window:toggle-mini', () => {
      this.toggleMiniMode()
    })

    ipcMain.handle('window:screenshot', () => {
      const window = this.createScreenshotWindow()
      return window.id
    })

    ipcMain.handle('window:get-bounds', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      return window?.getBounds()
    })

    ipcMain.handle('window:set-bounds', (event, bounds: Electron.Rectangle) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      window?.setBounds(bounds)
    })

    ipcMain.handle('window:center', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      window?.center()
    })

    ipcMain.handle('window:set-always-on-top', (event, flag: boolean) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      window?.setAlwaysOnTop(flag)
    })

    ipcMain.handle('window:minimize', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      window?.minimize()
    })

    ipcMain.handle('window:maximize', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (window?.isMaximized()) {
        window.unmaximize()
      } else {
        window?.maximize()
      }
    })

    ipcMain.handle('window:close-current', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      window?.close()
    })
  }

  /**
   * Get all windows
   * 获取所有窗口
   */
  getAllWindows(): BrowserWindow[] {
    return Array.from(this.windows.values()).filter((w) => !w.isDestroyed())
  }

  /**
   * Get window count
   * 获取窗口数量
   */
  getWindowCount(): number {
    return this.getAllWindows().length
  }
}
