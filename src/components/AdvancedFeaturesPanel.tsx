/**
 * Advanced Features Panel Component
 * 高级功能面板 - 整合所有高级功能
 */

import React, { useState } from 'react'
import type { OpenClawAgent } from '../utils/openclawLoader'
import { GlobalHeartbeatMonitor } from './GlobalHeartbeatMonitor'
import { EvolutionReplayPlayer } from './EvolutionReplayPlayer'
import { PerformanceReportGenerator } from './PerformanceReportGenerator'
import { VitalityPredictor } from './VitalityPredictor'
import { getEvolutionEngine } from '../services/evolution/evolutionEngine'

interface AdvancedFeaturesPanelProps {
  agent?: OpenClawAgent
  agents: OpenClawAgent[]
  onAgentSelect?: (agentId: string) => void
}

type TabType = 'monitor' | 'replay' | 'report' | 'predict'

/**
 * Tab按钮组件
 */
const TabButton: React.FC<{
  active: boolean
  onClick: () => void
  icon: string
  label: string
  disabled?: boolean
}> = ({ active, onClick, icon, label, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all ${
      active
        ? 'border-purple-500 text-purple-400 bg-purple-500/10'
        : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-white/5'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <span className="text-lg">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
)

/**
 * 高级功能面板主组件
 */
export const AdvancedFeaturesPanel: React.FC<AdvancedFeaturesPanelProps> = ({
  agent,
  agents,
  onAgentSelect
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('monitor')

  // 获取进化历史
  const evolutionHistory = agent
    ? getEvolutionEngine().getEvolutionHistory(agent.id)
    : []

  return (
    <div className="space-y-4">
      {/* Tab 导航 */}
      <div className="flex items-center gap-1 border-b border-white/20 overflow-x-auto">
        <TabButton
          active={activeTab === 'monitor'}
          onClick={() => setActiveTab('monitor')}
          icon="📊"
          label="全局监控"
        />
        <TabButton
          active={activeTab === 'replay'}
          onClick={() => setActiveTab('replay')}
          icon="🎬"
          label="进化回放"
          disabled={!agent}
        />
        <TabButton
          active={activeTab === 'report'}
          onClick={() => setActiveTab('report')}
          icon="📈"
          label="性能报告"
          disabled={!agent}
        />
        <TabButton
          active={activeTab === 'predict'}
          onClick={() => setActiveTab('predict')}
          icon="🔮"
          label="状态预测"
          disabled={!agent}
        />
      </div>

      {/* Tab 内容 */}
      <div className="min-h-[500px]">
        {activeTab === 'monitor' && (
          <GlobalHeartbeatMonitor agents={agents} onAgentClick={onAgentSelect} />
        )}

        {activeTab === 'replay' && agent && (
          <EvolutionReplayPlayer
            agentId={agent.id}
            evolutionHistory={evolutionHistory}
          />
        )}

        {activeTab === 'report' && agent && (
          <PerformanceReportGenerator agent={agent} />
        )}

        {activeTab === 'predict' && agent && <VitalityPredictor agentId={agent.id} />}

        {/* 未选择Agent提示 */}
        {!agent && activeTab !== 'monitor' && (
          <div className="text-center text-gray-400 py-12">
            <p className="text-xl mb-2">🤖</p>
            <p>请先选择一个Agent</p>
            <p className="text-sm mt-2">选择Agent后即可查看该功能</p>
          </div>
        )}
      </div>
    </div>
  )
}
