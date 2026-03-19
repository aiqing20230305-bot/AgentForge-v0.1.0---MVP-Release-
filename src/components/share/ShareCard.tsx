/**
 * Agent分享卡片
 * 精美的分享卡片设计，可导出为图片
 */
import React, { useRef } from 'react'
import { OpenClawAgent } from '../../utils/openclawLoader'
import { Trophy, Zap, Target, TrendingUp, Star } from 'lucide-react'
import html2canvas from 'html2canvas'

interface ShareCardProps {
  agent: OpenClawAgent
  onExport?: (dataUrl: string) => void
}

export function ShareCard({ agent, onExport }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // 稀有度配置
  const rarityConfig: Record<string, { color: string; label: string; glow: string }> = {
    common: { color: '#9ca3af', label: '普通', glow: 'rgba(156, 163, 175, 0.3)' },
    rare: { color: '#3b82f6', label: '稀有', glow: 'rgba(59, 130, 246, 0.3)' },
    epic: { color: '#a855f7', label: '史诗', glow: 'rgba(168, 85, 247, 0.3)' },
    legendary: { color: '#f59e0b', label: '传说', glow: 'rgba(245, 158, 11, 0.3)' },
    mythic: { color: '#ef4444', label: '神话', glow: 'rgba(239, 68, 68, 0.3)' }
  }

  const rarity = rarityConfig[agent.color || 'common'] || rarityConfig.common

  // 导出为图片
  const exportAsImage = async () => {
    if (!cardRef.current) return

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2, // 高清
        logging: false
      })

      const dataUrl = canvas.toDataURL('image/png')
      onExport?.(dataUrl)
      return dataUrl
    } catch (error) {
      console.error('[ShareCard] Export failed:', error)
      return null
    }
  }

  // 统计数据
  const stats = {
    level: agent.level,
    exp: agent.exp,
    maxExp: agent.maxExp,
    vitality: agent.coreEvolution?.vitality || 100,
    evolutionLevel: agent.coreEvolution?.evolutionLevel || 0,
    totalEvolutions: agent.coreEvolution?.totalEvolutions || 0,
    skills: agent.skills?.length || 0
  }

  return (
    <div
      ref={cardRef}
      className="share-card relative w-[400px] h-[500px] rounded-3xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${rarity.color}20 0%, ${rarity.color}05 100%)`,
        boxShadow: `0 20px 60px ${rarity.glow}, inset 0 0 40px ${rarity.glow}`
      }}
    >
      {/* 背景装饰 */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 20%, ${rarity.color} 0%, transparent 50%),
                           radial-gradient(circle at 70% 80%, ${rarity.color} 0%, transparent 50%)`
        }}
      />

      {/* 内容 */}
      <div className="relative z-10 h-full flex flex-col p-8">
        {/* 头部：稀有度标签 */}
        <div className="flex items-center justify-between mb-6">
          <div
            className="px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-lg"
            style={{
              background: `${rarity.color}30`,
              color: rarity.color,
              border: `1px solid ${rarity.color}60`
            }}
          >
            {rarity.label}
          </div>

          {/* 星级 */}
          <div className="flex gap-1">
            {[...Array(Math.min(stats.evolutionLevel, 5))].map((_, i) => (
              <Star key={i} size={16} fill={rarity.color} color={rarity.color} />
            ))}
          </div>
        </div>

        {/* 中间：Avatar + 名称 */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Avatar */}
          <div
            className="w-32 h-32 rounded-3xl flex items-center justify-center text-7xl mb-6"
            style={{
              background: `${rarity.color}20`,
              border: `3px solid ${rarity.color}60`,
              boxShadow: `0 10px 40px ${rarity.glow}`
            }}
          >
            {agent.avatar || '🤖'}
          </div>

          {/* 名称和角色 */}
          <h2 className="text-3xl font-bold text-white mb-2 text-center">
            {agent.name}
          </h2>
          <p className="text-lg text-gray-300 mb-6 text-center">
            {agent.role}
          </p>

          {/* 等级和经验 */}
          <div className="w-full max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: rarity.color }}>
                Lv.{stats.level}
              </span>
              <span className="text-sm text-gray-400">
                {stats.exp}/{stats.maxExp}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${(stats.exp / stats.maxExp) * 100}%`,
                  background: `linear-gradient(90deg, ${rarity.color} 0%, ${rarity.color}80 100%)`
                }}
              />
            </div>
          </div>
        </div>

        {/* 底部：统计数据 */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm">
            <Zap size={20} className="mx-auto mb-1" style={{ color: '#fbbf24' }} />
            <div className="text-xs text-gray-400 mb-1">活力</div>
            <div className="text-lg font-bold text-white">{stats.vitality}</div>
          </div>

          <div className="text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm">
            <Target size={20} className="mx-auto mb-1" style={{ color: '#3b82f6' }} />
            <div className="text-xs text-gray-400 mb-1">技能</div>
            <div className="text-lg font-bold text-white">{stats.skills}</div>
          </div>

          <div className="text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm">
            <TrendingUp size={20} className="mx-auto mb-1" style={{ color: '#10b981' }} />
            <div className="text-xs text-gray-400 mb-1">进化</div>
            <div className="text-lg font-bold text-white">{stats.totalEvolutions}</div>
          </div>

          <div className="text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm">
            <Trophy size={20} className="mx-auto mb-1" style={{ color: rarity.color }} />
            <div className="text-xs text-gray-400 mb-1">排名</div>
            <div className="text-lg font-bold text-white">-</div>
          </div>
        </div>

        {/* 水印 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            打造于 AgentForge
          </p>
          <p className="text-xs text-gray-600 mt-1">
            agentforge.vercel.app
          </p>
        </div>
      </div>

      {/* 边框发光 */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          border: `2px solid ${rarity.color}40`,
          boxShadow: `inset 0 0 30px ${rarity.glow}`
        }}
      />
    </div>
  )
}

// 导出函数（供外部使用）
export async function exportShareCard(agent: OpenClawAgent): Promise<string | null> {
  // 创建临时DOM元素
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '-9999px'
  document.body.appendChild(container)

  // 渲染ShareCard
  const { createRoot } = await import('react-dom/client')
  const root = createRoot(container)

  return new Promise((resolve) => {
    root.render(
      <ShareCard
        agent={agent}
        onExport={(dataUrl) => {
          resolve(dataUrl)
          root.unmount()
          document.body.removeChild(container)
        }}
      />
    )

    // 等待渲染完成
    setTimeout(async () => {
      const card = container.querySelector('.share-card') as HTMLElement
      if (!card) {
        resolve(null)
        return
      }

      try {
        const canvas = await html2canvas(card, {
          backgroundColor: null,
          scale: 2,
          logging: false
        })

        const dataUrl = canvas.toDataURL('image/png')
        resolve(dataUrl)
      } catch (error) {
        console.error('[ShareCard] Export failed:', error)
        resolve(null)
      } finally {
        root.unmount()
        document.body.removeChild(container)
      }
    }, 500)
  })
}
