/**
 * 新手引导遮罩组件
 * Onboarding Tour - Main tour component with spotlight effect
 */

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { getOnboardingManager, OnboardingStep } from '../services/onboardingManager'
import { TourStepCard, CompletionAnimation } from './TourStepCard'

interface OnboardingTourProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * OnboardingTour - 新手引导主组件
 */
export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
}) => {
  const manager = getOnboardingManager()
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [showCompletion, setShowCompletion] = useState(false)
  const animationFrameRef = useRef<number>()

  // 监听管理器变化
  useEffect(() => {
    const updateState = () => {
      setCurrentStep(manager.getCurrentStep())
      setCurrentIndex(manager.getCurrentStepIndex())
      setTotalSteps(manager.getTotalSteps())
    }

    updateState()
    const unsubscribe = manager.addListener(updateState)

    return () => {
      unsubscribe()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [manager])

  // 计算目标元素位置
  useEffect(() => {
    if (!currentStep?.target || !isOpen) {
      setTargetRect(null)
      return
    }

    const updateTargetRect = () => {
      const element = document.querySelector(currentStep.target!)
      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetRect(rect)
      } else {
        setTargetRect(null)
      }
    }

    // 初始计算
    updateTargetRect()

    // 监听窗口变化
    const handleResize = () => {
      animationFrameRef.current = requestAnimationFrame(updateTargetRect)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize, true)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize, true)
    }
  }, [currentStep, isOpen])

  // 处理下一步
  const handleNext = async () => {
    await manager.next()
  }

  // 处理上一步
  const handlePrev = async () => {
    await manager.prev()
  }

  // 处理跳过
  const handleSkip = () => {
    manager.skip()
    onClose()
  }

  // 处理完成
  const handleComplete = async () => {
    await manager.complete()
    setShowCompletion(true)

    // 2秒后关闭
    setTimeout(() => {
      setShowCompletion(false)
      onClose()
    }, 2000)
  }

  // 计算卡片位置
  const getCardPosition = (): React.CSSProperties => {
    if (!currentStep) return {}

    // 中心位置
    if (currentStep.placement === 'center' || !targetRect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }

    const padding = 16
    const style: React.CSSProperties = {
      position: 'fixed',
    }

    switch (currentStep.placement) {
      case 'top':
        style.bottom = `${window.innerHeight - targetRect.top + padding}px`
        style.left = `${targetRect.left + targetRect.width / 2}px`
        style.transform = 'translateX(-50%)'
        break

      case 'bottom':
        style.top = `${targetRect.bottom + padding}px`
        style.left = `${targetRect.left + targetRect.width / 2}px`
        style.transform = 'translateX(-50%)'
        break

      case 'left':
        style.right = `${window.innerWidth - targetRect.left + padding}px`
        style.top = `${targetRect.top + targetRect.height / 2}px`
        style.transform = 'translateY(-50%)'
        break

      case 'right':
        style.left = `${targetRect.right + padding}px`
        style.top = `${targetRect.top + targetRect.height / 2}px`
        style.transform = 'translateY(-50%)'
        break
    }

    return style
  }

  if (!isOpen || !currentStep) return null

  return createPortal(
    <>
      {/* 遮罩层 + 聚光灯 */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998]"
          style={{ pointerEvents: 'none' }}
        >
          {/* SVG 遮罩 */}
          <svg
            width="100%"
            height="100%"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'auto',
            }}
          >
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                {targetRect && (
                  <rect
                    x={targetRect.x - 8}
                    y={targetRect.y - 8}
                    width={targetRect.width + 16}
                    height={targetRect.height + 16}
                    rx="8"
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.7)"
              mask="url(#spotlight-mask)"
            />
          </svg>

          {/* 高亮边框 */}
          {targetRect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute border-4 border-blue-500 rounded-lg pointer-events-none"
              style={{
                left: targetRect.x - 8,
                top: targetRect.y - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2)',
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* 步骤卡片 */}
      <div
        className="fixed z-[9999]"
        style={{
          ...getCardPosition(),
          pointerEvents: 'auto',
        }}
      >
        <AnimatePresence mode="wait">
          <TourStepCard
            key={currentIndex}
            step={currentStep}
            currentIndex={currentIndex}
            totalSteps={totalSteps}
            isFirst={manager.isFirstStep()}
            isLast={manager.isLastStep()}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkip={handleSkip}
            onComplete={handleComplete}
          />
        </AnimatePresence>
      </div>

      {/* 完成动画 */}
      <AnimatePresence>
        {showCompletion && <CompletionAnimation />}
      </AnimatePresence>
    </>,
    document.body
  )
}

export default OnboardingTour
