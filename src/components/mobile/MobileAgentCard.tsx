/**
 * 移动端Agent卡片
 * 针对小屏幕优化的Agent展示
 */
import React from 'react'
import { OpenClawAgent } from '../../utils/openclawLoader'
import { Zap, Target, TrendingUp } from 'lucide-react'

interface MobileAgentCardProps {
  agent: OpenClawAgent
  onClick?: () => void
}

export function MobileAgentCard({ agent, onClick }: MobileAgentCardProps) {
  // 稀有度颜色
  const rarityColors: Record<string, string> = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
    mythic: '#ef4444'
  }

  const rarityColor = agent.color || rarityColors.common

  return (
    <div
      onClick={onClick}
      className="mobile-agent-card relative overflow-hidden rounded-2xl cursor-pointer touch-manipulation"
      style={{
        background: `linear-gradient(135deg, ${rarityColor}15 0%, ${rarityColor}05 100%)`,
        border: `1px solid ${rarityColor}40`,
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* 头部 */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
            style={{
              background: `${rarityColor}20`,
              border: `2px solid ${rarityColor}60`
            }}
          >
            {agent.avatar || '🤖'}
          </div>

          {/* 信息 */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate">
              {agent.name}
            </h3>
            <p className="text-sm text-gray-400 truncate">
              {agent.role}
            </p>

            {/* 等级和经验 */}
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs font-medium text-cyan-400">
                Lv.{agent.level}
              </span>
              <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                  style={{
                    width: `${(agent.exp / agent.maxExp) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* 状态指示器 */}
          <div className="shrink-0">
            {agent.status === 'working' && (
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            )}
            {agent.status === 'idle' && (
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            )}
            {agent.status === 'offline' && (
              <div className="w-3 h-3 bg-gray-500 rounded-full" />
            )}
          </div>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="px-4 pb-4 grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-lg bg-white/5">
          <Zap size={16} className="mx-auto mb-1 text-yellow-400" />
          <div className="text-xs text-gray-400">活力</div>
          <div className="text-sm font-bold text-white">
            {agent.coreEvolution?.vitality || 100}
          </div>
        </div>

        <div className="text-center p-2 rounded-lg bg-white/5">
          <Target size={16} className="mx-auto mb-1 text-blue-400" />
          <div className="text-xs text-gray-400">技能</div>
          <div className="text-sm font-bold text-white">
            {agent.skills?.length || 0}
          </div>
        </div>

        <div className="text-center p-2 rounded-lg bg-white/5">
          <TrendingUp size={16} className="mx-auto mb-1 text-green-400" />
          <div className="text-xs text-gray-400">进化</div>
          <div className="text-sm font-bold text-white">
            {agent.coreEvolution?.evolutionLevel || 0}
          </div>
        </div>
      </div>

      {/* 发光效果 */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          boxShadow: `inset 0 0 20px ${rarityColor}20`
        }}
      />
    </div>
  )
}
