/**
 * Skill Effects Summary Component
 * Displays aggregate skill effects for an agent
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Zap, Target, TrendingUp, Clock, Shield, Heart, DollarSign } from 'lucide-react'
import type { ProcessedEffects } from '../services/skillEffectProcessor'

interface SkillEffectsSummaryProps {
  effects: ProcessedEffects
  compact?: boolean
  className?: string
}

export const SkillEffectsSummary: React.FC<SkillEffectsSummaryProps> = ({
  effects,
  compact = false,
  className = ''
}) => {
  const effectItems = [
    {
      label: 'Token节省',
      value: effects.tokenReduction,
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
    {
      label: '速度提升',
      value: effects.speedBoost,
      icon: Zap,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      label: '成功率',
      value: effects.successRate,
      icon: Target,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    },
    {
      label: '经验加成',
      value: effects.expGain,
      icon: TrendingUp,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30'
    },
    {
      label: '攻击力',
      value: effects.attackBoost,
      icon: Shield,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30'
    },
    {
      label: '防御力',
      value: effects.defenseBoost,
      icon: Shield,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30'
    },
    {
      label: 'HP恢复',
      value: effects.hpRegen,
      icon: Heart,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30'
    }
  ].filter(item => item.value > 0)

  if (effectItems.length === 0) {
    return null
  }

  if (compact) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {effectItems.map((item, idx) => {
          const Icon = item.icon
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`
                flex items-center gap-1.5 px-2 py-1 rounded-md
                ${item.bgColor} border ${item.borderColor}
              `}
            >
              <Icon className={`w-3 h-3 ${item.color}`} />
              <span className={`text-xs font-medium ${item.color}`}>
                +{item.value.toFixed(0)}%
              </span>
            </motion.div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-sm font-bold text-gray-300 mb-3">当前技能效果</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {effectItems.map((item, idx) => {
          const Icon = item.icon
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`
                p-3 rounded-lg border
                ${item.bgColor} ${item.borderColor}
                backdrop-blur-sm
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${item.color}`} />
                <span className={`text-2xl font-bold ${item.color}`}>
                  +{item.value.toFixed(0)}%
                </span>
              </div>
              <div className="text-xs text-gray-400">{item.label}</div>

              {/* Progress bar */}
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${item.bgColor.replace('/10', '/50')}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, item.value)}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Multiplier summary */}
      <div className="mt-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
        <div className="text-xs text-gray-400 mb-2">效果倍率</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-xs text-gray-500">Token消耗</div>
            <div className="text-sm font-bold text-green-400">
              ×{effects.totalTokenMultiplier.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">执行速度</div>
            <div className="text-sm font-bold text-blue-400">
              ×{effects.totalSpeedMultiplier.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">成功率</div>
            <div className="text-sm font-bold text-purple-400">
              ×{effects.totalSuccessMultiplier.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">经验获取</div>
            <div className="text-sm font-bold text-yellow-400">
              ×{effects.totalExpMultiplier.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
