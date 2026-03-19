/**
 * Enhanced Agent Card Component
 * Task #73: 优化Agent卡片UI - 添加更多交互效果
 *
 * Features:
 * 1. Hover effects (scale, shadow, highlight)
 * 2. Click animation
 * 3. Right-click context menu (quick actions)
 * 4. Drag-to-reorder functionality
 * 5. Status indicator (online/offline/working)
 * 6. Responsive optimization
 */

import { useState, useCallback, useRef, memo } from 'react'
import { OpenClawAgent } from '../utils/openclawLoader'
import { useRipple } from '../hooks/useRipple'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  Settings,
  Trash2,
  Copy,
  Eye,
  MoreVertical,
  GripVertical,
  Share2
} from 'lucide-react'
import { ShareButton } from './share/ShareButton'
import { SocialActionBar } from './social/SocialActionBar'
import '../styles/agent-card.css'

interface AgentCardProps {
  agent: OpenClawAgent
  onSelect?: (agent: OpenClawAgent) => void
  onEquip?: (agent: OpenClawAgent) => void
  onDelete?: (agent: OpenClawAgent) => void
  onDuplicate?: (agent: OpenClawAgent) => void
  onViewDetails?: (agent: OpenClawAgent) => void
  isDragging?: boolean
  dragHandleProps?: any
  index?: number
  className?: string
}

interface ContextMenuItem {
  icon: React.ReactNode
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
}

