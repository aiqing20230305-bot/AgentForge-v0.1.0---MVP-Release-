/**
 * Rank Detail Modal Component
 * Shows detailed ranking information for a specific agent
 */

import React, { useMemo } from 'react'
import { useLeaderboardStore } from '../store/useLeaderboardStore'
import { useDataSourceStore } from '../store/useDataSourceStore'
import type { LeaderboardType } from '../types/leaderboard'
import { getTierColor, getTierIcon } from '../types/leaderboard'

interface RankDetailModalProps {
  agentId: string
  leaderboardType: LeaderboardType
  onClose: () => void
}

export const RankDetailModal: React.FC<RankDetailModalProps> = ({
  agentId,
  leaderboardType,
  onClose
}) => {
  const { getAgentRank, getAgentRankingStats } = useLeaderboardStore()
  const { agentsCache } = useDataSourceStore()

  const agent = useMemo(() => {
    return agentsCache.find(a => a.id === agentId)
  }, [agentsCache, agentId])

  const rankEntry = useMemo(() => {
    return getAgentRank(agentId, leaderboardType)
  }, [agentId, leaderboardType, getAgentRank])

  const stats = useMemo(() => {
    return getAgentRankingStats(agentId)
  }, [agentId, getAgentRankingStats])

  if (!agent || !rankEntry) {
    return null
  }

  const tierColor = getTierColor(rankEntry.tier)
  const tierIcon = getTierIcon(rankEntry.tier)

  // Get rank history for this leaderboard type
  const rankHistory = stats?.rankHistory
    .filter(h => h.leaderboardType === leaderboardType)
    .slice(-20) // Last 20 entries

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-6 border-b border-gray-700"
          style={{
            background: `linear-gradient(135deg, ${tierColor}20, transparent)`
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                style={{
                  background: `linear-gradient(135deg, ${tierColor}, ${tierColor}80)`,
                  boxShadow: `0 0 30px ${tierColor}60`
                }}
              >
                {tierIcon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{agent.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{agent.sourceName}</span>
                  <span>•</span>
                  <span className="capitalize">{rankEntry.tier}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          {/* Current Rank Card */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold" style={{ color: tierColor }}>
                  #{rankEntry.rank}
                </div>
                <div className="text-xs text-gray-500 mt-1">当前排名</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {rankEntry.score.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">分数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {rankEntry.change > 0 ? `+${rankEntry.change}` : rankEntry.change || '-'}
                </div>
                <div className="text-xs text-gray-500 mt-1">排名变化</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  #{stats?.levelRanking.bestRank || '-'}
                </div>
                <div className="text-xs text-gray-500 mt-1">最佳排名</div>
              </div>
            </div>
          </div>

          {/* All Rankings */}
          {stats && (
            <div className="mb-6">
              <h4 className="text-lg font-bold text-white mb-3">全排行榜表现</h4>
              <div className="space-y-2">
                {[
                  { key: 'levelRanking', label: '等级排行', icon: '⭐' },
                  { key: 'pvpRanking', label: 'PVP排行', icon: '⚔️' },
                  { key: 'tasksRanking', label: '任务排行', icon: '📋' },
                  { key: 'energyRanking', label: '节能排行', icon: '⚡' },
                  { key: 'achievementRanking', label: '成就排行', icon: '🏆' }
                ].map(item => {
                  const ranking = stats[item.key as keyof typeof stats] as any
                  if (typeof ranking !== 'object' || !ranking.rank) return null

                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between bg-gray-800 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-white font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400">#{ranking.rank}</span>
                        <span className="text-white font-bold">
                          {ranking.score.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Rank History Chart */}
          {rankHistory && rankHistory.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-white mb-3">排名历史</h4>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="relative h-32">
                  {/* Simple line chart visualization */}
                  <svg width="100%" height="100%" className="text-gray-600">
                    {rankHistory.map((entry, index) => {
                      if (index === 0) return null
                      const prev = rankHistory[index - 1]
                      const x1 = ((index - 1) / (rankHistory.length - 1)) * 100
                      const x2 = (index / (rankHistory.length - 1)) * 100
                      const y1 = 100 - Math.min(prev.rank / Math.max(...rankHistory.map(h => h.rank)), 1) * 80
                      const y2 = 100 - Math.min(entry.rank / Math.max(...rankHistory.map(h => h.rank)), 1) * 80

                      return (
                        <line
                          key={index}
                          x1={`${x1}%`}
                          y1={`${y1}%`}
                          x2={`${x2}%`}
                          y2={`${y2}%`}
                          stroke={tierColor}
                          strokeWidth="2"
                        />
                      )
                    })}
                  </svg>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>最早</span>
                  <span>最新</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            关闭
          </button>
          <button
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            onClick={() => {
              // Implement challenge/PvP functionality
              if (selectedRank) {
                // 切换到战斗面板并发起挑战
                const battleTab = document.querySelector('[data-tab="battle"]') as HTMLElement
                if (battleTab) {
                  battleTab.click()
                  // 传递挑战对手ID
                  setTimeout(() => {
                    const event = new CustomEvent('pvp-challenge', {
                      detail: { opponentId: selectedRank.agentId }
                    })
                    window.dispatchEvent(event)
                  }, 100)
                }
              }
              alert('切换到战斗面板发起挑战！')
            }}
          >
            ⚔️ 发起挑战
          </button>
        </div>
      </div>
    </div>
  )
}
