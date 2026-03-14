/**
 * Leaderboard and Ranking System Types
 */

// Leaderboard types
export type LeaderboardType = 'level' | 'pvp_rating' | 'tasks_completed' | 'energy_saved' | 'achievement_points'

// Rank tiers
export type RankTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master'

// Leaderboard entry
export interface LeaderboardEntry {
  rank: number
  previousRank?: number
  agentId: string
  agentName: string
  agentAvatar?: string
  score: number
  tier: RankTier
  change: number // +5 means moved up 5 ranks, -3 means moved down 3 ranks
  sourceId: string
  sourceName: string
  updatedAt: string
}

// Season definition
export interface Season {
  id: number
  name: string
  theme?: string
  startDate: string
  endDate: string
  status: 'upcoming' | 'active' | 'ended'
  rewards: SeasonReward[]
  topRewards: {
    rank1: { title: string; badge: string; coins: number }
    top10: { title: string; badge: string; coins: number }
    top100: { title: string; badge: string; coins: number }
  }
}

// Season reward
export interface SeasonReward {
  minRank: number
  maxRank: number
  coins: number
  title?: string
  badge?: string
  items?: string[] // Item IDs
}

// Agent ranking statistics
export interface AgentRankingStats {
  agentId: string
  levelRanking: {
    rank: number
    previousRank: number
    bestRank: number
    score: number
  }
  pvpRanking: {
    rank: number
    previousRank: number
    bestRank: number
    score: number
    tier: RankTier
  }
  tasksRanking: {
    rank: number
    previousRank: number
    bestRank: number
    score: number
  }
  energyRanking: {
    rank: number
    previousRank: number
    bestRank: number
    score: number
  }
  achievementRanking: {
    rank: number
    previousRank: number
    bestRank: number
    score: number
  }
  rankHistory: RankHistoryEntry[]
}

// Rank history entry
export interface RankHistoryEntry {
  timestamp: string
  leaderboardType: LeaderboardType
  rank: number
  score: number
}

// Helper function to get tier from rank
export function getTierFromRank(rank: number): RankTier {
  if (rank === 1) return 'master'
  if (rank <= 10) return 'diamond'
  if (rank <= 50) return 'platinum'
  if (rank <= 100) return 'gold'
  if (rank <= 500) return 'silver'
  return 'bronze'
}

// Helper function to get tier color
export function getTierColor(tier: RankTier): string {
  const colors: Record<RankTier, string> = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
    master: '#FF1493'
  }
  return colors[tier]
}

// Helper function to get tier icon
export function getTierIcon(tier: RankTier): string {
  const icons: Record<RankTier, string> = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
    diamond: '💠',
    master: '👑'
  }
  return icons[tier]
}
