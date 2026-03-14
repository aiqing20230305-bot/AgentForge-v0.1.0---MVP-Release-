/**
 * Season Info Component
 * Displays current season information and rewards
 */

import React, { useMemo } from 'react'
import { useLeaderboardStore } from '../store/useLeaderboardStore'

export const SeasonInfo: React.FC = () => {
  const { getCurrentSeason } = useLeaderboardStore()
  const season = getCurrentSeason()

  const timeRemaining = useMemo(() => {
    if (!season) return null

    const now = new Date()
    const endDate = new Date(season.endDate)
    const diff = endDate.getTime() - now.getTime()

    if (diff <= 0) return '已结束'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) {
      return `${days} 天 ${hours} 小时`
    }
    return `${hours} 小时`
  }, [season])

  if (!season) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-400">当前无进行中的赛季</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/30">
      {/* Season Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🏆</span>
            <span>{season.name}</span>
          </h3>
          {season.theme && (
            <p className="text-sm text-purple-300 mt-1">{season.theme}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">剩余时间</div>
          <div className="text-xl font-bold text-white">{timeRemaining}</div>
        </div>
      </div>

      {/* Season Status Bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(
                0,
                Math.min(
                  100,
                  ((new Date().getTime() - new Date(season.startDate).getTime()) /
                    (new Date(season.endDate).getTime() - new Date(season.startDate).getTime())) *
                    100
                )
              )}%`
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{new Date(season.startDate).toLocaleDateString()}</span>
          <span>{new Date(season.endDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Top Rewards */}
      <div>
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <span>🎁</span>
          <span>赛季奖励</span>
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {/* Rank 1 */}
          <div className="bg-gradient-to-br from-yellow-600/30 to-yellow-800/30 rounded-lg p-3 border border-yellow-500/50">
            <div className="text-center mb-2">
              <div className="text-3xl mb-1">{season.topRewards.rank1.badge}</div>
              <div className="text-xs text-yellow-200 font-bold">
                {season.topRewards.rank1.title}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-white font-bold">第1名</div>
              <div className="text-xs text-yellow-300 mt-1">
                💰 {season.topRewards.rank1.coins.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Top 10 */}
          <div className="bg-gradient-to-br from-blue-600/30 to-blue-800/30 rounded-lg p-3 border border-blue-500/50">
            <div className="text-center mb-2">
              <div className="text-3xl mb-1">{season.topRewards.top10.badge}</div>
              <div className="text-xs text-blue-200 font-bold">
                {season.topRewards.top10.title}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-white font-bold">前10名</div>
              <div className="text-xs text-blue-300 mt-1">
                💰 {season.topRewards.top10.coins.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Top 100 */}
          <div className="bg-gradient-to-br from-purple-600/30 to-purple-800/30 rounded-lg p-3 border border-purple-500/50">
            <div className="text-center mb-2">
              <div className="text-3xl mb-1">{season.topRewards.top100.badge}</div>
              <div className="text-xs text-purple-200 font-bold">
                {season.topRewards.top100.title}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-white font-bold">前100名</div>
              <div className="text-xs text-purple-300 mt-1">
                💰 {season.topRewards.top100.coins.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 text-center">
          赛季结束后，排名将重置，奖励将自动发放到您的账户
        </p>
      </div>
    </div>
  )
}
