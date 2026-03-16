import { useState, useEffect, useMemo, useCallback } from 'react'
import { loadOpenClawAgents, OpenClawAgent } from '../utils/openclawLoader'
import { useTaskStore } from '../stores/taskStore'
import { Target, Clock, MessageCircle } from 'lucide-react'
import AgentPortrait from './AgentPortrait'
import { useRipple } from '../hooks/useRipple'
import { CloudSyncIndicator } from './CloudSyncIndicator'
import { HeartbeatIndicator } from './HeartbeatIndicator'
import { EvolutionTimeline } from './EvolutionTimeline'
import { VitalityDashboard } from './VitalityDashboard'
import { AdvancedFeaturesPanel } from './AdvancedFeaturesPanel'
import { getEvolutionEngine } from '../services/evolution/evolutionEngine'

export default function AgentDisplayPanel() {
  const [agents, setAgents] = useState<OpenClawAgent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<OpenClawAgent | null>(null)
  const [connectionMode, setConnectionMode] = useState<'demo' | 'connected'>('demo')
  const { setSelectedAgent: setTaskStoreAgent, getTaskStats } = useTaskStore()
  const { createRipple } = useRipple()

  useEffect(() => {
    async function loadAgents() {
      const data = await loadOpenClawAgents()
      console.log(
        '[AgentDisplay] Loaded agents:',
        data.map(a => `${a.id} (${a.name})`)
      )

      // 检测连接模式：如果有 sourceId 或 sourceName 则为已连接，否则为演示模式
      const isConnected = data.some(agent => agent.sourceId || agent.sourceName)
      setConnectionMode(isConnected ? 'connected' : 'demo')

      setAgents(data)
      if (data.length > 0) {
        setSelectedAgent(data[0])
        setTaskStoreAgent(data[0].id)
      }
    }
    loadAgents()
  }, [])

  // 🚀 Performance: Memoize handler to prevent child re-renders
  const handleSelectAgent = useCallback((agent: OpenClawAgent) => {
    console.log('[AgentDisplay] Selected agent:', agent.id, '→', agent.name)
    setSelectedAgent(agent)
    setTaskStoreAgent(agent.id)
  }, [setTaskStoreAgent])

  // 🚀 Performance: Memoize stats calculation
  // IMPORTANT: 必须在所有条件渲染之前调用所有Hooks
  const stats = useMemo(() => {
    if (!selectedAgent) return { total: 0, in_progress: 0, completed: 0, pending: 0 }

    // 优先使用 API 返回的 taskStats，如果没有则使用 taskStore
    const apiStats = selectedAgent?.metadata?.taskStats
    const storeStats = getTaskStats(selectedAgent?.id || '')

    return apiStats
      ? {
          total: apiStats.total || 0,
          in_progress: apiStats.inProgress || 0,
          completed: apiStats.completed || 0,
          pending: 0 // API 暂不支持 pending 状态
        }
      : storeStats
  }, [selectedAgent?.id, selectedAgent?.metadata?.taskStats, getTaskStats, selectedAgent])

  // Loading state - 现在放在所有Hooks之后
  if (!selectedAgent) {
    return (
      <div className="h-full flex items-center justify-center text-white/80 text-lg">加载中...</div>
    )
  }

  return (
    <div className="h-full flex flex-col relative cockpit-init boot-scan">
      {/* Agent 切换器 - 启动动画 */}
      <div className="px-4 py-3 border-b border-white/10 backdrop-blur-xl sticky top-0 z-10 module-init">
        {/* 连接状态指示器 */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${connectionMode === 'connected' ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}
            />
            <span className="text-xs text-white/70 font-medium">
              {connectionMode === 'connected' ? '🟢 OpenClaw Connected' : '🟡 Demo Mode'}
            </span>
          </div>
          <span className="text-xs text-white/50">{agents.length} agents</span>
        </div>

        <div className="flex gap-2 overflow-x-hidden">
          {agents.map((agent, index) => {
            const isSelected = selectedAgent.name === agent.name
            return (
              <button
                key={agent.name}
                onClick={e => {
                  createRipple(e)
                  handleSelectAgent(agent)
                }}
                className={`click-feedback relative group transition-all duration-300 flex-shrink-0 hover-lift ${
                  isSelected ? 'transform scale-105' : ''
                }`}
                style={{
                  animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
                }}
              >
                {/* 选中光效 - 精简 */}
                {isSelected && (
                  <div
                    className="absolute -inset-1 rounded-lg blur-lg opacity-60 breathe"
                    style={{
                      background: 'radial-gradient(circle, rgba(0, 212, 255, 0.6), transparent 70%)'
                    }}
                  />
                )}

                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`relative rounded-xl overflow-hidden border transition-all duration-300 w-16 soft-shadow ${
                      isSelected
                        ? 'border-white/30 shadow-lg'
                        : 'border-white/15 hover:border-white/25'
                    }`}
                  >
                    <div className="relative">
                      <AgentPortrait agent={agent} size="small" />
                      {/* 闪光效果 */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </div>
                  </div>
                  {/* 名字 - 柔和风格 */}
                  <div
                    className={`text-[9px] font-medium text-center truncate transform group-hover:scale-105 transition-all duration-300 px-1 ${
                      isSelected ? 'text-white text-glow-soft' : 'text-white/70'
                    }`}
                  >
                    {agent.name}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 主要展示区 - 左侧形象 + 右侧信息 */}
      <div className="flex-1 flex gap-5 p-5 overflow-hidden">
        {/* 左侧：Agent 形象大卡片 - 9:16 比例 - 🚀 Mobile Optimized */}
        <div
          className="flex-shrink-0 h-full module-init-delay-1 border-activate w-full max-w-sm lg:w-96"
          key={`portrait-${selectedAgent.name}`}
        >
          <AgentPortrait agent={selectedAgent} size="large" />
        </div>

        {/* 右侧：详细信息区域 - 无滚动条 */}
        <div
          className="flex-1 min-w-0 flex flex-col gap-2 h-full overflow-hidden"
          style={{ animation: 'slideInRight 0.4s ease-out' }}
        >
          {/* Agent 基本信息卡片 - 紧凑版 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-3 flex-shrink-0 hover:bg-white/10 hover:border-white/30 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 shadow-lg module-init-delay-2 group">
            {/* 紧凑标题区 */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-2xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
                  {selectedAgent.name}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-medium">
                    Lv.{selectedAgent.level}
                  </span>
                  {/* Cloud sync indicator */}
                  <CloudSyncIndicator
                    isCloudSynced={!!selectedAgent.metadata?.cloudId}
                    size="sm"
                    showLabel={true}
                  />
                  {/* Heartbeat indicator */}
                  {selectedAgent.coreEvolution && (
                    <HeartbeatIndicator
                      vitality={selectedAgent.coreEvolution.vitality}
                      heartRate={selectedAgent.coreEvolution.heartRate}
                      status={selectedAgent.coreEvolution.healthStatus}
                      size="sm"
                      showLabel={false}
                    />
                  )}
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        selectedAgent.status === 'working' || selectedAgent.status === 'online'
                          ? '#10d9a0'
                          : '#ff4466'
                    }}
                  />
                </div>
              </div>
              <div className="text-xs text-white/70">{selectedAgent.role}</div>
            </div>

            {/* 紧凑经验条 */}
            <div className="mb-2">
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className="text-2xl font-bold text-white"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  {selectedAgent.exp.toLocaleString()}
                </span>
                <span className="text-sm text-white/60">
                  / {selectedAgent.maxExp.toLocaleString()}
                </span>
                <span className="text-xs text-emerald-400 font-medium ml-auto">
                  ▲ {Math.round((selectedAgent.exp / selectedAgent.maxExp) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden border border-white/20">
                <div
                  className="h-full rounded-full transition-all duration-1000 energy-charge"
                  style={{
                    width: `${(selectedAgent.exp / selectedAgent.maxExp) * 100}%`,
                    background: 'rgba(255, 255, 255, 0.2)'
                  }}
                />
              </div>
            </div>

            {/* 紧凑属性面板 */}
            <div className="mb-2">
              <div className="text-[9px] text-white/50 mb-1 uppercase tracking-wider">
                Core Attributes
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <div className="text-center bg-white/5 rounded-lg py-1.5">
                  <div className="text-xl font-bold text-teal-400">95</div>
                  <div className="text-[8px] text-white/60">统率</div>
                </div>
                <div className="text-center bg-white/5 rounded-lg py-1.5">
                  <div className="text-xl font-bold text-cyan-400">90</div>
                  <div className="text-[8px] text-white/60">谋略</div>
                </div>
                <div className="text-center bg-white/5 rounded-lg py-1.5">
                  <div className="text-xl font-bold text-emerald-400">85</div>
                  <div className="text-[8px] text-white/60">执行</div>
                </div>
                <div className="text-center bg-white/5 rounded-lg py-1.5">
                  <div className="text-xl font-bold text-sky-400">80</div>
                  <div className="text-[8px] text-white/60">创新</div>
                </div>
              </div>
            </div>

            {/* 技能区域 - 紧凑徽章 */}
            {selectedAgent.skills && selectedAgent.skills.length > 0 && (
              <div className="mb-2">
                <div className="text-[9px] text-white/50 mb-1 uppercase tracking-wider flex items-center gap-1">
                  <span>⚡</span>
                  <span>Core Skills</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {selectedAgent.skills.map((skill, idx) => {
                    // 技能图标映射 - 宇宙/科技主题
                    const skillIcons: Record<string, string> = {
                      OpenClaw: '🦞',
                      Feishu: '📡',
                      'Claude API': '🤖',
                      Leadership: '👑',
                      Strategy: '🎯',
                      Management: '⚙️',
                      Coding: '💻',
                      Architecture: '🏗️',
                      Testing: '🧪',
                      Research: '🔬',
                      Analysis: '📊',
                      Wisdom: '🔮',
                      Protection: '🛡️',
                      Monitoring: '📹',
                      Defense: '⚔️'
                    }
                    const icon = skillIcons[skill] || '⭐'

                    // 徽章颜色配置
                    const badgeColors = [
                      {
                        bg: 'from-purple-500/20 to-pink-500/20',
                        border: 'border-purple-400/50',
                        glow: 'shadow-purple-500/30',
                        icon: 'text-purple-300'
                      },
                      {
                        bg: 'from-blue-500/20 to-cyan-500/20',
                        border: 'border-blue-400/50',
                        glow: 'shadow-blue-500/30',
                        icon: 'text-blue-300'
                      },
                      {
                        bg: 'from-green-500/20 to-emerald-500/20',
                        border: 'border-green-400/50',
                        glow: 'shadow-green-500/30',
                        icon: 'text-green-300'
                      }
                    ]
                    const color = badgeColors[idx % badgeColors.length]

                    return (
                      <div
                        key={idx}
                        className={`relative bg-gradient-to-br ${color.bg} backdrop-blur-sm border ${color.border} rounded-lg p-2 text-center transition-all hover:scale-105 cursor-pointer group shadow-lg hover:${color.glow} overflow-hidden`}
                      >
                        {/* 闪光效果背景 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                        {/* 六边形装饰 - 缩小 */}
                        <div className="absolute -top-2 -right-2 w-10 h-10 opacity-10 rotate-12">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <polygon
                              points="50,5 90,30 90,70 50,95 10,70 10,30"
                              fill="currentColor"
                              className="text-white"
                            />
                          </svg>
                        </div>

                        <div className="relative z-10">
                          <div className={`text-2xl mb-0.5 drop-shadow-lg ${color.icon}`}>
                            {icon}
                          </div>
                          <div className="text-[8px] text-white font-bold leading-tight uppercase tracking-wide drop-shadow-sm">
                            {skill}
                          </div>
                        </div>

                        {/* 光环效果 */}
                        <div
                          className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl ${color.glow}`}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 功能按钮 - 紧凑版 */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={createRipple}
                className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-cyan-500/20 border border-white/20 hover:border-cyan-400/50 rounded-lg backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95 group"
              >
                <Clock className="w-3 h-3 group-hover:animate-pulse" />
                <span className="group-hover:text-cyan-300 transition-colors">任务记录</span>
              </button>
              <button
                onClick={createRipple}
                className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-purple-500/20 border border-white/20 hover:border-purple-400/50 rounded-lg backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 group"
              >
                <MessageCircle className="w-3 h-3 group-hover:animate-pulse" />
                <span className="group-hover:text-purple-300 transition-colors">对话</span>
              </button>
            </div>
          </div>

          {/* 任务统计面板 - 紧凑版 */}
          <div
            className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-3 hover:bg-white/10 hover:border-white/30 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 shadow-lg module-init-delay-3"
            style={{
              flexShrink: 0
            }}
          >
            {/* 标题 */}
            <div className="text-[9px] text-white/50 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>Task Overview</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div
                onClick={createRipple}
                className="bg-white/8 hover:bg-white/15 backdrop-blur-sm border border-white/15 hover:border-cyan-400/50 rounded-lg p-2 cursor-pointer transition-all hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95 data-stream group"
              >
                <div className="text-[9px] text-white/60 group-hover:text-cyan-300 transition-colors">
                  总任务
                </div>
                <div
                  className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  {stats.total}
                </div>
              </div>
              <div
                onClick={createRipple}
                className="bg-white/8 hover:bg-white/15 backdrop-blur-sm border border-white/15 hover:border-blue-400/50 rounded-lg p-2 cursor-pointer transition-all hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 data-stream group"
                style={{
                  animationDelay: '0.1s'
                }}
              >
                <div className="text-[9px] text-white/60 group-hover:text-blue-300 transition-colors">
                  进行中
                </div>
                <div
                  className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  {stats.in_progress}
                </div>
              </div>
              <div
                onClick={createRipple}
                className="bg-white/8 hover:bg-white/15 backdrop-blur-sm border border-white/15 hover:border-green-400/50 rounded-lg p-2 cursor-pointer transition-all hover:scale-110 hover:shadow-lg hover:shadow-green-500/20 active:scale-95 data-stream group"
                style={{
                  animationDelay: '0.2s'
                }}
              >
                <div className="text-[9px] text-white/60 group-hover:text-green-300 transition-colors">
                  已完成
                </div>
                <div
                  className="text-xl font-bold text-white group-hover:text-green-300 transition-colors"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  {stats.completed}
                </div>
              </div>
              <div
                onClick={createRipple}
                className="bg-white/8 hover:bg-white/15 backdrop-blur-sm border border-white/15 hover:border-amber-400/50 rounded-lg p-2 cursor-pointer transition-all hover:scale-110 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 data-stream group"
                style={{
                  animationDelay: '0.3s'
                }}
              >
                <div className="text-[9px] text-white/60 group-hover:text-amber-300 transition-colors">
                  待处理
                </div>
                <div
                  className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  {stats.pending}
                </div>
              </div>
            </div>

            {/* 完成率统计 - 紧凑版 */}
            {stats.total > 0 && (
              <div
                className="mt-2 pt-2 border-t border-white/10"
                style={{ animation: 'fadeInUp 0.5s ease-out 0.5s both' }}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span
                    className="text-xl font-bold text-white"
                    style={{ letterSpacing: '-0.03em' }}
                  >
                    {Math.round((stats.completed / stats.total) * 100)}%
                  </span>
                  <span className="text-xs text-white/60">完成率</span>
                </div>
                {/* 胶囊进度条 */}
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 energy-charge"
                    style={{
                      width: `${(stats.completed / stats.total) * 100}%`,
                      background: 'rgba(255, 255, 255, 0.2)',
                      animationDelay: '1s'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 角色描述 - 紧凑版 */}
          {selectedAgent.description && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-2.5 flex-shrink-0 hover:bg-white/10 hover:border-white/30 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 shadow-lg module-init-delay-4">
              <div className="text-[9px] text-white/50 mb-1 uppercase tracking-wider flex items-center gap-1">
                <span>📖</span>
                <span>Agent Profile</span>
              </div>
              <div className="text-xs text-white/90 leading-relaxed">
                {selectedAgent.description}
              </div>
            </div>
          )}

          {/* 进化历程 - Evolution Timeline */}
          {selectedAgent.coreEvolution && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-3 flex-shrink-0 hover:bg-white/10 hover:border-white/30 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 shadow-lg module-init-delay-5">
              <div className="text-[9px] text-white/50 mb-2 uppercase tracking-wider flex items-center gap-1">
                <span>🧬</span>
                <span>Evolution History</span>
              </div>
              <EvolutionTimeline
                agentId={selectedAgent.id}
                evolutionHistory={getEvolutionEngine().getEvolutionHistory(selectedAgent.id)}
                currentPoints={selectedAgent.coreEvolution.evolutionPoints || 0}
                currentLevel={selectedAgent.level}
                unlockedRules={selectedAgent.coreEvolution.unlockedRules || []}
                nextEvolution={
                  selectedAgent.coreEvolution.nextEvolution &&
                  'ruleId' in selectedAgent.coreEvolution.nextEvolution
                    ? selectedAgent.coreEvolution.nextEvolution
                    : undefined
                }
                onManualEvolve={async (ruleId: string) => {
                  const engine = getEvolutionEngine()
                  const success = await engine.manualEvolve(selectedAgent.id, ruleId)
                  if (success) {
                    // Refresh the agent data
                    const updatedAgents = await loadOpenClawAgents()
                    setAgents(updatedAgents)
                  }
                }}
              />
            </div>
          )}

          {/* 生命力仪表盘 - Vitality Dashboard */}
          {selectedAgent.coreEvolution && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-3 flex-shrink-0 hover:bg-white/10 hover:border-white/30 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 shadow-lg module-init-delay-6">
              <div className="text-[9px] text-white/50 mb-3 uppercase tracking-wider flex items-center gap-1">
                <span>🫀</span>
                <span>Vitality Dashboard</span>
              </div>
              <VitalityDashboard agent={selectedAgent} />
            </div>
          )}

          {/* 高级功能面板 - Advanced Features */}
          {selectedAgent.coreEvolution && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-3 flex-shrink-0 hover:bg-white/10 hover:border-white/30 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 shadow-lg module-init-delay-7">
              <div className="text-[9px] text-white/50 mb-3 uppercase tracking-wider flex items-center gap-1">
                <span>🚀</span>
                <span>Advanced Features</span>
              </div>
              <AdvancedFeaturesPanel
                agent={selectedAgent}
                agents={agents}
                onAgentSelect={(agentId) => {
                  const agent = agents.find(a => a.id === agentId)
                  if (agent) handleSelectAgent(agent)
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
