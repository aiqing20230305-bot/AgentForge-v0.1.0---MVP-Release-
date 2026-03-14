/**
 * 成就分享卡片生成器
 * 一键生成精美分享卡片，引流到GitHub
 */

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Copy, Download, X, Twitter, Loader2 } from 'lucide-react'
import { useInstantFeedback } from '../hooks/useInstantFeedback'
import { audioSystem } from '../services/audioSystem'
import type { Achievement } from '../data/achievements'

// GitHub仓库链接
const GITHUB_URL = 'https://github.com/Feishu-Bot-Tutorial/AgentForge'

export interface AchievementShareCardProps {
  achievement: Achievement
  agentName: string
  agentLevel: number
  totalAchievements: number
  onClose: () => void
}

export const AchievementShareCard: React.FC<AchievementShareCardProps> = ({
  achievement,
  agentName,
  agentLevel,
  totalAchievements,
  onClose
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const feedback = useInstantFeedback()
  const [isGenerating, setIsGenerating] = useState(false)

  // 稀有度颜色映射
  const rarityColors = {
    common: { bg: 'from-gray-600 to-gray-700', border: 'border-gray-500', text: 'text-gray-300' },
    rare: { bg: 'from-blue-600 to-blue-700', border: 'border-blue-500', text: 'text-blue-300' },
    epic: { bg: 'from-purple-600 to-purple-700', border: 'border-purple-500', text: 'text-purple-300' },
    legendary: { bg: 'from-yellow-500 to-orange-600', border: 'border-yellow-500', text: 'text-yellow-300' }
  }

  const colors = rarityColors[achievement.rarity]

  /**
   * 复制卡片图片到剪贴板
   */
  const handleCopyImage = async (e: React.MouseEvent) => {
    feedback.onClick(e)
    audioSystem.play('click')
    setIsGenerating(true)

    try {
      // 性能优化：使用动态导入
      const startTime = performance.now()
      const html2canvas = (await import('html2canvas')).default
      if (!cardRef.current) return

      // 优化配置：提高质量，优化性能
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#000000',
        scale: 2, // 2倍分辨率
        logging: false,
        useCORS: true, // 允许跨域图片（二维码）
        allowTaint: false,
        imageTimeout: 15000,
        removeContainer: true
      })

      const endTime = performance.now()
      const duration = endTime - startTime
      console.log(`[Performance] html2canvas generation time: ${duration.toFixed(2)}ms`)

      canvas.toBlob(async blob => {
        if (!blob) return

        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ])

          feedback.onSuccess(e.clientX, e.clientY)
          audioSystem.play('success')
          alert('✅ 卡片已复制到剪贴板！')
        } catch (error) {
          console.error('复制失败:', error)
          audioSystem.play('error')
          alert('❌ 复制失败，请手动截图')
        } finally {
          setIsGenerating(false)
        }
      })
    } catch (error) {
      console.error('生成图片失败:', error)
      audioSystem.play('error')
      alert('❌ 生成图片失败')
      setIsGenerating(false)
    }
  }

  /**
   * 下载卡片图片
   */
  const handleDownloadImage = async (e: React.MouseEvent) => {
    feedback.onClick(e)
    audioSystem.play('click')
    setIsGenerating(true)

    try {
      const startTime = performance.now()
      const html2canvas = (await import('html2canvas')).default
      if (!cardRef.current) return

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: false,
        imageTimeout: 15000,
        removeContainer: true
      })

      const endTime = performance.now()
      const duration = endTime - startTime
      console.log(`[Performance] html2canvas download time: ${duration.toFixed(2)}ms`)

      const link = document.createElement('a')
      link.download = `agentforge-${achievement.id}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

      feedback.onSuccess(e.clientX, e.clientY)
      audioSystem.play('success')
      setIsGenerating(false)
    } catch (error) {
      console.error('下载失败:', error)
      audioSystem.play('error')
      alert('❌ 下载失败')
      setIsGenerating(false)
    }
  }

  /**
   * 分享到Twitter
   */
  const handleShareTwitter = (e: React.MouseEvent) => {
    feedback.onClick(e)
    audioSystem.play('click')

    const text = `🏆 我在 AgentForge 解锁了「${achievement.name}」成就！

⭐ ${agentName} - Lv.${agentLevel}
🎯 已解锁 ${totalAchievements} 个成就

快来挑战我的记录！
👉 ${GITHUB_URL}

