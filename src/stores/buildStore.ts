import { create } from 'zustand'
import type { AgentItem, Category, SlotType, Loadout, Settings } from '../types'
import { SLOT_CONFIG, getRarityFromTokens } from '../types'
import { countTokens } from '../utils/tokenizer'
import {
  generatePlatformConfig,
  getPlatformExtension,
  type AIPlatform
} from '../utils/platformGenerators'

interface EquippedSlots {
  [key: string]: AgentItem | null
}

interface BuildState {
  // Inventory
  inventoryItems: AgentItem[]
  filteredItems: AgentItem[]
  selectedCategory: Category | 'all'
  searchQuery: string

  // Equipment
  equippedSlots: EquippedSlots
  draggingItem: AgentItem | null
  setDraggingItem: (item: AgentItem | null) => void

  // Settings
  settings: Settings
  settingsOpen: boolean

  // Loadouts
  loadouts: Loadout[]
  activeLoadoutId: string | null

  // Preview
  previewOpen: boolean
  generatedMarkdown: string
  selectedPlatform: AIPlatform

  // Loading state
  isLoading: boolean
  error: string | null

  // Actions
  loadSettings: () => Promise<void>
  saveSettings: (settings: Partial<Settings>) => Promise<void>
  setSettingsOpen: (open: boolean) => void

  scanForItems: () => Promise<void>
  addInventoryItem: (item: AgentItem) => void
  setSelectedCategory: (category: Category | 'all') => void
  setSearchQuery: (query: string) => void

  equipItem: (slotType: SlotType, item: AgentItem) => boolean
  unequipItem: (slotType: SlotType) => void
  clearAllSlots: () => void

  canEquipItem: (slotType: SlotType, item: AgentItem) => boolean
  getTotalTokens: () => number
  getTokenBudgetUsage: () => number

  saveLoadout: (name: string) => Promise<void>
  loadLoadout: (loadoutId: string) => void
  deleteLoadout: (loadoutId: string) => Promise<void>

  setPreviewOpen: (open: boolean) => void
  regenerateMarkdown: () => void
  setSelectedPlatform: (platform: AIPlatform) => void

  exportToFile: () => Promise<string | null>
  exportToClipboard: () => Promise<void>
  exportToClaudeDir: (filename: string) => Promise<boolean>
  exportToPlatform: (filename: string, platform: AIPlatform) => Promise<boolean>
}

const DEFAULT_SETTINGS: Settings = {
  rootFolderPath: '',
  maxTokenBudget: 4000,
  theme: 'dark'
}

const initializeSlots = (): EquippedSlots => {
  const slots: EquippedSlots = {}
  for (const slotType of Object.keys(SLOT_CONFIG)) {
    slots[slotType] = null
  }
  return slots
}

