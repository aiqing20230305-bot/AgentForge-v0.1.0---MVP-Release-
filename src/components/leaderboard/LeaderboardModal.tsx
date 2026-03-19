/**
 * 排行榜弹窗组件
 * 全屏展示，支持关闭
 */
import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { Leaderboard } from './Leaderboard'
import { OpenClawAgent } from '../../utils/openclawLoader'
import { motion, AnimatePresence } from 'framer-motion'

interface LeaderboardModalProps {
  isOpen: boolean
  onClose: () => void
  agents: OpenClawAgent[]
  currentUserId?: string
}

export function LeaderboardModal({
  isOpen,
  onClose,
  agents,
  currentUserId
}: LeaderboardModalProps) {
  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // ESC键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* 弹窗内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden pointer-events-auto"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="relative px-6 py-4 border-b border-white/10">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  style={{
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* 内容区域（可滚动） */}
              <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                <Leaderboard
                  agents={agents}
                  maxItems={100}
                  showCurrentUser={true}
                  currentUserId={currentUserId}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
