/**
 * Shop Store
 * Virtual currency and item shop system
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ItemType = 'consumable' | 'permanent' | 'cosmetic'
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary'
export type ItemCategory = 'boost' | 'exp' | 'skill' | 'cosmetic'

export interface ShopItem {
  id: string
  name: string
  description: string
  icon: string
  type: ItemType
  category: ItemCategory
  rarity: ItemRarity
  price: number
  effect?: {
    type: 'speed' | 'exp' | 'skill_points' | 'cosmetic'
    value: number
    duration?: number // in seconds, undefined for permanent
  }
  stock?: number // undefined means unlimited
  dailyLimit?: number
  requirement?: {
    level?: number
    achievement?: string
  }
}

export interface OwnedItem {
  itemId: string
  quantity: number
  acquiredAt: string
  expiresAt?: string
}

export interface ActiveEffect {
  itemId: string
  effectType: 'speed' | 'exp' | 'skill_points'
  multiplier: number
  startedAt: string
  expiresAt: string
}

export interface Transaction {
  id: string
  type: 'purchase' | 'use' | 'earn' | 'daily_reward'
  itemId?: string
  coinsChange: number
  timestamp: string
  description: string
}

interface ShopState {
  // Currency
  coins: number
  totalCoinsEarned: number
  totalCoinsSpent: number

  // Inventory
  inventory: OwnedItem[]
  activeEffects: ActiveEffect[]

  // Daily rewards
  lastDailyReward: string | null
  dailyRewardStreak: number

  // Purchase limits (reset daily)
  dailyPurchases: Record<string, number>
  lastResetDate: string

  // Transaction history
  transactions: Transaction[]

  // Actions - Currency
  addCoins: (amount: number, reason?: string) => void
  spendCoins: (amount: number, reason?: string) => boolean
  getCoins: () => number

  // Actions - Shop
  purchaseItem: (itemId: string, quantity?: number) => boolean
  getShopItems: () => ShopItem[]
  canPurchase: (item: ShopItem, agentLevel: number) => { can: boolean; reason?: string }

  // Actions - Inventory
  useItem: (itemId: string) => boolean
  getInventoryItem: (itemId: string) => OwnedItem | undefined
  getActiveEffects: () => ActiveEffect[]
  removeExpiredEffects: () => void

  // Actions - Daily Rewards
  claimDailyReward: () => { success: boolean; reward?: { coins: number; item?: ShopItem } }
  canClaimDailyReward: () => boolean

  // Actions - Utility
  resetDailyLimits: () => void
  getTransactionHistory: (limit?: number) => Transaction[]
}

// Shop item definitions
const SHOP_ITEMS: ShopItem[] = [
  // Boost items
  {
    id: 'speed_boost_1h',
    name: '加速卡 1小时',
    description: '任务执行速度提升2倍，持续1小时',
    icon: '⚡',
    type: 'consumable',
    category: 'boost',
    rarity: 'common',
    price: 500,
    effect: {
      type: 'speed',
      value: 2,
      duration: 3600
    },
    dailyLimit: 5
  },
  {
    id: 'speed_boost_24h',
    name: '加速卡 24小时',
    description: '任务执行速度提升2倍，持续24小时',
    icon: '⚡',
    type: 'consumable',
    category: 'boost',
    rarity: 'rare',
    price: 3000,
    effect: {
      type: 'speed',
      value: 2,
      duration: 86400
    },
    dailyLimit: 2
  },
  {
    id: 'mega_speed_boost',
    name: '超级加速卡',
    description: '任务执行速度提升3倍，持续1小时',
    icon: '⚡',
    type: 'consumable',
    category: 'boost',
    rarity: 'epic',
    price: 5000,
    effect: {
      type: 'speed',
      value: 3,
      duration: 3600
    },
    dailyLimit: 1,
    requirement: { level: 10 }
  },

  // Experience items
  {
    id: 'exp_boost_1h',
    name: '经验加成 1小时',
    description: '获得经验提升100%，持续1小时',
    icon: '📈',
    type: 'consumable',
    category: 'exp',
    rarity: 'common',
    price: 400,
    effect: {
      type: 'exp',
      value: 2,
      duration: 3600
    },
    dailyLimit: 5
  },
  {
    id: 'exp_boost_24h',
    name: '经验加成 24小时',
    description: '获得经验提升100%，持续24小时',
    icon: '📈',
    type: 'consumable',
    category: 'exp',
    rarity: 'rare',
    price: 2500,
    effect: {
      type: 'exp',
      value: 2,
      duration: 86400
    },
    dailyLimit: 2
  },
  {
    id: 'mega_exp_boost',
    name: '超级经验加成',
    description: '获得经验提升200%，持续1小时',
    icon: '📈',
    type: 'consumable',
    category: 'exp',
    rarity: 'epic',
    price: 4000,
    effect: {
      type: 'exp',
      value: 3,
      duration: 3600
    },
    dailyLimit: 1,
    requirement: { level: 15 }
  },

  // Skill point items
  {
    id: 'skill_pack_small',
    name: '技能点补充包（小）',
    description: '立即获得1个技能点',
    icon: '✨',
    type: 'consumable',
    category: 'skill',
    rarity: 'common',
    price: 1000,
    effect: {
      type: 'skill_points',
      value: 1
    }
  },
  {
    id: 'skill_pack_medium',
    name: '技能点补充包（中）',
    description: '立即获得3个技能点',
    icon: '✨',
    type: 'consumable',
    category: 'skill',
    rarity: 'rare',
    price: 2500,
    effect: {
      type: 'skill_points',
      value: 3
    }
  },
  {
    id: 'skill_pack_large',
    name: '技能点补充包（大）',
    description: '立即获得5个技能点',
    icon: '✨',
    type: 'consumable',
    category: 'skill',
    rarity: 'epic',
    price: 4000,
    effect: {
      type: 'skill_points',
      value: 5
    },
    requirement: { level: 20 }
  },

  // Cosmetic items
  {
    id: 'skin_golden',
    name: '黄金皮肤',
    description: '给你的Agent穿上炫酷的黄金皮肤',
    icon: '👑',
    type: 'permanent',
    category: 'cosmetic',
    rarity: 'legendary',
    price: 10000,
    effect: {
      type: 'cosmetic',
      value: 1
    }
  },
  {
    id: 'skin_neon',
    name: '霓虹特效',
    description: '为任务执行添加炫彩霓虹特效',
    icon: '🌈',
    type: 'permanent',
    category: 'cosmetic',
    rarity: 'epic',
    price: 5000,
    effect: {
      type: 'cosmetic',
      value: 1
    },
    requirement: { level: 25 }
  },
  {
    id: 'particle_stars',
    name: '星星粒子效果',
    description: '任务完成时绽放星星粒子',
    icon: '⭐',
    type: 'permanent',
    category: 'cosmetic',
    rarity: 'rare',
    price: 3000,
    effect: {
      type: 'cosmetic',
      value: 1
    }
  },
  {
    id: 'particle_fire',
    name: '火焰粒子效果',
    description: '任务完成时绽放火焰粒子',
    icon: '🔥',
    type: 'permanent',
    category: 'cosmetic',
    rarity: 'rare',
    price: 3000,
    effect: {
      type: 'cosmetic',
      value: 1
    }
  }
]

const DEFAULT_STATE = {
  coins: 1000, // Starting coins
  totalCoinsEarned: 1000,
  totalCoinsSpent: 0,
  inventory: [],
  activeEffects: [],
  lastDailyReward: null,
  dailyRewardStreak: 0,
  dailyPurchases: {},
  lastResetDate: new Date().toDateString(),
  transactions: []
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      // Currency management
      addCoins: (amount: number, reason = 'Earned coins') => {
        set(state => {
          const newCoins = state.coins + amount
          const transaction: Transaction = {
            id: crypto.randomUUID(),
            type: 'earn',
            coinsChange: amount,
            timestamp: new Date().toISOString(),
            description: reason
          }

          return {
            coins: newCoins,
            totalCoinsEarned: state.totalCoinsEarned + amount,
            transactions: [transaction, ...state.transactions].slice(0, 100)
          }
        })
      },

      spendCoins: (amount: number, reason = 'Spent coins') => {
        const state = get()
        if (state.coins < amount) {
          return false
        }

        set(prevState => {
          const transaction: Transaction = {
            id: crypto.randomUUID(),
            type: 'purchase',
            coinsChange: -amount,
            timestamp: new Date().toISOString(),
            description: reason
          }

          return {
            coins: prevState.coins - amount,
            totalCoinsSpent: prevState.totalCoinsSpent + amount,
            transactions: [transaction, ...prevState.transactions].slice(0, 100)
          }
        })

        return true
      },

      getCoins: () => get().coins,

      // Shop operations
      getShopItems: () => SHOP_ITEMS,

      canPurchase: (item: ShopItem, agentLevel: number) => {
        const state = get()

        // Check coins
        if (state.coins < item.price) {
          return { can: false, reason: '金币不足' }
        }

        // Check level requirement
        if (item.requirement?.level && agentLevel < item.requirement.level) {
          return { can: false, reason: `需要等级 ${item.requirement.level}` }
        }

        // Check daily limit
        if (item.dailyLimit) {
          const purchased = state.dailyPurchases[item.id] || 0
          if (purchased >= item.dailyLimit) {
            return { can: false, reason: '今日购买次数已达上限' }
          }
        }

        // Check stock
        if (item.stock !== undefined && item.stock <= 0) {
          return { can: false, reason: '库存不足' }
        }

        return { can: true }
      },

      purchaseItem: (itemId: string, quantity = 1) => {
        const state = get()
        const item = SHOP_ITEMS.find(i => i.id === itemId)

        if (!item) return false

        const totalPrice = item.price * quantity

        // Spend coins
        if (!state.spendCoins(totalPrice, `购买 ${item.name} x${quantity}`)) {
          return false
        }

        // Add to inventory
        set(prevState => {
          const existingItem = prevState.inventory.find(i => i.itemId === itemId)

          let newInventory: OwnedItem[]
          if (existingItem) {
            newInventory = prevState.inventory.map(i =>
              i.itemId === itemId
                ? { ...i, quantity: i.quantity + quantity }
                : i
            )
          } else {
            newInventory = [
              ...prevState.inventory,
              {
                itemId,
                quantity,
                acquiredAt: new Date().toISOString()
              }
            ]
          }

          // Update daily purchase count
          const newDailyPurchases = {
            ...prevState.dailyPurchases,
            [itemId]: (prevState.dailyPurchases[itemId] || 0) + quantity
          }

          return {
            inventory: newInventory,
            dailyPurchases: newDailyPurchases
          }
        })

        return true
      },

      // Inventory operations
      getInventoryItem: (itemId: string) => {
        return get().inventory.find(i => i.itemId === itemId)
      },

      useItem: (itemId: string) => {
        const state = get()
        const inventoryItem = state.inventory.find(i => i.itemId === itemId)
        const shopItem = SHOP_ITEMS.find(i => i.id === itemId)

        if (!inventoryItem || inventoryItem.quantity <= 0 || !shopItem) {
          return false
        }

        // Apply effect
        if (shopItem.effect && shopItem.effect.duration) {
          // Add active effect for timed items
          const effect: ActiveEffect = {
            itemId,
            effectType: shopItem.effect.type as 'speed' | 'exp' | 'skill_points',
            multiplier: shopItem.effect.value,
            startedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + shopItem.effect.duration * 1000).toISOString()
          }

          set(prevState => ({
            activeEffects: [...prevState.activeEffects, effect]
          }))
        }

        // Decrease quantity for consumables
        if (shopItem.type === 'consumable') {
          set(prevState => ({
            inventory: prevState.inventory
              .map(i =>
                i.itemId === itemId
                  ? { ...i, quantity: i.quantity - 1 }
                  : i
              )
              .filter(i => i.quantity > 0)
          }))
        }

        // Add transaction
        set(prevState => {
          const transaction: Transaction = {
            id: crypto.randomUUID(),
            type: 'use',
            itemId,
            coinsChange: 0,
            timestamp: new Date().toISOString(),
            description: `使用 ${shopItem.name}`
          }

          return {
            transactions: [transaction, ...prevState.transactions].slice(0, 100)
          }
        })

        return true
      },

      getActiveEffects: () => {
        get().removeExpiredEffects()
        return get().activeEffects
      },

      removeExpiredEffects: () => {
        const now = Date.now()
        set(state => ({
          activeEffects: state.activeEffects.filter(
            effect => new Date(effect.expiresAt).getTime() > now
          )
        }))
      },

      // Daily rewards
      canClaimDailyReward: () => {
        const state = get()
        if (!state.lastDailyReward) return true

        const lastClaim = new Date(state.lastDailyReward)
        const today = new Date()

        return lastClaim.toDateString() !== today.toDateString()
      },

      claimDailyReward: () => {
        const state = get()

        if (!state.canClaimDailyReward()) {
          return { success: false }
        }

        // Calculate streak
        let newStreak = 1
        if (state.lastDailyReward) {
          const lastClaim = new Date(state.lastDailyReward)
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)

          if (lastClaim.toDateString() === yesterday.toDateString()) {
            newStreak = state.dailyRewardStreak + 1
          }
        }

        // Calculate reward (scales with streak)
        const baseCoins = 100
        const streakBonus = Math.min(newStreak - 1, 6) * 50 // Max +300 coins at 7-day streak
        const totalCoins = baseCoins + streakBonus

        // Add coins
        state.addCoins(totalCoins, `每日奖励 (连续${newStreak}天)`)

        // Bonus item for 7-day streak
        let bonusItem: ShopItem | undefined
        if (newStreak >= 7 && newStreak % 7 === 0) {
          bonusItem = SHOP_ITEMS[4] // exp_boost_24h
          set(prevState => ({
            inventory: [
              ...prevState.inventory,
              {
                itemId: bonusItem!.id,
                quantity: 1,
                acquiredAt: new Date().toISOString()
              }
            ]
          }))
        }

        // Update state
        set({
          lastDailyReward: new Date().toISOString(),
          dailyRewardStreak: newStreak
        })

        return {
          success: true,
          reward: {
            coins: totalCoins,
            item: bonusItem
          }
        }
      },

      // Utility
      resetDailyLimits: () => {
        const today = new Date().toDateString()
        const state = get()

        if (state.lastResetDate !== today) {
          set({
            dailyPurchases: {},
            lastResetDate: today
          })
        }
      },

      getTransactionHistory: (limit = 50) => {
        return get().transactions.slice(0, limit)
      }
    }),
    {
      name: 'agentforge-shop-storage',
      version: 1
    }
  )
)
