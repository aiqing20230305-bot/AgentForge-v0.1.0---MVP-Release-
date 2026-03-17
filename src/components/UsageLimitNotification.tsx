/**
 * 用量限制通知组件
 * 当用户达到免费版限制时显示升级提示
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Crown, TrendingUp, Zap, Users } from 'lucide-react'
import { SubscriptionPlan } from '../utils/featureGate'
import { subscriptionManager, LimitCheckResult } from '../services/subscriptionManager'

export interface UsageLimitNotificationProps {
  isOpen: boolean
  onClose: () => void
  limitResult: LimitCheckResult
  onUpgrade: () => void
}

/**
 * 用量限制通知模态框
 */
export const UsageLimitNotification: React.FC<UsageLimitNotificationProps> = ({
  isOpen,
  onClose,
  limitResult,
  onUpgrade,
}) => {
  if (!isOpen) return null

  const { reason, currentUsage, limit, upgradeRequired } = limitResult

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* 背景遮罩 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* 模态框内容 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* 顶部渐变装饰 */}
          <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />

          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* 内容区域 */}
          <div className="p-6">
            {/* 图标 */}
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full">
                <Crown className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            {/* 标题 */}
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              {upgradeRequired ? '已达到免费版限制' : '已达到使用上限'}
            </h2>

            {/* 描述 */}
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              {reason}
            </p>

            {/* 用量显示 */}
            {currentUsage !== undefined && limit !== undefined && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">当前用量</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {currentUsage} / {limit}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                    style={{ width: `${Math.min((currentUsage / limit) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Pro版特性 */}
            {upgradeRequired && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  升级到 Pro 版解锁：
                </p>
                <div className="space-y-2">
                  <FeatureItem icon={<Zap />} text="无限Agent和任务" />
                  <FeatureItem icon={<TrendingUp />} text="AI推荐和优化" />
                  <FeatureItem icon={<Users />} text="高级团队协作" />
                  <FeatureItem icon={<Crown />} text="更多专属功能" />
                </div>
              </div>
            )}

            {/* 按钮组 */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                暂不升级
              </button>
              {upgradeRequired && (
                <button
                  onClick={() => {
                    onUpgrade()
                    onClose()
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium text-white hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Crown className="w-5 h-5" />
                    立即升级
                  </span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

/**
 * 特性列表项
 */
const FeatureItem: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="flex items-center gap-3">
    <div className="flex-shrink-0 w-5 h-5 text-purple-600 dark:text-purple-400">
      {icon}
    </div>
    <span className="text-sm text-gray-700 dark:text-gray-300">{text}</span>
  </div>
)

/**
 * 功能锁定蒙层 - 用于锁定Pro功能
 */
export const FeatureLockedOverlay: React.FC<{
  featureName: string
  onUpgrade: () => void
}> = ({ featureName, onUpgrade }) => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-lg">
      <div className="text-center p-6">
        <div className="inline-flex p-3 bg-purple-600/20 rounded-full mb-4">
          <Crown className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Pro功能</h3>
        <p className="text-sm text-gray-300 mb-4">
          {featureName} 是Pro版专属功能
        </p>
        <button
          onClick={onUpgrade}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium text-white hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          解锁功能
        </button>
      </div>
    </div>
  )
}

/**
 * Hook: 使用用量限制通知
 */
export function useUsageLimitNotification() {
  const [notification, setNotification] = React.useState<{
    isOpen: boolean
    limitResult: LimitCheckResult | null
  }>({
    isOpen: false,
    limitResult: null,
  })

  const showNotification = (limitResult: LimitCheckResult) => {
    setNotification({
      isOpen: true,
      limitResult,
    })
  }

  const hideNotification = () => {
    setNotification({
      isOpen: false,
      limitResult: null,
    })
  }

  return {
    notification,
    showNotification,
    hideNotification,
  }
}
