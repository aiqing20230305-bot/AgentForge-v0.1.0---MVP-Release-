import { OpenClawAgent } from '../utils/openclawLoader'
import { useState } from 'react'
import { Palette } from 'lucide-react'
import { usePortraitStore } from '../store/usePortraitStore'
import PortraitSelector from './PortraitSelector'
import SkillSelector from './SkillSelector'
import AgentTaskHistory from './AgentTaskHistory'
import AgentChat from './AgentChat'
import { useRipple } from '../hooks/useRipple'

interface AgentPortraitProps {
  agent: OpenClawAgent
  size?: 'small' | 'medium' | 'large'
}

// 图片/视频加载组件
function AgentImage({
  src,
  fallback,
  alt,
  className,
  isVideo
}: {
  src: string | null
  fallback: string
  alt: string
  className?: string
  isVideo?: boolean
}) {
  const [mediaError, setMediaError] = useState(false)
  const [mediaLoaded, setMediaLoaded] = useState(false)

  // 如果是emoji类型，直接显示emoji
  if (src?.startsWith('emoji:')) {
    const emoji = src.replace('emoji:', '')
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="text-6xl">{emoji}</span>
      </div>
    )
  }

  // 如果没有内容或加载失败，显示回退emoji
  if (!src || mediaError) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="text-6xl">{fallback}</span>
      </div>
    )
  }

  return (
    <>
      {/* 加载中占位符 */}
      {!mediaLoaded && (
        <div className={`flex items-center justify-center ${className} absolute inset-0`}>
          <span className="text-6xl">{fallback}</span>
        </div>
      )}
      {/* 实际图片或视频 */}
      {isVideo ? (
        <video
          src={src}
          className={`${className} ${mediaLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoadedData={() => setMediaLoaded(true)}
          onError={() => setMediaError(true)}
          autoPlay
          loop
          muted
          playsInline
        />
      ) : (
        <img
          src={src}
          alt={alt}
          className={`${className} ${mediaLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={() => setMediaLoaded(true)}
          onError={() => setMediaError(true)}
        />
      )}
    </>
  )
}

// Agent 形象配置 - 参考三国/帝国策略游戏风格
const AGENT_PORTRAITS = {
  ATLAS: {
    avatar: '👑', // 王冠 - 领袖（回退图标）
    image: '/images/agents/atlas.png', // AI生成的角色立绘
    bgGradient: 'from-blue-900 via-blue-700 to-blue-900',
    borderColor: '#3b82f6',
    title: '团队统帅',
    attributes: {
      leadership: 95, // 统率
      strategy: 90, // 谋略
      execution: 85, // 执行
      innovation: 80 // 创新
    }
  },
  CLIP: {
    avatar: '💻', // 电脑 - 开发者（回退图标）
    image: '/images/agents/clip.png',
    bgGradient: 'from-green-900 via-green-700 to-green-900',
    borderColor: '#10b981',
    title: '技术大师',
    attributes: {
      leadership: 75,
      strategy: 85,
      execution: 95,
      innovation: 90
    }
  },
  ORACLE: {
    avatar: '🔮', // 水晶球 - 知识守护者（回退图标）
    image: '/images/agents/oracle.png',
    bgGradient: 'from-purple-900 via-purple-700 to-purple-900',
    borderColor: '#8b5cf6',
    title: '智慧贤者',
    attributes: {
      leadership: 80,
      strategy: 95,
      execution: 75,
      innovation: 90
    }
  },
  SENTINEL: {
    avatar: '🛡️', // 盾牌 - 安全守卫（回退图标）
    image: '/images/agents/sentinel.png',
    bgGradient: 'from-red-900 via-red-700 to-red-900',
    borderColor: '#ef4444',
    title: '守护战士',
    attributes: {
      leadership: 85,
      strategy: 90,
      execution: 90,
      innovation: 75
    }
  }
}

// 默认 Portrait 配置（用于未知 Agent）
const DEFAULT_PORTRAIT = {
  avatar: '🤖',
  bgGradient: 'from-slate-900 to-slate-700',
  borderColor: '#64748b',
  title: 'Agent',
  attributes: {
    leadership: 50,
    strategy: 50,
    execution: 50,
    innovation: 50
  }
}

export default function AgentPortrait({ agent, size = 'large' }: AgentPortraitProps) {
  const portrait = AGENT_PORTRAITS[agent.name as keyof typeof AGENT_PORTRAITS] || {
    ...DEFAULT_PORTRAIT,
    avatar: agent.name.charAt(0).toUpperCase(),
    borderColor: agent.color || DEFAULT_PORTRAIT.borderColor,
    title: agent.role || DEFAULT_PORTRAIT.title
  }
  const [showPortraitSelector, setShowPortraitSelector] = useState(false)
  const [showSkillSelector, setShowSkillSelector] = useState(false)
  const [showTaskHistory, setShowTaskHistory] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const { createRipple } = useRipple()

  // 直接订阅状态变化，这样选择新形象后会自动重新渲染
  const selectedPortraitId = usePortraitStore(state => state.selections[agent.id])
  const portraits = usePortraitStore(state => state.portraits)
  const selectedPortrait = portraits.find(p => p.id === selectedPortraitId) || null

  // 确定要显示的图片 - 优先使用选中的portrait，其次使用agent.avatar
  const agentImage = selectedPortrait?.path || agent.avatar || null

  const sizeClasses = {
    small: 'w-16 h-20',
    medium: 'w-24 h-32',
    large: 'w-full h-auto'
  }

  if (size === 'small' || size === 'medium') {
    return (
      <div className={`${sizeClasses[size]} relative`}>
        <div
          className={`w-full h-full rounded-lg bg-gradient-to-b ${portrait.bgGradient} border-2 flex items-center justify-center text-3xl relative overflow-hidden`}
          style={{ borderColor: portrait.borderColor }}
        >
          {/* 装饰纹理 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.3),transparent_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(255,255,255,0.1)_49%,rgba(255,255,255,0.1)_51%,transparent_52%)] bg-[length:20px_20px]" />
          </div>
          <div className="relative z-10">
            <AgentImage
              src={agentImage}
              fallback={portrait.avatar}
              alt={agent.name}
              className="w-full h-full object-cover"
              isVideo={selectedPortrait?.mediaType === 'video'}
            />
          </div>
        </div>
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap"
          style={{
            backgroundColor: portrait.borderColor + '20',
            borderColor: portrait.borderColor,
            color: portrait.borderColor,
            border: '1px solid'
          }}
        >
          Lv.{agent.level}
        </div>
      </div>
    )
  }

  // 大尺寸 - 9:16 竖版完整卡片 - macOS 玻璃态
  return (
    <div className="relative w-full h-full group/card">
      {/* 外层柔和光晕 */}
      <div
        className="absolute inset-0 rounded-2xl blur-3xl opacity-20 group-hover/card:opacity-35 transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, rgba(139, 92, 246, 0.4), rgba(59, 130, 246, 0.3), transparent)'
        }}
      />

      <div
        className="relative rounded-2xl overflow-hidden border-2 transition-all duration-300 h-full flex flex-col cursor-pointer group/card hover:-translate-y-2 active:scale-98"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.2)',
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
        }}
        onClick={e => {
          createRipple(e)
          setShowPortraitSelector(true)
        }}
      >
        {/* 形象背景 - 铺满整个卡片 */}
        <div className="absolute inset-0">
          <AgentImage
            src={agentImage}
            fallback={portrait.avatar}
            alt={agent.name}
            className="w-full h-full object-cover"
            isVideo={selectedPortrait?.mediaType === 'video'}
          />
        </div>

        {/* 渐变遮罩层 - 让底部信息更清晰 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

        {/* 顶部微妙渐变 */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />

        {/* 悬浮提示 */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-30">
          <div className="text-center">
            <Palette className="w-10 h-10 text-white mb-3 mx-auto animate-pulse" />
            <span className="text-base text-white font-semibold">选择形象</span>
          </div>
        </div>

        <div className="relative z-20 flex flex-col h-full justify-between p-5">
          {/* 顶部：徽章区域 - macOS 风格 */}
          <div className="flex items-start justify-between">
            {/* 等级徽章 */}
            <div className="px-4 py-2 bg-white/15 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-full text-base font-semibold text-white transition-all hover:scale-105">
              Lv.{agent.level}
            </div>

            {/* 状态指示器 */}
            <div className="px-3 py-2 bg-white/15 backdrop-blur-xl border border-white/20 rounded-full text-xs font-medium text-white transition-all flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    agent.status === 'working' || agent.status === 'online' ? '#10d9a0' : '#ff4466'
                }}
              />
              <span>
                {agent.status === 'working' && '在线'}
                {agent.status === 'online' && '在线'}
                {agent.status === 'idle' && '空闲'}
                {agent.status === 'offline' && '离线'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 形象选择器模态框 */}
      {showPortraitSelector && (
        <PortraitSelector
          agentId={agent.id}
          agentName={agent.name}
          onClose={() => setShowPortraitSelector(false)}
        />
      )}

      {/* 技能选择器模态框 */}
      {showSkillSelector && (
        <SkillSelector
          agentId={agent.name.toLowerCase()}
          agentName={agent.name}
          onClose={() => setShowSkillSelector(false)}
        />
      )}

      {/* 任务记录模态框 */}
      {showTaskHistory && (
        <AgentTaskHistory
          agentId={agent.id}
          agentName={agent.name}
          sourceId={agent.sourceId || ''}
          onClose={() => setShowTaskHistory(false)}
        />
      )}

      {/* 聊天模态框 */}
      {showChat && (
        <AgentChat
          agentId={agent.id}
          agentName={agent.name}
          sourceId={agent.sourceId || ''}
          originalName={agent.metadata?.originalName}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  )
}

// 属性条组件（紧凑版）
// AttributeBar component removed - not currently used
// Can be restored if needed in future
