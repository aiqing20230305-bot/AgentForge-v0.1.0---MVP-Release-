/**
 * 主导航标签组件
 * 集成所有新功能模块
 */

import React, { useState } from 'react'
import { Activity, Zap, Trophy, Swords, BarChart3, TrendingUp, Gift, Settings, Gauge, BookOpen } from 'lucide-react'
import { useDataSourceStore } from '../store/useDataSourceStore'
import TaskManagementPanel from './TaskManagementPanel'
import { EnergyDashboard } from './EnergyDashboard'
import { SkillTreePanel } from './SkillTreePanel'
import { AchievementPanel } from './AchievementPanel'
import { BattlePreparation } from './BattlePreparation'
import { BattleArena } from './BattleArena'
import { BattleResult } from './BattleResult'
import { LeaderboardPanel } from './LeaderboardPanel'
import { InvitePanel } from './InvitePanel'
import { SettingsPanel } from './SettingsPanel'
import { PerformanceDashboard } from './PerformanceDashboard'
import ComponentShowcase from './ComponentShowcase'
import type { Battle } from '../types/battle'

type TabType = 'tasks' | 'energy' | 'skills' | 'achievements' | 'battle' | 'leaderboard' | 'invite' | 'performance' | 'showcase' | 'settings'

export const MainNavigationTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('tasks')
  const [currentBattle, setCurrentBattle] = useState<Battle | null>(null)
  const [showBattleResult, setShowBattleResult] = useState(false)
  const [battleResult, setBattleResult] = useState<{ battle: Battle; isVictory: boolean } | null>(null)

  const { agentsCache } = useDataSourceStore()

  // 获取第一个 agent（用于技能树和成就）
  const firstAgent = agentsCache.length > 0 ? agentsCache[0] : null

  const tabs = [
    { id: 'tasks' as TabType, label: '任务', icon: Activity },
    { id: 'energy' as TabType, label: '能耗', icon: Zap },
    { id: 'skills' as TabType, label: '技能', icon: BarChart3 },
    { id: 'achievements' as TabType, label: '成就', icon: Trophy },
    { id: 'battle' as TabType, label: '对战', icon: Swords },
    { id: 'leaderboard' as TabType, label: '排行', icon: TrendingUp },
    { id: 'invite' as TabType, label: '邀请', icon: Gift },
    { id: 'performance' as TabType, label: '性能', icon: Gauge },
    { id: 'showcase' as TabType, label: '组件', icon: BookOpen },
    { id: 'settings' as TabType, label: '设置', icon: Settings }
  ]

  const handleUpgradeSkill = (skillId: string) => {
    console.log('升级技能:', skillId)

    if (!firstAgent) return

    // 检查技能点是否足够
    const skillPoints = firstAgent.skillTree?.skillPoints || 0
    if (skillPoints < 1) {
      console.warn('技能点不足，无法升级')
      return
    }

    // 升级技能等级
    const currentLevel = firstAgent.skillTree?.skillLevels?.[skillId] || 0
    const newLevel = currentLevel + 1

    // 更新Agent数据
    const agents = useDataSourceStore.getState().agentsCache
    const updatedAgents = agents.map(agent => {
      if (agent.id === firstAgent.id) {
        const currentSkillTree = agent.skillTree || {
          unlockedSkills: [],
          activeSkills: [],
          skillPoints: 0,
          skillLevels: {}
        }
        return {
          ...agent,
          skillTree: {
            ...currentSkillTree,
            skillPoints: skillPoints - 1,
            skillLevels: {
              ...currentSkillTree.skillLevels,
              [skillId]: newLevel
            }
          }
        }
      }
      return agent
    })

    useDataSourceStore.getState().updateAgentsCache(updatedAgents)
    console.log(`技能 ${skillId} 升级到 Lv.${newLevel}`)
  }

  const handleStartBattle = (opponentId: string) => {
    console.log('开始战斗 vs:', opponentId)

    // 获取对手Agent数据
    const agents = useDataSourceStore.getState().agentsCache
    const opponent = agents.find(a => a.id === opponentId)

    if (!firstAgent || !opponent) {
      console.error('无法找到战斗双方的Agent数据')
      return
    }

    // 创建真实的战斗实例
    const battle: Battle = {
      id: `battle-${Date.now()}`,
      type: 'pvp',
      player1: {
        agentId: firstAgent?.id || 'player',
        name: firstAgent?.name || 'Player',
        level: firstAgent?.level || 1,
        hp: 1000,
        maxHp: 1000,
        attack: 100,
        defense: 50,
        speed: 75,
        battleSkills: [],
        buffs: [],
        debuffs: []
      },
      player2: {
        agentId: opponentId,
        name: 'Opponent',
        level: 1,
        hp: 1000,
        maxHp: 1000,
        attack: 100,
        defense: 50,
        speed: 75,
        battleSkills: [],
        buffs: [],
        debuffs: []
      },
      currentTurn: 1,
      currentPlayer: 1,
      battleLog: [],
      status: 'in_progress',
      createdAt: new Date().toISOString()
    }
    setCurrentBattle(battle)
  }

  const handleBattleEnd = (battle: Battle, isVictory: boolean) => {
    setBattleResult({ battle, isVictory })
    setShowBattleResult(true)
    setCurrentBattle(null)
  }

  return (
    <div className="navigation-tabs-panel w-[480px] md:w-[480px] flex-shrink-0 border-l border-white/10 overflow-hidden h-full flex flex-col bg-black/20 backdrop-blur-sm">
      {/* 标签页导航 */}
      <div className="flex border-b border-white/10 bg-black/30">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                tab-button
                flex-1 px-2 py-3 flex items-center justify-center gap-1
                text-xs font-medium transition-all
                ${activeTab === tab.id
                  ? 'text-cyan-400 bg-cyan-500/20 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* 标签页内容 */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'tasks' && <TaskManagementPanel />}
        {activeTab === 'energy' && <EnergyDashboard />}
        {activeTab === 'skills' && firstAgent && (
          <SkillTreePanel agent={firstAgent} onUpgradeSkill={handleUpgradeSkill} />
        )}
        {activeTab === 'achievements' && firstAgent && (
          <AchievementPanel agent={firstAgent} />
        )}
        {activeTab === 'battle' && !currentBattle && firstAgent && (
          <BattlePreparation
            playerAgent={firstAgent}
            availableOpponents={agentsCache.filter(a => a.id !== firstAgent.id)}
            onStartBattle={handleStartBattle}
            onCancel={() => setActiveTab('tasks')}
          />
        )}
        {activeTab === 'leaderboard' && <LeaderboardPanel />}
        {activeTab === 'invite' && <InvitePanel />}
        {activeTab === 'performance' && <PerformanceDashboard />}
        {activeTab === 'showcase' && <ComponentShowcase />}
        {activeTab === 'settings' && <SettingsPanel />}
      </div>

      {/* 战斗场景（覆盖整个屏幕） */}
      {currentBattle && (
        <div className="fixed inset-0 z-50">
          <BattleArena
            battle={currentBattle}
            onUseSkill={(skillId) => console.log('使用技能:', skillId)}
            onEndTurn={() => console.log('结束回合')}
            onSurrender={() => handleBattleEnd(currentBattle, false)}
          />
        </div>
      )}

      {/* 战斗结果 */}
      {showBattleResult && battleResult && (
        <BattleResult
          battle={battleResult.battle}
          isVictory={battleResult.isVictory}
          onClose={() => setShowBattleResult(false)}
          onRematch={() => {
            setShowBattleResult(false)
            // 重新开始战斗
          }}
        />
      )}
    </div>
  )
}
