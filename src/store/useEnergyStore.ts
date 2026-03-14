/**
 * Energy/Token Tracking Store
 * Global energy budget management and tracking
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EnergyRecord } from './useDataSourceStore'

interface EnergyBudget {
  daily: number
  weekly: number
  monthly: number
}

interface EnergyUsage {
  today: number
  week: number
  month: number
  thisWeek: number
  thisMonth: number
  total: number
}

interface EnergyStore {
  // Global budget (with alias)
  globalBudget: EnergyBudget
  budget: EnergyBudget

  // Usage tracking
  usage: EnergyUsage

  // History (with alias)
  history: EnergyRecord[]
  records: EnergyRecord[]

  // Settings
  alertThreshold: number
  autoPauseEnabled: boolean

  // Actions
  setGlobalBudget: (budget: Partial<EnergyBudget>) => void
  setBudget: (budget: Partial<EnergyBudget>) => void
  recordTokenUsage: (record: Omit<EnergyRecord, 'id'>) => void
  getUsagePercentage: (period: 'daily' | 'weekly' | 'monthly') => number
  shouldAlert: (period: 'daily' | 'weekly' | 'monthly') => boolean
  shouldAutoPause: () => boolean
  resetPeriodUsage: (period: 'daily' | 'weekly' | 'monthly') => void
  clearHistory: () => void
  setAlertThreshold: (threshold: number) => void
  setAutoPause: (enabled: boolean) => void
}

const initialBudget = {
  daily: 100000,
  weekly: 500000,
  monthly: 2000000
}

export const useEnergyStore = create<EnergyStore>()(
  persist(
    (set, get) => ({
      globalBudget: initialBudget,
      budget: initialBudget,

      usage: {
        today: 0,
        week: 0,
        month: 0,
        thisWeek: 0,
        thisMonth: 0,
        total: 0
      },

      history: [],
      records: [],

      alertThreshold: 80,
      autoPauseEnabled: false,

      setGlobalBudget: (budget) => {
        const newBudget = { ...get().globalBudget, ...budget }
        set({
          globalBudget: newBudget,
          budget: newBudget
        })
      },

      setBudget: (budget) => {
        get().setGlobalBudget(budget)
      },

      recordTokenUsage: (record) => {
        const newRecord: EnergyRecord = {
          ...record,
          id: `energy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }

        const newHistory = [newRecord, ...get().history].slice(0, 1000)
        const tokensUsed = record.tokensUsed
        const currentUsage = get().usage

        set({
          history: newHistory,
          records: newHistory,
          usage: {
            today: currentUsage.today + tokensUsed,
            week: currentUsage.week + tokensUsed,
            month: currentUsage.month + tokensUsed,
            thisWeek: currentUsage.thisWeek + tokensUsed,
            thisMonth: currentUsage.thisMonth + tokensUsed,
            total: currentUsage.total + tokensUsed
          }
        })
      },

      getUsagePercentage: (period) => {
        const { usage, globalBudget } = get()
        const usageMap = {
          daily: usage.today,
          weekly: usage.thisWeek,
          monthly: usage.thisMonth
        }
        const budgetMap = {
          daily: globalBudget.daily,
          weekly: globalBudget.weekly,
          monthly: globalBudget.monthly
        }

        return (usageMap[period] / budgetMap[period]) * 100
      },

      shouldAlert: (period) => {
        const percentage = get().getUsagePercentage(period)
        return percentage >= get().alertThreshold
      },

      shouldAutoPause: () => {
        const { autoPauseEnabled, globalBudget, usage } = get()
        if (!autoPauseEnabled) return false

        return (
          usage.today >= globalBudget.daily ||
          usage.thisWeek >= globalBudget.weekly ||
          usage.thisMonth >= globalBudget.monthly
        )
      },

      resetPeriodUsage: (period) => {
        set(state => {
          const newUsage = { ...state.usage }
          if (period === 'daily') {
            newUsage.today = 0
          }
          if (period === 'weekly') {
            newUsage.thisWeek = 0
            newUsage.week = 0
          }
          if (period === 'monthly') {
            newUsage.thisMonth = 0
            newUsage.month = 0
          }
          return { usage: newUsage }
        })
      },

      clearHistory: () => {
        set({ history: [], records: [] })
      },

      setAlertThreshold: (threshold) => {
        set({ alertThreshold: Math.max(0, Math.min(100, threshold)) })
      },

      setAutoPause: (enabled) => {
        set({ autoPauseEnabled: enabled })
      }
    }),
    {
      name: 'energy-store'
    }
  )
)
