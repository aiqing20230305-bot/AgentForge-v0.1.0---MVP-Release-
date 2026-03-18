/**
 * System Tray Management
 * 系统托盘管理
 */

import { app, Menu, Tray, BrowserWindow, nativeImage } from 'electron'
import path from 'path'

export class TrayManager {
  private tray: Tray | null = null
  private mainWindow: BrowserWindow | null = null

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
  }

  /**
   * Create system tray
   * 创建系统托盘
   */
  create() {
    // Create tray icon
    const iconPath = this.getTrayIconPath()
    const icon = nativeImage.createFromPath(iconPath)

    // Resize icon for tray
    const trayIcon = icon.resize({ width: 16, height: 16 })
    this.tray = new Tray(trayIcon)

    // Set tooltip
    this.tray.setToolTip('AgentForge - AI Agent Builder')

    // Create context menu
    this.updateContextMenu()

    // Click to show/hide window
    this.tray.on('click', () => {
      this.toggleWindow()
    })

    // Right click to show menu
    this.tray.on('right-click', () => {
      this.tray?.popUpContextMenu()
    })

    return this.tray
  }

  /**
   * Update context menu
   * 更新右键菜单
   */
  updateContextMenu(customItems?: Electron.MenuItemConstructorOptions[]) {
    if (!this.tray) return

    const defaultItems: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'Show AgentForge',
        click: () => this.showWindow(),
      },
      {
        label: 'Hide AgentForge',
        click: () => this.hideWindow(),
      },
      { type: 'separator' },
      {
        label: 'Quick Actions',
        submenu: [
          {
            label: 'New Agent',
            accelerator: 'CommandOrControl+N',
            click: () => this.sendAction('new-agent'),
          },
          {
            label: 'Open Workspace',
            accelerator: 'CommandOrControl+O',
            click: () => this.sendAction('open-workspace'),
          },
          {
            label: 'Global Search',
            accelerator: 'CommandOrControl+K',
            click: () => this.sendAction('global-search'),
          },
        ],
      },
      { type: 'separator' },
      ...(customItems || []),
      { type: 'separator' },
      {
        label: 'Settings',
        accelerator: 'CommandOrControl+,',
        click: () => this.sendAction('settings'),
      },
      {
        label: 'About',
        click: () => this.sendAction('about'),
      },
      { type: 'separator' },
      {
        label: 'Quit',
        accelerator: 'CommandOrControl+Q',
        click: () => {
          app.quit()
        },
      },
    ]

    const contextMenu = Menu.buildFromTemplate(defaultItems)
    this.tray.setContextMenu(contextMenu)
  }

  /**
   * Toggle window visibility
   * 切换窗口显示/隐藏
   */
  toggleWindow() {
    if (!this.mainWindow) return

    if (this.mainWindow.isVisible()) {
      this.hideWindow()
    } else {
      this.showWindow()
    }
  }

  /**
   * Show window
   * 显示窗口
   */
  showWindow() {
    if (!this.mainWindow) return

    this.mainWindow.show()
    this.mainWindow.focus()
  }

  /**
   * Hide window
   * 隐藏窗口
   */
  hideWindow() {
    if (!this.mainWindow) return
    this.mainWindow.hide()
  }

  /**
   * Send action to renderer
   * 发送操作到渲染进程
   */
  private sendAction(action: string) {
    if (!this.mainWindow) return
    this.mainWindow.webContents.send('tray-action', action)
  }

  /**
   * Update tray icon
   * 更新托盘图标
   */
  updateIcon(iconPath: string) {
    if (!this.tray) return

    const icon = nativeImage.createFromPath(iconPath)
    const trayIcon = icon.resize({ width: 16, height: 16 })
    this.tray.setImage(trayIcon)
  }

  /**
   * Update tooltip
   * 更新提示文本
   */
  updateTooltip(tooltip: string) {
    if (!this.tray) return
    this.tray.setToolTip(tooltip)
  }

  /**
   * Show balloon notification (Windows only)
   * 显示气球通知（仅 Windows）
   */
  showBalloon(options: { title: string; content: string; icon?: string }) {
    if (!this.tray) return
    if (process.platform !== 'win32') return

    this.tray.displayBalloon({
      title: options.title,
      content: options.content,
      icon: options.icon ? nativeImage.createFromPath(options.icon) : undefined,
    })
  }

  /**
   * Get tray icon path
   * 获取托盘图标路径
   */
  private getTrayIconPath(): string {
    const isDev = process.env.NODE_ENV === 'development'

    if (process.platform === 'darwin') {
      // macOS uses template icons
      return isDev
        ? path.join(__dirname, '../../public/icon-tray-template.png')
        : path.join(process.resourcesPath, 'icon-tray-template.png')
    } else if (process.platform === 'win32') {
      return isDev
        ? path.join(__dirname, '../../public/icon-tray.ico')
        : path.join(process.resourcesPath, 'icon-tray.ico')
    } else {
      // Linux
      return isDev
        ? path.join(__dirname, '../../public/icon-tray.png')
        : path.join(process.resourcesPath, 'icon-tray.png')
    }
  }

  /**
   * Destroy tray
   * 销毁托盘
   */
  destroy() {
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
  }
}
