import { app, BrowserWindow, ipcMain, dialog, shell, clipboard } from 'electron'
import path from 'path'
import fs from 'fs'
import Store from 'electron-store'
import { TrayManager } from './tray'
import { ShortcutManager } from './shortcut'
import { UpdaterManager } from './updater'
import { WindowManager } from './windowManager'

const store = new Store()

let mainWindow: BrowserWindow | null = null
let trayManager: TrayManager | null = null
let shortcutManager: ShortcutManager | null = null
let updaterManager: UpdaterManager | null = null
let windowManager: WindowManager | null = null

// Clipboard monitoring
let clipboardWatcher: NodeJS.Timeout | null = null
let lastClipboardText = ''

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#0a0a0f',
    title: 'AgentForge - AI Agent Builder',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // 允许跨域请求到 localhost OpenClaw Gateway
    },
  })

  if (process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Initialize managers
  initializeManagers()
}

/**
 * Initialize all managers
 * 初始化所有管理器
 */
function initializeManagers() {
  if (!mainWindow) return

  // System Tray
  trayManager = new TrayManager(mainWindow)
  trayManager.create()

  // Global Shortcuts
  shortcutManager = new ShortcutManager(mainWindow)
  shortcutManager.registerAll()

  // Auto Updater
  updaterManager = new UpdaterManager(mainWindow)

  // Window Manager
  windowManager = new WindowManager()
  windowManager.setMainWindow(mainWindow)

  console.log('[Main] All managers initialized')
}

app.whenReady().then(() => {
  createWindow()

  // Enable auto-launch (optional)
  setupAutoLaunch()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('before-quit', () => {
  // Cleanup
  if (clipboardWatcher) {
    clearInterval(clipboardWatcher)
  }
  if (shortcutManager) {
    shortcutManager.unregisterAll()
  }
  if (trayManager) {
    trayManager.destroy()
  }
})

// IPC Handlers

// Scan directory for markdown files
ipcMain.handle('scan-directory', async (_, dirPath: string): Promise<FileInfo[]> => {
  const files: FileInfo[] = []

  async function scanDir(currentPath: string) {
    try {
      const entries = await fs.promises.readdir(currentPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name)

        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          await scanDir(fullPath)
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          try {
            const content = await fs.promises.readFile(fullPath, 'utf-8')
            const stats = await fs.promises.stat(fullPath)

            // Extract name from first # heading or filename
            const headingMatch = content.match(/^#\s+(.+)$/m)
            const name = headingMatch ? headingMatch[1] : path.basename(fullPath, '.md')

            // Try to detect category from path or content
            const category = detectCategory(fullPath, content)

            files.push({
              path: fullPath,
              name,
              content,
              category,
              modifiedAt: stats.mtime.toISOString(),
            })
          } catch (err) {
            console.error(`Error reading file ${fullPath}:`, err)
          }
        }
      }
    } catch (err) {
      console.error(`Error scanning directory ${currentPath}:`, err)
    }
  }

  await scanDir(dirPath)
  return files
})

interface FileInfo {
  path: string
  name: string
  content: string
  category: string
  modifiedAt: string
}

function detectCategory(filePath: string, content: string): string {
  const pathLower = filePath.toLowerCase()
  const contentLower = content.toLowerCase()

  // Check path for category hints
  if (pathLower.includes('/roles/') || pathLower.includes('role')) return 'roles'
  if (pathLower.includes('/skills/') || pathLower.includes('skill')) return 'skills'
  if (pathLower.includes('/behaviors/') || pathLower.includes('behavior')) return 'behaviors'
  if (pathLower.includes('/personalities/') || pathLower.includes('personality')) return 'personalities'
  if (pathLower.includes('/constraints/') || pathLower.includes('constraint')) return 'constraints'
  if (pathLower.includes('/contexts/') || pathLower.includes('context')) return 'contexts'
  if (pathLower.includes('/formats/') || pathLower.includes('format')) return 'formats'
  if (pathLower.includes('/tools/') || pathLower.includes('tool')) return 'tools'

  // Check content for category hints
  if (contentLower.includes('you are a') || contentLower.includes('act as')) return 'roles'
  if (contentLower.includes('you can') || contentLower.includes('ability')) return 'skills'
  if (contentLower.includes('always') || contentLower.includes('never')) return 'behaviors'
  if (contentLower.includes('personality') || contentLower.includes('tone')) return 'personalities'
  if (contentLower.includes('must not') || contentLower.includes('forbidden')) return 'constraints'
  if (contentLower.includes('context') || contentLower.includes('background')) return 'contexts'
  if (contentLower.includes('format') || contentLower.includes('output')) return 'formats'
  if (contentLower.includes('tool') || contentLower.includes('function')) return 'tools'

  return 'skills' // Default category
}

// Select directory dialog
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
    title: 'Select Agent Components Folder'
  })

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

