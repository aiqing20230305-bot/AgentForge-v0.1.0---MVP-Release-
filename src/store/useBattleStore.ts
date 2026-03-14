/**
 * Battle Store
 * Manages PvP battles and statistics
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Battle } from '../types/battle'

interface BattleStore {
  // Current battle
  currentBattle: Battle | null

  // Battle history
  battleHistory: Battle[]

  // Actions
  startBattle: (battle: Battle) => void
  updateBattle: (battle: Battle) => void
  endBattle: () => void
  getBattleHistory: (limit?: number) => Battle[]
  getAgentBattleStats: (agentId: string) => {
    wins: number
    losses: number
    total: number
    winRate: number
  }
  clearHistory: () => void
}

export const useBattleStore = create<BattleStore>()(
  persist(
    (set, get) => ({
      currentBattle: null,
      battleHistory: [],

      startBattle: (battle) => {
        set({ currentBattle: battle })
      },

      updateBattle: (battle) => {
        set({ currentBattle: battle })

        // If battle is finished, add to history
        if (battle.status === 'finished') {
          set(state => ({
            battleHistory: [battle, ...state.battleHistory].slice(0, 100) // Keep last 100 battles
          }))
        }
      },

      endBattle: () => {
        set({ currentBattle: null })
      },

      getBattleHistory: (limit = 10) => {
        return get().battleHistory.slice(0, limit)
      },

      getAgentBattleStats: (agentId) => {
        const battles = get().battleHistory.filter(
          b => b.player1.agentId === agentId || b.player2.agentId === agentId
        )

        const wins = battles.filter(b => {
          if (b.winner === 1 && b.player1.agentId === agentId) return true
          if (b.winner === 2 && b.player2.agentId === agentId) return true
          return false
        }).length

        const total = battles.length
        const losses = total - wins

        return {
          wins,
          losses,
          total,
          winRate: total > 0 ? (wins / total) * 100 : 0
        }
      },

      clearHistory: () => {
        set({ battleHistory: [] })
      }
    }),
    {
      name: 'battle-store'
    }
  )
)
