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

  const { getLeaderboard } = useLeaderboardStore()

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
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span>🏆</span>
          <span>排行榜</span>
        </h2>
        <p className="text-sm text-gray-400 mt-1">查看全球 Agent 排名</p>
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
            {currentLeaderboard.map((entry, index) => {
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
