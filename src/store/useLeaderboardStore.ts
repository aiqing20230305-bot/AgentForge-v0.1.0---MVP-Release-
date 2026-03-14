/**
 * Leaderboard and Ranking Store
 * Manages global and per-season rankings
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  LeaderboardEntry,
  LeaderboardType,
  Season,
  AgentRankingStats,
  RankHistoryEntry
} from '../types/leaderboard'
import { getTierFromRank } from '../types/leaderboard'

interface LeaderboardStore {
  // Current season
  currentSeason: Season | null

  // Leaderboards by type
  leaderboards: Record<LeaderboardType, LeaderboardEntry[]>

  // Agent ranking stats cache
  agentRankings: Record<string, AgentRankingStats>

  // Season history
  seasonHistory: Season[]

  // Actions
  updateLeaderboard: (type: LeaderboardType, entries: LeaderboardEntry[]) => void
  updateAgentScore: (agentId: string, agentName: string, type: LeaderboardType, score: number, sourceId: string, sourceName: string) => void
  getLeaderboard: (type: LeaderboardType, limit?: number) => LeaderboardEntry[]
  getAgentRank: (agentId: string, type: LeaderboardType) => LeaderboardEntry | undefined
  getAgentRankingStats: (agentId: string) => AgentRankingStats | undefined

  // Season management
  startNewSeason: (season: Season) => void
  endCurrentSeason: () => void
  getCurrentSeason: () => Season | null

  // Recalculate rankings (call this after scores change)
  recalculateRankings: (type: LeaderboardType) => void
  recalculateAllRankings: () => void

  // Clear all data (for testing)
  clearAllData: () => void
}

// Initial empty season
const createDefaultSeason = (): Season => ({
  id: 1,
  name: '春季赛 2026',
  theme: 'Spring Awakening',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
  status: 'active',
  rewards: [
    { minRank: 1, maxRank: 1, coins: 10000, title: '王者', badge: '👑' },
    { minRank: 2, maxRank: 10, coins: 5000, title: '大师', badge: '💎' },
    { minRank: 11, maxRank: 100, coins: 1000, title: '精英', badge: '⭐' }
  ],
  topRewards: {
    rank1: { title: '王者', badge: '👑', coins: 10000 },
    top10: { title: '大师', badge: '💎', coins: 5000 },
    top100: { title: '精英', badge: '⭐', coins: 1000 }
  }
})

// Helper to generate mock leaderboard data
function generateMockLeaderboardData(type: LeaderboardType, count: number = 50): LeaderboardEntry[] {
  const names = [
    '闪电侠', '暗影刺客', '钢铁战士', '冰霜法师', '烈焰战神',
    '神秘行者', '光明使者', '暗夜猎手', '雷霆之神', '风暴领主',
    '机械先驱', '量子旅者', '星际守卫', '时空行者', '虚空领主',
    '元素大师', '混沌使者', '秩序骑士', '自由战士', '永恒守望',
    '幻影刺客', '圣光骑士', '死亡使者', '生命法师', '魔导学者',
    '剑圣', '弓箭大师', '枪械专家', '爆破专家', '战术大师',
    '狙击手', '格斗家', '刺客', '坦克', '辅助',
    '中单', '打野', '射手', '辅助', '上单',
    '战士', '法师', '坦克', '刺客', '射手',
    '辅助', '战士', '法师', '坦克', '刺客'
  ]

  const sourcePrefixes = ['GitHub', 'GitLab', 'Jira', 'Notion', 'Slack']

  return Array.from({ length: count }, (_, i) => {
    const rank = i + 1
    let score: number

    switch (type) {
      case 'level':
        score = Math.max(1, 100 - i * 2 + Math.floor(Math.random() * 10))
        break
      case 'pvp_rating':
        score = Math.max(0, 3000 - i * 50 + Math.floor(Math.random() * 100))
        break
      case 'tasks_completed':
        score = Math.max(0, 1000 - i * 15 + Math.floor(Math.random() * 20))
        break
      case 'energy_saved':
        score = Math.max(0, 95 - i + Math.floor(Math.random() * 5))
        break
      case 'achievement_points':
        score = Math.max(0, 5000 - i * 80 + Math.floor(Math.random() * 100))
        break
      default:
        score = 0
    }

    const change = Math.floor(Math.random() * 11) - 5 // -5 到 +5

    return {
      rank,
      agentId: `agent-${i + 1}`,
      agentName: names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''),
      score,
      tier: getTierFromRank(rank),
      change,
      sourceId: `source-${i + 1}`,
      sourceName: `${sourcePrefixes[i % sourcePrefixes.length]} Source ${Math.floor(i / sourcePrefixes.length) + 1}`,
      updatedAt: new Date().toISOString()
    }
  })
}

export const useLeaderboardStore = create<LeaderboardStore>()(
  persist(
    (set, get) => ({
      currentSeason: createDefaultSeason(),
      leaderboards: {
        level: generateMockLeaderboardData('level'),
        pvp_rating: generateMockLeaderboardData('pvp_rating'),
        tasks_completed: generateMockLeaderboardData('tasks_completed'),
        energy_saved: generateMockLeaderboardData('energy_saved'),
        achievement_points: generateMockLeaderboardData('achievement_points')
      },
      agentRankings: {},
      seasonHistory: [],

      updateLeaderboard: (type, entries) => {
        set(state => ({
          leaderboards: {
            ...state.leaderboards,
            [type]: entries
          }
        }))
      },

      updateAgentScore: (agentId, agentName, type, score, sourceId, sourceName) => {
        const currentLeaderboard = get().leaderboards[type]

        // Find existing entry or create new one
        const existingIndex = currentLeaderboard.findIndex(e => e.agentId === agentId)

        if (existingIndex >= 0) {
          // Update existing entry
          const updated = [...currentLeaderboard]
          updated[existingIndex] = {
            ...updated[existingIndex],
            score,
            updatedAt: new Date().toISOString()
          }
          get().updateLeaderboard(type, updated)
        } else {
          // Add new entry
          const newEntry: LeaderboardEntry = {
            rank: currentLeaderboard.length + 1,
            agentId,
            agentName,
            score,
            tier: getTierFromRank(currentLeaderboard.length + 1),
            change: 0,
            sourceId,
            sourceName,
            updatedAt: new Date().toISOString()
          }
          get().updateLeaderboard(type, [...currentLeaderboard, newEntry])
        }

        // Recalculate rankings after score update
        get().recalculateRankings(type)

        // Update agent ranking stats
        const now = new Date().toISOString()
        set(state => {
          const agentStats = state.agentRankings[agentId] || createEmptyAgentStats(agentId)
          const currentRank = get().getAgentRank(agentId, type)?.rank || 999999

          // Update the specific ranking type
          const rankingKey = `${type.replace('_', '')}Ranking` as keyof AgentRankingStats
          const previousStats = agentStats[rankingKey] as any

          const updatedRanking = {
            rank: currentRank,
            previousRank: previousStats?.rank || currentRank,
            bestRank: Math.min(previousStats?.bestRank || currentRank, currentRank),
            score,
            ...(type === 'pvp_rating' && { tier: getTierFromRank(currentRank) })
          }

          // Add to history
          const historyEntry: RankHistoryEntry = {
            timestamp: now,
            leaderboardType: type,
            rank: currentRank,
            score
          }

          return {
            agentRankings: {
              ...state.agentRankings,
              [agentId]: {
                ...agentStats,
                [rankingKey]: updatedRanking,
                rankHistory: [...agentStats.rankHistory, historyEntry].slice(-100) // Keep last 100 entries
              }
            }
          }
        })
      },

      getLeaderboard: (type, limit = 100) => {
        return get().leaderboards[type].slice(0, limit)
      },

      getAgentRank: (agentId, type) => {
        return get().leaderboards[type].find(e => e.agentId === agentId)
      },

      getAgentRankingStats: agentId => {
        return get().agentRankings[agentId]
      },

      startNewSeason: season => {
        const current = get().currentSeason
        set(state => ({
          currentSeason: season,
          seasonHistory: current ? [...state.seasonHistory, { ...current, status: 'ended' as const }] : state.seasonHistory
        }))
      },

      endCurrentSeason: () => {
        const current = get().currentSeason
        if (current) {
          set(state => ({
            currentSeason: null,
            seasonHistory: [...state.seasonHistory, { ...current, status: 'ended' as const }]
          }))
        }
      },

      getCurrentSeason: () => {
        return get().currentSeason
      },

      recalculateRankings: type => {
        const leaderboard = [...get().leaderboards[type]]

        // Sort by score descending
        leaderboard.sort((a, b) => b.score - a.score)

        // Update ranks and changes
        const updated = leaderboard.map((entry, index) => {
          const newRank = index + 1
          const change = entry.rank ? entry.rank - newRank : 0
          return {
            ...entry,
            previousRank: entry.rank,
            rank: newRank,
            tier: getTierFromRank(newRank),
            change
          }
        })

        get().updateLeaderboard(type, updated)
      },

      recalculateAllRankings: () => {
        const types: LeaderboardType[] = ['level', 'pvp_rating', 'tasks_completed', 'energy_saved', 'achievement_points']
        types.forEach(type => get().recalculateRankings(type))
      },

      clearAllData: () => {
        set({
          leaderboards: {
            level: [],
            pvp_rating: [],
            tasks_completed: [],
            energy_saved: [],
            achievement_points: []
          },
          agentRankings: {},
          currentSeason: createDefaultSeason()
        })
      }
    }),
    {
      name: 'leaderboard-store'
    }
  )
)

// Helper function to create empty agent stats
function createEmptyAgentStats(agentId: string): AgentRankingStats {
  return {
    agentId,
    levelRanking: {
      rank: 999999,
      previousRank: 999999,
      bestRank: 999999,
      score: 0
    },
    pvpRanking: {
      rank: 999999,
      previousRank: 999999,
      bestRank: 999999,
      score: 0,
      tier: 'bronze'
    },
    tasksRanking: {
      rank: 999999,
      previousRank: 999999,
      bestRank: 999999,
      score: 0
    },
    energyRanking: {
      rank: 999999,
      previousRank: 999999,
      bestRank: 999999,
      score: 0
    },
    achievementRanking: {
      rank: 999999,
      previousRank: 999999,
      bestRank: 999999,
      score: 0
    },
    rankHistory: []
  }
}
