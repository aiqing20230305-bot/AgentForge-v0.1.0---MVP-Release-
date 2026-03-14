/**
 * 战斗结果界面
 * 显示胜利/失败和奖励
 */

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Battle } from '../types/battle'
import { Trophy, Skull, Coins, Star, TrendingUp, Award } from 'lucide-react'

interface BattleResultProps {
  battle: Battle
  isVictory: boolean
  onClose: () => void
  onRematch?: () => void
}

export const BattleResult: React.FC<BattleResultProps> = ({
  battle,
  isVictory,
  onClose,
  onRematch
}) => {
  // 播放音效（可选）
  useEffect(() => {
    // TODO: 播放胜利/失败音效
  }, [isVictory])

  const rewards = battle.rewards

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
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 50,
                opacity: 0
              }}
              animate={{
                y: -100,
                opacity: [0, 1, 1, 0],
                rotate: Math.random() * 360
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                ease: 'easeOut'
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: isVictory ? '#FCD34D' : '#EF4444'
              }}
            />
          ))}
        </div>

        {/* 结果卡片 */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', damping: 15, stiffness: 100 }}
          className="relative w-[600px] max-w-[90vw] z-10"
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
            className={`absolute inset-0 rounded-3xl blur-3xl ${
              isVictory ? 'bg-yellow-500' : 'bg-red-500'
            }`}
          />

          {/* 主卡片 */}
          <div
            className={`relative rounded-3xl p-10 shadow-2xl border-4 ${
              isVictory
                ? 'bg-gradient-to-br from-yellow-900/90 via-orange-900/90 to-red-900/90 border-yellow-500'
                : 'bg-gradient-to-br from-gray-900/90 via-red-900/90 to-black/90 border-red-500'
            }`}
          >
            {/* 结果标题 */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="text-9xl mb-4"
              >
                {isVictory ? <Trophy className="w-24 h-24 mx-auto text-yellow-400" /> : <Skull className="w-24 h-24 mx-auto text-red-400" />}
              </motion.div>

              <motion.h1
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 8, delay: 0.4 }}
                className={`text-6xl font-black tracking-wider mb-2 ${
                  isVictory ? 'text-yellow-300' : 'text-red-400'
                }`}
                style={{
                  textShadow: isVictory
                    ? '0 0 30px rgba(252, 211, 77, 1), 0 0 60px rgba(252, 211, 77, 0.5)'
                    : '0 0 30px rgba(239, 68, 68, 1), 0 0 60px rgba(239, 68, 68, 0.5)'
                }}
              >
                {isVictory ? 'VICTORY!' : 'DEFEAT'}
              </motion.h1>

              <p className="text-white/80 text-lg">
                {isVictory
                  ? '恭喜！你赢得了这场战斗！'
                  : '很遗憾，你输掉了这场战斗。'}
              </p>
            </motion.div>

            {/* 战斗统计 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-black/30 border border-white/20 rounded-xl p-4 mb-6"
            >
              <h3 className="text-white font-bold mb-3 text-center">战斗数据</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-gray-400">回合数</div>
                  <div className="text-white text-2xl font-bold">{battle.currentTurn}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">战斗时长</div>
                  <div className="text-white text-2xl font-bold">
                    {Math.floor(battle.currentTurn * 5)} 秒
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 奖励展示 */}
            {isVictory && rewards && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-xl p-6 mb-6"
              >
                <h3 className="text-yellow-300 font-bold mb-4 text-center flex items-center justify-center gap-2">
                  <Award className="w-5 h-5" />
                  战斗奖励
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  {/* 经验值 */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, type: 'spring' }}
                    className="bg-black/30 border border-blue-500 rounded-lg p-3 text-center"
                  >
                    <Star className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <div className="text-xs text-gray-400 mb-1">经验值</div>
                    <div className="text-blue-300 text-xl font-bold">+{rewards.exp}</div>
                  </motion.div>

                  {/* 金币 */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.1, type: 'spring' }}
                    className="bg-black/30 border border-yellow-500 rounded-lg p-3 text-center"
                  >
                    <Coins className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <div className="text-xs text-gray-400 mb-1">金币</div>
                    <div className="text-yellow-300 text-xl font-bold">+{rewards.coins}</div>
                  </motion.div>

                  {/* 排位分 */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.2, type: 'spring' }}
                    className="bg-black/30 border border-purple-500 rounded-lg p-3 text-center"
                  >
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <div className="text-xs text-gray-400 mb-1">排位分</div>
                    <div className="text-purple-300 text-xl font-bold">+{rewards.rankPoints}</div>
                  </motion.div>
                </div>

                {/* 额外奖励 */}
                {rewards.items && rewards.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-yellow-500/30">
                    <div className="text-sm text-yellow-200 mb-2">额外奖励:</div>
                    <div className="flex flex-wrap gap-2">
                      {rewards.items.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 1.3 + index * 0.1 }}
                          className="px-3 py-1 bg-purple-900/50 border border-purple-400 rounded-full text-xs text-purple-200"
                        >
                          {item}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 失败鼓励 */}
            {!isVictory && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 mb-6 text-center"
              >
                <p className="text-red-200">不要气馁！分析战斗数据，提升实力后再来挑战吧！</p>
              </motion.div>
            )}

            {/* 按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex gap-4"
            >
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all"
              >
                返回
              </button>
              {onRematch && (
                <button
                  onClick={onRematch}
                  className={`
                    flex-1 px-6 py-3 font-bold rounded-lg transition-all shadow-lg
                    ${isVictory
                      ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white shadow-yellow-600/50'
                      : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-red-600/50'
                    }
                  `}
                >
                  再战一场！
                </button>
              )}
            </motion.div>

            {/* 装饰元素 */}
            {isVictory && (
              <>
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.3, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  className="absolute -top-8 -right-8 text-yellow-400"
                >
                  <Trophy className="w-16 h-16 fill-yellow-400" />
                </motion.div>

                <motion.div
                  animate={{
                    rotate: [360, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  className="absolute -bottom-8 -left-8 text-orange-400"
                >
                  <Award className="w-14 h-14" />
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
