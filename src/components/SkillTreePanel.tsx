/**
 * 技能树面板组件
 * 暗黑破坏神风格的技能树布局
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import type { AgentData } from '../store/useDataSourceStore'
import { SKILLS, canUnlockSkill, type Skill } from '../data/skillTree'
import { Zap, Lock, TrendingUp, CheckCircle } from 'lucide-react'
import { useInstantFeedback } from '../hooks/useInstantFeedback'
import { audioSystem } from '../services/audioSystem'

interface SkillTreePanelProps {
  agent: AgentData
  onUpgradeSkill: (skillId: string) => void
}

export const SkillTreePanel: React.FC<SkillTreePanelProps> = ({ agent, onUpgradeSkill }) => {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const feedback = useInstantFeedback()

  // 确保Agent有技能树数据
  if (!agent.skillTree) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0a] p-8">
        <div className="text-center">
          <div className="text-gray-400 mb-4 text-lg">技能树数据未初始化</div>
          <div className="text-gray-500 text-sm">请刷新页面或重新选择 Agent</div>
        </div>
      </div>
    )
  }

  // 按类别分组技能
  const skillsByCategory = {
    efficiency: SKILLS.filter(s => s.id.includes('token_saver') || s.id.includes('fast_thinker') || s.id.includes('ultra_efficient')),
    combat: SKILLS.filter(s => s.id.includes('power_strike') || s.id.includes('iron_defense') || s.id.includes('battle_rage') || s.id.includes('regeneration') || s.id.includes('berserker')),
    learning: SKILLS.filter(s => s.id.includes('fast_learner') || s.id.includes('knowledge_master') || s.id.includes('wisdom') || s.id.includes('prestige_ready')),
    precision: SKILLS.filter(s => s.id.includes('focus_mind') || s.id.includes('perfect_execution') || s.id.includes('critical_thinking') || s.id.includes('never_fail')),
    ultimate: SKILLS.filter(s => s.id.includes('omniscient') || s.id.includes('time_master') || s.id.includes('cost_zero') || s.id.includes('god_mode'))
  }

  const categoryNames = {
    efficiency: '⚡ 效率系',
    combat: '⚔️ 战斗系',
    learning: '📚 学习系',
    precision: '🎯 精准系',
    ultimate: '👑 终极系'
  }

  const categoryColors = {
    efficiency: { bg: 'from-green-900/40 to-green-800/40', border: 'border-green-500', text: 'text-green-400' },
    combat: { bg: 'from-red-900/40 to-red-800/40', border: 'border-red-500', text: 'text-red-400' },
    learning: { bg: 'from-blue-900/40 to-blue-800/40', border: 'border-blue-500', text: 'text-blue-400' },
    precision: { bg: 'from-purple-900/40 to-purple-800/40', border: 'border-purple-500', text: 'text-purple-400' },
    ultimate: { bg: 'from-yellow-900/40 to-yellow-800/40', border: 'border-yellow-500', text: 'text-yellow-400' }
  }

  // 获取技能当前等级
  const getSkillLevel = (skillId: string): number => {
    return agent.skillTree?.skillLevels[skillId] || 0
  }

  // 检查技能是否已解锁
  const isSkillUnlocked = (skillId: string): boolean => {
    return agent.skillTree?.unlockedSkills.includes(skillId) || false
  }

  // 检查技能是否可以解锁
  const canUnlock = (skill: Skill): boolean => {
    if (!agent.levelSystem || !agent.skillTree) return false
    const result = canUnlockSkill(
      skill,
      agent.levelSystem.currentLevel,
      agent.skillTree.unlockedSkills,
      agent.skillTree.skillPoints
    )
    return typeof result === 'boolean' ? result : result.canUnlock
  }

  // 处理技能升级
  const handleUpgrade = (skill: Skill, event: React.MouseEvent) => {
    if (canUnlock(skill)) {
      feedback.onSuccess(event.clientX, event.clientY)
      audioSystem.play('levelup')
      onUpgradeSkill(skill.id)
    } else {
      feedback.onError(event.clientX, event.clientY)
      audioSystem.play('error')
    }
  }

  return (
    <div className="h-full flex bg-[#0a0a0a]">
      {/* 左侧：技能树 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">技能树</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-white">可用技能点：</span>
              <span className="text-yellow-400 font-bold text-lg">
                {agent.skillTree.skillPoints}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-white">已解锁：</span>
              <span className="text-blue-400 font-bold">
                {agent.skillTree.unlockedSkills.length} / {SKILLS.length}
              </span>
            </div>
          </div>
        </div>

        {/* 技能分类 */}
        <div className="space-y-8">
          {Object.entries(skillsByCategory).map(([category, skills]) => {
            const colors = categoryColors[category as keyof typeof categoryColors]
            return (
              <div key={category}>
                <h3 className={`text-lg font-bold ${colors.text} mb-4`}>
                  {categoryNames[category as keyof typeof categoryNames]}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {skills.map(skill => {
                    const level = getSkillLevel(skill.id)
                    const unlocked = isSkillUnlocked(skill.id)
                    const canUpgrade = canUnlock(skill)
                    const isMaxLevel = level >= skill.maxLevel

                    return (
                      <motion.div
                        key={skill.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          feedback.onClick(e)
                          audioSystem.play('click')
                          setSelectedSkill(skill)
                        }}
                        className={`
                          relative cursor-pointer rounded-lg p-4 border-2 transition-all feedback-button-scale
                          ${unlocked
                            ? `bg-gradient-to-br ${colors.bg} ${colors.border} shadow-lg`
                            : 'bg-gray-900/50 border-gray-700 opacity-60'
                          }
                          ${selectedSkill?.id === skill.id ? 'ring-2 ring-white' : ''}
                        `}
                      >
                        {/* 技能图标 */}
                        <div className="text-4xl mb-2 text-center">{skill.icon}</div>

                        {/* 技能名称 */}
                        <div className={`text-sm font-bold text-center mb-1 ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                          {skill.name}
                        </div>

                        {/* 等级显示 */}
                        <div className="text-xs text-center">
                          {unlocked ? (
                            <span className={`${colors.text} font-bold`}>
                              Lv. {level}/{skill.maxLevel}
                            </span>
                          ) : (
                            <span className="text-gray-500">未解锁</span>
                          )}
                        </div>

                        {/* 解锁等级要求 */}
                        {!unlocked && (
                          <div className="absolute top-2 right-2">
                            <Lock className="w-3 h-3 text-gray-600" />
                          </div>
                        )}

                        {/* 满级标记 */}
                        {isMaxLevel && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="w-4 h-4 text-green-400 fill-green-400" />
                          </div>
                        )}

                        {/* 进度条 */}
                        {unlocked && !isMaxLevel && (
                          <div className="mt-2 w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                            <div
                              className={`bg-gradient-to-r ${colors.text.replace('text-', 'from-')} to-white h-full transition-all`}
                              style={{ width: `${(level / skill.maxLevel) * 100}%` }}
                            />
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 右侧：技能详情 */}
      {selectedSkill && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-80 bg-gray-900 border-l border-gray-700 p-6 overflow-y-auto"
        >
          <div className="text-center mb-4">
            <div className="text-6xl mb-3">{selectedSkill.icon}</div>
            <h3 className="text-xl font-bold text-white mb-1">{selectedSkill.name}</h3>
            <div className="text-sm text-gray-400">
              {selectedSkill.category === 'passive' && '被动技能'}
              {selectedSkill.category === 'active' && '主动技能'}
              {selectedSkill.category === 'ultimate' && '终极技能'}
            </div>
          </div>

          {/* 技能描述 */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <p className="text-white text-sm leading-relaxed">{selectedSkill.description}</p>
          </div>

          {/* 当前等级 */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">当前等级：</span>
              <span className="text-white font-bold">
                Lv. {getSkillLevel(selectedSkill.id)} / {selectedSkill.maxLevel}
              </span>
            </div>
          </div>

          {/* 技能效果 */}
          <div className="mb-4">
            <h4 className="text-sm font-bold text-white mb-2">技能效果</h4>
            <div className="space-y-2">
              {selectedSkill.effects.map((effect, index) => (
                <div key={index} className="bg-gray-800 rounded p-2 text-xs">
                  <div className="text-blue-400 font-medium">{effect.type}</div>
                  <div className="text-white">+{effect.value}{effect.type.includes('percent') ? '%' : ''}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 解锁要求 */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-white mb-2">解锁要求</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">等级要求：</span>
                <span className={agent.levelSystem.currentLevel >= selectedSkill.unlockLevel ? 'text-green-400' : 'text-red-400'}>
                  Lv. {selectedSkill.unlockLevel}
                </span>
              </div>
              {selectedSkill.requiredSkills.length > 0 && (
                <div>
                  <div className="text-gray-400 mb-1">前置技能：</div>
                  {selectedSkill.requiredSkills.map(reqId => {
                    const reqSkill = SKILLS.find(s => s.id === reqId)
                    const hasReq = agent.skillTree.unlockedSkills.includes(reqId)
                    return (
                      <div key={reqId} className={`ml-2 ${hasReq ? 'text-green-400' : 'text-red-400'}`}>
                        {hasReq ? '✓' : '✗'} {reqSkill?.name || reqId}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 升级按钮 */}
          {isSkillUnlocked(selectedSkill.id) && getSkillLevel(selectedSkill.id) < selectedSkill.maxLevel ? (
            <button
              onClick={(e) => handleUpgrade(selectedSkill, e)}
              disabled={!canUnlock(selectedSkill)}
              className={`
                w-full py-3 rounded-lg font-bold transition-all feedback-button-scale
                ${canUnlock(selectedSkill)
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg hover:shadow-blue-500/50 feedback-button-glow'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {canUnlock(selectedSkill) ? (
                <>
                  <Zap className="inline w-4 h-4 mr-2" />
                  升级技能 (1 点)
                </>
              ) : (
                '条件不满足'
              )}
            </button>
          ) : !isSkillUnlocked(selectedSkill.id) ? (
            <button
              onClick={(e) => handleUpgrade(selectedSkill, e)}
              disabled={!canUnlock(selectedSkill)}
              className={`
                w-full py-3 rounded-lg font-bold transition-all feedback-button-scale
                ${canUnlock(selectedSkill)
                  ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg hover:shadow-green-500/50 feedback-button-glow'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {canUnlock(selectedSkill) ? (
                <>
                  <Lock className="inline w-4 h-4 mr-2" />
                  解锁技能 (1 点)
                </>
              ) : (
                '条件不满足'
              )}
            </button>
          ) : (
            <div className="text-center py-3 bg-green-900/30 border border-green-500 rounded-lg text-green-400 font-bold">
              <CheckCircle className="inline w-5 h-5 mr-2" />
              已达最高等级
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
