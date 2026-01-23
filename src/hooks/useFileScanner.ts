import { useCallback, useState } from 'react'
import type { AgentItem, Category } from '../types'
import { getRarityFromTokens } from '../types'
import { countTokens } from '../utils/tokenizer'

interface FileInfo {
  path: string
  name: string
  content: string
  category: string
  modifiedAt: string
}

interface UseScannerReturn {
  items: AgentItem[]
  isScanning: boolean
  error: string | null
  scan: (dirPath: string) => Promise<AgentItem[]>
}

export function useFileScanner(): UseScannerReturn {
  const [items, setItems] = useState<AgentItem[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scan = useCallback(async (dirPath: string): Promise<AgentItem[]> => {
    setIsScanning(true)
    setError(null)

    try {
      const files: FileInfo[] = await window.electronAPI.scanDirectory(dirPath)

      const agentItems: AgentItem[] = files.map((file) => {
        const tokens = countTokens(file.content)
        return {
          id: file.path,
          path: file.path,
          name: file.name,
          category: file.category as Category,
          content: file.content,
          tokens,
          rarity: getRarityFromTokens(tokens),
          modifiedAt: file.modifiedAt
        }
      })

      setItems(agentItems)
      return agentItems
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to scan directory'
      setError(message)
      return []
    } finally {
      setIsScanning(false)
    }
  }, [])

  return { items, isScanning, error, scan }
}
