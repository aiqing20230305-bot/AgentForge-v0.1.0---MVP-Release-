/**
 * 移动端Agent网格视图
 * 单列滚动，优化触摸体验
 */
import React, { useState } from 'react'
import { OpenClawAgent } from '../../utils/openclawLoader'
import { MobileAgentCard } from './MobileAgentCard'
import { Plus, Search } from 'lucide-react'

interface MobileAgentGridProps {
  agents: OpenClawAgent[]
  onAgentClick?: (agent: OpenClawAgent) => void
  onCreateAgent?: () => void
}

export function MobileAgentGrid({ agents, onAgentClick, onCreateAgent }: MobileAgentGridProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // 过滤Agent
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mobile-agent-grid h-full flex flex-col">
      {/* 搜索栏 */}
      <div className="sticky top-0 z-10 p-4 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/10">
        <div className="flex gap-2">
          {/* 搜索输入 */}
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="搜索Agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
              style={{
                WebkitAppearance: 'none', // 移除iOS默认样式
                fontSize: '16px' // 防止iOS自动缩放
              }}
            />
          </div>

          {/* 创建按钮 */}
          <button
            onClick={onCreateAgent}
            className="shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <Plus size={24} className="text-white" />
          </button>
        </div>

        {/* 统计信息 */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-gray-400">
            {filteredAgents.length} 个Agent
          </span>
          <span className="text-cyan-400">
            总等级 {agents.reduce((sum, a) => sum + a.level, 0)}
          </span>
        </div>
      </div>

      {/* Agent列表 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4 pb-20">
          {filteredAgents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <p className="text-gray-400 mb-6">
                {searchQuery ? '没有找到匹配的Agent' : '还没有Agent'}
              </p>
              {!searchQuery && (
                <button
                  onClick={onCreateAgent}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium active:scale-95 transition-transform"
                >
                  创建第一个Agent
                </button>
              )}
            </div>
          ) : (
            filteredAgents.map(agent => (
              <MobileAgentCard
                key={agent.id}
                agent={agent}
                onClick={() => onAgentClick?.(agent)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
