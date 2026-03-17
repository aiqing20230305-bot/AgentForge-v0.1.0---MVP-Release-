/**
 * Achievement Wall - 成就墙展示系统
 * 可展示的成就墙，带有3D徽章、动画特效、分享功能
 */

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Lock, Share2, Award, TrendingUp, Sparkles, Crown, Medal } from 'lucide-react'
import { ACHIEVEMENTS, type Achievement, type AchievementRarity } from '../data/achievements'
import type { AgentData } from '../store/useDataSourceStore'
import { useInstantFeedback } from '../hooks/useInstantFeedback'
import { audioSystem } from '../services/audioSystem'
import { useLeaderboardStore } from '../store/useLeaderboardStore'
import { AchievementShareCard } from './AchievementShareCard'

interface AchievementWallProps {
  agent: AgentData
}

export const AchievementWall: React.FC<AchievementWallProps> = ({ agent }) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [filterRarity, setFilterRarity] = useState<AchievementRarity | 'all'>('all')
  const [sortBy, setSortBy] = useState<'default' | 'rarity' | 'progress'>('default')
  const feedback = useInstantFeedback()
  const { getLeaderboard } = useLeaderboardStore()

  // 获取成就排行榜
  const achievementLeaderboard = getLeaderboard('achievement_points', 10)

  // 成就统计
  const stats = useMemo(() => {
    const unlocked = agent.achievements?.unlocked || []
    const progress = agent.achievements?.progress || {}

    const total = ACHIEVEMENTS.length
    const unlockedCount = unlocked.length
    const hiddenUnlocked = ACHIEVEMENTS.filter(a => a.hidden && unlocked.includes(a.id)).length

    const byRarity = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0
    }

    unlocked.forEach(id => {
      const achievement = ACHIEVEMENTS.find(a => a.id === id)
      if (achievement) {
        byRarity[achievement.rarity]++
      }
    })

    const totalPoints = ACHIEVEMENTS.reduce((sum, a) => {
      if (unlocked.includes(a.id)) {
        return sum + (a.rewards.exp || 0)
      }
      return sum
    }, 0)

    return {
      total,
      unlocked: unlockedCount,
      percent: (unlockedCount / total) * 100,
      byRarity,
      hiddenUnlocked,
      totalPoints
    }
  }, [agent.achievements])

  // 检查成就是否已解锁
  const isUnlocked = (achievementId: string): boolean => {
    return agent.achievements?.unlocked.includes(achievementId) || false
  }

  // 获取成就进度
  const getProgress = (achievementId: string): number => {
    return agent.achievements?.progress[achievementId] || 0
  }

  // 稀有度配置（带3D效果）
  const getRarityConfig = (rarity: AchievementRarity) => {
    const configs = {
      common: {
        name: '普通',
        gradient: 'from-gray-600 via-gray-500 to-gray-600',
        border: 'border-gray-400',
        text: 'text-gray-300',
        glow: 'shadow-gray-500/30',
        shadow3d: 'drop-shadow-[0_4px_8px_rgba(156,163,175,0.4)]',
        icon: '⚪',
        points: 10
      },
      rare: {
        name: '稀有',
        gradient: 'from-blue-600 via-blue-400 to-blue-600',
        border: 'border-blue-400',
        text: 'text-blue-300',
        glow: 'shadow-blue-500/50',
        shadow3d: 'drop-shadow-[0_6px_12px_rgba(59,130,246,0.6)]',
        icon: '🔵',
        points: 25
      },
      epic: {
        name: '史诗',
        gradient: 'from-purple-600 via-purple-400 to-purple-600',
        border: 'border-purple-400',
        text: 'text-purple-300',
        glow: 'shadow-purple-500/60',
        shadow3d: 'drop-shadow-[0_8px_16px_rgba(168,85,247,0.7)]',
        icon: '🟣',
        points: 50
      },
      legendary: {
        name: '传说',
        gradient: 'from-orange-600 via-yellow-400 to-orange-600',
        border: 'border-yellow-400',
        text: 'text-yellow-300',
        glow: 'shadow-orange-500/80',
        shadow3d: 'drop-shadow-[0_10px_20px_rgba(251,146,60,0.8)]',
        icon: '🟠',
        points: 100
      }
    }
    return configs[rarity]
  }

  // 过滤和排序成就
  const filteredAchievements = useMemo(() => {
    let filtered = ACHIEVEMENTS.filter(a =>
      filterRarity === 'all' || a.rarity === filterRarity
    )

    // 排序
    if (sortBy === 'rarity') {
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 }
      filtered = filtered.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity])
    } else if (sortBy === 'progress') {
      filtered = filtered.sort((a, b) => {
        const progressA = getProgress(a.id) / a.requirement
        const progressB = getProgress(b.id) / b.requirement
        return progressB - progressA
      })
    }

    return filtered
  }, [filterRarity, sortBy, agent.achievements])

  // 分享成就
  const handleShare = (achievement: Achievement, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isUnlocked(achievement.id)) return

    feedback.onClick(e)
    audioSystem.play('click')
    setSelectedAchievement(achievement)
    setShowShareModal(true)
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* 华丽的头部 */}
      <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-purple-900/30">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-radial from-purple-500 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-radial from-blue-500 to-transparent rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  rotateY: [0, 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">成就墙</h2>
                <p className="text-sm text-white/60">展示你的荣耀时刻</p>
              </div>
            </div>

            {/* 成就点数 */}
            <div className="text-right">
              <div className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]">
                {stats.totalPoints}
              </div>
              <div className="text-sm text-white/60 font-medium">成就点数</div>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {/* 总进度 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-white/10"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{stats.unlocked}/{stats.total}</div>
                <div className="text-xs text-white/60 mb-2">总完成度</div>
                <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.percent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* 各稀有度统计 */}
            {(['common', 'rare', 'epic', 'legendary'] as const).map(rarity => {
              const config = getRarityConfig(rarity)
              return (
                <motion.div
                  key={rarity}
                  whileHover={{ scale: 1.05, y: -2 }}
                  onClick={(e) => {
                    feedback.onClick(e)
                    audioSystem.play('click')
                    setFilterRarity(filterRarity === rarity ? 'all' : rarity)
                  }}
                  className={`
                    relative cursor-pointer bg-gradient-to-br from-gray-800/80 to-gray-900/80
                    backdrop-blur-sm rounded-xl p-4 border transition-all
                    ${filterRarity === rarity ? config.border + ' ' + config.glow : 'border-white/10'}
                  `}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{config.icon}</div>
                    <div className="text-xl font-bold text-white mb-1">{stats.byRarity[rarity]}</div>
                    <div className="text-xs text-white/60">{config.name}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* 特殊成就统计 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg p-3 border border-purple-500/30">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-lg font-bold text-white">{stats.hiddenUnlocked}</div>
                  <div className="text-xs text-purple-300">隐藏成就</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-lg p-3 border border-yellow-500/30">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-lg font-bold text-white">{stats.percent.toFixed(0)}%</div>
                  <div className="text-xs text-yellow-300">完成率</div>
                </div>
              </div>
            </div>
          </div>

          {/* 排序和筛选 */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={(e) => {
                feedback.onClick(e)
                audioSystem.play('click')
                setSortBy('default')
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === 'default'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              默认
            </button>
            <button
              onClick={(e) => {
                feedback.onClick(e)
                audioSystem.play('click')
                setSortBy('rarity')
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === 'rarity'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              稀有度
            </button>
            <button
              onClick={(e) => {
                feedback.onClick(e)
                audioSystem.play('click')
                setSortBy('progress')
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === 'progress'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              进度
            </button>
          </div>
        </div>
      </div>

      {/* 成就徽章墙 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-4 gap-4">
          {filteredAchievements.map((achievement, index) => {
            const unlocked = isUnlocked(achievement.id)
            const progress = getProgress(achievement.id)
            const config = getRarityConfig(achievement.rarity)
            const progressPercent = (progress / achievement.requirement) * 100

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.02, type: 'spring' }}
                whileHover={{
                  scale: 1.08,
                  y: -8,
                  rotateY: unlocked ? 15 : 0
                }}
                onClick={(e) => {
                  feedback.onClick(e)
                  if (unlocked) {
                    audioSystem.play('achievement')
                  } else {
                    audioSystem.play('click')
                  }
                  setSelectedAchievement(achievement)
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px'
                }}
                className={`
                  relative cursor-pointer rounded-2xl p-5 border-2 transition-all
                  ${unlocked
                    ? `bg-gradient-to-br ${config.gradient} ${config.border} ${config.glow} ${config.shadow3d}`
                    : 'bg-gray-900/50 border-gray-700/50 opacity-60'
                  }
                `}
              >
                {/* 3D立体效果 - 光泽层 */}
                {unlocked && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                )}

                {/* 稀有度角标 */}
                <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${config.text} bg-black/40 backdrop-blur-sm`}>
                  <span>{config.icon}</span>
                  <span>{config.name}</span>
                </div>

                {/* 分享按钮 */}
                {unlocked && (
                  <motion.button
                    whileHover={{ scale: 1.2, rotate: 12 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleShare(achievement, e)}
                    className="absolute top-2 left-2 p-1.5 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5 text-white" />
                  </motion.button>
                )}

                {/* 成就图标 - 3D效果 */}
                <motion.div
                  animate={unlocked ? {
                    rotateY: [0, 360],
                    scale: [1, 1.1, 1]
                  } : {}}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className={`text-6xl mb-3 text-center ${config.shadow3d}`}
                >
                  {unlocked ? achievement.icon : '🔒'}
                </motion.div>

                {/* 名称 */}
                <h3 className={`text-center font-bold text-sm mb-2 ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                  {unlocked ? achievement.name : '???'}
                </h3>

                {/* 描述 */}
                {unlocked && (
                  <p className="text-xs text-center text-white/70 mb-3 line-clamp-2 leading-relaxed">
                    {achievement.description}
                  </p>
                )}

                {/* 进度条 */}
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] text-white/60 mb-1">
                    <span>进度</span>
                    <span>{progress}/{achievement.requirement}</span>
                  </div>
                  <div className="w-full bg-gray-800/80 rounded-full h-2 overflow-hidden border border-black/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full bg-gradient-to-r ${config.gradient} shadow-inner`}
                    />
                  </div>
                </div>

                {/* 奖励 */}
                {unlocked && (
                  <div className="flex items-center justify-center gap-2 text-xs">
                    {achievement.rewards.exp && achievement.rewards.exp > 0 && (
                      <span className="flex items-center gap-1 font-bold text-yellow-400">
                        <Sparkles className="w-3 h-3" />
                        {achievement.rewards.exp}
                      </span>
                    )}
                  </div>
                )}

                {/* 隐藏成就遮罩 */}
                {achievement.hidden && !unlocked && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-2xl backdrop-blur-md"
                  >
                    <Lock className="w-10 h-10 text-gray-600 mb-2" />
                    <div className="text-sm text-gray-500 font-bold">隐藏成就</div>
                    <div className="text-xs text-gray-600 mt-1">解锁后可见</div>
                  </motion.div>
                )}

                {/* 未解锁遮罩效果 */}
                {!unlocked && !achievement.hidden && (
                  <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/30 rounded-2xl pointer-events-none" />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* 全局排行榜侧边栏 */}
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute right-0 top-0 bottom-0 w-72 bg-gradient-to-l from-gray-900 via-gray-900/95 to-transparent border-l border-white/10 p-4 overflow-y-auto"
      >
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-bold text-white">全球排行</h3>
        </div>

        <div className="space-y-2">
          {achievementLeaderboard.map((entry, index) => {
            const isCurrentAgent = entry.agentId === agent.id
            return (
              <motion.div
                key={entry.agentId}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, x: -5 }}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border transition-all
                  ${isCurrentAgent
                    ? 'bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                    : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
                  }
                `}
              >
                {/* 排名 */}
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                  ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                    'bg-gray-700 text-gray-300'
                  }
                `}>
                  {index + 1}
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-sm truncate ${isCurrentAgent ? 'text-yellow-400' : 'text-white'}`}>
                    {entry.agentName}
                    {isCurrentAgent && ' (你)'}
                  </div>
                  <div className="text-xs text-gray-400">{entry.score} 点</div>
                </div>

                {/* 徽章 */}
                {index < 3 && (
                  <Medal className={`w-5 h-5 ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-300' :
                    'text-orange-400'
                  }`} />
                )}
              </motion.div>
            )
          })}
        </div>

        {achievementLeaderboard.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">
            暂无排行数据
          </div>
        )}
      </motion.div>

      {/* 成就详情模态框 */}
      <AnimatePresence>
        {selectedAchievement && !showShareModal && (
          <AchievementDetailModal
            achievement={selectedAchievement}
            unlocked={isUnlocked(selectedAchievement.id)}
            progress={getProgress(selectedAchievement.id)}
            onClose={() => setSelectedAchievement(null)}
            onShare={(e) => handleShare(selectedAchievement, e)}
          />
        )}
      </AnimatePresence>

      {/* 分享模态框 */}
      <AnimatePresence>
        {showShareModal && selectedAchievement && (
          <AchievementShareCard
            achievement={selectedAchievement}
            agentName={agent.displayName}
            agentLevel={agent.level}
            totalAchievements={stats.unlocked}
            onClose={() => {
              setShowShareModal(false)
              setSelectedAchievement(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * 成就详情模态框（增强版）
 */
interface AchievementDetailModalProps {
  achievement: Achievement
  unlocked: boolean
  progress: number
  onClose: () => void
  onShare: (e: React.MouseEvent) => void
}

const AchievementDetailModal: React.FC<AchievementDetailModalProps> = ({
  achievement,
  unlocked,
  progress,
  onClose,
  onShare
}) => {
  const feedback = useInstantFeedback()

  const getRarityConfig = (rarity: AchievementRarity) => {
    const configs = {
      common: { gradient: 'from-gray-600 to-gray-700', border: 'border-gray-500', text: 'text-gray-300', name: '普通' },
      rare: { gradient: 'from-blue-600 to-blue-700', border: 'border-blue-500', text: 'text-blue-300', name: '稀有' },
      epic: { gradient: 'from-purple-600 to-purple-700', border: 'border-purple-500', text: 'text-purple-300', name: '史诗' },
      legendary: { gradient: 'from-orange-600 to-yellow-600', border: 'border-yellow-500', text: 'text-yellow-300', name: '传说' }
    }
    return configs[rarity]
  }

  const config = getRarityConfig(achievement.rarity)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50, rotateX: -15 }}
        animate={{ scale: 1, y: 0, rotateX: 0 }}
        exit={{ scale: 0.8, y: 50, rotateX: 15 }}
        transition={{ type: 'spring', damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
        className={`
          w-[550px] max-w-[90vw] bg-gradient-to-br ${config.gradient}
          border-4 ${config.border} rounded-3xl p-10 shadow-2xl
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* 3D光泽效果 */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent rounded-3xl pointer-events-none" />

        {/* 图标 */}
        <motion.div
          animate={{
            rotateY: unlocked ? [0, 360] : 0,
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="text-9xl text-center mb-4 drop-shadow-2xl"
        >
          {unlocked ? achievement.icon : '🔒'}
        </motion.div>

        {/* 稀有度 */}
        <div className={`text-center text-sm font-bold ${config.text} mb-2 uppercase tracking-widest`}>
          {config.name}
        </div>

        {/* 名称 */}
        <h2 className="text-4xl font-black text-white text-center mb-4 drop-shadow-lg">
          {unlocked ? achievement.name : '???'}
        </h2>

        {/* 描述 */}
        {unlocked && (
          <p className="text-white/90 text-center mb-6 leading-relaxed text-lg">
            {achievement.description}
          </p>
        )}

        {/* 进度 */}
        {achievement.requirement && (
          <div className="bg-black/30 rounded-xl p-4 mb-6 backdrop-blur-sm">
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>完成进度</span>
              <span className="font-bold">{progress}/{achievement.requirement}</span>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((progress / achievement.requirement) * 100, 100)}%` }}
                transition={{ duration: 1 }}
                className="bg-gradient-to-r from-white via-yellow-300 to-yellow-400 h-full"
              />
            </div>
          </div>
        )}

        {/* 奖励 */}
        {unlocked && (
          <div className="bg-black/30 rounded-xl p-5 mb-6 backdrop-blur-sm">
            <h3 className="text-white font-bold mb-3 text-center flex items-center justify-center gap-2">
              <Award className="w-5 h-5" />
              获得奖励
            </h3>
            <div className="space-y-2">
              {achievement.rewards.coins && achievement.rewards.coins > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-white/80">金币</span>
                  <span className="text-yellow-400 font-bold text-xl">+{achievement.rewards.coins} 💰</span>
                </div>
              )}
              {achievement.rewards.exp && achievement.rewards.exp > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-white/80">经验值</span>
                  <span className="text-blue-400 font-bold text-xl">+{achievement.rewards.exp} EXP</span>
                </div>
              )}
              {achievement.rewards.title && (
                <div className="flex justify-between items-center">
                  <span className="text-white/80">称号</span>
                  <span className="text-purple-400 font-bold text-lg">「{achievement.rewards.title}」</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 按钮组 */}
        <div className="flex gap-3">
          {unlocked && (
            <button
              onClick={(e) => {
                feedback.onClick(e)
                audioSystem.play('click')
                onShare(e)
              }}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-2 border-blue-400 rounded-xl text-white font-bold transition-all feedback-button-scale flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              分享成就
            </button>
          )}
          <button
            onClick={(e) => {
              feedback.onClick(e)
              audioSystem.play('click')
              onClose()
            }}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 border-2 border-white/30 rounded-xl text-white font-bold transition-all feedback-button-scale"
          >
            关闭
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
