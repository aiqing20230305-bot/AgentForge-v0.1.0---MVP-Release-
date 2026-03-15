/**
 * Electron API type definitions
 * Extends the Window interface with electronAPI
 */

export interface FileInfo {
  path: string
  name: string
  content: string
  category: string
  modifiedAt: string
}

export interface ElectronAPI {
  // File operations
  scanDirectory: (dirPath: string) => Promise<FileInfo[]>
  selectDirectory: () => Promise<string | null>
  saveFile: (content: string, defaultPath?: string) => Promise<string | null>
  writeFile: (filePath: string, content: string) => Promise<boolean>
  readFile: (filePath: string) => Promise<string | null>
  getHomeDir: () => Promise<string>

  // Store operations
  storeGet: <T>(key: string) => Promise<T | undefined>
  storeSet: <T>(key: string, value: T) => Promise<void>
  storeDelete: (key: string) => Promise<void>

  // Utilities
  openExternal: (url: string) => Promise<void>

  // Notifications
  showNotification: (options: {
    title: string
    body: string
    icon?: string
    silent?: boolean
  }) => Promise<{ success: boolean; error?: string }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