#AgentForge #AIAgent #OpenClaw`

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  /**
   * 分享到LinkedIn
   */
  const handleShareLinkedIn = (e: React.MouseEvent) => {
    feedback.onClick(e)
    audioSystem.play('click')

    const title = `我在 AgentForge 解锁了「${achievement.name}」成就！`
    const summary = `${agentName} (Lv.${agentLevel}) 已解锁 ${totalAchievements} 个成就。AgentForge - WoW风格的AI Agent可视化管理系统！`

    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(GITHUB_URL)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  /**
   * 复制文本到剪贴板
   */
  const handleCopyText = async (e: React.MouseEvent) => {
    feedback.onClick(e)
    audioSystem.play('click')

    const text = `🏆 我在 AgentForge 解锁了「${achievement.name}」成就！

⭐ ${agentName} - Lv.${agentLevel}
🎯 已解锁 ${totalAchievements} 个成就
💎 稀有度：${achievement.rarity.toUpperCase()}

${achievement.description}

快来挑战我的记录！
👉 ${GITHUB_URL}`

    try {
      await navigator.clipboard.writeText(text)
      feedback.onSuccess(e.clientX, e.clientY)
      audioSystem.play('success')
      alert('✅ 文本已复制到剪贴板！')
    } catch (error) {
      console.error('复制失败:', error)
      audioSystem.play('error')
      alert('❌ 复制失败')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className={`bg-gradient-to-r ${colors.bg} p-4 flex items-center justify-between`}>
          <h2 className="text-xl font-bold text-white">分享成就</h2>
          <button
            onClick={e => {
              feedback.onClick(e)
              audioSystem.play('click')
              onClose()
            }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors feedback-button-scale"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* 卡片预览 */}
        <div className="p-6">
          <div
            ref={cardRef}
            className={`relative bg-gradient-to-br from-gray-900 via-gray-800 to-black border-4 ${colors.border} rounded-xl p-8 shadow-2xl overflow-hidden`}
          >
            {/* 背景装饰 - 增强 */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-radial from-white to-transparent rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-radial from-white to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-white to-transparent rounded-full blur-3xl opacity-5" />
            </div>

            {/* 稀有度光效 */}
            <div className={`absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-br ${colors.bg}`} />

            {/* 装饰图案 */}
            <div className="absolute top-4 right-4 text-6xl opacity-5 pointer-events-none">
              {achievement.icon}
            </div>
            <div className="absolute bottom-4 left-4 text-6xl opacity-5 pointer-events-none">
              {achievement.icon}
            </div>

            {/* 成就图标和标题 */}
            <div className="relative text-center mb-6">
              <div className="text-6xl mb-4">{achievement.icon}</div>
              <h3 className={`text-3xl font-black ${colors.text} mb-2`}>{achievement.name}</h3>
              <div className="inline-block px-4 py-1 bg-white/10 rounded-full">
                <span className={`text-sm font-bold ${colors.text} uppercase`}>{achievement.rarity}</span>
              </div>
            </div>

            {/* 描述 */}
            <p className="text-center text-gray-300 text-lg mb-6 leading-relaxed">{achievement.description}</p>

            {/* 统计信息 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-cyan-400">{agentName}</div>
                <div className="text-xs text-gray-400 mt-1">Agent</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">Lv.{agentLevel}</div>
                <div className="text-xs text-gray-400 mt-1">等级</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{totalAchievements}</div>
                <div className="text-xs text-gray-400 mt-1">成就</div>
              </div>
            </div>

            {/* 底部：Logo + 二维码 */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <div className="flex-1 text-left">
                <div className="text-sm text-gray-400 mb-1">快来挑战我的记录！</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚔️🤖</span>
                  <div>
                    <div className="text-lg font-bold text-white">AgentForge</div>
                    <div className="text-xs text-cyan-400">AI Agent 可视化管理</div>
                  </div>
                </div>
              </div>

              {/* GitHub 二维码 */}
              <div className="flex flex-col items-center gap-1 bg-white p-2 rounded-lg shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(GITHUB_URL)}`}
                  alt="GitHub QR Code"
                  className="w-20 h-20"
                  crossOrigin="anonymous"
                />
                <div className="text-[8px] text-gray-900 font-bold text-center leading-tight">扫码访问<br/>GitHub</div>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="p-6 bg-gray-800/50 border-t border-gray-700">
          {/* 加载提示 */}
          {isGenerating && (
            <div className="mb-4 flex items-center justify-center gap-2 text-cyan-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">正在生成图片...</span>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={handleCopyImage}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg font-bold text-white transition-all feedback-button-glow feedback-button-scale disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
              <span className="hidden md:inline">复制图片</span>
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-lg font-bold text-white transition-all feedback-button-glow feedback-button-scale disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden md:inline">下载</span>
            </button>

            <button
              onClick={handleShareTwitter}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-lg font-bold text-white transition-all feedback-button-glow feedback-button-scale disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Twitter className="w-4 h-4" />
              <span className="hidden md:inline">Twitter</span>
            </button>

            <button
              onClick={handleCopyText}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 rounded-lg font-bold text-white transition-all feedback-button-glow feedback-button-scale disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden md:inline">复制文本</span>
            </button>
          </div>

          {/* 提示 */}
          <div className="mt-4 text-center text-xs text-gray-400">
            💡 提示：分享到社交媒体可以帮助更多人发现 AgentForge！
          </div>

          {/* 性能提示 */}
          {!isGenerating && (
            <div className="mt-2 text-center text-[10px] text-gray-500">
              ⚡ 图片生成通常耗时 300-800ms
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
