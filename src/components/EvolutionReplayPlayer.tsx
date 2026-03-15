/**
 * Evolution Replay Player Component
 * 进化历史回放器 - 动画播放Agent的进化过程
 */

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import type { EvolutionEvent } from '../types/evolution'
import { getEvolutionRule } from '../data/evolutionRules'

interface EvolutionReplayPlayerProps {
  agentId: string
  evolutionHistory: EvolutionEvent[]
}

/**
 * 获取稀有度颜色
 */
function getRarityColor(rarity?: string): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-400'
    case 'uncommon':
      return 'text-green-400'
    case 'rare':
      return 'text-blue-400'
    case 'epic':
      return 'text-purple-400'
    case 'legendary':
      return 'text-orange-400'
    default:
      return 'text-gray-400'
  }
}

/**
 * 进化事件展示组件
 */
const EvolutionEventDisplay: React.FC<{
  event: EvolutionEvent
  animated?: boolean
}> = ({ event, animated = false }) => {
  const rule = getEvolutionRule(event.ruleId)

  return (
    <div
      className={`space-y-4 ${animated ? 'animate-fade-in' : ''}`}
    >
      {/* 头部 */}
      <div className="flex items-center gap-4">
        <span className="text-6xl">{rule?.metadata.icon}</span>
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-1">{event.ruleName}</h3>
          <p className="text-sm text-gray-400">{rule?.metadata.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span
              className={`px-2 py-1 rounded text-xs ${getRarityColor(
                rule?.metadata.rarity
              )} bg-white/5`}
            >
              {rule?.metadata.rarity}
            </span>
            <span className="text-xs text-gray-500">
              {event.trigger === 'auto' ? '🤖 自动进化' : '👆 手动进化'}
            </span>
            <span className="text-xs text-gray-500">
              消耗 {event.pointsCost} 进化点
            </span>
          </div>
        </div>
      </div>

      {/* 变化对比 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 进化前 */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-xs text-gray-400 mb-3">进化前</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">等级</span>
              <span className="font-medium">{event.previousStats.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">生命力</span>
              <span className="font-medium">{event.previousStats.vitality}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">进化等级</span>
              <span className="font-medium">{event.previousStats.evolutionLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">进化点</span>
              <span className="font-medium">{event.previousStats.evolutionPoints}</span>
            </div>
          </div>
        </div>

        {/* 进化后 */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <h4 className="text-xs text-purple-400 mb-3">进化后 ✨</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">等级</span>
              <span className="font-medium text-purple-400">{event.newStats.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">生命力</span>
              <span className="font-medium text-purple-400">
                {event.newStats.vitality}
                {event.newStats.vitality > event.previousStats.vitality && (
                  <span className="text-green-400 ml-1">
                    +{event.newStats.vitality - event.previousStats.vitality}
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">进化等级</span>
              <span className="font-medium text-purple-400">
                {event.newStats.evolutionLevel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">进化点</span>
              <span className="font-medium text-purple-400">
                {event.newStats.evolutionPoints}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 效果展示 */}
      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="text-xs text-gray-400 mb-3">获得效果</h4>
        <div className="flex flex-wrap gap-2">
          {event.impact.vitalityBonus && (
            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
              生命力 +{event.impact.vitalityBonus}
            </span>
          )}
          {event.impact.experienceBonus && (
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
              经验 +{((event.impact.experienceBonus - 1) * 100).toFixed(0)}%
            </span>
          )}
          {event.impact.statsBoost &&
            Object.entries(event.impact.statsBoost).map(([stat, value]) => (
              <span
                key={stat}
                className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm"
              >
                {stat} +{((value - 1) * 100).toFixed(0)}%
              </span>
            ))}
          {event.impact.skillUnlock && event.impact.skillUnlock.length > 0 && (
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
              解锁技能 x{event.impact.skillUnlock.length}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 进化回放播放器主组件
 */
export const EvolutionReplayPlayer: React.FC<EvolutionReplayPlayerProps> = ({
  evolutionHistory
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<1 | 2 | 4>(1)

  const currentEvent = evolutionHistory[currentIndex]

  // 自动播放
  useEffect(() => {
    if (!isPlaying || evolutionHistory.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= evolutionHistory.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 2000 / speed)

    return () => clearInterval(timer)
  }, [isPlaying, speed, evolutionHistory.length])

  if (evolutionHistory.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        <p className="text-xl mb-2">🌱</p>
        <p>暂无进化历史</p>
        <p className="text-sm mt-2">完成任务并进化后即可查看回放</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 播放器头部 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">进化回放</h3>
        <div className="text-sm text-gray-400">
          {currentIndex + 1} / {evolutionHistory.length}
        </div>
      </div>

      {/* 当前进化事件展示 */}
      <div className="bg-white/5 border border-white/20 rounded-lg p-6 min-h-[400px]">
        {currentEvent && <EvolutionEventDisplay event={currentEvent} animated={true} />}
      </div>

      {/* 时间轴 */}
      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={Math.max(0, evolutionHistory.length - 1)}
          value={currentIndex}
          onChange={e => setCurrentIndex(Number(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
        />
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>起点</span>
          {currentEvent && (
            <span>{format(new Date(currentEvent.timestamp), 'yyyy-MM-dd HH:mm')}</span>
          )}
          <span>当前</span>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-white/10 rounded hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ⏮️ 上一步
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-6 py-2 bg-purple-500 rounded hover:bg-purple-600 transition-colors font-medium"
        >
          {isPlaying ? '⏸️ 暂停' : '▶️ 播放'}
        </button>

        <button
          onClick={() =>
            setCurrentIndex(Math.min(evolutionHistory.length - 1, currentIndex + 1))
          }
          disabled={currentIndex === evolutionHistory.length - 1}
          className="px-4 py-2 bg-white/10 rounded hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          下一步 ⏭️
        </button>

        {/* 速度选择 */}
        <select
          value={speed}
          onChange={e => setSpeed(Number(e.target.value) as 1 | 2 | 4)}
          className="px-3 py-2 bg-white/10 rounded hover:bg-white/20 transition-colors border border-white/20"
        >
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
        </select>
      </div>
    </div>
  )
}
