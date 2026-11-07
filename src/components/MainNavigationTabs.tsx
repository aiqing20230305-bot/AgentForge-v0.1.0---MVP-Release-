/**
 * 主导航标签组件
 * 集成所有新功能模块
 */

import React, { useState, useEffect } from 'react'
import { Activity, Zap, Trophy, Swords, BarChart3, TrendingUp, Gift, Settings, Gauge, BookOpen, User, Brain, ShoppingCart, Sparkles } from 'lucide-react'
import { useDataSourceStore } from '../store/useDataSourceStore'
import TaskManagementPanel from './TaskManagementPanel'
import { EnergyDashboard } from './EnergyDashboard'
import { EnergyChart } from './EnergyChart'
import { EnergyBudgetSettings } from './EnergyBudgetSettings'
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
import { BattleEngine } from '../services/battleEngine'

type TabType = 'tasks' | 'energy' | 'skills' | 'achievements' | 'shop' | 'battle' | 'leaderboard' | 'invite' | 'performance' | 'showcase' | 'settings' | 'agent-detail' | 'ai-assistant' | 'prophet-demo'

export const MainNavigationTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('tasks')
  const [energyView, setEnergyView] = useState<'dashboard' | 'chart' | 'budget'>('dashboard')
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
    { id: 'skills' as TabType, label: '技能树', icon: BarChart3 },
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
        const unlockedSkills = currentSkillTree.unlockedSkills.includes(skillId)
          ? currentSkillTree.unlockedSkills
          : [...currentSkillTree.unlockedSkills, skillId]
        return {
          ...agent,
          skillTree: {
            ...currentSkillTree,
            unlockedSkills,
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
    const agents = useDataSourceStore.getState().agentsCache
    const player = agents.find(a => a.id === firstAgent?.id) || firstAgent
    const opponent = agents.find(a => a.id === opponentId)

    if (!player || !opponent) {
      console.error('无法找到战斗双方的Agent数据')
      return
    }

    setShowBattleResult(false)
    setBattleResult(null)
    setCurrentBattle(BattleEngine.initBattle(player, opponent, 'ranked'))
  }

  const finishBattle = (battle: Battle) => {
    setBattleResult({ battle, isVictory: battle.winner === 1 })
    setShowBattleResult(true)
    setCurrentBattle(null)
  }

  useEffect(() => {
    if (!currentBattle || currentBattle.status !== 'in_progress') return

    const timer = window.setTimeout(() => {
      const next = BattleEngine.executeTurn(currentBattle, BattleEngine.makeAIDecision(currentBattle))
      if (next.status === 'finished') {
        finishBattle(next)
      } else {
        setCurrentBattle(next)
      }
    }, 900)

    return () => window.clearTimeout(timer)
  }, [currentBattle])

  const applyBattleAction = (battle: Battle, action: { type: 'attack' | 'skill'; skillId?: string }) => {
    const next = BattleEngine.executeTurn(battle, action)
    if (next.status === 'finished') {
      finishBattle(next)
    } else {
      setCurrentBattle(next)
    }
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
              data-testid={`nav-tab-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id)
                if (tab.id === 'energy') setEnergyView('dashboard')
              }}
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

      <div className="flex flex-wrap gap-1 px-2 py-1 border-b border-white/10 bg-black/20">
        <button type="button" className="px-2 py-1 text-[11px] text-cyan-200 hover:bg-white/10 rounded" onClick={() => { setActiveTab('energy'); setEnergyView('dashboard') }}>能耗仪表盘</button>
        <button type="button" className="px-2 py-1 text-[11px] text-cyan-200 hover:bg-white/10 rounded" onClick={() => { setActiveTab('energy'); setEnergyView('chart') }}>能耗图表</button>
        <button type="button" className="px-2 py-1 text-[11px] text-cyan-200 hover:bg-white/10 rounded" onClick={() => { setActiveTab('energy'); setEnergyView('budget') }}>预算设置</button>
        <button type="button" className="px-2 py-1 text-[11px] text-cyan-200 hover:bg-white/10 rounded" onClick={() => setActiveTab('battle')}>PvP对战</button>
      </div>

      {/* 标签页内容 */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'tasks' && <TaskManagementPanel />}
        {activeTab === 'prophet-demo' && <ProphetDemoPanel />}
        {activeTab === 'ai-assistant' && <AIAssistantPanel />}
        {activeTab === 'energy' && energyView === 'dashboard' && <EnergyDashboard />}
        {activeTab === 'energy' && energyView === 'chart' && <EnergyChart />}
        {activeTab === 'energy' && energyView === 'budget' && <EnergyBudgetSettings />}
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
            onUseSkill={(skillIndex) => {
              const skill = currentBattle.player1.battleSkills[skillIndex]
              if (!skill) return
              applyBattleAction(currentBattle, { type: 'skill', skillId: skill.id })
            }}
            onEndTurn={() => applyBattleAction(currentBattle, { type: 'attack' })}
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
