/**
 * Evolution Timeline Component
 * 进化时间轴组件 - 可视化Agent的进化历史和预测
 */

import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { EvolutionEvent } from '../types/evolution'
import { getEvolutionRule, getAvailableEvolutions } from '../data/evolutionRules'

interface EvolutionTimelineProps {
  agentId: string
  evolutionHistory: EvolutionEvent[]
  currentPoints: number
  currentLevel: number
  unlockedRules: string[]
  nextEvolution?: {
    ruleId: string
    ruleName: string
    requiredPoints: number
    progress: number // 0-1
  }
  onManualEvolve?: (ruleId: string) => Promise<void>
}

/**
 * 获取稀有度颜色
 */
function getRarityColor(rarity?: string): string {
  switch (rarity) {
    case 'common':
      return 'bg-gray-500/20 text-gray-400'
    case 'uncommon':
      return 'bg-green-500/20 text-green-400'
    case 'rare':
      return 'bg-blue-500/20 text-blue-400'
    case 'epic':
      return 'bg-purple-500/20 text-purple-400'
    case 'legendary':
      return 'bg-orange-500/20 text-orange-400'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
}

/**
 * 进化事件卡片
 */
const EvolutionEventCard: React.FC<{
  event: EvolutionEvent
}> = ({ event }) => {
  const rule = getEvolutionRule(event.ruleId)

  return (
    <div className="relative">
      {/* 时间轴节点 */}
      <div className="absolute left-[-29px] w-5 h-5 rounded-full bg-purple-500 border-2 border-gray-900" />

      {/* 事件卡片 */}
      <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{rule?.metadata.icon}</span>
            <div>
              <h4 className="font-medium">{event.ruleName}</h4>
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(event.timestamp), {
                  addSuffix: true,
                  locale: zhCN
                })}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className={`px-2 py-1 rounded text-xs ${getRarityColor(
                rule?.metadata.rarity
              )}`}
            >
              {rule?.metadata.rarity}
            </span>
            <span className="text-xs text-gray-500">
              {event.trigger === 'auto' ? '🤖 自动' : '👆 手动'}
            </span>
          </div>
        </div>

        {/* 效果展示 */}
        <div className="mt-3 flex flex-wrap gap-2">
          {event.impact.statsBoost &&
            Object.entries(event.impact.statsBoost).map(([stat, value]) => (
              <span
                key={stat}
                className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs"
              >
                {stat} +{((value - 1) * 100).toFixed(0)}%
              </span>
            ))}
          {event.impact.vitalityBonus && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
              生命力 +{event.impact.vitalityBonus}
            </span>
          )}
          {event.impact.experienceBonus && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
              经验 +{((event.impact.experienceBonus - 1) * 100).toFixed(0)}%
            </span>
          )}
          {event.impact.skillUnlock && event.impact.skillUnlock.length > 0 && (
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
              解锁技能 x{event.impact.skillUnlock.length}
            </span>
          )}
        </div>

        {/* 进化代价 */}
        <div className="mt-2 text-xs text-gray-500">
          消耗进化点: {event.pointsCost}
        </div>
      </div>
    </div>
  )
}

/**
 * 可用进化列表
 */
const AvailableEvolutionsList: React.FC<{
  agentLevel: number
  points: number
  unlockedRules: string[]
  onEvolve: (ruleId: string) => Promise<void>
}> = ({ agentLevel, points, unlockedRules, onEvolve }) => {
  const [loading, setLoading] = React.useState<string | null>(null)

  const availableRules = getAvailableEvolutions(
    agentLevel,
    points,
    unlockedRules
  )

  if (availableRules.length === 0) {
    return (
      <div className="text-sm text-gray-400 text-center py-4">
        暂无可解锁的进化规则
        <br />
        <span className="text-xs">继续完成任务以获得更多进化点</span>
      </div>
    )
  }

  const handleEvolve = async (ruleId: string) => {
    setLoading(ruleId)
    try {
      await onEvolve(ruleId)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-2">
      {availableRules.map(rule => {
        const canAfford = points >= rule.requiredPoints
        const meetsLevel = agentLevel >= rule.requiredLevel

        return (
          <div
            key={rule.id}
            className={`bg-white/5 rounded-lg p-3 ${
              canAfford && meetsLevel ? 'hover:bg-white/10' : 'opacity-60'
            } transition-colors`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{rule.metadata.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium">{rule.name}</h5>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${getRarityColor(
                        rule.metadata.rarity
                      )}`}
                    >
                      {rule.metadata.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {rule.description}
                  </p>

                  {/* 需求 */}
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span
                      className={
                        meetsLevel ? 'text-green-400' : 'text-red-400'
                      }
                    >
                      等级: {rule.requiredLevel}
                    </span>
                    <span
                      className={canAfford ? 'text-green-400' : 'text-red-400'}
                    >
                      进化点: {rule.requiredPoints}
                    </span>
                  </div>
                </div>
              </div>

              {/* 解锁按钮 */}
              {canAfford && meetsLevel && (
                <button
                  onClick={() => handleEvolve(rule.id)}
                  disabled={loading === rule.id}
                  className="px-3 py-1 bg-purple-500 hover:bg-purple-600 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === rule.id ? '进化中...' : '解锁'}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * 进化时间轴主组件
 */
export const EvolutionTimeline: React.FC<EvolutionTimelineProps> = ({
  evolutionHistory,
  currentPoints,
  currentLevel,
  unlockedRules,
  nextEvolution,
  onManualEvolve
}) => {
  // 按时间倒序排序
  const sortedHistory = [...evolutionHistory].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div className="space-y-6">
      {/* 头部统计 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">进化历程</h3>
          <p className="text-sm text-gray-400">
            进化等级 {evolutionHistory.length} • {currentPoints} 进化点
          </p>
        </div>

        {nextEvolution && (
          <div className="text-right">
            <p className="text-xs text-gray-400">下次进化</p>
            <p className="font-medium text-sm">{nextEvolution.ruleName}</p>
            <div className="w-32 h-2 bg-gray-700 rounded mt-1">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded transition-all"
                style={{ width: `${nextEvolution.progress * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {currentPoints} / {nextEvolution.requiredPoints}
            </p>
          </div>
        )}
      </div>

      {/* 时间轴 */}
      {sortedHistory.length > 0 ? (
        <div className="relative space-y-4 pl-8">
          {/* 垂直连接线 */}
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500" />

          {sortedHistory.map((event) => (
            <EvolutionEventCard key={event.id} event={event} />
          ))}

          {/* 起点节点 */}
          <div className="relative">
            <div className="absolute left-[-29px] w-5 h-5 rounded-full bg-gray-500 border-2 border-gray-900" />
            <div className="text-sm text-gray-400">起点</div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p className="text-lg mb-2">🌱 尚未进化</p>
          <p className="text-sm">完成任务以获得进化点，开启进化之旅</p>
        </div>
      )}

      {/* 可用进化列表 */}
      {onManualEvolve && (
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">可解锁进化</h4>
          <AvailableEvolutionsList
            agentLevel={currentLevel}
            points={currentPoints}
            unlockedRules={unlockedRules}
            onEvolve={onManualEvolve}
          />
        </div>
      )}
    </div>
  )
}
