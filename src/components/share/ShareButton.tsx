/**
 * Agent分享按钮组件
 * 支持Twitter、微信、复制链接、下载图片
 */
import React, { useState } from 'react'
import { OpenClawAgent } from '../../utils/openclawLoader'
import { exportShareCard } from './ShareCard'
import { Share2, Download, Copy, CheckCircle, Twitter } from 'lucide-react'

interface ShareButtonProps {
  agent: OpenClawAgent
  variant?: 'icon' | 'button' | 'floating'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ShareButton({
  agent,
  variant = 'button',
  size = 'md',
  className = ''
}: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)

  // 生成分享链接
  const getShareUrl = () => {
    const baseUrl = 'https://agentforge.vercel.app'
    return `${baseUrl}/agent/${agent.id}`
  }

  // 生成分享文案
  const getShareText = () => {
    return `🤖 我的Agent「${agent.name}」\n` +
           `⚔️ 角色：${agent.role}\n` +
           `⭐ 等级：Lv.${agent.level}\n` +
           `🔥 活力：${agent.coreEvolution?.vitality || 100}\n\n` +
           `在AgentForge打造你的AI Agent！`
  }

  // 导出为图片
  const handleExportImage = async () => {
    if (exporting) return

    try {
      setExporting(true)
      const dataUrl = await exportShareCard(agent)

      if (!dataUrl) {
        throw new Error('Failed to export image')
      }

      // 创建下载链接
      const link = document.createElement('a')
      link.download = `agentforge-${agent.name}-${Date.now()}.png`
      link.href = dataUrl
      link.click()

      console.log('[ShareButton] Image exported successfully')
    } catch (error) {
      console.error('[ShareButton] Export failed:', error)
      alert('导出失败，请重试')
    } finally {
      setExporting(false)
      setShowMenu(false)
    }
  }

  // 分享到Twitter
  const handleShareTwitter = async () => {
    try {
      const text = getShareText()
      const url = getShareUrl()
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=AgentForge,AI,Agent`

      window.open(twitterUrl, '_blank', 'width=600,height=400')
      setShowMenu(false)
    } catch (error) {
      console.error('[ShareButton] Twitter share failed:', error)
    }
  }

  // 微信分享（复制图片+文案）
  const handleShareWeChat = async () => {
    try {
      setExporting(true)

      // 1. 导出图片到剪贴板
      const dataUrl = await exportShareCard(agent)
      if (!dataUrl) {
        throw new Error('Failed to export image')
      }

      // 2. 将base64转为Blob
      const res = await fetch(dataUrl)
      const blob = await res.blob()

      // 3. 复制到剪贴板（如果浏览器支持）
      if (navigator.clipboard && ClipboardItem) {
        const item = new ClipboardItem({ 'image/png': blob })
        await navigator.clipboard.write([item])

        // 显示提示
        alert('✅ 图片已复制到剪贴板！\n\n请打开微信，粘贴分享给好友。')
      } else {
        // 降级方案：直接下载图片
        const link = document.createElement('a')
        link.download = `agentforge-${agent.name}-wechat.png`
        link.href = dataUrl
        link.click()

        alert('📥 图片已下载！\n\n请在微信中选择该图片分享。')
      }

      console.log('[ShareButton] WeChat share prepared')
    } catch (error) {
      console.error('[ShareButton] WeChat share failed:', error)
      alert('分享失败，请重试或直接下载图片')
    } finally {
      setExporting(false)
      setShowMenu(false)
    }
  }

  // 复制链接
  const handleCopyLink = async () => {
    try {
      const url = getShareUrl()
      await navigator.clipboard.writeText(url)

      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      console.log('[ShareButton] Link copied:', url)
    } catch (error) {
      console.error('[ShareButton] Copy failed:', error)
      alert('复制失败，请重试')
    }
  }

  // 样式配置
  const sizeStyles = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3'
  }

  const iconSizeMap = {
    sm: 16,
    md: 20,
    lg: 24
  }

  const iconSize = iconSizeMap[size]

  // 渲染主按钮
  const renderTriggerButton = () => {
    if (variant === 'icon') {
      return (
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors ${className}`}
          title="分享Agent"
        >
          <Share2 size={iconSize} className="text-white" />
        </button>
      )
    }

    if (variant === 'floating') {
      return (
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center ${className}`}
          title="分享Agent"
        >
          <Share2 size={24} className="text-white" />
        </button>
      )
    }

    // Default: button variant
    return (
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`${sizeStyles[size]} rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 ${className}`}
      >
        <Share2 size={iconSize} />
        分享Agent
      </button>
    )
  }

  return (
    <div className="relative">
      {/* 触发按钮 */}
      {renderTriggerButton()}

      {/* 分享菜单 */}
      {showMenu && (
        <>
          {/* 遮罩 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* 菜单内容 */}
          <div
            className="absolute z-50 mt-2 w-56 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              right: variant === 'floating' ? '0' : 'auto',
              left: variant === 'floating' ? 'auto' : '0'
            }}
          >
            {/* Twitter分享 */}
            <button
              onClick={handleShareTwitter}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-[#1DA1F2] flex items-center justify-center shrink-0">
                <Twitter size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium">Twitter</div>
                <div className="text-xs text-gray-300">分享到推特</div>
              </div>
            </button>

            {/* 微信分享 */}
            <button
              onClick={handleShareWeChat}
              disabled={exporting}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-[#07C160] flex items-center justify-center shrink-0">
                <span className="text-xl">💬</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium">微信</div>
                <div className="text-xs text-gray-300">
                  {exporting ? '生成中...' : '复制图片分享'}
                </div>
              </div>
            </button>

            {/* 复制链接 */}
            <button
              onClick={handleCopyLink}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0">
                {copied ? (
                  <CheckCircle size={20} className="text-white" />
                ) : (
                  <Copy size={20} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium">
                  {copied ? '已复制!' : '复制链接'}
                </div>
                <div className="text-xs text-gray-300">
                  {copied ? '链接已复制到剪贴板' : '分享给好友'}
                </div>
              </div>
            </button>

            {/* 分隔线 */}
            <div className="h-px bg-white/10 mx-4" />

            {/* 下载图片 */}
            <button
              onClick={handleExportImage}
              disabled={exporting}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shrink-0">
                <Download size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium">下载图片</div>
                <div className="text-xs text-gray-300">
                  {exporting ? '生成中...' : '保存到本地'}
                </div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// 快速分享函数（供外部调用）
export async function quickShareAgent(agent: OpenClawAgent, platform: 'twitter' | 'wechat' | 'download') {
  const getShareUrl = () => `https://agentforge.vercel.app/agent/${agent.id}`
  const getShareText = () => {
    return `🤖 我的Agent「${agent.name}」\n` +
           `⚔️ 角色：${agent.role}\n` +
           `⭐ 等级：Lv.${agent.level}\n\n` +
           `在AgentForge打造你的AI Agent！`
  }

  switch (platform) {
    case 'twitter': {
      const text = getShareText()
      const url = getShareUrl()
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=AgentForge,AI,Agent`
      window.open(twitterUrl, '_blank', 'width=600,height=400')
      break
    }

    case 'wechat':
    case 'download': {
      const dataUrl = await exportShareCard(agent)
      if (!dataUrl) {
        throw new Error('Failed to export image')
      }

      const link = document.createElement('a')
      link.download = `agentforge-${agent.name}-${Date.now()}.png`
      link.href = dataUrl
      link.click()
      break
    }
  }
}
