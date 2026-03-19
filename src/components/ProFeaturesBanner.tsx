/**
 * Pro功能展示横幅
 * 展示Pro版本的所有专属功能和优势
 */

import React from 'react'
import { motion } from 'framer-motion'
import {
  Crown,
  Zap,
  TrendingUp,
  Users,
  Palette,
  FileText,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

export interface ProFeaturesBannerProps {
  onUpgradeClick: () => void
  variant?: 'full' | 'compact'
}

const PRO_FEATURES = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: '无限Agent和任务',
    description: '创建无限数量的Agent，处理无限任务',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'AI智能推荐和优化',
    description: '获得个性化任务推荐和性能优化建议',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <Palette className="w-6 h-6" />,
    title: '自定义主题编辑器',
    description: '完全自定义界面主题，打造专属品牌',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: '高级团队协作',
    description: '无限团队成员，高级任务分配和排行榜',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: '高级数据分析和导出',
    description: 'Excel/PDF导出，定时报告，高级数据分析',
    color: 'from-red-500 to-pink-500',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: '优先支持和AI额度',
    description: '24小时邮件支持，每月500次AI调用',
    color: 'from-indigo-500 to-purple-500',
  },
]

export const ProFeaturesBanner: React.FC<ProFeaturesBannerProps> = ({
  onUpgradeClick,
  variant = 'full',
}) => {
  if (variant === 'compact') {
    return <CompactBanner onUpgradeClick={onUpgradeClick} />
  }

  return (
    <div className="w-full bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20 rounded-2xl p-8">
      {/* 顶部标题 */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md mb-4">
          <Crown className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AgentForge Pro
          </span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          解锁全部专业功能
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          升级到Pro版，体验完整的Agent管理能力
        </p>
      </div>

      {/* 功能网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {PRO_FEATURES.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className={`inline-flex p-3 bg-gradient-to-br ${feature.color} rounded-lg mb-4`}>
              <div className="text-white">{feature.icon}</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* 价格和CTA */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">$9.99</span>
              <span className="text-lg text-gray-600 dark:text-gray-400">/月</span>
              <span className="ml-4 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                年付8折
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              年付仅需 $99/年，相当于 $8.25/月，节省17%
            </p>
          </div>
          <button
            onClick={onUpgradeClick}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2"
          >
            <Crown className="w-5 h-5" />
            立即升级到Pro
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 对比表格 */}
      <ComparisonTable className="mt-8" />
    </div>
  )
}

/**
 * 紧凑型横幅 - 用于侧边栏或小空间
 */
const CompactBanner: React.FC<{ onUpgradeClick: () => void }> = ({ onUpgradeClick }) => {
  return (
    <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
          <Crown className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">升级到Pro版</h3>
          <p className="text-sm text-white/90">
            解锁所有高级功能和无限使用
          </p>
        </div>
      </div>
      <button
        onClick={onUpgradeClick}
        className="w-full px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
      >
        <span>仅 $9.99/月</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}

/**
 * 对比表格 - 免费版 vs Pro版
 */
const ComparisonTable: React.FC<{ className?: string }> = ({ className = '' }) => {
  const features = [
    { name: 'Agent数量', free: '3个', pro: '无限' },
    { name: '每月任务数', free: '50个', pro: '无限' },
    { name: 'AI调用次数', free: '100次/月', pro: '500次/月' },
    { name: 'AI推荐和优化', free: false, pro: true },
    { name: '成就卡片生成', free: false, pro: true },
    { name: '每日战报', free: false, pro: true },
    { name: '自定义主题', free: false, pro: true },
    { name: '高级数据导出', free: false, pro: true },
    { name: '团队成员', free: '3人', pro: '无限' },
    { name: '优先支持', free: false, pro: true },
  ]

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
              功能特性
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
              免费版
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-purple-600 dark:text-purple-400">
              Pro版
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {features.map((feature, index) => (
            <tr key={index}>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                {feature.name}
              </td>
              <td className="px-6 py-4 text-center text-sm">
                {typeof feature.free === 'boolean' ? (
                  feature.free ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <span className="text-gray-400">—</span>
                  )
                ) : (
                  <span className="text-gray-600 dark:text-gray-400">{feature.free}</span>
                )}
              </td>
              <td className="px-6 py-4 text-center text-sm">
                {typeof feature.pro === 'boolean' ? (
                  <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto" />
                ) : (
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {feature.pro}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
