/**
 * 动画性能检测和优化
 * 检测设备GPU性能，低端设备自动降级
 */

interface DevicePerformance {
  tier: 'high' | 'medium' | 'low'
  fps: number
  isMobile: boolean
  supportsWebGL: boolean
  gpuVendor: string
  gpuRenderer: string
}

// 性能检测结果缓存
let cachedPerformance: DevicePerformance | null = null

/**
 * 检测WebGL支持和GPU信息
 */
function detectWebGL(): { supported: boolean; vendor: string; renderer: string } {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

    if (!gl) {
      return { supported: false, vendor: 'Unknown', renderer: 'Unknown' }
    }

    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info')
    const vendor = debugInfo
      ? (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : 'Unknown'
    const renderer = debugInfo
      ? (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : 'Unknown'

    return { supported: true, vendor, renderer }
  } catch {
    return { supported: false, vendor: 'Unknown', renderer: 'Unknown' }
  }
}

/**
 * FPS检测（粗略估算）
 */
function measureFPS(): Promise<number> {
  return new Promise((resolve) => {
    let frameCount = 0
    let lastTime = performance.now()

    function countFrames(currentTime: number) {
      frameCount++

      if (currentTime - lastTime >= 1000) {
        resolve(frameCount)
      } else {
        requestAnimationFrame(countFrames)
      }
    }

    requestAnimationFrame(countFrames)
  })
}

/**
 * 检测设备性能
 */
export async function detectDevicePerformance(): Promise<DevicePerformance> {
  if (cachedPerformance) {
    return cachedPerformance
  }

  console.log('[Performance] Detecting device performance...')

  // 检测移动设备
  const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )

  // 检测WebGL
  const webgl = detectWebGL()

  // 测量FPS
  const fps = await measureFPS()

  // 判断性能等级
  let tier: 'high' | 'medium' | 'low'

  if (fps >= 55 && webgl.supported && !isMobile) {
    tier = 'high'
  } else if (fps >= 40 && webgl.supported) {
    tier = 'medium'
  } else {
    tier = 'low'
  }

  // 特殊GPU降级规则（低端集成显卡）
  const lowEndGPUs = ['Intel HD', 'Intel UHD 6', 'Mali-400', 'Adreno 3']
  if (lowEndGPUs.some(gpu => webgl.renderer.includes(gpu))) {
    tier = 'low'
  }

  cachedPerformance = {
    tier,
    fps,
    isMobile,
    supportsWebGL: webgl.supported,
    gpuVendor: webgl.vendor,
    gpuRenderer: webgl.renderer
  }

  console.log('[Performance] Device tier:', tier, { fps, webgl, isMobile })

  return cachedPerformance
}

/**
 * 根据性能等级调整动画配置
 */
export function getAnimationConfig(tier: 'high' | 'medium' | 'low') {
  switch (tier) {
    case 'high':
      return {
        enableStarBackground: true,
        starCount: 200,
        enableParticles: true,
        enableBlur: true,
        enableShadows: true,
        transitionDuration: 300,
        animationFPS: 60
      }

    case 'medium':
      return {
        enableStarBackground: true,
        starCount: 100,
        enableParticles: false,
        enableBlur: true,
        enableShadows: true,
        transitionDuration: 200,
        animationFPS: 30
      }

    case 'low':
      return {
        enableStarBackground: false, // 关闭星空背景
        starCount: 0,
        enableParticles: false,
        enableBlur: false,
        enableShadows: false,
        transitionDuration: 150,
        animationFPS: 30
      }
  }
}

/**
 * 应用性能优化
 */
export async function applyPerformanceOptimizations() {
  const performance = await detectDevicePerformance()
  const config = getAnimationConfig(performance.tier)

  console.log('[Performance] Applying optimizations for tier:', performance.tier)

  // 设置CSS变量
  const root = document.documentElement
  root.style.setProperty('--animation-duration', `${config.transitionDuration}ms`)
  root.style.setProperty('--star-count', String(config.starCount))

  // 添加性能等级class
  root.classList.add(`performance-${performance.tier}`)

  // 禁用动画（低端设备）
  if (performance.tier === 'low') {
    root.classList.add('reduce-motion')
  }

  // 存储到localStorage（下次访问直接使用）
  localStorage.setItem('device-performance', JSON.stringify({
    tier: performance.tier,
    timestamp: Date.now()
  }))

  return config
}

/**
 * Hook: 使用性能优化
 */
export function usePerformanceOptimization() {
  const [config, setConfig] = React.useState(getAnimationConfig('medium'))
  const [tier, setTier] = React.useState<'high' | 'medium' | 'low'>('medium')

  React.useEffect(() => {
    // 检查缓存
    const cached = localStorage.getItem('device-performance')
    if (cached) {
      try {
        const { tier: cachedTier, timestamp } = JSON.parse(cached)
        // 7天内有效
        if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
          setTier(cachedTier)
          setConfig(getAnimationConfig(cachedTier))
          console.log('[Performance] Using cached tier:', cachedTier)
          return
        }
      } catch {}
    }

    // 重新检测
    detectDevicePerformance().then(perf => {
      setTier(perf.tier)
      setConfig(getAnimationConfig(perf.tier))
    })
  }, [])

  return { config, tier }
}

// React import for Hook
import React from 'react'
