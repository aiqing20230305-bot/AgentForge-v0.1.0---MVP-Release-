/**
 * 升级庆祝动画模态框
 * 使用 framer-motion 实现华丽的升级特效
 */

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Star, TrendingUp } from 'lucide-react'
import { fadeVariants, scaleVariants, slideUpVariants, transitions } from '../utils/animations'

interface LevelUpModalProps {
  agentName: string
  oldLevel: number
  newLevel: number
  skillPointsEarned: number
  unlockedSkills?: string[]
  onClose: () => void
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  agentName,
  oldLevel,
  newLevel,
  skillPointsEarned,
  unlockedSkills = [],
  onClose
}) => {
  const [displayLevel, setDisplayLevel] = useState(oldLevel)

  // 数字递增动画
  useEffect(() => {
    if (displayLevel < newLevel) {
      const timer = setTimeout(() => {
        setDisplayLevel(prev => prev + 1)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [displayLevel, newLevel])

  // 3 秒后自动关闭
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        variants={fadeVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: -100 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          className="relative w-[500px] max-w-[90vw]"
          onClick={e => e.stopPropagation()}
        >
          {/* 金色粒子背景 */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * 500,
                  y: Math.random() * 600,
                  opacity: 0
                }}
                animate={{
                  y: [null, -100, -200],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.5,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2
                }}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              />
            ))}
          </div>

          {/* 主内容卡片 */}
          <div className="relative bg-gradient-to-br from-yellow-900/90 via-orange-900/90 to-red-900/90 border-4 border-yellow-500 rounded-2xl p-8 shadow-2xl">
            {/* 闪烁边框效果 */}
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.02, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 via-orange-400/30 to-red-400/30 rounded-2xl blur-xl"
            />

            {/* 内容 */}
            <div className="relative z-10 text-center">
              {/* LEVEL UP 大字 */}
              <motion.h1
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
                className="text-6xl font-black text-yellow-300 mb-2 tracking-wider drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]"
                style={{
                  textShadow: '0 0 30px rgba(250, 204, 21, 1), 0 0 60px rgba(250, 204, 21, 0.5)'
                }}
              >
                LEVEL UP!
              </motion.h1>

              {/* Agent 名称 */}
              <motion.div
                variants={slideUpVariants}
                initial="hidden"
                animate="visible"
                transition={{ ...transitions.fast, delay: 0.4 }}
                className="text-white text-xl font-bold mb-6 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
                {agentName}
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </motion.div>

              {/* 等级数字 */}
              <motion.div
                variants={scaleVariants}
                initial="hidden"
                animate="visible"
                transition={{ ...transitions.spring, delay: 0.6 }}
                className="relative mb-8"
              >
                <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-orange-500">
                  {displayLevel}
                </div>

                {/* 等级标签 */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-sm text-yellow-200 font-bold">
                  Lv. {displayLevel}
                </div>
              </motion.div>

              {/* 奖励信息 */}
              <motion.div
                variants={slideUpVariants}
                initial="hidden"
                animate="visible"
                transition={{ ...transitions.normal, delay: 0.8 }}
                className="space-y-3"
              >
                {/* 技能点 */}
                {skillPointsEarned > 0 && (
                  <div className="bg-white/10 border border-yellow-400/50 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-2 text-yellow-300">
                      <Star className="w-5 h-5 fill-yellow-300" />
                      <span className="text-lg font-bold">
                        +{skillPointsEarned} 技能点
                      </span>
                      <Star className="w-5 h-5 fill-yellow-300" />
                    </div>
                  </div>
                )}

                {/* 解锁的技能 */}
                {unlockedSkills.length > 0 && (
                  <div className="bg-white/10 border border-blue-400/50 rounded-lg p-3 backdrop-blur-sm">
                    <div className="text-sm text-blue-300 font-bold mb-2 flex items-center justify-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      解锁新技能
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {unlockedSkills.map((skill, index) => (
                        <motion.span
                          key={skill}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 1 + index * 0.1 }}
                          className="px-3 py-1 bg-blue-500/30 border border-blue-400 rounded-full text-xs text-blue-200 font-medium"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* 提示文字 */}
              <motion.div
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                transition={{ ...transitions.fast, delay: 1.5 }}
                className="mt-6 text-white/60 text-sm"
              >
                点击任意位置关闭 · 自动关闭中...
              </motion.div>
            </div>

            {/* 装饰星星 */}
            <motion.div
              animate="spin"
              variants={{
                spin: {
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                  transition: { duration: 3, repeat: Infinity, ease: 'linear' }
                }
              }}
              className="absolute -top-4 -right-4 text-yellow-400"
            >
              <Star className="w-12 h-12 fill-yellow-400" />
            </motion.div>

            <motion.div
              animate="spin"
              variants={{
                spin: {
                  rotate: [360, 0],
                  scale: [1, 1.3, 1],
                  transition: { duration: 4, repeat: Infinity, ease: 'linear' }
                }
              }}
              className="absolute -bottom-4 -left-4 text-orange-400"
            >
              <Sparkles className="w-10 h-10" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
