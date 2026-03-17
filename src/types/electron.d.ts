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

  // Desktop Enhancement Features
  autoLaunch: {
    get: () => Promise<boolean>
    set: (enabled: boolean) => Promise<boolean>
  }

  clipboard: {
    readText: () => Promise<string>
    writeText: (text: string) => Promise<boolean>
    startWatch: () => Promise<boolean>
    stopWatch: () => Promise<boolean>
    onChanged: (callback: (text: string) => void) => void
  }

  screenshot: {
    capture: () => Promise<{ success: boolean; error?: string }>
  }

  window: {
    create: (config: any) => Promise<number>
    close: (id: string) => Promise<void>
    toggleMini: () => Promise<void>
    screenshot: () => Promise<number>
    getBounds: () => Promise<Electron.Rectangle>
    setBounds: (bounds: Electron.Rectangle) => Promise<void>
    center: () => Promise<void>
    setAlwaysOnTop: (flag: boolean) => Promise<void>
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    closeCurrent: () => Promise<void>
    onTrayAction: (callback: (action: string) => void) => void
    onShortcutAction: (callback: (action: string) => void) => void
  }

  updater: {
    check: () => Promise<any>
    download: () => Promise<any>
    install: () => Promise<void>
    getConfig: () => Promise<any>
    setConfig: (config: any) => Promise<any>
    getVersion: () => Promise<string>
    onMessage: (callback: (message: any) => void) => void
  }

  system: {
    getInfo: () => Promise<any>
    getPowerStatus: () => Promise<any>
    isOnline: () => Promise<boolean>
    getGPUInfo: () => Promise<any>
    disableHardwareAcceleration: () => Promise<boolean>
    getMemoryInfo: () => Promise<any>
  }

  fileDrag: {
    start: (filePath: string) => Promise<{ success: boolean; error?: string }>
  }

  deepLink: {
    register: (protocol: string) => Promise<any>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
