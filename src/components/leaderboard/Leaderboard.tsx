/**
 * Agent排行榜组件
 * 4个排名维度：等级、任务、战斗、综合
 */
import React, { useState, useMemo } from 'react'
import { OpenClawAgent } from '../../utils/openclawLoader'
import { Trophy, Zap, Target, Swords, TrendingUp, Medal, Crown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface LeaderboardProps {
  agents: OpenClawAgent[]
  maxItems?: number
  showCurrentUser?: boolean
  currentUserId?: string
  className?: string
}

type RankingDimension = 'level' | 'tasks' | 'battles' | 'overall'

interface RankedAgent extends OpenClawAgent {
  rank: number
  score: number
  change?: number // 排名变化（上升/下降）
}

export function Leaderboard({
  agents,
  maxItems = 10,
  showCurrentUser = false,
  currentUserId,
  className = ''
}: LeaderboardProps) {
  const [activeDimension, setActiveDimension] = useState<RankingDimension>('overall')

  // 维度配置
  const dimensions = [
    {
      key: 'overall' as RankingDimension,
      label: '综合',
      icon: <Trophy size={18} />,
      color: '#f59e0b',
      description: '综合实力排名'
    },
    {
      key: 'level' as RankingDimension,
      label: '等级',
      icon: <TrendingUp size={18} />,
      color: '#3b82f6',
      description: '等级经验排名'
    },
    {
      key: 'tasks' as RankingDimension,
      label: '任务',
      icon: <Target size={18} />,
      color: '#10b981',
      description: '任务完成排名'
    },
    {
      key: 'battles' as RankingDimension,
      label: '战斗',
      icon: <Swords size={18} />,
      color: '#ef4444',
      description: '战斗胜率排名'
    }
  ]

  // 计算各维度分数
  const calculateScore = (agent: OpenClawAgent, dimension: RankingDimension): number => {
    switch (dimension) {
      case 'level':
        // 等级 + 经验比例
        return agent.level * 100 + (agent.exp / agent.maxExp) * 100

      case 'tasks':
        // 任务完成数 + 成功率
        const taskCount = agent.stats?.tasksCompleted || 0
        const taskSuccess = agent.stats?.taskSuccessRate || 0
        return taskCount * 10 + taskSuccess

      case 'battles':
        // 战斗胜场 + 胜率
        const battleWins = agent.battleStats?.wins || 0
        const battleWinRate = agent.battleStats?.winRate || 0
        return battleWins * 100 + battleWinRate * 10

      case 'overall':
        // 综合分数（加权平均）
        const levelScore = calculateScore(agent, 'level') * 0.4
        const taskScore = calculateScore(agent, 'tasks') * 0.3
        const battleScore = calculateScore(agent, 'battles') * 0.3
        return levelScore + taskScore + battleScore

      default:
        return 0
    }
  }

  // 计算排名
  const rankedAgents = useMemo(() => {
    const scored = agents.map(agent => ({
      ...agent,
      score: calculateScore(agent, activeDimension),
      rank: 0,
      change: Math.floor(Math.random() * 11) - 5 // Mock数据：-5到+5的排名变化
    }))

    // 按分数排序
    scored.sort((a, b) => b.score - a.score)

    // 分配排名
    scored.forEach((agent, index) => {
      agent.rank = index + 1
    })

    return scored.slice(0, maxItems)
  }, [agents, activeDimension, maxItems])

  // 获取奖牌图标
  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} className="text-yellow-400" />
      case 2:
        return <Medal size={24} className="text-gray-300" />
      case 3:
        return <Medal size={24} className="text-orange-400" />
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-gray-400">
            {rank}
          </div>
        )
    }
  }

  // 获取排名变化图标
  const getRankChange = (change?: number) => {
    if (!change || change === 0) return null

    if (change > 0) {
      return (
        <div className="flex items-center gap-1 text-green-400 text-xs">
          <span>↑</span>
          <span>{change}</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-1 text-red-400 text-xs">
          <span>↓</span>
          <span>{Math.abs(change)}</span>
        </div>
      )
    }
  }

  const activeDimensionConfig = dimensions.find(d => d.key === activeDimension)!

  return (
    <div className={`leaderboard ${className}`}>
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `${activeDimensionConfig.color}20` }}
        >
          <Trophy size={24} style={{ color: activeDimensionConfig.color }} />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">Agent排行榜</h2>
          <p className="text-sm text-gray-400">
            {activeDimensionConfig.description}
          </p>
        </div>
      </div>

      {/* 维度切换 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {dimensions.map(dimension => (
          <button
            key={dimension.key}
            onClick={() => setActiveDimension(dimension.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeDimension === dimension.key
                ? 'text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            style={{
              background: activeDimension === dimension.key
                ? `${dimension.color}30`
                : 'transparent',
              border: `1px solid ${
                activeDimension === dimension.key ? dimension.color + '60' : 'transparent'
              }`
            }}
          >
            {dimension.icon}
            <span>{dimension.label}</span>
          </button>
        ))}
      </div>

      {/* 排行榜列表 */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {rankedAgents.map((agent, index) => {
            const isCurrentUser = showCurrentUser && agent.id === currentUserId
            const isTopThree = agent.rank <= 3

            return (
              <motion.div
                key={agent.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  layout: { duration: 0.3 },
                  opacity: { duration: 0.2 },
                  delay: index * 0.05
                }}
                className={`relative p-4 rounded-xl backdrop-blur-sm transition-all cursor-pointer hover:scale-[1.02] ${
                  isCurrentUser
                    ? 'ring-2 ring-cyan-500'
                    : 'hover:bg-white/5'
                }`}
                style={{
                  background: isTopThree
                    ? `linear-gradient(135deg, ${activeDimensionConfig.color}15 0%, ${activeDimensionConfig.color}05 100%)`
                    : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${
                    isCurrentUser
                      ? '#06b6d4'
                      : isTopThree
                      ? activeDimensionConfig.color + '40'
                      : 'rgba(255, 255, 255, 0.1)'
                  }`
                }}
              >
                {/* 发光效果（前三名） */}
                {isTopThree && (
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      boxShadow: `inset 0 0 30px ${activeDimensionConfig.color}20`
                    }}
                  />
                )}

                <div className="relative z-10 flex items-center gap-4">
                  {/* 排名 */}
                  <div className="flex-shrink-0">
                    {getMedalIcon(agent.rank)}
                  </div>

                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      background: `${agent.color || '#3b82f6'}20`,
                      border: `2px solid ${agent.color || '#3b82f6'}60`
                    }}
                  >
                    {agent.avatar || '🤖'}
                  </div>

                  {/* Agent信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-white truncate">
                        {agent.name}
                      </h3>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                          你
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {agent.role}
                    </p>
                  </div>

                  {/* 分数和排名变化 */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="text-lg font-bold text-white">
                      {Math.round(agent.score).toLocaleString()}
                    </div>
                    {getRankChange(agent.change)}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* 空状态 */}
      {rankedAgents.length === 0 && (
        <div className="text-center py-12">
          <Trophy size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">暂无排名数据</p>
        </div>
      )}

      {/* 当前用户排名（如果不在前N名） */}
      {showCurrentUser && currentUserId && !rankedAgents.some(a => a.id === currentUserId) && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-sm text-gray-400 mb-3">你的排名</p>
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-gray-400">
                ?
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">暂无排名</p>
                <p className="text-sm text-gray-400">继续努力，冲击榜单！</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
