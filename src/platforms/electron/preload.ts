import { contextBridge, ipcRenderer } from 'electron'

export interface FileInfo {
  path: string
  name: string
  content: string
  category: string
  modifiedAt: string
}

const electronAPI = {
  // File operations
  scanDirectory: (dirPath: string): Promise<FileInfo[]> =>
    ipcRenderer.invoke('scan-directory', dirPath),
  selectDirectory: (): Promise<string | null> =>
    ipcRenderer.invoke('select-directory'),
  saveFile: (content: string, defaultPath?: string): Promise<string | null> =>
    ipcRenderer.invoke('save-file', content, defaultPath),
  writeFile: (filePath: string, content: string): Promise<boolean> =>
    ipcRenderer.invoke('write-file', filePath, content),
  readFile: (filePath: string): Promise<string | null> =>
    ipcRenderer.invoke('read-file', filePath),
  getHomeDir: (): Promise<string> =>
    ipcRenderer.invoke('get-home-dir'),

  // Store operations
  storeGet: <T>(key: string): Promise<T | undefined> =>
    ipcRenderer.invoke('store-get', key),
  storeSet: <T>(key: string, value: T): Promise<void> =>
    ipcRenderer.invoke('store-set', key, value),
  storeDelete: (key: string): Promise<void> =>
    ipcRenderer.invoke('store-delete', key),

  // Utilities
  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke('open-external', url),

  // Notifications
  showNotification: (options: {
    title: string
    body: string
    icon?: string
    silent?: boolean
  }): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('show-notification', options),

  // Desktop Enhancement Features
  autoLaunch: {
    get: (): Promise<boolean> => ipcRenderer.invoke('auto-launch:get'),
    set: (enabled: boolean): Promise<boolean> => ipcRenderer.invoke('auto-launch:set', enabled),
  },

  clipboard: {
    readText: (): Promise<string> => ipcRenderer.invoke('clipboard:read-text'),
    writeText: (text: string): Promise<boolean> => ipcRenderer.invoke('clipboard:write-text', text),
    startWatch: (): Promise<boolean> => ipcRenderer.invoke('clipboard:start-watch'),
    stopWatch: (): Promise<boolean> => ipcRenderer.invoke('clipboard:stop-watch'),
    onChanged: (callback: (text: string) => void) => {
      ipcRenderer.on('clipboard-changed', (_, text) => callback(text))
    },
  },

  screenshot: {
    capture: (): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('screenshot:capture'),
  },

  window: {
    create: (config: any): Promise<number> => ipcRenderer.invoke('window:create', config),
    close: (id: string): Promise<void> => ipcRenderer.invoke('window:close', id),
    toggleMini: (): Promise<void> => ipcRenderer.invoke('window:toggle-mini'),
    screenshot: (): Promise<number> => ipcRenderer.invoke('window:screenshot'),
    getBounds: (): Promise<Electron.Rectangle> => ipcRenderer.invoke('window:get-bounds'),
    setBounds: (bounds: Electron.Rectangle): Promise<void> =>
      ipcRenderer.invoke('window:set-bounds', bounds),
    center: (): Promise<void> => ipcRenderer.invoke('window:center'),
    setAlwaysOnTop: (flag: boolean): Promise<void> =>
      ipcRenderer.invoke('window:set-always-on-top', flag),
    minimize: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
    maximize: (): Promise<void> => ipcRenderer.invoke('window:maximize'),
    closeCurrent: (): Promise<void> => ipcRenderer.invoke('window:close-current'),
    onTrayAction: (callback: (action: string) => void) => {
      ipcRenderer.on('tray-action', (_, action) => callback(action))
    },
    onShortcutAction: (callback: (action: string) => void) => {
      ipcRenderer.on('shortcut-action', (_, action) => callback(action))
    },
  },

  updater: {
    check: (): Promise<any> => ipcRenderer.invoke('updater:check'),
    download: (): Promise<any> => ipcRenderer.invoke('updater:download'),
    install: (): Promise<void> => ipcRenderer.invoke('updater:install'),
    getConfig: (): Promise<any> => ipcRenderer.invoke('updater:get-config'),
    setConfig: (config: any): Promise<any> => ipcRenderer.invoke('updater:set-config', config),
    getVersion: (): Promise<string> => ipcRenderer.invoke('updater:get-version'),
    onMessage: (callback: (message: any) => void) => {
      ipcRenderer.on('updater-message', (_, message) => callback(message))
    },
  },

  system: {
    getInfo: (): Promise<any> => ipcRenderer.invoke('system:get-info'),
    getPowerStatus: (): Promise<any> => ipcRenderer.invoke('power:get-status'),
    isOnline: (): Promise<boolean> => ipcRenderer.invoke('network:is-online'),
    getGPUInfo: (): Promise<any> => ipcRenderer.invoke('gpu:get-info'),
    disableHardwareAcceleration: (): Promise<boolean> =>
      ipcRenderer.invoke('gpu:disable-hardware-acceleration'),
    getMemoryInfo: (): Promise<any> => ipcRenderer.invoke('process:get-memory-info'),
  },

  fileDrag: {
    start: (filePath: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('file:drag-start', filePath),
  },

  deepLink: {
    register: (protocol: string): Promise<any> => ipcRenderer.invoke('deep-link:register', protocol),
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Type declaration for renderer
declare global {
  interface Window {
    electronAPI: typeof electronAPI
  }
}

// Export the type for use in other files
export type ElectronAPI = typeof electronAPI
