/**
 * 战斗竞技场
 * 炉石传说风格的回合制战斗场景
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Battle, BattleAgent } from '../types/battle'
import { Heart, Shield, Swords, Zap } from 'lucide-react'

interface BattleArenaProps {
  battle: Battle
  onUseSkill: (skillIndex: number) => void
  onEndTurn: () => void
  onSurrender: () => void
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  battle,
  onUseSkill,
  onEndTurn,
  onSurrender
}) => {
  const isPlayerTurn = battle.currentPlayer === 1
  const player = battle.player1
  const opponent = battle.player2

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-purple-900 via-blue-900 to-black overflow-hidden">
      {/* 战场背景动画 */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* 回合指示器 */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="absolute top-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="bg-black/80 border-2 border-yellow-400 rounded-xl px-8 py-3 shadow-xl">
          <div className="text-yellow-400 text-center text-lg font-bold">
            回合 {battle.currentTurn}
          </div>
          <div className={`text-center text-sm mt-1 ${isPlayerTurn ? 'text-blue-300' : 'text-red-300'}`}>
            {isPlayerTurn ? '你的回合' : '对手回合'}
          </div>
        </div>
      </motion.div>

      {/* 主战场 */}
      <div className="h-full flex flex-col justify-between p-8">
        {/* 对手区域 */}
        <AgentBattleCard
          agent={opponent}
          isOpponent
          isActive={!isPlayerTurn}
          className="self-center"
        />

        {/* 中央战斗信息 */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            {/* 战斗特效提示 */}
            <AnimatePresence>
              {battle.battleLog.length > 0 && (
                <motion.div
                  key={battle.battleLog[battle.battleLog.length - 1].id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-4xl font-black mb-4"
                >
                  {getActionIcon(battle.battleLog[battle.battleLog.length - 1].action)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 玩家区域 */}
        <AgentBattleCard
          agent={player}
          isOpponent={false}
          isActive={isPlayerTurn}
          className="self-center"
        />

        {/* 技能和操作区 */}
        {isPlayerTurn && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-4"
          >
            <div className="bg-black/80 border-2 border-blue-500 rounded-xl p-4 max-w-2xl mx-auto">
              <div className="grid grid-cols-4 gap-3 mb-3">
                {player.battleSkills.map((skill, index) => (
                  <SkillButton
                    key={skill.id}
                    skill={skill}
                    onUse={() => onUseSkill(index)}
                    disabled={(skill.cooldownRemaining || 0) > 0}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onEndTurn}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all"
                >
                  结束回合
                </button>
                <button
                  onClick={onSurrender}
                  className="px-4 py-2 bg-red-900 hover:bg-red-800 text-white font-bold rounded-lg transition-all"
                >
                  投降
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

/**
 * Agent 战斗卡片
 */
interface AgentBattleCardProps {
  agent: BattleAgent
  isOpponent: boolean
  isActive: boolean
  className?: string
}

const AgentBattleCard: React.FC<AgentBattleCardProps> = ({ agent, isActive, className }) => {
  const hpPercentage = (agent.hp / agent.maxHp) * 100
  const hpColor = hpPercentage > 60 ? 'from-green-600 to-green-400' : hpPercentage > 30 ? 'from-yellow-600 to-yellow-400' : 'from-red-600 to-red-400'

  return (
    <motion.div
      animate={{
        scale: isActive ? 1.05 : 1,
        boxShadow: isActive ? '0 0 30px rgba(59, 130, 246, 0.8)' : '0 0 0px rgba(0, 0, 0, 0)'
      }}
      className={`bg-black/60 border-2 ${isActive ? 'border-blue-400' : 'border-gray-700'} rounded-xl p-6 w-96 ${className}`}
    >
      {/* 名称和等级 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-white font-bold text-xl">{agent.name}</div>
          <div className="text-gray-400 text-sm">Lv. {agent.level}</div>
        </div>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-3xl border-4 border-white/20">
          🤖
        </div>
      </div>

      {/* HP 条 */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <div className="flex items-center gap-1 text-red-300">
            <Heart className="w-4 h-4" />
            <span>HP</span>
          </div>
          <span className="text-white font-bold">{agent.hp} / {agent.maxHp}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden border border-gray-700">
          <motion.div
            initial={{ width: `${hpPercentage}%` }}
            animate={{ width: `${hpPercentage}%` }}
            className={`bg-gradient-to-r ${hpColor} h-full transition-all duration-500`}
          />
        </div>
      </div>

      {/* 属性 */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-gray-900/50 border border-gray-700 rounded p-2 text-center">
          <Swords className="w-4 h-4 text-orange-400 mx-auto mb-1" />
          <div className="text-gray-400">攻击</div>
          <div className="text-white font-bold">{agent.attack}</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-700 rounded p-2 text-center">
          <Shield className="w-4 h-4 text-blue-400 mx-auto mb-1" />
          <div className="text-gray-400">防御</div>
          <div className="text-white font-bold">{agent.defense}</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-700 rounded p-2 text-center">
          <Zap className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
          <div className="text-gray-400">速度</div>
          <div className="text-white font-bold">{agent.speed}</div>
        </div>
      </div>

      {/* Buffs/Debuffs */}
      {(agent.buffs.length > 0 || agent.debuffs.length > 0) && (
        <div className="mt-3 flex gap-1 flex-wrap">
          {agent.buffs.map(buff => (
            <div key={buff.id} className="px-2 py-1 bg-green-900/50 border border-green-500 rounded text-xs text-green-300">
              +{buff.type}
            </div>
          ))}
          {agent.debuffs.map(debuff => (
            <div key={debuff.id} className="px-2 py-1 bg-red-900/50 border border-red-500 rounded text-xs text-red-300">
              -{debuff.type}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

/**
 * 技能按钮
 */
interface SkillButtonProps {
  skill: any
  onUse: () => void
  disabled: boolean
}

const SkillButton: React.FC<SkillButtonProps> = ({ skill, onUse, disabled }) => {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onUse}
      disabled={disabled}
      className={`
        relative p-4 rounded-lg border-2 transition-all
        ${disabled
          ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed'
          : 'bg-gradient-to-br from-purple-900 to-blue-900 border-purple-500 text-white hover:border-purple-300 cursor-pointer'
        }
      `}
    >
      <div className="text-2xl mb-1">{skill.icon || '⚡'}</div>
      <div className="text-xs font-bold">{skill.name}</div>
      {skill.cooldownRemaining > 0 && (
        <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
          <div className="text-white font-bold text-xl">{skill.cooldownRemaining}</div>
        </div>
      )}
    </motion.button>
  )
}

/**
 * 获取动作图标
 */
function getActionIcon(action: string): string {
  const icons: Record<string, string> = {
    attack: '⚔️',
    skill: '✨',
    defend: '🛡️',
    heal: '💚',
    crit: '💥',
    miss: '💨',
    death: '💀'
  }
  return icons[action] || '⚡'
}
