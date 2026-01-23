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
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Type declaration for renderer
declare global {
  interface Window {
    electronAPI: typeof electronAPI
  }
}
