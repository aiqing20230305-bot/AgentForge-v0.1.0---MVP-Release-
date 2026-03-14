/**
 * Leaderboard Panel Component
 * Displays rankings across multiple categories
 */

import React, { useState, useMemo } from 'react'
import { useLeaderboardStore } from '../store/useLeaderboardStore'
import type { LeaderboardType } from '../types/leaderboard'
import { getTierColor, getTierIcon } from '../types/leaderboard'
import { RankDetailModal } from './RankDetailModal'

export const LeaderboardPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('level')
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date())

  const { getLeaderboard } = useLeaderboardStore()

  /**
   * 手动刷新排行榜（30秒冷却）
   */
  const handleRefresh = () => {
    const now = new Date()
    const timeSinceLastRefresh = (now.getTime() - lastRefreshTime.getTime()) / 1000

    if (timeSinceLastRefresh < 30) {
      const remainingTime = Math.ceil(30 - timeSinceLastRefresh)
      alert(`⏰ 请等待 ${remainingTime} 秒后再刷新`)
      return
    }

    setRefreshing(true)
    setLastRefreshTime(now)

    // 模拟刷新延迟
    setTimeout(() => {
      setRefreshing(false)
      // Toast notification
      const toast = document.createElement('div')
      toast.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in'
      toast.textContent = '✅ 排行榜已更新！'
      document.body.appendChild(toast)
      setTimeout(() => document.body.removeChild(toast), 2000)
    }, 1000)
  }

  const currentLeaderboard = useMemo(() => {
    return getLeaderboard(activeTab, 100)
  }, [activeTab, getLeaderboard])

  const tabs: { type: LeaderboardType; label: string; icon: string }[] = [
    { type: 'level', label: '等级排行', icon: '⭐' },
    { type: 'pvp_rating', label: 'PVP排行', icon: '⚔️' },
    { type: 'tasks_completed', label: '任务排行', icon: '📋' },
    { type: 'energy_saved', label: '节能排行', icon: '⚡' },
    { type: 'achievement_points', label: '成就排行', icon: '🏆' }
  ]

  const getMedalIcon = (rank: number): string | null => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  const getRankChangeIcon = (change: number): React.ReactNode => {
    if (change > 0) {
      return (
        <span className="text-green-400 text-xs flex items-center">
          ↑ {change}
        </span>
      )
    }
    if (change < 0) {
      return (
        <span className="text-red-400 text-xs flex items-center">
          ↓ {Math.abs(change)}
        </span>
      )
    }
    return <span className="text-gray-500 text-xs">-</span>
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>🏆</span>
            <span>排行榜</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">查看全球 Agent 排名</p>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
            transition-all duration-200
            ${refreshing
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30'
            }
          `}
          title="刷新排行榜（30秒冷却）"
        >
          <svg
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>{refreshing ? '刷新中...' : '刷新'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-4 border-b border-gray-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.type}
            onClick={() => setActiveTab(tab.type)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap
              transition-colors duration-200
              ${
                activeTab === tab.type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }
            `}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      <div className="flex-1 overflow-y-auto p-4">
        {currentLeaderboard.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">暂无排行数据</p>
            <p className="text-sm mt-2">完成任务和战斗以登上排行榜！</p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentLeaderboard.map((entry) => {
              const medal = getMedalIcon(entry.rank)
              const isTopTen = entry.rank <= 10
              const tierColor = getTierColor(entry.tier)
              const tierIcon = getTierIcon(entry.tier)

              return (
                <div
                  key={entry.agentId}
                  onClick={() => setSelectedAgentId(entry.agentId)}
                  className={`
                    p-4 rounded-lg cursor-pointer
                    transition-all duration-200
                    ${
                      isTopTen
                        ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-600/50'
                        : 'bg-gray-800 hover:bg-gray-750'
                    }
                    hover:scale-[1.02] hover:shadow-lg
                  `}
                  style={
                    isTopTen
                      ? {
                          boxShadow: `0 0 20px ${tierColor}40`
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex flex-col items-center min-w-[60px]">
                      {medal ? (
                        <span className="text-3xl">{medal}</span>
                      ) : (
                        <span
                          className="text-2xl font-bold"
                          style={{ color: tierColor }}
                        >
                          #{entry.rank}
                        </span>
                      )}
                      {getRankChangeIcon(entry.change)}
                    </div>

                    {/* Avatar & Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold truncate">
                          {entry.agentName}
                        </span>
                        <span className="text-xl">{tierIcon}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{entry.sourceName}</span>
                        <span>•</span>
                        <span className="capitalize">{entry.tier}</span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: tierColor }}>
                        {entry.score.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">分数</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Agent Detail Modal */}
      {selectedAgentId && (
        <RankDetailModal
          agentId={selectedAgentId}
          leaderboardType={activeTab}
          onClose={() => setSelectedAgentId(null)}
        />
      )}
    </div>
  )
}
