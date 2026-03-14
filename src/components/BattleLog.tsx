/**
 * 战斗日志组件
 * 实时显示战斗过程
 */

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BattleLogEntry } from '../types/battle'
import { Swords, Shield, Heart, Zap, Skull } from 'lucide-react'

interface BattleLogProps {
  logs: BattleLogEntry[]
  maxHeight?: string
  showTimestamps?: boolean
}

export const BattleLog: React.FC<BattleLogProps> = ({
  logs,
  maxHeight = '400px',
  showTimestamps = false
}) => {
  const logEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  if (logs.length === 0) {
    return (
      <div className="bg-black/90 border border-gray-700 rounded-lg p-6 text-center" style={{ maxHeight }}>
        <div className="text-gray-500">战斗尚未开始...</div>
      </div>
    )
  }

  return (
    <div
      className="bg-black/90 border border-gray-700 rounded-lg p-4 overflow-y-auto font-mono text-sm"
      style={{ maxHeight }}
    >
      <AnimatePresence initial={false}>
        {logs.map((log, index) => (
          <BattleLogItem
            key={log.id}
            log={log}
            index={index}
            showTimestamp={showTimestamps}
          />
        ))}
      </AnimatePresence>
      <div ref={logEndRef} />
    </div>
  )
}

/**
 * 单条战斗日志
 */
interface BattleLogItemProps {
  log: BattleLogEntry
  index: number
  showTimestamp: boolean
}

const BattleLogItem: React.FC<BattleLogItemProps> = ({ log, index, showTimestamp }) => {
  const { color, icon } = getLogStyle(log)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className={`mb-2 flex items-start gap-2 ${color}`}
    >
      {/* 图标 */}
      <span className="flex-shrink-0 mt-0.5">{icon}</span>

      {/* 消息内容 */}
      <div className="flex-1">
        <span className="whitespace-pre-wrap break-words">{log.message}</span>

        {/* 伤害数字 */}
        {log.damage !== undefined && log.damage > 0 && (
          <span className="ml-2 font-bold text-red-400">-{log.damage} HP</span>
        )}

        {/* 治疗数字 */}
        {log.heal !== undefined && log.heal > 0 && (
          <span className="ml-2 font-bold text-green-400">+{log.heal} HP</span>
        )}

        {/* 时间戳 */}
        {showTimestamp && (
          <span className="ml-2 text-xs text-gray-600">
            [{new Date(log.timestamp).toLocaleTimeString()}]
          </span>
        )}
      </div>
    </motion.div>
  )
}

/**
 * 获取日志样式
 */
function getLogStyle(log: BattleLogEntry): { color: string; icon: React.ReactNode } {
  const styles: Record<string, { color: string; icon: React.ReactNode }> = {
    attack: {
      color: 'text-orange-400',
      icon: <Swords className="w-4 h-4" />
    },
    skill: {
      color: 'text-purple-400',
      icon: <Zap className="w-4 h-4" />
    },
    defend: {
      color: 'text-blue-400',
      icon: <Shield className="w-4 h-4" />
    },
    heal: {
      color: 'text-green-400',
      icon: <Heart className="w-4 h-4" />
    },
    damage: {
      color: 'text-red-400',
      icon: <span className="text-red-500">💥</span>
    },
    crit: {
      color: 'text-yellow-400',
      icon: <span className="text-yellow-300">⚡</span>
    },
    miss: {
      color: 'text-gray-500',
      icon: <span className="text-gray-400">💨</span>
    },
    death: {
      color: 'text-red-600',
      icon: <Skull className="w-4 h-4" />
    },
    victory: {
      color: 'text-green-500 font-bold',
      icon: <span className="text-green-400">🎉</span>
    },
    defeat: {
      color: 'text-red-500 font-bold',
      icon: <span className="text-red-400">💀</span>
    },
    turn_start: {
      color: 'text-cyan-400',
      icon: <span className="text-cyan-300">🔄</span>
    },
    system: {
      color: 'text-gray-400',
      icon: <span className="text-gray-500">ℹ️</span>
    }
  }

  return styles[log.action] || {
    color: 'text-white',
    icon: <span>•</span>
  }
}

/**
 * 战斗日志统计面板
 */
interface BattleLogStatsProps {
  logs: BattleLogEntry[]
  playerName: string
  opponentName: string
}

export const BattleLogStats: React.FC<BattleLogStatsProps> = ({ logs, playerName, opponentName }) => {
  // 统计数据
  const playerDamage = logs
    .filter(log => log.attacker === playerName && log.damage)
    .reduce((sum, log) => sum + (log.damage || 0), 0)

  const opponentDamage = logs
    .filter(log => log.attacker === opponentName && log.damage)
    .reduce((sum, log) => sum + (log.damage || 0), 0)

  const playerHits = logs.filter(log => log.attacker === playerName && log.damage && log.damage > 0).length
  const playerMisses = logs.filter(log => log.attacker === playerName && log.action === 'miss').length
  const playerCrits = logs.filter(log => log.attacker === playerName && log.action === 'crit').length

  const opponentHits = logs.filter(log => log.attacker === opponentName && log.damage && log.damage > 0).length
  const opponentMisses = logs.filter(log => log.attacker === opponentName && log.action === 'miss').length
  const opponentCrits = logs.filter(log => log.attacker === opponentName && log.action === 'crit').length

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <h3 className="text-white font-bold mb-4 text-center">战斗统计</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* 玩家统计 */}
        <div className="bg-blue-900/20 border border-blue-500 rounded p-3">
          <h4 className="text-blue-300 font-bold mb-2 text-center">{playerName}</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">总伤害:</span>
              <span className="text-white font-bold">{playerDamage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">命中次数:</span>
              <span className="text-white font-bold">{playerHits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">暴击次数:</span>
              <span className="text-yellow-400 font-bold">{playerCrits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">未命中:</span>
              <span className="text-gray-500">{playerMisses}</span>
            </div>
            {playerHits > 0 && (
              <div className="flex justify-between pt-1 border-t border-gray-700">
                <span className="text-gray-400">平均伤害:</span>
                <span className="text-white font-bold">{(playerDamage / playerHits).toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* 对手统计 */}
        <div className="bg-red-900/20 border border-red-500 rounded p-3">
          <h4 className="text-red-300 font-bold mb-2 text-center">{opponentName}</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">总伤害:</span>
              <span className="text-white font-bold">{opponentDamage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">命中次数:</span>
              <span className="text-white font-bold">{opponentHits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">暴击次数:</span>
              <span className="text-yellow-400 font-bold">{opponentCrits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">未命中:</span>
              <span className="text-gray-500">{opponentMisses}</span>
            </div>
            {opponentHits > 0 && (
              <div className="flex justify-between pt-1 border-t border-gray-700">
                <span className="text-gray-400">平均伤害:</span>
                <span className="text-white font-bold">{(opponentDamage / opponentHits).toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
