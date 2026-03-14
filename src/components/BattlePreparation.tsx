/**
 * 战斗准备界面
 * 选择对手和查看属性对比
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import type { AgentData } from '../store/useDataSourceStore'
import { Swords, Shield, Zap, Heart } from 'lucide-react'

interface BattlePreparationProps {
  playerAgent: AgentData
  availableOpponents: AgentData[]
  onStartBattle: (opponentId: string) => void
  onCancel: () => void
}

export const BattlePreparation: React.FC<BattlePreparationProps> = ({
  playerAgent,
  availableOpponents,
  onStartBattle,
  onCancel
}) => {
  const [selectedOpponent, setSelectedOpponent] = useState<AgentData | null>(null)

  // 计算战斗属性
  const calculateBattleStats = (agent: AgentData) => {
    const level = agent.levelSystem?.currentLevel || agent.level || 1
    return {
      hp: level * 100,
      attack: level * 5,
      defense: level * 3,
      speed: level * 2
    }
  }

  const playerStats = calculateBattleStats(playerAgent)
  const opponentStats = selectedOpponent ? calculateBattleStats(selectedOpponent) : null

  // 胜率预测（简单算法）
  const calculateWinRate = () => {
    if (!selectedOpponent) return 50
    const playerPower = (playerStats.attack + playerStats.defense + playerStats.speed) * playerStats.hp
    const opponentPower = opponentStats ? (opponentStats.attack + opponentStats.defense + opponentStats.speed) * opponentStats.hp : 1
    const ratio = playerPower / (playerPower + opponentPower)
    return Math.round(ratio * 100)
  }

  const winRate = calculateWinRate()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-[1000px] max-w-[95vw] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-red-500 rounded-2xl p-8 shadow-2xl"
      >
        {/* 标题 */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-4xl font-black text-red-400 mb-2 tracking-wider"
            style={{ textShadow: '0 0 20px rgba(248, 113, 113, 0.8)' }}
          >
            ⚔️ PVP 对战准备 ⚔️
          </motion.h1>
          <p className="text-gray-400 text-sm">选择你的对手，准备战斗！</p>
        </div>

        {/* 主战场 */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* 玩家 */}
          <div className="bg-blue-900/20 border-2 border-blue-500 rounded-xl p-6">
            <h2 className="text-xl font-bold text-blue-300 mb-4 text-center">你的 Agent</h2>
            <div className="text-center mb-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-4xl border-4 border-blue-300 shadow-lg shadow-blue-500/50">
                {playerAgent.avatar || '🤖'}
              </div>
              <div className="text-2xl font-bold text-white mt-3">{playerAgent.name}</div>
              <div className="text-sm text-blue-300">Level {playerAgent.levelSystem?.currentLevel || playerAgent.level || 1}</div>
            </div>

            {/* 属性 */}
            <div className="space-y-2">
              <StatBar icon={<Heart className="w-4 h-4" />} label="HP" value={playerStats.hp} max={playerStats.hp} color="from-red-600 to-red-400" />
              <StatBar icon={<Swords className="w-4 h-4" />} label="攻击" value={playerStats.attack} max={100} color="from-orange-600 to-orange-400" />
              <StatBar icon={<Shield className="w-4 h-4" />} label="防御" value={playerStats.defense} max={100} color="from-blue-600 to-blue-400" />
              <StatBar icon={<Zap className="w-4 h-4" />} label="速度" value={playerStats.speed} max={100} color="from-yellow-600 to-yellow-400" />
            </div>
          </div>

          {/* VS 动画 */}
          <div className="flex items-center justify-center">
            {selectedOpponent ? (
              <div>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-8xl font-black text-red-500 mb-4"
                  style={{ textShadow: '0 0 30px rgba(239, 68, 68, 0.8)' }}
                >
                  VS
                </motion.div>

                {/* 胜率预测 */}
                <div className="text-center bg-black/50 border border-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">胜率预测</div>
                  <div className="text-3xl font-bold" style={{ color: winRate >= 60 ? '#10B981' : winRate >= 40 ? '#F59E0B' : '#EF4444' }}>
                    {winRate}%
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">❓</div>
                <div className="text-lg">选择对手</div>
              </div>
            )}
          </div>
        </div>

        {/* 对手选择列表 */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 mb-6 max-h-[200px] overflow-y-auto">
          <h3 className="text-white font-bold mb-3">选择对手</h3>
          <div className="grid grid-cols-3 gap-3">
            {availableOpponents.map(opponent => {
              const level = opponent.levelSystem?.currentLevel || opponent.level || 1
              const isSelected = selectedOpponent?.id === opponent.id

              return (
                <motion.div
                  key={opponent.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedOpponent(opponent)}
                  className={`
                    cursor-pointer rounded-lg p-3 border-2 transition-all
                    ${isSelected
                      ? 'bg-red-900/30 border-red-500 shadow-lg shadow-red-500/30'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-xl">
                      {opponent.avatar || '🤖'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold truncate">{opponent.name}</div>
                      <div className="text-xs text-gray-400">Lv. {level}</div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* 对手详情 */}
        {selectedOpponent && opponentStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border-2 border-red-500 rounded-xl p-6 mb-6"
          >
            <h3 className="text-xl font-bold text-red-300 mb-4 text-center">对手属性</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">HP:</span>
                <span className="text-white font-bold">{opponentStats.hp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">攻击:</span>
                <span className="text-white font-bold">{opponentStats.attack}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">防御:</span>
                <span className="text-white font-bold">{opponentStats.defense}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">速度:</span>
                <span className="text-white font-bold">{opponentStats.speed}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* 按钮 */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all"
          >
            取消
          </button>
          <button
            onClick={() => selectedOpponent && onStartBattle(selectedOpponent.id)}
            disabled={!selectedOpponent}
            className={`
              flex-1 px-6 py-3 font-bold rounded-lg transition-all
              ${selectedOpponent
                ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-600/50'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {selectedOpponent ? '⚔️ 开始战斗！' : '请选择对手'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * 属性条组件
 */
interface StatBarProps {
  icon: React.ReactNode
  label: string
  value: number
  max: number
  color: string
}

const StatBar: React.FC<StatBarProps> = ({ icon, label, value, max, color }) => {
  const percentage = (value / max) * 100

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
        <div className="flex items-center gap-1">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-bold text-white">{value}</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className={`bg-gradient-to-r ${color} h-full transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}
