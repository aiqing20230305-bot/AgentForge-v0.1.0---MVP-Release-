import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import path from 'path'
import fs from 'fs'
import Store from 'electron-store'

const store = new Store()

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#0a0a0f',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
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
}

app.whenReady().then(createWindow)

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
