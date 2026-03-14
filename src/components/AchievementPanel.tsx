/**
 * 成就面板组件
 * 显示所有成就及其解锁状态
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ACHIEVEMENTS, type Achievement } from '../data/achievements'
import type { AgentData } from '../store/useDataSourceStore'
import { Trophy, Lock, Star, TrendingUp, Filter } from 'lucide-react'

interface AchievementPanelProps {
  agent: AgentData
}

export const AchievementPanel: React.FC<AchievementPanelProps> = ({ agent }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)

  // 成就类别
  const categories = [
    { id: 'all', label: '全部', icon: '🏆' },
    { id: 'task', label: '任务', icon: '📋' },
    { id: 'level', label: '等级', icon: '⬆️' },
    { id: 'skill', label: '技能', icon: '⚡' },
    { id: 'pvp', label: 'PvP', icon: '⚔️' },
    { id: 'energy', label: '能耗', icon: '💎' },
    { id: 'special', label: '特殊', icon: '🌟' }
  ]

  // 过滤成就
  const filteredAchievements = selectedCategory === 'all'
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter(a => a.category === selectedCategory)

  // 检查成就是否已解锁
  const isUnlocked = (achievementId: string): boolean => {
    return agent.achievements?.unlocked.includes(achievementId) || false
  }

  // 获取成就进度
  const getProgress = (achievementId: string): number => {
    return agent.achievements?.progress[achievementId] || 0
  }

  // 统计
  const stats = {
    total: ACHIEVEMENTS.length,
    unlocked: agent.achievements?.unlocked.length || 0,
    percent: ((agent.achievements?.unlocked.length || 0) / ACHIEVEMENTS.length) * 100
  }

  // 稀有度颜色
  const getRarityColor = (rarity: string) => {
    const colors = {
      common: { bg: 'from-gray-700 to-gray-600', border: 'border-gray-500', text: 'text-gray-300', glow: 'shadow-gray-500/30' },
      rare: { bg: 'from-blue-700 to-blue-600', border: 'border-blue-500', text: 'text-blue-300', glow: 'shadow-blue-500/30' },
      epic: { bg: 'from-purple-700 to-purple-600', border: 'border-purple-500', text: 'text-purple-300', glow: 'shadow-purple-500/30' },
      legendary: { bg: 'from-orange-700 to-orange-600', border: 'border-orange-500', text: 'text-orange-300', glow: 'shadow-orange-500/30' }
    }
    return colors[rarity as keyof typeof colors] || colors.common
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* 头部 */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            成就系统
          </h2>
          <div className="text-right">
            <div className="text-3xl font-bold text-yellow-400">
              {stats.unlocked}/{stats.total}
            </div>
            <div className="text-sm text-white/60">完成度：{stats.percent.toFixed(1)}%</div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.percent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 h-full"
          />
        </div>

        {/* 类别筛选 */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 成就列表 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-3 gap-4">
          {filteredAchievements.map((achievement, index) => {
            const unlocked = isUnlocked(achievement.id)
            const progress = getProgress(achievement.id)
            const colors = getRarityColor(achievement.rarity)

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedAchievement(achievement)}
                className={`
                  relative cursor-pointer rounded-xl p-4 border-2 transition-all
                  ${unlocked
                    ? `bg-gradient-to-br ${colors.bg} ${colors.border} shadow-lg ${colors.glow}`
                    : 'bg-gray-900/50 border-gray-700 opacity-60'
                  }
                `}
              >
                {/* 稀有度标签 */}
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold ${colors.text} bg-black/30`}>
                  {achievement.rarity.toUpperCase()}
                </div>

                {/* 图标 */}
                <div className="text-5xl mb-3 text-center">
                  {unlocked ? achievement.icon : '🔒'}
                </div>

                {/* 名称 */}
                <h3 className={`text-center font-bold mb-2 ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                  {unlocked ? achievement.name : '???'}
                </h3>

                {/* 描述 */}
                {unlocked && (
                  <p className="text-xs text-center text-white/70 mb-3 line-clamp-2">
                    {achievement.description}
                  </p>
                )}

                {/* 进度 */}
                {achievement.requirement && (
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>进度</span>
                      <span>{progress}/{achievement.requirement}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${colors.bg} h-full transition-all`}
                        style={{ width: `${Math.min((progress / achievement.requirement) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 奖励 */}
                {unlocked && (
                  <div className="flex items-center justify-center gap-3 text-xs">
                    {achievement.rewards.coins && achievement.rewards.coins > 0 && (
                      <span className="text-yellow-400 font-bold">+{achievement.rewards.coins} 💰</span>
                    )}
                    {achievement.rewards.exp && achievement.rewards.exp > 0 && (
                      <span className="text-blue-400 font-bold">+{achievement.rewards.exp} EXP</span>
                    )}
                  </div>
                )}

                {/* 隐藏成就标记 */}
                {achievement.hidden && !unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl backdrop-blur-sm">
                    <div className="text-center">
                      <Lock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <div className="text-sm text-gray-500 font-bold">隐藏成就</div>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* 成就详情弹窗 */}
      {selectedAchievement && (
        <AchievementDetailModal
          achievement={selectedAchievement}
          unlocked={isUnlocked(selectedAchievement.id)}
          progress={getProgress(selectedAchievement.id)}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </div>
  )
}

/**
 * 成就详情弹窗
 */
interface AchievementDetailModalProps {
  achievement: Achievement
  unlocked: boolean
  progress: number
  onClose: () => void
}

const AchievementDetailModal: React.FC<AchievementDetailModalProps> = ({
  achievement,
  unlocked,
  progress,
  onClose
}) => {
  const colors = {
    common: { bg: 'from-gray-700 to-gray-600', border: 'border-gray-500', text: 'text-gray-300' },
    rare: { bg: 'from-blue-700 to-blue-600', border: 'border-blue-500', text: 'text-blue-300' },
    epic: { bg: 'from-purple-700 to-purple-600', border: 'border-purple-500', text: 'text-purple-300' },
    legendary: { bg: 'from-orange-700 to-orange-600', border: 'border-orange-500', text: 'text-orange-300' }
  }

  const color = colors[achievement.rarity as keyof typeof colors] || colors.common

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className={`
          w-[500px] max-w-[90vw] bg-gradient-to-br ${color.bg}
          border-4 ${color.border} rounded-2xl p-8 shadow-2xl
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* 图标 */}
        <div className="text-8xl text-center mb-4">
          {unlocked ? achievement.icon : '🔒'}
        </div>

        {/* 稀有度 */}
        <div className={`text-center text-sm font-bold ${color.text} mb-2 uppercase tracking-wider`}>
          {achievement.rarity}
        </div>

        {/* 名称 */}
        <h2 className="text-3xl font-black text-white text-center mb-4">
          {unlocked ? achievement.name : '???'}
        </h2>

        {/* 描述 */}
        {unlocked && (
          <p className="text-white/90 text-center mb-6 leading-relaxed">
            {achievement.description}
          </p>
        )}

        {/* 进度 */}
        {achievement.requirement && (
          <div className="bg-black/30 rounded-lg p-4 mb-6">
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>完成进度</span>
              <span className="font-bold">{progress}/{achievement.requirement}</span>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-3 overflow-hidden">
              <div
                className={`bg-gradient-to-r from-white to-${color.text.split('-')[1]}-400 h-full transition-all`}
                style={{ width: `${Math.min((progress / achievement.requirement) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* 奖励 */}
        {unlocked && (
          <div className="bg-black/30 rounded-lg p-4 mb-6">
            <h3 className="text-white font-bold mb-3 text-center">🎁 奖励</h3>
            <div className="space-y-2">
              {achievement.rewards.coins && achievement.rewards.coins > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-white/80">金币</span>
                  <span className="text-yellow-400 font-bold text-lg">+{achievement.rewards.coins} 💰</span>
                </div>
              )}
              {achievement.rewards.exp && achievement.rewards.exp > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-white/80">经验值</span>
                  <span className="text-blue-400 font-bold text-lg">+{achievement.rewards.exp} EXP</span>
                </div>
              )}
              {achievement.rewards.title && (
                <div className="flex justify-between items-center">
                  <span className="text-white/80">称号</span>
                  <span className="text-purple-400 font-bold">「{achievement.rewards.title}」</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-white/10 hover:bg-white/20 border-2 border-white/30 rounded-lg text-white font-bold transition-all"
        >
          关闭
        </button>
      </motion.div>
    </motion.div>
  )
}
