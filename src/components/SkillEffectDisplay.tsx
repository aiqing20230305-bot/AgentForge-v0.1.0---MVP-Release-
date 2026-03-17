/**
 * Skill Effect Display Component
 * Shows active skill effects with visual particles and animations
 */

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ActiveSkillInstance, SkillVisualEffect } from '../services/skillEffectProcessor'
import { SKILLS } from '../data/skillTree'

interface SkillEffectDisplayProps {
  agentId: string
  activeSkills: ActiveSkillInstance[]
  className?: string
}

export const SkillEffectDisplay: React.FC<SkillEffectDisplayProps> = ({
  activeSkills,
  className = ''
}) => {
  const [particles, setParticles] = useState<Array<{
    id: string
    x: number
    y: number
    color: string
    size: number
  }>>([])

  useEffect(() => {
    if (activeSkills.length === 0) {
      setParticles([])
      return
    }

    // Generate particles for active skills
    const newParticles: typeof particles = []
    activeSkills.forEach(skill => {
      const skillData = SKILLS.find(s => s.id === skill.skillId)
      if (!skillData?.visualEffect) return

      const { color, particleCount } = skillData.visualEffect

      for (let i = 0; i < Math.min(particleCount, 50); i++) {
        newParticles.push({
          id: `${skill.skillId}-${i}`,
          x: Math.random() * 100,
          y: Math.random() * 100,
          color,
          size: Math.random() * 6 + 2
        })
      }
    })

    setParticles(newParticles)
  }, [activeSkills])

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        {activeSkills.map(skill => {
          const skillData = SKILLS.find(s => s.id === skill.skillId)
          if (!skillData) return null

          const remainingTime = Math.max(0, skill.expiresAt - Date.now()) / 1000
          const duration = skill.effects[0]?.duration || 30
          const progress = (remainingTime / duration) * 100

          return (
            <motion.div
              key={skill.skillId}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="mb-2 p-3 rounded-lg backdrop-blur-sm bg-black/30 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{skillData.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {skillData.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {remainingTime.toFixed(1)}s remaining
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {progress.toFixed(0)}%
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-1 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: skillData.visualEffect?.color || '#3b82f6'
                  }}
                  initial={{ width: '100%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'linear' }}
                />
              </div>

              {/* Effects */}
              <div className="mt-2 flex flex-wrap gap-2">
                {skill.effects.map((effect, idx) => (
                  <div
                    key={idx}
                    className="text-xs px-2 py-1 rounded bg-white/5 text-white"
                  >
                    {getEffectLabel(effect.type)}: +{effect.value}%
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Particle effects */}
      {particles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
              }}
              animate={{
                y: [0, -50, -100],
                opacity: [0.8, 0.5, 0],
                scale: [1, 1.2, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function getEffectLabel(type: string): string {
  const labels: Record<string, string> = {
    token_reduction: 'Token节省',
    speed_boost: '速度',
    success_rate: '成功率',
    exp_gain: '经验',
    attack_boost: '攻击力',
    defense_boost: '防御力',
    hp_regen: 'HP恢复'
  }
  return labels[type] || type
}
