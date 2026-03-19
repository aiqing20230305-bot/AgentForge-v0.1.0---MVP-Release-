/**
 * 宇宙星空背景组件
 * 营造宇宙飞船控制台氛围
 * Phase 4.2: 添加性能优化（低端设备降级）
 */

import { useEffect, useRef, useState } from 'react'
import { detectDevicePerformance, getAnimationConfig } from '../utils/performanceDetection'

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [performanceConfig, setPerformanceConfig] = useState(getAnimationConfig('medium'))

  useEffect(() => {
    // 检测性能
    detectDevicePerformance().then(perf => {
      const config = getAnimationConfig(perf.tier)
      setPerformanceConfig(config)

      // 低端设备：完全禁用星空背景
      if (perf.tier === 'low') {
        console.log('[SpaceBackground] Disabled for low-end device')
        return
      }
    })
  }, [])

  useEffect(() => {
    // 低端设备跳过渲染
    if (!performanceConfig.enableStarBackground) {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true // 性能优化：独立渲染线程
    })
    if (!ctx) return

    // 设置canvas尺寸
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // 星星数据
    const stars: Array<{
      x: number
      y: number
      size: number
      speed: number
      opacity: number
      color: string
    }> = []

    // 生成星星 - 根据性能动态调整数量
    const generateStars = (count: number) => {
      for (let i = 0; i < count; i++) {
        const rand = Math.random()
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.3,
          speed: Math.random() * 0.2 + 0.05, // 减慢速度
          opacity: Math.random() * 0.6 + 0.3,
          color: rand > 0.85 ? '#00d4ff' : rand > 0.7 ? '#a78bfa' : '#ffffff' // 主要是白色，少量蓝紫
        })
      }
    }

    // 使用性能配置的星星数量
    generateStars(performanceConfig.starCount)

    // 星云效果 - 精简为2-3个，颜色统一
    const nebulas: Array<{
      x: number
      y: number
      radius: number
      color: string
      opacity: number
    }> = []

    // 只使用蓝紫渐变
    for (let i = 0; i < 3; i++) {
      nebulas.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 250 + 150,
        color: i % 2 === 0 ? 'rgba(0, 212, 255, 0.08)' : 'rgba(167, 139, 250, 0.06)',
        opacity: 0.15
      })
    }

    // 动画循环 - 使用requestAnimationFrame
    let animationId: number
    let lastFrameTime = performance.now()
    const targetFPS = performanceConfig.animationFPS
    const frameInterval = 1000 / targetFPS

    const animate = (currentTime: number) => {
      // FPS限制（性能优化）
      const elapsed = currentTime - lastFrameTime

      if (elapsed < frameInterval) {
        animationId = requestAnimationFrame(animate)
        return
      }

      lastFrameTime = currentTime - (elapsed % frameInterval)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制星云
      nebulas.forEach(nebula => {
        const gradient = ctx.createRadialGradient(
          nebula.x,
          nebula.y,
          0,
          nebula.x,
          nebula.y,
          nebula.radius
        )
        gradient.addColorStop(0, nebula.color.replace('0.1', String(nebula.opacity)))
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      })

      // 绘制星星
      stars.forEach(star => {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = star.color
        ctx.globalAlpha = star.opacity
        ctx.fill()
        ctx.globalAlpha = 1

        // 轻微闪烁 - 减少频率
        if (Math.random() > 0.98) {
          star.opacity += (Math.random() - 0.5) * 0.03
          star.opacity = Math.max(0.3, Math.min(0.9, star.opacity))
        }

        // 星星缓慢移动
        star.y += star.speed
        if (star.y > canvas.height) {
          star.y = 0
          star.x = Math.random() * canvas.width
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    animate(performance.now())

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [performanceConfig]) // 依赖性能配置

  // 低端设备：渲染静态渐变背景
  if (!performanceConfig.enableStarBackground) {
    return (
      <div
        id="space-background"
        className="fixed inset-0"
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a24 100%)',
          zIndex: 0
        }}
      />
    )
  }

  return (
    <>
      {/* 星空画布 */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />

      {/* HUD角标 - 精简优雅 */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {/* 左上角 */}
        <div className="absolute top-4 left-4 w-16 h-16 border-t border-l border-electric-blue/30 breathe" />
        {/* 右上角 */}
        <div className="absolute top-4 right-4 w-16 h-16 border-t border-r border-ghost-purple/30 breathe" />
        {/* 左下角 */}
        <div className="absolute bottom-4 left-4 w-16 h-16 border-b border-l border-ghost-purple/30 breathe" />
        {/* 右下角 */}
        <div className="absolute bottom-4 right-4 w-16 h-16 border-b border-r border-electric-blue/30 breathe" />
      </div>
    </>
  )
}
