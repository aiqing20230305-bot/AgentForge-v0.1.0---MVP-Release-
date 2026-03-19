/**
 * Agent社交互动面板
 * 支持点赞、评论、关注、对战挑战
 */
import React, { useState } from 'react'
import { OpenClawAgent } from '../../utils/openclawLoader'
import { Heart, MessageCircle, UserPlus, Swords, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AgentSocialPanelProps {
  agent: OpenClawAgent
  currentUserId?: string
  onLike?: (agentId: string) => void
  onComment?: (agentId: string, comment: string) => void
  onFollow?: (userId: string) => void
  onChallenge?: (agentId: string) => void
  className?: string
}

interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  timestamp: number
}

export function AgentSocialPanel({
  agent,
  currentUserId,
  onLike,
  onComment,
  onFollow,
  onChallenge,
  className = ''
}: AgentSocialPanelProps) {
  // Mock数据（实际应从后端获取）
  const [likes, setLikes] = useState(agent.socialStats?.likes || Math.floor(Math.random() * 500))
  const [isLiked, setIsLiked] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      userId: 'user-1',
      userName: '玩家001',
      userAvatar: '👤',
      content: '这个Agent太强了！',
      timestamp: Date.now() - 3600000
    },
    {
      id: '2',
      userId: 'user-2',
      userName: 'AI爱好者',
      userAvatar: '🤓',
      content: '求配置分享',
      timestamp: Date.now() - 7200000
    }
  ])
  const [newComment, setNewComment] = useState('')
  const [showChallengeModal, setShowChallengeModal] = useState(false)

  // 处理点赞
  const handleLike = () => {
    if (isLiked) {
      setLikes(prev => prev - 1)
      setIsLiked(false)
    } else {
      setLikes(prev => prev + 1)
      setIsLiked(true)

      // 点赞动画
      const heart = document.createElement('div')
      heart.innerHTML = '❤️'
      heart.style.cssText = `
        position: fixed;
        font-size: 2rem;
        pointer-events: none;
        z-index: 9999;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        animation: heartFloat 1s ease-out forwards;
      `
      document.body.appendChild(heart)
      setTimeout(() => heart.remove(), 1000)
    }

    onLike?.(agent.id)
  }

  // 处理评论提交
  const handleSubmitComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      userId: currentUserId || 'anonymous',
      userName: '当前用户',
      userAvatar: '😊',
      content: newComment,
      timestamp: Date.now()
    }

    setComments(prev => [comment, ...prev])
    setNewComment('')
    onComment?.(agent.id, newComment)
  }

  // 处理关注
  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    onFollow?.(agent.ownerId || 'owner-id')
  }

  // 处理挑战
  const handleChallenge = () => {
    setShowChallengeModal(true)
  }

  const confirmChallenge = () => {
    setShowChallengeModal(false)
    onChallenge?.(agent.id)
    alert('⚔️ 战斗挑战已发送！')
  }

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    return `${days}天前`
  }

  return (
    <div className={`agent-social-panel ${className}`}>
      {/* 社交操作按钮 */}
      <div className="flex items-center gap-4 mb-6">
        {/* 点赞按钮 */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            isLiked
              ? 'bg-red-500/20 text-red-400'
              : 'bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10'
          }`}
        >
          <Heart
            size={20}
            fill={isLiked ? 'currentColor' : 'none'}
            className="transition-all"
          />
          <span className="font-medium">{likes.toLocaleString()}</span>
        </motion.button>

        {/* 评论按钮 */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
        >
          <MessageCircle size={20} />
          <span className="font-medium">{comments.length}</span>
        </motion.button>

        {/* 关注按钮 */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleFollow}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            isFollowing
              ? 'bg-green-500/20 text-green-400'
              : 'bg-white/5 text-gray-400 hover:text-green-400 hover:bg-green-500/10'
          }`}
        >
          <UserPlus size={20} />
          <span className="font-medium">{isFollowing ? '已关注' : '关注'}</span>
        </motion.button>

        {/* 挑战按钮 */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleChallenge}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 hover:from-orange-500/30 hover:to-red-500/30 transition-all ml-auto"
        >
          <Swords size={20} />
          <span className="font-medium">挑战</span>
        </motion.button>
      </div>

      {/* 评论区 */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm">
              {/* 评论输入框 */}
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  placeholder="发表你的评论..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send size={20} />
                </motion.button>
              </div>

              {/* 评论列表 */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-center text-gray-400 py-4">
                    还没有评论，快来抢沙发！
                  </p>
                ) : (
                  comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      {/* 用户头像 */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl flex-shrink-0">
                        {comment.userAvatar}
                      </div>

                      {/* 评论内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">
                            {comment.userName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(comment.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 挑战确认弹窗 */}
      <AnimatePresence>
        {showChallengeModal && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md"
              onClick={() => setShowChallengeModal(false)}
            />

            {/* 弹窗内容 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-md p-6"
            >
              <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-orange-500/30">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">⚔️</div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    发起对战挑战
                  </h3>
                  <p className="text-gray-300">
                    向 <span className="text-orange-400 font-bold">{agent.name}</span> 发起战斗？
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowChallengeModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={confirmChallenge}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium hover:shadow-lg transition-all"
                  >
                    确认挑战
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// CSS动画（添加到全局或通过样式注入）
const styleTag = document.createElement('style')
styleTag.textContent = `
@keyframes heartFloat {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -200%) scale(1.5);
  }
}
`
if (!document.querySelector('style[data-heart-animation]')) {
  styleTag.setAttribute('data-heart-animation', 'true')
  document.head.appendChild(styleTag)
}
