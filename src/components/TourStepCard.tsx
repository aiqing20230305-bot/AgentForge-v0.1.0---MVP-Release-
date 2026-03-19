/**
 * 引导步骤卡片
 * Tour Step Card - Individual step display
 */

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react'
import { OnboardingStep } from '../services/onboardingManager'

interface TourStepCardProps {
  step: OnboardingStep
  currentIndex: number
  totalSteps: number
  isFirst: boolean
  isLast: boolean
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
  onComplete: () => void
}

/**
 * TourStepCard - 引导步骤卡片
 */
export const TourStepCard: React.FC<TourStepCardProps> = ({
  step,
  currentIndex,
  totalSteps,
  isFirst,
  isLast,
  onNext,
  onPrev,
  onSkip,
  onComplete,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden max-w-lg w-full"
    >
      {/* 媒体内容 */}
      {step.media && (
        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
          {step.media.type === 'image' && (
            <img
              src={step.media.url}
              alt={step.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // 如果图片加载失败，隐藏
                e.currentTarget.style.display = 'none'
              }}
            />
          )}
          {step.media.type === 'gif' && (
            <img
              src={step.media.url}
              alt={step.title}
              className="w-full h-full object-cover"
            />
          )}
          {step.media.type === 'video' && (
            <video
              src={step.media.url}
              autoPlay
              loop
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* 装饰性图标 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-16 h-16 text-white opacity-20" />
          </div>
        </div>
      )}

      {/* 内容区域 */}
      <div className="p-6">
        {/* 进度指示器 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-blue-500'
                    : index < currentIndex
                    ? 'w-4 bg-blue-300 dark:bg-blue-700'
                    : 'w-4 bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {currentIndex + 1} / {totalSteps}
          </span>
        </div>

        {/* 标题 */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {step.title}
        </h3>

        {/* 内容 */}
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
          {step.content}
        </p>

        {/* 自定义操作按钮 */}
        {step.action && (
          <button
            onClick={step.action.onClick}
            className="w-full mb-4 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
          >
            {step.action.label}
          </button>
        )}

        {/* 导航按钮 */}
        <div className="flex items-center justify-between">
          {/* 跳过按钮 */}
          <button
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            跳过引导
          </button>

          {/* 上一步 / 下一步 */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={onPrev}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}

            {isLast ? (
              <button
                onClick={onComplete}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl"
              >
                完成
              </button>
            ) : (
              <button
                onClick={onNext}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                下一步
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 关闭按钮 */}
      <button
        onClick={onSkip}
        className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 rounded-full shadow-lg transition-colors"
      >
        <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>
    </motion.div>
  )
}

/**
 * CompletionAnimation - 完成庆祝动画
 */
export const CompletionAnimation: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
      className="fixed inset-0 pointer-events-none flex items-center justify-center z-[10000]"
    >
      {/* Confetti 效果 */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            rotate: 0,
          }}
          animate={{
            x: (Math.random() - 0.5) * 1000,
            y: (Math.random() - 0.5) * 1000,
            scale: Math.random() * 2 + 0.5,
            rotate: Math.random() * 720,
          }}
          transition={{
            duration: 2,
            ease: 'easeOut',
          }}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: [
              '#3B82F6',
              '#8B5CF6',
              '#EC4899',
              '#F59E0B',
              '#10B981',
            ][Math.floor(Math.random() * 5)],
          }}
        />
      ))}

      {/* 中心图标 */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', damping: 10 }}
      >
        <Sparkles className="w-24 h-24 text-yellow-500" />
      </motion.div>
    </motion.div>
  )
}

export default TourStepCard
