export type Category =
  | 'roles'
  | 'skills'
  | 'behaviors'
  | 'personalities'
  | 'constraints'
  | 'contexts'
  | 'formats'
  | 'tools'

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type SlotType =
  | 'HEAD'
  | 'CHEST_1'
  | 'CHEST_2'
  | 'HANDS_1'
  | 'HANDS_2'
  | 'HANDS_3'
  | 'LEGS_1'
  | 'LEGS_2'
  | 'FEET'
  | 'RING1'
  | 'RING2'
  | 'WEAPON'
  | 'OFFHAND'

export interface AgentItem {
  id: string
  path: string
  name: string
  category: Category
  content: string
  tokens: number
  rarity: Rarity
  modifiedAt: string
}

export interface EquipmentSlot {
  type: SlotType
  label: string
  acceptedCategories: Category[]
  item: AgentItem | null
  position: { x: number; y: number }
}

export interface Loadout {
  id: string
  name: string
  createdAt: string
  slots: Record<SlotType, string | null> // Maps slot type to item path
}

export interface Settings {
  rootFolderPath: string
  maxTokenBudget: number
  theme: 'dark' | 'darker'
}

// Slot configuration with accepted categories
export const SLOT_CONFIG: Record<SlotType, { label: string; acceptedCategories: Category[]; position: { x: number; y: number } }> = {
  HEAD: {
    label: 'Head',
    acceptedCategories: ['roles'],
    position: { x: 50, y: 5 }
  },
  CHEST_1: {
    label: 'Chest 1',
    acceptedCategories: ['behaviors'],
    position: { x: 25, y: 25 }
  },
  CHEST_2: {
    label: 'Chest 2',
    acceptedCategories: ['behaviors'],
    position: { x: 75, y: 25 }
  },
  HANDS_1: {
    label: 'Hands 1',
    acceptedCategories: ['skills'],
    position: { x: 5, y: 40 }
  },
  HANDS_2: {
    label: 'Hands 2',
    acceptedCategories: ['skills'],
    position: { x: 95, y: 40 }
  },
  HANDS_3: {
    label: 'Hands 3',
    acceptedCategories: ['skills'],
    position: { x: 5, y: 55 }
  },
  LEGS_1: {
    label: 'Legs 1',
    acceptedCategories: ['constraints'],
    position: { x: 35, y: 65 }
  },
  LEGS_2: {
    label: 'Legs 2',
    acceptedCategories: ['constraints'],
    position: { x: 65, y: 65 }
  },
  FEET: {
    label: 'Feet',
    acceptedCategories: ['formats'],
    position: { x: 50, y: 85 }
  },
  RING1: {
    label: 'Ring 1',
    acceptedCategories: ['personalities'],
    position: { x: 15, y: 70 }
  },
  RING2: {
    label: 'Ring 2',
    acceptedCategories: ['contexts'],
    position: { x: 85, y: 70 }
  },
  WEAPON: {
    label: 'Weapon',
    acceptedCategories: ['roles', 'skills', 'behaviors', 'personalities', 'constraints', 'contexts', 'formats', 'tools'],
    position: { x: 95, y: 55 }
  },
  OFFHAND: {
    label: 'Off Hand',
    acceptedCategories: ['tools'],
    position: { x: 5, y: 70 }
  }
}

// Rarity thresholds based on token count
export function getRarityFromTokens(tokens: number): Rarity {
  if (tokens <= 50) return 'common'
  if (tokens <= 100) return 'uncommon'
  if (tokens <= 200) return 'rare'
  if (tokens <= 400) return 'epic'
  return 'legendary'
}

// Rarity colors
export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9d9d9d',
  uncommon: '#1eff00',
  rare: '#0070dd',
  epic: '#a335ee',
  legendary: '#ff8000'
}

// Category colors
export const CATEGORY_COLORS: Record<Category, string> = {
  roles: '#ff6b6b',
  skills: '#4ecdc4',
  behaviors: '#45b7d1',
  personalities: '#f9ca24',
  constraints: '#eb4d4b',
  contexts: '#6c5ce7',
  formats: '#a29bfe',
  tools: '#55a3ff'
}

// Category icons (using emoji for simplicity)
export const CATEGORY_ICONS: Record<Category, string> = {
  roles: '👤',
  skills: '⚡',
  behaviors: '🎭',
  personalities: '💫',
  constraints: '🚫',
  contexts: '📍',
  formats: '📋',
  tools: '🔧'
}

// Slot icons
export const SLOT_ICONS: Record<SlotType, string> = {
  HEAD: '👑',
  CHEST_1: '🛡️',
  CHEST_2: '🛡️',
  HANDS_1: '🖐️',
  HANDS_2: '🖐️',
  HANDS_3: '🖐️',
  LEGS_1: '🦵',
  LEGS_2: '🦵',
  FEET: '👢',
  RING1: '💍',
  RING2: '💍',
  WEAPON: '⚔️',
  OFFHAND: '🛠️'
}

export interface DragItem {
  type: 'AGENT_ITEM'
  item: AgentItem
}

export const DRAG_TYPE = 'AGENT_ITEM'
