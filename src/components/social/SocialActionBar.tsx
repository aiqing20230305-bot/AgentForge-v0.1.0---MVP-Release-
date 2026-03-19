/**
 * 社交操作栏（简化版）
 * 用于Agent卡片的快速社交互动
 */
import React, { useState } from 'react'
import { Heart, MessageCircle, Swords } from 'lucide-react'
import { motion } from 'framer-motion'

interface SocialActionBarProps {
  agentId: string
  initialLikes?: number
  initialComments?: number
  isLiked?: boolean
  onLike?: (agentId: string) => void
  onComment?: (agentId: string) => void
  onChallenge?: (agentId: string) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function SocialActionBar({
  agentId,
  initialLikes = 0,
  initialComments = 0,
  isLiked: initialIsLiked = false,
  onLike,
  onComment,
  onChallenge,
  size = 'md',
  className = ''
}: SocialActionBarProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(initialIsLiked)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (isLiked) {
      setLikes(prev => prev - 1)
      setIsLiked(false)
    } else {
      setLikes(prev => prev + 1)
      setIsLiked(true)
    }

    onLike?.(agentId)
  }

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation()
    onComment?.(agentId)
  }

  const handleChallenge = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChallenge?.(agentId)
  }

  // 尺寸配置
  const sizeConfig = {
    sm: {
      icon: 14,
      text: 'text-xs',
      padding: 'px-2 py-1',
      gap: 'gap-1'
    },
    md: {
      icon: 16,
      text: 'text-sm',
      padding: 'px-3 py-1.5',
      gap: 'gap-1.5'
    },
    lg: {
      icon: 18,
      text: 'text-base',
      padding: 'px-4 py-2',
      gap: 'gap-2'
    }
  }

  const config = sizeConfig[size]

  return (
    <div className={`social-action-bar flex items-center gap-2 ${className}`}>
      {/* 点赞 */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleLike}
        className={`flex items-center ${config.gap} ${config.padding} rounded-lg transition-all ${
          isLiked
            ? 'bg-red-500/20 text-red-400'
            : 'bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10'
        }`}
      >
        <Heart
          size={config.icon}
          fill={isLiked ? 'currentColor' : 'none'}
          className="transition-all"
        />
        {likes > 0 && (
          <span className={`font-medium ${config.text}`}>
            {likes > 999 ? `${(likes / 1000).toFixed(1)}k` : likes}
          </span>
        )}
      </motion.button>

      {/* 评论 */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleComment}
        className={`flex items-center ${config.gap} ${config.padding} rounded-lg bg-white/5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all`}
      >
        <MessageCircle size={config.icon} />
        {initialComments > 0 && (
          <span className={`font-medium ${config.text}`}>
            {initialComments > 999 ? `${(initialComments / 1000).toFixed(1)}k` : initialComments}
          </span>
        )}
      </motion.button>

      {/* 挑战 */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleChallenge}
        className={`flex items-center ${config.gap} ${config.padding} rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 hover:from-orange-500/30 hover:to-red-500/30 transition-all`}
      >
        <Swords size={config.icon} />
      </motion.button>
    </div>
  )
}
