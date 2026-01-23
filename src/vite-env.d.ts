/// <reference types="vite/client" />

interface FileInfo {
  path: string
  name: string
  content: string
  category: string
  modifiedAt: string
}

interface Window {
  electronAPI: {
    scanDirectory: (dirPath: string) => Promise<FileInfo[]>
    selectDirectory: () => Promise<string | null>
    saveFile: (content: string, defaultPath?: string) => Promise<string | null>
    writeFile: (filePath: string, content: string) => Promise<boolean>
    readFile: (filePath: string) => Promise<string | null>
    getHomeDir: () => Promise<string>
    storeGet: <T>(key: string) => Promise<T | undefined>
    storeSet: <T>(key: string, value: T) => Promise<void>
    storeDelete: (key: string) => Promise<void>
    openExternal: (url: string) => Promise<void>
  }
}
