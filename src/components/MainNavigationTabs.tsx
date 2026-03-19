/**
 * 主导航标签组件
 * 集成所有新功能模块
 */

import React, { useState, useEffect } from 'react'
import { Activity, Zap, Trophy, Swords, BarChart3, TrendingUp, Gift, Settings, Gauge, BookOpen, User, Brain, ShoppingCart, Sparkles } from 'lucide-react'
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
import AgentDetailPage from './AgentDetailPage'
import { AIAssistantPanel } from './AIAssistantPanel'
import { GameShop } from './GameShop'
import { ProphetDemoPanel } from './ProphetDemoPanel'
import type { Battle } from '../types/battle'

type TabType = 'tasks' | 'energy' | 'skills' | 'achievements' | 'shop' | 'battle' | 'leaderboard' | 'invite' | 'performance' | 'showcase' | 'settings' | 'agent-detail' | 'ai-assistant' | 'prophet-demo'

export const MainNavigationTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('tasks')
  const [currentBattle, setCurrentBattle] = useState<Battle | null>(null)
  const [showBattleResult, setShowBattleResult] = useState(false)
  const [battleResult, setBattleResult] = useState<{ battle: Battle; isVictory: boolean } | null>(null)
  const [selectedAgentIdForDetail, setSelectedAgentIdForDetail] = useState<string | null>(null)

  const { agentsCache } = useDataSourceStore()

  // 获取第一个 agent（用于技能树和成就）
  const firstAgent = agentsCache.length > 0 ? agentsCache[0] : null

  // 监听快捷键事件和自定义事件
  useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const event = e as CustomEvent
      const index = event.detail?.index
      if (index !== undefined && tabs[index]) {
        setActiveTab(tabs[index].id)
      }
    }

    const handlePreviousTab = () => {
      const currentIndex = tabs.findIndex((t) => t.id === activeTab)
      if (currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1].id)
      }
    }

    const handleNextTab = () => {
      const currentIndex = tabs.findIndex((t) => t.id === activeTab)
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1].id)
      }
    }

    const handleShowDetail = (e: Event) => {
      const event = e as CustomEvent
      const { agentId } = event.detail || {}
      if (agentId) {
        handleShowAgentDetail(agentId)
      }
    }

    window.addEventListener('hotkey:switchTab', handleSwitchTab)
    window.addEventListener('hotkey:previousTab', handlePreviousTab)
    window.addEventListener('hotkey:nextTab', handleNextTab)
    window.addEventListener('show-agent-detail', handleShowDetail)

    return () => {
      window.removeEventListener('hotkey:switchTab', handleSwitchTab)
      window.removeEventListener('hotkey:previousTab', handlePreviousTab)
      window.removeEventListener('hotkey:nextTab', handleNextTab)
      window.removeEventListener('show-agent-detail', handleShowDetail)
    }
  }, [activeTab])

  const tabs = [
    { id: 'tasks' as TabType, label: '任务', icon: Activity },
    { id: 'prophet-demo' as TabType, label: 'Prophet', icon: Sparkles },
    { id: 'ai-assistant' as TabType, label: 'AI助手', icon: Brain },
    { id: 'energy' as TabType, label: '能耗', icon: Zap },
    { id: 'skills' as TabType, label: '技能', icon: BarChart3 },
    { id: 'achievements' as TabType, label: '成就', icon: Trophy },
    { id: 'shop' as TabType, label: '商店', icon: ShoppingCart },
    { id: 'battle' as TabType, label: '对战', icon: Swords },
    { id: 'leaderboard' as TabType, label: '排行', icon: TrendingUp },
    { id: 'invite' as TabType, label: '邀请', icon: Gift },
    { id: 'performance' as TabType, label: '性能', icon: Gauge },
    { id: 'showcase' as TabType, label: '组件', icon: BookOpen },
    { id: 'settings' as TabType, label: '设置', icon: Settings }
  ]

  // 显示Agent详情的函数
  const handleShowAgentDetail = (agentId: string) => {
    setSelectedAgentIdForDetail(agentId)
    setActiveTab('agent-detail')
  }

  // 关闭Agent详情的函数
  const handleCloseAgentDetail = () => {
    setSelectedAgentIdForDetail(null)
    setActiveTab('tasks')
  }

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
        {activeTab === 'prophet-demo' && <ProphetDemoPanel />}
        {activeTab === 'ai-assistant' && <AIAssistantPanel />}
        {activeTab === 'energy' && <EnergyDashboard />}
        {activeTab === 'skills' && firstAgent && (
          <SkillTreePanel agent={firstAgent} onUpgradeSkill={handleUpgradeSkill} />
        )}
        {activeTab === 'achievements' && firstAgent && (
          <AchievementPanel agent={firstAgent} />
        )}
        {activeTab === 'shop' && <GameShop agentId={firstAgent?.id} />}
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
        {activeTab === 'agent-detail' && selectedAgentIdForDetail && (
          <AgentDetailPage agentId={selectedAgentIdForDetail} onClose={handleCloseAgentDetail} />
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
