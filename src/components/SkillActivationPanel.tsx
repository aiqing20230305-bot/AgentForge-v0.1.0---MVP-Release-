/**
 * Skill Activation Panel Component
 * Allows agents to activate active skills with cooldown display
 */

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Clock, Lock } from 'lucide-react'
import { skillEffectProcessor } from '../services/skillEffectProcessor'
import { SKILLS } from '../data/skillTree'
import type { Skill } from '../data/skillTree'

interface SkillActivationPanelProps {
  agentId: string
  agentLevel: number
  unlockedSkills: string[]
  onSkillActivated?: (skillId: string, success: boolean, message: string) => void
  className?: string
}

export const SkillActivationPanel: React.FC<SkillActivationPanelProps> = ({
  agentId,
  agentLevel,
  unlockedSkills,
  onSkillActivated,
  className = ''
}) => {
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({})
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)

  // Get all active skills that the agent has unlocked
  const activeSkills = SKILLS.filter(
    s => s.category === 'active' && unlockedSkills.includes(s.id)
  )

  // Update cooldowns every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newCooldowns: Record<string, number> = {}

      activeSkills.forEach(skill => {
        const status = skillEffectProcessor.getCooldownStatus(agentId, skill.id)
        if (status.onCooldown) {
          newCooldowns[skill.id] = status.remainingSeconds
        }
      })

      setCooldowns(newCooldowns)
    }, 1000)

    return () => clearInterval(interval)
  }, [agentId, activeSkills])

  const handleActivateSkill = (skill: Skill) => {
    const result = skillEffectProcessor.activateSkill(agentId, skill)

    if (result.success) {
      // Trigger visual effect
      setSelectedSkill(skill)
      setTimeout(() => setSelectedSkill(null), 1000)
    }

    onSkillActivated?.(skill.id, result.success, result.message)
  }

  if (activeSkills.length === 0) {
    return (
      <div className={`p-4 rounded-lg bg-gray-800/50 border border-gray-700 ${className}`}>
        <div className="text-center text-gray-400">
          <Lock className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">未解锁主动技能</p>
          <p className="text-xs mt-1">升级并解锁技能树中的主动技能</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-bold text-white">主动技能</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activeSkills.map(skill => {
          const onCooldown = cooldowns[skill.id] !== undefined
          const cooldownRemaining = cooldowns[skill.id] || 0
          const cooldownPercent = skill.cooldown
            ? ((skill.cooldown - cooldownRemaining) / skill.cooldown) * 100
            : 0

          const isSelected = selectedSkill?.id === skill.id

          return (
            <motion.button
              key={skill.id}
              onClick={() => !onCooldown && handleActivateSkill(skill)}
              disabled={onCooldown}
              className={`
                relative p-4 rounded-lg border-2 transition-all
                ${onCooldown
                  ? 'bg-gray-800/30 border-gray-700 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/50 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer'
                }
                ${isSelected ? 'scale-105 shadow-xl shadow-purple-500/50' : ''}
              `}
              whileHover={!onCooldown ? { scale: 1.02 } : undefined}
              whileTap={!onCooldown ? { scale: 0.98 } : undefined}
              animate={isSelected ? {
                boxShadow: [
                  '0 0 0px rgba(168, 85, 247, 0)',
                  '0 0 30px rgba(168, 85, 247, 0.8)',
                  '0 0 0px rgba(168, 85, 247, 0)'
                ]
              } : undefined}
              transition={{ duration: 1 }}
            >
              {/* Cooldown overlay */}
              {onCooldown && (
                <div
                  className="absolute inset-0 bg-gray-900/60 rounded-lg"
                  style={{
                    clipPath: `polygon(0 ${cooldownPercent}%, 100% ${cooldownPercent}%, 100% 100%, 0 100%)`
                  }}
                />
              )}

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-3xl">{skill.icon}</span>
                  {onCooldown && (
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-mono">
                        {cooldownRemaining}s
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-left">
                  <div className="font-bold text-white mb-1">{skill.name}</div>
                  <div className="text-xs text-gray-300 mb-2">
                    {skill.description}
                  </div>

                  {/* Effects */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {skill.effects.map((effect, idx) => (
                      <div
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300"
                      >
                        +{effect.value}%
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {skill.cooldown && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{skill.cooldown}s CD</span>
                      </div>
                    )}
                    {skill.manaCost && (
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>{skill.manaCost} 能量</span>
                      </div>
                    )}
                    {skill.effects[0]?.duration && (
                      <div>持续 {skill.effects[0].duration}s</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ready indicator */}
              {!onCooldown && (
                <motion.div
                  className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-400"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      <div className="text-xs text-gray-400 text-center mt-4">
        点击技能图标激活，激活后将在一定时间内获得增益效果
      </div>
    </div>
  )
}
