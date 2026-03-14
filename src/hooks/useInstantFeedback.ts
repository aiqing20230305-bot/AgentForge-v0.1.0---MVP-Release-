/**
 * 即时反馈系统 Hook
 * 让每个操作都有视觉和触觉反馈
 *
 * 设计理念：
 * - 按钮点击：涟漪动画 + 轻微缩放
 * - 成功操作：绿色粒子爆炸
 * - 失败操作：红色震动
 * - 升级：金色粒子雨
 */

import { useCallback } from 'react'

export type FeedbackType = 'click' | 'success' | 'error' | 'levelup' | 'achievement' | 'battle'

export interface FeedbackOptions {
  type: FeedbackType
  x?: number
  y?: number
  intensity?: 'light' | 'medium' | 'heavy'
  sound?: boolean
  haptic?: boolean
}

export function useInstantFeedback() {
  /**
   * 创建涟漪动画
   */
  const createRipple = useCallback((x: number, y: number, color: string = 'rgba(59, 130, 246, 0.6)') => {
    const ripple = document.createElement('div')
    ripple.className = 'instant-feedback-ripple'
    ripple.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${color};
      transform: translate(-50%, -50%) scale(0);
      pointer-events: none;
      z-index: 9999;
      animation: ripple-expand 0.6s ease-out;
    `

    document.body.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  }, [])

  /**
   * 创建粒子爆炸
   */
  const createParticleExplosion = useCallback((x: number, y: number, count: number = 12, color: string = '#3b82f6') => {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div')
      particle.className = 'instant-feedback-particle'

      const angle = (Math.PI * 2 * i) / count
      const velocity = 50 + Math.random() * 50
      const lifetime = 500 + Math.random() * 500

      particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: ${color};
        pointer-events: none;
        z-index: 9999;
        box-shadow: 0 0 10px ${color};
      `

      document.body.appendChild(particle)

      const dx = Math.cos(angle) * velocity
      const dy = Math.sin(angle) * velocity

      let currentX = 0
      let currentY = 0
      let opacity = 1
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = elapsed / lifetime

        if (progress >= 1) {
          particle.remove()
          return
        }

        currentX += dx * 0.02
        currentY += dy * 0.02 + (progress * 50) // 重力效果
        opacity = 1 - progress

        particle.style.transform = `translate(${currentX}px, ${currentY}px)`
        particle.style.opacity = opacity.toString()

        requestAnimationFrame(animate)
      }

      animate()
    }
  }, [])

  /**
   * 播放音效
   */
  const playSound = useCallback((type: FeedbackType) => {
    // 简单的Web Audio API音效
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    const soundMap: Record<FeedbackType, { freq: number; duration: number }> = {
      click: { freq: 800, duration: 50 },
      success: { freq: 1000, duration: 100 },
      error: { freq: 200, duration: 150 },
      levelup: { freq: 1200, duration: 300 },
      achievement: { freq: 1500, duration: 400 },
      battle: { freq: 600, duration: 200 }
    }

    const sound = soundMap[type]
    oscillator.frequency.value = sound.freq
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration / 1000)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + sound.duration / 1000)
  }, [])

  /**
   * 触发震动反馈
   */
  const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 50
      }
      navigator.vibrate(patterns[intensity])
    }
  }, [])

  /**
   * 主反馈触发函数
   */
  const trigger = useCallback((options: FeedbackOptions) => {
    const { type, x, y, intensity = 'medium', sound = true, haptic = true } = options

    // 默认使用鼠标位置
    const posX = x ?? window.innerWidth / 2
    const posY = y ?? window.innerHeight / 2

    switch (type) {
      case 'click':
        createRipple(posX, posY, 'rgba(59, 130, 246, 0.4)')
        if (sound) playSound('click')
        if (haptic) triggerHaptic('light')
        break

      case 'success':
        createParticleExplosion(posX, posY, 8, '#10b981')
        createRipple(posX, posY, 'rgba(16, 185, 129, 0.5)')
        if (sound) playSound('success')
        if (haptic) triggerHaptic('medium')
        break

      case 'error':
        createRipple(posX, posY, 'rgba(239, 68, 68, 0.5)')
        if (sound) playSound('error')
        if (haptic) triggerHaptic('heavy')
        break

      case 'levelup':
        // 金色粒子雨
        createParticleExplosion(posX, posY, 30, '#fbbf24')
        setTimeout(() => createParticleExplosion(posX, posY, 20, '#f59e0b'), 100)
        setTimeout(() => createParticleExplosion(posX, posY, 15, '#fbbf24'), 200)
        if (sound) playSound('levelup')
        if (haptic) {
          triggerHaptic('heavy')
          setTimeout(() => triggerHaptic('heavy'), 100)
        }
        break

      case 'achievement':
        // 彩色粒子爆炸
        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            createParticleExplosion(posX, posY, 12, colors[i % colors.length])
          }, i * 100)
        }
        if (sound) playSound('achievement')
        if (haptic) {
          for (let i = 0; i < 3; i++) {
            setTimeout(() => triggerHaptic('medium'), i * 150)
          }
        }
        break

      case 'battle':
        createParticleExplosion(posX, posY, 15, '#ef4444')
        createRipple(posX, posY, 'rgba(239, 68, 68, 0.6)')
        if (sound) playSound('battle')
        if (haptic) triggerHaptic('heavy')
        break
    }
  }, [createRipple, createParticleExplosion, playSound, triggerHaptic])

  /**
   * 点击反馈（最常用）
   */
  const onClick = useCallback((event: React.MouseEvent) => {
    trigger({
      type: 'click',
      x: event.clientX,
      y: event.clientY,
      intensity: 'light'
    })
  }, [trigger])

  /**
   * 成功反馈
   */
  const onSuccess = useCallback((x?: number, y?: number) => {
    trigger({
      type: 'success',
      x,
      y,
      intensity: 'medium'
    })
  }, [trigger])

  /**
   * 错误反馈
   */
  const onError = useCallback((x?: number, y?: number) => {
    trigger({
      type: 'error',
      x,
      y,
      intensity: 'heavy'
    })
  }, [trigger])

  /**
   * 升级反馈
   */
  const onLevelUp = useCallback((x?: number, y?: number) => {
    trigger({
      type: 'levelup',
      x,
      y,
      intensity: 'heavy'
    })
  }, [trigger])

  /**
   * 成就解锁反馈
   */
  const onAchievement = useCallback((x?: number, y?: number) => {
    trigger({
      type: 'achievement',
      x,
      y,
      intensity: 'heavy'
    })
  }, [trigger])

  /**
   * 战斗反馈
   */
  const onBattle = useCallback((x?: number, y?: number) => {
    trigger({
      type: 'battle',
      x,
      y,
      intensity: 'heavy'
    })
  }, [trigger])

  return {
    trigger,
    onClick,
    onSuccess,
    onError,
    onLevelUp,
    onAchievement,
    onBattle
  }
}
