/**
 * 订阅模态框
 * 用于选择订阅计划和发起支付
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Crown, Check, Zap, Sparkles } from 'lucide-react'
import { SubscriptionPlan } from '../utils/featureGate'

export interface SubscriptionPlan {
  id: 'monthly' | 'yearly'
  name: string
  price: number
  originalPrice?: number
  period: string
  savings?: string
  recommended?: boolean
  features: string[]
}

const PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Pro 月付',
    price: 9.99,
    period: '/月',
    features: [
      '无限Agent和任务',
      'AI智能推荐和优化',
      '高级数据分析和导出',
      '自定义主题编辑器',
      '高级团队协作',
      '每月500次AI调用',
      '24小时优先支持',
      '成就卡片和战报',
    ],
  },
  {
    id: 'yearly',
    name: 'Pro 年付',
    price: 8.25,
    originalPrice: 9.99,
    period: '/月',
    savings: '节省17% 🎉',
    recommended: true,
    features: [
      '包含月付所有功能',
      '年付仅需 $99',
      '相当于$8.25/月',
      '提前体验新功能',
      '专属年度勋章',
      '赠送定制主题',
      '独家Beta测试资格',
      '年度总结报告',
    ],
  },
]

export interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPlan: (planId: 'monthly' | 'yearly') => void
  defaultPlan?: 'monthly' | 'yearly'
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  defaultPlan = 'yearly',
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>(defaultPlan)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* 背景遮罩 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* 模态框内容 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* 顶部装饰 */}
          <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />

          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>

          {/* 内容 */}
          <div className="p-8">
            {/* 标题 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  升级到 AgentForge Pro
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                选择最适合你的计划
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                14天无理由退款保证
              </p>
            </div>

            {/* 计划选择 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {PLANS.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isSelected={selectedPlan === plan.id}
                  onSelect={() => setSelectedPlan(plan.id)}
                />
              ))}
            </div>

            {/* 底部操作 */}
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => {
                  onSelectPlan(selectedPlan)
                  onClose()
                }}
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                继续支付 ${PLANS.find((p) => p.id === selectedPlan)?.price}
                {selectedPlan === 'yearly' && '/月 (年付$99)'}
                {selectedPlan === 'monthly' && '/月'}
              </button>

              {/* 保障信息 */}
              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>安全支付</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>14天退款保证</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>随时可取消</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

/**
 * 计划卡片组件
 */
const PlanCard: React.FC<{
  plan: SubscriptionPlan
  isSelected: boolean
  onSelect: () => void
}> = ({ plan, isSelected, onSelect }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
      }`}
    >
      {/* 推荐标签 */}
      {plan.recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white text-xs font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            最受欢迎
          </div>
        </div>
      )}

      {/* 选中指示器 */}
      <div
        className={`absolute top-6 right-6 w-6 h-6 rounded-full border-2 transition-all ${
          isSelected
            ? 'border-purple-600 bg-purple-600'
            : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center justify-center w-full h-full"
          >
            <Check className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </div>

      {/* 计划名称 */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>

      {/* 价格 */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            ${plan.price}
          </span>
          <span className="text-lg text-gray-600 dark:text-gray-400">{plan.period}</span>
        </div>
        {plan.originalPrice && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-400 line-through">
              ${plan.originalPrice}/月
            </span>
            {plan.savings && (
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                {plan.savings}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 功能列表 */}
      <div className="space-y-3">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/**
 * Hook: 使用订阅模态框
 */
export function useSubscriptionModal() {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return {
    isOpen,
    openModal,
    closeModal,
  }
}
