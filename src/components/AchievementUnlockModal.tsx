/**
 * 成就解锁庆祝动画
 * 显示华丽的成就解锁特效
 */

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Achievement } from '../data/achievements'
import { Trophy, Sparkles, Gift } from 'lucide-react'

interface AchievementUnlockModalProps {
  achievement: Achievement
  onClose: () => void
}

export const AchievementUnlockModal: React.FC<AchievementUnlockModalProps> = ({
  achievement,
  onClose
}) => {
  // 4 秒后自动关闭
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  // 稀有度配置
  const rarityConfig = {
    common: {
      color: '#9CA3AF',
      gradient: 'from-gray-600 to-gray-700',
      glow: 'rgba(156, 163, 175, 0.5)',
      label: '普通'
    },
    rare: {
      color: '#3B82F6',
      gradient: 'from-blue-600 to-blue-700',
      glow: 'rgba(59, 130, 246, 0.5)',
      label: '稀有'
    },
    epic: {
      color: '#A855F7',
      gradient: 'from-purple-600 to-purple-700',
      glow: 'rgba(168, 85, 247, 0.5)',
      label: '史诗'
    },
    legendary: {
      color: '#F59E0B',
      gradient: 'from-orange-600 to-orange-700',
      glow: 'rgba(245, 158, 11, 0.5)',
      label: '传说'
    }
  }

  const config = rarityConfig[achievement.rarity as keyof typeof rarityConfig] || rarityConfig.common

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
        onClick={onClose}
      >
        {/* 背景粒子效果 */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 50,
                opacity: 0,
                scale: 0
              }}
              animate={{
                y: -100,
                opacity: [0, 1, 1, 0],
                scale: [0, 1.5, 1, 0],
                rotate: Math.random() * 360
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: 'easeOut'
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: config.color,
                boxShadow: `0 0 20px ${config.glow}`
              }}
            />
          ))}
        </div>

        {/* 主内容 */}
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, rotate: 180, opacity: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 100 }}
          className="relative w-[600px] max-w-[90vw]"
          onClick={e => e.stopPropagation()}
        >
          {/* 光晕效果 */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className={`absolute inset-0 rounded-3xl blur-3xl bg-gradient-to-br ${config.gradient}`}
          />

          {/* 卡片 */}
          <div className={`relative bg-gradient-to-br ${config.gradient} border-4 rounded-3xl p-10 shadow-2xl`}
            style={{ borderColor: config.color }}
          >
            {/* 装饰星星 */}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="absolute -top-6 -right-6"
            >
              <Sparkles className="w-16 h-16" style={{ color: config.color }} />
            </motion.div>

            <motion.div
              animate={{
                rotate: [360, 0],
                scale: [1, 1.3, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="absolute -bottom-6 -left-6"
            >
              <Trophy className="w-14 h-14" style={{ color: config.color }} />
            </motion.div>

            {/* 成就解锁标题 */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-6"
            >
              <div className="text-white/80 text-lg font-bold mb-2 flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5" />
                成就解锁
                <Trophy className="w-5 h-5" />
              </div>
              <motion.h1
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 8, delay: 0.4 }}
                className="text-5xl font-black text-white tracking-wider"
                style={{
                  textShadow: `0 0 30px ${config.glow}, 0 0 60px ${config.glow}`
                }}
              >
                ACHIEVEMENT!
              </motion.h1>
            </motion.div>

            {/* 成就图标 */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10, delay: 0.6 }}
              className="text-9xl text-center mb-6"
            >
              {achievement.icon}
            </motion.div>

            {/* 稀有度 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center mb-4"
            >
              <div
                className="inline-block px-6 py-2 rounded-full text-white font-black text-lg tracking-widest uppercase border-2"
                style={{
                  backgroundColor: config.color + '40',
                  borderColor: config.color,
                  boxShadow: `0 0 20px ${config.glow}`
                }}
              >
                {config.label}
              </div>
            </motion.div>

            {/* 成就名称 */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-3xl font-bold text-white text-center mb-3"
            >
              {achievement.name}
            </motion.h2>

            {/* 成就描述 */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="text-white/90 text-center mb-6 text-lg leading-relaxed"
            >
              {achievement.description}
            </motion.p>

            {/* 奖励 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4 }}
              className="bg-black/30 border-2 border-white/20 rounded-xl p-5 backdrop-blur-sm"
            >
              <div className="flex items-center justify-center gap-2 text-white/80 text-sm font-bold mb-3">
                <Gift className="w-4 h-4" />
                获得奖励
              </div>
              <div className="flex items-center justify-center gap-6 text-lg">
                {achievement.rewards.coins && achievement.rewards.coins > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 1.6 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-3xl">💰</span>
                    <span className="text-yellow-300 font-bold">+{achievement.rewards.coins}</span>
                  </motion.div>
                )}
                {achievement.rewards.exp && achievement.rewards.exp > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 1.7 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-3xl">✨</span>
                    <span className="text-blue-300 font-bold">+{achievement.rewards.exp} EXP</span>
                  </motion.div>
                )}
                {achievement.rewards.title && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 1.8 }}
                    className="text-center"
                  >
                    <div className="text-sm text-white/60 mb-1">获得称号</div>
                    <div className="text-purple-300 font-bold">「{achievement.rewards.title}」</div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* 提示文字 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-6 text-center text-white/50 text-sm"
            >
              点击任意位置关闭
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
