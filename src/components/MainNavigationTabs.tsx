/**
 * 主导航标签组件
 * 集成所有新功能模块
 */

import React, { useState } from 'react'
import { Activity, Zap, Trophy, Swords, BarChart3 } from 'lucide-react'
import { useDataSourceStore } from '../store/useDataSourceStore'
import TaskManagementPanel from './TaskManagementPanel'
import { EnergyDashboard } from './EnergyDashboard'
import { SkillTreePanel } from './SkillTreePanel'
import { AchievementPanel } from './AchievementPanel'
import { BattlePreparation } from './BattlePreparation'
import { BattleArena } from './BattleArena'
import { BattleResult } from './BattleResult'
import type { Battle } from '../types/battle'

type TabType = 'tasks' | 'energy' | 'skills' | 'achievements' | 'battle'

export const MainNavigationTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('tasks')
  const [currentBattle, setCurrentBattle] = useState<Battle | null>(null)
  const [showBattleResult, setShowBattleResult] = useState(false)
  const [battleResult, setBattleResult] = useState<{ battle: Battle; isVictory: boolean } | null>(null)

  const { agentsCache } = useDataSourceStore()

  // 获取第一个 agent（用于技能树和成就）
  const firstAgent = agentsCache.length > 0 ? agentsCache[0] : null

  const tabs = [
    { id: 'tasks' as TabType, label: '任务管理', icon: Activity },
    { id: 'energy' as TabType, label: '能耗仪表盘', icon: Zap },
    { id: 'skills' as TabType, label: '技能树', icon: BarChart3 },
    { id: 'achievements' as TabType, label: '成就', icon: Trophy },
    { id: 'battle' as TabType, label: 'PvP对战', icon: Swords }
  ]

  const handleUpgradeSkill = (skillId: string) => {
    console.log('升级技能:', skillId)
    // TODO: 实现技能升级逻辑
  }

  const handleStartBattle = (opponentId: string) => {
    console.log('开始战斗 vs:', opponentId)
    // TODO: 创建真实的战斗实例
    // 暂时使用模拟数据
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
    <div className="w-[480px] flex-shrink-0 border-l border-white/10 overflow-hidden h-full flex flex-col bg-black/20 backdrop-blur-sm">
      {/* 标签页导航 */}
      <div className="flex border-b border-white/10 bg-black/30">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 px-2 py-3 flex items-center justify-center gap-1
                text-xs font-medium transition-all
                ${activeTab === tab.id
                  ? 'text-cyan-400 bg-cyan-500/20 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden lg:inline">{tab.label}</span>
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
