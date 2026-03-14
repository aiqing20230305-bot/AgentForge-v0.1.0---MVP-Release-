/**
 * 全局经验条组件
 * 显示在屏幕顶部，实时更新Agent经验值
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDataSourceStore } from '../store/useDataSourceStore'
import { Zap, TrendingUp, Star } from 'lucide-react'
import { useInstantFeedback } from '../hooks/useInstantFeedback'
import { scaleVariants, transitions } from '../utils/animations'

export const GlobalExpBar: React.FC = () => {
  const { agentsCache } = useDataSourceStore()
  const feedback = useInstantFeedback()

  const [isNearLevelUp, setIsNearLevelUp] = useState(false)
  const [showLevelUpEffect, setShowLevelUpEffect] = useState(false)
  const [prevLevel, setPrevLevel] = useState(0)

  // 获取当前选中的Agent（默认第一个）
  const agent = agentsCache.length > 0 ? agentsCache[0] : null

  const currentExp = agent?.levelSystem?.currentExp || 0
  const expToNextLevel = agent?.levelSystem?.expToNextLevel || 100
  const currentLevel = agent?.levelSystem?.currentLevel || 1
  const progress = (currentExp / expToNextLevel) * 100

  // 检测是否接近升级（>80%）
  useEffect(() => {
    setIsNearLevelUp(progress > 80)
  }, [progress])

  // 检测升级
  useEffect(() => {
    if (currentLevel > prevLevel && prevLevel > 0) {
      setShowLevelUpEffect(true)
      feedback.onLevelUp(window.innerWidth / 2, 40)
      setTimeout(() => setShowLevelUpEffect(false), 2000)
    }
    setPrevLevel(currentLevel)
  }, [currentLevel, prevLevel, feedback])

  if (!agent) return null

  return (
    <>
      {/* 全局经验条 */}
      <div data-testid="global-exp-bar" className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-b border-cyan-500/30">
        <div className="max-w-full px-4 py-2 flex items-center gap-4">
          {/* Agent信息 */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {currentLevel}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-xs font-bold text-white truncate">{agent.name}</div>
              <div className="text-[10px] text-gray-400">{agent.role}</div>
            </div>
          </div>

          {/* 经验条 */}
          <div className="flex-1 relative">
            <div className="relative h-6 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
              {/* 进度条 */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${
                  isNearLevelUp
                    ? 'from-yellow-500 via-orange-500 to-red-500'
                    : 'from-cyan-500 via-blue-500 to-indigo-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={transitions.slow}
              >
                {/* 闪光效果（接近升级时） */}
                {isNearLevelUp && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                    animate={{
                      x: ['-100%', '200%']
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                )}
              </motion.div>

              {/* 经验值文本 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white drop-shadow-lg z-10">
                  {currentExp.toLocaleString()} / {expToNextLevel.toLocaleString()} XP
                </span>
              </div>

              {/* 脉冲边框（接近升级时） */}
              {isNearLevelUp && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-yellow-400"
                  animate={{
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              )}
            </div>

            {/* 进度百分比 */}
            <motion.div
              className="absolute -top-1 right-0 text-[10px] font-bold text-yellow-400"
              animate={isNearLevelUp ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5, repeat: isNearLevelUp ? Infinity : 0 }}
            >
              {progress.toFixed(1)}%
            </motion.div>
          </div>

          {/* 下一级别 */}
          <div className="flex items-center gap-2 text-gray-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Lv.{currentLevel + 1}</span>
          </div>

          {/* 快速操作 */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                feedback.onClick(e)
                // TODO: 打开经验详情面板
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors feedback-button-scale"
              title="经验详情"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              onClick={(e) => {
                feedback.onClick(e)
                // TODO: 打开成就面板
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors feedback-button-scale"
              title="成就"
            >
              <Star className="w-4 h-4 text-yellow-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 升级特效 */}
      <AnimatePresence>
        {showLevelUpEffect && (
          <motion.div
            variants={scaleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            {/* 背景闪光 */}
            <motion.div
              className="absolute inset-0 bg-gradient-radial from-yellow-500/30 via-transparent to-transparent"
              animate={{
                opacity: [0, 1, 0]
              }}
              transition={{ duration: 1 }}
            />

            {/* LEVEL UP 文字 */}
            <motion.div
              className="text-center"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-2xl">
                LEVEL UP!
              </div>
              <div className="text-4xl font-bold text-white mt-4">
                Lv.{currentLevel}
              </div>
            </motion.div>

            {/* 金色粒子环绕 */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 rounded-full bg-yellow-400 shadow-lg"
                style={{
                  left: '50%',
                  top: '50%'
                }}
                animate={{
                  x: [0, Math.cos((i * Math.PI * 2) / 12) * 300],
                  y: [0, Math.sin((i * Math.PI * 2) / 12) * 300],
                  opacity: [1, 0],
                  scale: [1, 0]
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.05,
                  ease: 'easeOut'
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