export const useBuildStore = create<BuildState>((set, get) => ({
  // Initial state
  inventoryItems: [],
  filteredItems: [],
  selectedCategory: 'all',
  searchQuery: '',
  equippedSlots: initializeSlots(),
  draggingItem: null,
  setDraggingItem: item => set({ draggingItem: item }),
  settings: DEFAULT_SETTINGS,
  settingsOpen: false,
  loadouts: [],
  activeLoadoutId: null,
  previewOpen: false,
  generatedMarkdown: '',
  selectedPlatform: 'claude',
  isLoading: false,
  error: null,

  // Load settings from electron-store
  loadSettings: async () => {
    try {
      const stored = await window.electronAPI.storeGet<Settings>('settings')
      const loadouts = (await window.electronAPI.storeGet<Loadout[]>('loadouts')) || []

      if (stored) {
        set({ settings: { ...DEFAULT_SETTINGS, ...stored }, loadouts })
      } else {
        // Set default root folder to ~/.claude
        const homeDir = await window.electronAPI.getHomeDir()
        const defaultPath = `${homeDir}/.claude`
        set({
          settings: { ...DEFAULT_SETTINGS, rootFolderPath: defaultPath },
          loadouts
        })
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  },

  saveSettings: async newSettings => {
    const current = get().settings
    const updated = { ...current, ...newSettings }
    set({ settings: updated })
    await window.electronAPI.storeSet('settings', updated)

    // Rescan if root folder changed
    if (newSettings.rootFolderPath && newSettings.rootFolderPath !== current.rootFolderPath) {
      get().scanForItems()
    }
  },

  setSettingsOpen: open => set({ settingsOpen: open }),

  // Scan for markdown files
  scanForItems: async () => {
    const { settings } = get()
    if (!settings.rootFolderPath) return

    set({ isLoading: true, error: null })

    try {
      const files = await window.electronAPI.scanDirectory(settings.rootFolderPath)

      const items: AgentItem[] = files.map(file => {
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

      set({
        inventoryItems: items,
        filteredItems: items,
        isLoading: false
      })

      // Apply any active filters
      get().setSelectedCategory(get().selectedCategory)
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to scan directory',
        isLoading: false
      })
    }
  },

  addInventoryItem: (item: AgentItem) => {
    const { inventoryItems } = get()

    // 检查是否已存在
    const exists = inventoryItems.some(i => i.id === item.id || i.name === item.name)
    if (exists) {
      // console.log('组件已存在:', item.name)
      return
    }

    const updated = [...inventoryItems, item]
    set({
      inventoryItems: updated,
      filteredItems: updated
    })

    // 重新应用过滤器
    get().setSelectedCategory(get().selectedCategory)
  },

  setSelectedCategory: category => {
    const { inventoryItems, searchQuery } = get()
    let filtered = inventoryItems

    if (category !== 'all') {
      filtered = filtered.filter(item => item.category === category)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(query) || item.content.toLowerCase().includes(query)
      )
    }

    set({ selectedCategory: category, filteredItems: filtered })
  },

  setSearchQuery: query => {
    const { inventoryItems, selectedCategory } = get()
    let filtered = inventoryItems

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    if (query) {
      const q = query.toLowerCase()
      filtered = filtered.filter(
        item => item.name.toLowerCase().includes(q) || item.content.toLowerCase().includes(q)
      )
    }

    set({ searchQuery: query, filteredItems: filtered })
  },

  canEquipItem: (slotType, item) => {
    const config = SLOT_CONFIG[slotType]
    if (!config) return false

    // Check category compatibility
    if (!config.acceptedCategories.includes(item.category)) {
      return false
    }

    // Check token budget
    const { equippedSlots, settings } = get()
    let currentTokens = 0
    for (const slot of Object.values(equippedSlots)) {
      if (slot) currentTokens += slot.tokens
    }

    // If slot already has an item, subtract its tokens
    const existingItem = equippedSlots[slotType]
    if (existingItem) {
      currentTokens -= existingItem.tokens
    }

    return currentTokens + item.tokens <= settings.maxTokenBudget
  },

  equipItem: (slotType, item) => {
    if (!get().canEquipItem(slotType, item)) {
      return false
    }

    set(state => ({
      equippedSlots: {
        ...state.equippedSlots,
        [slotType]: item
      }
    }))

    // Regenerate markdown if preview is open
    if (get().previewOpen) {
      get().regenerateMarkdown()
    }

    return true
  },

  unequipItem: slotType => {
    set(state => ({
      equippedSlots: {
        ...state.equippedSlots,
        [slotType]: null
      }
    }))

    if (get().previewOpen) {
      get().regenerateMarkdown()
    }
  },

  clearAllSlots: () => {
    set({ equippedSlots: initializeSlots() })
    if (get().previewOpen) {
      get().regenerateMarkdown()
    }
  },

  getTotalTokens: () => {
    const { equippedSlots } = get()
    let total = 0
    for (const slot of Object.values(equippedSlots)) {
      if (slot) total += slot.tokens
    }
    return total
  },

  getTokenBudgetUsage: () => {
    const { settings } = get()
    const total = get().getTotalTokens()
    return Math.min((total / settings.maxTokenBudget) * 100, 100)
  },

  saveLoadout: async name => {
    const { equippedSlots, loadouts } = get()

    const slots: Record<SlotType, string | null> = {} as Record<SlotType, string | null>
    for (const [slotType, item] of Object.entries(equippedSlots)) {
      slots[slotType as SlotType] = item?.path || null
    }

    const loadout: Loadout = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      slots
    }

    const updated = [...loadouts, loadout]
    set({ loadouts: updated, activeLoadoutId: loadout.id })
    await window.electronAPI.storeSet('loadouts', updated)
  },

  loadLoadout: loadoutId => {
    const { loadouts, inventoryItems } = get()
    const loadout = loadouts.find(l => l.id === loadoutId)
    if (!loadout) return

    const newSlots: EquippedSlots = {}
    for (const [slotType, itemPath] of Object.entries(loadout.slots)) {
      if (itemPath) {
        const item = inventoryItems.find(i => i.path === itemPath)
        newSlots[slotType] = item || null
      } else {
        newSlots[slotType] = null
      }
    }

    set({ equippedSlots: newSlots, activeLoadoutId: loadoutId })

    if (get().previewOpen) {
      get().regenerateMarkdown()
    }
  },

  deleteLoadout: async loadoutId => {
    const { loadouts, activeLoadoutId } = get()
    const updated = loadouts.filter(l => l.id !== loadoutId)
    set({
      loadouts: updated,
      activeLoadoutId: activeLoadoutId === loadoutId ? null : activeLoadoutId
    })
    await window.electronAPI.storeSet('loadouts', updated)
  },

  setPreviewOpen: open => {
    set({ previewOpen: open })
    if (open) {
      get().regenerateMarkdown()
    }
  },

  regenerateMarkdown: () => {
    const { equippedSlots, selectedPlatform } = get()
    const items: AgentItem[] = []

    // Collect items in a logical order
    const slotOrder: SlotType[] = [
      'HEAD',
      'CHEST_1',
      'CHEST_2',
      'WEAPON',
      'HANDS_1',
      'HANDS_2',
      'HANDS_3',
      'RING1',
      'RING2',
      'LEGS_1',
      'LEGS_2',
      'FEET',
      'OFFHAND'
    ]

    for (const slotType of slotOrder) {
      const item = equippedSlots[slotType]
      if (item) {
        items.push(item)
      }
    }

    const markdown = generatePlatformConfig(selectedPlatform, items, 'preview-agent')
    set({ generatedMarkdown: markdown })
  },

  setSelectedPlatform: platform => {
    set({ selectedPlatform: platform })
    if (get().previewOpen) {
      get().regenerateMarkdown()
    }
  },

  exportToFile: async () => {
    const { generatedMarkdown } = get()
    if (!generatedMarkdown) {
      get().regenerateMarkdown()
    }
    return window.electronAPI.saveFile(get().generatedMarkdown)
  },

  exportToClipboard: async () => {
    const { generatedMarkdown } = get()
    if (!generatedMarkdown) {
      get().regenerateMarkdown()
    }
    await navigator.clipboard.writeText(get().generatedMarkdown)
  },

  exportToClaudeDir: async (filename: string) => {
    return get().exportToPlatform(filename, 'claude')
  },

  exportToPlatform: async (filename: string, platform: AIPlatform) => {
    const { equippedSlots } = get()
    const items: AgentItem[] = []

    // Collect items in a logical order
    const slotOrder: SlotType[] = [
      'HEAD',
      'CHEST_1',
      'CHEST_2',
      'WEAPON',
      'HANDS_1',
      'HANDS_2',
      'HANDS_3',
      'RING1',
      'RING2',
      'LEGS_1',
      'LEGS_2',
      'FEET',
      'OFFHAND'
    ]

    for (const slotType of slotOrder) {
      const item = equippedSlots[slotType]
      if (item) {
        items.push(item)
      }
    }

    // Use filename as agent name (minus extension)
    const agentName = filename.replace(/\.(md|json|yaml)$/, '')
    const config = generatePlatformConfig(platform, items, agentName)

    // Update state to reflect what was saved
    set({ generatedMarkdown: config })

    const homeDir = await window.electronAPI.getHomeDir()
    const ext = getPlatformExtension(platform)
    const safeFilename = filename.includes('.') ? filename : `${filename}.${ext}`

    // Platform-specific paths
    let targetPath: string
    if (platform === 'claude') {
      targetPath = `${homeDir}/.claude/agents/${safeFilename}`
    } else if (platform === 'openclaw') {
      targetPath = `${homeDir}/.openclaw/agents/${safeFilename}`
    } else {
      targetPath = `${homeDir}/ai-agents/${platform}/${safeFilename}`
    }

    return window.electronAPI.writeFile(targetPath, config)
  }
}))