const AgentCard = memo(({
  agent,
  onSelect,
  onEquip,
  onDelete,
  onDuplicate,
  onViewDetails,
  isDragging = false,
  dragHandleProps,
  index = 0,
  className = ''
}: AgentCardProps) => {
  const { createRipple } = useRipple()
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  // Status indicator configuration
  const statusConfig = {
    working: { color: '#10b981', label: '工作中', icon: '🟢', glow: 'shadow-green-500/50' },
    online: { color: '#10b981', label: '在线', icon: '🟢', glow: 'shadow-green-500/50' },
    idle: { color: '#f59e0b', label: '空闲', icon: '🟡', glow: 'shadow-amber-500/50' },
    offline: { color: '#ef4444', label: '离线', icon: '🔴', glow: 'shadow-red-500/50' }
  }

  const currentStatus = statusConfig[agent.status || 'offline']

  // Handle right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const rect = cardRef.current?.getBoundingClientRect()
    if (rect) {
      setContextMenuPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      setShowContextMenu(true)
    }
  }, [])

  // Context menu items
  const contextMenuItems: ContextMenuItem[] = [
    {
      icon: <Play className="w-4 h-4" />,
      label: '装备 Agent',
      onClick: () => {
        onEquip?.(agent)
        setShowContextMenu(false)
      }
    },
    {
      icon: <Eye className="w-4 h-4" />,
      label: '查看详情',
      onClick: () => {
        onViewDetails?.(agent)
        setShowContextMenu(false)
      }
    },
    {
      icon: <Share2 className="w-4 h-4" />,
      label: '分享 Agent',
      onClick: () => {
        // Share button will handle this via its own menu
        console.log('Share agent:', agent.name)
        setShowContextMenu(false)
      }
    },
    {
      icon: <Copy className="w-4 h-4" />,
      label: '复制配置',
      onClick: () => {
        onDuplicate?.(agent)
        setShowContextMenu(false)
      }
    },
    {
      icon: <Settings className="w-4 h-4" />,
      label: '配置',
      onClick: () => {
        console.log('Configure agent:', agent.name)
        setShowContextMenu(false)
      }
    },
    {
      icon: <Trash2 className="w-4 h-4" />,
      label: '移除',
      onClick: () => {
        onDelete?.(agent)
        setShowContextMenu(false)
      },
      variant: 'danger' as const
    }
  ]

  // Close context menu when clicking outside
  const handleClickOutside = useCallback(() => {
    if (showContextMenu) {
      setShowContextMenu(false)
    }
  }, [showContextMenu])

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={(e) => {
          createRipple(e)
          onSelect?.(agent)
          handleClickOutside()
        }}
        onContextMenu={handleContextMenu}
        className={`
          group relative
          bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]
          border-2 rounded-xl p-4
          cursor-pointer overflow-hidden
          transition-all duration-300
          hover:shadow-2xl
          ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
          ${className}
        `}
        style={{
          borderColor: agent.color + '40',
          boxShadow: `0 4px 20px ${agent.color}20`
        }}
      >
        {/* Drag handle */}
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
          >
            <GripVertical className="w-5 h-5 text-white/40" />
          </div>
        )}

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${agent.color}40, transparent 70%)`
          }}
        />

        {/* Shine effect on hover */}
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Status indicator with pulse animation */}
              <motion.div
                className="relative flex-shrink-0"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <div
                  className={`w-3 h-3 rounded-full ${currentStatus.glow}`}
                  style={{ backgroundColor: currentStatus.color }}
                />
                {/* Outer ring animation */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: currentStatus.color }}
                  animate={{
                    scale: [1, 1.5, 2],
                    opacity: [0.5, 0.2, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut'
                  }}
                />
              </motion.div>

              {/* Agent info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-amber-100 truncate">
                    {agent.name}
                  </h3>
                  <motion.span
                    className="text-xs px-2 py-0.5 rounded flex-shrink-0"
                    style={{
                      backgroundColor: agent.color + '20',
                      color: agent.color
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    Lv.{agent.level}
                  </motion.span>
                </div>
                <p className="text-xs text-amber-100/60 truncate">{agent.role}</p>
              </div>
            </div>

            {/* Status badge */}
            <motion.div
              className="text-xs text-amber-100/80 flex items-center gap-1 flex-shrink-0"
              whileHover={{ scale: 1.05 }}
            >
              <span>{currentStatus.icon}</span>
              <span className="hidden sm:inline">{currentStatus.label}</span>
            </motion.div>
          </div>

          {/* Share button (visible on hover) */}
          <div
            className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <ShareButton agent={agent} variant="icon" size="sm" />
          </div>

          {/* Experience bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-amber-100/60 mb-1">
              <span>经验</span>
              <span>
                {agent.exp}/{agent.maxExp} ({Math.round((agent.exp / agent.maxExp) * 100)}%)
              </span>
            </div>
            <div className="w-full h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(agent.exp / agent.maxExp) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                  background: `linear-gradient(90deg, ${agent.color}80, ${agent.color})`
                }}
              />
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {agent.skills.map((skill, idx) => (
              <motion.span
                key={idx}
                className="text-xs px-2 py-1 rounded bg-[#1a1a1a] text-amber-100/80 border border-[#3a3a3a]"
                whileHover={{ scale: 1.05, borderColor: agent.color + '80' }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                {skill}
              </motion.span>
            ))}
          </div>

          {/* Description */}
          {agent.description && (
            <div className="text-xs text-amber-100/60 line-clamp-2 mb-3 border-t border-[#3a3a3a] pt-2">
              {agent.description}
            </div>
          )}

          {/* Social Action Bar */}
          <div className="mb-3 pb-3 border-b border-[#3a3a3a]">
            <SocialActionBar
              agentId={agent.id}
              initialLikes={agent.socialStats?.likes || Math.floor(Math.random() * 200)}
              initialComments={agent.socialStats?.comments || Math.floor(Math.random() * 50)}
              size="sm"
              onLike={(id) => console.log('[AgentCard] Liked:', id)}
              onComment={(id) => console.log('[AgentCard] Comment:', id)}
              onChallenge={(id) => console.log('[AgentCard] Challenge:', id)}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                createRipple(e)
                onEquip?.(agent)
              }}
              className="flex-1 px-3 py-1.5 text-xs bg-amber-700/80 hover:bg-amber-600 border border-amber-500 text-amber-100 font-bold rounded transition-colors relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">🎯 装备</span>
            </motion.button>
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                createRipple(e)
                onViewDetails?.(agent)
              }}
              className="px-3 py-1.5 text-xs bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-[#4a4a4a] text-amber-100 rounded transition-colors relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Eye className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                handleContextMenu(e as any)
              }}
              className="px-3 py-1.5 text-xs bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-[#4a4a4a] text-amber-100 rounded transition-colors relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MoreVertical className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Dynamic ripple color */}
        <style>
          {`
            .ripple {
              position: absolute;
              border-radius: 50%;
              background: ${agent.color}40;
              transform: scale(0);
              animation: ripple-animation 0.6s ease-out;
              pointer-events: none;
              z-index: 1;
            }
          `}
        </style>
      </motion.div>

      {/* Context Menu */}
      <AnimatePresence>
        {showContextMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={handleClickOutside}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="fixed z-50 min-w-[180px] bg-[#2a2a2a] border border-[#4a4a4a] rounded-lg shadow-2xl overflow-hidden"
              style={{
                left: cardRef.current
                  ? cardRef.current.getBoundingClientRect().left + contextMenuPosition.x
                  : 0,
                top: cardRef.current
                  ? cardRef.current.getBoundingClientRect().top + contextMenuPosition.y
                  : 0
              }}
            >
              {contextMenuItems.map((item, idx) => (
                <motion.button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    createRipple(e)
                    item.onClick()
                  }}
                  disabled={item.disabled}
                  className={`
                    w-full px-4 py-2.5 text-left text-sm
                    flex items-center gap-3
                    transition-colors
                    ${item.variant === 'danger'
                      ? 'text-red-400 hover:bg-red-500/10'
                      : 'text-amber-100 hover:bg-white/5'
                    }
                    ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${idx !== contextMenuItems.length - 1 ? 'border-b border-[#3a3a3a]' : ''}
                  `}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className={item.variant === 'danger' ? 'text-red-400' : 'text-amber-100/60'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
})

AgentCard.displayName = 'AgentCard'

export default AgentCard