// Save file dialog
ipcMain.handle('save-file', async (_, content: string, defaultPath?: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    title: 'Save agents.md',
    defaultPath: defaultPath || 'agents.md',
    filters: [
      { name: 'Markdown', extensions: ['md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (!result.canceled && result.filePath) {
    await fs.promises.writeFile(result.filePath, content, 'utf-8')
    return result.filePath
  }
  return null
})

// Write file directly (for .claude/agents.md)
ipcMain.handle('write-file', async (_, filePath: string, content: string) => {
  try {
    const dir = path.dirname(filePath)
    await fs.promises.mkdir(dir, { recursive: true })
    await fs.promises.writeFile(filePath, content, 'utf-8')
    return true
  } catch (err) {
    console.error('Error writing file:', err)
    return false
  }
})

// Read file
ipcMain.handle('read-file', async (_, filePath: string) => {
  try {
    return await fs.promises.readFile(filePath, 'utf-8')
  } catch {
    return null
  }
})

// Get home directory
ipcMain.handle('get-home-dir', () => {
  return app.getPath('home')
})

// Store operations
ipcMain.handle('store-get', (_, key: string) => {
  return store.get(key)
})

ipcMain.handle('store-set', (_, key: string, value: unknown) => {
  store.set(key, value)
})

ipcMain.handle('store-delete', (_, key: string) => {
  store.delete(key)
})

// Open external link
ipcMain.handle('open-external', (_, url: string) => {
  shell.openExternal(url)
})

// Desktop notification
ipcMain.handle('show-notification', (_, options: {
  title: string
  body: string
  icon?: string
  silent?: boolean
}) => {
  try {
    const { Notification } = require('electron')
    if (Notification.isSupported()) {
      const notification = new Notification({
        title: options.title,
        body: options.body,
        icon: options.icon,
        silent: options.silent ?? false
      })
      notification.show()
      return { success: true }
    }
    return { success: false, error: 'Notifications not supported' }
  } catch (error) {
    console.error('Notification error:', error)
    return { success: false, error: String(error) }
  }
})

// ==================== Desktop Enhancement Features ====================

/**
 * Setup auto launch
 * 设置开机自启动
 */
function setupAutoLaunch() {
  const autoLaunchEnabled = store.get('autoLaunch', false) as boolean

  if (autoLaunchEnabled) {
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: false,
    })
    console.log('[Main] Auto launch enabled')
  }
}

// Auto launch control
ipcMain.handle('auto-launch:get', () => {
  return app.getLoginItemSettings().openAtLogin
})

ipcMain.handle('auto-launch:set', (_, enabled: boolean) => {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    openAsHidden: false,
  })
  store.set('autoLaunch', enabled)
  return enabled
})

// Clipboard operations
ipcMain.handle('clipboard:read-text', () => {
  return clipboard.readText()
})

ipcMain.handle('clipboard:write-text', (_, text: string) => {
  clipboard.writeText(text)
  return true
})

ipcMain.handle('clipboard:start-watch', () => {
  if (clipboardWatcher) {
    return false // Already watching
  }

  lastClipboardText = clipboard.readText()

  clipboardWatcher = setInterval(() => {
    const currentText = clipboard.readText()
    if (currentText && currentText !== lastClipboardText) {
      lastClipboardText = currentText
      mainWindow?.webContents.send('clipboard-changed', currentText)
    }
  }, 1000)

  console.log('[Main] Clipboard watching started')
  return true
})

ipcMain.handle('clipboard:stop-watch', () => {
  if (clipboardWatcher) {
    clearInterval(clipboardWatcher)
    clipboardWatcher = null
    console.log('[Main] Clipboard watching stopped')
    return true
  }
  return false
})

// Screenshot capture
ipcMain.handle('screenshot:capture', async () => {
  try {
    if (!mainWindow) return null

    // Hide main window temporarily
    const wasVisible = mainWindow.isVisible()
    if (wasVisible) {
      mainWindow.hide()
    }

    // Wait for window to hide
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Create screenshot window
    if (windowManager) {
      windowManager.createScreenshotWindow()
    }

    return { success: true }
  } catch (error: any) {
    console.error('[Main] Screenshot error:', error)
    return { success: false, error: error.message }
  }
})

// File drag & drop support
ipcMain.handle('file:drag-start', (_, filePath: string) => {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'File not found' }
    }

    // This is handled by the renderer process with HTML5 drag/drop
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// System info
ipcMain.handle('system:get-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: app.getVersion(),
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    chromiumVersion: process.versions.chrome,
  }
})

// Power monitor
ipcMain.handle('power:get-status', () => {
  const { powerMonitor } = require('electron')
  return {
    onBattery: powerMonitor.isOnBatteryPower(),
    charging: !powerMonitor.isOnBatteryPower(),
  }
})

// Network status
ipcMain.handle('network:is-online', () => {
  const { net } = require('electron')
  return net.isOnline()
})

// GPU acceleration control
ipcMain.handle('gpu:get-info', () => {
  return app.getGPUInfo('complete')
})

ipcMain.handle('gpu:disable-hardware-acceleration', () => {
  app.disableHardwareAcceleration()
  return true
})

// Memory info
ipcMain.handle('process:get-memory-info', async () => {
  if (!mainWindow) return null
  return await mainWindow.webContents.getProcessMemoryInfo()
})

// Deep linking support
app.setAsDefaultProtocolClient('agentforge')

ipcMain.handle('deep-link:register', (_, protocol: string) => {
  if (app.isDefaultProtocolClient(protocol)) {
    return { success: true, message: 'Already registered' }
  }

  if (app.setAsDefaultProtocolClient(protocol)) {
    return { success: true }
  }

  return { success: false, error: 'Failed to register protocol' }
})
