/**
 * 宇宙飞船驾驶舱 Loading 动画
 * 模拟飞船启动、飞往火星的开场效果
 */

import { useState, useEffect } from 'react'

interface CockpitLoadingProps {
  onComplete: () => void
}

export default function CockpitLoading({ onComplete }: CockpitLoadingProps) {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('系统初始化中...')
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)

  useEffect(() => {
    // 启动序列文本
    const sequence = [
      { text: '系统初始化中...', duration: 1000 },
      { text: '加载导航系统...', duration: 800 },
      { text: '连接 OpenClaw 网络...', duration: 800 },
      { text: '准备启航...', duration: 700 },
      { text: '开往火星 🚀', duration: 1000 }
    ]

    let currentIndex = 0
    let currentProgress = 0

    const updateSequence = () => {
      if (currentIndex >= sequence.length) {
        // 等待视频播放完成（如果视频存在）
        if (videoLoaded && !videoEnded) {
          // 视频还在播放，等待
          const checkVideo = setInterval(() => {
            if (videoEnded || !videoLoaded) {
              clearInterval(checkVideo)
              setTimeout(onComplete, 500)
            }
          }, 100)
        } else {
          // 没有视频或视频已结束，直接完成
          setTimeout(onComplete, 500)
        }
        return
      }

      setLoadingText(sequence[currentIndex].text)

      const step = 100 / sequence.length
      const targetProgress = (currentIndex + 1) * step

      const progressInterval = setInterval(() => {
        currentProgress += 2
        if (currentProgress >= targetProgress) {
          currentProgress = targetProgress
          clearInterval(progressInterval)
        }
        setProgress(currentProgress)
      }, 20)

      setTimeout(() => {
        currentIndex++
        updateSequence()
      }, sequence[currentIndex].duration)
    }

    // 延迟启动，让开场视频先播放
    setTimeout(updateSequence, 500)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* 视频背景 - 宇宙飞船飞往火星 */}
      <video
        autoPlay
        muted
        playsInline
        onLoadedData={() => setVideoLoaded(true)}
        onEnded={() => setVideoEnded(true)}
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%230a0e27' width='1920' height='1080'/%3E%3C/svg%3E"
      >
        {/* 视频源 - 使用SeeDance 1.5生成 */}
        <source src="/videos/spaceship-to-mars.mp4" type="video/mp4" />
      </video>

      {/* 星空粒子 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.6 + 0.2
            }}
          />
        ))}
      </div>

      {/* 主内容区 */}
      <div className="relative z-10 text-center px-8">
        {/* 主标题 - Build The New */}
        <h1
          className="text-7xl font-bold text-white mb-4 tracking-tight"
          style={{
            textShadow: '0 0 40px rgba(0, 212, 255, 0.6), 0 0 20px rgba(168, 85, 247, 0.4)',
            animation: 'module-init 1s ease-out',
            letterSpacing: '-0.02em'
          }}
        >
          Build The New
        </h1>

        {/* 副标题 */}
        <p
          className="text-xl text-white/80 mb-12"
          style={{
            animation: 'module-init 1s ease-out 0.2s both'
          }}
        >
          OpenClaw Agent 管理中心
        </p>

        {/* 进度条容器 */}
        <div
          className="max-w-md mx-auto"
          style={{
            animation: 'module-init 1s ease-out 0.4s both'
          }}
        >
          {/* 状态文字 */}
          <div className="text-sm text-white/70 mb-4 h-6 flex items-center justify-center">
            <span className="inline-block data-stream">{loadingText}</span>
          </div>

          {/* 进度条 */}
          <div className="h-2 bg-white/10 rounded-full overflow-hidden border border-white/20 backdrop-blur-xl">
            <div
              className="h-full rounded-full transition-all duration-300 relative"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #10d9a0, #06b6d4, #8b5cf6)',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.6)'
              }}
            >
              {/* 流光效果 */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                style={{
                  animation: 'shimmer 1.5s infinite'
                }}
              />
            </div>
          </div>

          {/* 进度百分比 */}
          <div className="text-xs text-white/60 mt-2 text-center">{Math.round(progress)}%</div>
        </div>

        {/* 系统信息 */}
        <div
          className="mt-16 text-xs text-white/40 space-y-1"
          style={{
            animation: 'module-init 1s ease-out 0.6s both'
          }}
        >
          <div>OPENCLAW SYSTEM v2.0</div>
          <div>© 2026 Powered by Claude & OpenClaw</div>
        </div>
      </div>

      {/* HUD 角标 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8 w-20 h-20 border-t-2 border-l-2 border-cyan-400/30" />
        <div className="absolute top-8 right-8 w-20 h-20 border-t-2 border-r-2 border-purple-400/30" />
        <div className="absolute bottom-8 left-8 w-20 h-20 border-b-2 border-l-2 border-purple-400/30" />
        <div className="absolute bottom-8 right-8 w-20 h-20 border-b-2 border-r-2 border-cyan-400/30" />
      </div>
    </div>
  )
}
